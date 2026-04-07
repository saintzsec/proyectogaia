import type { CSSProperties, ImgHTMLAttributes } from "react";

function parsePx(v: string | number | undefined): number | undefined {
  if (v == null || v === "") return undefined;
  if (typeof v === "number" && Number.isFinite(v)) {
    const n = Math.round(v);
    return n > 0 && n < 10000 ? n : undefined;
  }
  const s = String(v).trim();
  const n = parseInt(s, 10);
  return Number.isFinite(n) && n > 0 && n < 10000 ? n : undefined;
}

function isSafeHttpUrl(src: string): boolean {
  try {
    const u = new URL(src, "https://example.com");
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Imágenes en contenido Markdown de kits/recursos: ancho máximo acotado cuando hay
 * `width` (p. ej. desde HTML), siempre `max-width: 100%` del contenedor para móvil.
 */
export function GaiaMarkdownImage({
  src,
  alt,
  title,
  width,
  height,
}: Pick<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "title" | "width" | "height">) {
  if (!src || typeof src !== "string" || !isSafeHttpUrl(src)) {
    return null;
  }

  const wPx = parsePx(width);
  const hPx = parsePx(height);

  const maxWidthCss =
    wPx != null ? `min(100%, ${wPx}px)` : "min(100%, min(48rem, 100vw - 2rem))";

  const style: CSSProperties = {
    maxWidth: maxWidthCss,
    width: "100%",
    height: "auto",
    display: "block",
  };
  if (wPx != null && hPx != null) {
    style.aspectRatio = `${wPx} / ${hPx}`;
  }

  return (
    <span className="gaia-markdown-image-wrap">
      {/* URLs de terceros en contenido admin: next/image exige dominios en remotePatterns */}
      {/* eslint-disable-next-line @next/next/no-img-element -- imágenes arbitrarias https en markdown */}
      <img
        src={src}
        alt={alt ?? ""}
        loading="lazy"
        decoding="async"
        draggable={false}
        style={style}
        className="gaia-markdown-image-img"
      />
      {title ? <span className="gaia-markdown-image-caption">{title}</span> : null}
    </span>
  );
}
