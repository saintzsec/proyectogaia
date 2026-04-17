/**
 * Fase 2 — navegación centralizada (sitio público, docente, admin).
 * Las rutas deben coincidir con `src/app/**`.
 */

export type NavItem = { href: string; label: string; external?: boolean };

export const PUBLIC_MAIN_NAV: NavItem[] = [
  { href: "/sobre", label: "Sobre GAIA" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/recursos", label: "Recursos" },
  { href: "/minitutoriales", label: "Minitutoriales" },
  { href: "/impacto", label: "Impacto" },
  { href: "/contacto", label: "Contacto" },
];

/** Enlaces útiles dentro del panel docente (recursos públicos). */
export const DOCENTE_DASHBOARD_NAV: NavItem[] = [
  { href: "/docente", label: "Resumen" },
  { href: "/docente/clases", label: "Clases" },
  { href: "/docente/grupos", label: "Grupos" },
  { href: "/docente/talleres", label: "Talleres" },
  { href: "/docente/proyectos", label: "Proyectos" },
  { href: "/docente/tutoriales", label: "Tutoriales" },
  { href: "/docente/rubricas", label: "Rúbricas" },
  { href: "/docente/evaluaciones", label: "Evaluaciones" },
  { href: "/docente/evidencias", label: "Evidencias" },
  { href: "/minitutoriales", label: "Minitutoriales" },
  { href: "/recursos", label: "Recursos" },
];

export const ADMIN_DASHBOARD_NAV: NavItem[] = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/colegios", label: "Colegios" },
  { href: "/admin/docentes", label: "Docentes" },
  { href: "/admin/grupos", label: "Grupos" },
  { href: "/admin/proyectos", label: "Proyectos / kits" },
  { href: "/admin/tutoriales", label: "Minitutoriales" },
  { href: "/admin/rubricas", label: "Rúbricas" },
  { href: "/admin/metricas", label: "Métricas piloto" },
];
