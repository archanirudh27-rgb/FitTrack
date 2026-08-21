// FitTrack workout + activity History with workout drill-down.
(function () {
  const supabase = window.fitTrackSupabase;
  const state = window.fitTrackState;
  const toast = window.fitTrackShowToast;
  if (!supabase || !state) return;

  let viewMode = 'list';
  let historyTab = 'Workouts';
  let requestToken = 0;

  function formatDuration(seconds) {
    if (seconds == null) return '—';
    const sec = Math.max(0, Number(seconds || 0));
    if (sec < 60) return `${Math.round(sec)} sec`;
    return `${Math.max(1, Math.round(sec / 60))} min`;
  }

  function formatDate(value, long = false) {
    return new Date(value).toLocaleDateString(undefined, long
      ? { day: 'numeric', month: 'long', year: 'numeric' }
      : { day: 'numeric', month: 'short' });
  }

  function esc(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }

  function titleCase(value) {
    const s = String(value || 'activity');
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  async function getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user || null;
  }

  function tabsHtml() {
    return `<div class="tabs" style="margin-bottom:14px">
      ${['Workouts','Activities'].map(tab => `<button class="tab ${historyTab===tab?'active':''}" data-history-tab="${tab}">${tab}</button>`).join('')}
    </div>`;
  }

  async function renderHistoryList() {
    if (state.route !== 'history' || viewMode !== 'list') return;
    const myToken = ++requestToken;
    const user = await getUser();
    if (!user || myToken !== requestToken || state.route !== 'history' || viewMode !== 'list') return;

    const app = document.getElementById('app');
    if (!app) return;

    if (historyTab === 'Workouts') {
      const { data, error } = await supabase
        .from('completed_workouts')
        .select('id, workout_name, total_volume_kg, completed_sets, duration_seconds, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(50);

      if (myToken !== requestToken || state.route !== 'history' || viewMode !== 'list') return;
      if (error) { console.warn('FitTrack workout history load failed:', error.message); return; }

      app.innerHTML = `
        <div class="page-head"><div class="eyebrow">Activity log</div><h1 class="page-title">History</h1><p class="page-copy">Your completed workouts and outdoor activities.</p></div>
        ${tabsHtml()}
        <section class="card"><div class="list">
          ${!data?.length ? `<div class="list-row"><div><div class="list-row-title">No completed workouts yet</div><div class="list-row-meta">Finish a workout and it will appear here.</div></div></div>` : data.map(row => `
            <button type="button" class="list-row" data-workout-detail="${row.id}" style="width:100%;text-align:left;color:inherit;cursor:pointer">
              <div><div class="list-row-title">${esc(row.workout_name)}</div><div class="list-row-meta">${formatDate(row.completed_at)} · ${formatDuration(row.duration_seconds)} · ${row.completed_sets} sets</div></div>
              <div style="display:flex;align-items:center;gap:10px"><strong>${Number(row.total_volume_kg || 0).toLocaleString()} kg</strong><span class="accent">→</span></div>
            </button>`).join('')}
        </div></section>`;
      return;
    }

    const { data, error } = await supabase
      .from('activity_sessions')
      .select('id,activity_type,started_at,ended_at,duration_seconds,distance_km,avg_speed_kmh,avg_pace_min_per_km,estimated_calories')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(50);

    if (myToken !== requestToken || state.route !== 'history' || viewMode !== 'list') return;
    if (error) { console.warn('FitTrack activity history load failed:', error.message); return; }

    app.innerHTML = `
      <div class="page-head"><div class="eyebrow">Activity log</div><h1 class="page-title">History</h1><p class="page-copy">Your completed workouts and outdoor activities.</p></div>
      ${tabsHtml()}
      <section class="card"><div class="list">
        ${!data?.length ? `<div class="list-row"><div><div class="list-row-title">No activities yet</div><div class="list-row-meta">Finish a walk, run or cycle and it will appear here.</div></div></div>` : data.map(row => {
          const type = titleCase(row.activity_type);
          const distance = Number(row.distance_km || 0).toFixed(2);
          const paceOrSpeed = row.activity_type === 'cycle'
            ? `${Number(row.avg_speed_kmh || 0).toFixed(1)} km/h`
            : (row.avg_pace_min_per_km ? `${Number(row.avg_pace_min_per_km).toFixed(1)} min/km` : '—');
          return `<div class="list-row">
            <div><div class="list-row-title">${esc(type)}</div><div class="list-row-meta">${formatDate(row.started_at)} · ${formatDuration(row.duration_seconds)} · ${distance} km · ${paceOrSpeed}</div></div>
            <strong>${Number(row.estimated_calories || 0)} kcal</strong>
          </div>`;
        }).join('')}
      </div></section>`;
  }

  async function openDetail(id) {
    viewMode = 'detail';
    const myToken = ++requestToken;
    const user = await getUser();
    if (!user || myToken !== requestToken || viewMode !== 'detail') { if (!user) viewMode = 'list'; return; }

    const { data, error } = await supabase
      .from('completed_workouts')
      .select('workout_name, workout_state, total_volume_kg, completed_sets, duration_seconds, completed_at')
      .eq('user_id', user.id).eq('id', id).single();

    if (myToken !== requestToken || viewMode !== 'detail') return;
    if (error || !data) { viewMode = 'list'; toast?.('Could not open workout'); renderHistoryList(); return; }

    const exercises = (data.workout_state?.exercises || []).filter(ex => ex.sets?.some(set => set.done));
    document.getElementById('app').innerHTML = `
      <div class="page-head"><div class="eyebrow">Completed workout · ${formatDate(data.completed_at, true)}</div><h1 class="page-title">${esc(data.workout_name)}</h1><p class="page-copy">${formatDuration(data.duration_seconds)} · ${data.completed_sets} completed sets · ${Number(data.total_volume_kg || 0).toLocaleString()} kg total volume</p></div>
      <button type="button" class="ghost-btn" data-back-history style="margin-bottom:14px">← Back to History</button>
      <div class="workout-shell">${exercises.map(ex => `
        <section class="exercise-session"><div class="exercise-session-head"><div class="card-title">${esc(ex.name)}</div><div class="card-subtitle">${esc(ex.target || '')}</div></div><div class="exercise-session-body">
          ${ex.sets.map((set, index) => `<div class="set-row" style="opacity:${set.done ? '1' : '.45'}"><div class="set-index">${index + 1}</div><div class="set-value">${Number(set.weight || 0)} kg</div><div class="set-value">${Number(set.reps || 0)} reps</div><div class="set-complete ${set.done ? 'done' : ''}" style="cursor:default">${set.done ? '✓ Done' : 'Not completed'}</div></div>`).join('')}
        </div></section>`).join('')}</div>`;
  }

  document.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-history-tab]');
    if (tab) {
      event.preventDefault();
      historyTab = tab.dataset.historyTab;
      viewMode = 'list';
      ++requestToken;
      renderHistoryList();
      return;
    }

    const row = event.target.closest('[data-workout-detail]');
    if (row) { event.preventDefault(); event.stopPropagation(); openDetail(row.dataset.workoutDetail); return; }

    const back = event.target.closest('[data-back-history]');
    if (back) { event.preventDefault(); viewMode = 'list'; ++requestToken; renderHistoryList(); return; }

    const nav = event.target.closest('[data-route]');
    if (nav) {
      ++requestToken; viewMode = 'list';
      if (nav.dataset.route === 'history') setTimeout(renderHistoryList, 0);
    }
  }, true);

  const observer = new MutationObserver(() => {
    if (state.route === 'history' && viewMode === 'list' && !document.querySelector('[data-history-tab]')) renderHistoryList();
  });
  observer.observe(document.getElementById('app'), { childList: true });
})();
