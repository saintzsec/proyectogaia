import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminTutorialesPage() {
  const { supabase } = await requireUser();
  const { data: rows } = await supabase
    .from("tutorials")
    .select("id, slug, title, sort_order, is_public, kit_projects(name)")
    .order("sort_order");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827]">
            Minitutoriales
          </h1>
          <p className="mt-2 max-w-2xl text-[#4b5563]">
            Gestiona guías paso a paso y visibilidad. El campo «Guía completa» alimenta la ficha del
            tutorial.
          </p>
        </div>
        <Link href="/admin/tutoriales/nuevo">
          <Button type="button">Nuevo minitutorial</Button>
        </Link>
      </div>
      <div className="overflow-x-auto rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#e5e7eb] bg-[#f9fafb] text-xs uppercase text-[#6b7280]">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Kit</th>
              <th className="px-4 py-3">Orden</th>
              <th className="px-4 py-3">Visibilidad</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {rows?.length ? (
              rows.map((t) => {
                const raw = t.kit_projects as unknown;
                const kp = (Array.isArray(raw) ? raw[0] : raw) as { name: string } | null | undefined;
                return (
                  <tr key={t.id} className="border-b border-[#f3f4f6]">
                    <td className="px-4 py-3 font-medium text-[#111827]">{t.title}</td>
                    <td className="px-4 py-3 text-[#4b5563]">{kp?.name ?? "—"}</td>
                    <td className="px-4 py-3">{t.sort_order}</td>
                    <td className="px-4 py-3">{t.is_public ? "Público" : "Interno"}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/tutoriales/${t.id}`}
                        className="font-medium text-[#0baba9] hover:underline"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#6b7280]">
                  Sin tutoriales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
