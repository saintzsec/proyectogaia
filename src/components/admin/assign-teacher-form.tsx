"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { assignTeacher } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSaveToast } from "@/components/ui/save-toast";

type Opt = { id: string; label: string };

export function AssignTeacherForm({ profiles, schools }: { profiles: Opt[]; schools: Opt[] }) {
  const router = useRouter();
  const { showSaved } = useSaveToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await assignTeacher(fd);
    setLoading(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    showSaved("Docente asignado al colegio");
    e.currentTarget.reset();
    router.refresh();
  }

  if (!profiles.length) {
    return (
      <p className="text-sm text-[#6b7280]">
        No hay perfiles docentes sin asignar. Crea usuarios o cambia roles desde Supabase si es
        necesario.
      </p>
    );
  }

  if (!schools.length) {
    return <p className="text-sm text-[#6b7280]">Primero crea al menos un colegio.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="profile_id">Perfil docente</Label>
        <select
          id="profile_id"
          name="profile_id"
          required
          className="h-10 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="school_id">Colegio</Label>
        <select
          id="school_id"
          name="school_id"
          required
          className="h-10 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm"
        >
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Asignando…" : "Vincular docente"}
        </Button>
      </div>
    </form>
  );
}
