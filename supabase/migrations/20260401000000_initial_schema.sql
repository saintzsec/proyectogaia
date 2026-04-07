-- GAIA MVP — esquema inicial + RLS + seed de contenido
-- Ejecutar en Supabase SQL Editor o con CLI: supabase db push

-- Extensión para UUID
create extension if not exists "pgcrypto";

-- Roles de aplicación (alineado al brief)
create type public.app_role as enum ('admin_gaia', 'docente');

-- Perfiles ligados a auth.users
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.app_role not null default 'docente',
  locale text not null default 'es',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  country text default 'Chile',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  school_id uuid not null references public.schools (id) on delete restrict,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_groups (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  teacher_id uuid not null references public.teachers (id) on delete restrict,
  name text not null,
  grade_level text,
  academic_year text not null default '2026',
  student_count_estimate int,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.kit_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text,
  description text,
  learning_objective text,
  materials_md text,
  steps_md text,
  common_errors_md text,
  sustainability_md text,
  what_you_learn_md text,
  tutorial_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workshops (
  id uuid primary key default gen_random_uuid(),
  student_group_id uuid not null references public.student_groups (id) on delete cascade,
  kit_project_id uuid references public.kit_projects (id) on delete set null,
  title text not null,
  scheduled_at timestamptz,
  completed_at timestamptz,
  location text,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'completed', 'cancelled')),
  attendance_count int,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rubrics (
  id uuid primary key default gen_random_uuid(),
  kit_project_id uuid references public.kit_projects (id) on delete set null,
  name text not null,
  version int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rubric_criteria (
  id uuid primary key default gen_random_uuid(),
  rubric_id uuid not null references public.rubrics (id) on delete cascade,
  label text not null,
  description text,
  max_score int not null default 4 check (max_score > 0),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.evaluations (
  id uuid primary key default gen_random_uuid(),
  rubric_id uuid not null references public.rubrics (id) on delete restrict,
  student_group_id uuid not null references public.student_groups (id) on delete cascade,
  workshop_id uuid references public.workshops (id) on delete set null,
  evaluator_id uuid not null references public.profiles (id) on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  total_score numeric(10,2),
  comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.evaluation_scores (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references public.evaluations (id) on delete cascade,
  rubric_criterion_id uuid not null references public.rubric_criteria (id) on delete restrict,
  score int not null check (score >= 0),
  note text,
  unique (evaluation_id, rubric_criterion_id)
);

create table public.tutorials (
  id uuid primary key default gen_random_uuid(),
  kit_project_id uuid references public.kit_projects (id) on delete set null,
  title text not null,
  slug text not null unique,
  description text,
  video_url text,
  duration_min int,
  sort_order int not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_resources (
  id uuid primary key default gen_random_uuid(),
  kit_project_id uuid references public.kit_projects (id) on delete set null,
  title text not null,
  slug text not null unique,
  body_md text,
  resource_type text not null default 'article' check (resource_type in ('article', 'guide', 'download', 'link')),
  external_url text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.evidence_files (
  id uuid primary key default gen_random_uuid(),
  student_group_id uuid not null references public.student_groups (id) on delete cascade,
  workshop_id uuid references public.workshops (id) on delete set null,
  uploaded_by uuid not null references public.profiles (id) on delete restrict,
  storage_path text not null,
  title text,
  mime_type text,
  created_at timestamptz not null default now()
);

create table public.pilot_metrics (
  id uuid primary key default gen_random_uuid(),
  metric_date date not null default (now() at time zone 'utc')::date,
  metric_key text not null,
  metric_value numeric not null default 0,
  metadata jsonb default '{}'::jsonb,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (metric_date, metric_key)
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  workshop_id uuid not null references public.workshops (id) on delete cascade,
  recorded_by uuid not null references public.profiles (id) on delete restrict,
  present_count int not null check (present_count >= 0),
  notes text,
  created_at timestamptz not null default now()
);

-- Trigger: perfil al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'docente'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger schools_touch before update on public.schools
  for each row execute function public.touch_updated_at();
create trigger teachers_touch before update on public.teachers
  for each row execute function public.touch_updated_at();
create trigger student_groups_touch before update on public.student_groups
  for each row execute function public.touch_updated_at();
create trigger kit_projects_touch before update on public.kit_projects
  for each row execute function public.touch_updated_at();
create trigger workshops_touch before update on public.workshops
  for each row execute function public.touch_updated_at();
create trigger rubrics_touch before update on public.rubrics
  for each row execute function public.touch_updated_at();
create trigger evaluations_touch before update on public.evaluations
  for each row execute function public.touch_updated_at();
create trigger tutorials_touch before update on public.tutorials
  for each row execute function public.touch_updated_at();
create trigger content_resources_touch before update on public.content_resources
  for each row execute function public.touch_updated_at();

-- Helpers RLS
create or replace function public.is_admin_gaia()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin_gaia'::public.app_role
  );
$$;

create or replace function public.my_teacher_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select t.id from public.teachers t
  where t.profile_id = auth.uid()
  limit 1;
$$;

create or replace function public.i_manage_group(gid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.student_groups sg
    where sg.id = gid and sg.teacher_id = public.my_teacher_id()
  );
$$;

alter table public.profiles enable row level security;
alter table public.schools enable row level security;
alter table public.teachers enable row level security;
alter table public.student_groups enable row level security;
alter table public.kit_projects enable row level security;
alter table public.workshops enable row level security;
alter table public.rubrics enable row level security;
alter table public.rubric_criteria enable row level security;
alter table public.evaluations enable row level security;
alter table public.evaluation_scores enable row level security;
alter table public.tutorials enable row level security;
alter table public.content_resources enable row level security;
alter table public.evidence_files enable row level security;
alter table public.pilot_metrics enable row level security;
alter table public.attendance_records enable row level security;

-- profiles
create policy "profiles_select_self_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin_gaia());

create policy "profiles_update_self_or_admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin_gaia());

-- schools
create policy "schools_admin_all"
  on public.schools for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

create policy "schools_teacher_read_own"
  on public.schools for select
  using (
    exists (
      select 1 from public.teachers t
      where t.school_id = schools.id and t.profile_id = auth.uid()
    )
  );

-- teachers
create policy "teachers_admin_all"
  on public.teachers for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

create policy "teachers_read_own"
  on public.teachers for select
  using (profile_id = auth.uid() or public.is_admin_gaia());

-- student_groups
create policy "groups_admin_all"
  on public.student_groups for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

create policy "groups_teacher_select"
  on public.student_groups for select
  using (teacher_id = public.my_teacher_id());

create policy "groups_teacher_insert"
  on public.student_groups for insert
  with check (teacher_id = public.my_teacher_id());

create policy "groups_teacher_update"
  on public.student_groups for update
  using (teacher_id = public.my_teacher_id());

create policy "groups_teacher_delete"
  on public.student_groups for delete
  using (teacher_id = public.my_teacher_id());

-- kit_projects: público ve publicados; docentes y admin ven según rol
create policy "kits_select_policy"
  on public.kit_projects for select
  using (
    is_published = true
    or public.is_admin_gaia()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'docente'::public.app_role
    )
  );

create policy "kits_admin_write"
  on public.kit_projects for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

-- workshops
create policy "workshops_admin_all"
  on public.workshops for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

create policy "workshops_teacher_rw"
  on public.workshops for all
  using (public.i_manage_group(student_group_id))
  with check (public.i_manage_group(student_group_id));

-- rubrics + criteria
create policy "rubrics_read_authenticated"
  on public.rubrics for select
  using (auth.uid() is not null);

create policy "rubrics_admin_write"
  on public.rubrics for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

create policy "criteria_read_authenticated"
  on public.rubric_criteria for select
  using (auth.uid() is not null);

create policy "criteria_admin_write"
  on public.rubric_criteria for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

-- evaluations
create policy "eval_admin_all"
  on public.evaluations for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

create policy "eval_teacher_select"
  on public.evaluations for select
  using (
    public.i_manage_group(student_group_id)
    or evaluator_id = auth.uid()
  );

create policy "eval_teacher_insert"
  on public.evaluations for insert
  with check (
    evaluator_id = auth.uid()
    and public.i_manage_group(student_group_id)
  );

create policy "eval_teacher_update"
  on public.evaluations for update
  using (
    evaluator_id = auth.uid()
    and public.i_manage_group(student_group_id)
  );

create policy "eval_teacher_delete"
  on public.evaluations for delete
  using (
    evaluator_id = auth.uid()
    and public.i_manage_group(student_group_id)
  );

-- evaluation_scores
create policy "escores_admin_all"
  on public.evaluation_scores for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

create policy "escores_teacher_rw"
  on public.evaluation_scores for all
  using (
    exists (
      select 1 from public.evaluations e
      where e.id = evaluation_scores.evaluation_id
        and e.evaluator_id = auth.uid()
        and public.i_manage_group(e.student_group_id)
    )
  )
  with check (
    exists (
      select 1 from public.evaluations e
      where e.id = evaluation_scores.evaluation_id
        and e.evaluator_id = auth.uid()
        and public.i_manage_group(e.student_group_id)
    )
  );

-- tutorials
create policy "tutorials_public"
  on public.tutorials for select
  using (is_public = true or auth.uid() is not null);

create policy "tutorials_admin_write"
  on public.tutorials for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

-- content_resources
create policy "content_public"
  on public.content_resources for select
  using (is_public = true or auth.uid() is not null);

create policy "content_admin_write"
  on public.content_resources for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

-- evidence_files
create policy "evidence_admin_all"
  on public.evidence_files for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

create policy "evidence_teacher_rw"
  on public.evidence_files for all
  using (
    uploaded_by = auth.uid()
    and public.i_manage_group(student_group_id)
  )
  with check (
    uploaded_by = auth.uid()
    and public.i_manage_group(student_group_id)
  );

-- pilot_metrics: solo admin lectura/escritura; docentes sin acceso
create policy "metrics_admin"
  on public.pilot_metrics for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

-- attendance
create policy "att_admin_all"
  on public.attendance_records for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

create policy "att_teacher_rw"
  on public.attendance_records for all
  using (
    recorded_by = auth.uid()
    and exists (
      select 1 from public.workshops w
      join public.student_groups sg on sg.id = w.student_group_id
      where w.id = attendance_records.workshop_id
        and sg.teacher_id = public.my_teacher_id()
    )
  )
  with check (
    recorded_by = auth.uid()
    and exists (
      select 1 from public.workshops w
      join public.student_groups sg on sg.id = w.student_group_id
      where w.id = attendance_records.workshop_id
        and sg.teacher_id = public.my_teacher_id()
    )
  );

-- Storage: bucket evidencias (crear en Dashboard Storage + policies manuales si hace falta)
-- insert into storage.buckets (id, name, public) values ('evidencias', 'evidencias', false);

-- ============ SEED contenido GAIA (sin usuarios) ============
insert into public.schools (id, name, city, country, notes)
select
  '00000000-0000-4000-8000-000000000001',
  'Colegio Piloto GAIA',
  'Santiago',
  'Chile',
  'Institución de referencia para el piloto.'
where not exists (
  select 1 from public.schools s where s.id = '00000000-0000-4000-8000-000000000001'
);

insert into public.kit_projects (
  slug, name, short_description, description, learning_objective,
  materials_md, steps_md, common_errors_md, sustainability_md, what_you_learn_md,
  tutorial_url, is_published
) values (
  'filtro-biologico-agua',
  'Filtro biológico de agua',
  'Construye un filtro con materiales de bajo costo y observa cómo la naturaleza depura el agua.',
  'En este proyecto los estudiantes diseñan y construyen un filtro por capas (grava, arena, carbón vegetal y material biológico) para reducir turbidez y comprender procesos de filtración y adsorción. Se trabaja con agua contaminada simulada de forma segura y controlada.',
  'Comprender etapas de un sistema de tratamiento simple, registrar observaciones, relacionar variable controlada con resultados y argumentar con evidencia.',
  E'**Materiales sugeridos (ajustar según protocolo institucional)**\n- 2 botellas PET recicladas\n- Grava y arena lavada\n- Carbón vegetal triturado (sin aditivos)\n- Algodón o tela limpia\n- Agua con turbidez simulada (tierra fina)\n- Embudos caseros\n- Cronómetro y registro de datos',
  E'1. **Planificar** capas y orden con el grupo (hipótesis).\n2. **Construir** el filtro sellando fugas y etiquetando cada etapa.\n3. **Filtrar** volúmenes iguales y medir tiempo/turbidez relativa.\n4. **Iterar** cambiando una sola variable (PBL).\n5. **Comunicar** resultados con gráficos simples y conclusiones.',
  E'- Empacar arena demasiado fina (obstrucción).\n- Mezclar capas al verter agua rápido.\n- No repetir mediciones (ruido en datos).\n- Ignorar seguridad: no beber el agua filtrada en contexto escolar.',
  E'El proyecto conecta **ODS 6 (agua limpia)** y consumo responsable: entender límites de un filtro casero fortalece la ciudadanía frente a recursos hídricos y la necesidad de infraestructura pública de calidad.',
  E'Pensamiento científico, trabajo colaborativo, manejo de variables, interpretación de evidencias y comunicación oral/escrita — competencias transferibles a otros retos ambientales.',
  '/minitutoriales',
  true
) on conflict (slug) do nothing;

insert into public.rubrics (kit_project_id, name, version, is_active)
select k.id, 'Rúbrica filtro biológico — versión piloto', 1, true
from public.kit_projects k
where k.slug = 'filtro-biologico-agua'
  and not exists (
    select 1 from public.rubrics r where r.kit_project_id = k.id
  );

insert into public.rubric_criteria (rubric_id, label, description, max_score, sort_order)
select r.id, c.label, c.description, c.max_score, c.sort_order
from public.rubrics r
cross join (values
  ('Diseño del sistema', 'Claridad del esquema de capas y justificación del orden', 4, 1),
  ('Ejecución y seguridad', 'Procedimiento ordenado y cuidado de riesgos', 4, 2),
  ('Registro de datos', 'Tablas, repeticiones y trazabilidad de mediciones', 4, 3),
  ('Análisis y conclusiones', 'Relación causa-efecto con evidencia', 4, 4),
  ('Comunicación científica', 'Presentación clara para el equipo / feria', 4, 5)
) as c(label, description, max_score, sort_order)
where r.name = 'Rúbrica filtro biológico — versión piloto'
  and not exists (select 1 from public.rubric_criteria rc where rc.rubric_id = r.id);

insert into public.tutorials (kit_project_id, title, slug, description, video_url, duration_min, sort_order, is_public)
select k.id, v.title, v.slug, v.description, v.video_url, v.duration_min, v.sort_order, true
from public.kit_projects k
cross join (values
  ('Armar el filtro por capas', 'armado-capas', 'Secuencia recomendada y trucos de estanqueidad.', null, 8, 1),
  ('Medir turbidez con método escolar', 'turbidez-escolar', 'Escala visual simple y buenas prácticas de registro.', null, 6, 2),
  ('Iteración PBL: cambiar una variable', 'iteracion-pbl', 'Cómo guiar la mejora del diseño sin perder el hilo científico.', null, 10, 3)
) as v(title, slug, description, video_url, duration_min, sort_order)
where k.slug = 'filtro-biologico-agua'
on conflict (slug) do nothing;

insert into public.content_resources (kit_project_id, title, slug, body_md, resource_type, is_public)
select k.id, v.title, v.slug, v.body_md, v.resource_type, true
from public.kit_projects k
cross join (values
  (
    'Guía rápida para docentes',
    'guia-docente-filtro',
    E'# Guía docente\n\n- Objetivo de 90–120 minutos dividido en explorar, construir y evaluar.\n- Roles rotativos: coordinación, mediciones, seguridad, comunicación.\n- Cierre con rúbrica y reflexión sobre límites del filtro.',
    'guide'
  ),
  (
    'PBL y sostenibilidad en GAIA',
    'pbl-sostenibilidad',
    E'# Aprendizaje basado en proyectos\n\nGAIA combina **pregunta motriz**, **producto tangible** y **evaluación formativa** para que el aula experimente ciencia aplicada con sentido ambiental.',
    'article'
  )
) as v(title, slug, body_md, resource_type)
where k.slug = 'filtro-biologico-agua'
on conflict (slug) do nothing;

insert into public.pilot_metrics (metric_date, metric_key, metric_value, metadata)
values
  (current_date, 'talleres_ejecutados', 0, '{}'),
  (current_date, 'kits_entregados', 0, '{}'),
  (current_date, 'filtros_funcionales', 0, '{}'),
  (current_date, 'asistencia_total_registrada', 0, '{}'),
  (current_date, 'evaluaciones_enviadas', 0, '{}')
on conflict (metric_date, metric_key) do nothing;
