import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { kitContentToEditorHtml } from "@/lib/kit-content-convert";

/** Texto del portapapeles que parece Markdown (p. ej. pegado desde un chat con IA). */
export function clipboardLooksLikeMarkdown(text: string): boolean {
  const t = text.trim();
  if (t.length < 2) return false;
  if (/^#{1,6}\s/m.test(t)) return true;
  if (/^\s*[-*+]\s+\S/m.test(t)) return true;
  if (/^\s*\d+\.\s+\S/m.test(t)) return true;
  if (/\*\*[\s\S]*?\*\*/.test(t)) return true;
  if (/^>\s/m.test(t)) return true;
  if (/```[\s\S]*?```/.test(t)) return true;
  if (/\[[^\]]+\]\([^)\s]+\)/.test(t)) return true;
  if (/!\[[^\]]*\]\([^)\s]+\)/.test(t)) return true;
  if (/<span\s+data-gaia=/i.test(t)) return true;
  if (/^<[a-z][\s\S]*>/i.test(t) && /<\/?(p|h[1-6]|ul|ol|li|strong|em|blockquote)/i.test(t)) return true;
  if (/(^|\s)_[^\s_][^_]*_[\s.,;:!?]/.test(t)) return true;
  if (/(^|[^*])\*[^\s*][^*\n]*\*([^*]|$)/.test(t)) return true;
  return false;
}

function hasRichClipboardHtml(html: string): boolean {
  if (!html || !html.includes("<")) return false;
  const h = html.toLowerCase();
  return (
    h.includes("<strong") ||
    h.includes("<b>") ||
    h.includes("<em>") ||
    h.includes("<i>") ||
    h.includes("<u>") ||
    h.includes("<br") ||
    h.includes("<p ") ||
    h.includes("<p>") ||
    h.includes("<div") ||
    h.includes("<ul") ||
    h.includes("<ol") ||
    h.includes("<h1") ||
    h.includes("<h2") ||
    h.includes("<a ")
  );
}

/**
 * Al pegar texto plano con sintaxis Markdown, convierte a HTML del editor (mismo flujo que al cargar el campo).
 */
export const GaiaMarkdownPaste = Extension.create({
  name: "gaiaMarkdownPaste",

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: new PluginKey("gaiaMarkdownPaste"),
        props: {
          handlePaste(_view, event) {
            const c = event.clipboardData;
            if (!c) return false;

            const text = c.getData("text/plain");
            const html = c.getData("text/html") ?? "";

            if (!text?.trim()) return false;

            if (hasRichClipboardHtml(html) && !clipboardLooksLikeMarkdown(text)) {
              return false;
            }

            if (!clipboardLooksLikeMarkdown(text)) return false;

            event.preventDefault();
            const out = kitContentToEditorHtml(text);
            editor.chain().focus().insertContent(out).run();
            return true;
          },
        },
      }),
    ];
  },
});
