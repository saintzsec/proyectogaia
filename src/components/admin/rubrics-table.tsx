"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createRubric } from "@/app/actions/rubrics-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveToast } from "@/components/ui/save-toast";

type RubricRow = {
  id: string;
  name: string;
  version: number;
  is_active: boolean;
  kit_name: string | null;
};

type KitOption = { id: string; name: string };

export function RubricsTable({ rubrics, kits }: { rubrics: RubricRow[]; kits: KitOption[] }) {
  const router = useRouter();
  const { showSaved } = useSaveToast();
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const visible = useMemo(() => {
    if (statusFilter === "active") return rubrics.filter((r) => r.is_active);
    if (statusFilter === "inactive") return rubrics.filter((r) => !r.is_active);
    return rubrics;
  }, [rubrics, statusFilter]);

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await createRubric(fd);
    setLoading(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    showSaved("Rúbrica creada");
    setShowCreate(false);
    (e.currentTarget as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? "Cerrar" : "Nueva rúbrica"}
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Label htmlFor="rubric-status-filter" className="text-sm font-medium text-[#374151]">
            Filtrar:
          </Label>
          <select
            id="rubric-status-filter"
            title="Filtrar por activa"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
            className="h-10 rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm"
          >
            <option value="all">Todas</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>
        </div>
      </div>

      {showCreate ? (
        <form onSubmit={onCreate} className="rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-[#f9fafb] p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" required placeholder="Rúbrica nueva" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="version">Versión</Label>
              <Input id="version" name="version" type="number" min={1} defaultValue={1} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="is_active">Activa</Label>
              <select
                id="is_active"
                name="is_active"
                title="Estado de la rúbrica"
                className="h-10 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm"
                defaultValue="true"
              >
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="kit_project_id">Proyecto asociado</Label>
              <select
                id="kit_project_id"
                name="kit_project_id"
                title="Proyecto asociado"
                className="h-10 w-full rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-3 text-sm"
                defaultValue=""
              >
                <option value="">— Sin proyecto —</option>
                {kits.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          <div className="mt-3">
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Creando..." : "Crear rúbrica"}
            </Button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#e5e7eb] bg-[#f9fafb] text-xs uppercase text-[#6b7280]">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Kit</th>
              <th className="px-4 py-3">Versión</th>
              <th className="px-4 py-3">Activa</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {visible.length ? (
              visible.map((r) => (
                <tr key={r.id} className="border-b border-[#f3f4f6]">
                  <td className="px-4 py-3 font-medium text-[#111827]">{r.name}</td>
                  <td className="px-4 py-3 text-[#4b5563]">{r.kit_name ?? "—"}</td>
                  <td className="px-4 py-3">{r.version}</td>
                  <td className="px-4 py-3">
                    {r.is_active ? (
                      <span className="inline-flex rounded-full bg-[#dcfce7] px-2.5 py-1 text-xs font-medium text-[#166534]">
                        Sí
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-[#fde2e8] px-2.5 py-1 text-xs font-medium text-[#7f1d1d]">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/rubricas/${r.id}`} className="font-medium text-[#0baba9] hover:underline">
                      Gestionar
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#6b7280]">
                  No hay rúbricas para este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
