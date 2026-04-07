import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DocenteTutorialesPage() {
  await requireUser();
  const supabase = await createClient();
  const { data: tutorials } = await supabase
    .from("tutorials")
    .select("id, slug, title, description, duration_min, sort_order, is_public, kit_projects(name)")
    .order("sort_order");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827] md:text-3xl">
          Minitutoriales
        </h1>
        <p className="mt-2 max-w-2xl text-[#4b5563]">
          Guías alineadas al piloto (incluye borradores visibles solo para usuarios autenticados).
          Abre cada tarjeta para ver el contenido completo dentro del panel.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tutorials?.length ? (
          tutorials.map((t) => {
            const kp = t.kit_projects as { name: string } | null | { name: string }[];
            const kitName = Array.isArray(kp) ? kp[0]?.name : kp?.name;
            return (
              <Link key={t.id} href={`/docente/tutoriales/${t.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md hover:border-[#0baba9]/30">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{t.title}</CardTitle>
                    {t.is_public ? (
                      <Badge className="shrink-0 text-[10px]">Público</Badge>
                    ) : (
                      <Badge className="shrink-0 bg-[#f3f4f6] text-[10px] text-[#6b7280]">
                        Interno
                      </Badge>
                    )}
                  </div>
                  {kitName ? (
                    <p className="mt-1 text-xs font-medium text-[#42b232]">{kitName}</p>
                  ) : null}
                  <CardDescription className="line-clamp-3">{t.description}</CardDescription>
                  <p className="mt-3 text-xs text-[#6b7280]">
                    {t.duration_min ? `${t.duration_min} min` : "Duración flexible"} · Ver guía →
                  </p>
                </Card>
              </Link>
            );
          })
        ) : (
          <p className="text-sm text-[#6b7280]">No hay tutoriales cargados.</p>
        )}
      </div>
    </div>
  );
}
