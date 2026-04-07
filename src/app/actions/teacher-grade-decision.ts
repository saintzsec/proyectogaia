"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { buildSnapshotBreakdown } from "@/lib/grading/breakdown";
import { round2 } from "@/lib/grading/formula";
import { createAdminClient } from "@/lib/supabase/admin";
import { refreshGroupGradeSnapshot } from "@/server/grading/refresh-group-snapshot";

const rubricCriterionSchema = z.object({
  label: z.string().max(200),
  max_points: z.number().min(1).max(5).optional().default(5),
  score: z.number().min(1).max(5),
});

const decisionSchema = z.object({
  student_group_id: z.string().uuid(),
  class_id: z.string().uuid().optional(),
  final_group_grade: z.coerce.number().min(1).max(5),
  source: z.enum(["accepted_auto", "adjusted", "rubric_manual"]),
  teacher_comments: z.string().max(4000).optional(),
  snapshot_id: z.string().uuid().optional(),
  rubric_criteria_json: z.string().optional(),
  final_member_grades_json: z.string().optional(),
});

export async function submitTeacherGradeDecision(formData: FormData) {
  const { profile, supabase } = await requireUser();
  if (profile.role !== "docente") {
    return { error: "No autorizado." };
  }

  const parsed = decisionSchema.safeParse({
    student_group_id: formData.get("student_group_id"),
    class_id: formData.get("class_id") || undefined,
    final_group_grade: formData.get("final_group_grade"),
    source: formData.get("source"),
    teacher_comments: formData.get("teacher_comments") || undefined,
    snapshot_id: formData.get("snapshot_id") || undefined,
    rubric_criteria_json: (formData.get("rubric_criteria_json") as string) || undefined,
    final_member_grades_json: (formData.get("final_member_grades_json") as string) || undefined,
  });
  if (!parsed.success) {
    return { error: "Datos de calificación inválidos." };
  }

  const { data: group, error: gErr } = await supabase
    .from("student_groups")
    .select("id")
    .eq("id", parsed.data.student_group_id)
    .maybeSingle();

  if (gErr || !group) {
    return { error: "Grupo no encontrado o sin permiso." };
  }

  const rounded = round2(parsed.data.final_group_grade);

  let proposedAt: number | null = null;
  let formulaBreakdown: Record<string, unknown> = {};
  let rubricCriteria: z.infer<typeof rubricCriterionSchema>[] | null = null;
  let rubricAverage: number | null = null;

  if (parsed.data.snapshot_id) {
    const { data: snap } = await supabase
      .from("group_grade_snapshots")
      .select(
        "id, proposed_group_grade, weights, component_quiz, component_peer_group, component_evidence, component_self_group",
      )
      .eq("id", parsed.data.snapshot_id)
      .eq("student_group_id", parsed.data.student_group_id)
      .maybeSingle();

    if (snap) {
      proposedAt =
        snap.proposed_group_grade != null ? round2(Number(snap.proposed_group_grade)) : null;
      const bd = buildSnapshotBreakdown(snap);
      formulaBreakdown = {
        weights: bd.weights,
        rows: bd.rows,
        weightedSum: bd.weightedSum,
        proposedGroupGrade: bd.proposedGroupGrade,
      };
    }
  }

  const rubricRaw = parsed.data.rubric_criteria_json?.trim();
  if (rubricRaw) {
    try {
      const arr = JSON.parse(rubricRaw) as unknown;
      const list = z.array(rubricCriterionSchema).safeParse(arr);
      if (list.success && list.data.length) {
        rubricCriteria = list.data;
        const scores = list.data.map((r) => r.score);
        rubricAverage = round2(scores.reduce((a, b) => a + b, 0) / scores.length);
      }
    } catch {
      /* ignore malformed rubric */
    }
  }

  let finalMemberGrades: Record<string, number> | null = null;
  const memRaw = parsed.data.final_member_grades_json?.trim();
  if (memRaw) {
    try {
      const obj = JSON.parse(memRaw) as Record<string, unknown>;
      if (obj && typeof obj === "object") {
        const { data: mRows } = await supabase
          .from("class_group_members")
          .select("id")
          .eq("student_group_id", parsed.data.student_group_id);
        const allowed = new Set((mRows ?? []).map((m) => m.id));
        const out: Record<string, number> = {};
        for (const [k, v] of Object.entries(obj)) {
          if (!allowed.has(k)) {
            return { error: "Nota individual: integrante no pertenece al grupo." };
          }
          const n = typeof v === "number" ? v : Number(v);
          if (!Number.isFinite(n) || n < 1 || n > 5) {
            return { error: "Nota individual fuera de rango (1–5)." };
          }
          out[k] = round2(n);
        }
        if (Object.keys(out).length) finalMemberGrades = out;
      }
    } catch {
      return { error: "Formato de notas individuales inválido." };
    }
  }

  const { error: insErr } = await supabase.from("teacher_grade_decisions").insert({
    student_group_id: parsed.data.student_group_id,
    teacher_profile_id: profile.id,
    snapshot_id: parsed.data.snapshot_id ?? null,
    final_group_grade: rounded,
    final_member_grades: finalMemberGrades,
    source: parsed.data.source,
    teacher_comments: parsed.data.teacher_comments?.trim() || null,
    evaluation_id: null,
    proposed_group_grade_at_decision: proposedAt,
    formula_breakdown: formulaBreakdown,
    rubric_criteria: rubricCriteria,
    rubric_average_1_5: rubricAverage,
  });

  if (insErr) {
    return { error: insErr.message };
  }

  await supabase
    .from("student_groups")
    .update({ project_status: "graded" })
    .eq("id", parsed.data.student_group_id);

  try {
    const admin = createAdminClient();
    await refreshGroupGradeSnapshot(admin, parsed.data.student_group_id);
  } catch {
    /* opcional si no hay service role */
  }

  revalidatePath("/docente/clases");
  if (parsed.data.class_id) {
    revalidatePath(`/docente/clases/${parsed.data.class_id}`);
    revalidatePath(`/docente/clases/${parsed.data.class_id}/grupo/${parsed.data.student_group_id}/evaluar`);
  }
  return { ok: true as const };
}
