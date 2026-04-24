import { marked } from "marked";
import TurndownService from "turndown";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  br: "  \n",
});

turndown.addRule("gaiaSpan", {
  filter(node) {
    return (
      node.nodeName === "SPAN" &&
      Boolean((node as HTMLElement).getAttribute?.("data-gaia"))
    );
  },
  replacement(content, node) {
    const el = node as HTMLElement;
    const v = el.getAttribute("data-gaia") || "primary";
    return `<span data-gaia="${v}">${content}</span>`;
  },
});

/** Conserva <img> con dimensiones/alineación como HTML para render responsive. */
turndown.addRule("gaiaImgSized", {
  filter(node) {
    if (node.nodeName !== "IMG") return false;
    const el = node as HTMLElement;
    return Boolean(
      el.getAttribute("width") ||
        el.getAttribute("height") ||
        el.getAttribute("data-size") ||
        el.getAttribute("data-align"),
    );
  },
  replacement(_content, node) {
    const el = node as HTMLElement;
    const src = el.getAttribute("src")?.trim() ?? "";
    if (!src) return "";
    const alt = el.getAttribute("alt") ?? "";
    const title = el.getAttribute("title");
    const width = el.getAttribute("width");
    const height = el.getAttribute("height");
    const dataSize = el.getAttribute("data-size");
    const dataAlign = el.getAttribute("data-align");
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    let html = `<img src="${esc(src)}" alt="${esc(alt)}"`;
    if (width) html += ` width="${esc(width)}"`;
    if (height) html += ` height="${esc(height)}"`;
    if (dataSize) html += ` data-size="${esc(dataSize)}"`;
    if (dataAlign) html += ` data-align="${esc(dataAlign)}"`;
    if (title) html += ` title="${esc(title)}"`;
    html += ">";
    return `\n\n${html}\n\n`;
  },
});

/** Contenido del admin → HTML para TipTap (Markdown o HTML guardado previamente). */
export function kitContentToEditorHtml(raw: string): string {
  const t = raw.trim();
  if (!t) return "<p></p>";
  if (/^<[a-z]/i.test(t) && /<\/?(p|h[1-6]|ul|ol|li|div|span|blockquote|pre|strong|em|a|img|br)/i.test(t)) {
    return raw;
  }
  try {
    return marked(raw, { async: false, breaks: true }) as string;
  } catch {
    return `<p>${escapeHtml(raw)}</p>`;
  }
}

/** HTML de TipTap → Markdown / HTML mezclado para guardar en Postgres. */
export function editorHtmlToKitContent(html: string): string {
  const h = html.trim() || "<p></p>";
  return turndown.turndown(h).trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
