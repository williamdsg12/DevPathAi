-- ============================================================
-- DEVPATH AI — Super Admin Assignment & Role Persistence Migration
-- Migration: 20260104000000_super_admin_william.sql
-- ============================================================

-- 1. Ensure 'role' column exists in public.profiles
alter table public.profiles add column if not exists role text default 'STUDENT';

-- 2. Ensure super admin williamdev36@gmail.com has SUPER_ADMIN role and is_admin = true
update public.profiles
set is_admin = true,
    role = 'SUPER_ADMIN',
    updated_at = now()
where lower(email) = 'williamdev36@gmail.com';

-- 3. In case the user exists in auth.users but not in profiles yet, insert/upsert:
insert into public.profiles (id, name, email, role, is_admin, onboarded, placement_done)
select 
  id, 
  coalesce(raw_user_meta_data->>'name', 'William Super Admin'), 
  email, 
  'SUPER_ADMIN', 
  true, 
  true, 
  true
from auth.users
where lower(email) = 'williamdev36@gmail.com'
on conflict (id) do update
set is_admin = true,
    role = 'SUPER_ADMIN',
    updated_at = now();

-- 4. Update the handle_new_user trigger function to automatically grant SUPER_ADMIN to williamdev36@gmail.com
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_super boolean;
  user_role text;
begin
  if lower(new.email) = 'williamdev36@gmail.com' then
    is_super := true;
    user_role := 'SUPER_ADMIN';
  else
    is_super := false;
    user_role := 'STUDENT';
  end if;

  insert into public.profiles (id, name, email, avatar_url, role, is_admin, onboarded, placement_done)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    user_role,
    is_super,
    is_super,
    is_super
  )
  on conflict (id) do update
  set 
    email = excluded.email,
    role = case when lower(excluded.email) = 'williamdev36@gmail.com' then 'SUPER_ADMIN' else profiles.role end,
    is_admin = case when lower(excluded.email) = 'williamdev36@gmail.com' then true else profiles.is_admin end,
    updated_at = now();

  return new;
end;
$$ language plpgsql security definer;
