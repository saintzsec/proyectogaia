import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ProjectQuizForm } from "@/components/admin/project-quiz-form";
import { RubricCriterionForm } from "@/components/admin/rubric-criterion-form";
import { RubricMetaForm } from "@/components/admin/rubric-meta-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { parseProjectQuizConfig } from "@/lib/quiz/project-quiz";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function AdminRubricDetailPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const { data: rubric } = await supabase
    .from("rubrics")
    .select("id, name, version, is_active, kit_project_id, kit_projects(name)")
    .eq("id", id)
    .maybeSingle();

  if (!rubric) notFound();

  const { data: criteria } = await supabase
    .from("rubric_criteria")
    .select("id, label, description, max_score, sort_order")
    .eq("rubric_id", id)
    .order("sort_order");
  const { data: kits } = await supabase.from("kit_projects").select("id, name").order("name");

  const rawKp = rubric.kit_projects as unknown;
  const kp = (Array.isArray(rawKp) ? rawKp[0] : rawKp) as { name: string } | null | undefined;
  const maxTotal = criteria?.reduce((acc, c) => acc + c.max_score, 0) ?? 0;
  const { data: kitProject } = rubric.kit_project_id
    ? await supabase
        .from("kit_projects")
        .select("id, quiz_questions")
        .eq("id", rubric.kit_project_id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="space-y-8">
      <Link href="/admin/rubricas" className="text-sm font-medium text-[#0baba9] hover:underline">
        ← Volver a rúbricas
      </Link>
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827]">
          {rubric.name}
        </h1>
        {kp?.name ? (
          <p className="mt-1 text-sm text-[#42b232]">Kit: {kp.name}</p>
        ) : null}
        <p className="mt-2 text-sm text-[#6b7280]">
          Puntaje máximo teórico (suma de criterios):{" "}
          <strong className="text-[#111827]">{maxTotal}</strong>
        </p>
      </div>

      <Card>
        <CardTitle>Metadatos</CardTitle>
        <CardDescription>Nombre, versión y si está disponible para nuevas evaluaciones.</CardDescription>
        <div className="mt-4">
          <RubricMetaForm
            rubric={{
              id: rubric.id,
              name: rubric.name,
              version: rubric.version,
              kit_project_id: rubric.kit_project_id,
              is_active: rubric.is_active,
            }}
            kits={kits ?? []}
          />
        </div>
      </Card>

      <Card>
        <CardTitle>Criterios</CardTitle>
        <CardDescription>
          Orden y puntaje máximo por fila. Los docentes ven esta escala en «Rúbricas» y puntúan en
          «Evaluaciones».
        </CardDescription>
        <div className="mt-6 overflow-x-auto rounded-[var(--radius-gaia)] border border-[#e5e7eb]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#e5e7eb] bg-[#f9fafb] text-xs uppercase text-[#6b7280]">
              <tr>
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3">Criterio</th>
                <th className="px-4 py-3">Máx.</th>
              </tr>
            </thead>
            <tbody>
              {criteria?.length ? (
                criteria.map((c) => (
                  <tr key={c.id} className="border-b border-[#f3f4f6]">
                    <td className="px-4 py-3 text-[#6b7280]">{c.sort_order}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#111827]">{c.label}</p>
                      {c.description ? (
                        <p className="mt-1 text-xs text-[#6b7280]">{c.description}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-mono">{c.max_score}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-[#6b7280]">
                    Sin criterios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-8">
          <p className="mb-3 text-sm font-medium text-[#111827]">Añadir criterio</p>
          <RubricCriterionForm rubricId={rubric.id} />
        </div>
      </Card>

      <Card>
        <CardTitle>Quiz del proyecto</CardTitle>
        <CardDescription>
          Edita preguntas y respuestas del quiz que completan los estudiantes en el panel del grupo.
          Cada pregunta correcta vale 1 punto.
        </CardDescription>
        <div className="mt-6">
          {kitProject?.id ? (
            <ProjectQuizForm
              kitProjectId={kitProject.id}
              initialQuestions={parseProjectQuizConfig((kitProject as { quiz_questions?: unknown }).quiz_questions)}
            />
          ) : (
            <p className="text-sm text-[#6b7280]">
              Esta rúbrica no tiene un proyecto asociado, por eso no se puede configurar quiz.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
