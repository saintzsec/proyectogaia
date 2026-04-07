import { requireUser } from "@/lib/auth";
import { MetricForm } from "@/components/admin/metric-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminMetricasPage() {
  const { supabase } = await requireUser();
  const { data: metrics } = await supabase
    .from("pilot_metrics")
    .select("*")
    .order("metric_date", { ascending: false })
    .limit(40);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827]">
          Métricas del piloto
        </h1>
        <p className="mt-2 text-[#4b5563]">
          Claves sugeridas: <code className="text-xs">talleres_ejecutados</code>,{" "}
          <code className="text-xs">kits_entregados</code>,{" "}
          <code className="text-xs">filtros_funcionales</code>,{" "}
          <code className="text-xs">asistencia_total_registrada</code>,{" "}
          <code className="text-xs">evaluaciones_enviadas</code>.
        </p>
      </div>

      <Card>
        <CardTitle>Registrar o actualizar indicador</CardTitle>
        <CardDescription>
          La combinación fecha + clave es única: un nuevo valor sobrescribe el anterior.
        </CardDescription>
        <div className="mt-6">
          <MetricForm />
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-[#111827]">Historial reciente</h2>
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#e5e7eb] bg-[#f9fafb] text-xs uppercase text-[#6b7280]">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Clave</th>
                <th className="px-4 py-3">Valor</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.length ? (
                metrics.map((m) => (
                  <tr key={m.id} className="border-b border-[#f3f4f6]">
                    <td className="px-4 py-3 text-[#4b5563]">{m.metric_date}</td>
                    <td className="px-4 py-3 font-mono text-xs">{m.metric_key}</td>
                    <td className="px-4 py-3 font-medium">{m.metric_value}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-[#6b7280]">
                    Sin métricas.
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
