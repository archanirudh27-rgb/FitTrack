const CACHE_NAME='fittrack-shell-v2';
const APP_SHELL=['./','./index.html','./styles.css','./theme-overrides.css','./app.js','./supabase.js','./auth.js','./workout-draft.js','./workout-editor.js','./completed-workouts.js','./history-detail.js','./activity-steps-ui.js','./progress-data.js','./exercise-library.js','./add-to-workout.js','./planner-templates.js','./planner-schedule.js','./session-loader.js','./home-today.js','./session-experience.js','./activity-tracker.js','./pwa.js','./manifest.webmanifest','./icons/fittrack-icon.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==self.location.origin)return;
 if(req.mode==='navigate'||['script','style'].includes(req.destination)){
  event.respondWith(fetch(req).then(res=>{if(res&&res.ok){const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(req,copy));}return res;}).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('./index.html'))));return;
 }
 event.respondWith(caches.match(req,{ignoreSearch:true}).then(cached=>cached||fetch(req).then(res=>{if(res&&res.ok){const copy=res.clone();caches.open(CACHE_NAME).then(c=>c.put(req,copy));}return res;})));
});