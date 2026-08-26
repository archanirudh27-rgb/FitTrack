// FitTrack PWA cache hygiene + one-time build refresh.
(function(){
  const BUILD='20260826-49';
  const BUILD_KEY='fittrack:pwa-build';

  window.addEventListener('load',async()=>{
    try{
      if('serviceWorker' in navigator){
        const regs=await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(reg=>reg.unregister()));
      }
      if('caches' in window){
        const keys=await caches.keys();
        await Promise.all(keys.filter(k=>k.startsWith('fittrack-')).map(k=>caches.delete(k)));
      }
      const previous=localStorage.getItem(BUILD_KEY);
      if(previous!==BUILD){
        localStorage.setItem(BUILD_KEY,BUILD);
        const url=new URL(window.location.href);
        if(url.searchParams.get('_ftv')!==BUILD){
          url.searchParams.set('_ftv',BUILD);
          window.location.replace(url.toString());
          return;
        }
      }
    }catch(err){console.warn('FitTrack PWA refresh failed:',err);}
  });
})();