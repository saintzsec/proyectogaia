import { requireUser } from "@/lib/auth";
import { CreateSchoolForm } from "@/components/admin/create-school-form";
import { SchoolsDataTable } from "@/components/admin/schools-data-table";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminColegiosPage() {
  const { supabase } = await requireUser();
  const { data: schools } = await supabase
    .from("schools")
    .select("id, name, city, country, created_at")
    .order("name");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827]">
          Colegios
        </h1>
        <p className="mt-2 text-[#4b5563]">
          Alta de instituciones participantes. El seed crea un colegio piloto por defecto.
        </p>
      </div>

      <Card>
        <CardTitle>Nuevo colegio</CardTitle>
        <CardDescription>Los docentes se asocian a un colegio existente.</CardDescription>
        <div className="mt-6">
          <CreateSchoolForm />
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-[#111827]">Listado</h2>
        <div className="mt-4">
          <SchoolsDataTable data={schools ?? []} />
        </div>
      </div>
    </div>
  );
}
