import { requireUser } from "@/lib/auth";
import { CreateGroupForm } from "@/components/docente/create-group-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DocenteGruposPage() {
  const { profile, supabase } = await requireUser();
  const { data: teacher } = await supabase
    .from("teachers")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!teacher) {
    return (
      <p className="text-sm text-[#6b7280]">
        Aún no tienes perfil docente asignado. Vuelve al resumen para ver instrucciones.
      </p>
    );
  }

  const { data: groups } = await supabase
    .from("student_groups")
    .select("id, name, grade_level, student_count_estimate, academic_year, created_at")
    .eq("teacher_id", teacher.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827]">
          Grupos
        </h1>
        <p className="mt-2 text-[#4b5563]">
          Cada grupo hereda el colegio de tu asignación docente. Los talleres y evaluaciones se
          asocian a estos grupos.
        </p>
      </div>

      <Card>
        <CardTitle>Nuevo grupo</CardTitle>
        <CardDescription>Registra un curso o sección para el piloto.</CardDescription>
        <div className="mt-6">
          <CreateGroupForm />
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-[#111827]">Tus grupos</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {groups?.length ? (
            groups.map((g) => (
              <Card key={g.id}>
                <CardTitle>{g.name}</CardTitle>
                <CardDescription>
                  {g.grade_level ?? "Sin nivel indicado"} · Año {g.academic_year}
                  {g.student_count_estimate != null
                    ? ` · ~${g.student_count_estimate} estudiantes`
                    : ""}
                </CardDescription>
                <p className="mt-2 font-mono text-xs text-[#9ca3af]">{g.id}</p>
              </Card>
            ))
          ) : (
            <p className="text-sm text-[#6b7280]">Aún no registras grupos.</p>
          )}
        </div>
      </div>
    </div>
  );
}
