-- Trazabilidad en decisión docente: copia de nota sugerida, desglose de fórmula y rúbrica editable

alter table public.teacher_grade_decisions
  add column if not exists proposed_group_grade_at_decision numeric(4,2)
    check (proposed_group_grade_at_decision is null or (proposed_group_grade_at_decision >= 1 and proposed_group_grade_at_decision <= 5)),
  add column if not exists formula_breakdown jsonb default '{}'::jsonb,
  add column if not exists rubric_criteria jsonb,
  add column if not exists rubric_average_1_5 numeric(4,2)
    check (rubric_average_1_5 is null or (rubric_average_1_5 >= 1 and rubric_average_1_5 <= 5));

comment on column public.teacher_grade_decisions.proposed_group_grade_at_decision is 'Nota sugerida del sistema (snapshot) al momento de la decisión.';
comment on column public.teacher_grade_decisions.formula_breakdown is 'Pesos, componentes 1–5 y aportes ponderados usados para la sugerencia.';
comment on column public.teacher_grade_decisions.rubric_criteria is 'Criterios de rúbrica manual: [{label, max_points, score}, ...].';
comment on column public.teacher_grade_decisions.rubric_average_1_5 is 'Promedio 1–5 de la rúbrica manual, si aplica.';
