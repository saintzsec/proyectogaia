-- Bucket privado para evidencias (ejecutar después de Auth + tablas públicas)
insert into storage.buckets (id, name, public)
values ('evidencias', 'evidencias', false)
on conflict (id) do update set public = excluded.public;

-- MVP: cualquier usuario autenticado puede leer/escribir en el bucket (endurecer en producción por prefijo de ruta)
drop policy if exists "evidencias insert auth" on storage.objects;
drop policy if exists "evidencias select auth" on storage.objects;
drop policy if exists "evidencias update auth" on storage.objects;
drop policy if exists "evidencias delete auth" on storage.objects;

create policy "evidencias insert auth"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'evidencias');

create policy "evidencias select auth"
  on storage.objects for select to authenticated
  using (bucket_id = 'evidencias');

create policy "evidencias update auth"
  on storage.objects for update to authenticated
  using (bucket_id = 'evidencias');

create policy "evidencias delete auth"
  on storage.objects for delete to authenticated
  using (bucket_id = 'evidencias');
