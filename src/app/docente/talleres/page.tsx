import { requireUser } from "@/lib/auth";
import { CreateWorkshopForm } from "@/components/docente/create-workshop-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DocenteTalleresPage() {
  const { profile, supabase } = await requireUser();
  const { data: teacher } = await supabase
    .from("teachers")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!teacher) {
    return <p className="text-sm text-[#6b7280]">Sin perfil docente asignado.</p>;
  }

  const { data: groups } = await supabase
    .from("student_groups")
    .select("id, name")
    .eq("teacher_id", teacher.id)
    .order("name");

  const groupIds = groups?.map((g) => g.id) ?? [];

  const { data: workshops } = groupIds.length
    ? await supabase
        .from("workshops")
        .select(
          "id, title, status, attendance_count, completed_at, student_groups(name), kit_projects(name)",
        )
        .in("student_group_id", groupIds)
        .order("created_at", { ascending: false })
    : { data: [] as never[] };

  const { data: kits } = await supabase.from("kit_projects").select("id, name").order("name");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827]">
          Talleres
        </h1>
        <p className="mt-2 text-[#4b5563]">
          Registra cada encuentro para mantener trazabilidad del piloto y alimentar métricas de
          cobertura.
        </p>
      </div>

      <Card>
        <CardTitle>Registrar taller</CardTitle>
        <CardDescription>Asocia el encuentro a un grupo y, si aplica, al kit trabajado.</CardDescription>
        <div className="mt-6">
          <CreateWorkshopForm groups={groups ?? []} kits={kits ?? []} />
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-[#111827]">Historial</h2>
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#e5e7eb] bg-[#f9fafb] text-xs uppercase text-[#6b7280]">
              <tr>
                <th className="px-4 py-3">Taller</th>
                <th className="px-4 py-3">Grupo</th>
                <th className="px-4 py-3">Kit</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Asistencia</th>
              </tr>
            </thead>
            <tbody>
              {workshops?.length ? (
                workshops.map((w: Record<string, unknown>) => {
                  const rawSg = w.student_groups as unknown;
                  const sg = (Array.isArray(rawSg) ? rawSg[0] : rawSg) as
                    | { name: string }
                    | null
                    | undefined;
                  const rawKp = w.kit_projects as unknown;
                  const kp = (Array.isArray(rawKp) ? rawKp[0] : rawKp) as
                    | { name: string }
                    | null
                    | undefined;
                  return (
                    <tr key={w.id as string} className="border-b border-[#f3f4f6]">
                      <td className="px-4 py-3 font-medium text-[#111827]">{w.title as string}</td>
                      <td className="px-4 py-3 text-[#4b5563]">{sg?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-[#4b5563]">{kp?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge className="bg-[#0baba9]/15 text-[#0baba9]">{w.status as string}</Badge>
                      </td>
                      <td className="px-4 py-3 text-[#4b5563]">
                        {w.attendance_count != null ? String(w.attendance_count) : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-[#6b7280]">
                    No hay talleres registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
