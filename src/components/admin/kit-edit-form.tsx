"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { updateKitProject } from "@/app/actions/kits-admin";
import {
  RichMarkdownEditor,
  type RichMarkdownEditorRef,
} from "@/components/editor/rich-markdown-editor";
import { GaiaMarkdown } from "@/components/markdown/gaia-markdown";
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

type TutorialItem = {
  id: string;
  title: string;
  slug: string;
  sort_order: number;
  kit_project_id: string | null;
};

export function KitEditForm({ kit, tutorials }: { kit: KitEditValues; tutorials: TutorialItem[] }) {
  const router = useRouter();
  const { showSaved } = useSaveToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTutorialIds, setSelectedTutorialIds] = useState<string[]>(
    tutorials
      .filter((t) => t.kit_project_id === kit.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((t) => t.id),
  );
  const [tutorialPicker, setTutorialPicker] = useState<string>("");
  const [preview, setPreview] = useState({
    name: kit.name,
    slug: kit.slug,
    description: kit.description ?? "",
    learning_objective: kit.learning_objective ?? "",
    materials_md: kit.materials_md ?? "",
    steps_md: kit.steps_md ?? "",
    common_errors_md: kit.common_errors_md ?? "",
    what_you_learn_md: kit.what_you_learn_md ?? "",
    sustainability_md: kit.sustainability_md ?? "",
  });

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
    fd.set("related_tutorial_ids", JSON.stringify(selectedTutorialIds));
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
  const tutorialMap = new Map(tutorials.map((t) => [t.id, t]));
  const selectedTutorials = selectedTutorialIds
    .map((id) => tutorialMap.get(id))
    .filter((t): t is TutorialItem => Boolean(t));
  const availableTutorials = tutorials.filter((t) => !selectedTutorialIds.includes(t.id));

  function addTutorial(id: string) {
    if (!id || selectedTutorialIds.includes(id)) return;
    setSelectedTutorialIds((prev) => [...prev, id]);
    setTutorialPicker("");
  }

  function removeTutorial(id: string) {
    setSelectedTutorialIds((prev) => prev.filter((x) => x !== id));
  }

  function moveTutorial(id: string, dir: -1 | 1) {
    setSelectedTutorialIds((prev) => {
      const idx = prev.indexOf(id);
      if (idx < 0) return prev;
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[nextIdx]] = [next[nextIdx], next[idx]];
      return next;
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <input type="hidden" name="id" value={kit.id} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2 rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white p-4">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[#111827]">
            Previsualización en vivo del proyecto
          </h2>
          <p className="mt-1 text-sm text-[#6b7280]">
            Vista rápida de cómo se verá la ficha pública con los cambios que estás escribiendo.
          </p>
          <div className="mt-4 max-h-[70vh] overflow-y-auto rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-[#f9fafb] p-4">
            <p className="text-xs text-[#6b7280]">/proyectos/{preview.slug || "tu-slug"}</p>
            <h2 className="mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0baba9]">
              {preview.name || "Nombre del proyecto"}
            </h2>
            {preview.description.trim() ? (
              <div className="mt-3">
                <GaiaMarkdown>{preview.description}</GaiaMarkdown>
              </div>
            ) : null}
            {(
              [
                ["Objetivo de aprendizaje", preview.learning_objective],
                ["Materiales", preview.materials_md],
                ["Pasos sugeridos", preview.steps_md],
                ["Errores comunes", preview.common_errors_md],
                ["Qué se aprende", preview.what_you_learn_md],
                ["Sostenibilidad", preview.sustainability_md],
              ] as const
            ).map(([title, body]) =>
              body.trim() ? (
                <section key={title} className="mt-6">
                  <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-[#111827]">
                    {title}
                  </h3>
                  <div className="mt-2">
                    <GaiaMarkdown>{body}</GaiaMarkdown>
                  </div>
                </section>
              ) : null,
            )}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name" className="text-base font-semibold text-[#111827]">Nombre del proyecto</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={kit.name}
            onChange={(e) => setPreview((p) => ({ ...p, name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug" className="text-base font-semibold text-[#111827]">URL del proyecto (slug)</Label>
          <Input
            id="slug"
            name="slug"
            required
            defaultValue={kit.slug}
            onChange={(e) => setPreview((p) => ({ ...p, slug: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="is_published" className="text-base font-semibold text-[#111827]">Estado de publicación</Label>
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
            helperText="Escribe un resumen corto (2-4 líneas) para mostrar en listados y tarjetas."
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
            onChange={(value) => setPreview((p) => ({ ...p, description: value }))}
            helperText="Describe el proyecto: qué es, para qué sirve y qué problema resuelve."
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
            onChange={(value) => setPreview((p) => ({ ...p, learning_objective: value }))}
            helperText="Indica con claridad qué aprenderá el estudiante al finalizar esta actividad."
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
            onChange={(value) => setPreview((p) => ({ ...p, materials_md: value }))}
            helperText="Lista materiales concretos y cantidades sugeridas. Usa viñetas para mayor claridad."
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
            onChange={(value) => setPreview((p) => ({ ...p, steps_md: value }))}
            helperText="Escribe el paso a paso en orden. Un paso por línea o lista numerada."
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
            onChange={(value) => setPreview((p) => ({ ...p, common_errors_md: value }))}
            helperText="Anota errores frecuentes y cómo prevenirlos durante la actividad."
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
            onChange={(value) => setPreview((p) => ({ ...p, what_you_learn_md: value }))}
            helperText="Resume habilidades y conocimientos que el estudiante desarrolla con este proyecto."
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
            onChange={(value) => setPreview((p) => ({ ...p, sustainability_md: value }))}
            helperText="Explica el aporte ambiental y por qué este proyecto es sostenible."
          />
        </div>

        <div className="md:col-span-2 space-y-4 rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-[#f9fafb] p-4">
          <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[#111827]">
            Recursos multimedia y minitutoriales
          </h3>
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
            <Label htmlFor="related_tutorials">Minitutoriales relacionados (ordenados)</Label>
            <div className="space-y-3 rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white p-3">
              <div className="flex gap-2">
                <select
                  id="related_tutorials"
                  title="Agregar minitutorial relacionado"
                  value={tutorialPicker}
                  onChange={(e) => setTutorialPicker(e.target.value)}
                  className="h-10 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm"
                >
                  <option value="">Seleccionar minitutorial disponible…</option>
                  {availableTutorials.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.slug})
                    </option>
                  ))}
                </select>
                <Button type="button" variant="outline" onClick={() => addTutorial(tutorialPicker)}>
                  Agregar
                </Button>
              </div>

              {selectedTutorials.length ? (
                <div className="flex flex-wrap gap-2">
                  {selectedTutorials.map((t, idx) => (
                    <div
                      key={t.id}
                      className="inline-flex items-center gap-1 rounded-full border border-[#0baba9]/35 bg-[#0baba9]/10 px-3 py-1 text-xs font-medium text-[#0baba9]"
                    >
                      <span>{idx + 1}.</span>
                      <span>{t.title}</span>
                      <button
                        type="button"
                        className="rounded px-1 text-[#0baba9] hover:bg-[#0baba9]/15"
                        onClick={() => moveTutorial(t.id, -1)}
                        aria-label={`Mover ${t.title} arriba`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="rounded px-1 text-[#0baba9] hover:bg-[#0baba9]/15"
                        onClick={() => moveTutorial(t.id, 1)}
                        aria-label={`Mover ${t.title} abajo`}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="rounded px-1 text-[#7f1d1d] hover:bg-[#fde2e8]"
                        onClick={() => removeTutorial(t.id)}
                        aria-label={`Quitar ${t.title}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6b7280]">Sin minitutoriales vinculados aún.</p>
              )}
            </div>
            <p className="text-xs text-[#6b7280]">
              El orden de estos tags define el orden visible de minitutoriales en la ficha del proyecto.
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
