import Link from "next/link";
import type { ComponentProps } from "react";
import {
  DATA_WARNING_LABELS_ES,
  snapshotBooleanWarningEntries,
} from "@/lib/grading/data-warning-labels";

type Member = { id: string; display_name: string; is_leader: boolean };

/**
 * Bloque destacado: nota sugerida grupal e individual + enlace a decisión manual del docente.
 */
export function SuggestedGradeSummary(props: {
  proposedGroup: number;
  proposedMemberGrades: Record<string, number>;
  members: Member[];
  computedAt: string | null;
}) {
  return (
    <section
      className="rounded-[var(--radius-gaia)] border-2 border-[#0baba9]/30 bg-gradient-to-br from-[#e6f9f8] to-white p-6 shadow-sm"
      aria-labelledby="suggested-grade-heading"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p id="suggested-grade-heading" className="text-xs font-semibold uppercase tracking-wide text-[#0baba9]">
            Nota sugerida (automática)
          </p>
          <p className="mt-1 font-[family-name:var(--font-heading)] text-4xl font-bold tabular-nums text-[#111827]">
            {props.proposedGroup.toFixed(2)}
            <span className="ml-1 text-lg font-semibold text-[#6b7280]">/ 5,00</span>
          </p>
          <p className="mt-2 max-w-md text-sm text-[#4b5563]">
            Calculada con el motor Ruta A (quiz, evidencia, desempeño registrado por el líder,
            reflexión). No sustituye tu criterio: confirma o ajusta abajo.
          </p>
          {props.computedAt ? (
            <p className="mt-2 text-xs text-[#9ca3af]">
              Último cálculo: {new Date(props.computedAt).toLocaleString("es")}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Link
            href="#nota-final-docente"
            className="inline-flex items-center justify-center rounded-[var(--radius-gaia)] bg-[#0baba9] px-4 py-3 text-sm font-semibold text-white hover:bg-[#09908e]"
          >
            Ir a nota final manual
          </Link>
          <p className="text-center text-xs text-[#6b7280]">1,00 – 5,00 (2 decimales)</p>
        </div>
      </div>

      <div className="mt-6 border-t border-[#0baba9]/20 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#374151]">
          Sugeridas por integrante
        </h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {props.members.map((m) => {
            const g = props.proposedMemberGrades[m.id];
            const val =
              g != null && Number.isFinite(Number(g)) ? Number(g).toFixed(2) : "—";
            return (
              <li
                key={m.id}
                className="rounded-full border border-[#e5e7eb] bg-white px-3 py-1 text-sm text-[#374151]"
              >
                <span className="font-medium">{m.display_name}</span>
                {m.is_leader ? (
                  <span className="ml-1 text-xs text-[#9ca3af]">líder</span>
                ) : null}
                <span className="ml-2 tabular-nums font-semibold text-[#0baba9]">{val}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Variante con lista de advertencias debajo del bloque principal */
export function SuggestedGradeSummaryWithWarnings(
  props: ComponentProps<typeof SuggestedGradeSummary> & { flags: unknown },
) {
  const entries = snapshotBooleanWarningEntries(props.flags);
  return (
    <div className="space-y-3">
      <SuggestedGradeSummary
        proposedGroup={props.proposedGroup}
        proposedMemberGrades={props.proposedMemberGrades}
        members={props.members}
        computedAt={props.computedAt}
      />
      {entries.length ? (
        <div
          className="rounded-[var(--radius-gaia)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          <p className="font-medium">Datos incompletos o poco fiables</p>
          <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs">
            {entries.map(([k]) => (
              <li key={k}>{DATA_WARNING_LABELS_ES[k] ?? k}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
