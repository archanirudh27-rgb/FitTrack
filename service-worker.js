const CACHE_NAME='fittrack-shell-v1';
const APP_SHELL=['./','./index.html','./styles.css','./app.js','./supabase.js','./auth.js','./workout-draft.js','./workout-editor.js','./completed-workouts.js','./history-detail.js','./progress-data.js','./exercise-library.js','./add-to-workout.js','./planner-templates.js','./planner-schedule.js','./session-loader.js','./home-today.js','./session-experience.js','./activity-tracker.js','./manifest.webmanifest','./icons/fittrack-icon.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;

  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put('./index.html',copy));return res;}).catch(()=>caches.match('./index.html')));
    return;
  }

  event.respondWith(caches.match(req,{ignoreSearch:true}).then(cached=>{
    const network=fetch(req).then(res=>{if(res&&res.ok){const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(req,copy));}return res;}).catch(()=>cached);
    return cached||network;
  }));
});
