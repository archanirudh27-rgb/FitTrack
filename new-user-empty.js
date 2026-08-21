// Friendly first-use state for accounts without a loaded workout.
(function(){
 const app=document.getElementById('app'),state=window.fitTrackState;if(!app||!state)return;
 function apply(){
   if(state.route!=='workout'||state.activeTab!=='Session'||(state.workout?.exercises||[]).length)return;
   const shell=app.querySelector('.workout-shell');if(!shell||app.querySelector('[data-empty-session]'))return;
   const card=document.createElement('section');card.className='card';card.dataset.emptySession='1';
   card.innerHTML='<div class="eyebrow">Ready when you are</div><div class="card-title" style="margin-top:6px">No workout loaded</div><p class="page-copy" style="margin-top:8px">Create or schedule a workout in Planner, or choose exercises from the Library.</p><div class="grid grid-2" style="margin-top:14px"><button class="primary-btn" data-empty-planner>Open Planner</button><button class="secondary-btn" data-empty-library>Browse Library</button></div>';
   shell.replaceWith(card);
 }
 function go(tab){state.route='workout';state.activeTab=tab;window.fitTrackRender?.();}
 document.addEventListener('click',e=>{if(e.target.closest('[data-empty-planner]'))go('Planner');if(e.target.closest('[data-empty-library]'))go('Library')});
 new MutationObserver(()=>setTimeout(apply,0)).observe(app,{childList:true,subtree:true});
 setTimeout(apply,100);
})();