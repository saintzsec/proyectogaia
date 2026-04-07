import { requireUser } from "@/lib/auth";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DocenteRubricasPage() {
  const { supabase } = await requireUser();
  const { data: rubrics } = await supabase
    .from("rubrics")
    .select(
      "id, name, version, is_active, kit_projects(name), rubric_criteria(id, label, description, max_score, sort_order)",
    )
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827]">
          Rúbricas activas
        </h1>
        <p className="mt-2 max-w-2xl text-[#4b5563]">
          Referencia de criterios y puntajes máximos para alinear evaluaciones con GAIA. Para
          registrar una evaluación usa «Evaluaciones».
        </p>
      </div>

      <div className="space-y-8">
        {rubrics?.length ? (
          rubrics.map((r) => {
            const rawKp = r.kit_projects as unknown;
            const kp = (Array.isArray(rawKp) ? rawKp[0] : rawKp) as { name: string } | null | undefined;
            const crit = Array.isArray(r.rubric_criteria)
              ? [...r.rubric_criteria].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
              : [];
            const maxTotal = crit.reduce((acc, c) => acc + c.max_score, 0);
            return (
              <Card key={r.id}>
                <CardTitle>{r.name}</CardTitle>
                <CardDescription>
                  Versión {r.version}
                  {kp?.name ? ` · Kit: ${kp.name}` : ""}
                  {maxTotal > 0 ? ` · Puntaje máximo total: ${maxTotal}` : ""}
                </CardDescription>
                <div className="mt-4 overflow-x-auto rounded-[var(--radius-gaia)] border border-[#e5e7eb]">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-[#e5e7eb] bg-[#f9fafb] text-xs uppercase text-[#6b7280]">
                      <tr>
                        <th className="px-4 py-3">Criterio</th>
                        <th className="px-4 py-3">Máx.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {crit.length ? (
                        crit.map((c) => (
                          <tr key={c.id} className="border-b border-[#f3f4f6]">
                            <td className="px-4 py-3">
                              <p className="font-medium text-[#111827]">{c.label}</p>
                              {c.description ? (
                                <p className="mt-1 text-xs text-[#6b7280]">{c.description}</p>
                              ) : null}
                            </td>
                            <td className="px-4 py-3 font-mono">{c.max_score}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-4 py-4 text-center text-[#6b7280]">
                            Sin criterios definidos.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            );
          })
        ) : (
          <p className="text-sm text-[#6b7280]">No hay rúbricas activas configuradas.</p>
        )}
      </div>
    </div>
  );
}
