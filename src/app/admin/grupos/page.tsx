import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminGruposPage() {
  const { supabase } = await requireUser();

  const { data: groups } = await supabase
    .from("student_groups")
    .select("id, name, grade_level, academic_year, schools(name), teachers(profile_id)")
    .order("created_at", { ascending: false });

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

      <div className="overflow-x-auto rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[#e5e7eb] bg-[#f9fafb] text-xs uppercase text-[#6b7280]">
            <tr>
              <th className="px-4 py-3">Grupo</th>
              <th className="px-4 py-3">Colegio</th>
              <th className="px-4 py-3">Nivel</th>
              <th className="px-4 py-3">Año</th>
              <th className="px-4 py-3">Docente (perfil)</th>
            </tr>
          </thead>
          <tbody>
            {groups?.length ? (
              groups.map((g) => {
                const rawS = g.schools as unknown;
                const school = (Array.isArray(rawS) ? rawS[0] : rawS) as
                  | { name: string }
                  | null
                  | undefined;
                const rawT = g.teachers as unknown;
                const teacher = (Array.isArray(rawT) ? rawT[0] : rawT) as
                  | { profile_id: string }
                  | null
                  | undefined;
                return (
                  <tr key={g.id} className="border-b border-[#f3f4f6]">
                    <td className="px-4 py-3 font-medium text-[#111827]">{g.name}</td>
                    <td className="px-4 py-3 text-[#4b5563]">{school?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-[#4b5563]">{g.grade_level ?? "—"}</td>
                    <td className="px-4 py-3 text-[#4b5563]">{g.academic_year}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#9ca3af]">
                      {teacher?.profile_id ?? "—"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#6b7280]">
                  Sin grupos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
