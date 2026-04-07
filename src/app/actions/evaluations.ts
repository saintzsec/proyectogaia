"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const base = z.object({
  rubric_id: z.string().uuid(),
  student_group_id: z.string().uuid(),
  workshop_id: z.string().uuid().optional(),
  comments: z.string().optional(),
});

export async function submitEvaluation(formData: FormData) {
  const { profile, supabase } = await requireUser();
  if (profile.role !== "docente") {
    return { error: "No autorizado." };
  }

  const workshopRaw = formData.get("workshop_id");
  const parsedBase = base.safeParse({
    rubric_id: formData.get("rubric_id"),
    student_group_id: formData.get("student_group_id"),
    workshop_id: workshopRaw && String(workshopRaw).length ? workshopRaw : undefined,
    comments: formData.get("comments") || undefined,
  });

  if (!parsedBase.success) {
    return { error: "Datos de evaluación incompletos." };
  }

  const { data: teacherRow } = await supabase
    .from("teachers")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  const { data: group } = await supabase
    .from("student_groups")
    .select("id, teacher_id")
    .eq("id", parsedBase.data.student_group_id)
    .maybeSingle();

  if (!teacherRow || !group || group.teacher_id !== teacherRow.id) {
    return { error: "No puedes evaluar ese grupo." };
  }

  const { data: criteria, error: ce } = await supabase
    .from("rubric_criteria")
    .select("id, max_score")
    .eq("rubric_id", parsedBase.data.rubric_id)
    .order("sort_order");

  if (ce || !criteria?.length) {
    return { error: "Rúbrica sin criterios." };
  }

  let total = 0;
  const rows: { rubric_criterion_id: string; score: number }[] = [];
  for (const c of criteria) {
    const raw = formData.get(`score_${c.id}`);
    const score = Number(raw);
    if (Number.isNaN(score) || score < 0 || score > c.max_score) {
      return { error: `Puntaje inválido en: ${c.id}` };
    }
    total += score;
    rows.push({ rubric_criterion_id: c.id, score });
  }

  const { data: evaluation, error: evErr } = await supabase
    .from("evaluations")
    .insert({
      rubric_id: parsedBase.data.rubric_id,
      student_group_id: parsedBase.data.student_group_id,
      workshop_id: parsedBase.data.workshop_id ?? null,
      evaluator_id: profile.id,
      status: "submitted",
      total_score: total,
      comments: parsedBase.data.comments ?? null,
    })
    .select("id")
    .single();

  if (evErr || !evaluation) {
    return { error: evErr?.message ?? "No se pudo crear la evaluación." };
  }

  const inserts = rows.map((r) => ({
    evaluation_id: evaluation.id,
    rubric_criterion_id: r.rubric_criterion_id,
    score: r.score,
  }));

  const { error: scErr } = await supabase.from("evaluation_scores").insert(inserts);
  if (scErr) {
    return { error: scErr.message };
  }

  revalidatePath("/docente/evaluaciones");
  revalidatePath("/docente");
  return { ok: true as const };
}
