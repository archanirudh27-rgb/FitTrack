// FitTrack Health & Activity dashboard — read-only wearable/Health Connect data.
(function(){
 const supabase=window.fitTrackSupabase,state=window.fitTrackState,app=document.getElementById('app');
 if(!supabase||!state||!app)return;
 let token=0,rendering=false,observerTimer=null;
 const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
 const fmt=n=>Math.round(Number(n||0)).toLocaleString();
 const date=v=>new Date(v).toLocaleDateString(undefined,{day:'numeric',month:'short'});
 const todayISO=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)};
 const mins=m=>{m=Number(m||0);return `${Math.floor(m/60)}h ${Math.round(m%60)}m`};
 const dur=s=>{s=Number(s||0);return s<3600?`${Math.round(s/60)} min`:`${Math.floor(s/3600)}h ${Math.round((s%3600)/60)}m`};
 async function user(){const{data,error}=await supabase.auth.getUser();return error?null:(data?.user||null)}
 function lastSync(){const v=localStorage.getItem('fittrack:health-last-sync');return v?new Date(v).toLocaleString(undefined,{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}):'Not synced yet'}
 function metric(value,suffix='—',digits=0){if(value===null||value===undefined||Number.isNaN(Number(value)))return'—';return `${Number(value).toFixed(digits)}${suffix}`}
 function sourceLabel(row){return row?.source_system==='health_connect'?'Health Connect':'Health data'}
 function setupCard(native){return `<div class="health-sync-card"><div class="health-status ${native?'connected':''}">${native?'Wearable sync ready':'Wearable sync not connected'}</div><div class="card-title" style="margin-top:12px">Sync with wearable</div><p class="page-copy" style="margin-top:7px">${native?'Import your latest wearable records from Health Connect into FitTrack.':'Use the Android FitTrack app to sync Health Connect. Once synced, your records will appear here automatically.'}</p><div class="health-source" style="margin-top:12px">Last sync · ${esc(lastSync())}</div><button class="primary-btn" data-health-sync>${native?'Sync wearable':'Sync wearable'}</button></div>`}
 function trendBars(rows,key,label,formatter){const vals=rows.slice(-7),max=Math.max(1,...vals.map(r=>Number(r[key]||0)));return `<article class="card"><div class="section-title">${label} · 7 days</div><div style="display:grid;gap:10px;margin-top:14px">${vals.map(r=>{const v=Number(r[key]||0),w=Math.max(3,Math.round(v/max*100));return `<div><div style="display:flex;justify-content:space-between;gap:8px;font-size:11px;color:#8f98a5"><span>${date(r.metric_date)}</span><b style="color:#cbd1d7">${formatter(v)}</b></div><div class="health-bar"><i style="width:${w}%"></i></div></div>`}).join('')||'<div class="health-empty">No trend data yet</div>'}</div></article>`}
 function sessionsList(rows){return `<section class="card health-section"><div class="section-title">Recent activities</div>${rows.length?rows.slice(0,8).map(r=>{const type=String(r.activity_type||'activity');const label=type.charAt(0).toUpperCase()+type.slice(1);return `<div class="health-session"><div><strong>${esc(label)}</strong><small>${date(r.started_at)} · ${dur(r.duration_seconds)}${Number(r.distance_km||0)?` · ${Number(r.distance_km).toFixed(2)} km`:''}</small></div><div style="text-align:right"><b>${fmt(r.estimated_calories)} kcal</b><small>${r.is_imported?'Imported':'Saved'}</small></div></div>`}).join(''):'<div class="health-empty">No wearable activities synced yet</div>'}</section>`}
 function emptyState(native){
   return `<div data-health-view><div class="page-head"><div class="eyebrow">Health & activity</div><h1 class="page-title">Sync with wearable to load records</h1><p class="page-copy">Bring your steps, sleep, heart data and activities into FitTrack.</p></div><section class="health-hero"><div class="health-hero-main"><div class="eyebrow">Wearable health</div><div class="card-title" style="font-size:30px;margin-top:10px">Your health records will appear here</div><p class="page-copy" style="margin-top:10px">After your first sync, FitTrack will show daily steps, distance, active calories, heart rate, sleep and imported activities in one place.</p><div class="health-metric-row"><div><span>Steps</span><b>—</b></div><div><span>Heart</span><b>—</b></div><div><span>Sleep</span><b>—</b></div></div></div>${setupCard(native)}</section></div>`
 }
 function renderData(daily,sessions){
   const native=!!window.fitTrackHealth?.available?.(),today=daily.find(r=>r.metric_date===todayISO())||daily[0]||null;
   if(!today){app.innerHTML=emptyState(native);return}
   const sleep=today?.sleep_minutes,steps=today?.steps,distance=today?.distance_km,cal=today?.active_calories;
   const hasHeart=today&&(today.resting_hr_bpm!=null||today.avg_hr_bpm!=null||today.hrv_rmssd_ms!=null);
   const hasSleep=today&&today.sleep_minutes!=null;
   const hasRecovery=today&&(today.spo2_avg!=null||today.respiratory_rate_avg!=null);
   app.innerHTML=`<div data-health-view><div class="page-head"><div class="eyebrow">Health & activity</div><h1 class="page-title">Your daily health</h1><p class="page-copy">Wearable data brought together with your FitTrack training.</p></div><section class="health-hero"><div class="health-hero-main"><div class="eyebrow">${today?.metric_date===todayISO()?'Today':'Latest health day'}</div><div class="health-hero-value" style="margin-top:10px">${fmt(steps||0)}<small>steps</small></div><div class="health-kpis"><div class="health-kpi"><span>Distance</span><strong>${metric(distance,' km',1)}</strong><small>walk/run total</small></div><div class="health-kpi"><span>Active calories</span><strong>${cal==null?'—':fmt(cal)}</strong><small>kcal</small></div><div class="health-kpi"><span>Resting HR</span><strong>${metric(today?.resting_hr_bpm,' bpm',0)}</strong><small>heart</small></div><div class="health-kpi"><span>Sleep</span><strong>${sleep==null?'—':mins(sleep)}</strong><small>last sleep</small></div></div></div>${setupCard(native)}</section>${today?`<section class="health-grid health-section">${hasHeart?`<article class="card"><div class="section-title">Heart</div><div class="health-metric-row"><div><span>Resting</span><b>${metric(today.resting_hr_bpm,' bpm')}</b></div><div><span>Average</span><b>${metric(today.avg_hr_bpm,' bpm')}</b></div><div><span>HRV</span><b>${metric(today.hrv_rmssd_ms,' ms')}</b></div></div>${today.min_hr_bpm!=null||today.max_hr_bpm!=null?`<p class="page-copy" style="margin-top:12px">Range ${metric(today.min_hr_bpm,' bpm')} – ${metric(today.max_hr_bpm,' bpm')}</p>`:''}</article>`:''}${hasSleep?`<article class="card"><div class="section-title">Sleep</div><div class="card-title" style="font-size:28px;margin-top:8px">${mins(today.sleep_minutes)}</div><div class="health-metric-row"><div><span>Deep</span><b>${today.deep_sleep_minutes==null?'—':mins(today.deep_sleep_minutes)}</b></div><div><span>REM</span><b>${today.rem_sleep_minutes==null?'—':mins(today.rem_sleep_minutes)}</b></div><div><span>Light</span><b>${today.light_sleep_minutes==null?'—':mins(today.light_sleep_minutes)}</b></div></div></article>`:''}${hasRecovery?`<article class="card"><div class="section-title">Recovery signals</div><div class="health-metric-row"><div><span>SpO₂</span><b>${metric(today.spo2_avg,'%',1)}</b></div><div><span>Resp. rate</span><b>${metric(today.respiratory_rate_avg,'/min',1)}</b></div><div><span>Source</span><b style="font-size:12px">${sourceLabel(today)}</b></div></div></article>`:''}</section>`:''}${sessionsList(sessions)}<section class="health-grid health-section">${trendBars(daily,'steps','Steps',v=>fmt(v))}${trendBars(daily,'sleep_minutes','Sleep',v=>v?mins(v):'—')}</section></div>`;
 }
 async function render(){
   if(state.route!=='ride'||rendering)return;
   const mine=++token;
   rendering=true;
   try{
     const u=await user();if(!u||mine!==token||state.route!=='ride')return;
     app.innerHTML=`<div data-health-view><div class="page-head"><div class="eyebrow">Health & activity</div><h1 class="page-title">Sync with wearable to load records</h1><p class="page-copy">Checking for your latest synced wearable data…</p></div></div>`;
     let daily=[],sessions=[];
     try{const r=await supabase.from('health_daily').select('*').eq('user_id',u.id).order('metric_date',{ascending:false}).limit(30);if(!r.error)daily=r.data||[]}catch{}
     try{const r=await supabase.from('activity_sessions').select('activity_type,started_at,duration_seconds,distance_km,estimated_calories,is_imported').eq('user_id',u.id).order('started_at',{ascending:false}).limit(20);if(!r.error)sessions=r.data||[]}catch{
       try{const r=await supabase.from('activity_sessions').select('activity_type,started_at,duration_seconds,distance_km,estimated_calories').eq('user_id',u.id).order('started_at',{ascending:false}).limit(20);if(!r.error)sessions=(r.data||[]).map(x=>({...x,is_imported:false}))}catch{}
     }
     if(mine!==token||state.route!=='ride')return;renderData(daily,sessions)
   }finally{
     if(mine===token)rendering=false;
   }
 }
 document.addEventListener('click',async e=>{
   if(e.target.closest('[data-health-sync]')){e.preventDefault();if(!window.fitTrackHealth?.available?.()){window.fitTrackShowToast?.('Wearable sync runs from the Android FitTrack app. Synced records will appear here automatically.');return}const b=e.target.closest('[data-health-sync]');b.disabled=true;b.textContent='Syncing…';await window.fitTrackHealth.sync({days:30});b.disabled=false;b.textContent='Sync wearable';setTimeout(render,250);return}
   if(e.target.closest('[data-route="ride"]'))setTimeout(render,0)
 });
 window.addEventListener('fittrack:health-synced',()=>{if(state.route==='ride')render()});
 new MutationObserver(()=>{
   if(rendering||state.route!=='ride'||app.querySelector('[data-health-view]'))return;
   clearTimeout(observerTimer);observerTimer=setTimeout(render,60)
 }).observe(app,{childList:true});
 window.fitTrackRenderHealth=render;
 setTimeout(()=>{if(state.route==='ride')render()},80);
})();