import { requireUser } from "@/lib/auth";
import { AdminGroupsTable } from "@/components/admin/admin-groups-table";

export const dynamic = "force-dynamic";

export default async function AdminGruposPage() {
  const { supabase } = await requireUser();

  const { data: groups } = await supabase
    .from("student_groups")
    .select("id, name, school_id, teacher_id, grade_level, academic_year, schools(name), teachers(profile_id)")
    .order("created_at", { ascending: false });

  const { data: schools } = await supabase.from("schools").select("id, name").order("name");
  const { data: teachers } = await supabase.from("teachers").select("id, profile_id").order("created_at");
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "docente")
    .order("full_name");

  const profileNameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827]">
          Grupos (todos los colegios)
        </h1>
        <p className="mt-2 text-[#4b5563]">
          Vista de supervisión del piloto. La creación y edición cotidiana ocurre en el panel
          docente.
        </p>
      </div>

      <AdminGroupsTable
        groups={
          groups?.map((g) => {
            const rawS = g.schools as unknown;
            const school = (Array.isArray(rawS) ? rawS[0] : rawS) as { name: string } | null | undefined;
            const rawT = g.teachers as unknown;
            const teacher = (Array.isArray(rawT) ? rawT[0] : rawT) as
              | { profile_id: string }
              | null
              | undefined;
            const teacherProfileId = teacher?.profile_id ?? null;

            return {
              id: g.id,
              name: g.name,
              school_id: g.school_id,
              school_name: school?.name ?? null,
              grade_level: g.grade_level,
              academic_year: g.academic_year,
              teacher_id: g.teacher_id,
              teacher_profile_id: teacherProfileId,
              teacher_name: teacherProfileId ? (profileNameById.get(teacherProfileId) ?? null) : null,
            };
          }) ?? []
        }
        schools={schools?.map((s) => ({ id: s.id, label: s.name })) ?? []}
        teachers={
          teachers?.map((t) => ({
            id: t.id,
            profile_id: t.profile_id,
            label: `${profileNameById.get(t.profile_id) ?? "Sin nombre"} · ${t.profile_id.slice(0, 8)}…`,
          })) ?? []
        }
      />
    </div>
  );
}
