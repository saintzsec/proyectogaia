"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import TiptapImage from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { forwardRef, useImperativeHandle } from "react";
import { editorHtmlToKitContent, kitContentToEditorHtml } from "@/lib/kit-content-convert";
import { GaiaMarkdownPaste } from "@/components/editor/markdown-paste-extension";
import { GaiaHighlight, type GaiaVariant } from "@/components/editor/gaia-highlight";
import { cn } from "@/lib/utils";

const EMOJI_INSERT = ["💧", "🔬", "🌱", "⚠️", "✅", "📊", "🧪", "♻️", "🌍", "📌", "✨", "👉"];

export type RichMarkdownEditorRef = {
  getMarkdown: () => string;
};

type Props = {
  /** Valor inicial (Markdown o HTML de una edición previa). */
  initialValue: string;
  label: string;
  labelId: string;
  /** Altura mínima del área de edición. */
  minHeight?: string;
  placeholder?: string;
};

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "rounded px-2 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-[#0baba9]/15 text-[#0baba9]"
          : "bg-white text-[#374151] hover:bg-[#f3f4f6]",
      )}
    >
      {children}
    </button>
  );
}

export const RichMarkdownEditor = forwardRef<RichMarkdownEditorRef, Props>(
  function RichMarkdownEditor(
    { initialValue, label, labelId, minHeight = "12rem", placeholder = "Escribe aquí…" },
    ref,
  ) {
    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        GaiaMarkdownPaste,
        StarterKit.configure({
          heading: { levels: [2, 3, 4] },
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { class: "text-[#0baba9] underline" },
        }),
        TiptapImage.configure({
          allowBase64: false,
          HTMLAttributes: { class: "max-w-full rounded-[var(--radius-gaia)]" },
        }),
        Placeholder.configure({ placeholder }),
        GaiaHighlight,
      ],
      content: kitContentToEditorHtml(initialValue),
      editorProps: {
        attributes: {
          class:
            "prose-kit-editor outline-none max-w-none px-3 py-2 text-[#111827] leading-relaxed",
        },
      },
    });

    useImperativeHandle(
      ref,
      () => ({
        getMarkdown: () => editorHtmlToKitContent(editor?.getHTML() ?? "<p></p>"),
      }),
      [editor],
    );

    if (!editor) {
      return (
        <div className="space-y-2">
          <label htmlFor={labelId} className="text-sm font-medium text-[#111827]">
            {label}
          </label>
          <div
            className="animate-pulse rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-[#f9fafb]"
            style={{ minHeight }}
          />
        </div>
      );
    }

    const setLink = () => {
      const prev = editor.getAttributes("link").href as string | undefined;
      const url = window.prompt("URL del enlace (https://…)", prev ?? "https://");
      if (url === null) return;
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    const addImage = () => {
      const url = window.prompt("URL de la imagen (debe ser pública, https://)");
      if (!url?.trim()) return;
      const wStr = window.prompt(
        "Ancho máximo en pantallas grandes (px, opcional). En móvil la imagen usa el 100% del ancho. Ej: 520",
        "",
      );
      let width: number | undefined;
      if (wStr?.trim()) {
        const n = parseInt(wStr.trim(), 10);
        if (Number.isFinite(n) && n > 0 && n < 10000) width = n;
      }
      editor.chain().focus().setImage({ src: url.trim(), alt: "", ...(width != null ? { width } : {}) }).run();
    };

    const gaia = (v: GaiaVariant) => {
      editor.chain().focus().toggleGaiaHighlight(v).run();
    };

    return (
      <div className="space-y-2">
        <label htmlFor={labelId} className="text-sm font-medium text-[#111827]">
          {label}
        </label>
        <p className="text-xs text-[#6b7280]">
          Podés pegar Markdown desde un asistente (negritas, listas, enlaces, etc.): se convierte al
          pegar. La barra aplica negrita, colores de marca y el resto en vivo. Se guarda como Markdown
          (y HTML permitido para resaltados GAIA e imágenes con tamaño).
        </p>
        <div
          className="overflow-hidden rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white shadow-sm"
          style={{ ["--kit-editor-min-h" as string]: minHeight }}
        >
          <div className="flex flex-wrap items-center gap-1 border-b border-[#e5e7eb] bg-[#f9fafb] p-2">
            <ToolbarButton
              title="Deshacer"
              onClick={() => editor.chain().focus().undo().run()}
            >
              ↶
            </ToolbarButton>
            <ToolbarButton
              title="Rehacer"
              onClick={() => editor.chain().focus().redo().run()}
            >
              ↷
            </ToolbarButton>
            <span className="mx-1 h-6 w-px bg-[#e5e7eb]" aria-hidden />
            <ToolbarButton
              title="Negrita"
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <strong>B</strong>
            </ToolbarButton>
            <ToolbarButton
              title="Cursiva"
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <em>I</em>
            </ToolbarButton>
            <ToolbarButton
              title="Subrayado"
              active={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <u>U</u>
            </ToolbarButton>
            <ToolbarButton
              title="Tachado"
              active={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              S
            </ToolbarButton>
            <span className="mx-1 h-6 w-px bg-[#e5e7eb]" aria-hidden />
            <ToolbarButton
              title="Título 2"
              active={editor.isActive("heading", { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              H2
            </ToolbarButton>
            <ToolbarButton
              title="Título 3"
              active={editor.isActive("heading", { level: 3 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              H3
            </ToolbarButton>
            <ToolbarButton
              title="Título 4"
              active={editor.isActive("heading", { level: 4 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            >
              H4
            </ToolbarButton>
            <span className="mx-1 h-6 w-px bg-[#e5e7eb]" aria-hidden />
            <ToolbarButton
              title="Lista con viñetas"
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              • Lista
            </ToolbarButton>
            <ToolbarButton
              title="Lista numerada"
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              1. Lista
            </ToolbarButton>
            <span className="mx-1 h-6 w-px bg-[#e5e7eb]" aria-hidden />
            <ToolbarButton title="Enlace" active={editor.isActive("link")} onClick={setLink}>
              🔗
            </ToolbarButton>
            <ToolbarButton title="Imagen (URL)" onClick={addImage}>
              🖼
            </ToolbarButton>
            <span className="mx-1 h-6 w-px bg-[#e5e7eb]" aria-hidden />
            <ToolbarButton
              title="Resaltar teal (marca)"
              active={editor.isActive("gaiaHighlight", { variant: "primary" })}
              onClick={() => gaia("primary")}
            >
              <span className="text-[#0baba9]">A</span>
            </ToolbarButton>
            <ToolbarButton
              title="Resaltar ámbar"
              active={editor.isActive("gaiaHighlight", { variant: "secondary" })}
              onClick={() => gaia("secondary")}
            >
              <span className="text-amber-700">A</span>
            </ToolbarButton>
            <ToolbarButton
              title="Resaltar naranja"
              active={editor.isActive("gaiaHighlight", { variant: "tertiary" })}
              onClick={() => gaia("tertiary")}
            >
              <span className="text-orange-700">A</span>
            </ToolbarButton>
            <ToolbarButton
              title="Resaltar verde"
              active={editor.isActive("gaiaHighlight", { variant: "quaternary" })}
              onClick={() => gaia("quaternary")}
            >
              <span className="text-green-700">A</span>
            </ToolbarButton>
            <ToolbarButton title="Quitar resaltado marca" onClick={() => editor.chain().focus().unsetGaiaHighlight().run()}>
              A̶
            </ToolbarButton>
            <span className="mx-1 h-6 w-px bg-[#e5e7eb]" aria-hidden />
            <div className="flex flex-wrap gap-0.5">
              {EMOJI_INSERT.map((e) => (
                <button
                  key={e}
                  type="button"
                  title={`Insertar ${e}`}
                  className="rounded px-1 py-0.5 text-lg leading-none hover:bg-[#e5e7eb]"
                  onClick={() => editor.chain().focus().insertContent(e).run()}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="kit-rich-editor bg-white" style={{ minHeight }}>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    );
  },
);
