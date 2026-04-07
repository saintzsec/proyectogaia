"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { upsertPilotMetric } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveToast } from "@/components/ui/save-toast";

export function MetricForm() {
  const router = useRouter();
  const { showSaved } = useSaveToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await upsertPilotMetric(fd);
    setLoading(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    showSaved("Indicador guardado");
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="metric_key">Clave del indicador</Label>
        <Input
          id="metric_key"
          name="metric_key"
          required
          placeholder="ej. talleres_ejecutados"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="metric_value">Valor numérico</Label>
        <Input id="metric_value" name="metric_value" type="number" step="any" required />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="metric_date">Fecha (opcional, ISO)</Label>
        <Input id="metric_date" name="metric_date" type="date" />
      </div>
      {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando…" : "Guardar / actualizar"}
        </Button>
      </div>
    </form>
  );
}
