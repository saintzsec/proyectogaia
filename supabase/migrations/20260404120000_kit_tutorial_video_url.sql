-- Video tutorial principal del kit (YouTube embebido en la ficha del proyecto)
alter table public.kit_projects
  add column if not exists tutorial_video_url text;

comment on column public.kit_projects.tutorial_video_url is
  'URL de YouTube del video introductorio del kit; se muestra embebido en /proyectos/[slug]';
