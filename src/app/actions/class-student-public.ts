"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { normalizeJoinCodeInput } from "@/lib/classes/join-code";
import { isValidPeerScores } from "@/lib/grading/compute-proposed-grade";
import { PEER_DIMENSION_KEYS } from "@/lib/grading/formula";
import { parseProjectQuizConfig } from "@/lib/quiz/project-quiz";
import { createAdminClient } from "@/lib/supabase/admin";
import { refreshGroupGradeSnapshot } from "@/server/grading/refresh-group-snapshot";

function parseMemberLines(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

const joinSchema = z.object({
  join_code: z.string().min(8).max(32),
  group_name: z.string().min(2).max(120),
  leader_name: z.string().min(2).max(120),
  other_members: z.string().max(4000).optional(),
});

/** Registro público de grupo con código de clase (service role, validado en servidor). */
export async function joinClassAndCreateGroup(formData: FormData) {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Servidor sin SUPABASE_SERVICE_ROLE_KEY: no se puede registrar el grupo." };
  }

  const parsed = joinSchema.safeParse({
    join_code: normalizeJoinCodeInput(String(formData.get("join_code") ?? "")),
    group_name: formData.get("group_name"),
    leader_name: formData.get("leader_name"),
    other_members: formData.get("other_members") || undefined,
  });
  if (!parsed.success) {
    return { error: "Completa código, nombre del grupo y líder." };
  }

  const { data: cls, error: cErr } = await admin
    .from("classes")
    .select("id, teacher_id, school_id, status, kit_project_id")
    .eq("join_code", parsed.data.join_code)
    .maybeSingle();

  if (cErr || !cls) {
    return { error: "Código de clase no válido." };
  }
  if (cls.status !== "active") {
    return { error: "Esta clase no acepta nuevos grupos." };
  }

  const others = parseMemberLines(parsed.data.other_members ?? "");
  const allNames = [parsed.data.leader_name.trim(), ...others.map((n) => n.trim())];
  const lower = allNames.map((n) => n.toLowerCase());
  if (new Set(lower).size !== allNames.length) {
    return { error: "Hay nombres duplicados en el grupo." };
  }

  const { data: classGroupRows } = await admin.from("student_groups").select("id").eq("class_id", cls.id);
  const classGroupIds = classGroupRows?.map((r) => r.id) ?? [];
  if (classGroupIds.length) {
    const { data: existingMembers } = await admin
      .from("class_group_members")
      .select("display_name, is_leader")
      .in("student_group_id", classGroupIds);
    const ln = parsed.data.leader_name.trim().toLowerCase();
    const leaderDup = existingMembers?.some(
      (m) => m.is_leader && m.display_name.trim().toLowerCase() === ln,
    );
    if (leaderDup) {
      return { error: "Ya existe un líder con ese nombre en esta clase." };
    }
  }

  const { data: group, error: gErr } = await admin
    .from("student_groups")
    .insert({
      school_id: cls.school_id,
      teacher_id: cls.teacher_id,
      class_id: cls.id,
      name: parsed.data.group_name.trim(),
      project_status: "in_progress",
      academic_year: "2026",
    })
    .select("id")
    .single();

  if (gErr || !group) {
    return { error: gErr?.message ?? "No se pudo crear el grupo." };
  }

  const memberRows = allNames.map((display_name, i) => ({
    student_group_id: group.id,
    display_name,
    is_leader: i === 0,
  }));

  const { data: insertedMembers, error: mErr } = await admin
    .from("class_group_members")
    .insert(memberRows)
    .select("id, display_name, is_leader, access_token");

  if (mErr || !insertedMembers?.length) {
    await admin.from("student_groups").delete().eq("id", group.id);
    return { error: mErr?.message ?? "No se pudieron registrar integrantes." };
  }

  const leader = insertedMembers.find((m) => m.is_leader);
  await refreshGroupGradeSnapshot(admin, group.id);

  revalidatePath("/clase/unirse");
  revalidatePath(`/docente/clases/${cls.id}`);

  return {
    ok: true as const,
    group_id: group.id,
    leader_token: leader?.access_token ?? null,
    member_tokens: insertedMembers.map((m) => ({
      name: m.display_name,
      token: m.access_token,
    })),
  };
}

const peerSchema = z.object({
  evaluator_token: z.string().uuid(),
  evaluatee_member_id: z.string().uuid(),
  improvement_notes: z.string().max(2000).optional(),
});

