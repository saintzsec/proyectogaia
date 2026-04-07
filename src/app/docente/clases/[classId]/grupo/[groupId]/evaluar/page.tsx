import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { GradeFormulaBreakdown } from "@/components/docente/grade-formula-breakdown";
import { SuggestedGradeSummaryWithWarnings } from "@/components/docente/suggested-grade-summary";
import {
  TeacherGroupEvaluateForm,
  type EvaluateMemberRow,
} from "@/components/docente/teacher-group-evaluate-form";
import { Badge } from "@/components/ui/badge";
import { buildSnapshotBreakdown } from "@/lib/grading/breakdown";
import { DATA_WARNING_LABELS_ES } from "@/lib/grading/data-warning-labels";
import { PEER_DIMENSION_KEYS, PEER_DIMENSION_LABELS_ES } from "@/lib/grading/formula";

export const dynamic = "force-dynamic";

const LOW_PEER = 2.5;

function avgLikert1to5(scores: Record<string, unknown>): number | null {
  const vals: number[] = [];
  for (const k of PEER_DIMENSION_KEYS) {
    const n = Number(scores[k]);
    if (Number.isFinite(n) && n >= 1 && n <= 5) vals.push(n);
  }
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export default async function DocenteEvaluarGrupoPage({
  params,
}: {
  params: Promise<{ classId: string; groupId: string }>;
}) {
  const { classId, groupId } = await params;
  const { profile, supabase } = await requireUser();

  const { data: teacher } = await supabase
    .from("teachers")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!teacher) notFound();

  const { data: cls } = await supabase
    .from("classes")
    .select("id, name, teacher_id, kit_projects(name)")
    .eq("id", classId)
    .maybeSingle();

  if (!cls || cls.teacher_id !== teacher.id) notFound();

  const { data: group } = await supabase
    .from("student_groups")
    .select("id, name, class_id, project_status")
    .eq("id", groupId)
    .maybeSingle();

  if (!group || group.class_id !== classId) notFound();

  const { data: members } = await supabase
    .from("class_group_members")
    .select("id, display_name, is_leader")
    .eq("student_group_id", groupId)
    .order("is_leader", { ascending: false });

  const { data: snap } = await supabase
    .from("group_grade_snapshots")
    .select(
      "id, proposed_group_grade, proposed_member_grades, component_quiz, component_peer_group, component_evidence, component_self_group, component_peer_by_member, weights, flags, computed_at",
    )
    .eq("student_group_id", groupId)
    .order("computed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: peers } = await supabase
    .from("peer_evaluations")
    .select("evaluator_member_id, evaluatee_member_id, scores, improvement_notes")
    .eq("student_group_id", groupId);

  const { data: quiz } = await supabase
    .from("group_quiz_attempts")
    .select("score_correct, score_total, score_on_scale_1_5")
    .eq("student_group_id", groupId)
    .maybeSingle();

  const { data: evRows } = await supabase
    .from("evidence_files")
    .select("id, title, storage_path, mime_type, created_at")
    .eq("student_group_id", groupId)
    .order("created_at", { ascending: false });

  const { data: sub } = await supabase
    .from("group_project_submissions")
    .select("learning_summary")
    .eq("student_group_id", groupId)
    .maybeSingle();

  const { data: decisions } = await supabase
    .from("teacher_grade_decisions")
    .select(
      "id, final_group_grade, final_member_grades, source, teacher_comments, created_at, proposed_group_grade_at_decision, formula_breakdown, rubric_criteria, rubric_average_1_5",
    )
    .eq("student_group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(12);

  const proposed =
    snap?.proposed_group_grade != null ? Number(snap.proposed_group_grade) : 3.5;
  const memberGrades = (snap?.proposed_member_grades ?? {}) as Record<string, number>;
  const peerByMember = (snap?.component_peer_by_member ?? {}) as Record<string, number | null>;
  const flags = (snap?.flags ?? {}) as Record<string, boolean>;

  const nameByMember = new Map((members ?? []).map((m) => [m.id, m.display_name]));
  const leaderMember = (members ?? []).find((m) => m.is_leader);
  const leaderRatingByEvaluatee = new Map<string, number>();
  for (const p of peers ?? []) {
    if (!leaderMember || p.evaluator_member_id !== leaderMember.id) continue;
    const avg = avgLikert1to5((p.scores ?? {}) as Record<string, unknown>);
    if (avg != null) leaderRatingByEvaluatee.set(p.evaluatee_member_id, avg);
  }

  const breakdown = snap ? buildSnapshotBreakdown(snap) : null;

  const memberRowsForForm: EvaluateMemberRow[] = (members ?? []).map((m) => {
    const p = peerByMember[m.id];
    const peerNum = p != null && Number.isFinite(Number(p)) ? Number(p) : null;
    const leaderAvg = leaderRatingByEvaluatee.get(m.id);
    const lowFromLeader =
      !m.is_leader && leaderAvg != null && leaderAvg < LOW_PEER;
    return {
      id: m.id,
      display_name: m.display_name,
      is_leader: m.is_leader,
      suggestedIndividual:
        memberGrades[m.id] != null && Number.isFinite(Number(memberGrades[m.id]))
          ? Number(memberGrades[m.id])
          : null,
      peerReceived360: peerNum,
      lowPeerAlert: lowFromLeader,
    };
  });

  const signedEvidence: { id: string; url: string; title: string | null; mime: string | null }[] =
    [];
  for (const f of evRows ?? []) {
    const path = f.storage_path as string;
    const { data: signed } = await supabase.storage
      .from("evidencias")
      .createSignedUrl(path, 3600);
    if (signed?.signedUrl) {
      signedEvidence.push({
        id: f.id,
        url: signed.signedUrl,
        title: (f.title as string) ?? path,
        mime: (f.mime_type as string) ?? null,
      });
    }
  }

  const kit = cls.kit_projects as { name?: string } | { name?: string }[] | null;
  const kitName = Array.isArray(kit) ? kit?.[0]?.name : kit?.name;

  return (
    <div className="space-y-8">
      <Link
        href={`/docente/clases/${classId}`}
        className="text-sm font-medium text-[#0baba9] hover:underline"
      >
        ← Grupos de la clase
      </Link>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
          {(cls.name as string) ?? "Clase"}
          {kitName ? ` · ${kitName}` : ""}
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827]">
          Evaluar: {group.name}
        </h1>
        <p className="mt-2 text-sm text-[#6b7280]">
          Estado:{" "}
          <Badge className="capitalize">{group.project_status.replaceAll("_", " ")}</Badge>
        </p>
      </div>

      <SuggestedGradeSummaryWithWarnings
        proposedGroup={proposed}
        proposedMemberGrades={memberGrades}
        members={(members ?? []).map((m) => ({
          id: m.id,
          display_name: m.display_name,
          is_leader: m.is_leader,
        }))}
        computedAt={snap?.computed_at ?? null}
        flags={flags}
      />

      <section className="rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-[#f9fafb] p-5">
        <h2 className="text-sm font-semibold text-[#111827]">Integrantes</h2>
        <ul className="mt-2 list-inside list-disc text-sm text-[#4b5563]">
          {members?.map((m) => (
            <li key={m.id}>
              {m.display_name}
              {m.is_leader ? " · líder" : ""}
              {memberGrades[m.id] != null ? (
                <span className="ml-2 font-medium text-[#0baba9]">
                  (sugerida individual {Number(memberGrades[m.id]).toFixed(2)})
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#111827]">Desglose de la nota sugerida</h2>
        <p className="mt-1 text-xs text-[#6b7280]">
          Pesos configurables en código (`src/lib/grading/formula.ts`). Los valores mostrados son
          los del último cálculo automático.
        </p>
        <div className="mt-4">
          <GradeFormulaBreakdown breakdown={breakdown} />
        </div>
        {Object.entries(flags).some(([k, v]) => k !== "effective_shares" && v === true) ? (
          <ul className="mt-4 list-inside list-disc space-y-1 text-xs text-amber-900">
            {Object.entries(flags)
              .filter(([k, v]) => k !== "effective_shares" && v === true)
              .map(([k]) => (
                <li key={k}>{DATA_WARNING_LABELS_ES[k] ?? k}</li>
              ))}
          </ul>
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white p-4 text-sm text-[#4b5563]">
          <h3 className="text-sm font-semibold text-[#111827]">Entregas y quiz</h3>
          <p className="mt-2">
            Archivos de evidencia: {evRows?.length ?? 0}
            {signedEvidence.length ? (
              <ul className="mt-2 space-y-2">
                {signedEvidence.map((e) => (
                  <li key={e.id}>
                    {e.mime?.startsWith("image/") ? (
                      <a href={e.url} target="_blank" rel="noreferrer" className="block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={e.url}
                          alt={e.title ?? ""}
                          className="max-h-40 max-w-full rounded-md border border-[#e5e7eb] object-cover"
                        />
                        <span className="mt-1 block text-xs text-[#0baba9] underline">
                          {e.title}
                        </span>
                      </a>
                    ) : (
                      <a
                        href={e.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0baba9] underline"
                      >
                        {e.title}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-[#9ca3af]"> Sin archivos aún.</span>
            )}
          </p>
          <p className="mt-3">
            <span className="font-medium text-[#374151]">Resumen / reflexión</span>
            <br />
            {sub?.learning_summary?.trim() ? (
              <span className="whitespace-pre-wrap text-[#4b5563]">{sub.learning_summary}</span>
            ) : (
              <span className="text-[#9ca3af]">Pendiente</span>
            )}
          </p>
          <p className="mt-3">
            Quiz:{" "}
            {quiz
              ? `${quiz.score_correct}/${quiz.score_total} → ${Number(quiz.score_on_scale_1_5).toFixed(2)} (1–5)`
              : "Pendiente"}
          </p>
        </div>

        <div className="rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white p-4">
          <h3 className="text-sm font-semibold text-[#111827]">Valoraciones de desempeño (detalle)</h3>
          <p className="mt-1 text-xs text-[#6b7280]">
            {peers?.length ?? 0} registro(s). En Ruta A solo cuenta el líder; el docente interpreta con
            criterio.
          </p>
          <div className="mt-3 max-h-64 space-y-3 overflow-y-auto text-sm">
            {(peers ?? []).map((p) => {
              const sc = (p.scores ?? {}) as Record<string, number>;
              const evalName = nameByMember.get(p.evaluator_member_id) ?? "—";
              const targetName = nameByMember.get(p.evaluatee_member_id) ?? "—";
              return (
                <div
                  key={`${p.evaluator_member_id}-${p.evaluatee_member_id}`}
                  className="rounded-md border border-[#f3f4f6] bg-[#fafafa] p-2"
                >
                  <p className="text-xs font-medium text-[#374151]">
                    {evalName} → {targetName}
                  </p>
                  <ul className="mt-1 grid grid-cols-2 gap-x-2 text-xs text-[#6b7280]">
                    {PEER_DIMENSION_KEYS.map((k) => (
                      <li key={k}>
                        {PEER_DIMENSION_LABELS_ES[k]}: {sc[k] ?? "—"}
                      </li>
                    ))}
                  </ul>
                  {p.improvement_notes ? (
                    <p className="mt-1 text-xs italic text-[#4b5563]">
                      Mejora: {p.improvement_notes}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <TeacherGroupEvaluateForm
        classId={classId}
        groupId={groupId}
        snapshotId={snap?.id ?? null}
        defaultGrade={proposed}
        breakdown={breakdown}
        members={memberRowsForForm}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#111827]">Historial y trazabilidad</h2>
        <p className="text-xs text-[#6b7280]">
          Cada registro incluye la nota final, el origen declarado y, cuando hubo snapshot, la
          sugerencia del sistema y el desglose guardado en el momento de confirmar.
        </p>
        <ul className="space-y-4 text-sm text-[#4b5563]">
          {decisions?.length ? (
            decisions.map((d) => {
              const fb = d.formula_breakdown as {
                rows?: { label: string; weightedContribution: number }[];
                weightedSum?: number;
                proposedGroupGrade?: number;
              } | null;
              const rubric = d.rubric_criteria as
                | { label: string; score: number }[]
                | null;
              return (
                <li
                  key={d.id}
                  className="rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white p-4"
                >
                  <div className="flex flex-wrap gap-2">
                    <span className="text-lg font-bold text-[#111827]">
                      {Number(d.final_group_grade).toFixed(2)}
                    </span>
                    <Badge className="bg-[#e5e7eb] capitalize text-[#374151]">
                      {d.source.replaceAll("_", " ")}
                    </Badge>
                    <span className="text-xs text-[#9ca3af]">
                      {new Date(d.created_at).toLocaleString("es")}
                    </span>
                  </div>
                  {d.proposed_group_grade_at_decision != null ? (
                    <p className="mt-2 text-xs text-[#6b7280]">
                      Sugerida en ese momento:{" "}
                      <span className="font-medium text-[#0baba9]">
                        {Number(d.proposed_group_grade_at_decision).toFixed(2)}
                      </span>
                    </p>
                  ) : null}
                  {fb?.rows?.length ? (
                    <div className="mt-2 text-xs">
                      <p className="font-medium text-[#374151]">Desglose guardado</p>
                      <ul className="mt-1 space-y-0.5">
                        {fb.rows.map((r, i) => (
                          <li key={i} className="flex justify-between gap-2">
                            <span>{r.label}</span>
                            <span className="tabular-nums">{r.weightedContribution?.toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                      {fb.weightedSum != null || fb.proposedGroupGrade != null ? (
                        <p className="mt-1 text-[#6b7280]">
                          Suma ponderada guardada:{" "}
                          {Number(fb.weightedSum ?? fb.proposedGroupGrade).toFixed(2)}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {rubric?.length ? (
                    <div className="mt-2 text-xs">
                      <p className="font-medium text-[#374151]">Rúbrica</p>
                      <ul className="mt-1 space-y-0.5">
                        {rubric.map((c, i) => (
                          <li key={i}>
                            {c.label}: {c.score}
                          </li>
                        ))}
                      </ul>
                      {d.rubric_average_1_5 != null ? (
                        <p className="mt-1">
                          Promedio rúbrica: {Number(d.rubric_average_1_5).toFixed(2)}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {d.final_member_grades &&
                  typeof d.final_member_grades === "object" &&
                  Object.keys(d.final_member_grades as object).length ? (
                    <div className="mt-2 text-xs">
                      <p className="font-medium text-[#374151]">Notas individuales registradas</p>
                      <ul className="mt-1 space-y-0.5">
                        {Object.entries(d.final_member_grades as Record<string, number>).map(
                          ([mid, val]) => (
                            <li key={mid}>
                              {nameByMember.get(mid) ?? mid}: {Number(val).toFixed(2)}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  ) : null}
                  {d.teacher_comments ? (
                    <p className="mt-2 text-xs text-[#6b7280]">{d.teacher_comments}</p>
                  ) : null}
                </li>
              );
            })
          ) : (
            <li className="text-[#9ca3af]">Sin decisiones previas.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
