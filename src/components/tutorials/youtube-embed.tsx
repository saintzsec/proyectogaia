type Props = { embedSrc: string; title: string };

export function YoutubeEmbed({ embedSrc, title }: Props) {
  return (
    <div className="mt-8 overflow-hidden rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-black shadow-sm">
      <div className="relative aspect-video w-full">
        <iframe
          src={`${embedSrc}${embedSrc.includes("?") ? "&" : "?"}rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
          loading="lazy"
        />
      </div>
    </div>
  );
}
