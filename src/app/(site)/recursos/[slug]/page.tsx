import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GaiaMarkdown } from "@/components/markdown/gaia-markdown";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_resources")
    .select("title")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();
  return { title: data?.title ?? "Recurso" };
}

export default async function RecursoDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: r } = await supabase
    .from("content_resources")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .maybeSingle();

  if (!r) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
      <Link href="/recursos" className="text-sm font-medium text-[#0baba9] hover:underline">
        ← Volver a la biblioteca
      </Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-[#f07800]">
        {r.resource_type}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#111827]">
        {r.title}
      </h1>
      {r.external_url ? (
        <a
          href={r.external_url}
          className="mt-4 inline-block text-[#0baba9] underline"
          target="_blank"
          rel="noreferrer"
        >
          Abrir enlace externo
        </a>
      ) : null}
      <div className="mt-8 max-w-none">
        {r.body_md ? <GaiaMarkdown>{r.body_md}</GaiaMarkdown> : null}
      </div>
    </article>
  );
}
