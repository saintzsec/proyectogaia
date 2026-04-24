import { requireUser } from "@/lib/auth";
import { RubricsTable } from "@/components/admin/rubrics-table";

export const dynamic = "force-dynamic";

export default async function AdminRubricasPage() {
  const { supabase } = await requireUser();
  const { data: rubrics } = await supabase
    .from("rubrics")
    .select("id, name, version, is_active, kit_projects(name)")
    .order("name");
  const { data: kits } = await supabase.from("kit_projects").select("id, name").order("name");

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
      <RubricsTable
        rubrics={
          rubrics?.map((r) => {
            const raw = r.kit_projects as unknown;
            const kp = (Array.isArray(raw) ? raw[0] : raw) as { name: string } | null | undefined;
            return {
              id: r.id,
              name: r.name,
              version: r.version,
              is_active: r.is_active,
              kit_name: kp?.name ?? null,
            };
          }) ?? []
        }
        kits={kits ?? []}
      />
    </div>
  );
}
