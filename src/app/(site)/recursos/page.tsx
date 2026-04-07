import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Biblioteca de recursos" };

export default async function RecursosPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("content_resources")
    .select("id, slug, title, body_md, resource_type")
    .eq("is_public", true)
    .order("title");

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#0baba9] md:text-4xl">
        Biblioteca de recursos
      </h1>
      <p className="mt-4 max-w-2xl text-[#4b5563]">
        Guías para docentes, artículos de metodología y materiales replicables. Todo pensado para
        escalar el piloto a nuevas comunidades escolares.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {items?.length ? (
          items.map((r) => (
            <Link key={r.id} href={`/recursos/${r.slug}`}>
              <Card className="h-full hover:border-[#42b232]/50">
                <p className="text-xs font-medium uppercase tracking-wide text-[#42b232]">
                  {r.resource_type}
                </p>
                <CardTitle className="mt-2">{r.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {r.body_md?.slice(0, 180)}
                  {(r.body_md?.length ?? 0) > 180 ? "…" : ""}
                </CardDescription>
              </Card>
            </Link>
          ))
        ) : (
          <p className="text-sm text-[#6b7280]">Aún no hay recursos públicos en la base de datos.</p>
        )}
      </div>
    </div>
  );
}
