"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  submitPeerEvaluationFormAction,
  type PeerEvaluationFormState,
} from "@/app/actions/class-student-public";
import {
  PEER_DIMENSION_KEYS,
  PEER_DIMENSION_LABELS_ES,
  type PeerDimensionKey,
} from "@/lib/grading/formula";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const LIKERT_LEVELS = [1, 2, 3, 4, 5] as const;

/** Trayectoria Material / Android vector (estrella 24×24) */
const STAR_PATH =
  "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21z";

function StarGlyph({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-8 w-8 shrink-0", className)}
      aria-hidden
    >
      {filled ? (
        <path fill="currentColor" d={STAR_PATH} />
      ) : (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth={1.35}
          strokeLinejoin="round"
          d={STAR_PATH}
        />
      )}
    </svg>
  );
}

function LikertStarRow({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: number;
  onChange: (n: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="text-sm font-medium text-[#111827]">{label}</Label>
        <span className="text-xs tabular-nums text-[#6b7280]" aria-live="polite">
          {shown} / 5
        </span>
      </div>
      <div
        className="flex items-center gap-0.5 sm:gap-1"
        role="group"
        aria-label={`${label}: ${value} de 5 estrellas`}
      >
        {LIKERT_LEVELS.map((n) => {
          const active = n <= shown;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(null)}
              aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"} de cinco`}
              aria-current={value === n ? "true" : undefined}
              className={cn(
                "rounded-md p-0.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0baba9]",
                active ? "text-amber-400" : "text-[#d1d5db]",
              )}
            >
              <StarGlyph filled={active} />
            </button>
          );
        })}
      </div>
      <input type="hidden" name={name} value={String(value)} />
    </div>
  );
}

const defaultScores = (): Record<PeerDimensionKey, number> =>
  Object.fromEntries(PEER_DIMENSION_KEYS.map((k) => [k, 3])) as Record<
    PeerDimensionKey,
    number
  >;

export function PeerEvaluationForm({
  evaluatorToken,
  evaluateeId,
}: {
  evaluatorToken: string;
  evaluateeId: string;
}) {
  const [state, formAction, pending] = useActionState<
    PeerEvaluationFormState | null,
    FormData
  >(submitPeerEvaluationFormAction, null);
  const [scores, setScores] = useState<Record<PeerDimensionKey, number>>(defaultScores);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state?.ok) return;
    successRef.current?.focus();
  }, [state?.ok]);

  if (state?.ok) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="rounded-[var(--radius-gaia)] border border-green-200 bg-green-50 px-4 py-4 text-green-900 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
      >
        <p className="text-base font-semibold text-green-900">Evaluación enviada</p>
        <p className="mt-1 text-sm text-green-800">
          Gracias por tu valoración. El docente la tendrá en cuenta al revisar el desempeño del
          equipo.
        </p>
        <Link
          href={`/clase/panel/${evaluatorToken}`}
          className="mt-4 inline-flex min-h-11 w-full touch-manipulation items-center justify-center rounded-[var(--radius-gaia)] bg-[#0baba9] px-4 text-sm font-medium text-white transition-colors hover:bg-[#09908e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0baba9] sm:min-h-10"
        >
          Continuar en el panel del grupo
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}
      <input type="hidden" name="evaluator_token" value={evaluatorToken} />
      <input type="hidden" name="evaluatee_member_id" value={evaluateeId} />
      {PEER_DIMENSION_KEYS.map((k) => (
        <LikertStarRow
          key={k}
          label={PEER_DIMENSION_LABELS_ES[k]}
          name={`dim_${k}`}
          value={scores[k]}
          onChange={(n) => setScores((prev) => ({ ...prev, [k]: n }))}
        />
      ))}
      <div className="space-y-1">
        <Label className="text-xs">Oportunidades de mejora (opcional)</Label>
        <Textarea
          name="improvement_notes"
          rows={3}
          placeholder="Sugerencias respetuosas…"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Enviando…" : "Enviar evaluación"}
      </Button>
    </form>
  );
}
