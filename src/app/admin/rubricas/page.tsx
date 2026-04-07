import Link from "next/link";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminRubricasPage() {
  const { supabase } = await requireUser();
  const { data: rubrics } = await supabase
    .from("rubrics")
    .select("id, name, version, is_active, kit_projects(name)")
    .order("name");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827]">
          Rúbricas
        </h1>
        <p className="mt-2 max-w-2xl text-[#4b5563]">
          Cada rúbrica agrupa criterios puntuables usados en el módulo de evaluación docente. Edita
          metadatos y añade criterios desde el detalle.
        </p>
      </div>
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
            {rubrics?.length ? (
              rubrics.map((r) => {
                const raw = r.kit_projects as unknown;
                const kp = (Array.isArray(raw) ? raw[0] : raw) as { name: string } | null | undefined;
                return (
                  <tr key={r.id} className="border-b border-[#f3f4f6]">
                    <td className="px-4 py-3 font-medium text-[#111827]">{r.name}</td>
                    <td className="px-4 py-3 text-[#4b5563]">{kp?.name ?? "—"}</td>
                    <td className="px-4 py-3">{r.version}</td>
                    <td className="px-4 py-3">{r.is_active ? "Sí" : "No"}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/rubricas/${r.id}`}
                        className="font-medium text-[#0baba9] hover:underline"
                      >
                        Gestionar
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#6b7280]">
                  Sin rúbricas. Ejecuta migraciones con semilla.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
