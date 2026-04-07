/**
 * Motor de calificación sugerida — MVP Ruta A (solo el líder registra valoraciones de compañeros).
 * La nota es orientativa; el docente decide la definitiva.
 */

import {
  clamp15,
  DEFAULT_GRADE_WEIGHTS,
  PEER_DIMENSION_KEYS,
  RUTA_A_FORMULA_VERSION,
  round2,
  type GradeWeights,
  type PeerDimensionKey,
} from "@/lib/grading/formula";

export type PeerEvalRow = {
  evaluator_member_id: string;
  evaluatee_member_id: string;
  scores: Record<string, unknown>;
};

/** Máximo desplazamiento individual respecto a la nota grupal (±) */
export const MAX_INDIVIDUAL_ADJUSTMENT = 0.75;
/** Sensibilidad: cuánto mueve 1 punto de diferencia vs el promedio del grupo en desempeño */
export const INDIVIDUAL_SENSITIVITY = 0.28;

export type ComponentKey = "quiz" | "evidence" | "performance" | "reflection";

export type RutaAGradeFlags = {
  quiz_missing?: boolean;
  evidence_incomplete?: boolean;
  reflection_missing?: boolean;
  reflection_weak?: boolean;
  performance_incomplete?: boolean;
  performance_low_confidence?: boolean;
  weights_renormalized?: boolean;
  single_member_group?: boolean;
  /** Fracción efectiva usada al ponderar (suma = 1 cuando hay al menos un componente) */
  effective_shares?: Partial<Record<ComponentKey, number>>;
};

export type RutaAComputedSnapshot = {
  formula_version: string;
  weights: GradeWeights;
  component_quiz: number | null;
  component_evidence: number | null;
  component_peer_group: number | null;
  component_self_group: number | null;
  component_peer_by_member: Record<string, number | null>;
  proposed_group_grade: number;
  proposed_member_grades: Record<string, number>;
  flags: RutaAGradeFlags;
};

function avgLikertDimensions(scores: Record<string, unknown>): number | null {
  const vals: number[] = [];
  for (const k of PEER_DIMENSION_KEYS) {
    const v = scores[k as PeerDimensionKey];
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n) || n < 1 || n > 5) continue;
    vals.push(n);
  }
  if (!vals.length) return null;
  return round2(vals.reduce((a, b) => a + b, 0) / vals.length);
}

/** A. Quiz ya normalizado 1–5 por intento grupal */
export function calculateQuizScore1to5(
  scoreOnScale1to5: number | null | undefined,
): { value: number | null; missing: boolean } {
  if (scoreOnScale1to5 == null || !Number.isFinite(Number(scoreOnScale1to5))) {
    return { value: null, missing: true };
  }
  return { value: clamp15(Number(scoreOnScale1to5)), missing: false };
}

/**
 * B. Evidencia de entrega (fotos/archivos), sin mezclar el texto del resumen.
 * Sin archivos → componente ausente (renormalizar), no imputar nota alta.
 */
export function calculateEvidenceDeliveryScore1to5(fileCount: number): {
  value: number | null;
  incomplete: boolean;
} {
  if (fileCount < 1) {
    return { value: null, incomplete: true };
  }
  let s = 2.4;
  if (fileCount >= 1) s += 0.55;
  if (fileCount >= 2) s += 0.55;
  if (fileCount >= 4) s += 0.5;
  return { value: clamp15(s), incomplete: false };
}

/**
 * D. Reflexión / aprendizaje a partir del resumen grupal (texto).
 */
export function calculateReflectionScore1to5(summaryLength: number): {
  value: number | null;
  weak: boolean;
} {
  const len = Math.max(0, summaryLength);
  if (len < 1) {
    return { value: null, weak: true };
  }
  if (len < 20) {
    return { value: clamp15(2.0 + len * 0.04), weak: true };
  }
  if (len < 80) {
    return { value: clamp15(3.0 + (len - 20) * 0.015), weak: false };
  }
  if (len < 220) {
    return { value: clamp15(3.9 + (len - 80) * 0.004), weak: false };
  }
  return { value: clamp15(4.6), weak: false };
}

/**
 * C. Desempeño según valoraciones hechas solo por el líder (una fila por integrante evaluado).
 */
