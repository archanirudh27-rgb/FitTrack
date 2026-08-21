-- FitTrack Multi-User Readiness V1
-- Run once in Supabase SQL Editor before sharing the app with other users.
-- It keeps shared exercise content readable while isolating all personal records by auth.uid().

-- Profiles: one private profile per authenticated user.
alter table if exists public.profiles enable row level security;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Personal tables with a direct user_id column.
do $$
declare t text;
begin
  foreach t in array array['workout_drafts','completed_workouts','workout_templates','planned_sessions','activity_sessions'] loop
    if to_regclass('public.'||t) is not null then
      execute format('alter table public.%I enable row level security',t);
      execute format('drop policy if exists %I on public.%I',t||'_select_own',t);
      execute format('drop policy if exists %I on public.%I',t||'_insert_own',t);
      execute format('drop policy if exists %I on public.%I',t||'_update_own',t);
      execute format('drop policy if exists %I on public.%I',t||'_delete_own',t);
      execute format('create policy %I on public.%I for select to authenticated using (user_id = auth.uid())',t||'_select_own',t);
      execute format('create policy %I on public.%I for insert to authenticated with check (user_id = auth.uid())',t||'_insert_own',t);
      execute format('create policy %I on public.%I for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())',t||'_update_own',t);
      execute format('create policy %I on public.%I for delete to authenticated using (user_id = auth.uid())',t||'_delete_own',t);
    end if;
  end loop;
end $$;

-- Template exercise rows inherit ownership from their parent workout template.
do $$
begin
  if to_regclass('public.workout_template_exercises') is not null then
    alter table public.workout_template_exercises enable row level security;
    drop policy if exists "template_exercises_select_own" on public.workout_template_exercises;
    drop policy if exists "template_exercises_insert_own" on public.workout_template_exercises;
    drop policy if exists "template_exercises_update_own" on public.workout_template_exercises;
    drop policy if exists "template_exercises_delete_own" on public.workout_template_exercises;
    create policy "template_exercises_select_own" on public.workout_template_exercises for select to authenticated
      using (exists (select 1 from public.workout_templates wt where wt.id=template_id and wt.user_id=auth.uid()));
    create policy "template_exercises_insert_own" on public.workout_template_exercises for insert to authenticated
      with check (exists (select 1 from public.workout_templates wt where wt.id=template_id and wt.user_id=auth.uid()));
    create policy "template_exercises_update_own" on public.workout_template_exercises for update to authenticated
      using (exists (select 1 from public.workout_templates wt where wt.id=template_id and wt.user_id=auth.uid()))
      with check (exists (select 1 from public.workout_templates wt where wt.id=template_id and wt.user_id=auth.uid()));
    create policy "template_exercises_delete_own" on public.workout_template_exercises for delete to authenticated
      using (exists (select 1 from public.workout_templates wt where wt.id=template_id and wt.user_id=auth.uid()));
  end if;
end $$;

-- Shared system exercise library: authenticated users may read it, not modify it.
do $$
declare t text;
begin
  foreach t in array array['muscle_groups','exercises'] loop
    if to_regclass('public.'||t) is not null then
      execute format('alter table public.%I enable row level security',t);
      execute format('drop policy if exists %I on public.%I',t||'_authenticated_read',t);
      execute format('create policy %I on public.%I for select to authenticated using (true)',t||'_authenticated_read',t);
    end if;
  end loop;
end $$;

-- Helpful profile fields used by the onboarding UI. Existing columns are preserved.
alter table if exists public.profiles add column if not exists height_cm numeric;
alter table if exists public.profiles add column if not exists weight_kg numeric;
alter table if exists public.profiles add column if not exists display_name text;

-- Recommended indexes for per-user screens.
create index if not exists idx_completed_workouts_user_date on public.completed_workouts(user_id, completed_at desc);
create index if not exists idx_activity_sessions_user_date on public.activity_sessions(user_id, started_at desc);
create index if not exists idx_planned_sessions_user_date on public.planned_sessions(user_id, session_date);
create index if not exists idx_workout_templates_user on public.workout_templates(user_id);

-- Verification examples (run while impersonating/authenticated via the app):
-- select * from public.completed_workouts; -- should return only that user's rows.
-- select * from public.exercises;          -- should return the shared system library.
