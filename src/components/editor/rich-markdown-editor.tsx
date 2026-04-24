"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import TiptapImage from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { editorHtmlToKitContent, kitContentToEditorHtml } from "@/lib/kit-content-convert";
import { GaiaMarkdownPaste } from "@/components/editor/markdown-paste-extension";
import { GaiaHighlight, type GaiaVariant } from "@/components/editor/gaia-highlight";
import { cn } from "@/lib/utils";

const EMOJI_INSERT = ["💧", "🔬", "🌱", "⚠️", "✅", "📊", "🧪", "♻️", "🌍", "📌", "✨", "👉"];
type ImageSize = "small" | "medium" | "large";
type ImageAlign = "left" | "center" | "right";

const IMAGE_SIZE_WIDTH: Record<ImageSize, number> = {
  small: 320,
  medium: 520,
  large: 760,
};

function looksLikeUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

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
  onChange?: (value: string) => void;
  helperText?: string;
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
    {
      initialValue,
      label,
      labelId,
      minHeight = "12rem",
      placeholder = "Escribe aquí…",
      onChange,
      helperText = "Escribe aquí el contenido de esta sección. Puedes pegar Markdown y se aplicará el formato automáticamente.",
    },
    ref,
  ) {
    const editorWrapRef = useRef<HTMLDivElement | null>(null);
    const [imageToolbar, setImageToolbar] = useState<{
      visible: boolean;
      top: number;
      left: number;
      size: ImageSize;
      align: ImageAlign;
    }>({
      visible: false,
      top: 0,
      left: 0,
      size: "medium",
      align: "center",
    });

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
        TiptapImage.extend({
          addAttributes() {
            return {
              ...this.parent?.(),
              width: {
                default: null,
                parseHTML: (element) => element.getAttribute("width"),
              },
              "data-size": {
                default: "medium",
                parseHTML: (element) => element.getAttribute("data-size") ?? "medium",
                renderHTML: (attributes) => ({ "data-size": attributes["data-size"] ?? "medium" }),
              },
              "data-align": {
                default: "center",
                parseHTML: (element) => element.getAttribute("data-align") ?? "center",
                renderHTML: (attributes) => ({ "data-align": attributes["data-align"] ?? "center" }),
              },
            };
          },
        }).configure({
          allowBase64: false,
          HTMLAttributes: { class: "gaia-editor-image max-w-full rounded-[var(--radius-gaia)]" },
        }),
        Placeholder.configure({ placeholder }),
        GaiaHighlight,
      ],
      content: kitContentToEditorHtml(initialValue),
      onUpdate({ editor }) {
        onChange?.(editorHtmlToKitContent(editor.getHTML()));
      },
      editorProps: {
        attributes: {
          class:
            "prose-kit-editor outline-none max-w-none px-3 py-2 text-[#111827] leading-relaxed",
        },
        handlePaste(view, event) {
          const text = event.clipboardData?.getData("text/plain")?.trim() ?? "";
          if (!text || !looksLikeUrl(text)) return false;

          view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.image.create({
            src: text,
            alt: "",
            width: IMAGE_SIZE_WIDTH.medium,
            "data-size": "medium",
            "data-align": "center",
          })));
          return true;
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

    const setLink = () => {
      if (!editor) return;
      const prev = editor.getAttributes("link").href as string | undefined;
      const url = window.prompt("URL del enlace (https://…)", prev ?? "https://");
      if (url === null) return;
      if (url === "") {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        return;
      }
      const selectedText = editor.state.doc.textBetween(
        editor.state.selection.from,
        editor.state.selection.to,
      );
      if (!selectedText.trim()) {
        const label = window.prompt("Texto del botón/enlace", "Ir al recurso");
        if (!label?.trim()) return;
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${url.trim()}">${label.trim()}</a>`)
          .run();
        return;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
    };

    const addImage = () => {
      if (!editor) return;
      const url = window.prompt("URL de la imagen (debe ser pública, https://)");
      if (!url?.trim()) return;
      const sizeInput = window.prompt("Tamaño de imagen: small | medium | large", "medium");
      const alignInput = window.prompt("Alineación: left | center | right", "center");
      const size = (sizeInput?.trim().toLowerCase() || "medium") as ImageSize;
      const align = (alignInput?.trim().toLowerCase() || "center") as ImageAlign;
      const safeSize: ImageSize = ["small", "medium", "large"].includes(size) ? size : "medium";
      const safeAlign: ImageAlign = ["left", "center", "right"].includes(align) ? align : "center";
      editor
        .chain()
        .focus()
        .setImage({
          src: url.trim(),
          alt: "",
          width: IMAGE_SIZE_WIDTH[safeSize],
          "data-size": safeSize,
          "data-align": safeAlign,
        })
        .run();
    };

    const updateSelectedImage = (attrs: { size?: ImageSize; align?: ImageAlign }) => {
      if (!editor) return;
      const current = editor.getAttributes("image") as Record<string, string | number | undefined>;
      const nextSize = attrs.size ?? ((current["data-size"] as ImageSize) || "medium");
      const nextAlign = attrs.align ?? ((current["data-align"] as ImageAlign) || "center");
      editor
        .chain()
        .focus()
        .updateAttributes("image", {
          "data-size": nextSize,
          "data-align": nextAlign,
          width: IMAGE_SIZE_WIDTH[nextSize],
        })
        .run();
    };

    useEffect(() => {
      if (!editor) return;

      const syncImageToolbar = () => {
        const wrapper = editorWrapRef.current;
        if (!wrapper) return;
        const selected = wrapper.querySelector("img.gaia-editor-image.ProseMirror-selectednode") as
          | HTMLImageElement
          | null;
        if (!selected) {
          setImageToolbar((prev) => (prev.visible ? { ...prev, visible: false } : prev));
          return;
        }

        const selectedRect = selected.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        const sizeAttr = (selected.getAttribute("data-size") as ImageSize | null) ?? "medium";
        const alignAttr = (selected.getAttribute("data-align") as ImageAlign | null) ?? "center";
        setImageToolbar({
          visible: true,
          top: Math.max(6, selectedRect.top - wrapperRect.top + 6),
          left: Math.max(6, selectedRect.right - wrapperRect.left + 8),
          size: ["small", "medium", "large"].includes(sizeAttr) ? sizeAttr : "medium",
          align: ["left", "center", "right"].includes(alignAttr) ? alignAttr : "center",
        });
      };

      syncImageToolbar();
      editor.on("selectionUpdate", syncImageToolbar);
      editor.on("transaction", syncImageToolbar);
      return () => {
        editor.off("selectionUpdate", syncImageToolbar);
        editor.off("transaction", syncImageToolbar);
      };
    }, [editor]);

    const gaia = (v: GaiaVariant) => {
      if (!editor) return;
      editor.chain().focus().toggleGaiaHighlight(v).run();
    };

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

    return (
      <div className="space-y-2">
        <label htmlFor={labelId} className="text-base font-semibold text-[#111827]">
          {label}
        </label>
        <p className="text-sm text-[#6b7280]">{helperText}</p>
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
          <div ref={editorWrapRef} className="kit-rich-editor relative bg-white" style={{ minHeight }}>
            <EditorContent editor={editor} />
            {imageToolbar.visible ? (
              <div
                className="absolute z-10 flex flex-wrap items-center gap-1 rounded-xl border border-[#e5e7eb] bg-white/95 p-1 shadow-lg"
                style={{ top: imageToolbar.top, left: imageToolbar.left }}
              >
                <button
                  type="button"
                  className={cn(
                    "rounded px-2 py-1 text-xs font-medium",
                    imageToolbar.size === "small" ? "bg-[#0baba9]/15 text-[#0baba9]" : "hover:bg-[#f3f4f6]",
                  )}
                  onClick={() => updateSelectedImage({ size: "small" })}
                >
                  Small
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded px-2 py-1 text-xs font-medium",
                    imageToolbar.size === "medium" ? "bg-[#0baba9]/15 text-[#0baba9]" : "hover:bg-[#f3f4f6]",
                  )}
                  onClick={() => updateSelectedImage({ size: "medium" })}
                >
                  Medium
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded px-2 py-1 text-xs font-medium",
                    imageToolbar.size === "large" ? "bg-[#0baba9]/15 text-[#0baba9]" : "hover:bg-[#f3f4f6]",
                  )}
                  onClick={() => updateSelectedImage({ size: "large" })}
                >
                  Large
                </button>
                <span className="mx-0.5 h-4 w-px bg-[#e5e7eb]" />
                <button
                  type="button"
                  className={cn(
                    "rounded px-2 py-1 text-xs font-medium",
                    imageToolbar.align === "left" ? "bg-[#0baba9]/15 text-[#0baba9]" : "hover:bg-[#f3f4f6]",
                  )}
                  onClick={() => updateSelectedImage({ align: "left" })}
                  aria-label="Alinear izquierda"
                >
                  ↤
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded px-2 py-1 text-xs font-medium",
                    imageToolbar.align === "center" ? "bg-[#0baba9]/15 text-[#0baba9]" : "hover:bg-[#f3f4f6]",
                  )}
                  onClick={() => updateSelectedImage({ align: "center" })}
                  aria-label="Alinear centro"
                >
                  ↔
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded px-2 py-1 text-xs font-medium",
                    imageToolbar.align === "right" ? "bg-[#0baba9]/15 text-[#0baba9]" : "hover:bg-[#f3f4f6]",
                  )}
                  onClick={() => updateSelectedImage({ align: "right" })}
                  aria-label="Alinear derecha"
                >
                  ↦
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  },
);
