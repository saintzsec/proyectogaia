"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { uploadEvidence } from "@/app/actions/evidence";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveToast } from "@/components/ui/save-toast";

type Group = { id: string; name: string };

export function EvidenceUploadForm({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const { showSaved } = useSaveToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await uploadEvidence(fd);
    setLoading(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    showSaved("Evidencia subida");
    e.currentTarget.reset();
    router.refresh();
  }

  if (!groups.length) {
    return <p className="text-sm text-[#6b7280]">Crea un grupo antes de subir evidencias.</p>;
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
        <Label htmlFor="title">Título (opcional)</Label>
        <Input id="title" name="title" placeholder="Ej. Foto filtro terminado" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="file">Archivo</Label>
        <Input id="file" name="file" type="file" required />
      </div>
      {error ? <p className="md:col-span-2 text-sm text-red-600">{error}</p> : null}
      <div className="md:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Subiendo…" : "Subir evidencia"}
        </Button>
      </div>
    </form>
  );
}
