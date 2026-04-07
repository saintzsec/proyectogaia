/**
 * API pública del motor de calificación sugerida (Ruta A).
 * Implementación: `ruta-a-engine.ts` + `compute-proposed-grade.ts`.
 */
export {
  DEFAULT_GRADE_WEIGHTS,
  RUTA_A_FORMULA_VERSION,
  LEGACY_FORMULA_VERSION,
  type GradeWeights,
  clamp15,
  round2,
} from "./formula";

export {
  computeProposedGrade,
  isValidPeerScores,
  type ComputeProposedInput,
  type ComputedSnapshot,
  type GradeFlags,
  type PeerEvalRow,
} from "./compute-proposed-grade";

export {
  computeRutaAGrade,
  calculateQuizScore1to5,
  calculateEvidenceDeliveryScore1to5,
  calculateReflectionScore1to5,
  leaderPerformanceByMember,
  consolidateProportionalGroupGrade,
  aggregatePerformanceForGroup,
  applyIndividualAdjustment,
  performanceDisplayByMember,
  MAX_INDIVIDUAL_ADJUSTMENT,
  INDIVIDUAL_SENSITIVITY,
  type RutaAComputedSnapshot,
  type RutaAGradeFlags,
  type ComponentKey,
} from "./ruta-a-engine";

export { buildSnapshotBreakdown, asGradeWeights, GRADING_ROW_LABELS } from "./breakdown";

export {
  DATA_WARNING_LABELS_ES,
  snapshotHasDataWarnings,
  snapshotWarningCount,
  snapshotBooleanWarningEntries,
} from "./data-warning-labels";