export async function submitPeerEvaluation360(formData: FormData) {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Configuración del servidor incompleta." };
  }

  const scores: Record<string, number> = {};
  for (const k of PEER_DIMENSION_KEYS) {
    const v = Number(formData.get(`dim_${k}`));
    scores[k] = v;
  }
  if (!isValidPeerScores(scores)) {
    return { error: "Cada criterio debe ser entre 1 y 5." };
  }

  const parsed = peerSchema.safeParse({
    evaluator_token: formData.get("evaluator_token"),
    evaluatee_member_id: formData.get("evaluatee_member_id"),
    improvement_notes: formData.get("improvement_notes") || undefined,
  });
  if (!parsed.success) return { error: "Datos inválidos." };

  const { data: evaluator, error: eErr } = await admin
    .from("class_group_members")
    .select("id, student_group_id, is_leader")
    .eq("access_token", parsed.data.evaluator_token)
    .maybeSingle();

  if (eErr || !evaluator) {
    return { error: "Enlace de evaluación no válido." };
  }

  if (!evaluator.is_leader) {
    return {
      error:
        "Solo el líder puede registrar valoraciones de desempeño (MVP Ruta A). Pide al líder que complete esta sección.",
    };
  }

  if (evaluator.id === parsed.data.evaluatee_member_id) {
    return { error: "No puedes evaluarte a ti mismo." };
  }

  const { data: evaluatee, error: xErr } = await admin
    .from("class_group_members")
    .select("id, student_group_id")
    .eq("id", parsed.data.evaluatee_member_id)
    .maybeSingle();

  if (xErr || !evaluatee || evaluatee.student_group_id !== evaluator.student_group_id) {
    return { error: "Integrante no pertenece a tu grupo." };
  }

  const { error: pErr } = await admin.from("peer_evaluations").insert({
    student_group_id: evaluator.student_group_id,
    evaluator_member_id: evaluator.id,
    evaluatee_member_id: evaluatee.id,
    scores,
    improvement_notes: parsed.data.improvement_notes?.trim() || null,
  });

  if (pErr) {
    if (pErr.code === "23505") {
      return { error: "Ya enviaste la evaluación para este compañero." };
    }
    return { error: pErr.message };
  }

  await refreshGroupGradeSnapshot(admin, evaluator.student_group_id);
  revalidatePath("/evaluar");
  return { ok: true as const };
}

export type PeerEvaluationFormState = { ok?: true; error?: string };

/**
 * Misma lógica que `submitPeerEvaluation360`, con firma para `useActionState`.
 * Usar esta acción en el formulario cliente evita un wrapper async en el bundle (Webpack).
 */
export async function submitPeerEvaluationFormAction(
  _prev: PeerEvaluationFormState | null,
  formData: FormData,
): Promise<PeerEvaluationFormState> {
  const res = await submitPeerEvaluation360(formData);
  if ("error" in res && res.error) return { error: res.error };
  return { ok: true };
}

const quizSchema = z.object({
  leader_token: z.string().uuid(),
  answers: z.array(z.number().int().min(0)).min(1),
});

/** Quiz configurable por proyecto; cada respuesta correcta vale 1 punto. */
export async function submitGroupQuizMvp(formData: FormData) {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Configuración del servidor incompleta." };
  }

  const leaderToken = String(formData.get("leader_token") ?? "");

  const { data: leader, error: lErr } = await admin
    .from("class_group_members")
    .select("id, student_group_id, is_leader")
    .eq("access_token", leaderToken)
    .maybeSingle();

  if (lErr || !leader || !leader.is_leader) {
    return { error: "Solo el líder puede enviar el quiz del grupo." };
  }

  const { data: group } = await admin
    .from("student_groups")
    .select("class_id")
    .eq("id", leader.student_group_id)
    .maybeSingle();
  if (!group?.class_id) return { error: "Grupo sin clase asociada." };

  const { data: cls } = await admin
    .from("classes")
    .select("kit_project_id")
    .eq("id", group.class_id)
    .maybeSingle();
  if (!cls?.kit_project_id) return { error: "Clase sin proyecto asociado." };

  const { data: kitRow } = await admin
    .from("kit_projects")
    .select("quiz_questions")
    .eq("id", cls.kit_project_id)
    .maybeSingle();
  const questions = parseProjectQuizConfig((kitRow as { quiz_questions?: unknown } | null)?.quiz_questions);
  const answers = questions.map((_, i) => Number(formData.get(`q${i}`)));
  const parsed = quizSchema.safeParse({
    leader_token: leaderToken,
    answers,
  });
  if (!parsed.success || parsed.data.answers.length !== questions.length) {
    return { error: "Quiz incompleto." };
  }

  let correct = 0;
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]!;
    const a = parsed.data.answers[i]!;
    if (!Number.isInteger(a) || a < 0 || a >= q.options.length) {
      return { error: "Respuesta inválida en el quiz." };
    }
    if (a === q.correctIndex) correct++;
  }
  const scoreTotal = questions.length;
  const score_on_scale = 1 + (correct / scoreTotal) * 4;
  const rounded = Math.round(score_on_scale * 100) / 100;

  const { error: qErr } = await admin.from("group_quiz_attempts").upsert(
    {
      student_group_id: leader.student_group_id,
      score_correct: correct,
      score_total: scoreTotal,
      score_on_scale_1_5: rounded,
      answers: { choices: parsed.data.answers },
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "student_group_id" },
  );

  if (qErr) {
    return { error: qErr.message };
  }

  await refreshGroupGradeSnapshot(admin, leader.student_group_id);
  revalidatePath("/clase");
  return { ok: true as const, score: rounded };
}

