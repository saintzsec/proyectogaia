"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { submitEvaluation } from "@/app/actions/evaluations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSaveToast } from "@/components/ui/save-toast";

type Criterion = { id: string; label: string; max_score: number; sort_order: number };
type Rubric = { id: string; name: string; rubric_criteria: Criterion[] };
type Group = { id: string; name: string };
type Workshop = { id: string; title: string };

export function EvaluationForm({
  rubrics,
  groups,
  workshops,
}: {
  rubrics: Rubric[];
  groups: Group[];
  workshops: Workshop[];
}) {
  const router = useRouter();
  const { showSaved } = useSaveToast();
  const [rubricId, setRubricId] = useState(rubrics[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const criteria = useMemo(() => {
    const r = rubrics.find((x) => x.id === rubricId);
    return (r?.rubric_criteria ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
  }, [rubricId, rubrics]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await submitEvaluation(fd);
    setLoading(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    showSaved("Evaluación guardada");
    e.currentTarget.reset();
    setRubricId(rubrics[0]?.id ?? "");
    router.refresh();
  }

  if (!rubrics.length || !groups.length) {
    return (
      <p className="text-sm text-[#6b7280]">
        Necesitas al menos una rúbrica activa (admin) y un grupo creado para evaluar.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <input type="hidden" name="rubric_id" value={rubricId} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rubric_select">Rúbrica</Label>
          <select
            id="rubric_select"
            className="h-10 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm"
            value={rubricId}
            onChange={(e) => setRubricId(e.target.value)}
          >
            {rubrics.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="student_group_id">Grupo</Label>
          <select
            id="student_group_id"
            name="student_group_id"
            required
            className="h-10 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="workshop_id">Taller (opcional)</Label>
          <select
            id="workshop_id"
            name="workshop_id"
            className="h-10 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm"
          >
            <option value="">—</option>
            {workshops.map((w) => (
              <option key={w.id} value={w.id}>
                {w.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4 rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-[#f9fafb] p-4">
        <p className="text-sm font-medium text-[#111827]">Criterios</p>
        {criteria.map((c) => (
          <div key={c.id} className="grid gap-2 md:grid-cols-[1fr,120px] md:items-end">
            <div>
              <p className="text-sm font-medium text-[#374151]">{c.label}</p>
              <p className="text-xs text-[#6b7280]">Máximo: {c.max_score}</p>
            </div>
            <div className="space-y-1">
              <Label className="sr-only" htmlFor={`score_${c.id}`}>
                Puntaje {c.label}
              </Label>
              <Input
                id={`score_${c.id}`}
                name={`score_${c.id}`}
                type="number"
                min={0}
                max={c.max_score}
                required
                defaultValue={0}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="comments">Comentarios</Label>
        <Textarea id="comments" name="comments" placeholder="Retroalimentación cualitativa…" />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={loading}>
        {loading ? "Enviando…" : "Guardar evaluación"}
      </Button>
    </form>
  );
}
