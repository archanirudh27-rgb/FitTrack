// FitTrack PWA registration and update handling.
(function(){
  if(!('serviceWorker' in navigator)) return;
  window.addEventListener('load',async()=>{
    try{
      const reg=await navigator.serviceWorker.register('./service-worker.js',{scope:'./'});
      if(reg.waiting) reg.waiting.postMessage?.({type:'SKIP_WAITING'});
      reg.addEventListener('updatefound',()=>{
        const worker=reg.installing;
        if(!worker) return;
        worker.addEventListener('statechange',()=>{
          if(worker.state==='installed' && navigator.serviceWorker.controller){
            console.info('FitTrack update ready. Reload to use the latest version.');
          }
        });
      });
    }catch(err){
      console.warn('FitTrack service worker registration failed:',err);
    }
  });
})();
