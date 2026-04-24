"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateRubric } from "@/app/actions/rubrics-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveToast } from "@/components/ui/save-toast";

export function RubricMetaForm({
  rubric,
  kits,
}: {
  rubric: { id: string; name: string; version: number; is_active: boolean; kit_project_id: string | null };
  kits: { id: string; name: string }[];
}) {
  const router = useRouter();
  const { showSaved } = useSaveToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await updateRubric(fd);
    setLoading(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    showSaved();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-4">
      <input type="hidden" name="id" value={rubric.id} />
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" required defaultValue={rubric.name} className="min-w-[240px]" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="version">Versión</Label>
        <Input
          id="version"
          name="version"
          type="number"
          min={1}
          required
          defaultValue={rubric.version}
          className="w-24"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="kit_project_id">Proyecto asociado</Label>
        <select
          id="kit_project_id"
          name="kit_project_id"
          title="Seleccionar proyecto asociado"
          className="h-10 min-w-[240px] rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm"
          defaultValue={rubric.kit_project_id ?? ""}
        >
          <option value="">— Sin proyecto —</option>
          {kits.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="is_active">Activa</Label>
        <select
          id="is_active"
          name="is_active"
          className="h-10 rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm"
          defaultValue={rubric.is_active ? "true" : "false"}
        >
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>
      </div>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "…" : "Guardar"}
      </Button>
    </form>
  );
}
