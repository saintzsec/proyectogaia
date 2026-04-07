/**
 * Tipos alineados al esquema inicial GAIA (MVP).
 * Para tipado estricto con Supabase, sustituir por tipos generados: supabase gen types.
 */

export type AppRole = "admin_gaia" | "docente";

export type ProfileRow = {
  id: string;
  full_name: string | null;
  role: AppRole;
  locale: string;
  created_at: string;
  updated_at: string;
};

export type SchoolRow = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type TeacherRow = {
  id: string;
  profile_id: string;
  school_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type StudentGroupRow = {
  id: string;
  school_id: string;
  teacher_id: string;
  name: string;
  grade_level: string | null;
  academic_year: string;
  student_count_estimate: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type KitProjectRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  learning_objective: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type WorkshopStatus = "planned" | "in_progress" | "completed" | "cancelled";

export type WorkshopRow = {
  id: string;
  student_group_id: string;
  kit_project_id: string | null;
  title: string;
  status: WorkshopStatus;
  attendance_count: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};
