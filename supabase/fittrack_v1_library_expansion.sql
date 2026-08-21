-- FitTrack V1 Exercise Library Expansion - simplified migration
-- Safe to rerun. Adds missing muscle groups and missing exercise slugs only.
-- Instructions are intentionally omitted here and can be enriched separately after the library is verified.

begin;

insert into public.muscle_groups (name)
select v.name
from (values
 ('Chest'),('Back'),('Shoulders'),('Biceps'),('Triceps'),('Forearms'),
 ('Quads'),('Hamstrings'),('Glutes'),('Calves'),('Abs'),('Full Body')
) as v(name)
where not exists (select 1 from public.muscle_groups mg where mg.name=v.name);

insert into public.exercises
(name,slug,primary_muscle_group_id,secondary_muscles,equipment,difficulty,is_system)
select v.name,v.slug,mg.id,
 case when v.secondary_csv='' then array[]::text[] else string_to_array(v.secondary_csv,',') end,
 v.equipment,v.difficulty,true
from (values
('Barbell Bench Press','barbell-bench-press','Chest','Triceps,Shoulders','Barbell','Intermediate'),
('Incline Barbell Bench Press','incline-barbell-bench-press','Chest','Triceps,Shoulders','Barbell','Intermediate'),
('Decline Barbell Bench Press','decline-barbell-bench-press','Chest','Triceps','Barbell','Intermediate'),
('Dumbbell Bench Press','dumbbell-bench-press','Chest','Triceps,Shoulders','Dumbbells','Beginner'),
('Incline Dumbbell Press','incline-dumbbell-press','Chest','Triceps,Shoulders','Dumbbells','Beginner'),
('Dumbbell Fly','dumbbell-fly','Chest','Shoulders','Dumbbells','Intermediate'),
('Cable Fly','cable-fly','Chest','Shoulders','Cable','Beginner'),
('Low-to-High Cable Fly','low-to-high-cable-fly','Chest','Shoulders','Cable','Intermediate'),
('Machine Chest Press','machine-chest-press','Chest','Triceps,Shoulders','Machine','Beginner'),
('Push Up','push-up','Chest','Triceps,Shoulders','Bodyweight','Beginner'),
('Barbell Bent Over Row','barbell-bent-over-row','Back','Biceps,Hamstrings','Barbell','Intermediate'),
('Pendlay Row','pendlay-row','Back','Biceps','Barbell','Intermediate'),
('One Arm Dumbbell Row','one-arm-dumbbell-row','Back','Biceps','Dumbbells','Beginner'),
('Chest Supported Dumbbell Row','chest-supported-dumbbell-row','Back','Biceps','Dumbbells','Beginner'),
('Seated Cable Row','seated-cable-row','Back','Biceps','Cable','Beginner'),
('Lat Pulldown','lat-pulldown','Back','Biceps','Cable','Beginner'),
('Straight Arm Pulldown','straight-arm-pulldown','Back','Triceps','Cable','Intermediate'),
('Pull Up','pull-up','Back','Biceps,Forearms','Bodyweight','Intermediate'),
('Chin Up','chin-up','Back','Biceps,Forearms','Bodyweight','Intermediate'),
('Machine High Row','machine-high-row','Back','Biceps','Machine','Beginner'),
('Overhead Press','overhead-press','Shoulders','Triceps','Barbell','Intermediate'),
('Seated Dumbbell Shoulder Press','seated-dumbbell-shoulder-press','Shoulders','Triceps','Dumbbells','Beginner'),
('Arnold Press','arnold-press','Shoulders','Triceps','Dumbbells','Intermediate'),
('Dumbbell Lateral Raise','dumbbell-lateral-raise','Shoulders','','Dumbbells','Beginner'),
('Cable Lateral Raise','cable-lateral-raise','Shoulders','','Cable','Beginner'),
('Rear Delt Fly','rear-delt-fly','Shoulders','Back','Dumbbells','Beginner'),
('Face Pull','face-pull','Shoulders','Back','Cable','Beginner'),
('Machine Shoulder Press','machine-shoulder-press','Shoulders','Triceps','Machine','Beginner'),
('Barbell Curl','barbell-curl','Biceps','Forearms','Barbell','Beginner'),
('EZ Bar Curl','ez-bar-curl','Biceps','Forearms','EZ Bar','Beginner'),
('Dumbbell Curl','dumbbell-curl','Biceps','Forearms','Dumbbells','Beginner'),
('Hammer Curl','hammer-curl','Biceps','Forearms','Dumbbells','Beginner'),
('Incline Dumbbell Curl','incline-dumbbell-curl','Biceps','Forearms','Dumbbells','Intermediate'),
('Preacher Curl','preacher-curl','Biceps','Forearms','Machine','Beginner'),
('Cable Curl','cable-curl','Biceps','Forearms','Cable','Beginner'),
('Close Grip Bench Press','close-grip-bench-press','Triceps','Chest,Shoulders','Barbell','Intermediate'),
('Triceps Pushdown','triceps-pushdown','Triceps','','Cable','Beginner'),
('Rope Pushdown','rope-pushdown','Triceps','','Cable','Beginner'),
('Overhead Cable Triceps Extension','overhead-cable-triceps-extension','Triceps','','Cable','Intermediate'),
('Dumbbell Overhead Triceps Extension','dumbbell-overhead-triceps-extension','Triceps','','Dumbbells','Beginner'),
('Skull Crusher','skull-crusher','Triceps','','EZ Bar','Intermediate'),
('Bench Dip','bench-dip','Triceps','Chest,Shoulders','Bodyweight','Beginner'),
('Wrist Curl','wrist-curl','Forearms','','Dumbbells','Beginner'),
('Reverse Wrist Curl','reverse-wrist-curl','Forearms','','Dumbbells','Beginner'),
('Reverse Curl','reverse-curl','Forearms','Biceps','EZ Bar','Beginner'),
('Farmer Carry','farmer-carry','Forearms','Shoulders,Back','Dumbbells','Beginner'),
('Back Squat','back-squat','Quads','Glutes,Hamstrings','Barbell','Intermediate'),
('Front Squat','front-squat','Quads','Glutes,Abs','Barbell','Intermediate'),
('Goblet Squat','goblet-squat','Quads','Glutes','Dumbbells','Beginner'),
('Leg Press','leg-press','Quads','Glutes','Machine','Beginner'),
('Hack Squat','hack-squat','Quads','Glutes','Machine','Intermediate'),
('Bulgarian Split Squat','bulgarian-split-squat','Quads','Glutes,Hamstrings','Dumbbells','Intermediate'),
('Walking Lunge','walking-lunge','Quads','Glutes,Hamstrings','Bodyweight','Beginner'),
('Leg Extension','leg-extension','Quads','','Machine','Beginner'),
('Romanian Deadlift','romanian-deadlift','Hamstrings','Glutes,Back','Barbell','Intermediate'),
('Dumbbell Romanian Deadlift','dumbbell-romanian-deadlift','Hamstrings','Glutes,Back','Dumbbells','Beginner'),
('Lying Leg Curl','lying-leg-curl','Hamstrings','','Machine','Beginner'),
('Seated Leg Curl','seated-leg-curl','Hamstrings','','Machine','Beginner'),
('Good Morning','good-morning','Hamstrings','Glutes,Back','Barbell','Intermediate'),
('Nordic Hamstring Curl','nordic-hamstring-curl','Hamstrings','Glutes','Bodyweight','Advanced'),
('Single Leg Romanian Deadlift','single-leg-romanian-deadlift','Hamstrings','Glutes','Dumbbells','Intermediate'),
('Hip Thrust','hip-thrust','Glutes','Hamstrings','Barbell','Intermediate'),
('Glute Bridge','glute-bridge','Glutes','Hamstrings','Bodyweight','Beginner'),
('Cable Pull Through','cable-pull-through','Glutes','Hamstrings','Cable','Beginner'),
('Cable Kickback','cable-kickback','Glutes','Hamstrings','Cable','Beginner'),
('Step Up','step-up','Glutes','Quads,Hamstrings','Dumbbells','Beginner'),
('Reverse Lunge','reverse-lunge','Glutes','Quads,Hamstrings','Bodyweight','Beginner'),
('Frog Pump','frog-pump','Glutes','Hamstrings','Bodyweight','Beginner'),
('Standing Calf Raise','standing-calf-raise','Calves','','Machine','Beginner'),
('Seated Calf Raise','seated-calf-raise','Calves','','Machine','Beginner'),
('Single Leg Calf Raise','single-leg-calf-raise','Calves','','Bodyweight','Beginner'),
('Leg Press Calf Raise','leg-press-calf-raise','Calves','','Machine','Beginner'),
('Plank','plank','Abs','Shoulders','Bodyweight','Beginner'),
('Side Plank','side-plank','Abs','Shoulders','Bodyweight','Beginner'),
('Cable Crunch','cable-crunch','Abs','','Cable','Beginner'),
('Hanging Knee Raise','hanging-knee-raise','Abs','Forearms','Bodyweight','Intermediate'),
('Hanging Leg Raise','hanging-leg-raise','Abs','Forearms','Bodyweight','Advanced'),
('Dead Bug','dead-bug','Abs','','Bodyweight','Beginner'),
('Russian Twist','russian-twist','Abs','','Bodyweight','Beginner'),
('Bicycle Crunch','bicycle-crunch','Abs','','Bodyweight','Beginner'),
('Burpee','burpee','Full Body','Chest,Quads,Shoulders','Bodyweight','Intermediate'),
('Bear Crawl','bear-crawl','Full Body','Shoulders,Abs,Quads','Bodyweight','Intermediate'),
('Squat Jump','squat-jump','Full Body','Quads,Glutes,Calves','Bodyweight','Intermediate'),
('Plank Shoulder Tap','plank-shoulder-tap','Full Body','Shoulders,Abs','Bodyweight','Beginner'),
('Inchworm','inchworm','Full Body','Shoulders,Abs,Hamstrings','Bodyweight','Beginner'),
('Mountain Climber','mountain-climber','Full Body','Abs,Shoulders,Quads','Bodyweight','Beginner'),
('Jumping Jack','jumping-jack','Full Body','Shoulders,Calves','Bodyweight','Beginner'),
('High Knees','high-knees','Full Body','Quads,Calves,Abs','Bodyweight','Beginner'),
('Kettlebell Swing','kettlebell-swing','Full Body','Glutes,Hamstrings,Back','Kettlebell','Intermediate'),
('Thruster','thruster','Full Body','Quads,Shoulders,Triceps','Dumbbells','Intermediate')
) as v(name,slug,muscle,secondary_csv,equipment,difficulty)
join public.muscle_groups mg on mg.name=v.muscle
where not exists (select 1 from public.exercises e where e.slug=v.slug);

commit;

select mg.name as muscle_group,count(e.id) as exercise_count
from public.muscle_groups mg
left join public.exercises e on e.primary_muscle_group_id=mg.id and e.is_system=true
where mg.name in ('Chest','Back','Shoulders','Biceps','Triceps','Forearms','Quads','Hamstrings','Glutes','Calves','Abs','Full Body')
group by mg.name
order by mg.name;