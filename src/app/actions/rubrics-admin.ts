"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const rubricUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  version: z.coerce.number().int().min(1),
  kit_project_id: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.string().uuid().optional(),
  ),
  is_active: z.enum(["true", "false"]),
});

const rubricCreateSchema = z.object({
  name: z.string().min(2),
  version: z.coerce.number().int().min(1),
  kit_project_id: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : v),
    z.string().uuid().optional(),
  ),
  is_active: z.enum(["true", "false"]),
});

export async function createRubric(formData: FormData) {
  const { profile, supabase } = await requireUser();
  if (profile.role !== "admin_gaia") {
    return { error: "Solo administración GAIA." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = rubricCreateSchema.safeParse({
    ...raw,
    is_active: String(raw.is_active ?? "true"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const d = parsed.data;
  const { error } = await supabase.from("rubrics").insert({
    name: d.name,
    version: d.version,
    kit_project_id: d.kit_project_id ?? null,
    is_active: d.is_active === "true",
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/rubricas");
  revalidatePath("/docente/rubricas");
  revalidatePath("/docente/evaluaciones");
  return { ok: true as const };
}

export async function updateRubric(formData: FormData) {
  const { profile, supabase } = await requireUser();
  if (profile.role !== "admin_gaia") {
    return { error: "Solo administración GAIA." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = rubricUpdateSchema.safeParse({
    ...raw,
    is_active: String(raw.is_active ?? "true"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const d = parsed.data;
  const { error } = await supabase
    .from("rubrics")
    .update({
      name: d.name,
      version: d.version,
      kit_project_id: d.kit_project_id ?? null,
      is_active: d.is_active === "true",
    })
    .eq("id", d.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/rubricas");
  revalidatePath(`/admin/rubricas/${d.id}`);
  revalidatePath("/admin/proyectos");
  revalidatePath("/clase");
  revalidatePath("/docente/rubricas");
  revalidatePath("/docente/evaluaciones");
  return { ok: true as const };
}

const criterionSchema = z.object({
  rubric_id: z.string().uuid(),
  label: z.string().min(2),
  description: z.string().optional(),
  max_score: z.coerce.number().int().min(1).max(20),
  sort_order: z.coerce.number().int().min(0),
});

export async function createRubricCriterion(formData: FormData) {
  const { profile, supabase } = await requireUser();
  if (profile.role !== "admin_gaia") {
    return { error: "Solo administración GAIA." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = criterionSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const d = parsed.data;
  const { error } = await supabase.from("rubric_criteria").insert({
    rubric_id: d.rubric_id,
    label: d.label,
    description: d.description || null,
    max_score: d.max_score,
    sort_order: d.sort_order,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/rubricas");
  revalidatePath(`/admin/rubricas/${d.rubric_id}`);
  revalidatePath("/docente/rubricas");
  revalidatePath("/docente/evaluaciones");
  return { ok: true as const };
}
