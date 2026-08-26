-- FitTrack Health Connect storage V1
-- Run once in Supabase SQL Editor.
-- Stores compact daily wearable summaries and marks imported activity sessions.

create table if not exists public.health_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  metric_date date not null,
  steps bigint not null default 0,
  distance_km numeric not null default 0,
  active_calories numeric not null default 0,
  resting_hr_bpm numeric,
  avg_hr_bpm numeric,
  min_hr_bpm numeric,
  max_hr_bpm numeric,
  hrv_rmssd_ms numeric,
  sleep_minutes numeric,
  deep_sleep_minutes numeric,
  rem_sleep_minutes numeric,
  light_sleep_minutes numeric,
  awake_minutes numeric,
  spo2_avg numeric,
  respiratory_rate_avg numeric,
  source_system text not null default 'health_connect',
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, metric_date)
);

alter table public.health_daily enable row level security;
drop policy if exists "health_daily_select_own" on public.health_daily;
drop policy if exists "health_daily_insert_own" on public.health_daily;
drop policy if exists "health_daily_update_own" on public.health_daily;
drop policy if exists "health_daily_delete_own" on public.health_daily;
create policy "health_daily_select_own" on public.health_daily for select to authenticated using (user_id = auth.uid());
create policy "health_daily_insert_own" on public.health_daily for insert to authenticated with check (user_id = auth.uid());
create policy "health_daily_update_own" on public.health_daily for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "health_daily_delete_own" on public.health_daily for delete to authenticated using (user_id = auth.uid());

create index if not exists idx_health_daily_user_date on public.health_daily(user_id, metric_date desc);

-- Extend the existing activity table so wearable exercise sessions can be synced
-- without duplicating the same Health Connect workout on every sync.
alter table if exists public.activity_sessions add column if not exists source_system text;
alter table if exists public.activity_sessions add column if not exists source_external_id text;
alter table if exists public.activity_sessions add column if not exists is_imported boolean not null default false;

create unique index if not exists idx_activity_sessions_external_unique
  on public.activity_sessions(user_id, source_system, source_external_id)
  where source_system is not null and source_external_id is not null;

-- Existing RLS policies from multi-user-security.sql continue to protect activity_sessions.
