-- FitTrack V1 Exercise Library Expansion
-- Safe to run more than once: muscle groups and exercises are inserted only when missing.

begin;

insert into public.muscle_groups (name)
select v.name
from (values
  ('Chest'),
  ('Back'),
  ('Shoulders'),
  ('Biceps'),
  ('Triceps'),
  ('Forearms'),
  ('Quads'),
  ('Hamstrings'),
  ('Glutes'),
  ('Calves'),
  ('Abs'),
  ('Full Body')
) as v(name)
where not exists (
  select 1 from public.muscle_groups mg where mg.name = v.name
);

insert into public.exercises
  (name, slug, primary_muscle_group_id, secondary_muscles, equipment, difficulty, instructions, is_system)
select
  v.name,
  v.slug,
  mg.id,
  case
    when v.secondary_csv = '' then array[]::text[]
    else string_to_array(v.secondary_csv, ',')
  end,
  v.equipment,
  v.difficulty,
  v.instructions,
  true
from (values
  ('Barbell Bench Press','barbell-bench-press','Chest','Triceps,Shoulders','Barbell','Intermediate','Lower the bar to mid-chest with control and press to full extension.'),
  ('Incline Barbell Bench Press','incline-barbell-bench-press','Chest','Triceps,Shoulders','Barbell','Intermediate','Press from an incline bench while keeping the shoulder blades set.'),
  ('Decline Barbell Bench Press','decline-barbell-bench-press','Chest','Triceps','Barbell','Intermediate','Press from a decline bench with a controlled touch point on the lower chest.'),
  ('Dumbbell Bench Press','dumbbell-bench-press','Chest','Triceps,Shoulders','Dumbbells','Beginner','Press dumbbells from chest level while keeping the upper back stable.'),
  ('Incline Dumbbell Press','incline-dumbbell-press','Chest','Triceps,Shoulders','Dumbbells','Beginner','Press dumbbells on an incline bench through a controlled range.'),
  ('Dumbbell Fly','dumbbell-fly','Chest','Shoulders','Dumbbells','Intermediate','Open the arms in a wide arc with soft elbows and return above the chest.'),
  ('Cable Fly','cable-fly','Chest','Shoulders','Cable','Beginner','Bring the cable handles together in front of the chest with soft elbows.'),
  ('Low-to-High Cable Fly','low-to-high-cable-fly','Chest','Shoulders','Cable','Intermediate','Sweep the cable handles upward and inward from low pulleys.'),
  ('Machine Chest Press','machine-chest-press','Chest','Triceps,Shoulders','Machine','Beginner','Press the machine handles forward while keeping the back supported.'),
  ('Push Up','push-up','Chest','Triceps,Shoulders','Bodyweight','Beginner','Lower the chest toward the floor with a braced body and push back up.'),
  ('Barbell Bent Over Row','barbell-bent-over-row','Back','Biceps,Hamstrings','Barbell','Intermediate','Hinge at the hips and row the bar toward the lower ribs.'),
  ('Pendlay Row','pendlay-row','Back','Biceps','Barbell','Intermediate','Row the bar from the floor each rep while keeping a stable torso.'),
  ('One Arm Dumbbell Row','one-arm-dumbbell-row','Back','Biceps','Dumbbells','Beginner','Support the torso and row one dumbbell toward the hip.'),
  ('Chest Supported Dumbbell Row','chest-supported-dumbbell-row','Back','Biceps','Dumbbells','Beginner','Lie chest-down on an incline bench and row without torso momentum.'),
  ('Seated Cable Row','seated-cable-row','Back','Biceps','Cable','Beginner','Pull the cable handle toward the abdomen while keeping the torso tall.'),
  ('Lat Pulldown','lat-pulldown','Back','Biceps','Cable','Beginner','Pull the bar toward the upper chest by driving the elbows down.'),
  ('Straight Arm Pulldown','straight-arm-pulldown','Back','Triceps','Cable','Intermediate','Keep the arms nearly straight and pull the cable toward the thighs.'),
  ('Pull Up','pull-up','Back','Biceps,Forearms','Bodyweight','Intermediate','Pull the chest upward toward the bar with controlled shoulders.'),
  ('Chin Up','chin-up','Back','Biceps,Forearms','Bodyweight','Intermediate','Use a supinated grip and pull until the chin clears the bar.'),
  ('Machine High Row','machine-high-row','Back','Biceps','Machine','Beginner','Pull the machine handles down and back with controlled shoulder blades.'),
  ('Overhead Press','overhead-press','Shoulders','Triceps','Barbell','Intermediate','Press the bar overhead while keeping the ribs stacked.'),
  ('Seated Dumbbell Shoulder Press','seated-dumbbell-shoulder-press','Shoulders','Triceps','Dumbbells','Beginner','Press dumbbells overhead from shoulder level with the back supported.'),
  ('Arnold Press','arnold-press','Shoulders','Triceps','Dumbbells','Intermediate','Rotate the dumbbells outward as you press overhead.'),
  ('Dumbbell Lateral Raise','dumbbell-lateral-raise','Shoulders','','Dumbbells','Beginner','Raise the dumbbells out to the sides without shrugging.'),
  ('Cable Lateral Raise','cable-lateral-raise','Shoulders','','Cable','Beginner','Raise one cable handle out to the side with constant tension.'),
  ('Rear Delt Fly','rear-delt-fly','Shoulders','Back','Dumbbells','Beginner','Sweep the arms outward to target the rear delts.'),
  ('Face Pull','face-pull','Shoulders','Back','Cable','Beginner','Pull the rope toward the face while externally rotating the shoulders.'),
  ('Machine Shoulder Press','machine-shoulder-press','Shoulders','Triceps','Machine','Beginner','Press the handles overhead with the torso supported.'),
  ('Barbell Curl','barbell-curl','Biceps','Forearms','Barbell','Beginner','Curl the bar while keeping the upper arms close to the torso.'),
  ('EZ Bar Curl','ez-bar-curl','Biceps','Forearms','EZ Bar','Beginner','Curl an EZ bar with controlled elbows and no leaning back.'),
  ('Dumbbell Curl','dumbbell-curl','Biceps','Forearms','Dumbbells','Beginner','Curl the dumbbells while keeping the shoulders quiet.'),
  ('Hammer Curl','hammer-curl','Biceps','Forearms','Dumbbells','Beginner','Curl dumbbells with a neutral grip.'),
  ('Incline Dumbbell Curl','incline-dumbbell-curl','Biceps','Forearms','Dumbbells','Intermediate','Curl from an incline bench with upper arms behind the torso.'),
  ('Preacher Curl','preacher-curl','Biceps','Forearms','Machine','Beginner','Curl with the upper arms supported and control the lowering phase.'),
  ('Cable Curl','cable-curl','Biceps','Forearms','Cable','Beginner','Curl the cable handle toward the shoulders with constant tension.'),
  ('Close Grip Bench Press','close-grip-bench-press','Triceps','Chest,Shoulders','Barbell','Intermediate','Press with a narrower grip while keeping elbows controlled.'),
  ('Triceps Pushdown','triceps-pushdown','Triceps','','Cable','Beginner','Extend the elbows to press the handle down with upper arms fixed.'),
  ('Rope Pushdown','rope-pushdown','Triceps','','Cable','Beginner','Press the rope down and slightly apart at the bottom.'),
  ('Overhead Cable Triceps Extension','overhead-cable-triceps-extension','Triceps','','Cable','Intermediate','Extend the elbows overhead while keeping the upper arms steady.'),
  ('Dumbbell Overhead Triceps Extension','dumbbell-overhead-triceps-extension','Triceps','','Dumbbells','Beginner','Lower the dumbbell behind the head and extend the elbows.'),
  ('Skull Crusher','skull-crusher','Triceps','','EZ Bar','Intermediate','Lower the bar toward the forehead by bending only at the elbows.'),
  ('Bench Dip','bench-dip','Triceps','Chest,Shoulders','Bodyweight','Beginner','Lower the body by bending the elbows and press back up.'),
  ('Wrist Curl','wrist-curl','Forearms','','Dumbbells','Beginner','Support the forearms and curl the wrists through a controlled range.'),
  ('Reverse Wrist Curl','reverse-wrist-curl','Forearms','','Dumbbells','Beginner','Extend the wrists upward with the forearms supported.'),
  ('Reverse Curl','reverse-curl','Forearms','Biceps','EZ Bar','Beginner','Curl with an overhand grip while keeping the elbows close.'),
  ('Farmer Carry','farmer-carry','Forearms','Shoulders,Back','Dumbbells','Beginner','Carry heavy dumbbells with tall posture and a strong grip.'),
  ('Back Squat','back-squat','Quads','Glutes,Hamstrings','Barbell','Intermediate','Squat with the whole foot planted and trunk braced.'),
  ('Front Squat','front-squat','Quads','Glutes,Abs','Barbell','Intermediate','Squat with the bar on the front shoulders and torso upright.'),
  ('Goblet Squat','goblet-squat','Quads','Glutes','Dumbbells','Beginner','Hold a dumbbell at the chest and squat with knees tracking over toes.'),
  ('Leg Press','leg-press','Quads','Glutes','Machine','Beginner','Lower the sled under control and press through the whole foot.'),
  ('Hack Squat','hack-squat','Quads','Glutes','Machine','Intermediate','Squat in the machine with the back supported.'),
  ('Bulgarian Split Squat','bulgarian-split-squat','Quads','Glutes,Hamstrings','Dumbbells','Intermediate','Lower with the rear foot elevated and drive through the front foot.'),
  ('Walking Lunge','walking-lunge','Quads','Glutes,Hamstrings','Bodyweight','Beginner','Step forward into controlled lunges with an upright torso.'),
  ('Leg Extension','leg-extension','Quads','','Machine','Beginner','Extend the knees against the machine and lower slowly.'),
  ('Romanian Deadlift','romanian-deadlift','Hamstrings','Glutes,Back','Barbell','Intermediate','Hinge at the hips with soft knees until the hamstrings are loaded.'),
  ('Dumbbell Romanian Deadlift','dumbbell-romanian-deadlift','Hamstrings','Glutes,Back','Dumbbells','Beginner','Hinge with dumbbells close to the legs and a neutral spine.'),
  ('Lying Leg Curl','lying-leg-curl','Hamstrings','','Machine','Beginner','Curl the heels toward the glutes while keeping the hips down.'),
  ('Seated Leg Curl','seated-leg-curl','Hamstrings','','Machine','Beginner','Flex the knees against the pad and control the return.'),
  ('Good Morning','good-morning','Hamstrings','Glutes,Back','Barbell','Intermediate','Hinge forward with a braced torso and extend the hips to stand.'),
  ('Nordic Hamstring Curl','nordic-hamstring-curl','Hamstrings','Glutes','Bodyweight','Advanced','Lower forward from the knees as slowly as possible with hips extended.'),
  ('Single Leg Romanian Deadlift','single-leg-romanian-deadlift','Hamstrings','Glutes','Dumbbells','Intermediate','Hinge on one leg while keeping the hips square.'),
  ('Hip Thrust','hip-thrust','Glutes','Hamstrings','Barbell','Intermediate','Drive the hips upward and finish with the glutes squeezed.'),
  ('Glute Bridge','glute-bridge','Glutes','Hamstrings','Bodyweight','Beginner','Drive through the feet to lift the hips with ribs controlled.'),
  ('Cable Pull Through','cable-pull-through','Glutes','Hamstrings','Cable','Beginner','Hinge away from the cable and extend the hips to stand tall.'),
  ('Cable Kickback','cable-kickback','Glutes','Hamstrings','Cable','Beginner','Extend one leg backward from the hip while keeping the pelvis square.'),
  ('Step Up','step-up','Glutes','Quads,Hamstrings','Dumbbells','Beginner','Step onto a stable box and drive through the working leg.'),
  ('Reverse Lunge','reverse-lunge','Glutes','Quads,Hamstrings','Bodyweight','Beginner','Step backward into a lunge and drive through the front foot.'),
  ('Frog Pump','frog-pump','Glutes','Hamstrings','Bodyweight','Beginner','Press the soles together and repeatedly drive the hips upward.'),
  ('Standing Calf Raise','standing-calf-raise','Calves','','Machine','Beginner','Rise onto the balls of the feet and lower under control.'),
  ('Seated Calf Raise','seated-calf-raise','Calves','','Machine','Beginner','Raise the heels against resistance while seated.'),
  ('Single Leg Calf Raise','single-leg-calf-raise','Calves','','Bodyweight','Beginner','Rise onto the toes on one leg using support if needed.'),
  ('Leg Press Calf Raise','leg-press-calf-raise','Calves','','Machine','Beginner','Press through the balls of the feet on the leg press platform.'),
  ('Plank','plank','Abs','Shoulders','Bodyweight','Beginner','Brace the trunk and maintain a straight line from head to heels.'),
  ('Side Plank','side-plank','Abs','Shoulders','Bodyweight','Beginner','Support the body on one forearm and keep the hips lifted.'),
  ('Cable Crunch','cable-crunch','Abs','','Cable','Beginner','Flex the trunk through the abdominals while keeping the hips relatively fixed.'),
  ('Hanging Knee Raise','hanging-knee-raise','Abs','Forearms','Bodyweight','Intermediate','Raise the knees toward the chest while minimizing swinging.'),
  ('Hanging Leg Raise','hanging-leg-raise','Abs','Forearms','Bodyweight','Advanced','Lift the legs upward using controlled abdominal flexion.'),
  ('Dead Bug','dead-bug','Abs','','Bodyweight','Beginner','Lower opposite arm and leg while keeping the lower back gently braced.'),
  ('Russian Twist','russian-twist','Abs','','Bodyweight','Beginner','Rotate the torso side to side under control.'),
  ('Bicycle Crunch','bicycle-crunch','Abs','','Bodyweight','Beginner','Alternate bringing the elbow toward the opposite knee.'),
  ('Burpee','burpee','Full Body','Chest,Quads,Shoulders','Bodyweight','Intermediate','Move from standing to a plank and back to standing, adding a jump if appropriate.'),
  ('Bear Crawl','bear-crawl','Full Body','Shoulders,Abs,Quads','Bodyweight','Intermediate','Crawl forward with knees hovering low and trunk braced.'),
  ('Squat Jump','squat-jump','Full Body','Quads,Glutes,Calves','Bodyweight','Intermediate','Squat down, jump vertically, and land softly.'),
  ('Plank Shoulder Tap','plank-shoulder-tap','Full Body','Shoulders,Abs','Bodyweight','Beginner','Tap the opposite shoulder from a plank while resisting hip rotation.'),
  ('Inchworm','inchworm','Full Body','Shoulders,Abs,Hamstrings','Bodyweight','Beginner','Hinge forward, walk the hands to a plank, then walk them back.'),
  ('Mountain Climber','mountain-climber','Full Body','Abs,Shoulders,Quads','Bodyweight','Beginner','Alternate driving the knees toward the chest from a strong plank.'),
  ('Jumping Jack','jumping-jack','Full Body','Shoulders,Calves','Bodyweight','Beginner','Jump the feet apart while raising the arms overhead and return.'),
  ('High Knees','high-knees','Full Body','Quads,Calves,Abs','Bodyweight','Beginner','Run in place while lifting the knees high with an upright posture.'),
  ('Kettlebell Swing','kettlebell-swing','Full Body','Glutes,Hamstrings,Back','Kettlebell','Intermediate','Hinge and explosively extend the hips to swing the kettlebell.'),
  ('Thruster','thruster','Full Body','Quads,Shoulders,Triceps','Dumbbells','Intermediate','Move from a front squat directly into an overhead press.')
) as v(name,slug,muscle,secondary_csv,equipment,difficulty,instructions)
join public.muscle_groups mg
  on mg.name = v.muscle
where not exists (
  select 1
  from public.exercises e
  where e.slug = v.slug
);

commit;

-- Verification: counts by muscle group after migration
select
  mg.name as muscle_group,
  count(e.id) as exercise_count
from public.muscle_groups mg
left join public.exercises e
  on e.primary_muscle_group_id = mg.id
 and e.is_system = true
where mg.name in ('Chest','Back','Shoulders','Biceps','Triceps','Forearms','Quads','Hamstrings','Glutes','Calves','Abs','Full Body')
group by mg.name
order by mg.name;
