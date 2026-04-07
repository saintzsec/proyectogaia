-- Enriquecimiento GAIA: guías en tutoriales, más semilla y criterio de rúbrica opcional
-- Ejecutar después de la migración inicial.

alter table public.tutorials add column if not exists content_md text;

comment on column public.tutorials.content_md is 'Guía textual (Markdown) para la ficha del minitutorial';

-- Texto ampliado del kit piloto (si ya existe fila)
update public.kit_projects
set
  short_description = 'Diseña y construye un filtro por capas con materiales recuperables, mide turbidez relativa y debate límites entre solución casera y saneamiento de escala urbana.',
  description = E'En este proyecto el grupo aborda una **pregunta motriz** del tipo: «¿Cómo podemos reducir la turbidez de un agua simulada de forma segura en el aula?». Se trabaja en ciclos PBL: hipótesis, prototipo, prueba, iteración y comunicación de resultados.\n\n**Seguridad:** el agua tratada en el aula **no** debe consumirse. Se usa agua preparada con tierra fina o similar, siguiendo protocolo institucional.',
  learning_objective = E'Al finalizar, el estudiantado debería poder:\n- Describir el rol de cada capa (filtración mecánica, adsorción parcial).\n- Registrar mediciones con unidades o escalas acordadas.\n- Proponer **una** variable de mejora y justificarla con datos.\n- Relacionar el experimento con uso responsable del agua y ODS 6.'
where slug = 'filtro-biologico-agua';

-- Contenido detallado por minitutorial existente
update public.tutorials
set
  description = 'Montaje ordenado de capas (grava → arena → carbón → algodón) evitando «túneles» de agua y fugas laterales.',
  content_md = E'## Objetivo\nGarantizar que el agua recorra **todas** las capas sin atajos.\n\n## Pasos\n1. Corta la botella y prepara el tapón de drenaje (agujeros pequeños + tela).\n2. Añade grava gruesa como soporte (2–3 cm).\n3. Arena lavada en capa media (compactar ligeramente sin bloquear).\n4. Carbón vegetal en trozos uniformes; una capa fina basta al inicio.\n5. Cierra con algodón o tela para retener partículas sueltas.\n6. Prueba con agua clara primero para detectar fugas.\n\n## Tip docente\nEtiqueta cada capa en el envase para facilitar la retroalimentación con la rúbrica de diseño.'
where slug = 'armado-capas';

update public.tutorials
set
  description = 'Escala visual 0–4 y registro en tabla con al menos dos repeticiones por condición.',
  content_md = E'## Objetivo\nEstandarizar cómo el equipo **ve** la turbidez cuando no hay fotómetro.\n\n## Pasos\n1. Define anclas de la escala (0 = transparente, 4 = muy turbio) con ejemplos en frascos testigo.\n2. Cada medición: mismo volumen, misma iluminación, misma distancia visual.\n3. Registra hora, observador y nota (0–4).\n4. Repite al menos dos veces por condición.\n\n## Tip docente\nAlterna roles de observador para reducir sesgo; la rúbrica valora trazabilidad de datos.'
where slug = 'turbidez-escolar';

update public.tutorials
set
  description = 'Cómo guiar el segundo ciclo del filtro cambiando solo un parámetro (PBL puro).',
  content_md = E'## Objetivo\nQue el equipo aprenda a **aislar variables**: un cambio por iteración.\n\n## Pasos\n1. Lista de posibles variables: grosor de arena, orden de capas, tiempo de filtrado, etc.\n2. El grupo elige **una** y formula predicción medible.\n3. Ejecuta, registra, compara con la línea base.\n4. Sesión corta de «¿qué aprendimos?» antes del siguiente ciclo.\n\n## Tip docente\nSi cambian dos cosas a la vez, úsalo como contraejemplo metodológico — encaja con el criterio de análisis en la rúbrica.'
where slug = 'iteracion-pbl';

-- Tutoriales adicionales (slugs nuevos)
insert into public.tutorials (kit_project_id, title, slug, description, video_url, duration_min, sort_order, is_public, content_md)
select k.id, v.title, v.slug, v.description, v.video_url, v.duration_min, v.sort_order, true, v.content_md
from public.kit_projects k
cross join (values
  (
    'Seguridad con agua simulada',
    'seguridad-agua-simulada',
    'Protocolo mínimo: etiquetado, no ingestión, vertido en sumidero autorizado.',
    null,
    5,
    4,
    E'## Reglas de oro\n- Rotula todo: «No potable — uso didáctico».\n- Prohíbe beber o usar en preparación de alimentos.\n- Define con dirección el punto de descarte.\n\n## En clase\n- Guantes si manipulan tierra húmeda repetidamente.\n- Lavado de manos al terminar.'
  ),
  (
    'De la feria al informe breve',
    'feria-informe-breve',
    'Estructura de 1 página: pregunta, método, resultado, limitación.',
    null,
    7,
    5,
    E'## Plantilla sugerida\n1. Pregunta e hipótesis (2–3 líneas).\n2. Esquema del filtro (foto o dibujo).\n3. Tabla resumen de turbidez.\n4. Conclusión + **una** limitación honesta del filtro casero.\n\n## Evaluación\nConecta directamente con el criterio de comunicación científica de la rúbrica GAIA.'
  )
) as v(title, slug, description, video_url, duration_min, sort_order, content_md)
where k.slug = 'filtro-biologico-agua'
on conflict (slug) do nothing;

-- Criterio extra de rúbrica (colaboración) si aún no existe
insert into public.rubric_criteria (rubric_id, label, description, max_score, sort_order)
select r.id,
  'Colaboración y roles',
  'Rotación de roles, escucha activa y responsabilidad compartida en el equipo',
  4,
  6
from public.rubrics r
where r.name = 'Rúbrica filtro biológico — versión piloto'
  and not exists (
    select 1 from public.rubric_criteria rc
    where rc.rubric_id = r.id and rc.label = 'Colaboración y roles'
  );
