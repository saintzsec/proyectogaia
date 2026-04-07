import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { CreateClassForm } from "@/components/docente/create-class-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DocenteClasesPage() {
  const { profile, supabase } = await requireUser();
  const { data: teacher } = await supabase
    .from("teachers")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!teacher) {
    return <p className="text-sm text-[#6b7280]">Sin perfil docente.</p>;
  }

  const { data: kits } = await supabase
    .from("kit_projects")
    .select("id, name")
    .eq("is_published", true)
    .order("name");

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, join_code, status, created_at, kit_projects(name)")
    .eq("teacher_id", teacher.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827] md:text-3xl">
          Clases y calificación
        </h1>
        <p className="mt-2 max-w-2xl text-[#4b5563]">
          Cada clase tiene un código único. Los líderes registran grupos desde el sitio público. Aquí ves
          el progreso, la nota sugerida y cierras con tu decisión final (1,00–5,00).
        </p>
      </div>

      <Card>
        <CardTitle>Nueva clase</CardTitle>
        <CardDescription>Asocia un proyecto publicado y obtén el código para tus estudiantes.</CardDescription>
        <div className="mt-6">
          <CreateClassForm kits={kits?.map((k) => ({ id: k.id, name: k.name })) ?? []} />
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-[#111827]">Tus clases</h2>
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#e5e7eb] bg-[#f9fafb] text-xs uppercase text-[#6b7280]">
              <tr>
                <th className="px-4 py-3">Clase</th>
                <th className="px-4 py-3">Proyecto</th>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {classes?.length ? (
                classes.map((c: Record<string, unknown>) => {
                  const kp = c.kit_projects as { name?: string } | { name?: string }[] | null;
                  const kn = Array.isArray(kp) ? kp[0]?.name : kp?.name;
                  return (
                    <tr key={c.id as string} className="border-b border-[#f3f4f6]">
                      <td className="px-4 py-3 font-medium">{c.name as string}</td>
                      <td className="px-4 py-3 text-[#4b5563]">{kn ?? "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs">{c.join_code as string}</td>
                      <td className="px-4 py-3">
                        <Badge className="capitalize">{c.status as string}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/docente/clases/${c.id as string}`}
                          className="font-medium text-[#0baba9] hover:underline"
                        >
                          Ver grupos →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#6b7280]">
                    Aún no tienes clases. Crea la primera arriba.
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
