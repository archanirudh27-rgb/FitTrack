const CACHE_NAME='fittrack-shell-v3';
const FALLBACK='./index.html';
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(c=>c.add(FALLBACK)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{
    if(res&&res.ok&&req.mode==='navigate')caches.open(CACHE_NAME).then(c=>c.put(FALLBACK,res.clone()));
    return res;
  }).catch(async()=>{
    if(req.mode==='navigate')return (await caches.match(FALLBACK))||Response.error();
    return (await caches.match(req,{ignoreSearch:true}))||Response.error();
  }));
});
