// Keep Home greeting account-specific without coupling it to the dashboard renderer.
(function(){
 const app=document.getElementById('app');if(!app)return;
 function apply(){
   if(window.fitTrackState?.route!=='home')return;
   const el=app.querySelector('.home-greeting');if(!el)return;
   const full=window.fitTrackUser?.display_name||'';const first=full.trim().split(/\s+/)[0]||'';
   const h=new Date().getHours(),g=h<12?'Good morning':h<17?'Good afternoon':'Good evening';
   el.textContent=first?`${g}, ${first}`:g;
 }
 new MutationObserver(()=>setTimeout(apply,0)).observe(app,{childList:true,subtree:true});
 window.addEventListener('fittrack:user-ready',()=>setTimeout(apply,0));
 document.addEventListener('click',e=>{if(e.target.closest('[data-route="home"]'))setTimeout(apply,80)});
 setTimeout(apply,100);
})();