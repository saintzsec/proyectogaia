"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  saveGroupLearningSummary,
  submitGroupQuizMvp,
  uploadEvidenceFormAction,
} from "@/app/actions/class-student-public";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSaveToast } from "@/components/ui/save-toast";
import { cn } from "@/lib/utils";

const QUIZ_Q = [
  "¿Qué es un ecosistema acuático en equilibrio?",
  "¿Cuál es un indicador de calidad del agua?",
  "El filtro biológico utiliza principalmente:",
  "La sostenibilidad implica:",
  "¿Qué documentarías como evidencia del proyecto?",
];

const QUIZ_OPTS = [
  ["Solo plantas", "Plantas, bacterias y relaciones entre ellas", "Solo agua limpia", "Solo peces"],
  ["Color del uniforme", "pH, turbidez, oxígeno disuelto", "Solo temperatura", "Solo olor"],
  ["Solo arena", "Materia viva que degrada residuos", "Solo cloro", "Solo calor"],
  ["Usar recursos sin límites", "Satisfacer hoy sin comprometer el mañana", "No medir impactos", "Evitar toda tecnología"],
  ["Solo el título", "Fotos del proceso y resultados", "Nada", "Solo opinión sin datos"],
];

type Member = { id: string; display_name: string };

export type TeacherGradePanelInfo =
  | {
      state: "graded";
      groupGrade: number;
      personalGrade: number | null;
      comments: string | null;
      dateLabel: string;
    }
  | { state: "pending" };

/** Lectura orientativa escala 1,00–5,00 (no es porcentaje; el tope es 5,00). */
function qualitativeBand15(n: number): { label: string; explanation: string } {
  if (!Number.isFinite(n)) {
    return { label: "", explanation: "" };
  }
  if (n < 2) {
    return {
      label: "Insuficiente",
      explanation: "Por debajo del umbral habitual de aprobación en esta escala.",
    };
  }
  if (n < 3) {
    return {
      label: "Básico",
      explanation:
        "Aún por debajo de 3,00, que es la referencia media entre 1 y 5. Conviene revisar la retroalimentación del docente.",
    };
  }
  if (n < 3.5) {
    return {
      label: "Suficiente",
      explanation:
        "Superas 3,00 (el centro de la escala): suele interpretarse como aprobado. No es como «3 de 10»: aquí el máximo es 5,00, no 10 ni 100.",
    };
  }
  if (n < 4.25) {
    return {
      label: "Satisfactorio",
      explanation: "Buen desempeño; estás claramente por encima del tramo mínimo aceptable.",
    };
  }
  return {
    label: "Muy bueno",
    explanation: "Estás en el tramo alto de la escala (cerca del máximo 5,00).",
  };
}

type PanelSection = "summary" | "quiz";

type SectionNotice = {
  key: number;
  section: PanelSection;
  variant: "success" | "error";
  text: string;
};

function SectionInlineNotice({
  notice,
  section,
}: {
  notice: SectionNotice | null;
  section: PanelSection;
}) {
  if (!notice || notice.section !== section) return null;
  const ok = notice.variant === "success";
  return (
    <div
      key={notice.key}
      role="status"
      aria-live="polite"
      className={cn(
        "gaia-panel-section-notice w-full rounded-[var(--radius-gaia)] border px-3 py-2.5 text-sm leading-snug",
        ok
          ? "border-green-200 bg-green-50 font-medium text-green-900"
          : "border-red-200 bg-red-50 text-red-800",
      )}
    >
      {notice.text}
    </div>
  );
}

function EvidenceUploadForm({ accessToken }: { accessToken: string }) {
  const { showSaved } = useSaveToast();
  const [state, formAction, pending] = useActionState(uploadEvidenceFormAction, null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!state?.ok || !state.receipt) return;
    showSaved("Imagen subida correctamente.");
    setFormKey((k) => k + 1);
  }, [state?.ok, state?.receipt, showSaved]);

  return (
    <form key={formKey} action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="leader_token" value={accessToken} />
      <Input type="file" name="file" accept="image/*" required />
      <div className="flex flex-col gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Subiendo…" : "Subir foto"}
        </Button>
        {state?.error ? (
          <div
            role="alert"
            className={cn(
              "gaia-panel-section-notice w-full rounded-[var(--radius-gaia)] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800",
            )}
          >
            {state.error}
          </div>
        ) : null}
        {state?.ok ? (
          <div
            role="status"
            aria-live="polite"
            className={cn(
              "gaia-panel-section-notice w-full rounded-[var(--radius-gaia)] border border-green-200 bg-green-50 px-3 py-2.5 text-sm font-medium text-green-900",
            )}
          >
            Imagen subida correctamente. Puedes elegir otra foto para añadir más evidencias.
          </div>
        ) : null}
      </div>
    </form>
  );
}

