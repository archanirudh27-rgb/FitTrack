// FitTrack Home: single final render with one live date/time and quick activities.
(function(){
  const supabase=window.fitTrackSupabase;
  const app=document.getElementById('app');
  const state=window.fitTrackState;
  if(!supabase||!app||!state)return;

  let requestToken=0;
  let clockTimer=null;

  async function getUser(){const {data,error}=await supabase.auth.getUser();return error?null:(data.user||null)}
  function esc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
  function todayISO(){const d=new Date(),local=new Date(d.getTime()-d.getTimezoneOffset()*60000);return local.toISOString().slice(0,10)}
  function greeting(){const h=new Date().getHours();return h<12?'Good morning':h<17?'Good afternoon':'Good evening'}
  function clockMarkup(){const now=new Date();const date=now.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'});const time=now.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'});return `<div><div class="eyebrow">Today</div><div class="home-date">${date}</div></div><div class="home-time">${time}</div>`}
  function startClock(){clearInterval(clockTimer);clockTimer=setInterval(()=>{if(state.route!=='home'){clearInterval(clockTimer);clockTimer=null;return}const box=app.querySelector('[data-home-datetime]');if(box)box.innerHTML=clockMarkup()},1000)}
  function quickActivities(){return `<section class="card home-activity-card" data-home-quick-activities="1"><div class="home-section-head"><div><div class="section-title">Activity</div><div class="card-title home-section-title">Start an activity</div></div><span class="home-section-hint">GPS starts after tap</span></div><div class="home-quick-actions"><button class="home-quick-action" data-home-start-activity="walk" aria-label="Start Walk"><span class="home-quick-icon">W</span><span>Walk</span></button><button class="home-quick-action" data-home-start-activity="run" aria-label="Start Run"><span class="home-quick-icon">R</span><span>Run</span></button><button class="home-quick-action" data-home-start-activity="cycle" aria-label="Start Cycle"><span class="home-quick-icon">C</span><span>Cycle</span></button></div></section>`}

  async function renderHome(){
    if(state.route!=='home')return;
    const mine=++requestToken;
    const user=await getUser();
    if(!user||mine!==requestToken||state.route!=='home')return;

    const {data:planned,error}=await supabase.from('planned_sessions').select('id,template_id,session_date,name,status').eq('user_id',user.id).eq('session_date',todayISO()).eq('status','planned').order('id',{ascending:true}).limit(1).maybeSingle();
    if(error||mine!==requestToken||state.route!=='home')return;

    let hero='';
    if(planned){
      const {data:rows}=await supabase.from('workout_template_exercises').select('planned_sets').eq('template_id',planned.template_id);
      if(mine!==requestToken||state.route!=='home')return;
      const exercises=(rows||[]).length;
      const sets=(rows||[]).reduce((sum,row)=>sum+Math.max(1,Number(row.planned_sets||0)),0);
      hero=`<section class="card hero-card"><div><div class="eyebrow">Today · Strength</div><h2 class="page-title home-hero-title">${esc(planned.name)}</h2><p class="page-copy">${exercises} exercise${exercises===1?'':'s'} · ${sets} planned set${sets===1?'':'s'}</p></div><button class="primary-btn home-primary-action" data-fit-session-load="${planned.id}">Start workout →</button></section>`;
    }else{
      hero=`<section class="card hero-card"><div><div class="eyebrow">Today · Planner</div><h2 class="page-title home-hero-title">No workout scheduled</h2><p class="page-copy">Plan a workout for today, or start an activity below.</p></div><button class="primary-btn home-primary-action" data-fit-home-planner>Open Planner →</button></section>`;
    }

    app.innerHTML=`<div class="page-head"><h1 class="page-title home-greeting">${greeting()}, Anirudh</h1><p class="page-copy">Your next session is ready. Keep the focus on consistency and clean progression.</p></div><div class="home-datetime" data-home-datetime="1">${clockMarkup()}</div>${hero}${quickActivities()}`;
    app.style.visibility='visible';
    app.style.opacity='1';
    startClock();
  }

  document.addEventListener('click',event=>{
    const planner=event.target.closest('[data-fit-home-planner]');
    if(planner){event.preventDefault();state.route='workout';state.activeTab='Planner';document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.route==='workout'));window.fitTrackRender?.();window.scrollTo(0,0);return}
    const btn=event.target.closest('[data-home-start-activity]');
    if(btn){event.preventDefault();window.fitTrackStartActivity?.(btn.dataset.homeStartActivity);return}
    const nav=event.target.closest('[data-route]');
    if(nav&&nav.dataset.route==='home')setTimeout(renderHome,0);
  });

  setTimeout(renderHome,50);
})();
