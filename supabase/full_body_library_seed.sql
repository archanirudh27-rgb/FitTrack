-- FitTrack: add Full Body / Conditioning group and starter exercises
insert into public.muscle_groups (name, slug)
values ('Full Body', 'full-body')
on conflict (slug) do nothing;

insert into public.exercises
(name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Jumping Jacks','jumping-jacks',mg.id,array['Shoulders','Calves','Quads']::text[],'Bodyweight','Beginner','Stand tall, jump the feet apart while raising the arms overhead, then return to the start position with control.',true
from public.muscle_groups mg where mg.name='Full Body'
on conflict (slug) do nothing;

insert into public.exercises
(name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Burpee','burpee',mg.id,array['Chest','Shoulders','Quads','Glutes']::text[],'Bodyweight','Intermediate','Squat down, place the hands on the floor, move the feet back to a plank, return the feet forward and stand or jump up with control.',true
from public.muscle_groups mg where mg.name='Full Body'
on conflict (slug) do nothing;

insert into public.exercises
(name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Mountain Climbers','mountain-climbers',mg.id,array['Abs','Shoulders','Quads']::text[],'Bodyweight','Beginner','Start in a strong plank and alternate driving each knee toward the chest while keeping the torso controlled.',true
from public.muscle_groups mg where mg.name='Full Body'
on conflict (slug) do nothing;

insert into public.exercises
(name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Bodyweight Squat','bodyweight-squat',mg.id,array['Quads','Glutes','Hamstrings']::text[],'Bodyweight','Beginner','Stand with a comfortable stance, sit the hips down and back while the knees track over the toes, then stand tall.',true
from public.muscle_groups mg where mg.name='Full Body'
on conflict (slug) do nothing;

insert into public.exercises
(name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Push Up','push-up',mg.id,array['Chest','Triceps','Shoulders']::text[],'Bodyweight','Beginner','Maintain a straight body line, lower the chest under control and press back to the start position.',true
from public.muscle_groups mg where mg.name='Full Body'
on conflict (slug) do nothing;

insert into public.exercises
(name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'High Knees','high-knees',mg.id,array['Quads','Calves','Abs']::text[],'Bodyweight','Beginner','Run in place while lifting the knees toward hip height, staying tall and landing lightly.',true
from public.muscle_groups mg where mg.name='Full Body'
on conflict (slug) do nothing;

insert into public.exercises
(name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Bear Crawl','bear-crawl',mg.id,array['Shoulders','Abs','Quads']::text[],'Bodyweight','Intermediate','Start on hands and feet with knees hovering just above the floor, then crawl with small opposite hand-and-foot steps while keeping the hips stable.',true
from public.muscle_groups mg where mg.name='Full Body'
on conflict (slug) do nothing;

insert into public.exercises
(name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Squat Jump','squat-jump',mg.id,array['Quads','Glutes','Calves']::text[],'Bodyweight','Intermediate','Descend into a controlled squat, drive upward into a jump and land softly before resetting.',true
from public.muscle_groups mg where mg.name='Full Body'
on conflict (slug) do nothing;

insert into public.exercises
(name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Plank Shoulder Tap','plank-shoulder-tap',mg.id,array['Abs','Shoulders','Chest']::text[],'Bodyweight','Beginner','From a stable high plank, alternate touching the opposite shoulder while resisting hip rotation.',true
from public.muscle_groups mg where mg.name='Full Body'
on conflict (slug) do nothing;

insert into public.exercises
(name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Inchworm','inchworm',mg.id,array['Shoulders','Abs','Hamstrings']::text[],'Bodyweight','Beginner','Hinge forward, walk the hands out to a plank, pause with control, then walk the hands back and stand tall.',true
from public.muscle_groups mg where mg.name='Full Body'
on conflict (slug) do nothing;
