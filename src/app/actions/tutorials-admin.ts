"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const tutorialCreateSchema = z.object({
  kit_project_id: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.string().uuid().optional(),
  ),
  title: z.string().min(2),
  slug: z.string().min(2).regex(slugRegex, "Slug: minúsculas y guiones"),
  description: z.string().optional(),
  content_md: z.string().optional(),
  video_url: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().url().optional(),
  ),
  duration_min: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.coerce.number().int().min(0).optional(),
  ),
  sort_order: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? 0 : v),
    z.coerce.number().int().min(0),
  ),
  is_public: z.enum(["true", "false"]),
});

export async function createTutorial(formData: FormData) {
  const { profile, supabase } = await requireUser();
  if (profile.role !== "admin_gaia") {
    return { error: "Solo administración GAIA." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = tutorialCreateSchema.safeParse({
    ...raw,
    is_public: String(raw.is_public ?? "true"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const d = parsed.data;
  const { error } = await supabase.from("tutorials").insert({
    kit_project_id: d.kit_project_id ?? null,
    title: d.title,
    slug: d.slug,
    description: d.description || null,
    content_md: d.content_md || null,
    video_url: d.video_url || null,
    duration_min: d.duration_min ?? null,
    sort_order: d.sort_order,
    is_public: d.is_public === "true",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/tutoriales");
  revalidatePath("/minitutoriales");
  return { ok: true as const };
}

const tutorialUpdateSchema = tutorialCreateSchema.extend({
  id: z.string().uuid(),
});

export async function updateTutorial(formData: FormData) {
  const { profile, supabase } = await requireUser();
  if (profile.role !== "admin_gaia") {
    return { error: "Solo administración GAIA." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = tutorialUpdateSchema.safeParse({
    ...raw,
    is_public: String(raw.is_public ?? "true"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const d = parsed.data;
  const { error } = await supabase
    .from("tutorials")
    .update({
      kit_project_id: d.kit_project_id ?? null,
      title: d.title,
      slug: d.slug,
      description: d.description || null,
      content_md: d.content_md || null,
      video_url: d.video_url || null,
      duration_min: d.duration_min ?? null,
      sort_order: d.sort_order,
      is_public: d.is_public === "true",
    })
    .eq("id", d.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/tutoriales");
  revalidatePath(`/admin/tutoriales/${d.id}`);
  revalidatePath("/minitutoriales");
  revalidatePath(`/minitutoriales/${d.slug}`);
  return { ok: true as const };
}
