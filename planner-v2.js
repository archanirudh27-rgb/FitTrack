// FitTrack Planner V2: quick Push/Pull/Legs presets + one-tap template creation.
(function(){
  const supabase=window.fitTrackSupabase, app=document.getElementById('app'), toast=window.fitTrackShowToast;
  if(!supabase||!app)return;
  let busy=false;
  const presets={
    Push:['Barbell Bench Press','Incline Dumbbell Press','Overhead Press','Dumbbell Lateral Raise','Triceps Pushdown'],
    Pull:['Lat Pulldown','Barbell Bent Over Row','Seated Cable Row','Face Pull','Dumbbell Curl'],
    Legs:['Back Squat','Romanian Deadlift','Leg Press','Leg Extension','Seated Leg Curl','Standing Calf Raise']
  };
  async function user(){const{data}=await supabase.auth.getUser();return data?.user||null}
  function plannerList(){return app.querySelector('.page-title')?.textContent?.trim()==='My workouts'&&!app.querySelector('[data-template-row]')}
  function inject(){
    if(!plannerList()||app.querySelector('[data-planner-v2-presets]'))return;
    const section=document.createElement('section');section.className='card planner-v2-presets';section.dataset.plannerV2Presets='1';
    section.innerHTML=`<div class="meta-row"><div><div class="section-title">Quick templates</div><div class="card-title">Start with Push / Pull / Legs</div><div class="card-subtitle">Create a reusable workout instantly, then edit exercises, sets, reps and rest times.</div></div></div><div class="planner-v2-grid">${Object.keys(presets).map(name=>`<button class="planner-preset-card" data-create-preset="${name}"><span class="planner-preset-icon">${name[0]}</span><span><strong>${name}</strong><small>${presets[name].length} exercises</small></span><b>＋</b></button>`).join('')}</div>`;
    const tabs=app.querySelector('.tabs');tabs?.insertAdjacentElement('afterend',section);
  }
  async function createPreset(name,button){
    if(busy||!presets[name])return;busy=true;button.disabled=true;button.textContent='Creating…';
    const u=await user();if(!u){busy=false;button.disabled=false;toast?.('Sign in to create workouts');return}
    const names=presets[name];
    const{data:existing}=await supabase.from('workout_templates').select('id,name').eq('user_id',u.id).eq('name',name).limit(1);
    if(existing?.length){busy=false;button.disabled=false;toast?.(`${name} already exists`);window.dispatchEvent(new Event('fittrack:planner-refresh'));return}
    const{data:exercises,error:eErr}=await supabase.from('exercises').select('id,name').in('name',names).eq('is_system',true);
    if(eErr||!exercises?.length){busy=false;button.disabled=false;toast?.('Could not load preset exercises');return}
    const{data:t,error:tErr}=await supabase.from('workout_templates').insert({user_id:u.id,name,description:`FitTrack ${name} preset`}).select('id').single();
    if(tErr){busy=false;button.disabled=false;toast?.('Could not create workout');return}
    const map=new Map(exercises.map(x=>[x.name,x.id]));
    const rows=names.map((n,i)=>map.get(n)?{template_id:t.id,exercise_id:map.get(n),exercise_order:i+1,planned_sets:3,target_reps_min:n.includes('Lateral')?12:8,target_reps_max:n.includes('Lateral')?15:12,target_weight_kg:null,rest_seconds:n.includes('Squat')||n.includes('Bench')||n.includes('Deadlift')?120:90}:null).filter(Boolean);
    if(rows.length)await supabase.from('workout_template_exercises').insert(rows);
    busy=false;button.disabled=false;toast?.(`${name} workout created`);window.dispatchEvent(new Event('fittrack:planner-refresh'));
  }
  document.addEventListener('click',e=>{const b=e.target.closest('[data-create-preset]');if(!b)return;e.preventDefault();createPreset(b.dataset.createPreset,b)});
  new MutationObserver(()=>setTimeout(inject,20)).observe(app,{childList:true,subtree:true});setTimeout(inject,120);
})();