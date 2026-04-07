"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createRubricCriterion } from "@/app/actions/rubrics-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSaveToast } from "@/components/ui/save-toast";

export function RubricCriterionForm({ rubricId }: { rubricId: string }) {
  const router = useRouter();
  const { showSaved } = useSaveToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await createRubricCriterion(fd);
    setLoading(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    showSaved("Criterio añadido");
    e.currentTarget.reset();
    const hidden = e.currentTarget.querySelector(
      'input[name="rubric_id"]',
    ) as HTMLInputElement | null;
    if (hidden) hidden.value = rubricId;
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-[var(--radius-gaia)] border border-dashed border-[#e5e7eb] bg-[#fafafa] p-4 md:grid-cols-2">
      <input type="hidden" name="rubric_id" value={rubricId} />
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={`label-${rubricId}`}>Nuevo criterio — etiqueta</Label>
        <Input id={`label-${rubricId}`} name="label" required placeholder="Ej. Uso de evidencias" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={`desc-${rubricId}`}>Descripción</Label>
        <Textarea id={`desc-${rubricId}`} name="description" rows={2} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`max-${rubricId}`}>Puntaje máximo</Label>
        <Input id={`max-${rubricId}`} name="max_score" type="number" min={1} max={20} defaultValue={4} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`ord-${rubricId}`}>Orden</Label>
        <Input id={`ord-${rubricId}`} name="sort_order" type="number" min={0} defaultValue={99} required />
      </div>
      {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" size="sm" variant="secondary" disabled={loading}>
          {loading ? "Añadiendo…" : "Añadir criterio"}
        </Button>
      </div>
    </form>
  );
}
