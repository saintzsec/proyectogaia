/**
 * Fase 1 — referencia en código (sitemap y módulos).
 * Esquema SQL canónico: `supabase/migrations/20260401000000_initial_schema.sql`
 */

export const SITEMAP_PUBLIC = [
  "/",
  "/sobre",
  "/que-hacemos",
  "/como-funciona",
  "/proyectos",
  "/recursos",
  "/minitutoriales",
  "/impacto",
  "/contacto",
] as const;

export const SITEMAP_AUTH = [
  "/login",
  "/login/forgot",
  "/registro",
  "/auth/callback",
  "/auth/post-login",
] as const;

export const SITEMAP_DOCENTE = [
  "/docente",
  "/docente/grupos",
  "/docente/talleres",
  "/docente/proyectos",
  "/docente/tutoriales",
  "/docente/rubricas",
  "/docente/evaluaciones",
  "/docente/evidencias",
] as const;

export const SITEMAP_ADMIN = [
  "/admin",
  "/admin/colegios",
  "/admin/docentes",
  "/admin/grupos",
  "/admin/proyectos",
  "/admin/proyectos/nuevo",
  "/admin/tutoriales",
  "/admin/rubricas",
  "/admin/metricas",
] as const;

export const MVP_MODULES = [
  { id: "public", name: "Sitio público", routes: "SITEMAP_PUBLIC" },
  { id: "auth", name: "Autenticación Supabase", routes: "SITEMAP_AUTH" },
  { id: "docente", name: "Dashboard docente", routes: "SITEMAP_DOCENTE" },
  { id: "admin", name: "Dashboard administrador GAIA", routes: "SITEMAP_ADMIN" },
  { id: "data", name: "Postgres + RLS + Storage", routes: "migrations/*.sql" },
] as const;
