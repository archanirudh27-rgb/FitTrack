// FitTrack completed workout saving and history.
// Kept separate from core app navigation/rendering for stability.
(function () {
  const supabase = window.fitTrackSupabase;
  const state = window.fitTrackState;
  const toast = window.fitTrackShowToast;
  if (!supabase || !state) return;

  const START_KEY = 'fittrackWorkoutStartedAt';

  async function getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user || null;
  }

  function ensureStartTime() {
    if (!sessionStorage.getItem(START_KEY)) {
      sessionStorage.setItem(START_KEY, String(Date.now()));
    }
  }

  function workoutSummary(workout) {
    let totalVolume = 0;
    let completedSets = 0;
    workout.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.done) {
          completedSets += 1;
          totalVolume += Number(set.weight || 0) * Number(set.reps || 0);
        }
      });
    });
    return { totalVolume, completedSets };
  }

  function injectFinishButton() {
    if (state.route !== 'workout' || state.activeTab !== 'Session') return;
    if (document.querySelector('[data-action="finish-real-workout"]')) return;
    const shell = document.querySelector('.workout-shell');
    if (!shell) return;
    const button = document.createElement('button');
    button.className = 'primary-btn full-btn';
    button.dataset.action = 'finish-real-workout';
    button.textContent = 'Finish workout';
    shell.insertAdjacentElement('afterend', button);
  }

  async function finishWorkout(button) {
    const user = await getUser();
    if (!user) {
      toast?.('Sign in to finish and save workout');
      return;
    }

    const { totalVolume, completedSets } = workoutSummary(state.workout);
    if (!completedSets) {
      toast?.('Complete at least one set first');
      return;
    }

    button.disabled = true;
    button.textContent = 'Saving…';

    const start = Number(sessionStorage.getItem(START_KEY) || Date.now());
    const durationSeconds = Math.max(0, Math.round((Date.now() - start) / 1000));

    const { error } = await supabase.from('completed_workouts').insert({
      user_id: user.id,
      workout_name: state.workout.name,
      workout_state: state.workout,
      total_volume_kg: Number(totalVolume.toFixed(2)),
      completed_sets: completedSets,
      duration_seconds: durationSeconds,
      completed_at: new Date().toISOString()
    });

    if (error) {
      console.warn('FitTrack completed workout save failed:', error.message);
      toast?.('Could not save workout');
      button.disabled = false;
      button.textContent = 'Finish workout';
      return;
    }

    await supabase.from('workout_drafts').delete().eq('user_id', user.id);
    state.workout.exercises.forEach(ex => ex.sets.forEach(set => { set.done = false; }));
    sessionStorage.removeItem(START_KEY);
    toast?.('Workout saved to History');

    setTimeout(() => {
      document.querySelector('[data-route="history"]')?.click();
      setTimeout(loadHistory, 50);
    }, 250);
  }

  function formatDuration(seconds) {
    if (seconds == null) return '—';
    const mins = Math.max(1, Math.round(seconds / 60));
    return `${mins} min`;
  }

  function formatDate(value) {
    const d = new Date(value);
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  }

  async function loadHistory() {
    if (state.route !== 'history') return;
    const user = await getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('completed_workouts')
      .select('id, workout_name, total_volume_kg, completed_sets, duration_seconds, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('FitTrack history load failed:', error.message);
      return;
    }

    const card = document.querySelector('#app .card');
    if (!card) return;

    if (!data.length) {
      card.innerHTML = '<div class="list"><div class="list-row"><div><div class="list-row-title">No completed workouts yet</div><div class="list-row-meta">Finish a workout and it will appear here.</div></div></div></div>';
      return;
    }

    card.innerHTML = `<div class="list">${data.map(row => `
      <div class="list-row">
        <div>
          <div class="list-row-title">${row.workout_name}</div>
          <div class="list-row-meta">${formatDate(row.completed_at)} · ${formatDuration(row.duration_seconds)} · ${row.completed_sets} sets</div>
        </div>
        <strong>${Number(row.total_volume_kg || 0).toLocaleString()} kg</strong>
      </div>`).join('')}</div>`;
  }

  document.addEventListener('click', (event) => {
    const start = event.target.closest('[data-action="start-workout"]');
    if (start) ensureStartTime();

    const setButton = event.target.closest('[data-action="toggle-set"]');
    if (setButton) ensureStartTime();

    const finish = event.target.closest('[data-action="finish-real-workout"]');
    if (finish) finishWorkout(finish);

    const historyNav = event.target.closest('[data-route="history"]');
    if (historyNav) setTimeout(loadHistory, 30);
  });

  const observer = new MutationObserver(() => {
    injectFinishButton();
    if (state.route === 'history') loadHistory();
  });
  observer.observe(document.getElementById('app'), { childList: true, subtree: true });

  injectFinishButton();
})();
