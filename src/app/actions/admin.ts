"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

function assertAdmin(role: string) {
  if (role !== "admin_gaia") {
    throw new Error("Solo administradores GAIA.");
  }
}

const schoolSchema = z.object({
  name: z.string().min(2),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

const schoolIdSchema = z.object({
  school_id: z.string().uuid(),
});

const updateSchoolSchema = z.object({
  school_id: z.string().uuid(),
  name: z.string().min(2),
  city: z.string().optional(),
  country: z.string().optional(),
});

export async function createSchool(formData: FormData) {
  const { profile, supabase } = await requireUser();
  assertAdmin(profile.role);

  const parsed = schoolSchema.safeParse({
    name: formData.get("name"),
    city: formData.get("city") || undefined,
    country: formData.get("country") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: "Nombre del colegio obligatorio." };
  }

  const { error } = await supabase.from("schools").insert({
    name: parsed.data.name,
    city: parsed.data.city ?? null,
    country: parsed.data.country ?? "Chile",
    notes: parsed.data.notes ?? null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/colegios");
  return { ok: true as const };
}

export async function updateSchool(formData: FormData) {
  const { profile, supabase } = await requireUser();
  assertAdmin(profile.role);

  const parsed = updateSchoolSchema.safeParse({
    school_id: formData.get("school_id"),
    name: formData.get("name"),
    city: formData.get("city") || undefined,
    country: formData.get("country") || undefined,
  });

  if (!parsed.success) {
    return { error: "Datos del colegio inválidos." };
  }

  const { error } = await supabase
    .from("schools")
    .update({
      name: parsed.data.name,
      city: parsed.data.city ?? null,
      country: parsed.data.country ?? null,
    })
    .eq("id", parsed.data.school_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/colegios");
  return { ok: true as const };
}

export async function deleteSchool(formData: FormData) {
  const { profile, supabase } = await requireUser();
  assertAdmin(profile.role);

  const parsed = schoolIdSchema.safeParse({
    school_id: formData.get("school_id"),
  });

  if (!parsed.success) {
    return { error: "Colegio inválido." };
  }

  const { error } = await supabase.from("schools").delete().eq("id", parsed.data.school_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/colegios");
  return { ok: true as const };
}

const teacherSchema = z.object({
  profile_id: z.string().uuid(),
  school_id: z.string().uuid(),
});

const teacherLinkSchema = z.object({
  teacher_id: z.string().uuid(),
});

const updateTeacherSchoolSchema = z.object({
  teacher_id: z.string().uuid(),
  school_id: z.string().uuid(),
});

const adminGroupSchema = z.object({
  name: z.string().min(2),
  school_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  grade_level: z.string().optional(),
  academic_year: z.string().min(4),
});

const updateAdminGroupSchema = z.object({
  group_id: z.string().uuid(),
  name: z.string().min(2),
  school_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  grade_level: z.string().optional(),
  academic_year: z.string().min(4),
});

const adminGroupIdSchema = z.object({
  group_id: z.string().uuid(),
});

export async function assignTeacher(formData: FormData) {
  const { profile, supabase } = await requireUser();
  assertAdmin(profile.role);

  const parsed = teacherSchema.safeParse({
    profile_id: formData.get("profile_id"),
    school_id: formData.get("school_id"),
  });

  if (!parsed.success) {
    return { error: "Selecciona perfil y colegio válidos." };
  }

  const { error } = await supabase.from("teachers").insert({
    profile_id: parsed.data.profile_id,
    school_id: parsed.data.school_id,
    active: true,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/docentes");
  return { ok: true as const };
}

export async function updateTeacherSchool(formData: FormData) {
  const { profile, supabase } = await requireUser();
  assertAdmin(profile.role);

  const parsed = updateTeacherSchoolSchema.safeParse({
    teacher_id: formData.get("teacher_id"),
    school_id: formData.get("school_id"),
  });

  if (!parsed.success) {
    return { error: "Vinculación inválida." };
  }

  const { error } = await supabase
    .from("teachers")
    .update({ school_id: parsed.data.school_id })
    .eq("id", parsed.data.teacher_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/docentes");
  return { ok: true as const };
}

export async function deleteTeacherLink(formData: FormData) {
  const { profile, supabase } = await requireUser();
  assertAdmin(profile.role);

  const parsed = teacherLinkSchema.safeParse({
    teacher_id: formData.get("teacher_id"),
  });

  if (!parsed.success) {
    return { error: "Docente inválido." };
  }

  const { error } = await supabase.from("teachers").delete().eq("id", parsed.data.teacher_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/docentes");
  return { ok: true as const };
}

export async function createAdminGroup(formData: FormData) {
  const { profile, supabase } = await requireUser();
  assertAdmin(profile.role);

  const parsed = adminGroupSchema.safeParse({
    name: formData.get("name"),
    school_id: formData.get("school_id"),
    teacher_id: formData.get("teacher_id"),
    grade_level: formData.get("grade_level") || undefined,
    academic_year: formData.get("academic_year"),
  });

  if (!parsed.success) {
    return { error: "Datos del grupo inválidos." };
  }

  const { error } = await supabase.from("student_groups").insert({
    name: parsed.data.name,
    school_id: parsed.data.school_id,
    teacher_id: parsed.data.teacher_id,
    grade_level: parsed.data.grade_level ?? null,
    academic_year: parsed.data.academic_year,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/grupos");
  return { ok: true as const };
}

export async function updateAdminGroup(formData: FormData) {
  const { profile, supabase } = await requireUser();
  assertAdmin(profile.role);

  const parsed = updateAdminGroupSchema.safeParse({
    group_id: formData.get("group_id"),
    name: formData.get("name"),
    school_id: formData.get("school_id"),
    teacher_id: formData.get("teacher_id"),
    grade_level: formData.get("grade_level") || undefined,
    academic_year: formData.get("academic_year"),
  });

  if (!parsed.success) {
    return { error: "Datos del grupo inválidos." };
  }

  const { error } = await supabase
    .from("student_groups")
    .update({
      name: parsed.data.name,
      school_id: parsed.data.school_id,
      teacher_id: parsed.data.teacher_id,
      grade_level: parsed.data.grade_level ?? null,
      academic_year: parsed.data.academic_year,
    })
    .eq("id", parsed.data.group_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/grupos");
  return { ok: true as const };
}

export async function deleteAdminGroup(formData: FormData) {
  const { profile, supabase } = await requireUser();
  assertAdmin(profile.role);

  const parsed = adminGroupIdSchema.safeParse({
    group_id: formData.get("group_id"),
  });

  if (!parsed.success) {
    return { error: "Grupo inválido." };
  }

  const { error } = await supabase.from("student_groups").delete().eq("id", parsed.data.group_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/grupos");
  return { ok: true as const };
}

const metricSchema = z.object({
  metric_key: z.string().min(2),
  metric_value: z.coerce.number(),
  metric_date: z.string().optional(),
});

export async function upsertPilotMetric(formData: FormData) {
  const { profile, supabase } = await requireUser();
  assertAdmin(profile.role);

  const parsed = metricSchema.safeParse({
    metric_key: formData.get("metric_key"),
    metric_value: formData.get("metric_value"),
    metric_date: formData.get("metric_date") || undefined,
  });

  if (!parsed.success) {
    return { error: "Indicador inválido." };
  }

  const metric_date = parsed.data.metric_date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);

  const { error } = await supabase.from("pilot_metrics").upsert(
    {
      metric_key: parsed.data.metric_key,
      metric_value: parsed.data.metric_value,
      metric_date,
      created_by: profile.id,
      metadata: {},
    },
    { onConflict: "metric_date,metric_key" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/metricas");
  return { ok: true as const };
}

const promoteSchema = z.object({
  profile_id: z.string().uuid(),
});

export async function promoteToAdmin(formData: FormData) {
  const { profile, supabase } = await requireUser();
  assertAdmin(profile.role);

  const parsed = promoteSchema.safeParse({
    profile_id: formData.get("profile_id"),
  });

  if (!parsed.success) {
    return { error: "UUID inválido." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: "admin_gaia" })
    .eq("id", parsed.data.profile_id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
  return { ok: true as const };
}
