-- Hace idempotente el alta de perfil si el trigger se dispara más de una vez
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
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
