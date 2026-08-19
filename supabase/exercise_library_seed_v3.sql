-- FitTrack exercise library seed v3
-- Uses the exact INSERT ... SELECT ... FROM public.muscle_groups pattern verified in Supabase.
-- Safe to run repeatedly because exercise slugs are unique.

begin;

insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Barbell Bench Press','barbell-bench-press',mg.id,array['Triceps','Shoulders']::text[],'Barbell','Intermediate','Lower the bar with control to mid chest and press upward while keeping the shoulder blades set.',true from public.muscle_groups mg where mg.name='Chest' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Incline Dumbbell Press','incline-dumbbell-press',mg.id,array['Triceps','Shoulders']::text[],'Dumbbells','Intermediate','Press dumbbells from a moderate incline while keeping the upper back stable.',true from public.muscle_groups mg where mg.name='Chest' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Cable Crossover','cable-crossover',mg.id,array['Shoulders']::text[],'Cable','Beginner','Bring the handles together in front of the chest with a soft elbow bend and controlled return.',true from public.muscle_groups mg where mg.name='Chest' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Pec Deck Fly','pec-deck-fly',mg.id,array[]::text[],'Machine','Beginner','Keep the back supported and bring the handles together using the chest.',true from public.muscle_groups mg where mg.name='Chest' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Push Up','push-up',mg.id,array['Triceps','Shoulders']::text[],'Bodyweight','Beginner','Maintain a straight body line, lower under control and press back up.',true from public.muscle_groups mg where mg.name='Chest' on conflict (slug) do nothing;

insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Lat Pulldown','lat-pulldown',mg.id,array['Biceps']::text[],'Cable','Beginner','Pull the bar toward the upper chest while keeping the torso stable.',true from public.muscle_groups mg where mg.name='Back' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Barbell Bent Over Row','barbell-bent-over-row',mg.id,array['Biceps','Hamstrings']::text[],'Barbell','Intermediate','Hinge at the hips and row the bar toward the lower ribs with a neutral spine.',true from public.muscle_groups mg where mg.name='Back' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Seated Cable Row','seated-cable-row',mg.id,array['Biceps']::text[],'Cable','Intermediate','Sit tall and pull the handle toward the lower ribs without excessive torso movement.',true from public.muscle_groups mg where mg.name='Back' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'One Arm Dumbbell Row','one-arm-dumbbell-row',mg.id,array['Biceps']::text[],'Dumbbell','Beginner','Support the torso and row the dumbbell toward the hip without rotating the body.',true from public.muscle_groups mg where mg.name='Back' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Pull Up','pull-up',mg.id,array['Biceps','Forearms']::text[],'Bodyweight','Intermediate','Pull the chest upward by driving the elbows down and lower with control.',true from public.muscle_groups mg where mg.name='Back' on conflict (slug) do nothing;

insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Overhead Press','overhead-press',mg.id,array['Triceps']::text[],'Barbell','Intermediate','Brace the torso and press the bar overhead in a controlled path.',true from public.muscle_groups mg where mg.name='Shoulders' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Dumbbell Shoulder Press','dumbbell-shoulder-press',mg.id,array['Triceps']::text[],'Dumbbells','Beginner','Press dumbbells overhead while keeping the ribs stacked and shoulders controlled.',true from public.muscle_groups mg where mg.name='Shoulders' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Dumbbell Lateral Raise','dumbbell-lateral-raise',mg.id,array[]::text[],'Dumbbells','Beginner','Raise the dumbbells out to the sides to around shoulder height and lower slowly.',true from public.muscle_groups mg where mg.name='Shoulders' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Face Pull','face-pull',mg.id,array['Back']::text[],'Cable','Beginner','Pull the rope toward the face with elbows high and shoulders externally rotated.',true from public.muscle_groups mg where mg.name='Shoulders' on conflict (slug) do nothing;

insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Dumbbell Curl','dumbbell-curl',mg.id,array['Forearms']::text[],'Dumbbells','Beginner','Keep the elbows near the sides and curl without swinging.',true from public.muscle_groups mg where mg.name='Biceps' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'EZ Bar Curl','ez-bar-curl',mg.id,array['Forearms']::text[],'EZ Bar','Beginner','Curl the bar while keeping the upper arms relatively still.',true from public.muscle_groups mg where mg.name='Biceps' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Hammer Curl','hammer-curl',mg.id,array['Forearms']::text[],'Dumbbells','Beginner','Use a neutral grip and curl without allowing the elbows to drift forward.',true from public.muscle_groups mg where mg.name='Biceps' on conflict (slug) do nothing;

insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Cable Pushdown','cable-pushdown',mg.id,array[]::text[],'Cable','Beginner','Keep the elbows close to the torso and extend the arms fully.',true from public.muscle_groups mg where mg.name='Triceps' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Overhead Triceps Extension','overhead-triceps-extension',mg.id,array[]::text[],'Dumbbell','Beginner','Keep the upper arms stable and extend the weight overhead through the elbows.',true from public.muscle_groups mg where mg.name='Triceps' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Skull Crusher','skull-crusher',mg.id,array[]::text[],'EZ Bar','Intermediate','Lower the bar toward the forehead or slightly behind the head while keeping the upper arms controlled.',true from public.muscle_groups mg where mg.name='Triceps' on conflict (slug) do nothing;

insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Back Squat','back-squat',mg.id,array['Glutes','Hamstrings']::text[],'Barbell','Intermediate','Brace the trunk, descend under control and drive back up through the feet.',true from public.muscle_groups mg where mg.name='Quads' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Leg Press','leg-press',mg.id,array['Glutes','Hamstrings']::text[],'Machine','Beginner','Lower the platform to a comfortable depth and press through the feet.',true from public.muscle_groups mg where mg.name='Quads' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Hack Squat','hack-squat',mg.id,array['Glutes']::text[],'Machine','Intermediate','Keep the back supported, descend with control and press up smoothly.',true from public.muscle_groups mg where mg.name='Quads' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Leg Extension','leg-extension',mg.id,array[]::text[],'Machine','Beginner','Extend the knees smoothly, pause at the top and lower under control.',true from public.muscle_groups mg where mg.name='Quads' on conflict (slug) do nothing;

insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Romanian Deadlift','romanian-deadlift',mg.id,array['Glutes','Back']::text[],'Barbell','Intermediate','Push the hips back with a neutral spine and stand by extending the hips.',true from public.muscle_groups mg where mg.name='Hamstrings' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Seated Leg Curl','seated-leg-curl',mg.id,array[]::text[],'Machine','Beginner','Curl the pad down using the hamstrings and return slowly.',true from public.muscle_groups mg where mg.name='Hamstrings' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Lying Leg Curl','lying-leg-curl',mg.id,array[]::text[],'Machine','Beginner','Curl the heels toward the glutes while keeping the hips controlled.',true from public.muscle_groups mg where mg.name='Hamstrings' on conflict (slug) do nothing;

insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Barbell Hip Thrust','barbell-hip-thrust',mg.id,array['Hamstrings']::text[],'Barbell','Intermediate','Drive the hips upward through the heels and finish with the ribs stacked over the pelvis.',true from public.muscle_groups mg where mg.name='Glutes' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Glute Bridge','glute-bridge',mg.id,array['Hamstrings']::text[],'Bodyweight','Beginner','Press through the heels and raise the hips until the torso and thighs align.',true from public.muscle_groups mg where mg.name='Glutes' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Walking Lunge','walking-lunge',mg.id,array['Quads','Hamstrings']::text[],'Dumbbells','Intermediate','Step forward into a controlled lunge and drive through the front foot.',true from public.muscle_groups mg where mg.name='Glutes' on conflict (slug) do nothing;

insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Standing Calf Raise','standing-calf-raise',mg.id,array[]::text[],'Machine','Beginner','Rise onto the balls of the feet, pause at the top and lower slowly.',true from public.muscle_groups mg where mg.name='Calves' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Seated Calf Raise','seated-calf-raise',mg.id,array[]::text[],'Machine','Beginner','Press through the forefoot to raise the heels and lower through a comfortable range.',true from public.muscle_groups mg where mg.name='Calves' on conflict (slug) do nothing;

insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Plank','plank',mg.id,array['Shoulders']::text[],'Bodyweight','Beginner','Brace the trunk and maintain a straight line from head to heels.',true from public.muscle_groups mg where mg.name='Abs' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Hanging Knee Raise','hanging-knee-raise',mg.id,array['Forearms']::text[],'Bodyweight','Intermediate','Raise the knees by curling the pelvis upward and avoid swinging.',true from public.muscle_groups mg where mg.name='Abs' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Cable Crunch','cable-crunch',mg.id,array[]::text[],'Cable','Beginner','Flex the trunk through the abdominals while keeping the hips relatively fixed.',true from public.muscle_groups mg where mg.name='Abs' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Dead Bug','dead-bug',mg.id,array[]::text[],'Bodyweight','Beginner','Keep the lower back gently braced while extending opposite arm and leg.',true from public.muscle_groups mg where mg.name='Abs' on conflict (slug) do nothing;

insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Wrist Curl','wrist-curl',mg.id,array[]::text[],'Dumbbells','Beginner','Support the forearms and curl the wrists through a controlled range.',true from public.muscle_groups mg where mg.name='Forearms' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Reverse Curl','reverse-curl',mg.id,array['Biceps']::text[],'EZ Bar','Beginner','Use an overhand grip and curl while keeping the elbows close to the sides.',true from public.muscle_groups mg where mg.name='Forearms' on conflict (slug) do nothing;
insert into public.exercises (name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,instructions,is_system)
select 'Farmer Carry','farmer-carry',mg.id,array['Shoulders','Back']::text[],'Dumbbells','Beginner','Carry heavy dumbbells with tall posture, steady steps and a strong grip.',true from public.muscle_groups mg where mg.name='Forearms' on conflict (slug) do nothing;

commit;

select mg.name as muscle_group, count(e.id) as exercise_count
from public.muscle_groups mg
left join public.exercises e on e.primary_muscle_group_id = mg.id
group by mg.name
order by mg.name;
