// FitTrack Home Dashboard V2 — resilient mobile reload renderer.
(function(){
 const supabase=window.fitTrackSupabase,app=document.getElementById('app'),state=window.fitTrackState;if(!supabase||!app||!state)return;
 let requestToken=0,clockTimer=null;
 const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
 async function getUser(){try{const{data}=await supabase.auth.getSession();return data?.session?.user||null}catch{return null}}
 function iso(d){const x=new Date(d.getTime()-d.getTimezoneOffset()*60000);return x.toISOString().slice(0,10)}
 function todayISO(){return iso(new Date())}
 function weekStart(){const d=new Date(),diff=(d.getDay()+6)%7;d.setHours(0,0,0,0);d.setDate(d.getDate()-diff);return d}
 function greeting(){const h=new Date().getHours();return h<12?'Good morning':h<17?'Good afternoon':'Good evening'}
 function clockMarkup(){const now=new Date();return `<div><div class="eyebrow">Today</div><div class="home-date">${now.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'})}</div></div><div class="home-time">${now.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})}</div>`}
 function startClock(){clearInterval(clockTimer);clockTimer=setInterval(()=>{if(state.route!=='home'){clearInterval(clockTimer);clockTimer=null;return}const box=app.querySelector('[data-home-datetime]');if(box)box.innerHTML=clockMarkup()},1000)}
 function fmt(n){return Math.round(Number(n||0)).toLocaleString()}
 function dur(s){s=Number(s||0);return s<3600?`${Math.round(s/60)} min`:`${Math.floor(s/3600)}h ${Math.round((s%3600)/60)}m`}
 function quick(){return `<section class="card home-v2-actions"><div class="section-title">Quick start</div><div class="home-v2-action-grid"><button data-home-action="session"><b>◈</b><span>Workout</span><small>Open session</small></button><button data-home-action="planner"><b>＋</b><span>Planner</span><small>Schedule training</small></button><button data-home-start-activity="walk"><b>W</b><span>Walk</span><small>Track GPS</small></button><button data-home-start-activity="run"><b>R</b><span>Run</span><small>Track GPS</small></button><button data-home-start-activity="cycle"><b>C</b><span>Cycle</span><small>Track GPS</small></button><button data-home-action="progress"><b>↗</b><span>Progress</span><small>View analytics</small></button></div></section>`}
 function shell({todayPlan=null,exerciseCount=0,setCount=0,workouts=[],activities=[],weight=null}={}){
  const volume=workouts.reduce((s,r)=>s+Number(r.total_volume_kg||0),0),sets=workouts.reduce((s,r)=>s+Number(r.completed_sets||0),0),distance=activities.reduce((s,r)=>s+Number(r.distance_km||0),0),cal=activities.reduce((s,r)=>s+Number(r.estimated_calories||0),0),activeTime=activities.reduce((s,r)=>s+Number(r.duration_seconds||0),0);
  const trainingDays=new Set([...workouts.map(r=>iso(new Date(r.completed_at))),...activities.map(r=>iso(new Date(r.started_at)))]).size;
  let topLift=null,topWeight=0;workouts.forEach(w=>(w.workout_state?.exercises||[]).forEach(ex=>(ex.sets||[]).filter(s=>s.done).forEach(s=>{const kg=Number(s.weight||0);if(kg>topWeight){topWeight=kg;topLift=ex.name}})));
  const name=(window.fitTrackUser?.display_name||'').trim().split(/\s+/)[0];
  const hero=todayPlan?`<section class="card hero-card home-v2-hero"><div><div class="eyebrow">Today · Strength</div><h2 class="page-title home-hero-title">${esc(todayPlan.name)}</h2><p class="page-copy">${exerciseCount} exercises · ${setCount} planned sets</p></div><button class="primary-btn home-primary-action" data-fit-session-load="${todayPlan.id}">Start workout →</button></section>`:`<section class="card hero-card home-v2-hero"><div><div class="eyebrow">Today</div><h2 class="page-title home-hero-title">No workout scheduled</h2><p class="page-copy">Schedule a session or start an outdoor activity.</p></div><button class="primary-btn home-primary-action" data-home-action="planner">Open Planner →</button></section>`;
  return `<div class="page-head"><h1 class="page-title home-greeting">${greeting()}${name?', '+esc(name):''}</h1><p class="page-copy">Your training, activity and progress in one place.</p></div><div class="home-datetime" data-home-datetime>${clockMarkup()}</div>${hero}<section class="home-v2-kpis"><article><span>This week</span><strong>${workouts.length}</strong><small>workouts</small></article><article><span>Consistency</span><strong>${trainingDays}/7</strong><small>active days</small></article><article><span>Volume</span><strong>${fmt(volume)}</strong><small>kg lifted</small></article><article><span>Activity</span><strong>${distance.toFixed(1)}</strong><small>km</small></article></section>${quick()}<section class="grid grid-2 home-v2-panels"><article class="card"><div class="section-title">Strength this week</div><div class="home-v2-big">${sets}<small> sets completed</small></div><div class="home-v2-list"><div><span>Training volume</span><b>${fmt(volume)} kg</b></div><div><span>Top recorded lift</span><b>${topLift?`${esc(topLift)} · ${topWeight} kg`:'No lift yet'}</b></div><div><span>Latest workout</span><b>${workouts[0]?esc(workouts[0].workout_name):'None yet'}</b></div></div><button class="ghost-btn full-btn" data-home-action="progress">Open Progress</button></article><article class="card"><div class="section-title">Activity this week</div><div class="home-v2-big">${distance.toFixed(1)}<small> km</small></div><div class="home-v2-list"><div><span>Sessions</span><b>${activities.length}</b></div><div><span>Active time</span><b>${dur(activeTime)}</b></div><div><span>Calories</span><b>${fmt(cal)} kcal</b></div></div><button class="ghost-btn full-btn" data-home-action="activity">Start Activity</button></article></section>${weight?`<section class="card home-v2-weight"><div><div class="section-title">Bodyweight</div><div class="card-title">${Number(weight).toFixed(1)} kg</div></div><button class="secondary-btn" data-home-action="progress">View trend →</button></section>`:''}`;
 }
 async function safe(query,fallback){try{return await Promise.race([query,new Promise(resolve=>setTimeout(()=>resolve(fallback),4500))])}catch{return fallback}}
 async function renderHome(){
  if(state.route!=='home')return;const mine=++requestToken;
  app.innerHTML=shell();app.style.visibility='visible';app.style.opacity='1';startClock();
  let user=await getUser();if(!user){await new Promise(r=>setTimeout(r,350));user=await getUser()}if(!user||mine!==requestToken||state.route!=='home')return;
  const startISO=iso(weekStart()),today=todayISO();
  const [plannedR,workR,activityR,profileR]=await Promise.all([
   safe(supabase.from('planned_sessions').select('id,template_id,session_date,name,status').eq('user_id',user.id).gte('session_date',startISO).order('session_date'),{data:[]}),
   safe(supabase.from('completed_workouts').select('workout_name,total_volume_kg,completed_sets,duration_seconds,completed_at,workout_state').eq('user_id',user.id).gte('completed_at',`${startISO}T00:00:00`).order('completed_at',{ascending:false}),{data:[]}),
   safe(supabase.from('activity_sessions').select('activity_type,started_at,duration_seconds,distance_km,estimated_calories').eq('user_id',user.id).gte('started_at',`${startISO}T00:00:00`).order('started_at',{ascending:false}),{data:[]}),
   safe(supabase.from('profiles').select('weight_kg').eq('id',user.id).maybeSingle(),{data:null})
  ]);
  if(mine!==requestToken||state.route!=='home')return;
  const planned=plannedR?.data||[],workouts=workR?.data||[],activities=activityR?.data||[],todayPlan=planned.find(p=>p.session_date===today&&p.status==='planned');
  let exerciseCount=0,setCount=0;if(todayPlan){const rowsR=await safe(supabase.from('workout_template_exercises').select('planned_sets').eq('template_id',todayPlan.template_id),{data:[]});const rows=rowsR?.data||[];exerciseCount=rows.length;setCount=rows.reduce((s,r)=>s+Math.max(1,Number(r.planned_sets||0)),0)}
  if(mine!==requestToken||state.route!=='home')return;
  app.innerHTML=shell({todayPlan,exerciseCount,setCount,workouts,activities,weight:profileR?.data?.weight_kg});startClock();
 }
 function navigate(route,tab){state.route=route;if(tab)state.activeTab=tab;document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.route===route));window.fitTrackRender?.();window.scrollTo(0,0)}
 document.addEventListener('click',e=>{const a=e.target.closest('[data-home-action]');if(a){e.preventDefault();const x=a.dataset.homeAction;if(x==='planner')navigate('workout','Planner');else if(x==='session')navigate('workout','Session');else if(x==='progress')navigate('progress');else if(x==='activity')navigate('ride');return}const act=e.target.closest('[data-home-start-activity]');if(act){e.preventDefault();window.fitTrackStartActivity?.(act.dataset.homeStartActivity);return}if(e.target.closest('[data-route="home"]'))setTimeout(renderHome,0)});
 window.addEventListener('fittrack:user-ready',()=>{if(state.route==='home')setTimeout(renderHome,0)});
 window.fitTrackRenderHome=renderHome;
 setTimeout(renderHome,60);
})();