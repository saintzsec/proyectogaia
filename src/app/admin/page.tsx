import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { PilotChart } from "@/components/dashboard/pilot-chart";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const { supabase } = await requireUser();

  const { count: schoolCount } = await supabase
    .from("schools")
    .select("id", { count: "exact", head: true });

  const { count: teacherCount } = await supabase
    .from("teachers")
    .select("id", { count: "exact", head: true });

  const { count: groupCount } = await supabase
    .from("student_groups")
    .select("id", { count: "exact", head: true });

  const { data: metrics } = await supabase
    .from("pilot_metrics")
    .select("metric_date, metric_key, metric_value")
    .order("metric_date", { ascending: false })
    .limit(80);

  const latestDate = metrics?.[0]?.metric_date;
  const chartRows =
    metrics
      ?.filter((m) => m.metric_date === latestDate)
      .map((m) => ({ metric_key: m.metric_key, metric_value: Number(m.metric_value) })) ?? [];

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827] md:text-3xl">
            Panel administrador
          </h1>
          <p className="mt-2 text-[#4b5563]">
            Visión agregada del piloto GAIA. Las métricas se alimentan manualmente en esta etapa.
          </p>
        </div>
        <Link href="/admin/metricas">
          <Button type="button" variant="secondary">
            Editar métricas
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardTitle className="text-3xl font-bold text-[#0baba9]">{schoolCount ?? 0}</CardTitle>
          <CardDescription>Colegios</CardDescription>
        </Card>
        <Card>
          <CardTitle className="text-3xl font-bold text-[#42b232]">{teacherCount ?? 0}</CardTitle>
          <CardDescription>Docentes vinculados</CardDescription>
        </Card>
        <Card>
          <CardTitle className="text-3xl font-bold text-[#f07800]">{groupCount ?? 0}</CardTitle>
          <CardDescription>Grupos registrados</CardDescription>
        </Card>
      </div>

      <Card>
        <CardTitle>Indicadores del piloto</CardTitle>
        <CardDescription>
          Última fecha registrada: {latestDate ?? "sin datos"}. Ajusta valores en «Métricas piloto».
        </CardDescription>
        <div className="mt-6">
          <PilotChart data={chartRows} />
        </div>
      </Card>
    </div>
  );
}