const summarySchema = z.object({
  leader_token: z.string().uuid(),
  learning_summary: z.string().min(20).max(8000),
});

export async function saveGroupLearningSummary(formData: FormData) {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Configuración del servidor incompleta." };
  }

  const parsed = summarySchema.safeParse({
    leader_token: formData.get("leader_token"),
    learning_summary: formData.get("learning_summary"),
  });
  if (!parsed.success) {
    return { error: "Escribe un resumen de al menos 20 caracteres." };
  }

  const { data: leader, error: lErr } = await admin
    .from("class_group_members")
    .select("student_group_id, is_leader")
    .eq("access_token", parsed.data.leader_token)
    .maybeSingle();

  if (lErr || !leader?.is_leader) {
    return { error: "Solo el líder puede guardar el resumen." };
  }

  const { error } = await admin.from("group_project_submissions").upsert(
    {
      student_group_id: leader.student_group_id,
      learning_summary: parsed.data.learning_summary.trim(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_group_id" },
  );

  if (error) return { error: error.message };

  await refreshGroupGradeSnapshot(admin, leader.student_group_id);
  revalidatePath("/clase");
  return { ok: true as const };
}

const selfSchema = z.object({
  member_token: z.string().uuid(),
});

export async function submitSelfEvaluationMvp(formData: FormData) {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Configuración del servidor incompleta." };
  }

  const scores: Record<string, number> = {};
  for (const k of PEER_DIMENSION_KEYS) {
    scores[k] = Number(formData.get(`dim_${k}`));
  }
  if (!isValidPeerScores(scores)) {
    return { error: "Cada criterio entre 1 y 5." };
  }

  const parsed = selfSchema.safeParse({ member_token: formData.get("member_token") });
  if (!parsed.success) return { error: "Enlace inválido." };

  const { data: mem, error: mErr } = await admin
    .from("class_group_members")
    .select("id, student_group_id")
    .eq("access_token", parsed.data.member_token)
    .maybeSingle();

  if (mErr || !mem) return { error: "Enlace no válido." };

  const reflection = String(formData.get("reflection") ?? "").trim();

  const { error } = await admin.from("member_self_evaluations").upsert(
    {
      member_id: mem.id,
      scores,
      reflection: reflection || null,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "member_id" },
  );

  if (error) return { error: error.message };

  await refreshGroupGradeSnapshot(admin, mem.student_group_id);
  revalidatePath("/clase");
  return { ok: true as const };
}

export async function uploadEvidenceByLeaderToken(formData: FormData) {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Configuración del servidor incompleta." };
  }

  const token = String(formData.get("leader_token") ?? "");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona un archivo." };
  }

  const { data: leader, error: lErr } = await admin
    .from("class_group_members")
    .select("student_group_id, is_leader")
    .eq("access_token", token)
    .maybeSingle();

  if (lErr || !leader?.is_leader) {
    return { error: "Solo el líder puede subir evidencias con este enlace." };
  }

  const { data: group, error: gErr } = await admin
    .from("student_groups")
    .select("teacher_id")
    .eq("id", leader.student_group_id)
    .maybeSingle();

  if (gErr || !group) {
    return { error: "Grupo no encontrado." };
  }

  const { data: teacherRow, error: tErr } = await admin
    .from("teachers")
    .select("profile_id")
    .eq("id", group.teacher_id)
    .maybeSingle();

  if (tErr || !teacherRow?.profile_id) {
    return { error: "No se pudo resolver el docente del grupo." };
  }

  const teacherProfileId = teacherRow.profile_id;

  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${leader.student_group_id}/${randomUUID()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await admin.storage.from("evidencias").upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (upErr) {
    return { error: upErr.message };
  }

  const { error: insErr } = await admin.from("evidence_files").insert({
    student_group_id: leader.student_group_id,
    uploaded_by: teacherProfileId,
    storage_path: path,
    title: file.name,
    mime_type: file.type || null,
  });

  if (insErr) {
    return { error: insErr.message };
  }

  await refreshGroupGradeSnapshot(admin, leader.student_group_id);
  revalidatePath("/clase");
  return { ok: true as const };
}

export type EvidenceUploadFormState = { ok?: true; error?: string; receipt?: string };

/** Para `useActionState`: subida fiable con archivos grandes y varios envíos seguidos. */
export async function uploadEvidenceFormAction(
  _prev: EvidenceUploadFormState | null,
  formData: FormData,
): Promise<EvidenceUploadFormState | null> {
  const res = await uploadEvidenceByLeaderToken(formData);
  if ("error" in res && res.error) return { error: res.error };
  return { ok: true, receipt: randomUUID() };
}
