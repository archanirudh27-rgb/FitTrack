// FitTrack exercise visual registry + optional full-screen image viewer.
(function(){
  const base='assets/exercises/chest/';
  const files={
    'barbell bench press':'barbell-bench-press.png',
    'incline barbell bench press':'incline-barbell-bench-press.png',
    'decline barbell bench press':'decline-barbell-bench-press.png',
    'dumbbell bench press':'dumbbell-bench-press.png',
    'incline dumbbell press':'incline-dumbbell-press.png',
    'dumbbell fly':'dumbbell-fly.png',
    'cable fly':'cable-fly.png',
    'low-to-high cable fly':'low-to-high-cable-fly.png',
    'cable crossover':'cable-crossover.png',
    'machine chest press':'machine-chest-press.png',
    'push up':'push-up.png',
    'chest dip':'chest-dip.png'
  };
  const visuals=window.fitTrackExerciseVisuals=window.fitTrackExerciseVisuals||{};
  Object.entries(files).forEach(([name,file])=>{
    const src=base+file;
    // Each production PNG already contains both START and FINISH positions.
    visuals[name]={start:src,finish:src,card:src};
  });
  window.fitTrackGetExerciseVisual=function(exerciseName,phase){
    const item=visuals[String(exerciseName||'').toLowerCase().trim()];
    return item?.[String(phase||'start').toLowerCase()]||item?.card||null;
  };
  function close(){document.querySelector('.exercise-lightbox')?.remove();document.body.classList.remove('lightbox-open')}
  window.fitTrackOpenExerciseVisual=function(src,title,phase){
    if(!src)return;close();
    const box=document.createElement('div');box.className='exercise-lightbox';
    box.innerHTML=`<button class="exercise-lightbox-close" aria-label="Close image">×</button><div class="exercise-lightbox-card"><div class="exercise-lightbox-title">${String(title||'Exercise').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}${phase?' · '+String(phase):''}</div><img src="${src}" alt="${String(title||'Exercise')} exercise demonstration"></div>`;
    document.body.appendChild(box);document.body.classList.add('lightbox-open');
    box.addEventListener('click',e=>{if(e.target===box||e.target.closest('.exercise-lightbox-close'))close()});
  };
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
})();