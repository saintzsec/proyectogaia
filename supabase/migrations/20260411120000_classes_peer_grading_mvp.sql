-- MVP: clases con código, grupos por clase, evaluación 360, quiz grupal, nota propuesta 1–5, override docente
-- Compatible con student_groups / workshops / evaluations existentes (class_id nullable).

create type public.class_status as enum ('active', 'closed', 'archived');

create type public.group_project_status as enum (
  'pending',
  'in_progress',
  'submitted',
  'graded'
);

create type public.teacher_grade_source as enum (
  'accepted_auto',
  'adjusted',
  'rubric_manual'
);

-- ─── Clases ─────────────────────────────────────────────────────────────
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers (id) on delete cascade,
  school_id uuid not null references public.schools (id) on delete restrict,
  kit_project_id uuid not null references public.kit_projects (id) on delete restrict,
  name text not null,
  description text,
  join_code text not null,
  status public.class_status not null default 'active',
  academic_year text not null default '2026',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classes_join_code_format check (join_code ~ '^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{3}$')
);

create unique index classes_join_code_unique on public.classes (join_code);

create trigger classes_touch before update on public.classes
  for each row execute function public.touch_updated_at();

-- Código único tipo XXX-XXX-XXX (sin I/O/O confusos con 1/0)
create or replace function public.generate_class_join_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  part text;
  i int;
  candidate text;
  exists_row boolean;
begin
  loop
    part := '';
    for i in 1..3 loop
      part := part || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    end loop;
    candidate :=
      part || '-' ||
      substr(chars, floor(random() * length(chars) + 1)::int, 1) ||
      substr(chars, floor(random() * length(chars) + 1)::int, 1) ||
      substr(chars, floor(random() * length(chars) + 1)::int, 1) ||
      '-' ||
      substr(chars, floor(random() * length(chars) + 1)::int, 1) ||
      substr(chars, floor(random() * length(chars) + 1)::int, 1) ||
      substr(chars, floor(random() * length(chars) + 1)::int, 1);
    select exists (select 1 from public.classes c where c.join_code = candidate) into exists_row;
    exit when not exists_row;
  end loop;
  return candidate;
end;
$$;

-- ─── Extender grupos existentes ─────────────────────────────────────────
alter table public.student_groups
  add column if not exists class_id uuid references public.classes (id) on delete cascade,
  add column if not exists project_status public.group_project_status not null default 'pending';

create index if not exists student_groups_class_id_idx on public.student_groups (class_id)
  where class_id is not null;

comment on column public.student_groups.class_id is 'Si no es null, el grupo pertenece a una clase con código; teacher_id/school_id deben coincidir con la clase.';

-- ─── Integrantes (sin cuenta Supabase en MVP) ──────────────────────────
create table public.class_group_members (
  id uuid primary key default gen_random_uuid(),
  student_group_id uuid not null references public.student_groups (id) on delete cascade,
  display_name text not null,
  is_leader boolean not null default false,
  access_token uuid not null default gen_random_uuid() unique,
  created_at timestamptz not null default now(),
  constraint class_group_members_name_nonempty check (length(trim(display_name)) > 0)
);

create unique index class_group_members_group_lower_name
  on public.class_group_members (student_group_id, lower(trim(display_name)));

create index class_group_members_group_idx on public.class_group_members (student_group_id);

-- ─── Evaluación 360 (misma dimensión Likert 1–5 en jsonb) ───────────────
create table public.peer_evaluations (
  id uuid primary key default gen_random_uuid(),
  student_group_id uuid not null references public.student_groups (id) on delete cascade,
  evaluator_member_id uuid not null references public.class_group_members (id) on delete cascade,
  evaluatee_member_id uuid not null references public.class_group_members (id) on delete cascade,
  scores jsonb not null,
  improvement_notes text,
  created_at timestamptz not null default now(),
  constraint peer_eval_no_self check (evaluator_member_id <> evaluatee_member_id),
  constraint peer_eval_unique_pair unique (evaluator_member_id, evaluatee_member_id)
);

create index peer_evaluations_group_idx on public.peer_evaluations (student_group_id);

-- ─── Quiz grupal (un intento por grupo en MVP) ─────────────────────────
create table public.group_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_group_id uuid not null unique references public.student_groups (id) on delete cascade,
  score_correct int not null default 0 check (score_correct >= 0),
  score_total int not null default 5 check (score_total > 0),
  score_on_scale_1_5 numeric(4,2) not null check (score_on_scale_1_5 >= 1 and score_on_scale_1_5 <= 5),
  answers jsonb default '{}'::jsonb,
  submitted_at timestamptz not null default now()
);

