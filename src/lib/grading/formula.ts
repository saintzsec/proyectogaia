/**
 * Configuración central de la fórmula Ruta A (MVP).
 * Pesos nominales; si falta un componente se renormaliza sobre los disponibles.
 */
export type GradeWeights = {
  quiz: number;
  evidence: number;
  performance: number;
  reflection: number;
};

/**
 * Pesos nominales de la nota sugerida (proyecto práctico > teórico).
 * Quiz ligero; evidencia, reflexión (qué se aprendió) y valoración de desempeño
 * entre integrantes (vía líder en Ruta A) con más peso.
 */
export const DEFAULT_GRADE_WEIGHTS: GradeWeights = {
  quiz: 0.12,
  evidence: 0.28,
  performance: 0.35,
  reflection: 0.25,
};

export const RUTA_A_FORMULA_VERSION = "ruta_a_v2";

/** @deprecated compat lectura snapshots antiguos */
export const LEGACY_FORMULA_VERSION = "mvp_v1";

export const PEER_DIMENSION_KEYS = [
  "participation",
  "responsibility",
  "collaboration",
  "contribution",
  "communication",
] as const;

export type PeerDimensionKey = (typeof PEER_DIMENSION_KEYS)[number];

/** Etiquetas UI (español) para los mismos keys guardados en JSON */
export const PEER_DIMENSION_LABELS_ES: Record<PeerDimensionKey, string> = {
  participation: "Participación",
  responsibility: "Responsabilidad",
  collaboration: "Colaboración",
  contribution: "Aporte al proyecto",
  communication: "Comunicación",
};

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Nota en escala 1.00 – 5.00 */
export function clamp15(n: number): number {
  return round2(Math.min(5, Math.max(1, n)));
}
