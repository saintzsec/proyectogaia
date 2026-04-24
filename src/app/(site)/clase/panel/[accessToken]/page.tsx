import { ClaseStudentPanel } from "@/components/clase/clase-student-panel";
import { parseProjectQuizConfig } from "@/lib/quiz/project-quiz";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function ClasePanelPage({
  params,
}: {
  params: Promise<{ accessToken: string }>;
}) {
  const { accessToken } = await params;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return (
      <p className="mx-auto max-w-lg px-4 py-16 text-sm text-red-600">
        El sitio aún no tiene configurada la clave de servicio Supabase. El docente debe añadir{" "}
        <code className="rounded bg-[#f3f4f6] px-1">SUPABASE_SERVICE_ROLE_KEY</code> en el servidor.
      </p>
    );
  }

  const { data: member, error: me } = await admin
    .from("class_group_members")
    .select("id, display_name, is_leader, student_group_id")
    .eq("access_token", accessToken)
    .maybeSingle();

  if (me || !member) {
    return <p className="px-4 py-16 text-center text-sm text-[#6b7280]">Enlace no válido o expirado.</p>;
  }

  const { data: group, error: gErr } = await admin
    .from("student_groups")
    .select("id, class_id, name")
    .eq("id", member.student_group_id)
    .maybeSingle();

  if (gErr || !group?.class_id) {
    return <p className="px-4 py-16 text-center text-sm text-[#6b7280]">Grupo no asociado a una clase.</p>;
  }

  const { data: cls } = await admin
    .from("classes")
    .select("name, kit_project_id, kit_projects(name)")
    .eq("id", group.class_id)
    .maybeSingle();

  const kitName =
    (cls?.kit_projects as { name?: string } | null)?.name ?? "Proyecto";
  const { data: kitQuiz } = cls?.kit_project_id
    ? await admin
        .from("kit_projects")
        .select("quiz_questions")
        .eq("id", cls.kit_project_id)
        .maybeSingle()
    : { data: null };
  const quizQuestions = parseProjectQuizConfig((kitQuiz as { quiz_questions?: unknown } | null)?.quiz_questions);

  const { data: allMembers } = await admin
    .from("class_group_members")
    .select("id, display_name")
    .eq("student_group_id", member.student_group_id)
    .order("is_leader", { ascending: false });

  const { data: myPeers } = await admin
    .from("peer_evaluations")
    .select("evaluatee_member_id")
    .eq("evaluator_member_id", member.id);

  const peerTargetsDone: Record<string, boolean> = {};
  for (const row of myPeers ?? []) {
    peerTargetsDone[row.evaluatee_member_id] = true;
  }

  const { data: quiz } = await admin
    .from("group_quiz_attempts")
    .select("score_on_scale_1_5")
    .eq("student_group_id", member.student_group_id)
    .maybeSingle();

  const { data: sub } = await admin
    .from("group_project_submissions")
    .select("learning_summary")
    .eq("student_group_id", member.student_group_id)
    .maybeSingle();

  const { data: lastDecision } = await admin
    .from("teacher_grade_decisions")
    .select("final_group_grade, final_member_grades, teacher_comments, created_at")
    .eq("student_group_id", member.student_group_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let teacherGrade:
    | {
        state: "graded";
        groupGrade: number;
        personalGrade: number | null;
        comments: string | null;
        dateLabel: string;
      }
    | { state: "pending" };

  if (!lastDecision) {
    teacherGrade = { state: "pending" };
  } else {
    const fg = Number(lastDecision.final_group_grade);
    const groupGrade = Number.isFinite(fg) ? Math.round(fg * 100) / 100 : 0;
    const raw = lastDecision.final_member_grades as Record<string, unknown> | null;
    let personalGrade: number | null = null;
    if (raw && typeof raw === "object" && member.id in raw) {
      const v = raw[member.id];
      const n = typeof v === "number" ? v : Number(v);
      if (Number.isFinite(n)) personalGrade = Math.round(n * 100) / 100;
    }
    const dateLabel = new Intl.DateTimeFormat("es", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(lastDecision.created_at));
    teacherGrade = {
      state: "graded",
      groupGrade,
      personalGrade,
      comments: lastDecision.teacher_comments?.trim() || null,
      dateLabel,
    };
  }

  return (
    <ClaseStudentPanel
      accessToken={accessToken}
      currentMemberId={member.id}
      isLeader={member.is_leader}
      classTitle={cls?.name ?? "Clase"}
      kitName={kitName}
      summary={sub?.learning_summary ?? null}
      quizScore={quiz?.score_on_scale_1_5 != null ? Number(quiz.score_on_scale_1_5) : null}
      quizQuestions={quizQuestions}
      members={allMembers ?? []}
      peerTargetsDone={peerTargetsDone}
      teacherGrade={teacherGrade}
    />
  );
}
