"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const createSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional(),
  kit_project_id: z.string().uuid(),
});

export async function createTeachingClass(formData: FormData) {
  const { profile, supabase } = await requireUser();
  if (profile.role !== "docente") {
    return { error: "Solo docentes." };
  }

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    kit_project_id: formData.get("kit_project_id"),
  });
  if (!parsed.success) {
    return { error: "Revisa nombre y proyecto." };
  }

  const { data: teacher, error: te } = await supabase
    .from("teachers")
    .select("id, school_id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (te || !teacher) {
    return { error: "Sin registro docente." };
  }

  const { generateJoinCodeCandidate } = await import("@/lib/classes/join-code");

  /**
   * No usamos service role aquí: el docente no puede listar códigos ajenos por RLS.
   * Generamos candidatos y dejamos que el índice único `classes_join_code_unique` garantice
   * unicidad global; ante colisión (23505) reintentamos.
   */
  const payloadBase = {
    teacher_id: teacher.id,
    school_id: teacher.school_id,
    kit_project_id: parsed.data.kit_project_id,
    name: parsed.data.name.trim(),
    description: parsed.data.description?.trim() || null,
    status: "active" as const,
  };

  let lastError: string | null = null;
  for (let attempt = 0; attempt < 40; attempt++) {
    const join_code = generateJoinCodeCandidate();
    const { data: row, error: ins } = await supabase
      .from("classes")
      .insert({
        ...payloadBase,
        join_code,
      })
      .select("id")
      .single();

    if (!ins && row) {
      revalidatePath("/docente/clases");
      revalidatePath("/docente");
      return { ok: true as const, id: row.id, join_code };
    }

    const uniqueViolation =
      ins?.code === "23505" ||
      (ins?.message?.toLowerCase().includes("duplicate") ?? false);
    if (uniqueViolation) {
      lastError = ins.message;
      continue;
    }

    return { error: ins?.message ?? "No se pudo crear la clase." };
  }

  return {
    error:
      lastError ??
      "No se pudo obtener un código de clase único tras varios intentos. Vuelve a intentar.",
  };

}

const statusSchema = z.object({
  class_id: z.string().uuid(),
  status: z.enum(["active", "closed", "archived"]),
});

export async function updateClassStatus(formData: FormData) {
  const { profile, supabase } = await requireUser();
  if (profile.role !== "docente") return { error: "No autorizado." };

  const parsed = statusSchema.safeParse({
    class_id: formData.get("class_id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "Datos inválidos." };

  const { error } = await supabase
    .from("classes")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.class_id);

  if (error) return { error: error.message };

  revalidatePath("/docente/clases");
  revalidatePath(`/docente/clases/${parsed.data.class_id}`);
  return { ok: true as const };
}
