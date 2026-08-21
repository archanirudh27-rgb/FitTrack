// FitTrack development mode: remove stale service workers and caches so every launch gets fresh files.
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
      const marker='fittrack-cache-reset-v1';
      if(!sessionStorage.getItem(marker)){
        sessionStorage.setItem(marker,'1');
        const url=new URL(window.location.href);
        url.searchParams.set('fresh','20260821-11');
        window.location.replace(url.toString());
      }
    }catch(err){console.warn('FitTrack cache reset failed:',err);}
  });
})();
