// FitTrack exercise visual registry + full-screen image viewer.
(function(){
  const visuals = window.fitTrackExerciseVisuals = window.fitTrackExerciseVisuals || {};
  window.fitTrackGetExerciseVisual = function(exerciseName, phase){
    const key=String(exerciseName||'').toLowerCase().trim();
    const item=visuals[key];
    if(!item)return null;
    return item[String(phase||'start').toLowerCase()]||null;
  };
  function close(){document.querySelector('.exercise-lightbox')?.remove();document.body.classList.remove('lightbox-open')}
  window.fitTrackOpenExerciseVisual=function(src,title,phase){
    if(!src)return;
    close();
    const box=document.createElement('div');
    box.className='exercise-lightbox';
    box.innerHTML=`<button class="exercise-lightbox-close" aria-label="Close image">×</button><div class="exercise-lightbox-card"><div class="exercise-lightbox-title">${String(title||'Exercise').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')} · ${String(phase||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}</div><img src="${src}" alt="${String(title||'Exercise')} ${String(phase||'')} position"></div>`;
    document.body.appendChild(box);document.body.classList.add('lightbox-open');
    box.addEventListener('click',e=>{if(e.target===box||e.target.closest('.exercise-lightbox-close'))close()});
  };
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
})();