-- FitTrack exercise library seed v2
-- Uses simple independent INSERT statements to avoid parser ambiguity.
-- Safe to run repeatedly.

insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Barbell Bench Press','barbell-bench-press',(select id from muscle_groups where name='Chest'),array['Triceps','Shoulders'],'Barbell','Intermediate','Lie on a flat bench, lower the bar with control to mid-chest, then press up while keeping shoulder blades set.',true)
on conflict (slug) do nothing;

insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Incline Dumbbell Press','incline-dumbbell-press',(select id from muscle_groups where name='Chest'),array['Triceps','Shoulders'],'Dumbbells','Intermediate','Set the bench to a moderate incline, lower dumbbells beside the upper chest, then press upward without losing shoulder position.',true)
on conflict (slug) do nothing;

insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Cable Crossover','cable-crossover',(select id from muscle_groups where name='Chest'),array['Shoulders'],'Cable','Beginner','Keep a slight bend in the elbows and bring the handles together in front of the chest under control.',true)
on conflict (slug) do nothing;

insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Lat Pulldown','lat-pulldown',(select id from muscle_groups where name='Back'),array['Biceps'],'Cable','Beginner','Pull the bar toward the upper chest while keeping the torso stable and shoulders away from the ears.',true) on conflict (slug) do nothing;
insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Barbell Bent-Over Row','barbell-bent-over-row',(select id from muscle_groups where name='Back'),array['Biceps','Hamstrings'],'Barbell','Intermediate','Hinge at the hips, keep a neutral spine, row the bar toward the lower ribs, and lower with control.',true) on conflict (slug) do nothing;
insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Seated Cable Row','seated-cable-row',(select id from muscle_groups where name='Back'),array['Biceps'],'Cable','Intermediate','Sit tall and pull the handle toward the lower ribs without excessive torso movement.',true) on conflict (slug) do nothing;

insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Overhead Press','overhead-press',(select id from muscle_groups where name='Shoulders'),array['Triceps'],'Barbell','Intermediate','Brace the torso and press the bar overhead in a straight, controlled path.',true) on conflict (slug) do nothing;
insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Dumbbell Lateral Raise','dumbbell-lateral-raise',(select id from muscle_groups where name='Shoulders'),array[]::text[],'Dumbbells','Beginner','Raise the dumbbells out to the sides with soft elbows until around shoulder height, then lower slowly.',true) on conflict (slug) do nothing;
insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Face Pull','face-pull',(select id from muscle_groups where name='Shoulders'),array['Back'],'Cable','Beginner','Pull the rope toward the face while externally rotating the shoulders and keeping the elbows high.',true) on conflict (slug) do nothing;

insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Dumbbell Curl','dumbbell-curl',(select id from muscle_groups where name='Biceps'),array['Forearms'],'Dumbbells','Beginner','Keep elbows near the sides and curl the dumbbells without swinging.',true) on conflict (slug) do nothing;
insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Hammer Curl','hammer-curl',(select id from muscle_groups where name='Biceps'),array['Forearms'],'Dumbbells','Beginner','Use a neutral grip and curl without letting the elbows drift forward.',true) on conflict (slug) do nothing;

insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Cable Pushdown','cable-pushdown',(select id from muscle_groups where name='Triceps'),array[]::text[],'Cable','Beginner','Keep elbows close to the torso and extend the arms fully without leaning excessively.',true) on conflict (slug) do nothing;
insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Overhead Triceps Extension','overhead-triceps-extension',(select id from muscle_groups where name='Triceps'),array[]::text[],'Dumbbell','Beginner','Keep the upper arms stable and extend the weight overhead through the elbows.',true) on conflict (slug) do nothing;

insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Back Squat','back-squat',(select id from muscle_groups where name='Quads'),array['Glutes','Hamstrings'],'Barbell','Intermediate','Brace the trunk, sit down between the hips, keep knees tracking over the feet, then drive back up.',true) on conflict (slug) do nothing;
insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Leg Press','leg-press',(select id from muscle_groups where name='Quads'),array['Glutes','Hamstrings'],'Machine','Beginner','Lower the platform until comfortable depth, keep the lower back supported, then press through the feet.',true) on conflict (slug) do nothing;
insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Leg Extension','leg-extension',(select id from muscle_groups where name='Quads'),array[]::text[],'Machine','Beginner','Extend the knees smoothly, pause briefly at the top, then lower under control.',true) on conflict (slug) do nothing;

insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Romanian Deadlift','romanian-deadlift',(select id from muscle_groups where name='Hamstrings'),array['Glutes','Back'],'Barbell','Intermediate','Push the hips back with a neutral spine, keep the bar close to the legs, then stand by extending the hips.',true) on conflict (slug) do nothing;
insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Seated Leg Curl','seated-leg-curl',(select id from muscle_groups where name='Hamstrings'),array[]::text[],'Machine','Beginner','Curl the pad down using the hamstrings and return slowly without lifting the hips.',true) on conflict (slug) do nothing;

insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Barbell Hip Thrust','barbell-hip-thrust',(select id from muscle_groups where name='Glutes'),array['Hamstrings'],'Barbell','Intermediate','Drive the hips upward through the heels and finish with the ribs stacked over the pelvis.',true) on conflict (slug) do nothing;
insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Walking Lunge','walking-lunge',(select id from muscle_groups where name='Glutes'),array['Quads','Hamstrings'],'Dumbbells','Intermediate','Step forward into a controlled lunge and drive through the front foot into the next step.',true) on conflict (slug) do nothing;

insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Standing Calf Raise','standing-calf-raise',(select id from muscle_groups where name='Calves'),array[]::text[],'Machine','Beginner','Rise onto the balls of the feet, pause at the top, and lower through a comfortable stretch.',true) on conflict (slug) do nothing;

insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Plank','plank',(select id from muscle_groups where name='Abs'),array['Shoulders'],'Bodyweight','Beginner','Brace the trunk and maintain a straight line from head to heels without letting the hips sag.',true) on conflict (slug) do nothing;
insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Cable Crunch','cable-crunch',(select id from muscle_groups where name='Abs'),array[]::text[],'Cable','Beginner','Flex the trunk through the abdominals while keeping the hips relatively fixed.',true) on conflict (slug) do nothing;

insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Wrist Curl','wrist-curl',(select id from muscle_groups where name='Forearms'),array[]::text[],'Dumbbells','Beginner','Support the forearms and curl the wrists through a controlled range.',true) on conflict (slug) do nothing;
insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
values ('Farmer Carry','farmer-carry',(select id from muscle_groups where name='Forearms'),array['Shoulders','Back'],'Dumbbells','Beginner','Carry heavy dumbbells with tall posture, steady steps, and a strong grip.',true) on conflict (slug) do nothing;
