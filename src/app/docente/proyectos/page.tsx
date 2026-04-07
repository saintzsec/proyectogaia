import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { GaiaMarkdown } from "@/components/markdown/gaia-markdown";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DocenteProyectosPage() {
  await requireUser();
  const supabase = await createClient();
  const { data: kits } = await supabase
    .from("kit_projects")
    .select("id, slug, name, short_description, is_published")
    .order("name");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827] md:text-3xl">
          Proyectos y kits
        </h1>
        <p className="mt-2 max-w-2xl text-[#4b5563]">
          Consulta fichas completas, minitutoriales vinculados y enlaces a la biblioteca. El piloto
          GAIA centra el kit del filtro biológico de agua.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {kits?.length ? (
          kits.map((k) => (
            <Link key={k.id} href={`/docente/proyectos/${k.slug}`}>
              <Card className="h-full transition-colors hover:border-[#0baba9]/40 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>{k.name}</CardTitle>
                  {k.is_published ? (
                    <Badge className="shrink-0 bg-[#42b232]/15 text-[#2d7a22]">Publicado</Badge>
                  ) : (
                    <Badge className="shrink-0 bg-[#e5e7eb] text-[#6b7280]">Borrador</Badge>
                  )}
                </div>
                {k.short_description?.trim() ? (
                  <div className="mt-1 text-sm text-[#4b5563]">
                    <GaiaMarkdown compact>{k.short_description}</GaiaMarkdown>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-[#4b5563]">Sin resumen.</p>
                )}
                <p className="mt-4 text-sm font-medium text-[#0baba9]">Abrir ficha →</p>
              </Card>
            </Link>
          ))
        ) : (
          <p className="text-sm text-[#6b7280]">No hay kits en la base de datos.</p>
        )}
      </div>
    </div>
  );
}
