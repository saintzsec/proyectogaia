import { DEFAULT_GRADE_WEIGHTS, round2, type GradeWeights } from "@/lib/grading/formula";

export type BreakdownComponentKey = keyof GradeWeights;

export const GRADING_ROW_LABELS: Record<BreakdownComponentKey, string> = {
  quiz: "Quiz / sustentación",
  evidence: "Evidencia y entregables",
  performance: "Desempeño (valoración del líder)",
  reflection: "Reflexión / resumen de aprendizaje",
};

export type WeightedBreakdownRow = {
  key: BreakdownComponentKey;
  label: string;
  componentValue: number | null;
  nominalWeight: number;
  effectiveShare: number;
  weightedContribution: number;
};

export type SnapshotBreakdownPayload = {
  weights: GradeWeights;
  rows: WeightedBreakdownRow[];
  weightedSum: number;
  proposedGroupGrade: number;
  usedProportionalRenormalization: boolean;
};

type SnapshotLike = {
  proposed_group_grade: number | string | null;
  weights: unknown;
  component_quiz: number | string | null;
  component_peer_group: number | string | null;
  component_evidence: number | string | null;
  component_self_group: number | string | null;
  flags?: unknown;
};

function num(v: number | string | null | undefined): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Soporta pesos nuevos y snapshots legacy (peer / selfReflection). */
export function asGradeWeights(w: unknown): GradeWeights {
  const d = DEFAULT_GRADE_WEIGHTS;
  if (!w || typeof w !== "object") {
    return { ...d };
  }
  const o = w as Record<string, number>;
  if (typeof o.performance === "number" || typeof o.reflection === "number") {
    return {
      quiz: typeof o.quiz === "number" ? o.quiz : d.quiz,
      evidence: typeof o.evidence === "number" ? o.evidence : d.evidence,
      performance: typeof o.performance === "number" ? o.performance : d.performance,
      reflection: typeof o.reflection === "number" ? o.reflection : d.reflection,
    };
  }
  return {
    quiz: typeof o.quiz === "number" ? o.quiz : d.quiz,
    evidence: typeof o.evidence === "number" ? o.evidence : d.evidence,
    performance: typeof o.peer === "number" ? o.peer : d.performance,
    reflection: typeof o.selfReflection === "number" ? o.selfReflection : d.reflection,
  };
}

type EffectiveShares = Partial<Record<BreakdownComponentKey, number>>;

function readEffectiveShares(flags: unknown): EffectiveShares | null {
  if (!flags || typeof flags !== "object") return null;
  const es = (flags as Record<string, unknown>).effective_shares;
  if (!es || typeof es !== "object") return null;
  return es as EffectiveShares;
}

/**
 * Desglose para UI: refleja ponderación proporcional cuando faltan componentes.
 */
export function buildSnapshotBreakdown(snap: SnapshotLike): SnapshotBreakdownPayload {
  const weights = asGradeWeights(snap.weights);
  const storedEff = readEffectiveShares(snap.flags);

  const raw: Record<BreakdownComponentKey, number | null> = {
    quiz: snap.component_quiz != null ? round2(num(snap.component_quiz)) : null,
    evidence: snap.component_evidence != null ? round2(num(snap.component_evidence)) : null,
    performance:
      snap.component_peer_group != null ? round2(num(snap.component_peer_group)) : null,
    reflection: snap.component_self_group != null ? round2(num(snap.component_self_group)) : null,
  };

  const keys: BreakdownComponentKey[] = ["quiz", "evidence", "performance", "reflection"];
  const present = keys.filter((k) => raw[k] != null) as BreakdownComponentKey[];

  const shares: Record<BreakdownComponentKey, number> = {
    quiz: 0,
    evidence: 0,
    performance: 0,
    reflection: 0,
  };

  let usedFromFlags = false;
  if (storedEff && present.length) {
    let sumStored = 0;
    for (const k of present) {
      const s = storedEff[k];
      if (s != null && Number.isFinite(s)) {
        shares[k] = round2(s);
        sumStored += shares[k];
      }
    }
    if (sumStored > 0.01) {
      usedFromFlags = true;
      if (Math.abs(sumStored - 1) > 0.02) {
        for (const k of present) {
          shares[k] = round2(shares[k] / sumStored);
        }
      }
    }
  }

  if (!usedFromFlags && present.length) {
    const sumNom = present.reduce((s, k) => s + weights[k], 0);
    for (const k of present) {
      shares[k] = sumNom > 0 ? round2(weights[k] / sumNom) : 0;
    }
  }

  const rows: WeightedBreakdownRow[] = [];
  let weightedSum = 0;

  for (const key of keys) {
    const componentValue = raw[key];
    const nominalWeight = weights[key];
    const effectiveShare = componentValue != null ? shares[key] : 0;
    const weightedContribution =
      componentValue != null ? round2(effectiveShare * componentValue) : 0;
    weightedSum += weightedContribution;
    rows.push({
      key,
      label: GRADING_ROW_LABELS[key],
      componentValue,
      nominalWeight,
      effectiveShare,
      weightedContribution,
    });
  }

  const proposedGroupGrade = round2(num(snap.proposed_group_grade));
  if (present.length === 0 && proposedGroupGrade > 0) {
    weightedSum = proposedGroupGrade;
  }

  return {
    weights,
    rows,
    weightedSum: round2(weightedSum),
    proposedGroupGrade,
    usedProportionalRenormalization:
      usedFromFlags || (present.length > 0 && present.length < keys.length),
  };
}
