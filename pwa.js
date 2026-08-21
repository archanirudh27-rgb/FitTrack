// FitTrack cache hygiene: clear stale FitTrack caches without forcing a second page reload.
(function(){
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
    }catch(err){console.warn('FitTrack cache reset failed:',err);}
  });
})();