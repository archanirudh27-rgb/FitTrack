-- FitTrack current-workout draft state.
-- Run once in the Supabase SQL Editor.
-- This stores the in-progress on-screen workout for each signed-in user.

create table if not exists workout_drafts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  workout_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table workout_drafts enable row level security;

drop policy if exists "workout drafts own row" on workout_drafts;
create policy "workout drafts own row"
on workout_drafts
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
