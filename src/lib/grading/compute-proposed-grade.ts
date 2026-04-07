import type { GradeWeights } from "@/lib/grading/formula";
import { PEER_DIMENSION_KEYS, type PeerDimensionKey } from "@/lib/grading/formula";
import {
  computeRutaAGrade,
  type PeerEvalRow,
  type RutaAComputedSnapshot,
  type RutaAGradeFlags,
} from "@/lib/grading/ruta-a-engine";

export type { PeerEvalRow };

export type ComputeProposedInput = {
  weights?: GradeWeights;
  quizScore1to5: number | null | undefined;
  evidenceFileCount: number;
  learningSummaryLength: number;
  peerEvaluations: PeerEvalRow[];
  memberIds: string[];
  leaderMemberId: string | null;
};

export type ComputedSnapshot = RutaAComputedSnapshot;
export type GradeFlags = RutaAGradeFlags;

/**
 * Nota sugerida grupal e individual (Ruta A). Centralizado; la UI y el snapshot usan este resultado.
 */
export function computeProposedGrade(input: ComputeProposedInput): ComputedSnapshot {
  return computeRutaAGrade({
    weights: input.weights,
    quizScore1to5: input.quizScore1to5,
    evidenceFileCount: input.evidenceFileCount,
    learningSummaryLength: input.learningSummaryLength,
    peerEvaluations: input.peerEvaluations,
    memberIds: input.memberIds,
    leaderMemberId: input.leaderMemberId,
  });
}

export function isValidPeerScores(scores: Record<string, unknown>): boolean {
  for (const k of PEER_DIMENSION_KEYS) {
    const v = scores[k as PeerDimensionKey];
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n) || n < 1 || n > 5) return false;
  }
  return true;
}
