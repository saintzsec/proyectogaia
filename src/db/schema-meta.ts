/**
 * Fase 1 — inventario del modelo lógico (la fuente de verdad es la migración SQL).
 * @see ../../supabase/migrations/20260401000000_initial_schema.sql
 */

export const SCHEMA_TABLES = [
  { table: "profiles", note: "Perfil y rol (admin_gaia | docente) por auth.users" },
  { table: "schools", note: "Colegios del piloto" },
  { table: "teachers", note: "Vincula perfil docente ↔ colegio" },
  { table: "student_groups", note: "Grupos de estudiantes por docente y colegio" },
  { table: "kit_projects", note: "Kits; tutorial_video_url (YouTube embebido), tutorial_url opcional" },
  { table: "workshops", note: "Talleres registrados por grupo" },
  { table: "rubrics", note: "Rúbricas por kit o genéricas" },
  { table: "rubric_criteria", note: "Criterios puntuables" },
  { table: "evaluations", note: "Evaluación por grupo / taller" },
  { table: "evaluation_scores", note: "Puntaje por criterio" },
  { table: "tutorials", note: "Minitutoriales (title, slug, content_md, video_url, kit)" },
  { table: "content_resources", note: "Biblioteca de recursos" },
  { table: "evidence_files", note: "Metadatos de archivos en Storage" },
  { table: "pilot_metrics", note: "Indicadores agregados del piloto" },
  { table: "attendance_records", note: "Registro detallado de asistencia (opcional)" },
] as const;
