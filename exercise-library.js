// FitTrack exercise library powered by Supabase system exercises.
// Kept separate from core Workout navigation for stability.
(function () {
  const supabase = window.fitTrackSupabase;
  const state = window.fitTrackState;
  const app = document.getElementById('app');
  const toast = window.fitTrackShowToast;
  if (!supabase || !state || !app) return;

  let requestToken = 0;
  let currentGroup = null;
  let currentExercises = [];

  function esc(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }

  async function getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user || null;
  }

  function libraryHead(copy = 'Browse exercises by muscle group. Personalised exercise imagery will be added during the final visual stage.') {
    return `<div class="page-head"><div class="eyebrow">Exercise library</div><h1 class="page-title">Find an exercise</h1><p class="page-copy">${copy}</p></div>
      <div class="tabs"><button class="tab" data-library-tab="Session">Session</button><button class="tab" data-library-tab="Planner">Planner</button><button class="tab active" data-library-tab="Library">Library</button></div>`;
  }

  function guidance(ex) {
    const n = ex.name.toLowerCase();
    const specific = {
      'barbell bent over row': {
        steps:['Stand with feet about hip-width apart and hold the bar just outside your legs.','Push your hips back and hinge forward while keeping your spine neutral and core braced.','Let the bar hang below your shoulders, then pull it toward your lower ribs/upper abdomen.','Drive the elbows back and briefly squeeze the shoulder blades together.','Lower the bar under control until the arms are straight, then repeat without losing your torso position.'],
        tips:['Keep your neck in line with your spine.','Keep the bar close to your body.','Use a load that lets your torso stay stable.'],
        mistakes:['Rounding the lower back.','Standing up between repetitions to create momentum.','Shrugging the shoulders instead of rowing with the back.'],
        breathing:'Inhale and brace before the pull; exhale as you complete the row while maintaining trunk tension.'
      },
      'barbell bench press': {
        steps:['Lie with your eyes roughly under the bar and plant your feet firmly.','Set your shoulder blades back and down and grip the bar slightly wider than shoulder width.','Unrack with straight arms and position the bar over your chest.','Lower the bar with control toward the mid-to-lower chest while keeping your forearms near vertical.','Press the bar upward to the start position without letting your shoulders roll forward.'],
        tips:['Keep your feet planted and upper back tight.','Keep wrists stacked over the forearms.','Use a spotter or safeties for challenging sets.'],
        mistakes:['Bouncing the bar off the chest.','Letting elbows flare excessively.','Losing shoulder-blade position during the press.'],
        breathing:'Take a breath and brace before lowering; exhale through the press while staying controlled.'
      },
      'back squat': {
        steps:['Set the bar securely across your upper back and stand with feet around shoulder width.','Brace your core and keep your chest and upper back firm.','Bend at the hips and knees together, allowing the knees to track in line with the toes.','Descend only as far as you can while maintaining balance and a stable spine.','Drive through the whole foot to stand tall and reset before the next repetition.'],
        tips:['Keep pressure through the whole foot.','Let knees track naturally over the toes.','Choose depth based on mobility and control.'],
        mistakes:['Knees collapsing inward.','Heels lifting from the floor.','Losing trunk position at the bottom.'],
        breathing:'Take a deep breath and brace before descending; maintain pressure through the hardest part of the ascent.'
      }
    };
    if (specific[n]) return specific[n];
    const base = ex.instructions || `Perform the ${ex.name} through a comfortable, controlled range of motion.`;
    return {
      steps:[`Set up securely for the ${ex.name} and choose a manageable resistance.`,base,'Move through a controlled range while keeping the target muscles engaged.','Pause briefly at the working position instead of using momentum.','Return to the start position under control and reset before the next repetition.'],
      tips:['Prioritise control and comfortable range of motion over heavier load.','Keep your posture stable throughout the set.','Stop the set if technique begins to break down.'],
      mistakes:['Using momentum to move the resistance.','Rushing the lowering phase.','Increasing load at the expense of comfortable technique.'],
      breathing:'Breathe steadily; generally exhale during the effort phase and inhale during the controlled return.'
    };
  }

  async function renderGroups() {
    const token = ++requestToken; currentGroup = null; state.route = 'workout'; state.activeTab = 'Library';
    const user = await getUser(); if (token !== requestToken) return;
    if (!user) { app.innerHTML = `${libraryHead()}<section class="card"><div class="card-title">Sign in to use the exercise library</div></section>`; return; }
    app.innerHTML = `${libraryHead()}<section class="card"><div class="card-subtitle">Loading exercise library…</div></section>`;
    const [{data:groups,error:groupError},{data:exercises,error:exerciseError}] = await Promise.all([
      supabase.from('muscle_groups').select('id,name').order('name'),
      supabase.from('exercises').select('id,name,primary_muscle_group_id,equipment,difficulty').eq('is_system',true).order('name')]);
    if (token !== requestToken || state.route !== 'workout' || state.activeTab !== 'Library') return;
    if (groupError || exerciseError) { app.innerHTML = `${libraryHead()}<section class="card"><div class="card-title">Could not load exercise library</div></section>`; return; }
    const counts=new Map(); (exercises||[]).forEach(ex=>counts.set(ex.primary_muscle_group_id,(counts.get(ex.primary_muscle_group_id)||0)+1));
    const visible=(groups||[]).filter(g=>(counts.get(g.id)||0)>0);
    app.innerHTML=`${libraryHead()}<section class="grid grid-2">${visible.map(group=>`<button type="button" class="card exercise-card" data-library-group="${group.id}" data-library-group-name="${esc(group.name)}" style="text-align:left;color:inherit;cursor:pointer;width:100%"><div class="exercise-placeholder">${esc(group.name)} imagery coming later</div><div class="meta-row"><div><div class="card-title">${esc(group.name)}</div><div class="card-subtitle">${counts.get(group.id)} exercises</div></div><span class="accent" style="font-size:22px">→</span></div></button>`).join('')}</section>`;
  }

  async function renderGroup(groupId,groupName) {
    const token=++requestToken; currentGroup={id:groupId,name:groupName};
    app.innerHTML=`${libraryHead(`Exercises for ${esc(groupName)}. Use the search box to quickly find a movement.`)}<button type="button" class="ghost-btn" data-library-back style="margin-bottom:14px">← All muscle groups</button><section class="card"><div class="card-subtitle">Loading ${esc(groupName)} exercises…</div></section>`;
    const {data,error}=await supabase.from('exercises').select('id,name,equipment,difficulty,secondary_muscles,instructions,primary_muscle_group_id').eq('is_system',true).eq('primary_muscle_group_id',groupId).order('name');
    if(token!==requestToken||!currentGroup||currentGroup.id!==groupId)return;
    if(error){toast?.('Could not load exercises');return;} currentExercises=data||[]; renderExerciseList('');
  }

  function renderExerciseList(search) {
    if(!currentGroup)return; const q=search.trim().toLowerCase();
    const filtered=currentExercises.filter(ex=>!q||ex.name.toLowerCase().includes(q)||(ex.equipment||'').toLowerCase().includes(q));
    app.innerHTML=`${libraryHead(`Exercises for ${esc(currentGroup.name)}. Later, these will also carry the personalised FitTrack exercise imagery.`)}<button type="button" class="ghost-btn" data-library-back style="margin-bottom:14px">← All muscle groups</button><div class="card" style="margin-bottom:14px"><input id="exerciseLibrarySearch" class="auth-input" type="search" value="${esc(search)}" placeholder="Search ${esc(currentGroup.name)} exercises or equipment…" /></div><section class="grid grid-2">${filtered.length?filtered.map(ex=>`<article class="card exercise-card"><div class="exercise-placeholder">Exercise imagery coming later</div><div><div class="card-title">${esc(ex.name)}</div><div class="card-subtitle">${esc(ex.equipment||'—')} · ${esc(ex.difficulty||'—')}</div></div><div class="chips">${(ex.secondary_muscles||[]).map(m=>`<span class="chip">${esc(m)}</span>`).join('')||'<span class="chip">Primary focus</span>'}</div><p class="page-copy" style="font-size:13px">${esc(ex.instructions||'')}</p><button type="button" class="secondary-btn full-btn" data-library-exercise="${ex.id}">View exercise</button></article>`).join(''):'<article class="card"><div class="card-title">No matching exercises</div></article>'}</section>`;
  }

  function renderExerciseDetail(exerciseId) {
    const ex=currentExercises.find(item=>item.id===exerciseId); if(!ex||!currentGroup)return; const g=guidance(ex);
    app.innerHTML=`${libraryHead(`${esc(currentGroup.name)} exercise detail`)}
      <button type="button" class="ghost-btn" data-library-group-return style="margin-bottom:14px">← Back to exercises</button>
      <section class="card"><div class="exercise-placeholder" style="height:220px">Personalised ${esc(ex.name)} imagery coming in final visual stage</div><div style="height:16px"></div>
      <div class="card-title">${esc(ex.name)}</div><div class="card-subtitle">${esc(ex.equipment||'—')} · ${esc(ex.difficulty||'—')}</div><div class="chips">${(ex.secondary_muscles||[]).map(m=>`<span class="chip">Also: ${esc(m)}</span>`).join('')}</div>
      <div style="height:20px"></div><div class="section-title">How to perform</div><ol class="page-copy" style="padding-left:22px;line-height:1.7">${g.steps.map(s=>`<li style="margin:7px 0">${esc(s)}</li>`).join('')}</ol>
      <div style="height:12px"></div><div class="section-title">Form tips</div><ul class="page-copy" style="padding-left:22px;line-height:1.7">${g.tips.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>
      <div style="height:12px"></div><div class="section-title">Common mistakes</div><ul class="page-copy" style="padding-left:22px;line-height:1.7">${g.mistakes.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>
      <div style="height:12px"></div><div class="section-title">Breathing</div><p class="page-copy">${esc(g.breathing)}</p>
      <button type="button" class="primary-btn full-btn" data-library-add-soon>Add to workout</button></section>`;
  }

  document.addEventListener('click',event=>{
    const libraryTab=event.target.closest('[data-tab="Library"]'); if(libraryTab)setTimeout(renderGroups,0);
    const ownTab=event.target.closest('[data-library-tab]'); if(ownTab){const tab=ownTab.dataset.libraryTab;if(tab==='Library')renderGroups();else{++requestToken;currentGroup=null;state.activeTab=tab;window.fitTrackRender?.();}return;}
    const group=event.target.closest('[data-library-group]');if(group){renderGroup(group.dataset.libraryGroup,group.dataset.libraryGroupName);return;}
    if(event.target.closest('[data-library-back]')){renderGroups();return;}
    if(event.target.closest('[data-library-group-return]')){renderExerciseList('');return;}
    const exercise=event.target.closest('[data-library-exercise]');if(exercise){renderExerciseDetail(exercise.dataset.libraryExercise);return;}
    if(event.target.closest('[data-library-add-soon]'))toast?.('Add to workout is the next step');
    const route=event.target.closest('[data-route]');if(route&&route.dataset.route!=='workout'){++requestToken;currentGroup=null;}
  });
  document.addEventListener('input',event=>{if(event.target.id==='exerciseLibrarySearch')renderExerciseList(event.target.value);});
})();
