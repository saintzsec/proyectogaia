/**
 * Etiquetas para flags booleanos de `group_grade_snapshots.flags` (excluye `effective_shares`).
 */
export const DATA_WARNING_LABELS_ES: Record<string, string> = {
  quiz_missing: "Quiz sin responder",
  evidence_incomplete: "Falta evidencia (archivos)",
  reflection_missing: "Reflexión / resumen ausente",
  reflection_weak: "Reflexión breve (revisar)",
  performance_incomplete: "Faltan valoraciones del líder para algún integrante",
  performance_low_confidence: "Valoraciones de desempeño incompletas (dato sesgado)",
  weights_renormalized: "Pesos renormalizados por componentes faltantes",
  single_member_group: "Un solo integrante: sin comparación de desempeño",
};

export function snapshotBooleanWarningEntries(flags: unknown): [string, true][] {
  if (!flags || typeof flags !== "object") return [];
  const o = flags as Record<string, unknown>;
  return Object.entries(o).filter(
    ([k, v]) => k !== "effective_shares" && v === true,
  ) as [string, true][];
}

export function snapshotHasDataWarnings(flags: unknown): boolean {
  return snapshotBooleanWarningEntries(flags).length > 0;
}

export function snapshotWarningCount(flags: unknown): number {
  return snapshotBooleanWarningEntries(flags).length;
}
