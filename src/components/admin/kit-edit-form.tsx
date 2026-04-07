"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { updateKitProject } from "@/app/actions/kits-admin";
import {
  RichMarkdownEditor,
  type RichMarkdownEditorRef,
} from "@/components/editor/rich-markdown-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveToast } from "@/components/ui/save-toast";

export type KitEditValues = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  learning_objective: string | null;
  materials_md: string | null;
  steps_md: string | null;
  common_errors_md: string | null;
  sustainability_md: string | null;
  what_you_learn_md: string | null;
  tutorial_url: string | null;
  tutorial_video_url: string | null;
  is_published: boolean;
};

export function KitEditForm({ kit }: { kit: KitEditValues }) {
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
    const res = await updateKitProject(fd);
    setLoading(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    showSaved();
    router.refresh();
  }

  const k = kit.id;

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <input type="hidden" name="id" value={kit.id} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" required defaultValue={kit.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input id="slug" name="slug" required defaultValue={kit.slug} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="is_published">Estado</Label>
          <select
            id="is_published"
            name="is_published"
            title="Estado de publicación"
            className="h-10 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm"
            defaultValue={kit.is_published ? "true" : "false"}
          >
            <option value="true">Publicado</option>
            <option value="false">Borrador</option>
          </select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <RichMarkdownEditor
            key={`${k}-short_description`}
            ref={shortDescRef}
            labelId="kit-short_description"
            label="Resumen corto"
            initialValue={kit.short_description ?? ""}
            minHeight="8rem"
            placeholder="Resumen breve para listados…"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <RichMarkdownEditor
            key={`${k}-description`}
            ref={descRef}
            labelId="kit-description"
            label="Descripción"
            initialValue={kit.description ?? ""}
            minHeight="12rem"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <RichMarkdownEditor
            key={`${k}-learning_objective`}
            ref={objectiveRef}
            labelId="kit-learning_objective"
            label="Objetivo de aprendizaje"
            initialValue={kit.learning_objective ?? ""}
            minHeight="12rem"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <RichMarkdownEditor
            key={`${k}-materials_md`}
            ref={materialsRef}
            labelId="kit-materials_md"
            label="Materiales"
            initialValue={kit.materials_md ?? ""}
            minHeight="16rem"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <RichMarkdownEditor
            key={`${k}-steps_md`}
            ref={stepsRef}
            labelId="kit-steps_md"
            label="Pasos sugeridos"
            initialValue={kit.steps_md ?? ""}
            minHeight="16rem"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <RichMarkdownEditor
            key={`${k}-common_errors_md`}
            ref={errorsRef}
            labelId="kit-common_errors_md"
            label="Errores comunes"
            initialValue={kit.common_errors_md ?? ""}
            minHeight="12rem"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <RichMarkdownEditor
            key={`${k}-what_you_learn_md`}
            ref={learnRef}
            labelId="kit-what_you_learn_md"
            label="Qué se aprende"
            initialValue={kit.what_you_learn_md ?? ""}
            minHeight="12rem"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <RichMarkdownEditor
            key={`${k}-sustainability_md`}
            ref={sustainRef}
            labelId="kit-sustainability_md"
            label="Sostenibilidad"
            initialValue={kit.sustainability_md ?? ""}
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
              placeholder="https://www.youtube.com/watch?v=… o https://youtu.be/…"
              defaultValue={kit.tutorial_video_url ?? ""}
            />
            <p className="text-xs text-[#6b7280]">
              Se muestra embebido en la ficha del proyecto para docentes y visitantes (sitio público).
              Otros enlaces de video no se incrustan; usa un enlace de YouTube.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tutorial_url">Enlace opcional (p. ej. a minitutoriales)</Label>
            <Input
              id="tutorial_url"
              name="tutorial_url"
              type="url"
              placeholder="/minitutoriales"
              defaultValue={kit.tutorial_url ?? ""}
            />
            <p className="text-xs text-[#6b7280]">
              Ruta interna o URL absoluta si quieres un botón/enlace adicional desde el contenido del kit.
            </p>
          </div>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
