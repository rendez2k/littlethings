-- Little Things — Web Push reminders
-- ------------------------------------------------------------------
-- Run once in Supabase → SQL Editor. Stores each device's push subscription
-- and its reminder schedule. The scheduled `send-reminders` Edge Function reads
-- these (with the service-role key) and sends the notifications.
--
-- Security note: this app has no required account, so rows are keyed by the
-- device's push endpoint. RLS lets the anon client WRITE its rows but NOT read
-- them back; only the Edge Function (service role) can read. This is a pragmatic
-- choice for a personal app — see docs for details.

create extension if not exists pgcrypto;

-- One row per device/browser push subscription.
create table if not exists public.push_subscriptions (
  endpoint   text primary key,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

-- One row per habit reminder, tied to a subscription.
create table if not exists public.reminders (
  id           uuid primary key default gen_random_uuid(),
  endpoint     text not null references public.push_subscriptions (endpoint) on delete cascade,
  habit_id     text not null,
  title        text not null,
  body         text not null default '',
  time         text not null,             -- 'HH:MM' local time
  weekdays     smallint[] not null default '{}', -- 0=Sun..6=Sat; empty = every day
  timezone     text not null,             -- IANA tz, e.g. 'Europe/London'
  enabled      boolean not null default true,
  last_sent_on date,                      -- de-dupe: last local date a push was sent
  updated_at   timestamptz not null default now(),
  unique (endpoint, habit_id)
);

create index if not exists reminders_enabled_idx on public.reminders (enabled);

alter table public.push_subscriptions enable row level security;
alter table public.reminders enable row level security;

-- Anon may WRITE (insert/update/delete) but there is deliberately no SELECT
-- policy, so the anon client cannot read any device's data. The Edge Function
-- uses the service-role key, which bypasses RLS.
drop policy if exists "subs_insert" on public.push_subscriptions;
create policy "subs_insert" on public.push_subscriptions for insert to anon with check (true);
drop policy if exists "subs_update" on public.push_subscriptions;
create policy "subs_update" on public.push_subscriptions for update to anon using (true) with check (true);
drop policy if exists "subs_delete" on public.push_subscriptions;
create policy "subs_delete" on public.push_subscriptions for delete to anon using (true);

drop policy if exists "rem_insert" on public.reminders;
create policy "rem_insert" on public.reminders for insert to anon with check (true);
drop policy if exists "rem_update" on public.reminders;
create policy "rem_update" on public.reminders for update to anon using (true) with check (true);
drop policy if exists "rem_delete" on public.reminders;
create policy "rem_delete" on public.reminders for delete to anon using (true);
