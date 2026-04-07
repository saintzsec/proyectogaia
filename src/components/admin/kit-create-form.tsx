"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createKitProject } from "@/app/actions/kits-admin";
import {
  RichMarkdownEditor,
  type RichMarkdownEditorRef,
} from "@/components/editor/rich-markdown-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveToast } from "@/components/ui/save-toast";

export function KitCreateForm() {
  const router = useRouter();
  const { showSaved } = useSaveToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const shortDescRef = useRef<RichMarkdownEditorRef>(null);
  const descRef = useRef<RichMarkdownEditorRef>(null);
  const objectiveRef = useRef<RichMarkdownEditorRef>(null);
  const materialsRef = useRef<RichMarkdownEditorRef>(null);
  const stepsRef = useRef<RichMarkdownEditorRef>(null);
  const errorsRef = useRef<RichMarkdownEditorRef>(null);
  const learnRef = useRef<RichMarkdownEditorRef>(null);
  const sustainRef = useRef<RichMarkdownEditorRef>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.set("short_description", shortDescRef.current?.getMarkdown() ?? "");
    fd.set("description", descRef.current?.getMarkdown() ?? "");
    fd.set("learning_objective", objectiveRef.current?.getMarkdown() ?? "");
    fd.set("materials_md", materialsRef.current?.getMarkdown() ?? "");
    fd.set("steps_md", stepsRef.current?.getMarkdown() ?? "");
    fd.set("common_errors_md", errorsRef.current?.getMarkdown() ?? "");
    fd.set("what_you_learn_md", learnRef.current?.getMarkdown() ?? "");
    fd.set("sustainability_md", sustainRef.current?.getMarkdown() ?? "");
    const res = await createKitProject(fd);
    setLoading(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    if ("id" in res && res.id) {
      showSaved("Proyecto creado");
      router.push(`/admin/proyectos/${res.id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" required placeholder="Ej. Mi nuevo kit" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            name="slug"
            required
            placeholder="mi-nuevo-kit"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          />
          <p className="text-xs text-[#6b7280]">
            Solo minúsculas, números y guiones. Aparecerá en /proyectos/tu-slug
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="is_published">Estado</Label>
          <select
            id="is_published"
            name="is_published"
            title="Estado de publicación"
            className="h-10 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm"
            defaultValue="false"
          >
            <option value="false">Borrador (no visible en sitio público)</option>
            <option value="true">Publicado</option>
          </select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <RichMarkdownEditor
            key="new-short_description"
            ref={shortDescRef}
            labelId="kit-new-short_description"
            label="Resumen corto"
            initialValue=""
            minHeight="8rem"
            placeholder="Resumen breve para listados…"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <RichMarkdownEditor
            key="new-description"
            ref={descRef}
            labelId="kit-new-description"
            label="Descripción"
            initialValue=""
            minHeight="12rem"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <RichMarkdownEditor
            key="new-learning_objective"
            ref={objectiveRef}
            labelId="kit-new-learning_objective"
            label="Objetivo de aprendizaje"
            initialValue=""
            minHeight="12rem"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <RichMarkdownEditor
            key="new-materials_md"
            ref={materialsRef}
            labelId="kit-new-materials_md"
            label="Materiales"
            initialValue=""
            minHeight="16rem"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <RichMarkdownEditor
            key="new-steps_md"
            ref={stepsRef}
            labelId="kit-new-steps_md"
            label="Pasos sugeridos"
            initialValue=""
            minHeight="16rem"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <RichMarkdownEditor
            key="new-common_errors_md"
            ref={errorsRef}
            labelId="kit-new-common_errors_md"
            label="Errores comunes"
            initialValue=""
            minHeight="12rem"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <RichMarkdownEditor
            key="new-what_you_learn_md"
            ref={learnRef}
            labelId="kit-new-what_you_learn_md"
            label="Qué se aprende"
            initialValue=""
            minHeight="12rem"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <RichMarkdownEditor
            key="new-sustainability_md"
            ref={sustainRef}
            labelId="kit-new-sustainability_md"
            label="Sostenibilidad"
            initialValue=""
            minHeight="12rem"
          />
        </div>

        <div className="md:col-span-2 space-y-4 rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-[#f9fafb] p-4">
          <p className="text-sm font-semibold text-[#111827]">Video y enlaces del kit</p>
          <div className="space-y-2">
            <Label htmlFor="tutorial_video_url">Video tutorial del proyecto (YouTube)</Label>
            <Input
              id="tutorial_video_url"
              name="tutorial_video_url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=…"
            />
            <p className="text-xs text-[#6b7280]">
              Aparece embebido en la página del proyecto. Opcional al crear; puedes añadirlo después al
              editar.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tutorial_url">Enlace opcional (p. ej. /minitutoriales)</Label>
            <Input id="tutorial_url" name="tutorial_url" type="url" placeholder="/minitutoriales" />
          </div>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Creando…" : "Crear proyecto"}
      </Button>
    </form>
  );
}
