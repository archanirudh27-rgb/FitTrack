-- FitTrack exercise library seed v3
-- Uses the exact INSERT ... SELECT pattern verified in Supabase.
-- Safe to run repeatedly because exercise slugs are unique.

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Barbell Bench Press','barbell-bench-press',id,array['Triceps','Shoulders']::text[],'Barbell','Intermediate','Lie on a flat bench, lower the bar with control to mid-chest, then press upward while keeping the shoulder blades set.',true
from public.muscle_groups where name='Chest'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Incline Dumbbell Press','incline-dumbbell-press',id,array['Triceps','Shoulders']::text[],'Dumbbells','Intermediate','Set the bench to a moderate incline, lower the dumbbells beside the upper chest, then press upward with control.',true
from public.muscle_groups where name='Chest'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Cable Crossover','cable-crossover',id,array['Shoulders']::text[],'Cable','Beginner','Keep a slight bend in the elbows and bring the handles together in front of the chest under control.',true
from public.muscle_groups where name='Chest'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Pec Deck Fly','pec-deck-fly',id,array[]::text[],'Machine','Beginner','Keep the back supported, bring the handles together through the chest, and return slowly.',true
from public.muscle_groups where name='Chest'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Push-Up','push-up',id,array['Triceps','Shoulders']::text[],'Bodyweight','Beginner','Maintain a straight body line, lower the chest toward the floor, then press back up.',true
from public.muscle_groups where name='Chest'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Lat Pulldown','lat-pulldown',id,array['Biceps']::text[],'Cable','Beginner','Pull the bar toward the upper chest while keeping the torso stable and shoulders away from the ears.',true
from public.muscle_groups where name='Back'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Barbell Bent-Over Row','barbell-bent-over-row',id,array['Biceps','Hamstrings']::text[],'Barbell','Intermediate','Hinge at the hips, keep a neutral spine, row the bar toward the lower ribs, and lower with control.',true
from public.muscle_groups where name='Back'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Seated Cable Row','seated-cable-row',id,array['Biceps']::text[],'Cable','Intermediate','Sit tall and pull the handle toward the lower ribs without excessive torso movement.',true
from public.muscle_groups where name='Back'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'One-Arm Dumbbell Row','one-arm-dumbbell-row',id,array['Biceps']::text[],'Dumbbell','Beginner','Support the torso, row the dumbbell toward the hip, and avoid rotating the body.',true
from public.muscle_groups where name='Back'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Pull-Up','pull-up',id,array['Biceps','Forearms']::text[],'Bodyweight','Intermediate','Start from a controlled hang, pull the chest upward by driving the elbows down, then lower under control.',true
from public.muscle_groups where name='Back'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Overhead Press','overhead-press',id,array['Triceps']::text[],'Barbell','Intermediate','Brace the torso and press the bar overhead in a straight, controlled path.',true
from public.muscle_groups where name='Shoulders'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Dumbbell Shoulder Press','dumbbell-shoulder-press',id,array['Triceps']::text[],'Dumbbells','Beginner','Press the dumbbells overhead while keeping the ribs stacked and shoulders controlled.',true
from public.muscle_groups where name='Shoulders'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Dumbbell Lateral Raise','dumbbell-lateral-raise',id,array[]::text[],'Dumbbells','Beginner','Raise the dumbbells out to the sides with soft elbows until around shoulder height, then lower slowly.',true
from public.muscle_groups where name='Shoulders'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Reverse Pec Deck','reverse-pec-deck',id,array['Back']::text[],'Machine','Beginner','Keep the chest supported and move the arms outward to target the rear delts.',true
from public.muscle_groups where name='Shoulders'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Face Pull','face-pull',id,array['Back']::text[],'Cable','Beginner','Pull the rope toward the face while externally rotating the shoulders and keeping the elbows high.',true
from public.muscle_groups where name='Shoulders'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Dumbbell Curl','dumbbell-curl',id,array['Forearms']::text[],'Dumbbells','Beginner','Keep the elbows near the sides and curl the dumbbells without swinging.',true
from public.muscle_groups where name='Biceps'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'EZ-Bar Curl','ez-bar-curl',id,array['Forearms']::text[],'EZ Bar','Beginner','Curl the bar while keeping the upper arms relatively still.',true
from public.muscle_groups where name='Biceps'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Hammer Curl','hammer-curl',id,array['Forearms']::text[],'Dumbbells','Beginner','Use a neutral grip and curl without letting the elbows drift forward.',true
from public.muscle_groups where name='Biceps'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Cable Curl','cable-curl',id,array['Forearms']::text[],'Cable','Beginner','Maintain constant cable tension and curl through a controlled range.',true
from public.muscle_groups where name='Biceps'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Cable Pushdown','cable-pushdown',id,array[]::text[],'Cable','Beginner','Keep the elbows close to the torso and extend the arms fully without leaning excessively.',true
from public.muscle_groups where name='Triceps'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Overhead Triceps Extension','overhead-triceps-extension',id,array[]::text[],'Dumbbell','Beginner','Keep the upper arms stable and extend the weight overhead through the elbows.',true
from public.muscle_groups where name='Triceps'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Skull Crusher','skull-crusher',id,array[]::text[],'EZ Bar','Intermediate','Lower the bar toward the forehead or slightly behind the head while keeping the upper arms controlled.',true
from public.muscle_groups where name='Triceps'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Assisted Dip','assisted-dip',id,array['Chest','Shoulders']::text[],'Machine','Beginner','Descend under control and press back up while keeping the shoulders stable.',true
from public.muscle_groups where name='Triceps'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Back Squat','back-squat',id,array['Glutes','Hamstrings']::text[],'Barbell','Intermediate','Brace the trunk, sit down between the hips, keep the knees tracking over the feet, then drive back up.',true
from public.muscle_groups where name='Quads'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Leg Press','leg-press',id,array['Glutes','Hamstrings']::text[],'Machine','Beginner','Lower the platform until a comfortable depth, keep the lower back supported, then press through the feet.',true
from public.muscle_groups where name='Quads'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Hack Squat','hack-squat',id,array['Glutes']::text[],'Machine','Intermediate','Keep the back supported and descend with controlled knee and hip flexion before pressing up.',true
from public.muscle_groups where name='Quads'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Leg Extension','leg-extension',id,array[]::text[],'Machine','Beginner','Extend the knees smoothly, pause briefly at the top, then lower under control.',true
from public.muscle_groups where name='Quads'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Bulgarian Split Squat','bulgarian-split-squat',id,array['Glutes']::text[],'Dumbbells','Intermediate','Keep the front foot planted, descend vertically, then drive through the front leg.',true
from public.muscle_groups where name='Quads'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Romanian Deadlift','romanian-deadlift',id,array['Glutes','Back']::text[],'Barbell','Intermediate','Push the hips back with a neutral spine, keep the bar close to the legs, then stand by extending the hips.',true
from public.muscle_groups where name='Hamstrings'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Seated Leg Curl','seated-leg-curl',id,array[]::text[],'Machine','Beginner','Curl the pad down using the hamstrings and return slowly without lifting the hips.',true
from public.muscle_groups where name='Hamstrings'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Lying Leg Curl','lying-leg-curl',id,array[]::text[],'Machine','Beginner','Curl the heels toward the glutes while keeping the hips controlled against the pad.',true
from public.muscle_groups where name='Hamstrings'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Good Morning','good-morning',id,array['Glutes','Back']::text[],'Barbell','Advanced','Use a controlled hip hinge with a braced trunk and only as much range as can be maintained safely.',true
from public.muscle_groups where name='Hamstrings'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Barbell Hip Thrust','barbell-hip-thrust',id,array['Hamstrings']::text[],'Barbell','Intermediate','Drive the hips upward through the heels and finish with the ribs stacked over the pelvis.',true
from public.muscle_groups where name='Glutes'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Glute Bridge','glute-bridge',id,array['Hamstrings']::text[],'Bodyweight','Beginner','Press through the heels and raise the hips until the torso and thighs align.',true
from public.muscle_groups where name='Glutes'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Cable Kickback','cable-kickback',id,array[]::text[],'Cable','Beginner','Extend the working leg backward from the hip without excessively arching the lower back.',true
from public.muscle_groups where name='Glutes'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Walking Lunge','walking-lunge',id,array['Quads','Hamstrings']::text[],'Dumbbells','Intermediate','Step forward into a controlled lunge and drive through the front foot into the next step.',true
from public.muscle_groups where name='Glutes'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Standing Calf Raise','standing-calf-raise',id,array[]::text[],'Machine','Beginner','Rise onto the balls of the feet, pause at the top, and lower through a comfortable stretch.',true
from public.muscle_groups where name='Calves'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Seated Calf Raise','seated-calf-raise',id,array[]::text[],'Machine','Beginner','Press through the forefoot to raise the heels and lower slowly through full range.',true
from public.muscle_groups where name='Calves'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Single-Leg Calf Raise','single-leg-calf-raise',id,array[]::text[],'Bodyweight','Beginner','Use one leg at a time and move through a controlled full range.',true
from public.muscle_groups where name='Calves'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Plank','plank',id,array['Shoulders']::text[],'Bodyweight','Beginner','Brace the trunk and maintain a straight line from head to heels without letting the hips sag.',true
from public.muscle_groups where name='Abs'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Hanging Knee Raise','hanging-knee-raise',id,array['Forearms']::text[],'Bodyweight','Intermediate','Raise the knees by curling the pelvis upward and avoid uncontrolled swinging.',true
from public.muscle_groups where name='Abs'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Cable Crunch','cable-crunch',id,array[]::text[],'Cable','Beginner','Flex the trunk through the abdominals while keeping the hips relatively fixed.',true
from public.muscle_groups where name='Abs'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Dead Bug','dead-bug',id,array[]::text[],'Bodyweight','Beginner','Keep the lower back gently braced against the floor while extending the opposite arm and leg.',true
from public.muscle_groups where name='Abs'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Wrist Curl','wrist-curl',id,array[]::text[],'Dumbbells','Beginner','Support the forearms and curl the wrists through a controlled range.',true
from public.muscle_groups where name='Forearms'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Reverse Curl','reverse-curl',id,array['Biceps']::text[],'EZ Bar','Beginner','Use an overhand grip and curl while keeping the elbows close to the sides.',true
from public.muscle_groups where name='Forearms'
on conflict (slug) do nothing;

insert into public.exercises
(name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select 'Farmer Carry','farmer-carry',id,array['Shoulders','Back']::text[],'Dumbbells','Beginner','Carry heavy dumbbells with tall posture, steady steps, and a strong grip.',true
from public.muscle_groups where name='Forearms'
on conflict (slug) do nothing;
