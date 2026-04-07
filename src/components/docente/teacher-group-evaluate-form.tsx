"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { submitTeacherGradeDecision } from "@/app/actions/teacher-grade-decision";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSaveToast } from "@/components/ui/save-toast";
import type { SnapshotBreakdownPayload } from "@/lib/grading/breakdown";

export type EvaluateMemberRow = {
  id: string;
  display_name: string;
  is_leader: boolean;
  suggestedIndividual: number | null;
  peerReceived360: number | null;
  lowPeerAlert: boolean;
};

const DEFAULT_RUBRIC = [
  { label: "Planificación y alineación con el proyecto", score: 3 },
  { label: "Ejecución y calidad del trabajo", score: 3 },
  { label: "Resultado y evidencias", score: 3 },
  { label: "Comunicación y presentación", score: 3 },
];

export function TeacherGroupEvaluateForm({
  classId,
  groupId,
  snapshotId,
  defaultGrade,
  breakdown,
  members,
}: {
  classId: string;
  groupId: string;
  snapshotId: string | null;
  defaultGrade: number;
  breakdown: SnapshotBreakdownPayload | null;
  members: EvaluateMemberRow[];
}) {
  const { showSaved } = useSaveToast();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [finalGrade, setFinalGrade] = useState(defaultGrade.toFixed(2));
  const [rubricRows, setRubricRows] = useState(() =>
    DEFAULT_RUBRIC.map((r, i) => ({ ...r, key: `r${i}` })),
  );
  const [memberGrades, setMemberGrades] = useState<Record<string, string>>({});

  const rubricAverage = useMemo(() => {
    if (!rubricRows.length) return null;
    const nums = rubricRows
      .map((r) => Number(r.score))
      .filter((n) => Number.isFinite(n) && n >= 1 && n <= 5);
    if (!nums.length) return null;
    return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
  }, [rubricRows]);

  function addRubricRow() {
    setRubricRows((prev) => [
      ...prev,
      { key: `r${Date.now()}`, label: "Nuevo criterio", score: 3 },
    ]);
  }

  function removeRubricRow(key: string) {
    setRubricRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.key !== key)));
  }

  return (
    <div id="nota-final-docente" className="scroll-mt-24 space-y-3">
      <div>
        <h2 className="text-base font-semibold text-[#111827]">Nota final del docente</h2>
        <p className="mt-1 text-xs text-[#6b7280]">
          Calificación definitiva del grupo (1,00–5,00). Puedes igualar la sugerida o cambiarla; queda
          registro en el historial.
        </p>
      </div>
      <form
      className="space-y-8 rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white p-5"
      action={async (fd) => {
        setError(null);
        setLoading(true);
        fd.set("student_group_id", groupId);
        fd.set("class_id", classId);
        if (snapshotId) fd.set("snapshot_id", snapshotId);
        fd.set("final_group_grade", finalGrade);

        const rubricPayload = rubricRows.map(({ label, score }) => ({
          label: label.trim() || "Criterio",
          max_points: 5,
          score: Math.min(5, Math.max(1, Number(score) || 3)),
        }));
        fd.set("rubric_criteria_json", JSON.stringify(rubricPayload));

        const overrides: Record<string, number> = {};
        for (const m of members) {
          const raw = memberGrades[m.id]?.trim();
          if (raw === undefined || raw === "") continue;
          const n = Number(raw.replace(",", "."));
          if (!Number.isFinite(n) || n < 1 || n > 5) {
            setLoading(false);
            setError(`Nota inválida para ${m.display_name} (use 1,00–5,00).`);
            return;
          }
          overrides[m.id] = Math.round(n * 100) / 100;
        }
        fd.set(
          "final_member_grades_json",
          Object.keys(overrides).length ? JSON.stringify(overrides) : "",
        );

        const res = await submitTeacherGradeDecision(fd);
        setLoading(false);
        if ("error" in res && res.error) {
          setError(res.error);
          return;
        }
        showSaved("Calificación registrada");
        router.refresh();
      }}
    >
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="final_group_grade">Nota final del grupo (1,00 – 5,00)</Label>
          <Input
            id="final_group_grade"
            name="final_group_grade_display"
            type="number"
            step="0.01"
            min={1}
            max={5}
            value={finalGrade}
            onChange={(e) => setFinalGrade(e.target.value)}
            required
            className="max-w-[10rem] tabular-nums"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="shrink-0"
          onClick={() => setFinalGrade(defaultGrade.toFixed(2))}
        >
          Usar sugerida ({defaultGrade.toFixed(2)})
        </Button>
        {rubricAverage != null ? (
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            onClick={() => setFinalGrade(rubricAverage.toFixed(2))}
          >
            Usar rúbrica ({rubricAverage.toFixed(2)})
          </Button>
        ) : null}
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[#111827]">Rúbrica manual (editable)</h3>
          <Button type="button" variant="ghost" size="sm" onClick={addRubricRow}>
            + Criterio
          </Button>
        </div>
        <p className="text-xs text-[#6b7280]">
          Cada criterio en escala 1–5. El promedio se muestra arriba; puedes usarlo como nota
          final o solo como referencia junto a la sugerida automática (
          {breakdown ? breakdown.proposedGroupGrade.toFixed(2) : "—"}).
        </p>
        <div className="overflow-x-auto rounded-lg border border-[#e5e7eb]">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-[#f9fafb] text-left text-xs uppercase text-[#6b7280]">
              <tr>
                <th className="px-3 py-2">Criterio</th>
                <th className="px-3 py-2 w-28">Puntaje (1–5)</th>
                <th className="w-10 px-2" />
              </tr>
            </thead>
            <tbody>
              {rubricRows.map((row) => (
                <tr key={row.key} className="border-t border-[#f3f4f6]">
                  <td className="px-3 py-2">
                    <Input
                      value={row.label}
                      onChange={(e) =>
                        setRubricRows((prev) =>
                          prev.map((r) =>
                            r.key === row.key ? { ...r, label: e.target.value } : r,
                          ),
                        )
                      }
                      className="text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      step={1}
                      value={row.score}
                      onChange={(e) =>
                        setRubricRows((prev) =>
                          prev.map((r) =>
                            r.key === row.key
                              ? { ...r, score: Number(e.target.value) || 1 }
                              : r,
                          ),
                        )
                      }
                      className="tabular-nums"
                    />
                  </td>
                  <td className="px-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-[#9ca3af] hover:text-red-600"
                      onClick={() => removeRubricRow(row.key)}
                      aria-label="Quitar criterio"
                    >
                      ×
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rubricAverage != null ? (
          <p className="text-sm text-[#374151]">
            Promedio de rúbrica:{" "}
            <span className="font-semibold text-[#0baba9]">{rubricAverage.toFixed(2)}</span>
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-[#111827]">
          Notas individuales sugeridas y ajuste opcional
        </h3>
        <p className="text-xs text-[#6b7280]">
          Deja vacío el ajuste si la nota individual coincide con la lógica del grupo o no
          aplica calificación por integrante.
        </p>
        <div className="overflow-x-auto rounded-lg border border-[#e5e7eb]">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="bg-[#f9fafb] text-left text-xs uppercase text-[#6b7280]">
              <tr>
                <th className="px-3 py-2">Integrante</th>
                <th className="px-3 py-2 text-right">Desempeño (ref.)</th>
                <th className="px-3 py-2 text-right">Sugerida</th>
                <th className="px-3 py-2 text-right">Final individual (opc.)</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-t border-[#f3f4f6]">
                  <td className="px-3 py-2">
                    <span className="font-medium text-[#374151]">{m.display_name}</span>
                    {m.is_leader ? (
                      <span className="ml-2 text-xs text-[#9ca3af]">líder</span>
                    ) : null}
                    {m.lowPeerAlert ? (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-900">
                        Valoración baja
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-[#6b7280]">
                    {m.peerReceived360 != null ? m.peerReceived360.toFixed(2) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium text-[#0baba9]">
                    {m.suggestedIndividual != null ? m.suggestedIndividual.toFixed(2) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Input
                      type="number"
                      step="0.01"
                      min={1}
                      max={5}
                      placeholder="—"
                      value={memberGrades[m.id] ?? ""}
                      onChange={(e) =>
                        setMemberGrades((prev) => ({
                          ...prev,
                          [m.id]: e.target.value,
                        }))
                      }
                      className="ml-auto max-w-[6.5rem] tabular-nums"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-[#111827]">Origen de la nota</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="source" value="accepted_auto" defaultChecked />
          Acepto la sugerencia del sistema (o un ajuste leve del número de grupo)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="source" value="adjusted" />
          Ajuste manual considerando sugerencia y/o rúbrica
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="source" value="rubric_manual" />
          Evaluación principalmente por rúbrica / criterio propio
        </label>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="teacher_comments">Comentarios para el grupo (opcional)</Label>
        <Textarea id="teacher_comments" name="teacher_comments" rows={3} />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Guardando…" : "Confirmar calificación"}
      </Button>
      <p className="text-xs text-[#6b7280]">
        La decisión guarda el desglose de la fórmula automática y la rúbrica tal como la dejaste,
        para auditoría. Las evaluaciones detalladas por kit siguen en{" "}
        <a href="/docente/evaluaciones" className="text-[#0baba9] underline">
          Evaluaciones
        </a>
        .
      </p>
    </form>
    </div>
  );
}