export function ClaseStudentPanel(props: {
  accessToken: string;
  currentMemberId: string;
  isLeader: boolean;
  classTitle: string;
  kitName: string;
  summary: string | null;
  quizScore: number | null;
  members: Member[];
  peerTargetsDone: Record<string, boolean>;
  teacherGrade: TeacherGradePanelInfo;
}) {
  const { showSaved } = useSaveToast();
  const [notice, setNotice] = useState<SectionNotice | null>(null);

  function showSectionSuccess(section: PanelSection, text: string) {
    setNotice({ key: Date.now(), section, variant: "success", text });
    showSaved(text);
  }

  function showSectionError(section: PanelSection, text: string) {
    setNotice({ key: Date.now(), section, variant: "error", text });
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-10">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-[#0baba9]">{props.classTitle}</p>
        <h1 className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#111827]">
          {props.kitName}
        </h1>
        <p className="mt-2 text-sm text-[#6b7280]">
          {props.isLeader
            ? "Como líder, registra el grupo: valoraciones de desempeño, resumen del aprendizaje, evidencias y quiz."
            : "Este enlace es para integrantes. En el MVP Ruta A, quien gestiona entregas y valoraciones es el líder del grupo."}
        </p>
      </header>

      {!props.isLeader ? (
        <section className="rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-[#f9fafb] p-4 text-sm text-[#4b5563]">
          <p>
            Si necesitas revisar el proyecto, pide al líder el enlace correcto o los datos del grupo.
            Las valoraciones y archivos solo puede registrarlos el líder en esta versión.
          </p>
        </section>
      ) : null}

      {props.isLeader ? (
        <>
          <section className="rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#111827]">Valoración de desempeño (líder)</h2>
            <p className="mt-1 text-xs text-amber-800">
              Registra cómo ves el desempeño de cada compañero (1–5). El sistema trata esto como dato
              <strong> sesgado</strong>: el docente valida la nota final.
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {props.members.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f3f4f6] py-2 last:border-0"
                >
                  <span>
                    {m.display_name}
                    {m.id === props.currentMemberId ? " (tú)" : ""}
                  </span>
                  {m.id === props.currentMemberId ? (
                    <span className="text-xs text-[#9ca3af]">—</span>
                  ) : props.peerTargetsDone[m.id] ? (
                    <span className="text-xs text-green-700">Registrado</span>
                  ) : (
                    <Link
                      href={`/evaluar/${props.accessToken}/${m.id}`}
                      className="inline-flex shrink-0 touch-manipulation items-center justify-center rounded-[var(--radius-gaia)] border border-[#0baba9] bg-white px-3 py-1.5 text-xs font-medium text-[#0baba9] shadow-sm transition-colors hover:bg-[#0baba9]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0baba9] active:bg-[#0baba9]/10"
                    >
                      Valorar
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#111827]">Resumen / reflexión del grupo</h2>
            <p className="mt-1 text-xs text-[#6b7280]">
              Alimenta el componente de reflexión en la nota sugerida (además de evidencias y quiz).
            </p>
            <form
              className="mt-3 space-y-2"
              action={async (fd) => {
                setNotice(null);
                fd.set("leader_token", props.accessToken);
                const r = await saveGroupLearningSummary(fd);
                if ("error" in r && r.error) showSectionError("summary", r.error);
                else showSectionSuccess("summary", "Resumen guardado correctamente.");
              }}
            >
              <Textarea
                name="learning_summary"
                rows={5}
                defaultValue={props.summary ?? ""}
                placeholder="Mínimo 20 caracteres…"
                required
                minLength={20}
              />
              <div className="flex flex-col gap-2">
                <Button type="submit" size="sm">
                  Guardar
                </Button>
                <SectionInlineNotice notice={notice} section="summary" />
              </div>
            </form>
          </section>

          <section className="rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#111827]">Evidencia (fotos)</h2>
            <p className="mt-1 text-xs text-[#6b7280]">
              Peso máximo recomendado 15&nbsp;MB por imagen. Puedes subir varias fotos, una tras otra.
            </p>
            <EvidenceUploadForm accessToken={props.accessToken} />
          </section>

          <section className="rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-[#111827]">Quiz del proyecto</h2>
            {props.quizScore != null ? (
              <p className="mt-2 text-sm text-[#4b5563]">
                Referencia en escala 1–5: <strong>{props.quizScore.toFixed(2)}</strong>
              </p>
            ) : (
              <form
                className="mt-3 space-y-4"
                action={async (fd) => {
                  setNotice(null);
                  fd.set("leader_token", props.accessToken);
                  const r = await submitGroupQuizMvp(fd);
                  if ("error" in r && r.error) showSectionError("quiz", r.error);
                  else {
                    const score = (r as { score?: number }).score;
                    const line =
                      score != null && Number.isFinite(score)
                        ? `Quiz enviado. Referencia en escala 1–5: ${score.toFixed(2)}`
                        : "Quiz enviado correctamente.";
                    showSectionSuccess("quiz", line);
                  }
                }}
              >
                {QUIZ_Q.map((q, qi) => (
                  <div key={qi} className="space-y-1">
                    <p id={`quiz-q-label-${qi}`} className="text-sm font-medium text-[#374151]">
                      {qi + 1}. {q}
                    </p>
                    <select
                      name={`q${qi}`}
                      className="h-9 w-full rounded border border-[#e5e7eb] px-2 text-sm"
                      required
                      aria-labelledby={`quiz-q-label-${qi}`}
                    >
                      <option value="">—</option>
                      {QUIZ_OPTS[qi]!.map((opt, oi) => (
                        <option key={oi} value={oi}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <div className="flex flex-col gap-2">
                  <Button type="submit" size="sm">
                    Enviar quiz
                  </Button>
                  <SectionInlineNotice notice={notice} section="quiz" />
                </div>
              </form>
            )}
          </section>
        </>
      ) : null}

      <section
        className="rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white p-4 shadow-sm"
        aria-labelledby="teacher-grade-heading"
      >
        <h2
          id="teacher-grade-heading"
          className="text-sm font-semibold text-[#111827]"
        >
          Calificación del docente
        </h2>
        {props.teacherGrade.state === "pending" ? (
          <p className="mt-2 text-sm text-[#6b7280]">
            El docente aún no ha registrado la calificación final del proyecto. Cuando lo haga,
            verás aquí la nota y cualquier comentario que deje para el equipo.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-[#374151]">
              El docente ya registró la evaluación en la escala oficial{" "}
              <span className="whitespace-nowrap">(1,00–5,00)</span>.{" "}
              <span className="text-[#6b7280]">
                Es una escala acotada: <strong className="font-medium text-[#374151]">3,00</strong> es
                la mitad entre el mínimo (1) y el máximo (5), no un porcentaje sobre 10 ni sobre 100.
              </span>
            </p>
            <div className="rounded-[var(--radius-gaia)] border border-[#0baba9]/25 bg-[#0baba9]/5 px-3 py-3">
              {(() => {
                const g = props.teacherGrade.groupGrade;
                const p = props.teacherGrade.personalGrade;
                const same =
                  p != null && Math.abs(p - g) < 0.01;
                if (p != null && same) {
                  return (
                    <p className="text-base font-semibold text-[#0b5c5a]">
                      Calificación (proyecto e individual):{" "}
                      <span className="tabular-nums text-[#111827]">{g.toFixed(2)}</span>
                    </p>
                  );
                }
                if (p != null) {
                  return (
                    <>
                      <p className="text-base font-semibold text-[#0b5c5a]">
                        Tu nota: <span className="tabular-nums">{p.toFixed(2)}</span>
                      </p>
                      <p className="mt-1 text-sm text-[#374151]">
                        Nota del proyecto (grupo):{" "}
                        <span className="tabular-nums font-semibold text-[#111827]">
                          {g.toFixed(2)}
                        </span>
                      </p>
                      <p className="mt-2 text-xs text-[#6b7280]">
                        El docente puede ajustar la nota individual respecto a la del equipo.
                      </p>
                    </>
                  );
                }
                return (
                  <p className="text-base font-semibold text-[#0b5c5a]">
                    Nota del proyecto:{" "}
                    <span className="tabular-nums text-[#111827]">{g.toFixed(2)}</span>
                  </p>
                );
              })()}
            </div>
            <div className="rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#0baba9]">
                Cómo leer esta nota
              </p>
              <p className="mt-1.5 text-sm font-medium text-[#111827]">
                Proyecto ({props.teacherGrade.groupGrade.toFixed(2)}):{" "}
                {qualitativeBand15(props.teacherGrade.groupGrade).label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#4b5563]">
                {qualitativeBand15(props.teacherGrade.groupGrade).explanation}
              </p>
              {props.teacherGrade.personalGrade != null &&
              Math.abs(props.teacherGrade.personalGrade - props.teacherGrade.groupGrade) >= 0.01 ? (
                <>
                  <p className="mt-3 text-sm font-medium text-[#111827]">
                    Tu nota ({props.teacherGrade.personalGrade.toFixed(2)}):{" "}
                    {qualitativeBand15(props.teacherGrade.personalGrade).label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#4b5563]">
                    {qualitativeBand15(props.teacherGrade.personalGrade).explanation}
                  </p>
                </>
              ) : null}
            </div>
            {props.teacherGrade.comments ? (
              <div className="rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                  Comentario del docente
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-[#374151]">
                  {props.teacherGrade.comments}
                </p>
              </div>
            ) : null}
            <p className="text-xs text-[#9ca3af]">Registrada el {props.teacherGrade.dateLabel}</p>
          </div>
        )}
      </section>
    </div>
  );
}
