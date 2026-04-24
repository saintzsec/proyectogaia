"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

function mapKitSaveError(message: string): string {
  if (/quiz_questions/i.test(message) && /schema cache|column/i.test(message)) {
    return (
      "Falta la columna quiz_questions en Supabase. Ejecuta en SQL Editor: " +
      "ALTER TABLE public.kit_projects ADD COLUMN IF NOT EXISTS quiz_questions jsonb;"
    );
  }
  if (/tutorial_video_url/i.test(message) && /schema cache|column/i.test(message)) {
    return (
      "Falta la columna tutorial_video_url en Supabase. En el SQL Editor ejecuta la migración " +
      "20260404120000_kit_tutorial_video_url.sql (o: ALTER TABLE public.kit_projects ADD COLUMN IF NOT EXISTS " +
      "tutorial_video_url text;). Espera unos segundos y vuelve a guardar."
    );
  }
  return message;
}

const quizQuestionSchema = z.object({
  question: z.string().min(5),
  options: z.array(z.string().min(1)).min(2),
  correctIndex: z.number().int().min(0),
});

const updateProjectQuizSchema = z.object({
  kit_project_id: z.string().uuid(),
  questions: z.array(quizQuestionSchema).min(1),
});

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
  related_tutorial_ids: z.preprocess(
    (v) => {
      if (v === "" || v === undefined || v === null) return [];
      if (typeof v !== "string") return [];
      try {
        const parsed = JSON.parse(v);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    },
    z.array(z.string().uuid()).optional(),
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

  const orderedTutorialIds = d.related_tutorial_ids ?? [];
  const { data: currentlyLinked } = await supabase
    .from("tutorials")
    .select("id")
    .eq("kit_project_id", d.id);
  const currentlyLinkedIds = (currentlyLinked ?? []).map((t) => t.id);
  const toUnlink = currentlyLinkedIds.filter((id) => !orderedTutorialIds.includes(id));

  if (toUnlink.length > 0) {
    const { error: unlinkError } = await supabase
      .from("tutorials")
      .update({ kit_project_id: null })
      .in("id", toUnlink);
    if (unlinkError) return { error: unlinkError.message };
  }

  for (let idx = 0; idx < orderedTutorialIds.length; idx += 1) {
    const tutorialId = orderedTutorialIds[idx];
    const { error: linkError } = await supabase
      .from("tutorials")
      .update({ kit_project_id: d.id, sort_order: idx + 1 })
      .eq("id", tutorialId);
    if (linkError) return { error: linkError.message };
  }

  revalidatePath("/admin/proyectos");
  revalidatePath(`/admin/proyectos/${d.id}`);
  revalidatePath("/admin/tutoriales");
  revalidatePath("/proyectos");
  revalidatePath(`/proyectos/${d.slug}`);
  revalidatePath("/docente/proyectos");
  revalidatePath(`/docente/proyectos/${d.slug}`);
  revalidatePath("/minitutoriales");
  revalidatePath("/docente/tutoriales");
  return { ok: true as const };
}

export async function updateKitProjectQuiz(formData: FormData) {
  const { profile, supabase } = await requireUser();
  if (profile.role !== "admin_gaia") {
    return { error: "Solo administración GAIA." };
  }

  const raw = Object.fromEntries(formData.entries());
  let questionsRaw: unknown = [];
  try {
    questionsRaw = JSON.parse(String(raw.questions ?? "[]"));
  } catch {
    return { error: "Formato de preguntas inválido." };
  }

  const parsed = updateProjectQuizSchema.safeParse({
    kit_project_id: raw.kit_project_id,
    questions: questionsRaw,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const normalized = parsed.data.questions.map((q) => ({
    question: q.question.trim(),
    options: q.options.map((o) => o.trim()),
    correctIndex: q.correctIndex,
  }));

  for (const q of normalized) {
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      return { error: `Índice correcto inválido en: "${q.question}"` };
    }
  }

  const { data: kitRow } = await supabase
    .from("kit_projects")
    .select("slug")
    .eq("id", parsed.data.kit_project_id)
    .maybeSingle();

  const { error } = await supabase
    .from("kit_projects")
    .update({ quiz_questions: normalized })
    .eq("id", parsed.data.kit_project_id);

  if (error) return { error: mapKitSaveError(error.message) };

  revalidatePath("/admin/rubricas");
  revalidatePath("/admin/proyectos");
  revalidatePath("/clase");
  revalidatePath("/proyectos");
  if (kitRow?.slug) revalidatePath(`/proyectos/${kitRow.slug}`);
  return { ok: true as const };
}
