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
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  async function getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user || null;
  }

  function libraryHead(copy = 'Browse exercises by muscle group. Personalised exercise imagery will be added during the final visual stage.') {
    return `
      <div class="page-head">
        <div class="eyebrow">Exercise library</div>
        <h1 class="page-title">Find an exercise</h1>
        <p class="page-copy">${copy}</p>
      </div>
      <div class="tabs">
        <button class="tab" data-library-tab="Session">Session</button>
        <button class="tab" data-library-tab="Planner">Planner</button>
        <button class="tab active" data-library-tab="Library">Library</button>
      </div>`;
  }

  async function renderGroups() {
    const token = ++requestToken;
    currentGroup = null;
    state.route = 'workout';
    state.activeTab = 'Library';

    const user = await getUser();
    if (token !== requestToken) return;
    if (!user) {
      app.innerHTML = `${libraryHead()}<section class="card"><div class="card-title">Sign in to use the exercise library</div><p class="page-copy" style="margin-top:8px">The shared FitTrack exercise library is available to signed-in users.</p></section>`;
      return;
    }

    app.innerHTML = `${libraryHead()}<section class="card"><div class="card-subtitle">Loading exercise library…</div></section>`;

    const [{ data: groups, error: groupError }, { data: exercises, error: exerciseError }] = await Promise.all([
      supabase.from('muscle_groups').select('id,name').order('name'),
      supabase.from('exercises').select('id,name,primary_muscle_group_id,equipment,difficulty').eq('is_system', true).order('name')
    ]);

    if (token !== requestToken || state.route !== 'workout' || state.activeTab !== 'Library') return;
    if (groupError || exerciseError) {
      console.warn('FitTrack library load failed:', groupError?.message || exerciseError?.message);
      app.innerHTML = `${libraryHead()}<section class="card"><div class="card-title">Could not load exercise library</div><p class="page-copy" style="margin-top:8px">Please refresh and try again.</p></section>`;
      return;
    }

    const counts = new Map();
    (exercises || []).forEach(ex => counts.set(ex.primary_muscle_group_id, (counts.get(ex.primary_muscle_group_id) || 0) + 1));
    const visible = (groups || []).filter(g => (counts.get(g.id) || 0) > 0);

    app.innerHTML = `${libraryHead()}
      <section class="grid grid-2">
        ${visible.map(group => `
          <button type="button" class="card exercise-card" data-library-group="${group.id}" data-library-group-name="${esc(group.name)}" style="text-align:left;color:inherit;cursor:pointer;width:100%">
            <div class="exercise-placeholder">${esc(group.name)} imagery coming later</div>
            <div class="meta-row">
              <div>
                <div class="card-title">${esc(group.name)}</div>
                <div class="card-subtitle">${counts.get(group.id)} exercises</div>
              </div>
              <span class="accent" style="font-size:22px">→</span>
            </div>
          </button>`).join('')}
      </section>`;
  }

  async function renderGroup(groupId, groupName) {
    const token = ++requestToken;
    currentGroup = { id: groupId, name: groupName };
    app.innerHTML = `${libraryHead(`Exercises for ${esc(groupName)}. Use the search box to quickly find a movement.`)}
      <button type="button" class="ghost-btn" data-library-back style="margin-bottom:14px">← All muscle groups</button>
      <section class="card"><div class="card-subtitle">Loading ${esc(groupName)} exercises…</div></section>`;

    const { data, error } = await supabase
      .from('exercises')
      .select('id,name,equipment,difficulty,secondary_muscles,instructions,primary_muscle_group_id')
      .eq('is_system', true)
      .eq('primary_muscle_group_id', groupId)
      .order('name');

    if (token !== requestToken || !currentGroup || currentGroup.id !== groupId) return;
    if (error) {
      console.warn('FitTrack exercise group load failed:', error.message);
      toast?.('Could not load exercises');
      return;
    }

    currentExercises = data || [];
    renderExerciseList('');
  }

  function renderExerciseList(search) {
    if (!currentGroup) return;
    const q = search.trim().toLowerCase();
    const filtered = currentExercises.filter(ex => !q || ex.name.toLowerCase().includes(q) || (ex.equipment || '').toLowerCase().includes(q));

    app.innerHTML = `${libraryHead(`Exercises for ${esc(currentGroup.name)}. Later, these will also carry the personalised FitTrack exercise imagery.`)}
      <button type="button" class="ghost-btn" data-library-back style="margin-bottom:14px">← All muscle groups</button>
      <div class="card" style="margin-bottom:14px">
        <input id="exerciseLibrarySearch" class="auth-input" type="search" value="${esc(search)}" placeholder="Search ${esc(currentGroup.name)} exercises or equipment…" aria-label="Search exercises" />
      </div>
      <section class="grid grid-2">
        ${filtered.length ? filtered.map(ex => `
          <article class="card exercise-card">
            <div class="exercise-placeholder">Exercise imagery coming later</div>
            <div>
              <div class="card-title">${esc(ex.name)}</div>
              <div class="card-subtitle">${esc(ex.equipment || '—')} · ${esc(ex.difficulty || '—')}</div>
            </div>
            <div class="chips">
              ${(ex.secondary_muscles || []).map(m => `<span class="chip">${esc(m)}</span>`).join('') || '<span class="chip">Primary focus</span>'}
            </div>
            <p class="page-copy" style="font-size:13px">${esc(ex.instructions || '')}</p>
            <button type="button" class="secondary-btn full-btn" data-library-exercise="${ex.id}">View exercise</button>
          </article>`).join('') : '<article class="card"><div class="card-title">No matching exercises</div><p class="page-copy" style="margin-top:8px">Try another search.</p></article>'}
      </section>`;

    const input = document.getElementById('exerciseLibrarySearch');
    input?.focus({ preventScroll: true });
    try { input?.setSelectionRange(input.value.length, input.value.length); } catch (_) {}
  }

  function renderExerciseDetail(exerciseId) {
    const ex = currentExercises.find(item => item.id === exerciseId);
    if (!ex || !currentGroup) return;
    app.innerHTML = `${libraryHead(`${esc(currentGroup.name)} exercise detail`)}
      <button type="button" class="ghost-btn" data-library-group-return style="margin-bottom:14px">← Back to ${esc(currentGroup.name)}</button>
      <section class="card">
        <div class="exercise-placeholder" style="height:220px">Personalised ${esc(ex.name)} imagery coming in final visual stage</div>
        <div style="height:16px"></div>
        <div class="card-title">${esc(ex.name)}</div>
        <div class="card-subtitle">${esc(ex.equipment || '—')} · ${esc(ex.difficulty || '—')}</div>
        <div class="chips">${(ex.secondary_muscles || []).map(m => `<span class="chip">Also: ${esc(m)}</span>`).join('')}</div>
        <div style="height:16px"></div>
        <div class="section-title">How to perform</div>
        <p class="page-copy">${esc(ex.instructions || 'Instructions will be added.')}</p>
        <button type="button" class="primary-btn full-btn" data-library-add-soon>Add to workout</button>
      </section>`;
  }

  document.addEventListener('click', (event) => {
    const libraryTab = event.target.closest('[data-tab="Library"]');
    if (libraryTab) setTimeout(renderGroups, 0);

    const ownTab = event.target.closest('[data-library-tab]');
    if (ownTab) {
      const tab = ownTab.dataset.libraryTab;
      if (tab === 'Library') renderGroups();
      else {
        ++requestToken;
        currentGroup = null;
        state.activeTab = tab;
        window.fitTrackRender?.();
      }
      return;
    }

    const group = event.target.closest('[data-library-group]');
    if (group) {
      renderGroup(group.dataset.libraryGroup, group.dataset.libraryGroupName);
      return;
    }

    if (event.target.closest('[data-library-back]')) {
      renderGroups();
      return;
    }

    if (event.target.closest('[data-library-group-return]')) {
      renderExerciseList('');
      return;
    }

    const exercise = event.target.closest('[data-library-exercise]');
    if (exercise) {
      renderExerciseDetail(exercise.dataset.libraryExercise);
      return;
    }

    if (event.target.closest('[data-library-add-soon]')) {
      toast?.('Add to workout is the next step');
    }

    const route = event.target.closest('[data-route]');
    if (route && route.dataset.route !== 'workout') {
      ++requestToken;
      currentGroup = null;
    }
  });

  document.addEventListener('input', (event) => {
    if (event.target.id === 'exerciseLibrarySearch') renderExerciseList(event.target.value);
  });
})();
