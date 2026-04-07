import { requireUser } from "@/lib/auth";
import { EvaluationForm } from "@/components/docente/evaluation-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DocenteEvaluacionesPage() {
  const { profile, supabase } = await requireUser();
  const { data: teacher } = await supabase
    .from("teachers")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!teacher) {
    return <p className="text-sm text-[#6b7280]">Sin perfil docente asignado.</p>;
  }

  const { data: groups } = await supabase
    .from("student_groups")
    .select("id, name")
    .eq("teacher_id", teacher.id)
    .order("name");

  const groupIds = groups?.map((g) => g.id) ?? [];

  const { data: workshops } = groupIds.length
    ? await supabase
        .from("workshops")
        .select("id, title, student_group_id")
        .in("student_group_id", groupIds)
        .order("created_at", { ascending: false })
    : { data: [] as { id: string; title: string }[] };

  const { data: rubrics } = await supabase
    .from("rubrics")
    .select("id, name, rubric_criteria(id, label, max_score, sort_order)")
    .eq("is_active", true)
    .order("name");

  const { data: history } = await supabase
    .from("evaluations")
    .select("id, total_score, status, created_at, student_groups(name), rubrics(name)")
    .eq("evaluator_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(25);

  const rubricPayload =
    rubrics?.map((r) => ({
      id: r.id,
      name: r.name,
      rubric_criteria: Array.isArray(r.rubric_criteria)
        ? [...r.rubric_criteria].sort(
            (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
          )
        : [],
    })) ?? [];

  const workshopOpts =
    (workshops as { id: string; title: string; student_group_id?: string }[] | null)?.map(
      (w) => ({ id: w.id, title: w.title }),
    ) ?? [];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827]">
          Evaluaciones con rúbrica
        </h1>
        <p className="mt-2 text-[#4b5563]">
          Los puntajes se consolidan automáticamente. Puedes asociar la evaluación a un taller
          específico para mayor trazabilidad.
        </p>
      </div>

      <Card>
        <CardTitle>Nueva evaluación</CardTitle>
        <CardDescription>
          Selecciona rúbrica y grupo. Ajusta cada criterio dentro del máximo indicado.
        </CardDescription>
        <div className="mt-6">
          <EvaluationForm rubrics={rubricPayload} groups={groups ?? []} workshops={workshopOpts} />
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-[#111827]">Historial reciente</h2>
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#e5e7eb] bg-[#f9fafb] text-xs uppercase text-[#6b7280]">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Grupo</th>
                <th className="px-4 py-3">Rúbrica</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {history?.length ? (
                history.map((row: Record<string, unknown>) => {
                  const rawSg = row.student_groups as unknown;
                  const sg = (Array.isArray(rawSg) ? rawSg[0] : rawSg) as
                    | { name: string }
                    | null
                    | undefined;
                  const rawRb = row.rubrics as unknown;
                  const rb = (Array.isArray(rawRb) ? rawRb[0] : rawRb) as
                    | { name: string }
                    | null
                    | undefined;
                  return (
                    <tr key={row.id as string} className="border-b border-[#f3f4f6]">
                      <td className="px-4 py-3 text-[#4b5563]">
                        {new Date(row.created_at as string).toLocaleString("es")}
                      </td>
                      <td className="px-4 py-3">{sg?.name ?? "—"}</td>
                      <td className="px-4 py-3">{rb?.name ?? "—"}</td>
                      <td className="px-4 py-3 font-medium">
                        {row.total_score != null ? String(row.total_score) : "—"}
                      </td>
                      <td className="px-4 py-3">{row.status as string}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-[#6b7280]">
                    Sin evaluaciones todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
