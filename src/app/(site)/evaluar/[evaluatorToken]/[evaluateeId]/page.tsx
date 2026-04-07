import Link from "next/link";
import { PeerEvaluationForm } from "@/components/clase/peer-evaluation-form";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function EvaluarCompaneroPage({
  params,
}: {
  params: Promise<{ evaluatorToken: string; evaluateeId: string }>;
}) {
  const { evaluatorToken, evaluateeId } = await params;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return <p className="p-8 text-sm text-red-600">Configuración del servidor incompleta.</p>;
  }

  const { data: evaluator, error: e1 } = await admin
    .from("class_group_members")
    .select("id, display_name, student_group_id")
    .eq("access_token", evaluatorToken)
    .maybeSingle();

  if (e1 || !evaluator) {
    return <p className="p-8 text-sm text-[#6b7280]">Enlace de evaluación no válido.</p>;
  }

  if (evaluator.id === evaluateeId) {
    return <p className="p-8 text-sm text-[#6b7280]">No puedes evaluarte a ti mismo.</p>;
  }

  const { data: evaluatee, error: e2 } = await admin
    .from("class_group_members")
    .select("id, display_name, student_group_id")
    .eq("id", evaluateeId)
    .maybeSingle();

  if (e2 || !evaluatee || evaluatee.student_group_id !== evaluator.student_group_id) {
    return <p className="p-8 text-sm text-[#6b7280]">Integrante no encontrado en tu grupo.</p>;
  }

  const { data: existing } = await admin
    .from("peer_evaluations")
    .select("id")
    .eq("evaluator_member_id", evaluator.id)
    .eq("evaluatee_member_id", evaluatee.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-12">
      <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#111827]">
        Evaluar a {evaluatee.display_name}
      </h1>
      <p className="text-sm text-[#6b7280]">
        Escala Likert de 1 a 5 estrellas por criterio. Toca las estrellas para elegir; sé honesto y
        constructivo.
      </p>

      {existing ? (
        <div className="space-y-4">
          <p className="text-sm font-medium text-green-700">Ya enviaste esta evaluación. Gracias.</p>
          <p className="text-sm text-[#6b7280]">
            Puedes volver al panel del grupo para valorar a otros integrantes o completar entregas.
          </p>
          <Link
            href={`/clase/panel/${evaluatorToken}`}
            className="inline-flex min-h-11 touch-manipulation items-center justify-center rounded-[var(--radius-gaia)] bg-[#0baba9] px-5 text-sm font-medium text-white transition-colors hover:bg-[#09908e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0baba9] sm:min-h-10"
          >
            Volver al panel del grupo
          </Link>
        </div>
      ) : (
        <PeerEvaluationForm
          evaluatorToken={evaluatorToken}
          evaluateeId={evaluateeId}
        />
      )}
    </div>
  );
}
