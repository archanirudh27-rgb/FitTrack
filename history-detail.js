// FitTrack completed-workout drill-down. Kept separate from core navigation.
(function () {
  const supabase = window.fitTrackSupabase;
  const state = window.fitTrackState;
  const toast = window.fitTrackShowToast;
  if (!supabase || !state) return;

  function formatDuration(seconds) {
    if (seconds == null) return '—';
    return `${Math.max(1, Math.round(seconds / 60))} min`;
  }

  function formatDate(value) {
    return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  }

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

  async function makeHistoryClickable() {
    if (state.route !== 'history') return;
    const user = await getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('completed_workouts')
      .select('id, workout_name, total_volume_kg, completed_sets, duration_seconds, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(50);

    if (error || !data?.length) return;
    const card = document.querySelector('#app .card');
    if (!card) return;

    card.innerHTML = `<div class="list">${data.map(row => `
      <button class="list-row" data-workout-detail="${row.id}" style="width:100%;text-align:left;color:inherit;cursor:pointer">
        <div>
          <div class="list-row-title">${esc(row.workout_name)}</div>
          <div class="list-row-meta">${new Date(row.completed_at).toLocaleDateString(undefined,{day:'numeric',month:'short'})} · ${formatDuration(row.duration_seconds)} · ${row.completed_sets} sets</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px"><strong>${Number(row.total_volume_kg || 0).toLocaleString()} kg</strong><span class="accent">→</span></div>
      </button>`).join('')}</div>`;
  }

  async function openDetail(id) {
    const user = await getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('completed_workouts')
      .select('workout_name, workout_state, total_volume_kg, completed_sets, duration_seconds, completed_at')
      .eq('user_id', user.id)
      .eq('id', id)
      .single();

    if (error || !data) {
      toast?.('Could not open workout');
      return;
    }

    const exercises = (data.workout_state?.exercises || []).filter(ex => ex.sets?.some(set => set.done));
    document.getElementById('app').innerHTML = `
      <div class="page-head">
        <div class="eyebrow">Completed workout · ${formatDate(data.completed_at)}</div>
        <h1 class="page-title">${esc(data.workout_name)}</h1>
        <p class="page-copy">${formatDuration(data.duration_seconds)} · ${data.completed_sets} completed sets · ${Number(data.total_volume_kg || 0).toLocaleString()} kg total volume</p>
      </div>
      <button class="ghost-btn" data-back-history style="margin-bottom:14px">← Back to History</button>
      <div class="workout-shell">
        ${exercises.map(ex => `
          <section class="exercise-session">
            <div class="exercise-session-head">
              <div class="card-title">${esc(ex.name)}</div>
              <div class="card-subtitle">${esc(ex.target || '')}</div>
            </div>
            <div class="exercise-session-body">
              ${ex.sets.map((set, index) => `
                <div class="set-row" style="opacity:${set.done ? '1' : '.45'}">
                  <div class="set-index">${index + 1}</div>
                  <div class="set-value">${Number(set.weight || 0)} kg</div>
                  <div class="set-value">${Number(set.reps || 0)} reps</div>
                  <div class="set-complete ${set.done ? 'done' : ''}" style="cursor:default">${set.done ? '✓ Done' : 'Not completed'}</div>
                </div>`).join('')}
            </div>
          </section>`).join('')}
      </div>`;
  }

  document.addEventListener('click', (event) => {
    const row = event.target.closest('[data-workout-detail]');
    if (row) openDetail(row.dataset.workoutDetail);

    const back = event.target.closest('[data-back-history]');
    if (back) {
      state.route = 'history';
      window.fitTrackRender?.();
      setTimeout(makeHistoryClickable, 80);
    }

    const nav = event.target.closest('[data-route="history"]');
    if (nav) setTimeout(makeHistoryClickable, 100);
  });

  const observer = new MutationObserver(() => {
    if (state.route === 'history' && !document.querySelector('[data-workout-detail]')) {
      setTimeout(makeHistoryClickable, 80);
    }
  });
  observer.observe(document.getElementById('app'), { childList: true, subtree: true });
})();
