import Link from "next/link";
import { GaiaMarkdown } from "@/components/markdown/gaia-markdown";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { YoutubeEmbed } from "@/components/tutorials/youtube-embed";
import { getYoutubeEmbedSrc } from "@/lib/youtube";

export type KitDetailRecord = {
  name: string;
  slug: string;
  description: string | null;
  learning_objective: string | null;
  materials_md: string | null;
  steps_md: string | null;
  common_errors_md: string | null;
  what_you_learn_md: string | null;
  sustainability_md: string | null;
  /** URL de YouTube del video tutorial del kit (embebido en la ficha). */
  tutorial_video_url?: string | null;
};

export type KitTutorialSummary = {
  slug: string;
  title: string;
  description: string | null;
  duration_min: number | null;
};

function Block({ title, body }: { title: string; body: string | null }) {
  if (!body?.trim()) return null;
  return (
    <section className="mt-10">
      <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[#111827]">
        {title}
      </h2>
      <div className="mt-3 text-[var(--foreground)] leading-relaxed [&_.gaia-markdown]:leading-relaxed">
        <GaiaMarkdown>{body}</GaiaMarkdown>
      </div>
    </section>
  );
}

type TutorialLinkBase = "public" | "docente";

export function KitDetailContent({
  kit,
  tutorials,
  backHref,
  tutorialLinkBase = "public",
}: {
  kit: KitDetailRecord;
  tutorials?: KitTutorialSummary[];
  backHref: string;
  tutorialLinkBase?: TutorialLinkBase;
}) {
  const tutBase = tutorialLinkBase === "docente" ? "/docente/tutoriales" : "/minitutoriales";
  const videoUrl = kit.tutorial_video_url?.trim() || null;
  const youtubeEmbed = videoUrl ? getYoutubeEmbedSrc(videoUrl) : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
      <Link href={backHref} className="text-sm font-medium text-[#0baba9] hover:underline">
        ← Volver
      </Link>
      <Badge className="mt-6">Kit publicado</Badge>
      <h1 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#0baba9] md:text-4xl">
        {kit.name}
      </h1>
      {kit.description?.trim() ? (
        <div className="mt-4 text-lg leading-relaxed text-[var(--foreground)] [&_.gaia-markdown]:text-lg [&_.gaia-markdown]:leading-relaxed">
          <GaiaMarkdown>{kit.description}</GaiaMarkdown>
        </div>
      ) : null}

      {videoUrl ? (
        <section className="mt-10" aria-label="Video tutorial del proyecto">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[#111827]">
            Video tutorial
          </h2>
          <p className="mt-2 text-sm text-[#4b5563]">
            Introducción al proyecto y contenido pedagógico en video.
          </p>
          {youtubeEmbed ? (
            <YoutubeEmbed embedSrc={youtubeEmbed} title={`Video tutorial: ${kit.name}`} />
          ) : (
            <div className="mt-4">
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center rounded-[var(--radius-gaia)] bg-[#0baba9] px-4 text-sm font-medium text-white hover:bg-[#09908e]"
              >
                Abrir video
              </a>
            </div>
          )}
        </section>
      ) : null}

      <Block title="Objetivo de aprendizaje" body={kit.learning_objective} />
      <Block title="Materiales" body={kit.materials_md} />
      <Block title="Pasos sugeridos" body={kit.steps_md} />
      <Block title="Errores comunes" body={kit.common_errors_md} />
      <Block title="Qué se aprende" body={kit.what_you_learn_md} />
      <Block title="Sostenibilidad" body={kit.sustainability_md} />

      {tutorials && tutorials.length > 0 ? (
        <section className="mt-12 border-t border-[#e5e7eb] pt-10">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[#111827]">
            Minitutoriales de este kit
          </h2>
          <p className="mt-2 text-sm text-[#4b5563]">
            Secuencia sugerida para acompañar el taller en el aula.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {tutorials.map((t) => (
              <li key={t.slug}>
                <Link href={`${tutBase}/${t.slug}`}>
                  <Card className="h-full transition-shadow hover:shadow-md hover:border-[#0baba9]/30">
                    <CardTitle className="text-base">{t.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {t.description ?? "Ver guía paso a paso"}
                    </CardDescription>
                    <p className="mt-2 text-xs text-[#0baba9]">
                      {t.duration_min ? `${t.duration_min} min · ` : ""}
                      Abrir guía →
                    </p>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={tutorialLinkBase === "docente" ? "/docente/tutoriales" : "/minitutoriales"}
          className="inline-flex h-10 items-center rounded-[var(--radius-gaia)] bg-[#0baba9] px-4 text-sm font-medium text-white hover:bg-[#09908e]"
        >
          Todos los minitutoriales
        </Link>
        <Link
          href="/recursos"
          className="inline-flex h-10 items-center rounded-[var(--radius-gaia)] border border-[#0baba9] px-4 text-sm font-medium text-[#0baba9] hover:bg-[#0baba9]/5"
        >
          Biblioteca de recursos
        </Link>
      </div>
    </article>
  );
}
