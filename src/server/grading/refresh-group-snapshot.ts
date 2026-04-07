import type { SupabaseClient } from "@supabase/supabase-js";
import { computeProposedGrade, type PeerEvalRow } from "@/lib/grading/compute-proposed-grade";

/**
 * Recalcula y persiste el snapshot de nota propuesta para un grupo (service role o sesión docente).
 */
export async function refreshGroupGradeSnapshot(
  db: SupabaseClient,
  studentGroupId: string,
): Promise<{ ok: true } | { error: string }> {
  const { data: members, error: me } = await db
    .from("class_group_members")
    .select("id, is_leader")
    .eq("student_group_id", studentGroupId);

  if (me || !members?.length) {
    return { error: me?.message ?? "Sin integrantes en el grupo." };
  }

  const memberIds = members.map((m) => m.id);
  const leader = members.find((m) => m.is_leader);
  const leaderMemberId = leader?.id ?? null;

  const { data: peers } = await db
    .from("peer_evaluations")
    .select("evaluator_member_id, evaluatee_member_id, scores")
    .eq("student_group_id", studentGroupId);

  const { data: quiz } = await db
    .from("group_quiz_attempts")
    .select("score_on_scale_1_5")
    .eq("student_group_id", studentGroupId)
    .maybeSingle();

  const { count: evidenceCount } = await db
    .from("evidence_files")
    .select("id", { count: "exact", head: true })
    .eq("student_group_id", studentGroupId);

  const { data: sub } = await db
    .from("group_project_submissions")
    .select("learning_summary")
    .eq("student_group_id", studentGroupId)
    .maybeSingle();

  const summaryLen = (sub?.learning_summary ?? "").trim().length;

  const peerEvaluations: PeerEvalRow[] = (peers ?? []).map((p) => ({
    evaluator_member_id: p.evaluator_member_id,
    evaluatee_member_id: p.evaluatee_member_id,
    scores: (p.scores ?? {}) as Record<string, unknown>,
  }));

  const computed = computeProposedGrade({
    quizScore1to5: quiz?.score_on_scale_1_5 != null ? Number(quiz.score_on_scale_1_5) : null,
    peerEvaluations,
    memberIds,
    leaderMemberId,
    evidenceFileCount: evidenceCount ?? 0,
    learningSummaryLength: summaryLen,
  });

  const { error: insErr } = await db.from("group_grade_snapshots").insert({
    student_group_id: studentGroupId,
    formula_version: computed.formula_version,
    weights: computed.weights,
    component_quiz: computed.component_quiz,
    component_peer_group: computed.component_peer_group,
    component_peer_by_member: computed.component_peer_by_member,
    component_evidence: computed.component_evidence,
    component_self_group: computed.component_self_group,
    proposed_group_grade: computed.proposed_group_grade,
    proposed_member_grades: computed.proposed_member_grades,
    flags: computed.flags,
  });

  if (insErr) {
    return { error: insErr.message };
  }

  return { ok: true };
}
