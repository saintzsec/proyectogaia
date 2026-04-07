import type { SnapshotBreakdownPayload } from "@/lib/grading/breakdown";

export function GradeFormulaBreakdown({
  breakdown,
}: {
  breakdown: SnapshotBreakdownPayload | null;
}) {
  if (!breakdown) {
    return (
      <p className="text-sm text-[#6b7280]">
        Aún no hay snapshot de nota sugerida. Cuando el grupo tenga datos, el sistema calculará el
        desglose automáticamente.
      </p>
    );
  }

  const maxContrib = Math.max(
    0.01,
    ...breakdown.rows.map((r) => r.weightedContribution),
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-[#6b7280]">
        <strong>Ruta A:</strong> el desempeño lo registra el líder; es un dato sesgado. La nota aquí es
        solo una <strong>sugerencia</strong> para el docente, no una calificación definitiva.
      </p>
      {breakdown.usedProportionalRenormalization ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Faltan uno o más componentes: los pesos se han <strong>renormalizado</strong> solo entre los
          datos disponibles. Revisa las advertencias abajo; la nota es orientativa.
        </p>
      ) : null}
      <div className="overflow-hidden rounded-lg border border-[#e5e7eb]">
        <table className="w-full text-sm">
          <thead className="bg-[#f9fafb] text-left text-xs uppercase text-[#6b7280]">
            <tr>
              <th className="px-3 py-2">Componente</th>
              <th className="px-3 py-2 text-right">Nota 1–5</th>
              <th className="px-3 py-2 text-right">Peso nominal</th>
              <th className="px-3 py-2 text-right">Peso efectivo</th>
              <th className="px-3 py-2 text-right">Aporte</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.rows.map((r) => (
              <tr key={r.key} className="border-t border-[#f3f4f6]">
                <td className="px-3 py-2 font-medium text-[#374151]">{r.label}</td>
                <td className="px-3 py-2 text-right tabular-nums text-[#4b5563]">
                  {r.componentValue != null ? r.componentValue.toFixed(2) : "—"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-[#9ca3af]">
                  {(r.nominalWeight * 100).toFixed(0)}%
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-[#6b7280]">
                  {r.componentValue != null ? `${(r.effectiveShare * 100).toFixed(0)}%` : "—"}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-[#e5e7eb]">
                      <div
                        className="h-full rounded-full bg-[#0baba9]"
                        style={{
                          width: `${Math.min(100, (r.weightedContribution / maxContrib) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="tabular-nums font-medium text-[#111827]">
                      {r.weightedContribution > 0 ? r.weightedContribution.toFixed(2) : "—"}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
        <span className="text-[#6b7280]">
          Suma ponderada:{" "}
          <span className="font-semibold text-[#111827]">
            {breakdown.weightedSum.toFixed(2)}
          </span>
        </span>
        <span className="text-[#6b7280]">
          Nota sugerida grupal:{" "}
          <span className="text-lg font-bold text-[#0baba9]">
            {breakdown.proposedGroupGrade.toFixed(2)}
          </span>
        </span>
      </div>
    </div>
  );
}
