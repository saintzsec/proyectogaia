import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminProyectosPage() {
  const { supabase } = await requireUser();
  const { data: kits } = await supabase
    .from("kit_projects")
    .select("id, slug, name, is_published, updated_at")
    .order("name");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827]">
            Proyectos / kits
          </h1>
          <p className="mt-2 max-w-2xl text-[#4b5563]">
            Crea kits nuevos o edita los existentes. Lo publicado aparece en el sitio y en el panel
            docente.
          </p>
        </div>
        <Link href="/admin/proyectos/nuevo">
          <Button type="button">Nuevo proyecto</Button>
        </Link>
      </div>
      <div className="overflow-x-auto rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#e5e7eb] bg-[#f9fafb] text-xs uppercase text-[#6b7280]">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {kits?.length ? (
              kits.map((k) => (
                <tr key={k.id} className="border-b border-[#f3f4f6]">
                  <td className="px-4 py-3 font-medium text-[#111827]">{k.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#6b7280]">{k.slug}</td>
                  <td className="px-4 py-3">{k.is_published ? "Publicado" : "Borrador"}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/proyectos/${k.id}`}
                      className="font-medium text-[#0baba9] hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-[#6b7280]">
                  Sin kits. Ejecuta las migraciones con datos semilla.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
