-- FitTrack starter exercise library.
-- Safe to run repeatedly. Existing exercises are left unchanged.

insert into exercises (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select v.name, v.slug, mg.id, v.secondary_muscles, v.equipment, v.difficulty, v.instructions, true
from (values
  ('Barbell Bench Press','barbell-bench-press','Chest',array['Triceps','Shoulders'],'Barbell','Intermediate','Lie on a flat bench, lower the bar with control to mid-chest, then press up while keeping shoulder blades set.'),
  ('Incline Dumbbell Press','incline-dumbbell-press','Chest',array['Triceps','Shoulders'],'Dumbbells','Intermediate','Set the bench to a moderate incline, lower dumbbells beside the upper chest, then press upward without losing shoulder position.'),
  ('Cable Crossover','cable-crossover','Chest',array['Shoulders'],'Cable','Beginner','Keep a slight bend in the elbows and bring the handles together in front of the chest under control.'),
  ('Pec Deck Fly','pec-deck-fly','Chest',array[]::text[],'Machine','Beginner','Keep the back supported, bring the handles together through the chest, and return slowly.'),
  ('Push-Up','push-up','Chest',array['Triceps','Shoulders'],'Bodyweight','Beginner','Maintain a straight body line, lower the chest toward the floor, then press back up.'),

  ('Lat Pulldown','lat-pulldown','Back',array['Biceps'],'Cable','Beginner','Pull the bar toward the upper chest while keeping the torso stable and shoulders away from the ears.'),
  ('Barbell Bent-Over Row','barbell-bent-over-row','Back',array['Biceps','Hamstrings'],'Barbell','Intermediate','Hinge at the hips, keep a neutral spine, row the bar toward the lower ribs, and lower with control.'),
  ('Seated Cable Row','seated-cable-row','Back',array['Biceps'],'Cable','Intermediate','Sit tall and pull the handle toward the lower ribs without excessive torso movement.'),
  ('One-Arm Dumbbell Row','one-arm-dumbbell-row','Back',array['Biceps'],'Dumbbell','Beginner','Support the torso, row the dumbbell toward the hip, and avoid rotating the body.'),
  ('Pull-Up','pull-up','Back',array['Biceps','Forearms'],'Bodyweight','Intermediate','Start from a controlled hang, pull the chest upward by driving the elbows down, then lower under control.'),

  ('Overhead Press','overhead-press','Shoulders',array['Triceps'],'Barbell','Intermediate','Brace the torso and press the bar overhead in a straight, controlled path.'),
  ('Dumbbell Shoulder Press','dumbbell-shoulder-press','Shoulders',array['Triceps'],'Dumbbells','Beginner','Press dumbbells overhead while keeping ribs stacked and shoulders controlled.'),
  ('Dumbbell Lateral Raise','dumbbell-lateral-raise','Shoulders',array[]::text[],'Dumbbells','Beginner','Raise the dumbbells out to the sides with soft elbows until around shoulder height, then lower slowly.'),
  ('Reverse Pec Deck','reverse-pec-deck','Shoulders',array['Back'],'Machine','Beginner','Keep the chest supported and move the arms outward to target the rear delts.'),
  ('Face Pull','face-pull','Shoulders',array['Back'],'Cable','Beginner','Pull the rope toward the face while externally rotating the shoulders and keeping the elbows high.'),

  ('Dumbbell Curl','dumbbell-curl','Biceps',array['Forearms'],'Dumbbells','Beginner','Keep elbows near the sides and curl the dumbbells without swinging.'),
  ('EZ-Bar Curl','ez-bar-curl','Biceps',array['Forearms'],'EZ Bar','Beginner','Curl the bar while keeping the upper arms relatively still.'),
  ('Hammer Curl','hammer-curl','Biceps',array['Forearms'],'Dumbbells','Beginner','Use a neutral grip and curl without letting the elbows drift forward.'),
  ('Cable Curl','cable-curl','Biceps',array['Forearms'],'Cable','Beginner','Maintain constant cable tension and curl through a controlled range.'),

  ('Cable Pushdown','cable-pushdown','Triceps',array[]::text[],'Cable','Beginner','Keep elbows close to the torso and extend the arms fully without leaning excessively.'),
  ('Overhead Triceps Extension','overhead-triceps-extension','Triceps',array[]::text[],'Dumbbell','Beginner','Keep the upper arms stable and extend the weight overhead through the elbows.'),
  ('Skull Crusher','skull-crusher','Triceps',array[]::text[],'EZ Bar','Intermediate','Lower the bar toward the forehead or slightly behind the head while keeping the upper arms controlled.'),
  ('Assisted Dip','assisted-dip','Triceps',array['Chest','Shoulders'],'Machine','Beginner','Descend under control and press back up while keeping shoulders stable.'),

  ('Back Squat','back-squat','Quads',array['Glutes','Hamstrings'],'Barbell','Intermediate','Brace the trunk, sit down between the hips, keep knees tracking over the feet, then drive back up.'),
  ('Leg Press','leg-press','Quads',array['Glutes','Hamstrings'],'Machine','Beginner','Lower the platform until comfortable depth, keep the lower back supported, then press through the feet.'),
  ('Hack Squat','hack-squat','Quads',array['Glutes'],'Machine','Intermediate','Keep the back supported and descend with controlled knee and hip flexion before pressing up.'),
  ('Leg Extension','leg-extension','Quads',array[]::text[],'Machine','Beginner','Extend the knees smoothly, pause briefly at the top, then lower under control.'),
  ('Bulgarian Split Squat','bulgarian-split-squat','Quads',array['Glutes'],'Dumbbells','Intermediate','Keep the front foot planted, descend vertically, then drive through the front leg.'),

  ('Romanian Deadlift','romanian-deadlift','Hamstrings',array['Glutes','Back'],'Barbell','Intermediate','Push the hips back with a neutral spine, keep the bar close to the legs, then stand by extending the hips.'),
  ('Seated Leg Curl','seated-leg-curl','Hamstrings',array[]::text[],'Machine','Beginner','Curl the pad down using the hamstrings and return slowly without lifting the hips.'),
  ('Lying Leg Curl','lying-leg-curl','Hamstrings',array[]::text[],'Machine','Beginner','Curl the heels toward the glutes while keeping the hips controlled against the pad.'),
  ('Good Morning','good-morning','Hamstrings',array['Glutes','Back'],'Barbell','Advanced','Use a controlled hip hinge with a braced trunk and only as much range as can be maintained safely.'),

  ('Barbell Hip Thrust','barbell-hip-thrust','Glutes',array['Hamstrings'],'Barbell','Intermediate','Drive the hips upward through the heels and finish with the ribs stacked over the pelvis.'),
  ('Glute Bridge','glute-bridge','Glutes',array['Hamstrings'],'Bodyweight','Beginner','Press through the heels and raise the hips until the torso and thighs align.'),
  ('Cable Kickback','cable-kickback','Glutes',array[]::text[],'Cable','Beginner','Extend the working leg backward from the hip without excessively arching the lower back.'),
  ('Walking Lunge','walking-lunge','Glutes',array['Quads','Hamstrings'],'Dumbbells','Intermediate','Step forward into a controlled lunge and drive through the front foot into the next step.'),

  ('Standing Calf Raise','standing-calf-raise','Calves',array[]::text[],'Machine','Beginner','Rise onto the balls of the feet, pause at the top, and lower through a comfortable stretch.'),
  ('Seated Calf Raise','seated-calf-raise','Calves',array[]::text[],'Machine','Beginner','Press through the forefoot to raise the heels and lower slowly through full range.'),
  ('Single-Leg Calf Raise','single-leg-calf-raise','Calves',array[]::text[],'Bodyweight','Beginner','Use one leg at a time and move through a controlled full range.'),

  ('Plank','plank','Abs',array['Shoulders'],'Bodyweight','Beginner','Brace the trunk and maintain a straight line from head to heels without letting the hips sag.'),
  ('Hanging Knee Raise','hanging-knee-raise','Abs',array['Forearms'],'Bodyweight','Intermediate','Raise the knees by curling the pelvis upward and avoid uncontrolled swinging.'),
  ('Cable Crunch','cable-crunch','Abs',array[]::text[],'Cable','Beginner','Flex the trunk through the abdominals while keeping the hips relatively fixed.'),
  ('Dead Bug','dead-bug','Abs',array[]::text[],'Bodyweight','Beginner','Keep the lower back gently braced against the floor while extending opposite arm and leg.'),

  ('Wrist Curl','wrist-curl','Forearms',array[]::text[],'Dumbbells','Beginner','Support the forearms and curl the wrists through a controlled range.'),
  ('Reverse Curl','reverse-curl','Forearms',array['Biceps'],'EZ Bar','Beginner','Use an overhand grip and curl while keeping the elbows close to the sides.'),
  ('Farmer Carry','farmer-carry','Forearms',array['Shoulders','Back'],'Dumbbells','Beginner','Carry heavy dumbbells with tall posture, steady steps, and a strong grip.')
) as v(name,slug,muscle,secondary_muscles,equipment,difficulty,instructions)
join muscle_groups mg on mg.name = v.muscle
on conflict (slug) do nothing;
