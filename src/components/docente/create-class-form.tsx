"use client";

import { useState } from "react";
import { createTeachingClass } from "@/app/actions/classes-docente";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSaveToast } from "@/components/ui/save-toast";

export function CreateClassForm({
  kits,
}: {
  kits: { id: string; name: string }[];
}) {
  const { showSaved } = useSaveToast();
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCode(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await createTeachingClass(fd);
    setLoading(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    if ("join_code" in res && res.join_code) {
      setCode(res.join_code);
      showSaved("Clase creada");
    }
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="cname">Nombre de la clase</Label>
        <Input id="cname" name="name" required placeholder="Ej. 11° B" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="cdesc">Descripción (opcional)</Label>
        <Textarea id="cdesc" name="description" rows={2} placeholder="Contexto del curso…" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="ckit">Proyecto / kit asignado</Label>
        <select
          id="ckit"
          name="kit_project_id"
          required
          className="h-10 w-full max-w-md rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            Selecciona un proyecto
          </option>
          {kits.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>
      </div>
      {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}
      {code ? (
        <div className="md:col-span-2 rounded-[var(--radius-gaia)] border border-[#0baba9]/30 bg-[#0baba9]/5 p-4">
          <p className="text-sm font-medium text-[#111827]">Código para compartir con los líderes</p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-wider text-[#0baba9]">{code}</p>
          <p className="mt-1 text-xs text-[#6b7280]">
            Los estudiantes lo ingresan en «Unirse a una clase» del sitio público.
          </p>
        </div>
      ) : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Creando…" : "Crear clase"}
        </Button>
      </div>
    </form>
  );
}
