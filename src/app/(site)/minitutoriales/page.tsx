import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Minitutoriales" };

export default async function MinitutorialesPage() {
  const supabase = await createClient();
  const { data: tutorials } = await supabase
    .from("tutorials")
    .select("id, title, slug, description, duration_min, sort_order, video_url")
    .eq("is_public", true)
    .order("sort_order");

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#0baba9] md:text-4xl">
        Minitutoriales
      </h1>
      <p className="mt-4 max-w-2xl text-[#4b5563]">
        Videos y guías breves para acompañar cada momento del proyecto. En el MVP los enlaces de
        video pueden añadirse desde el panel administrador.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {tutorials?.length ? (
          tutorials.map((t) => (
            <Card key={t.id}>
              <CardTitle>
                <Link href={`/minitutoriales/${t.slug}`} className="hover:text-[#0baba9]">
                  {t.title}
                </Link>
              </CardTitle>
              <CardDescription>{t.description}</CardDescription>
              <p className="mt-4 text-xs text-[#6b7280]">
                Duración sugerida: {t.duration_min ? `${t.duration_min} min` : "flexible"}
              </p>
              <Link
                href={`/minitutoriales/${t.slug}`}
                className="mt-3 inline-block text-sm font-medium text-[#0baba9] hover:underline"
              >
                Leer guía completa →
              </Link>
              {t.video_url ? (
                <a
                  href={t.video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block text-sm font-medium text-[#42b232] hover:underline"
                >
                  Ver video →
                </a>
              ) : (
                <p className="mt-2 text-sm text-[#9ca3af]">Próximamente: enlace a video</p>
              )}
            </Card>
          ))
        ) : (
          <p className="text-sm text-[#6b7280]">No hay minitutoriales públicos todavía.</p>
        )}
      </div>
    </div>
  );
}
