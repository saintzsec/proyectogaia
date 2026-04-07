import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GaiaMarkdown } from "@/components/markdown/gaia-markdown";
import { Card, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Proyectos y kits" };

export default async function ProyectosPage() {
  const supabase = await createClient();
  const { data: kits } = await supabase
    .from("kit_projects")
    .select("id, slug, name, short_description")
    .eq("is_published", true)
    .order("name");

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#0baba9] md:text-4xl">
        Proyectos y kits
      </h1>
      <p className="mt-4 max-w-2xl text-[#4b5563]">
        Cada kit combina práctica de laboratorio, pensamiento sistémico y narrativa ambiental. El
        piloto arranca con el filtro biológico de agua; la arquitectura está lista para sumar más
        desafíos.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {kits?.length ? (
          kits.map((k) => (
            <Link key={k.id} href={`/proyectos/${k.slug}`}>
              <Card className="h-full hover:border-[#0baba9]/40">
                <CardTitle>{k.name}</CardTitle>
                {k.short_description?.trim() ? (
                  <div className="mt-1 text-sm text-[#4b5563]">
                    <GaiaMarkdown compact>{k.short_description}</GaiaMarkdown>
                  </div>
                ) : null}
                <p className="mt-4 text-sm font-medium text-[#0baba9]">Ver ficha →</p>
              </Card>
            </Link>
          ))
        ) : (
          <p className="text-sm text-[#6b7280]">
            No hay proyectos publicados aún. Configura Supabase y ejecuta la migración con datos
            semilla.
          </p>
        )}
      </div>
    </div>
  );
}
