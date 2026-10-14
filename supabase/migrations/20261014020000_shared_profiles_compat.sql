-- New Banglarvoice already owns public.profiles with its own columns and defaults.
-- Keep the auth trigger compatible without assuming an email column exists.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id) values(new.id) on conflict(id) do nothing;
  return new;
end;
$$;