export function leaderPerformanceByMember(
  leaderMemberId: string | null,
  evaluations: PeerEvalRow[],
): Map<string, number | null> {
  const out = new Map<string, number | null>();
  if (!leaderMemberId) return out;
  for (const row of evaluations) {
    if (row.evaluator_member_id !== leaderMemberId) continue;
    const avg = avgLikertDimensions(row.scores);
    if (avg != null) {
      out.set(row.evaluatee_member_id, avg);
    }
  }
  return out;
}

export function consolidateProportionalGroupGrade(params: {
  weights: GradeWeights;
  quiz: number | null;
  evidence: number | null;
  performance: number | null;
  reflection: number | null;
}): { grade: number; effectiveShares: Record<ComponentKey, number> } {
  const w = params.weights;
  const parts: { key: ComponentKey; value: number; nominal: number }[] = [];
  if (params.quiz != null) parts.push({ key: "quiz", value: params.quiz, nominal: w.quiz });
  if (params.evidence != null) {
    parts.push({ key: "evidence", value: params.evidence, nominal: w.evidence });
  }
  if (params.performance != null) {
    parts.push({ key: "performance", value: params.performance, nominal: w.performance });
  }
  if (params.reflection != null) {
    parts.push({ key: "reflection", value: params.reflection, nominal: w.reflection });
  }

  if (!parts.length) {
    return {
      grade: 3.0,
      effectiveShares: {} as Record<ComponentKey, number>,
    };
  }

  const sumNominal = parts.reduce((s, p) => s + p.nominal, 0);
  const effectiveShares = {} as Record<ComponentKey, number>;
  let grade = 0;
  for (const p of parts) {
    const share = round2(p.nominal / sumNominal);
    effectiveShares[p.key] = share;
    grade += share * p.value;
  }
  return { grade: clamp15(grade), effectiveShares };
}

/**
 * Promedio de desempeño usado en la nota grupal: media de integrantes no líder con valoración del líder.
 */
export function aggregatePerformanceForGroup(
  memberIds: string[],
  leaderId: string | null,
  byMember: Map<string, number | null>,
): { groupPerformance: number | null; ratedCount: number; expectedCount: number } {
  if (!leaderId || memberIds.length <= 1) {
    return { groupPerformance: null, ratedCount: 0, expectedCount: 0 };
  }
  const targets = memberIds.filter((id) => id !== leaderId);
  const expectedCount = targets.length;
  const values: number[] = [];
  for (const id of targets) {
    const v = byMember.get(id);
    if (v != null) values.push(v);
  }
  if (!values.length) {
    return { groupPerformance: null, ratedCount: 0, expectedCount };
  }
  return {
    groupPerformance: clamp15(values.reduce((a, b) => a + b, 0) / values.length),
    ratedCount: values.length,
    expectedCount,
  };
}

/**
 * Ajuste individual acotado: la nota grupal es ancla; el desempeño relativo al grupo mueve hasta ±0.75.
 */
export function applyIndividualAdjustment(
  groupGrade: number,
  memberIds: string[],
  leaderMemberId: string | null,
  /** Valor desempeño por integrante (solo los que el líder evaluó); el líder no suele tener fila */
  performanceByMember: Map<string, number | null>,
): Record<string, number> {
  const G = clamp15(groupGrade);
  if (memberIds.length <= 1) {
    return Object.fromEntries(memberIds.map((id) => [id, G]));
  }
  if (!leaderMemberId) {
    return Object.fromEntries(memberIds.map((id) => [id, G]));
  }

  const followers = memberIds.filter((id) => id !== leaderMemberId);
  const pValues: number[] = [];
  for (const id of followers) {
    const v = performanceByMember.get(id);
    if (v != null) pValues.push(v);
  }
  const P_bar =
    pValues.length > 0
      ? pValues.reduce((a, b) => a + b, 0) / pValues.length
      : 3.0;

  const out: Record<string, number> = {};
  for (const id of memberIds) {
    const P_m =
      id === leaderMemberId
        ? P_bar
        : (performanceByMember.get(id) ?? P_bar);
    const delta = P_m - P_bar;
    const adj = clamp15(
      Math.max(
        -MAX_INDIVIDUAL_ADJUSTMENT,
        Math.min(MAX_INDIVIDUAL_ADJUSTMENT, round2(INDIVIDUAL_SENSITIVITY * delta)),
      ),
    );
    out[id] = clamp15(G + adj);
  }
  return out;
}

