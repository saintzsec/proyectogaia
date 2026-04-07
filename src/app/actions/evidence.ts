"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const schema = z.object({
  student_group_id: z.string().uuid(),
  workshop_id: z.string().uuid().optional(),
  title: z.string().optional(),
});

export async function uploadEvidence(formData: FormData) {
  const { profile, supabase } = await requireUser();
  if (profile.role !== "docente") {
    return { error: "No autorizado." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona un archivo." };
  }

  const parsed = schema.safeParse({
    student_group_id: formData.get("student_group_id"),
    workshop_id: formData.get("workshop_id") || undefined,
    title: formData.get("title") || undefined,
  });

  if (!parsed.success) {
    return { error: "Datos inválidos." };
  }

  const { data: teacherRow } = await supabase
    .from("teachers")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  const { data: group } = await supabase
    .from("student_groups")
    .select("id, teacher_id")
    .eq("id", parsed.data.student_group_id)
    .maybeSingle();

  if (!teacherRow || !group || group.teacher_id !== teacherRow.id) {
    return { error: "No puedes subir evidencias para ese grupo." };
  }

  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${parsed.data.student_group_id}/${randomUUID()}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabase.storage.from("evidencias").upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (upErr) {
    return {
      error:
        upErr.message +
        " (¿Creaste el bucket «evidencias» y políticas en Supabase Storage? Ver README.)",
    };
  }

  const { error: insErr } = await supabase.from("evidence_files").insert({
    student_group_id: parsed.data.student_group_id,
    workshop_id: parsed.data.workshop_id ?? null,
    uploaded_by: profile.id,
    storage_path: path,
    title: parsed.data.title ?? file.name,
    mime_type: file.type || null,
  });

  if (insErr) {
    return { error: insErr.message };
  }

  revalidatePath("/docente/evidencias");
  return { ok: true as const };
}
