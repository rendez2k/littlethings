-- Little Things — username login & sign-up
-- ------------------------------------------------------------------
-- Run this ONCE in your Supabase project (Dashboard → SQL Editor → New query →
-- paste → Run). It is optional: email sign-up/sign-in work without it. Running
-- it additionally enables:
--   • unique usernames (enforced at sign-up)
--   • signing in with a username instead of an email
--
-- Safe to re-run — every statement is idempotent.

-- 1. Profiles table: one row per user, holding their chosen username.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text not null,
  created_at timestamptz not null default now()
);

-- Usernames are unique, case-insensitively (stored lower-cased).
create unique index if not exists profiles_username_key
  on public.profiles (lower(username));

-- 2. Row Level Security: a user may read/update only their own profile.
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 3. On new sign-up, create the profile from the username in user metadata.
--    A duplicate username raises here, which rolls back the sign-up so the app
--    can report "that username is already taken".
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, lower(trim(new.raw_user_meta_data ->> 'username')));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  when (new.raw_user_meta_data ? 'username')
  execute function public.handle_new_user();

-- 4. Look up the email for a username so the app can sign in by username.
--    SECURITY DEFINER so it can read auth.users; only returns an email for an
--    exact username match (no listing/enumeration of all users).
create or replace function public.email_for_username(uname text)
returns text
language sql
security definer
set search_path = public
as $$
  select u.email
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(p.username) = lower(trim(uname))
  limit 1;
$$;

grant execute on function public.email_for_username(text) to anon, authenticated;
