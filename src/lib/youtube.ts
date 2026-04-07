/**
 * Convierte enlaces de YouTube (watch, youtu.be, shorts) a URL de embed.
 */
export function getYoutubeEmbedSrc(url: string): string | null {
  const raw = url.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch" || u.pathname.startsWith("/watch")) {
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
      const embedMatch = u.pathname.match(/^\/embed\/([^/?]+)/);
      if (embedMatch) return `https://www.youtube-nocookie.com/embed/${embedMatch[1]}`;
      const shortsMatch = u.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shortsMatch) return `https://www.youtube-nocookie.com/embed/${shortsMatch[1]}`;
    }

    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}
