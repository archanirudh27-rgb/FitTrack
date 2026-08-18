-- FitTrack initial multi-user schema.
-- Run this in a Supabase SQL editor when the Supabase project is created.
-- The schema separates reusable templates from dated planned sessions and actual sets.

create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  age integer,
  height_cm numeric(5,2),
  weight_kg numeric(5,2),
  sex text,
  goal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists muscle_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  primary_muscle_group_id uuid references muscle_groups(id),
  secondary_muscles text[] not null default '{}',
  equipment text,
  difficulty text,
  instructions text,
  common_mistakes text,
  tutorial_url text,
  image_url text,
  personalized_image_url text,
  created_by uuid references auth.users(id) on delete set null,
  is_system boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workout_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workout_template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references workout_templates(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  exercise_order integer not null,
  planned_sets integer not null default 3,
  target_reps_min integer,
  target_reps_max integer,
  target_weight_kg numeric(6,2),
  rest_seconds integer not null default 90,
  notes text,
  unique(template_id, exercise_order)
);

create table if not exists planned_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid references workout_templates(id) on delete set null,
  session_date date not null,
  name text not null,
  status text not null default 'planned',
  frozen_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- This table is the immutable-ish snapshot of a specific planned day.
create table if not exists planned_session_exercises (
  id uuid primary key default gen_random_uuid(),
  planned_session_id uuid not null references planned_sessions(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  exercise_order integer not null,
  planned_sets integer not null default 3,
  target_reps_min integer,
  target_reps_max integer,
  target_weight_kg numeric(6,2),
  rest_seconds integer not null default 90,
  notes text,
  unique(planned_session_id, exercise_order)
);

create table if not exists workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  planned_session_id uuid references planned_sessions(id) on delete set null,
  name text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_seconds integer,
  estimated_calories integer,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists workout_session_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_session_id uuid not null references workout_sessions(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  exercise_order integer not null,
  notes text,
  unique(workout_session_id, exercise_order)
);

create table if not exists workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_session_exercise_id uuid not null references workout_session_exercises(id) on delete cascade,
  set_number integer not null,
  set_type text not null default 'working',
  weight_kg numeric(7,2),
  reps integer,
  rpe numeric(3,1),
  rest_seconds integer,
  completed_at timestamptz,
  notes text,
  unique(workout_session_exercise_id, set_number)
);

create table if not exists cycling_rides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds integer,
  distance_km numeric(8,3),
  avg_speed_kmh numeric(6,2),
  max_speed_kmh numeric(6,2),
  elevation_gain_m numeric(9,2),
  estimated_calories integer,
  avg_heart_rate integer,
  max_heart_rate integer,
  route_geojson jsonb,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_at timestamptz not null default now(),
  weight_kg numeric(5,2),
  waist_cm numeric(5,2),
  chest_cm numeric(5,2),
  arm_cm numeric(5,2),
  thigh_cm numeric(5,2),
  body_fat_pct numeric(5,2),
  notes text
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_type text not null,
  name text not null,
  target_value numeric(10,2),
  unit text,
  target_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Default muscle groups. Safe to run repeatedly.
insert into muscle_groups (name) values
  ('Chest'), ('Back'), ('Shoulders'), ('Biceps'), ('Triceps'),
  ('Quads'), ('Hamstrings'), ('Glutes'), ('Calves'), ('Abs'), ('Forearms')
on conflict (name) do nothing;

-- Row-level security: every user only sees their own user-specific rows.
alter table profiles enable row level security;
alter table workout_templates enable row level security;
alter table planned_sessions enable row level security;
alter table workout_sessions enable row level security;
alter table cycling_rides enable row level security;
alter table body_metrics enable row level security;
alter table goals enable row level security;

create policy "profiles own row" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "templates own rows" on workout_templates for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "planned sessions own rows" on planned_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workout sessions own rows" on workout_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cycling own rows" on cycling_rides for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "body metrics own rows" on body_metrics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals own rows" on goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Shared/system exercise library is readable by authenticated users.
alter table muscle_groups enable row level security;
alter table exercises enable row level security;
create policy "muscle groups readable" on muscle_groups for select using (auth.role() = 'authenticated');
create policy "system exercises readable" on exercises for select using (auth.role() = 'authenticated');
