export type ProjectQuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

export const DEFAULT_PROJECT_QUIZ: ProjectQuizQuestion[] = [
  {
    question: "¿Qué es un ecosistema acuático en equilibrio?",
    options: [
      "Solo plantas",
      "Plantas, bacterias y relaciones entre ellas",
      "Solo agua limpia",
      "Solo peces",
    ],
    correctIndex: 1,
  },
  {
    question: "¿Cuál es un indicador de calidad del agua?",
    options: ["Color del uniforme", "pH, turbidez, oxígeno disuelto", "Solo temperatura", "Solo olor"],
    correctIndex: 1,
  },
  {
    question: "El filtro biológico utiliza principalmente:",
    options: ["Solo arena", "Materia viva que degrada residuos", "Solo cloro", "Solo calor"],
    correctIndex: 1,
  },
  {
    question: "La sostenibilidad implica:",
    options: [
      "Usar recursos sin límites",
      "Satisfacer hoy sin comprometer el mañana",
      "No medir impactos",
      "Evitar toda tecnología",
    ],
    correctIndex: 1,
  },
  {
    question: "¿Qué documentarías como evidencia del proyecto?",
    options: ["Solo el título", "Fotos del proceso y resultados", "Nada", "Solo opinión sin datos"],
    correctIndex: 1,
  },
];

export function parseProjectQuizConfig(raw: unknown): ProjectQuizQuestion[] {
  if (!Array.isArray(raw)) return DEFAULT_PROJECT_QUIZ;
  const items = raw
    .map((entry) => {
      const r = entry as {
        question?: unknown;
        options?: unknown;
        correctIndex?: unknown;
        correct_index?: unknown;
      };
      const question = typeof r.question === "string" ? r.question.trim() : "";
      const options = Array.isArray(r.options)
        ? r.options
            .map((o) => (typeof o === "string" ? o.trim() : ""))
            .filter((o) => o.length > 0)
        : [];
      const c0 = typeof r.correctIndex === "number" ? r.correctIndex : Number(r.correctIndex);
      const c1 = typeof r.correct_index === "number" ? r.correct_index : Number(r.correct_index);
      const correctIndex = Number.isInteger(c0) ? c0 : Number.isInteger(c1) ? c1 : 0;
      if (!question || options.length < 2) return null;
      if (correctIndex < 0 || correctIndex >= options.length) return null;
      return { question, options, correctIndex };
    })
    .filter((x): x is ProjectQuizQuestion => Boolean(x));
  return items.length ? items : DEFAULT_PROJECT_QUIZ;
}
