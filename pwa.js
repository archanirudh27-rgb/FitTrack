// FitTrack PWA cache hygiene + one-time build refresh.
(function(){
  const BUILD='20260825-43';
  const BUILD_KEY='fittrack:pwa-build';

  window.addEventListener('load',async()=>{
    try{
      // Remove any legacy service workers/caches left by older builds.
      if('serviceWorker' in navigator){
        const regs=await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(reg=>reg.unregister()));
      }
      if('caches' in window){
        const keys=await caches.keys();
        await Promise.all(keys.filter(k=>k.startsWith('fittrack-')).map(k=>caches.delete(k)));
      }

      // Installed PWAs can keep the old document shell longer than a browser tab.
      // On the first launch of a new build, reload once through a unique URL so
      // index.html and every versioned asset are fetched again.
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
    }catch(err){
      console.warn('FitTrack PWA refresh failed:',err);
    }
  });
})();