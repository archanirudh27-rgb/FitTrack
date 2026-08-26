// FitTrack Home health summary. Replaces GPS quick-start controls with read-only wearable health access.
(function(){
 const supabase=window.fitTrackSupabase,state=window.fitTrackState,app=document.getElementById('app');if(!supabase||!state||!app)return;
 let token=0,timer=null;
 const fmt=n=>Math.round(Number(n||0)).toLocaleString();
 const mins=m=>{m=Number(m||0);return `${Math.floor(m/60)}h ${Math.round(m%60)}m`};
 const iso=d=>new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
 function weekStart(){const d=new Date(),diff=(d.getDay()+6)%7;d.setHours(0,0,0,0);d.setDate(d.getDate()-diff);return d}
 async function user(){const{data}=await supabase.auth.getUser();return data?.user||null}
 function cleanActions(){
   if(state.route!=='home')return;
   const grid=app.querySelector('.home-v2-action-grid');
   if(grid){
     [...grid.querySelectorAll('[data-home-start-activity]')].forEach(x=>x.remove());
     if(!grid.querySelector('[data-health-home]')){
       const b=document.createElement('button');b.dataset.homeAction='activity';b.dataset.healthHome='1';b.innerHTML='<b>♥</b><span>Health</span><small>Wearable insights</small>';
       const progress=grid.querySelector('[data-home-action="progress"]');grid.insertBefore(b,progress||null);
     }
   }
   app.querySelectorAll('[data-home-action="activity"]').forEach(b=>{if(!b.dataset.healthHome)b.textContent='Open Health'});
   const heroCopy=app.querySelector('.home-v2-hero .page-copy');if(heroCopy&&/outdoor activity/i.test(heroCopy.textContent))heroCopy.textContent='Schedule a session or review your health and activity.';
 }
 async function enhance(){
   if(state.route!=='home')return;cleanActions();const mine=++token,u=await user();if(!u||mine!==token)return;
   let rows=[];try{const r=await supabase.from('health_daily').select('metric_date,steps,distance_km,active_calories,resting_hr_bpm,sleep_minutes').eq('user_id',u.id).gte('metric_date',iso(weekStart())).order('metric_date',{ascending:false});if(!r.error)rows=r.data||[]}catch{}
   if(mine!==token||state.route!=='home')return;cleanActions();
   const today=rows.find(r=>r.metric_date===iso(new Date()))||rows[0],distance=rows.reduce((s,r)=>s+Number(r.distance_km||0),0),steps=rows.reduce((s,r)=>s+Number(r.steps||0),0),cal=rows.reduce((s,r)=>s+Number(r.active_calories||0),0);
   const kpi=app.querySelector('.home-v2-kpis article:nth-child(4)');if(kpi)kpi.innerHTML=`<span>Health</span><strong>${today?fmt(today.steps):'—'}</strong><small>steps today</small>`;
   const panel=app.querySelector('.home-v2-panels article:nth-child(2)');if(panel)panel.innerHTML=`<div class="section-title">Health this week</div><div class="home-v2-big">${distance.toFixed(1)}<small> km</small></div><div class="home-v2-list"><div><span>Steps</span><b>${rows.length?fmt(steps):'No sync yet'}</b></div><div><span>Active calories</span><b>${rows.length?`${fmt(cal)} kcal`:'—'}</b></div><div><span>Latest sleep</span><b>${today?.sleep_minutes!=null?mins(today.sleep_minutes):'—'}</b></div></div><button class="ghost-btn full-btn" data-home-action="activity">Open Health</button>`;
 }
 function scheduleEnhance(){
   if(state.route!=='home')return;
   // The Home clock mutates once a second. Only re-enhance when another renderer has
   // replaced the Quick Start block and our Health button is actually missing.
   const grid=app.querySelector('.home-v2-action-grid');
   if(!grid||grid.querySelector('[data-health-home]'))return;
   clearTimeout(timer);timer=setTimeout(enhance,90);
 }
 document.addEventListener('click',e=>{const b=e.target.closest('[data-health-home]');if(b){e.preventDefault();state.route='ride';window.fitTrackRender?.();setTimeout(()=>window.fitTrackRenderHealth?.(),0)}} ,true);
 window.addEventListener('fittrack:health-synced',()=>{if(state.route==='home')enhance()});
 new MutationObserver(scheduleEnhance).observe(app,{childList:true,subtree:true});
 setTimeout(enhance,500);
})();