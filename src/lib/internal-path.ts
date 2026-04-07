/**
 * Evita redirecciones abiertas: solo rutas internas relativas.
 */
export function sanitizeInternalNext(path: string | null | undefined): string | null {
  if (path == null || typeof path !== "string") return null;
  const t = path.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return null;
  if (t.includes("@") || /[\s\\]/.test(t)) return null;
  const lower = t.toLowerCase();
  if (lower.startsWith("/javascript:") || lower.startsWith("/data:")) return null;
  return t;
}
