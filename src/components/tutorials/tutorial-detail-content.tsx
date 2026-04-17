import Link from "next/link";
import { GaiaMarkdown } from "@/components/markdown/gaia-markdown";
import { Badge } from "@/components/ui/badge";
import { YoutubeEmbed } from "@/components/tutorials/youtube-embed";
import { getYoutubeEmbedSrc } from "@/lib/youtube";

export type TutorialDetailRecord = {
  title: string;
  slug: string;
  description: string | null;
  duration_min: number | null;
  video_url: string | null;
  content_md: string | null;
};

export function TutorialDetailContent({
  tutorial,
  kitName,
  backHref,
}: {
  tutorial: TutorialDetailRecord;
  kitName: string | null;
  backHref: string;
}) {
  const youtubeEmbed =
    tutorial.video_url ? getYoutubeEmbedSrc(tutorial.video_url) : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
      <Link href={backHref} className="text-sm font-medium text-[#0baba9] hover:underline">
        ← Volver a minitutoriales
      </Link>
      {kitName ? (
        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[#42b232]">
          Kit: {kitName}
        </p>
      ) : null}
      <h1 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#111827] md:text-4xl">
        {tutorial.title}
      </h1>
      {tutorial.description ? (
        <p className="mt-4 text-lg text-[var(--foreground)]">{tutorial.description}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge className="bg-[#fed705]/25 text-[#92400e]">
          {tutorial.duration_min ? `${tutorial.duration_min} min sugeridos` : "Duración flexible"}
        </Badge>
      </div>
      {tutorial.video_url ? (
        youtubeEmbed ? (
          <YoutubeEmbed embedSrc={youtubeEmbed} title={`Video: ${tutorial.title}`} />
        ) : (
          <div className="mt-6 space-y-2">
            <p className="text-sm text-[#6b7280]">Video (enlace externo):</p>
            <a
              href={tutorial.video_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center rounded-[var(--radius-gaia)] bg-[#0baba9] px-4 text-sm font-medium text-white hover:bg-[#09908e]"
            >
              Abrir video
            </a>
          </div>
        )
      ) : (
        <p className="mt-6 text-sm text-[#6b7280]">
          Aún no hay URL de video configurada; usa la guía escrita o pídele al equipo GAIA que la
          cargue desde administración.
        </p>
      )}
      {tutorial.content_md ? (
        <section className="mt-10 border-t border-[#e5e7eb] pt-10">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[#111827]">
            Guía paso a paso
          </h2>
          <div className="mt-4">
            <GaiaMarkdown>{tutorial.content_md}</GaiaMarkdown>
          </div>
        </section>
      ) : null}
    </article>
  );
}
