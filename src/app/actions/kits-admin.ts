"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

function mapKitSaveError(message: string): string {
  if (/tutorial_video_url/i.test(message) && /schema cache|column/i.test(message)) {
    return (
      "Falta la columna tutorial_video_url en Supabase. En el SQL Editor ejecuta la migración " +
      "20260404120000_kit_tutorial_video_url.sql (o: ALTER TABLE public.kit_projects ADD COLUMN IF NOT EXISTS " +
      "tutorial_video_url text;). Espera unos segundos y vuelve a guardar."
    );
  }
  return message;
}

const kitFieldsSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug: minúsculas y guiones"),
  short_description: z.string().optional(),
  description: z.string().optional(),
  learning_objective: z.string().optional(),
  materials_md: z.string().optional(),
  steps_md: z.string().optional(),
  common_errors_md: z.string().optional(),
  sustainability_md: z.string().optional(),
  what_you_learn_md: z.string().optional(),
  tutorial_url: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.string().optional(),
  ),
  tutorial_video_url: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.string().url().optional(),
  ),
  is_published: z.enum(["true", "false"]),
});

const kitUpdateSchema = kitFieldsSchema.extend({
  id: z.string().uuid(),
});

const kitCreateSchema = kitFieldsSchema;

export async function createKitProject(formData: FormData) {
  const { profile, supabase } = await requireUser();
  if (profile.role !== "admin_gaia") {
    return { error: "Solo administración GAIA." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = kitCreateSchema.safeParse({
    ...raw,
    is_published: String(raw.is_published ?? "false"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const d = parsed.data;
  const { data, error } = await supabase
    .from("kit_projects")
    .insert({
      name: d.name,
      slug: d.slug,
      short_description: d.short_description || null,
      description: d.description || null,
      learning_objective: d.learning_objective || null,
      materials_md: d.materials_md || null,
      steps_md: d.steps_md || null,
      common_errors_md: d.common_errors_md || null,
      sustainability_md: d.sustainability_md || null,
      what_you_learn_md: d.what_you_learn_md || null,
      tutorial_url: d.tutorial_url || null,
      tutorial_video_url: d.tutorial_video_url || null,
      is_published: d.is_published === "true",
    })
    .select("id")
    .single();

  if (error) {
    return { error: mapKitSaveError(error.message) };
  }

  revalidatePath("/admin/proyectos");
  revalidatePath("/proyectos");
  revalidatePath("/docente/proyectos");
  return { ok: true as const, id: data.id };
}

export async function updateKitProject(formData: FormData) {
  const { profile, supabase } = await requireUser();
  if (profile.role !== "admin_gaia") {
    return { error: "Solo administración GAIA." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = kitUpdateSchema.safeParse({
    ...raw,
    is_published: String(raw.is_published ?? "false"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const d = parsed.data;
  const { error } = await supabase
    .from("kit_projects")
    .update({
      name: d.name,
      slug: d.slug,
      short_description: d.short_description || null,
      description: d.description || null,
      learning_objective: d.learning_objective || null,
      materials_md: d.materials_md || null,
      steps_md: d.steps_md || null,
      common_errors_md: d.common_errors_md || null,
      sustainability_md: d.sustainability_md || null,
      what_you_learn_md: d.what_you_learn_md || null,
      tutorial_url: d.tutorial_url || null,
      tutorial_video_url: d.tutorial_video_url || null,
      is_published: d.is_published === "true",
    })
    .eq("id", d.id);

  if (error) {
    return { error: mapKitSaveError(error.message) };
  }

  revalidatePath("/admin/proyectos");
  revalidatePath(`/admin/proyectos/${d.id}`);
  revalidatePath("/proyectos");
  revalidatePath(`/proyectos/${d.slug}`);
  revalidatePath("/docente/proyectos");
  revalidatePath(`/docente/proyectos/${d.slug}`);
  return { ok: true as const };
}
