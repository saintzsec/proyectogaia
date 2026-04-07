import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { snapshotHasDataWarnings } from "@/lib/grading/data-warning-labels";

export const dynamic = "force-dynamic";

type SnapRow = {
  student_group_id: string;
  proposed_group_grade: number | string | null;
  component_quiz: number | string | null;
  component_peer_group: number | string | null;
  component_evidence: number | string | null;
  component_self_group: number | string | null;
  computed_at: string;
  flags: unknown;
};

export default async function DocenteClaseDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const { profile, supabase } = await requireUser();

  const { data: teacher } = await supabase
    .from("teachers")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!teacher) notFound();

  const { data: cls, error } = await supabase
    .from("classes")
    .select("id, name, join_code, status, teacher_id, kit_projects(name)")
    .eq("id", classId)
    .maybeSingle();

  if (error || !cls || cls.teacher_id !== teacher.id) notFound();

  const { data: groups } = await supabase
    .from("student_groups")
    .select("id, name, project_status, created_at")
    .eq("class_id", classId)
    .order("created_at", { ascending: false });

  const groupIds = groups?.map((g) => g.id) ?? [];
  const latestByGroup = new Map<string, SnapRow>();
  if (groupIds.length) {
    const { data: snaps } = await supabase
      .from("group_grade_snapshots")
      .select(
        "student_group_id, proposed_group_grade, component_quiz, component_peer_group, component_evidence, component_self_group, computed_at, flags",
      )
      .in("student_group_id", groupIds)
      .order("computed_at", { ascending: false });
    for (const s of snaps ?? []) {
      const row = s as SnapRow;
      if (!latestByGroup.has(row.student_group_id)) {
        latestByGroup.set(row.student_group_id, row);
      }
    }
  }

  const rows = await Promise.all(
    (groups ?? []).map(async (g) => {
      const { count } = await supabase
        .from("class_group_members")
        .select("id", { count: "exact", head: true })
        .eq("student_group_id", g.id);
      const { data: leader } = await supabase
        .from("class_group_members")
        .select("display_name")
        .eq("student_group_id", g.id)
        .eq("is_leader", true)
        .maybeSingle();
      const snap = latestByGroup.get(g.id);
      return {
        ...g,
        memberCount: count ?? 0,
        leaderName: leader?.display_name ?? "—",
        proposed:
          snap?.proposed_group_grade != null
            ? Number(snap.proposed_group_grade)
            : null,
        quiz1to5: snap?.component_quiz != null ? Number(snap.component_quiz) : null,
        peer1to5:
          snap?.component_peer_group != null ? Number(snap.component_peer_group) : null,
        evidence1to5:
          snap?.component_evidence != null ? Number(snap.component_evidence) : null,
        reflection1to5:
          snap?.component_self_group != null ? Number(snap.component_self_group) : null,
        dataWarnings: snap ? snapshotHasDataWarnings(snap.flags) : false,
      };
    }),
  );

  const kp = (cls as { kit_projects?: { name?: string } | { name?: string }[] }).kit_projects;
  const kitName = Array.isArray(kp) ? kp[0]?.name : kp?.name;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/docente/clases" className="text-sm font-medium text-[#0baba9] hover:underline">
          ← Clases
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827]">
          {cls.name as string}
        </h1>
        <p className="mt-2 text-sm text-[#6b7280]">
          Código:{" "}
          <span className="font-mono font-semibold text-[#111827]">{cls.join_code as string}</span>{" "}
          · Proyecto: {kitName ?? "—"} · Estado:{" "}
          <Badge className="ml-1 capitalize">{cls.status as string}</Badge>
        </p>
        <p className="mt-2 text-xs text-[#9ca3af]">
          Comparte el código para que los líderes registren grupos en{" "}
          <Link href="/clase/unirse" className="text-[#0baba9] underline">
            /clase/unirse
          </Link>
          .
        </p>
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white">
        <table className="min-w-[1000px] w-full text-left text-sm">
          <thead className="border-b border-[#e5e7eb] bg-[#f9fafb] text-xs uppercase text-[#6b7280]">
            <tr>
              <th className="px-4 py-3">Grupo</th>
              <th className="px-4 py-3">Líder</th>
              <th className="px-4 py-3">Integr.</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Quiz</th>
              <th className="px-4 py-3 text-right">Evid.</th>
              <th className="px-4 py-3 text-right">Desempeño</th>
              <th className="px-4 py-3 text-right">Refl.</th>
              <th className="px-4 py-3 text-right">Sugerida</th>
              <th className="px-4 py-3 text-center">Avisos</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-[#f3f4f6]">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">{r.leaderName}</td>
                  <td className="px-4 py-3">{r.memberCount}</td>
                  <td className="px-4 py-3 capitalize">{r.project_status.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-[#4b5563]">
                    {r.quiz1to5 != null ? r.quiz1to5.toFixed(2) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-[#4b5563]">
                    {r.evidence1to5 != null ? r.evidence1to5.toFixed(2) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-[#4b5563]">
                    {r.peer1to5 != null ? r.peer1to5.toFixed(2) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-[#4b5563]">
                    {r.reflection1to5 != null ? r.reflection1to5.toFixed(2) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-base font-semibold tabular-nums text-[#0baba9]">
                    {r.proposed != null ? r.proposed.toFixed(2) : "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-xs">
                    {r.dataWarnings ? (
                      <span
                        className="inline-block rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-900"
                        title="Faltan datos o la nota se calculó con pesos renormalizados"
                      >
                        Revisar
                      </span>
                    ) : (
                      <span className="text-[#d1d5db]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/docente/clases/${classId}/grupo/${r.id}/evaluar`}
                      className="font-medium text-[#0baba9] hover:underline"
                    >
                      Evaluar grupo
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-[#6b7280]">
                  Nadie ha registrado grupos con este código aún. Comparte el código con tus
                  estudiantes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
