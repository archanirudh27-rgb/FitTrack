-- FitTrack shared outdoor activity storage for Walk / Run / Cycle.
create table if not exists public.activity_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null check (activity_type in ('walk','run','cycle')),
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds integer not null default 0,
  distance_km numeric(9,3) not null default 0,
  avg_speed_kmh numeric(7,2),
  avg_pace_min_per_km numeric(7,2),
  estimated_calories integer,
  route_geojson jsonb,
  created_at timestamptz not null default now()
);

alter table public.activity_sessions enable row level security;

drop policy if exists "activity sessions own rows" on public.activity_sessions;
create policy "activity sessions own rows"
on public.activity_sessions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists activity_sessions_user_started_idx
on public.activity_sessions(user_id, started_at desc);
