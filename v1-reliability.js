// FitTrack V1 reliability layer: state restoration, autosave, mobile lifecycle, connectivity and safe recovery.
(function(){
  const state=window.fitTrackState,app=document.getElementById('app');
  if(!state||!app)return;

  const validRoutes=['home','workout','ride','history','progress'];
  const validTabs=['Session','Planner','Library'];
  const routeKey='fittrack:last-route',tabKey='fittrack:last-workout-tab';
  let lastSave=0,restoreTimer=null;

  function toast(msg){window.fitTrackShowToast?.(msg)}
  function normalizeState(){
    const savedRoute=localStorage.getItem(routeKey),savedTab=localStorage.getItem(tabKey);
    if(validRoutes.includes(savedRoute))state.route=savedRoute;
    if(validTabs.includes(savedTab))state.activeTab=savedTab;
    if(!validRoutes.includes(state.route))state.route='home';
    if(!validTabs.includes(state.activeTab))state.activeTab='Session';
  }
  function syncNav(){document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.route===state.route))}
  function activateEnhancer(){
    if(state.route==='home')window.fitTrackRenderHome?.();
    if(state.route==='workout'&&state.activeTab==='Library')window.fitTrackRenderLibrary?.();
    window.dispatchEvent(new CustomEvent('fittrack:view-restored',{detail:{route:state.route,tab:state.activeTab}}));
  }
  function restoreView(){
    clearTimeout(restoreTimer);normalizeState();syncNav();
    window.fitTrackRender?.();
    restoreTimer=setTimeout(activateEnhancer,120);
  }
  function saveSessionQuietly(){
    if(state.route!=='workout'||state.activeTab!=='Session'||!(state.workout?.exercises||[]).length)return;
    if(Date.now()-lastSave<1200)return;lastSave=Date.now();
    try{window.fitTrackSaveDraft?.('')}catch(e){console.warn('FitTrack autosave skipped',e)}
  }

  // Keep the current view on refresh / PWA resume, including Safari's back-forward cache.
  window.addEventListener('pageshow',e=>{if(e.persisted)setTimeout(restoreView,40)});
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='hidden')saveSessionQuietly();
    else setTimeout(()=>{syncNav();activateEnhancer()},80);
  });
  window.addEventListener('pagehide',saveSessionQuietly);
  window.addEventListener('beforeunload',saveSessionQuietly);

  // Give the user useful connectivity feedback without blocking the app.
  window.addEventListener('offline',()=>toast('You are offline. Saved screens remain usable; syncing will resume when connected.'));
  window.addEventListener('online',()=>{toast('Back online');setTimeout(activateEnhancer,100)});

  // Broken visuals must not collapse cards or create unusable blank space.
  document.addEventListener('error',e=>{
    const img=e.target;if(!(img instanceof HTMLImageElement))return;
    if(!img.closest('.exercise-art,.session-v2-hero,.library-group-art,.target-muscle-art'))return;
    img.style.display='none';
    const parent=img.parentElement;if(parent&&!parent.querySelector('[data-image-fallback]')){
      const fallback=document.createElement('div');fallback.dataset.imageFallback='1';fallback.className='fittrack-image-fallback';fallback.textContent='Visual unavailable';parent.appendChild(fallback);
    }
  },true);

  // App errors should be diagnosable without leaving a permanently invisible shell.
  window.addEventListener('error',()=>{app.style.visibility='visible';app.style.opacity='1'});
  window.addEventListener('unhandledrejection',()=>{app.style.visibility='visible';app.style.opacity='1'});

  // Persist navigation immediately when enhancer scripts change state directly.
  document.addEventListener('click',e=>{
    const route=e.target.closest('[data-route]')?.dataset.route;
    if(validRoutes.includes(route))localStorage.setItem(routeKey,route);
    const tab=e.target.closest('[data-tab],[data-library-tab]')?.dataset.tab||e.target.closest('[data-library-tab]')?.dataset.libraryTab;
    if(validTabs.includes(tab))localStorage.setItem(tabKey,tab);
  },true);

  // Initial lifecycle reconciliation after every feature script has had time to attach.
  setTimeout(()=>{normalizeState();syncNav();activateEnhancer();app.style.visibility='visible';app.style.opacity='1'},180);
})();