/** Mapa por integrante del valor usado en UI (P_m real o P_bar imputado) */
export function performanceDisplayByMember(
  memberIds: string[],
  leaderMemberId: string | null,
  performanceByMember: Map<string, number | null>,
): Record<string, number | null> {
  if (!leaderMemberId || memberIds.length <= 1) {
    return Object.fromEntries(memberIds.map((id) => [id, null]));
  }
  const followers = memberIds.filter((id) => id !== leaderMemberId);
  const pValues: number[] = [];
  for (const id of followers) {
    const v = performanceByMember.get(id);
    if (v != null) pValues.push(v);
  }
  const P_bar =
    pValues.length > 0
      ? round2(pValues.reduce((a, b) => a + b, 0) / pValues.length)
      : null;

  const out: Record<string, number | null> = {};
  for (const id of memberIds) {
    if (id === leaderMemberId) {
      out[id] = P_bar;
    } else {
      out[id] = performanceByMember.get(id) ?? P_bar;
    }
  }
  return out;
}

/**
 * Punto de entrada: calcula snapshot completo Ruta A.
 */
export function computeRutaAGrade(input: {
  weights?: GradeWeights;
  quizScore1to5: number | null | undefined;
  evidenceFileCount: number;
  learningSummaryLength: number;
  peerEvaluations: PeerEvalRow[];
  memberIds: string[];
  leaderMemberId: string | null;
}): RutaAComputedSnapshot {
  const w = input.weights ?? DEFAULT_GRADE_WEIGHTS;
  const flags: RutaAGradeFlags = {};

  const q = calculateQuizScore1to5(input.quizScore1to5);
  if (q.missing) flags.quiz_missing = true;

  const ev = calculateEvidenceDeliveryScore1to5(input.evidenceFileCount);
  if (ev.incomplete) flags.evidence_incomplete = true;

  const ref = calculateReflectionScore1to5(input.learningSummaryLength);
  if (ref.value == null) flags.reflection_missing = true;
  else if (ref.weak) flags.reflection_weak = true;

  const byLeader = leaderPerformanceByMember(input.leaderMemberId, input.peerEvaluations);
  const { groupPerformance, ratedCount, expectedCount } = aggregatePerformanceForGroup(
    input.memberIds,
    input.leaderMemberId,
    byLeader,
  );

  let performance: number | null = groupPerformance;
  if (input.memberIds.length <= 1) {
    flags.single_member_group = true;
    performance = null;
  } else if (input.leaderMemberId && expectedCount > 0) {
    if (ratedCount < expectedCount) {
      flags.performance_incomplete = true;
      flags.performance_low_confidence = true;
    }
    if (ratedCount === 0) {
      performance = null;
      flags.performance_incomplete = true;
    }
  } else if (!input.leaderMemberId) {
    performance = null;
    flags.performance_incomplete = true;
  }

  const presentCount = [q.value, ev.value, performance, ref.value].filter((v) => v != null).length;
  if (presentCount < 4) flags.weights_renormalized = true;

  const { grade: G, effectiveShares } = consolidateProportionalGroupGrade({
    weights: w,
    quiz: q.value,
    evidence: ev.value,
    performance,
    reflection: ref.value,
  });
  flags.effective_shares = effectiveShares;

  const peerByMemberRecord = performanceDisplayByMember(
    input.memberIds,
    input.leaderMemberId,
    byLeader,
  );

  const proposed_member_grades = applyIndividualAdjustment(
    G,
    input.memberIds,
    input.leaderMemberId,
    byLeader,
  );

  return {
    formula_version: RUTA_A_FORMULA_VERSION,
    weights: w,
    component_quiz: q.value,
    component_evidence: ev.value,
    component_peer_group: performance,
    component_self_group: ref.value,
    component_peer_by_member: peerByMemberRecord,
    proposed_group_grade: G,
    proposed_member_grades,
    flags,
  };
}
