import { requireUser } from "@/lib/auth";
import { AssignTeacherForm } from "@/components/admin/assign-teacher-form";
import { LinkedTeachersTable } from "@/components/admin/linked-teachers-table";
import { PromoteAdminForm } from "@/components/admin/promote-admin-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminDocentesPage() {
  const { supabase } = await requireUser();

  const { data: teachers } = await supabase
    .from("teachers")
    .select("id, profile_id, school_id, schools(name), active")
    .order("created_at", { ascending: false });

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("role", "docente")
    .order("full_name");

  const { data: schools } = await supabase.from("schools").select("id, name").order("name");

  const taken = new Set(teachers?.map((t) => t.profile_id) ?? []);
  const freeProfiles =
    profiles
      ?.filter((p) => !taken.has(p.id))
      .map((p) => ({
        id: p.id,
        label: `${p.full_name ?? "Sin nombre"} · ${p.id.slice(0, 8)}…`,
      })) ?? [];

  const schoolOpts =
    schools?.map((s) => ({
      id: s.id,
      label: s.name,
    })) ?? [];

  const promoteCandidates =
    profiles?.map((p) => ({
      id: p.id,
      label: `${p.full_name ?? "Sin nombre"} · ${p.id.slice(0, 8)}…`,
    })) ?? [];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827]">
          Docentes
        </h1>
        <p className="mt-2 text-[#4b5563]">
          Vincula cuentas existentes (rol docente) con un colegio. El alta de usuarios ocurre vía
          Supabase Auth.
        </p>
      </div>

      <Card>
        <CardTitle>Asignar docente a colegio</CardTitle>
        <CardDescription>
          Solo aparecen perfiles con rol docente que aún no tienen fila en «teachers».
        </CardDescription>
        <div className="mt-6">
          <AssignTeacherForm profiles={freeProfiles} schools={schoolOpts} />
        </div>
      </Card>

      <Card>
        <CardTitle>Promover a administrador GAIA</CardTitle>
        <CardDescription>Uso excepcional para bootstrap o nuevos coordinadores.</CardDescription>
        <div className="mt-6">
          <PromoteAdminForm candidates={promoteCandidates} />
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-[#111827]">Docentes vinculados</h2>
        <LinkedTeachersTable
          teachers={
            (profiles ?? []).map((p) => {
              const link = teachers?.find((t) => t.profile_id === p.id) ?? null;
              const raw = link?.schools as unknown;
              const school = (Array.isArray(raw) ? raw[0] : raw) as { name: string } | null | undefined;
              return {
                profile_id: p.id,
                teacher_id: link?.id ?? null,
                teacher_name: p.full_name ?? null,
                active: link?.active ?? null,
                school_id: link?.school_id ?? null,
                school_name: school?.name ?? null,
              };
            }) ?? []
          }
          schools={schoolOpts}
        />
      </div>
    </div>
  );
}
