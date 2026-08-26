// FitTrack self-service personal data reset.
// Deletes only the signed-in user's fitness records. Account, profile and shared exercise library are preserved.
(function(){
  const supabase=window.fitTrackSupabase;
  const state=window.fitTrackState;
  if(!supabase)return;

  const style=document.createElement('style');
  style.textContent=`
    .account-danger-zone{margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.08)}
    .account-danger-title{font-size:11px;text-transform:uppercase;letter-spacing:.11em;color:#d58b78;margin-bottom:7px}
    .account-danger-copy{font-size:11px;line-height:1.45;color:#8f98a5;margin:0 0 10px}
    .account-btn-danger{border-color:rgba(255,93,93,.32)!important;color:#ff8c8c!important}
    .account-btn-danger:hover{background:rgba(255,93,93,.07)!important}
    .reset-data-backdrop{position:fixed;inset:0;z-index:1200;background:rgba(4,6,8,.82);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:grid;place-items:center;padding:18px}
    .reset-data-card{width:min(440px,100%);background:#11151a;border:1px solid #2b3139;border-radius:20px;padding:22px;box-shadow:0 24px 80px rgba(0,0,0,.5)}
    .reset-data-card h3{font-size:22px;margin:0 0 8px}.reset-data-card p{color:#9da6b2;font-size:13px;line-height:1.55;margin:0 0 15px}
    .reset-data-list{display:grid;gap:6px;margin:0 0 16px;padding:0;list-style:none;color:#c7cdd4;font-size:12px}.reset-data-list li:before{content:'•';color:#ff8c8c;margin-right:8px}
    .reset-data-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:14px}
    .reset-confirm-input{width:100%;box-sizing:border-box;background:#0b0d10;border:1px solid #303741;color:#fff;border-radius:11px;padding:12px 13px;font-size:16px}
    .reset-data-error{min-height:18px;color:#ff9a83;font-size:12px;margin-top:10px}
    @media(max-width:520px){.reset-data-actions{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  function closeModal(){document.getElementById('fittrackResetDataModal')?.remove()}
  async function currentUser(){try{const{data,error}=await supabase.auth.getUser();return error?null:data.user}catch{return null}}

  function clearLocalFitnessState(){
    if(state){state.workout={name:'My Workout',exercises:[]};state.rides=[];state.workoutHistory=[];state.activeExerciseIndex=0;state.route='home';state.activeTab='Session'}
    sessionStorage.removeItem('fittrackWorkoutStartedAt');
    Object.keys(localStorage).forEach(key=>{if(/^fittrack:(workout|draft|history|activity|planner|progress|health)/i.test(key))localStorage.removeItem(key)});
  }

  function missingTable(error){return ['42P01','PGRST205'].includes(error?.code)||/does not exist|schema cache/i.test(error?.message||'')}

  async function deleteOwnData(){
    const user=await currentUser();if(!user)throw new Error('Your session has expired. Please sign in again.');
    const{data:templates,error:tErr}=await supabase.from('workout_templates').select('id').eq('user_id',user.id);if(tErr)throw tErr;
    const ids=(templates||[]).map(x=>x.id);if(ids.length){const{error}=await supabase.from('workout_template_exercises').delete().in('template_id',ids);if(error)throw error}
    const tables=['planned_sessions','workout_drafts','completed_workouts','activity_sessions','workout_templates'];
    for(const table of tables){const{error}=await supabase.from(table).delete().eq('user_id',user.id);if(error)throw error}
    // Health storage was added after the original reset feature. Ignore only the expected
    // "table not created yet" case so older deployments remain resettable.
    const{error:healthError}=await supabase.from('health_daily').delete().eq('user_id',user.id);if(healthError&&!missingTable(healthError))throw healthError;
    clearLocalFitnessState();window.fitTrackRender?.();setTimeout(()=>window.fitTrackRenderHome?.(),80);
  }

  function showResetModal(){
    closeModal();document.getElementById('fittrackAccount')?.remove();
    const modal=document.createElement('div');modal.id='fittrackResetDataModal';modal.className='reset-data-backdrop';
    modal.innerHTML=`<section class="reset-data-card" role="dialog" aria-modal="true" aria-labelledby="resetDataTitle"><div class="eyebrow">Privacy & data</div><h3 id="resetDataTitle">Reset fitness data?</h3><p>This gives your FitTrack account a clean slate. Your login, name, profile details and the shared Exercise Library will stay intact.</p><ul class="reset-data-list"><li>Workout history and current draft</li><li>Saved workout templates and planner schedule</li><li>Imported activity sessions</li><li>Wearable health summaries such as steps, heart and sleep</li></ul><p><strong style="color:#f5f7fa">This cannot be undone.</strong> Type <strong style="color:#f5f7fa">RESET</strong> to confirm.</p><input class="reset-confirm-input" id="fittrackResetConfirm" autocomplete="off" spellcheck="false" placeholder="Type RESET"><div class="reset-data-error" id="fittrackResetError"></div><div class="reset-data-actions"><button class="account-btn" id="fittrackResetCancel">Cancel</button><button class="account-btn account-btn-danger" id="fittrackResetExecute" disabled>Delete fitness data</button></div></section>`;
    document.body.appendChild(modal);
    const input=document.getElementById('fittrackResetConfirm'),execute=document.getElementById('fittrackResetExecute'),error=document.getElementById('fittrackResetError');
    input.oninput=()=>{execute.disabled=input.value.trim().toUpperCase()!=='RESET'};document.getElementById('fittrackResetCancel').onclick=closeModal;modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
    execute.onclick=async()=>{if(input.value.trim().toUpperCase()!=='RESET')return;execute.disabled=true;execute.textContent='Deleting…';error.textContent='';try{await deleteOwnData();closeModal();window.fitTrackShowToast?.('Fitness data deleted. Your account is ready for a fresh start.')}catch(err){console.error('FitTrack data reset failed',err);error.textContent=err?.message||'Could not delete your data. Nothing else was changed.';execute.disabled=false;execute.textContent='Delete fitness data'}};
    setTimeout(()=>input.focus(),50);
  }

  function inject(){const panel=document.getElementById('fittrackAccount');if(!panel||panel.querySelector('[data-reset-fitness-data]'))return;const zone=document.createElement('div');zone.className='account-danger-zone';zone.dataset.resetFitnessData='1';zone.innerHTML=`<div class="account-danger-title">Data controls</div><p class="account-danger-copy">Clear your workout, planner, activity and wearable health history without deleting your FitTrack account.</p><button class="account-btn account-btn-danger" type="button" data-open-reset-data>Reset fitness data</button>`;panel.appendChild(zone)}

  new MutationObserver(inject).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',e=>{if(e.target.closest('[data-open-reset-data]')){e.preventDefault();e.stopPropagation();showResetModal()}},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('fittrackResetDataModal'))closeModal()});
})();