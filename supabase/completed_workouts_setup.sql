-- FitTrack completed workout history.
-- Stores a snapshot of the finished workout for the signed-in user.

create table if not exists completed_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_name text not null,
  workout_state jsonb not null,
  total_volume_kg numeric(12,2) not null default 0,
  completed_sets integer not null default 0,
  duration_seconds integer,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table completed_workouts enable row level security;

drop policy if exists "completed workouts own rows" on completed_workouts;
create policy "completed workouts own rows"
on completed_workouts
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists completed_workouts_user_completed_idx
on completed_workouts(user_id, completed_at desc);
