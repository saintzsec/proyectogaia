"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createTutorial, updateTutorial } from "@/app/actions/tutorials-admin";
import {
  RichMarkdownEditor,
  type RichMarkdownEditorRef,
} from "@/components/editor/rich-markdown-editor";
import { GaiaMarkdown } from "@/components/markdown/gaia-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveToast } from "@/components/ui/save-toast";

export type KitOption = { id: string; name: string };

export type TutorialFormValues = {
  id: string;
  kit_project_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  content_md: string | null;
  video_url: string | null;
  duration_min: number | null;
  sort_order: number;
  is_public: boolean;
};

export function TutorialForm({
  kits,
  initial,
  mode,
}: {
  kits: KitOption[];
  initial?: TutorialFormValues;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const { showSaved } = useSaveToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    content_md: initial?.content_md ?? "",
  });
  const descriptionRef = useRef<RichMarkdownEditorRef>(null);
  const contentRef = useRef<RichMarkdownEditorRef>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set("description", descriptionRef.current?.getMarkdown() ?? "");
    fd.set("content_md", contentRef.current?.getMarkdown() ?? "");
    const res =
      mode === "create" ? await createTutorial(fd) : await updateTutorial(fd);
    setLoading(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    if (mode === "create") {
      showSaved("Tutorial creado");
      router.push("/admin/tutoriales");
      router.refresh();
    } else {
      showSaved();
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {mode === "edit" && initial ? <input type="hidden" name="id" value={initial.id} /> : null}

      <div className="rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white p-4">
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[#111827]">
          Previsualizacion en vivo del minitutorial
        </h2>
        <p className="mt-1 text-sm text-[#6b7280]">
          Asi se vera la pagina publica con los cambios que estas editando.
        </p>
        <div className="mt-4 max-h-[60vh] overflow-y-auto rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-[#f9fafb] p-4">
          <p className="text-xs text-[#6b7280]">/minitutoriales/{preview.slug || "tu-slug"}</p>
          <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0baba9]">
            {preview.title || "Titulo del minitutorial"}
          </h3>
          {preview.description.trim() ? (
            <div className="mt-3">
              <GaiaMarkdown>{preview.description}</GaiaMarkdown>
            </div>
          ) : null}
          {preview.content_md.trim() ? (
            <section className="mt-6 border-t border-[#e5e7eb] pt-4">
              <h4 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[#111827]">
                Guia completa
              </h4>
              <div className="mt-2">
                <GaiaMarkdown>{preview.content_md}</GaiaMarkdown>
              </div>
            </section>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="kit_project_id">Kit asociado</Label>
        <select
          id="kit_project_id"
          name="kit_project_id"
          title="Seleccionar kit asociado"
          className="h-10 w-full max-w-md rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm"
          defaultValue={initial?.kit_project_id ?? ""}
        >
          <option value="">— Ninguno —</option>
          {kits.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={initial?.title ?? ""}
            onChange={(e) => setPreview((p) => ({ ...p, title: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            required
            placeholder="ej. mi-tutorial"
            defaultValue={initial?.slug ?? ""}
            onChange={(e) => setPreview((p) => ({ ...p, slug: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration_min">Duración (min)</Label>
          <Input
            id="duration_min"
            name="duration_min"
            type="number"
            min={0}
            defaultValue={initial?.duration_min ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sort_order">Orden</Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            min={0}
            defaultValue={initial?.sort_order ?? 0}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="video_url">URL del video (YouTube recomendado)</Label>
          <Input
            id="video_url"
            name="video_url"
            type="url"
            placeholder="https://www.youtube.com/watch?v=… o https://youtu.be/…"
            defaultValue={initial?.video_url ?? ""}
          />
          <p className="text-xs text-[#6b7280]">
            En la ficha del minitutorial, los enlaces de YouTube se muestran embebidos; otros hosts
            aparecen como enlace externo.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="is_public">Visibilidad</Label>
          <select
            id="is_public"
            name="is_public"
            title="Seleccionar visibilidad"
            className="h-10 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm"
            defaultValue={initial?.is_public === false ? "false" : "true"}
          >
            <option value="true">Público</option>
            <option value="false">Solo autenticados</option>
          </select>
        </div>
      </div>

      <RichMarkdownEditor
        ref={descriptionRef}
        labelId="tutorial-description"
        label="Descripcion corta"
        initialValue={initial?.description ?? ""}
        minHeight="10rem"
        helperText="Resume brevemente de que trata el minitutorial para mostrarlo en listados."
        onChange={(value) => setPreview((p) => ({ ...p, description: value }))}
      />

      <RichMarkdownEditor
        ref={contentRef}
        labelId="tutorial-content_md"
        label="Guia completa del minitutorial"
        initialValue={initial?.content_md ?? ""}
        minHeight="18rem"
        placeholder="## Objetivo..."
        helperText="Escribe la guia paso a paso. Puedes usar listas, links, imagenes y formato enriquecido."
        onChange={(value) => setPreview((p) => ({ ...p, content_md: value }))}
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Guardando…" : mode === "create" ? "Crear minitutorial" : "Actualizar"}
      </Button>
    </form>
  );
}
