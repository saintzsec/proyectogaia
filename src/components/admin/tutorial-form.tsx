"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createTutorial, updateTutorial } from "@/app/actions/tutorials-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
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

      <div className="space-y-2">
        <Label htmlFor="kit_project_id">Kit asociado</Label>
        <select
          id="kit_project_id"
          name="kit_project_id"
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
          <Input id="title" name="title" required defaultValue={initial?.title ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            required
            placeholder="ej. mi-tutorial"
            defaultValue={initial?.slug ?? ""}
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
            className="h-10 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm"
            defaultValue={initial?.is_public === false ? "false" : "true"}
          >
            <option value="true">Público</option>
            <option value="false">Solo autenticados</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción corta</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initial?.description ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content_md">Guía completa (Markdown)</Label>
        <Textarea
          id="content_md"
          name="content_md"
          rows={14}
          placeholder="## Objetivo&#10;…"
          defaultValue={initial?.content_md ?? ""}
        />
        <p className="text-xs text-[#6b7280]">
          Los encabezados usan colores GAIA automáticamente. Para una palabra clave:{" "}
          <code className="rounded bg-[#f3f4f6] px-1">
            &lt;span data-gaia=&quot;primary&quot;&gt;…&lt;/span&gt;
          </code>{" "}
          (también <code className="rounded bg-[#f3f4f6] px-1">secondary</code>,{" "}
          <code className="rounded bg-[#f3f4f6] px-1">tertiary</code>,{" "}
          <code className="rounded bg-[#f3f4f6] px-1">quaternary</code>). Ver README.
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Guardando…" : mode === "create" ? "Crear minitutorial" : "Actualizar"}
      </Button>
    </form>
  );
}
