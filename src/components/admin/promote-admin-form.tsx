"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { promoteToAdmin } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSaveToast } from "@/components/ui/save-toast";

type Opt = { id: string; label: string };

export function PromoteAdminForm({ candidates }: { candidates: Opt[] }) {
  const router = useRouter();
  const { showSaved } = useSaveToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await promoteToAdmin(fd);
    setLoading(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    showSaved("Administrador asignado");
    e.currentTarget.reset();
    router.refresh();
  }

  if (!candidates.length) {
    return <p className="text-sm text-[#6b7280]">No hay perfiles docentes para promover.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-[#92400e]">
        Promueve a administrador GAIA solo a cuentas de confianza. La acción es inmediata vía RLS.
      </p>
      <div className="space-y-2">
        <Label htmlFor="profile_id">Perfil</Label>
        <select
          id="profile_id"
          name="profile_id"
          required
          className="h-10 w-full max-w-md rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm"
        >
          {candidates.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" variant="secondary" disabled={loading}>
        {loading ? "Procesando…" : "Promover a admin GAIA"}
      </Button>
    </form>
  );
}
