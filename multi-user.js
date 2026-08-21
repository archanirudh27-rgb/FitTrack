// FitTrack multi-user safety: no demo workout leakage between accounts.
(function(){
 const state=window.fitTrackState;
 if(!state)return;
 let lastUserId=null;
 function emptyWorkout(){return {name:'My Workout',exercises:[]};}
 async function prepareUser(user){
   if(!user?.id||user.id===lastUserId)return;
   lastUserId=user.id;
   state.workout=emptyWorkout();
   state.activeExerciseIndex=0;
   state.rides=[];
   state.workoutHistory=[];
   sessionStorage.removeItem('fittrackWorkoutStartedAt');
   // The account-specific draft loader will restore this user's session if one exists.
   if(typeof window.fitTrackLoadDraft==='function')await window.fitTrackLoadDraft();
   window.fitTrackRender?.();
 }
 window.addEventListener('fittrack:user-ready',e=>prepareUser(e.detail?.user));
 window.addEventListener('storage',()=>{});
})();