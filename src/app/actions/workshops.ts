"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  student_group_id: z.string().uuid(),
  title: z.string().min(2),
  kit_project_id: z.string().uuid().optional(),
  status: z.enum(["planned", "in_progress", "completed", "cancelled"]),
  attendance_count: z.coerce.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export async function createWorkshop(formData: FormData) {
  const { profile, supabase } = await requireUser();
  if (profile.role !== "docente") {
    return { error: "No autorizado." };
  }

  const parsed = schema.safeParse({
    student_group_id: formData.get("student_group_id"),
    title: formData.get("title"),
    kit_project_id: formData.get("kit_project_id") || undefined,
    status: formData.get("status") ?? "planned",
    attendance_count: formData.get("attendance_count") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: "Revisa los campos del taller." };
  }

  const { data: group } = await supabase
    .from("student_groups")
    .select("id, teacher_id")
    .eq("id", parsed.data.student_group_id)
    .maybeSingle();

  const { data: teacherRow } = await supabase
    .from("teachers")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!group || !teacherRow || group.teacher_id !== teacherRow.id) {
    return { error: "No puedes registrar talleres para ese grupo." };
  }

  const completed_at =
    parsed.data.status === "completed" ? new Date().toISOString() : null;

  const { error } = await supabase.from("workshops").insert({
    student_group_id: parsed.data.student_group_id,
    kit_project_id: parsed.data.kit_project_id ?? null,
    title: parsed.data.title,
    status: parsed.data.status,
    attendance_count: parsed.data.attendance_count ?? null,
    notes: parsed.data.notes ?? null,
    completed_at,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/docente/talleres");
  revalidatePath("/docente");
  return { ok: true as const };
}
