-- FitTrack workout template security setup
-- Run once in Supabase SQL Editor before testing Add to Workout.

alter table public.workout_template_exercises enable row level security;

-- Remove/recreate only these FitTrack policies so this script is safe to rerun.
drop policy if exists "template exercises own rows select" on public.workout_template_exercises;
drop policy if exists "template exercises own rows insert" on public.workout_template_exercises;
drop policy if exists "template exercises own rows update" on public.workout_template_exercises;
drop policy if exists "template exercises own rows delete" on public.workout_template_exercises;

create policy "template exercises own rows select"
on public.workout_template_exercises
for select
using (
  exists (
    select 1 from public.workout_templates wt
    where wt.id = workout_template_exercises.template_id
      and wt.user_id = auth.uid()
  )
);

create policy "template exercises own rows insert"
on public.workout_template_exercises
for insert
with check (
  exists (
    select 1 from public.workout_templates wt
    where wt.id = workout_template_exercises.template_id
      and wt.user_id = auth.uid()
  )
);

create policy "template exercises own rows update"
on public.workout_template_exercises
for update
using (
  exists (
    select 1 from public.workout_templates wt
    where wt.id = workout_template_exercises.template_id
      and wt.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.workout_templates wt
    where wt.id = workout_template_exercises.template_id
      and wt.user_id = auth.uid()
  )
);

create policy "template exercises own rows delete"
on public.workout_template_exercises
for delete
using (
  exists (
    select 1 from public.workout_templates wt
    where wt.id = workout_template_exercises.template_id
      and wt.user_id = auth.uid()
  )
);
