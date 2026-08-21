-- FitTrack: store estimated steps for Walk / Run sessions.
alter table public.activity_sessions
add column if not exists estimated_steps integer;
