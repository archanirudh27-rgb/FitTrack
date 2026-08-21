// FitTrack scheduled workout -> live Session loader.
(function () {
  const supabase = window.fitTrackSupabase;
  const state = window.fitTrackState;
  const toast = window.fitTrackShowToast;
  if (!supabase || !state) return;

  async function getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user || null;
  }

  async function loadScheduledSession(plannedSessionId, button) {
    const user = await getUser();
    if (!user) { toast?.('Sign in to load this workout'); return; }

    if (button) { button.disabled = true; button.textContent = 'Loading…'; }

    const { data: planned, error: pErr } = await supabase
      .from('planned_sessions')
      .select('id,template_id,session_date,name,status')
      .eq('id', plannedSessionId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (pErr || !planned?.template_id) {
      if (button) { button.disabled = false; button.textContent = 'Load to Session'; }
      toast?.('Could not load scheduled workout');
      return;
    }

    const { data: rows, error: rErr } = await supabase
      .from('workout_template_exercises')
      .select('exercise_id,exercise_order,planned_sets,target_reps_min,target_reps_max,target_weight_kg,rest_seconds')
      .eq('template_id', planned.template_id)
      .order('exercise_order');

    if (rErr || !(rows || []).length) {
      if (button) { button.disabled = false; button.textContent = 'Load to Session'; }
      toast?.('This workout has no exercises');
      return;
    }

    const ids = rows.map(r => r.exercise_id);
    const { data: exercises, error: eErr } = await supabase
      .from('exercises')
      .select('id,name,equipment,secondary_muscles')
      .in('id', ids);

    if (eErr) {
      if (button) { button.disabled = false; button.textContent = 'Load to Session'; }
      toast?.('Could not load workout exercises');
      return;
    }

    const exMap = new Map((exercises || []).map(e => [e.id, e]));
    state.workout = {
      name: planned.name,
      plannedSessionId: planned.id,
      sessionDate: planned.session_date,
      exercises: rows.map(row => {
        const ex = exMap.get(row.exercise_id) || { name:'Exercise', equipment:'', secondary_muscles:[] };
        const reps = Number(row.target_reps_min || row.target_reps_max || 10);
        const weight = row.target_weight_kg == null ? 0 : Number(row.target_weight_kg);
        const setCount = Math.max(1, Number(row.planned_sets || 3));
        return {
          exerciseId: row.exercise_id,
          name: ex.name,
          target: [ex.equipment, ...(ex.secondary_muscles || [])].filter(Boolean).join(' · '),
          restSeconds: Number(row.rest_seconds || 90),
          plannedRepsMin: row.target_reps_min,
          plannedRepsMax: row.target_reps_max,
          sets: Array.from({ length:setCount }, () => ({ weight, reps, done:false }))
        };
      })
    };

    if (typeof window.fitTrackSaveDraft === 'function') {
      await window.fitTrackSaveDraft('Workout loaded to Session');
    }

    state.route = 'workout';
    state.activeTab = 'Session';
    window.fitTrackRender?.();
    window.scrollTo(0, 0);
  }

  document.addEventListener('click', event => {
    const load = event.target.closest('[data-fit-session-load]');
    if (!load) return;
    event.preventDefault();
    event.stopPropagation();
    loadScheduledSession(load.dataset.fitSessionLoad, load);
  });
})();
