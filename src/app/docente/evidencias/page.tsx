import { requireUser } from "@/lib/auth";
import { EvidenceUploadForm } from "@/components/docente/evidence-upload-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DocenteEvidenciasPage() {
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

  const { data: files } = groupIds.length
    ? await supabase
        .from("evidence_files")
        .select("id, title, storage_path, created_at, student_groups(name)")
        .in("student_group_id", groupIds)
        .order("created_at", { ascending: false })
    : { data: [] as never[] };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827]">
          Evidencias
        </h1>
        <p className="mt-2 text-[#4b5563]">
          Fotografías o documentos asociados a los grupos del piloto. Requiere bucket «evidencias»
          en Supabase Storage (ver README).
        </p>
      </div>

      <Card>
        <CardTitle>Subir archivo</CardTitle>
        <CardDescription>
          Los archivos quedan en rutas privadas; en una siguiente iteración se pueden firmar URLs de
          descarga.
        </CardDescription>
        <div className="mt-6">
          <EvidenceUploadForm groups={groups ?? []} />
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-semibold text-[#111827]">Registro</h2>
        <ul className="mt-4 space-y-3">
          {files?.length ? (
            (files as Record<string, unknown>[]).map((f) => {
              const raw = f.student_groups as unknown;
              const sg = (Array.isArray(raw) ? raw[0] : raw) as
                | { name: string }
                | null
                | undefined;
              return (
                <li
                  key={f.id as string}
                  className="rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white px-4 py-3 text-sm"
                >
                  <p className="font-medium text-[#111827]">{(f.title as string) ?? "Sin título"}</p>
                  <p className="text-xs text-[#6b7280]">
                    Grupo: {sg?.name ?? "—"} · {new Date(f.created_at as string).toLocaleString("es")}
                  </p>
                  <p className="mt-1 font-mono text-xs text-[#9ca3af] break-all">
                    {f.storage_path as string}
                  </p>
                </li>
              );
            })
          ) : (
            <p className="text-sm text-[#6b7280]">No hay evidencias registradas.</p>
          )}
        </ul>
      </div>
    </div>
  );
}
