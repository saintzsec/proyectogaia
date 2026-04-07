"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { groupFormSchema } from "@/lib/validations/group";

export async function createStudentGroup(formData: FormData) {
  const { profile, supabase } = await requireUser();
  if (profile.role !== "docente") {
    return { error: "Solo docentes pueden crear grupos desde este formulario." };
  }

  const parsed = groupFormSchema.safeParse({
    name: formData.get("name"),
    grade_level: formData.get("grade_level") || undefined,
    student_count_estimate: formData.get("student_count_estimate") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    const msg =
      parsed.error.flatten().fieldErrors.name?.[0] ??
      Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] ??
      "Datos inválidos";
    return { error: msg };
  }

  const { data: teacher, error: te } = await supabase
    .from("teachers")
    .select("id, school_id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (te || !teacher) {
    return { error: "Tu usuario aún no está vinculado como docente. Contacta al administrador GAIA." };
  }

  const { error } = await supabase.from("student_groups").insert({
    name: parsed.data.name,
    grade_level: parsed.data.grade_level ?? null,
    student_count_estimate: parsed.data.student_count_estimate ?? null,
    notes: parsed.data.notes ?? null,
    school_id: teacher.school_id,
    teacher_id: teacher.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/docente/grupos");
  revalidatePath("/docente");
  return { ok: true as const };
}
