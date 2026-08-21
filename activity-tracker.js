// FitTrack Activity tracker: Walk / Run / Cycle shared GPS flow.
(function(){
  const supabase=window.fitTrackSupabase;
  const state=window.fitTrackState;
  const app=document.getElementById('app');
  const toast=window.fitTrackShowToast;
  if(!supabase||!state||!app) return;

  let activity=null;
  let watchId=null;
  let tickTimer=null;
  let observerBusy=false;

  function isActivityRoute(){return state.route==='ride';}
  function esc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');}
  function fmtTime(sec){sec=Math.max(0,Math.round(sec||0));const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=String(sec%60).padStart(2,'0');return h?`${h}:${String(m).padStart(2,'0')}:${s}`:`${m}:${s}`;}
  function hav(a,b){const R=6371;const dLat=(b.lat-a.lat)*Math.PI/180,dLon=(b.lon-a.lon)*Math.PI/180;const lat1=a.lat*Math.PI/180,lat2=b.lat*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;return 2*R*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}
  async function getUser(){const {data}=await supabase.auth.getUser();return data?.user||null;}

  function chooser(){
    app.innerHTML=`<div class="page-head"><div class="eyebrow">Outdoor activity</div><h1 class="page-title">Start activity</h1><p class="page-copy">Choose an activity. Location permission and the timer start only after you press Start.</p></div>
    <section class="grid grid-3">
      <article class="card"><div class="card-title">Walk</div><div class="card-subtitle">Distance · pace · calories</div><button class="primary-btn full-btn" style="margin-top:14px" data-activity-start="walk">Start Walk</button></article>
      <article class="card"><div class="card-title">Run</div><div class="card-subtitle">Distance · pace · calories</div><button class="primary-btn full-btn" style="margin-top:14px" data-activity-start="run">Start Run</button></article>
      <article class="card"><div class="card-title">Cycle</div><div class="card-subtitle">Distance · speed · calories</div><button class="primary-btn full-btn" style="margin-top:14px" data-activity-start="cycle">Start Cycle</button></article>
    </section>
    <section class="card" style="margin-top:14px"><div class="section-title">GPS note</div><p class="page-copy" style="margin-top:8px">For best results, use this outdoors with Location enabled and allow precise location when your phone asks after you press Start.</p></section>`;
  }

  function durationSec(){if(!activity)return 0;const now=Date.now();const activeNow=activity.status==='active'?(now-activity.segmentStartedAt):0;return Math.max(0,Math.round((activity.elapsedMs+activeNow)/1000));}
  function metrics(){const seconds=durationSec(),hours=seconds/3600;const distance=activity?.distanceKm||0;const speed=hours>0?distance/hours:0;const pace=distance>0?(seconds/60)/distance:0;const met=activity?.type==='walk'?3.8:activity?.type==='run'?8.3:7.5;const kg=activity?.weightKg||70;const calories=Math.max(0,Math.round(met*3.5*kg/200*(seconds/60)));return{seconds,distance,speed,pace,calories};}
  function paceText(p){if(!p||!Number.isFinite(p))return'--';const m=Math.floor(p),s=String(Math.round((p-m)*60)).padStart(2,'0');return `${m}:${s}`;}

  function renderLive(){
    if(!activity||!isActivityRoute())return;
    const m=metrics();const isCycle=activity.type==='cycle';
    app.innerHTML=`<div class="page-head"><div class="eyebrow">${esc(activity.type.toUpperCase())}</div><h1 class="page-title">${activity.status==='paused'?'Paused':'Activity in progress'}</h1><p class="page-copy">GPS ${activity.gpsReady?'connected':'waiting for signal'}${activity.lastAccuracy?` · ±${Math.round(activity.lastAccuracy)} m`:''}</p></div>
    <section class="grid grid-2">
      <article class="card"><div class="metric">${m.distance.toFixed(2)}</div><div class="metric-label">km</div></article>
      <article class="card"><div class="metric">${fmtTime(m.seconds)}</div><div class="metric-label">duration</div></article>
      <article class="card"><div class="metric">${isCycle?m.speed.toFixed(1):paceText(m.pace)}</div><div class="metric-label">${isCycle?'avg km/h':'avg min/km'}</div></article>
      <article class="card"><div class="metric">${m.calories}</div><div class="metric-label">estimated kcal</div></article>
    </section>
    <section class="card" style="margin-top:14px"><div class="map-panel"><div class="map-grid"></div><div class="map-label">GPS route recording · ${activity.points.length} points</div></div></section>
    <div class="grid grid-2" style="margin-top:14px">
      <button class="secondary-btn" data-activity-pause>${activity.status==='paused'?'Resume':'Pause'}</button>
      <button class="primary-btn" data-activity-finish>Finish</button>
    </div>`;
  }

  function onPosition(pos){
    if(!activity||activity.status!=='active')return;
    const c=pos.coords;activity.lastAccuracy=c.accuracy||null;
    if(c.accuracy && c.accuracy>70){renderLive();return;}
    const p={lat:c.latitude,lon:c.longitude,ts:pos.timestamp,accuracy:c.accuracy};
    const prev=activity.points.at(-1);
    if(prev){const d=hav(prev,p);if(d>0 && d<0.25) activity.distanceKm+=d;}
    activity.points.push(p);activity.gpsReady=true;renderLive();
  }
  function onPositionError(err){console.warn('FitTrack GPS:',err?.message);toast?.('GPS unavailable. Check location permission.');}

  async function begin(type){
    if(!navigator.geolocation){toast?.('GPS is not supported on this device');return;}
    const user=await getUser();if(!user){toast?.('Sign in to track an activity');return;}
    let weightKg=70;const {data:profile}=await supabase.from('profiles').select('weight_kg').eq('id',user.id).maybeSingle();if(profile?.weight_kg)weightKg=Number(profile.weight_kg);
    activity={type,userId:user.id,status:'active',startedAt:new Date().toISOString(),segmentStartedAt:Date.now(),elapsedMs:0,distanceKm:0,points:[],gpsReady:false,lastAccuracy:null,weightKg};
    watchId=navigator.geolocation.watchPosition(onPosition,onPositionError,{enableHighAccuracy:true,maximumAge:1000,timeout:15000});
    tickTimer=setInterval(()=>{if(activity?.status==='active')renderLive();},1000);
    renderLive();
  }

  function openAndBegin(type){
    state.route='ride';
    document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.route==='ride'));
    window.fitTrackRender?.();
    setTimeout(()=>begin(type),0);
  }
  window.fitTrackStartActivity=openAndBegin;

  function togglePause(){if(!activity)return;if(activity.status==='active'){activity.elapsedMs+=Date.now()-activity.segmentStartedAt;activity.status='paused';}else{activity.status='active';activity.segmentStartedAt=Date.now();}renderLive();}
  function stopGps(){if(watchId!==null)navigator.geolocation.clearWatch(watchId);watchId=null;if(tickTimer)clearInterval(tickTimer);tickTimer=null;}

  async function finish(){
    if(!activity)return;
    if(activity.status==='active')activity.elapsedMs+=Date.now()-activity.segmentStartedAt;
    activity.status='finished';stopGps();
    const m=metrics();
    const route={type:'LineString',coordinates:activity.points.map(p=>[p.lon,p.lat]),properties:{accuracy_m:activity.points.map(p=>p.accuracy??null)}};
    const {error}=await supabase.from('activity_sessions').insert({user_id:activity.userId,activity_type:activity.type,started_at:activity.startedAt,ended_at:new Date().toISOString(),duration_seconds:m.seconds,distance_km:Number(m.distance.toFixed(3)),avg_speed_kmh:Number(m.speed.toFixed(2)),avg_pace_min_per_km:m.distance?Number(m.pace.toFixed(2)):null,estimated_calories:m.calories,route_geojson:route});
    if(error){console.warn('FitTrack activity save failed:',error.message);toast?.('Could not save activity');activity.status='paused';renderLive();return;}
    app.innerHTML=`<div class="page-head"><div class="eyebrow">Activity saved</div><h1 class="page-title">${esc(activity.type[0].toUpperCase()+activity.type.slice(1))} complete</h1><p class="page-copy">Your activity has been saved.</p></div><section class="grid grid-2"><article class="card"><div class="metric">${m.distance.toFixed(2)}</div><div class="metric-label">km</div></article><article class="card"><div class="metric">${fmtTime(m.seconds)}</div><div class="metric-label">duration</div></article><article class="card"><div class="metric">${activity.type==='cycle'?m.speed.toFixed(1):paceText(m.pace)}</div><div class="metric-label">${activity.type==='cycle'?'avg km/h':'avg min/km'}</div></article><article class="card"><div class="metric">${m.calories}</div><div class="metric-label">estimated kcal</div></article></section><button class="primary-btn full-btn" style="margin-top:14px" data-activity-done>Done</button>`;
    activity=null;
  }

  function maybeRender(){if(!isActivityRoute())return;if(activity&&activity.status!=='finished')renderLive();else chooser();}

  document.addEventListener('click',e=>{
    const start=e.target.closest('[data-activity-start]');if(start){begin(start.dataset.activityStart);return;}
    if(e.target.closest('[data-activity-pause]')){togglePause();return;}
    if(e.target.closest('[data-activity-finish]')){finish();return;}
    if(e.target.closest('[data-activity-done]')){chooser();return;}
    const route=e.target.closest('[data-route="ride"]');if(route)setTimeout(maybeRender,0);
  });

  const observer=new MutationObserver(()=>{if(observerBusy)return;observerBusy=true;setTimeout(()=>{observerBusy=false;if(isActivityRoute()&&!app.querySelector('[data-activity-start]')&&!app.querySelector('[data-activity-pause]')&&!app.querySelector('[data-activity-done]'))maybeRender();},40);});
  observer.observe(app,{childList:true});
})();
