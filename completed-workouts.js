// FitTrack completed workout saving + completion summary.
(function () {
  const supabase = window.fitTrackSupabase;
  const state = window.fitTrackState;
  const toast = window.fitTrackShowToast;
  if (!supabase || !state) return;
  const START_KEY = 'fittrackWorkoutStartedAt';
  async function getUser(){const{data,error}=await supabase.auth.getUser();return error?null:(data.user||null)}
  function ensureStartTime(){if(!sessionStorage.getItem(START_KEY))sessionStorage.setItem(START_KEY,String(Date.now()))}
  function workoutSummary(workout){let totalVolume=0,completedSets=0;workout.exercises.forEach(ex=>ex.sets.forEach(set=>{if(set.done){completedSets++;totalVolume+=Number(set.weight||0)*Number(set.reps||0)}}));return{totalVolume,completedSets}}
  function injectFinishButton(){if(state.route!=='workout'||state.activeTab!=='Session')return;if(document.querySelector('[data-action="finish-real-workout"]'))return;const shell=document.querySelector('.workout-shell');if(!shell)return;const b=document.createElement('button');b.className='primary-btn full-btn';b.dataset.action='finish-real-workout';b.textContent='Finish workout';shell.insertAdjacentElement('afterend',b)}
  function duration(sec){const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;return h?`${h}h ${m}m`:`${m}:${String(s).padStart(2,'0')}`}
  function summaryOverlay(snapshot,totalVolume,completedSets,durationSeconds){
    document.querySelector('.session-finish-summary')?.remove();
    const overlay=document.createElement('div');overlay.className='session-finish-summary';
    const completedExercises=snapshot.exercises.filter(ex=>ex.sets.some(s=>s.done));
    overlay.innerHTML=`<section class="card session-finish-card"><div class="session-finish-check">✓</div><h2>Workout completed</h2><div class="card-subtitle">${snapshot.name||'Workout'} saved successfully</div><div class="session-summary-metrics"><div><strong>${duration(durationSeconds)}</strong><small>Duration</small></div><div><strong>${completedSets}</strong><small>Sets</small></div><div><strong>${Math.round(totalVolume).toLocaleString()} kg</strong><small>Volume</small></div></div><div class="section-title">Exercises completed</div><div class="session-summary-list">${completedExercises.map(ex=>{const n=ex.sets.filter(s=>s.done).length;return `<div class="session-summary-row"><span>${ex.name}</span><span>${n} set${n===1?'':'s'} ✓</span></div>`}).join('')}</div><button class="primary-btn full-btn" data-summary-history>View in History</button><button class="ghost-btn full-btn" data-summary-home>Done</button></section>`;
    document.body.appendChild(overlay);
  }
  async function finishWorkout(button){
    const user=await getUser();if(!user){toast?.('Sign in to finish and save workout');return}
    const{totalVolume,completedSets}=workoutSummary(state.workout);if(!completedSets){toast?.('Complete at least one set first');return}
    button.disabled=true;button.textContent='Saving…';
    const start=Number(sessionStorage.getItem(START_KEY)||Date.now());const durationSeconds=Math.max(0,Math.round((Date.now()-start)/1000));
    const snapshot=JSON.parse(JSON.stringify(state.workout));
    const{error}=await supabase.from('completed_workouts').insert({user_id:user.id,workout_name:state.workout.name,workout_state:state.workout,total_volume_kg:Number(totalVolume.toFixed(2)),completed_sets:completedSets,duration_seconds:durationSeconds,completed_at:new Date().toISOString()});
    if(error){console.warn('FitTrack completed workout save failed:',error.message);toast?.('Could not save workout');button.disabled=false;button.textContent='Finish workout';return}
    await supabase.from('workout_drafts').delete().eq('user_id',user.id);
    state.workout.exercises.forEach(ex=>ex.sets.forEach(set=>{set.done=false}));sessionStorage.removeItem(START_KEY);toast?.('Workout saved to History');
    summaryOverlay(snapshot,totalVolume,completedSets,durationSeconds);
  }
  document.addEventListener('click',event=>{
    const start=event.target.closest('[data-action="start-workout"]');if(start)ensureStartTime();
    const setButton=event.target.closest('[data-action="toggle-set"]');if(setButton)ensureStartTime();
    const finish=event.target.closest('[data-action="finish-real-workout"]');if(finish){finishWorkout(finish);return}
    if(event.target.closest('[data-summary-history]')){document.querySelector('.session-finish-summary')?.remove();document.querySelector('[data-route="history"]')?.click();return}
    if(event.target.closest('[data-summary-home]')){document.querySelector('.session-finish-summary')?.remove();document.querySelector('[data-route="home"]')?.click()}
  });
  const observer=new MutationObserver(()=>injectFinishButton());observer.observe(document.getElementById('app'),{childList:true,subtree:true});injectFinishButton();
})();