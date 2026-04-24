"use client";

import { useState } from "react";
import { updateKitProjectQuiz } from "@/app/actions/kits-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSaveToast } from "@/components/ui/save-toast";
import type { ProjectQuizQuestion } from "@/lib/quiz/project-quiz";

export function ProjectQuizForm({
  kitProjectId,
  initialQuestions,
}: {
  kitProjectId: string;
  initialQuestions: ProjectQuizQuestion[];
}) {
  const { showSaved } = useSaveToast();
  const [questions, setQuestions] = useState<ProjectQuizQuestion[]>(initialQuestions);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        options: ["", "", "", ""],
        correctIndex: 0,
      },
    ]);
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSave() {
    setError(null);
    setLoading(true);
    const fd = new FormData();
    fd.set("kit_project_id", kitProjectId);
    fd.set("questions", JSON.stringify(questions));
    const res = await updateKitProjectQuiz(fd);
    setLoading(false);
    if ("error" in res && res.error) {
      setError(res.error);
      return;
    }
    showSaved("Quiz actualizado");
  }

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={qi} className="rounded-[var(--radius-gaia)] border border-[#e5e7eb] bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#111827]">Pregunta {qi + 1} (1 punto)</p>
            <button
              type="button"
              className="rounded px-2 py-1 text-xs text-[#7f1d1d] hover:bg-[#fde2e8]"
              onClick={() => removeQuestion(qi)}
            >
              Eliminar
            </button>
          </div>
          <div className="space-y-2">
            <Input
              value={q.question}
              onChange={(e) =>
                setQuestions((prev) =>
                  prev.map((item, i) => (i === qi ? { ...item, question: e.target.value } : item)),
                )
              }
              placeholder="Escribe la pregunta"
            />
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#374151]">
                Opciones (marca la correcta con el selector)
              </p>
              {q.options.map((opt, oi) => {
                const isCorrect = q.correctIndex === oi;
                return (
                  <label
                    key={oi}
                    className={`flex items-center gap-2 rounded-[var(--radius-gaia)] border px-2 py-2 transition-colors ${
                      isCorrect
                        ? "border-green-300 bg-green-50"
                        : "border-[#e5e7eb] bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`quiz-correct-${qi}`}
                      checked={isCorrect}
                      onChange={() =>
                        setQuestions((prev) =>
                          prev.map((item, i) =>
                            i === qi ? { ...item, correctIndex: oi } : item,
                          ),
                        )
                      }
                      className="h-4 w-4 accent-green-600"
                      aria-label={`Marcar opción ${oi + 1} como correcta`}
                    />
                    <div className="flex-1">
                      <Input
                        value={opt}
                        onChange={(e) =>
                          setQuestions((prev) =>
                            prev.map((item, i) =>
                              i === qi
                                ? {
                                    ...item,
                                    options: item.options.map((o, k) =>
                                      k === oi ? e.target.value : o,
                                    ),
                                  }
                                : item,
                            ),
                          )
                        }
                        placeholder={`Texto de opción ${oi + 1}`}
                        className={isCorrect ? "border-green-300" : ""}
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={addQuestion}>
          Agregar pregunta
        </Button>
        <Button type="button" onClick={onSave} disabled={loading}>
          {loading ? "Guardando..." : "Guardar quiz"}
        </Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <p className="text-xs text-[#6b7280]">
        Puntaje automático: cada pregunta correcta vale 1 punto y se calcula sobre el total.
      </p>
    </div>
  );
}
