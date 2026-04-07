"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createWorkshop } from "@/app/actions/workshops";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSaveToast } from "@/components/ui/save-toast";

type Group = { id: string; name: string };
type Kit = { id: string; name: string };

export function CreateWorkshopForm({ groups, kits }: { groups: Group[]; kits: Kit[] }) {
  const router = useRouter();
  const { showSaved } = useSaveToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await createWorkshop(fd);
    setLoading(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    showSaved("Taller creado");
    e.currentTarget.reset();
    router.refresh();
  }

  if (!groups.length) {
    return <p className="text-sm text-[#6b7280]">Primero crea al menos un grupo.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
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
        <Label htmlFor="title">Título del taller</Label>
        <Input id="title" name="title" required placeholder="Ej. Construcción filtro — sesión 2" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="kit_project_id">Kit / proyecto (opcional)</Label>
        <select
          id="kit_project_id"
          name="kit_project_id"
          className="h-10 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm"
        >
          <option value="">—</option>
          {kits.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Estado</Label>
        <select
          id="status"
          name="status"
          className="h-10 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm"
          defaultValue="completed"
        >
          <option value="planned">Planificado</option>
          <option value="in_progress">En curso</option>
          <option value="completed">Completado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="attendance_count">Asistencia (opcional)</Label>
        <Input id="attendance_count" name="attendance_count" type="number" min={0} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" />
      </div>
      {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando…" : "Registrar taller"}
        </Button>
      </div>
    </form>
  );
}