-- ─── Entrega / reflexión (complementa evidence_files) ────────────────────
create table public.group_project_submissions (
  student_group_id uuid primary key references public.student_groups (id) on delete cascade,
  learning_summary text,
  evidence_checklist jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ─── Autoevaluación por integrante (opcional, ponderación fórmula) ───────
create table public.member_self_evaluations (
  member_id uuid primary key references public.class_group_members (id) on delete cascade,
  scores jsonb not null default '{}'::jsonb,
  reflection text,
  submitted_at timestamptz not null default now()
);

-- ─── Snapshot de nota propuesta (auditable) ─────────────────────────────
create table public.group_grade_snapshots (
  id uuid primary key default gen_random_uuid(),
  student_group_id uuid not null references public.student_groups (id) on delete cascade,
  formula_version text not null default 'mvp_v1',
  weights jsonb not null,
  component_quiz numeric(4,2),
  component_peer_group numeric(4,2),
  component_peer_by_member jsonb not null default '{}'::jsonb,
  component_evidence numeric(4,2),
  component_self_group numeric(4,2),
  proposed_group_grade numeric(4,2) not null check (proposed_group_grade >= 1 and proposed_group_grade <= 5),
  proposed_member_grades jsonb not null default '{}'::jsonb,
  flags jsonb default '{}'::jsonb,
  computed_at timestamptz not null default now()
);

create index group_grade_snapshots_group_idx
  on public.group_grade_snapshots (student_group_id, computed_at desc);

-- ─── Decisión docente (historial por created_at) ─────────────────────────
create table public.teacher_grade_decisions (
  id uuid primary key default gen_random_uuid(),
  student_group_id uuid not null references public.student_groups (id) on delete cascade,
  teacher_profile_id uuid not null references public.profiles (id) on delete restrict,
  snapshot_id uuid references public.group_grade_snapshots (id) on delete set null,
  final_group_grade numeric(4,2) not null check (final_group_grade >= 1 and final_group_grade <= 5),
  final_member_grades jsonb,
  source public.teacher_grade_source not null,
  teacher_comments text,
  evaluation_id uuid references public.evaluations (id) on delete set null,
  created_at timestamptz not null default now()
);

create index teacher_grade_decisions_group_idx
  on public.teacher_grade_decisions (student_group_id, created_at desc);

-- ─── i_manage_group: también por clase del docente ───────────────────────
create or replace function public.i_manage_group(gid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.student_groups sg
    left join public.classes c on c.id = sg.class_id
    where sg.id = gid
      and (
        sg.teacher_id = public.my_teacher_id()
        or (c.id is not null and c.teacher_id = public.my_teacher_id())
      )
  );
$$;

create or replace function public.i_manage_class(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.classes c
    where c.id = cid and c.teacher_id = public.my_teacher_id()
  );
$$;

-- ─── RLS ─────────────────────────────────────────────────────────────────
alter table public.classes enable row level security;

create policy "classes_admin_all"
  on public.classes for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

create policy "classes_teacher_select"
  on public.classes for select
  using (teacher_id = public.my_teacher_id());

create policy "classes_teacher_insert"
  on public.classes for insert
  with check (teacher_id = public.my_teacher_id());

create policy "classes_teacher_update"
  on public.classes for update
  using (teacher_id = public.my_teacher_id());

create policy "classes_teacher_delete"
  on public.classes for delete
  using (teacher_id = public.my_teacher_id());

alter table public.class_group_members enable row level security;

create policy "cgm_admin_all"
  on public.class_group_members for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

create policy "cgm_teacher_select"
  on public.class_group_members for select
  using (
    exists (
      select 1 from public.student_groups sg
      where sg.id = class_group_members.student_group_id
        and public.i_manage_group(sg.id)
    )
  );

create policy "cgm_teacher_write"
  on public.class_group_members for all
  using (
    exists (
      select 1 from public.student_groups sg
      where sg.id = class_group_members.student_group_id
        and public.i_manage_group(sg.id)
    )
  )
  with check (
    exists (
      select 1 from public.student_groups sg
      where sg.id = class_group_members.student_group_id
        and public.i_manage_group(sg.id)
    )
  );

-- Inserciones públicas vía service role / server action (sin política anon aquí)

alter table public.peer_evaluations enable row level security;

create policy "peer_admin_all"
  on public.peer_evaluations for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

create policy "peer_teacher_select"
  on public.peer_evaluations for select
  using (public.i_manage_group(student_group_id));

create policy "peer_teacher_delete"
  on public.peer_evaluations for delete
  using (public.i_manage_group(student_group_id));

alter table public.group_quiz_attempts enable row level security;

create policy "gqa_admin_all"
  on public.group_quiz_attempts for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

create policy "gqa_teacher_select"
  on public.group_quiz_attempts for select
  using (public.i_manage_group(student_group_id));

alter table public.group_project_submissions enable row level security;

create policy "gps_admin_all"
  on public.group_project_submissions for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

create policy "gps_teacher_select"
  on public.group_project_submissions for select
  using (public.i_manage_group(student_group_id));

alter table public.member_self_evaluations enable row level security;

create policy "mse_admin_all"
  on public.member_self_evaluations for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

create policy "mse_teacher_select"
  on public.member_self_evaluations for select
  using (
    exists (
      select 1 from public.class_group_members m
      join public.student_groups sg on sg.id = m.student_group_id
      where m.id = member_self_evaluations.member_id
        and public.i_manage_group(sg.id)
    )
  );

alter table public.group_grade_snapshots enable row level security;

create policy "ggs_admin_all"
  on public.group_grade_snapshots for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

create policy "ggs_teacher_select"
  on public.group_grade_snapshots for select
  using (public.i_manage_group(student_group_id));

create policy "ggs_teacher_insert"
  on public.group_grade_snapshots for insert
  with check (public.i_manage_group(student_group_id));

alter table public.teacher_grade_decisions enable row level security;

create policy "tgd_admin_all"
  on public.teacher_grade_decisions for all
  using (public.is_admin_gaia())
  with check (public.is_admin_gaia());

create policy "tgd_teacher_select"
  on public.teacher_grade_decisions for select
  using (
    teacher_profile_id = auth.uid()
    or public.i_manage_group(student_group_id)
  );

create policy "tgd_teacher_insert"
  on public.teacher_grade_decisions for insert
  with check (
    teacher_profile_id = auth.uid()
    and public.i_manage_group(student_group_id)
  );
