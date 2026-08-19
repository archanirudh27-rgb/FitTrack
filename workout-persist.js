// FitTrack: isolated workout persistence proof-of-concept.
// Stores the current workout snapshot inside the user's latest open workout_session.
(function(){
  const supabase = window.fitTrackSupabase;
  const state = window.fitTrackState;
  if (!supabase || !state) return;

  let activeSessionId = null;
  let hydrating = false;

  async function getUser(){
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) return null;
    return data.user;
  }

  async function ensureSession(){
    const user = await getUser();
    if (!user) return null;
    if (activeSessionId) return activeSessionId;

    const { data: existing, error: readError } = await supabase
      .from('workout_sessions')
      .select('id, notes, started_at')
      .eq('user_id', user.id)
      .is('completed_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (readError) {
      console.warn('FitTrack persistence read failed:', readError.message);
      return null;
    }

    if (existing) {
      activeSessionId = existing.id;
      return activeSessionId;
    }

    const { data: created, error: insertError } = await supabase
      .from('workout_sessions')
      .insert({ user_id: user.id, name: state.workout.name, notes: JSON.stringify({ workout: state.workout }) })
      .select('id')
      .single();

    if (insertError) {
      console.warn('FitTrack persistence create failed:', insertError.message);
      return null;
    }

    activeSessionId = created.id;
    return activeSessionId;
  }

  async function saveSnapshot(){
    if (hydrating) return;
    const id = await ensureSession();
    if (!id) return;

    const { error } = await supabase
      .from('workout_sessions')
      .update({ notes: JSON.stringify({ workout: state.workout }) })
      .eq('id', id);

    if (error) {
      console.warn('FitTrack persistence save failed:', error.message);
      window.fitTrackShowToast?.('Could not save set yet');
      return;
    }

    window.fitTrackShowToast?.('Set saved');
  }

  async function hydrate(){
    const user = await getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('workout_sessions')
      .select('id, notes, started_at')
      .eq('user_id', user.id)
      .is('completed_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data?.notes) return;

    try {
      const parsed = JSON.parse(data.notes);
      if (parsed?.workout?.exercises) {
        hydrating = true;
        activeSessionId = data.id;
        state.workout = parsed.workout;
        window.fitTrackRender?.();
        hydrating = false;
      }
    } catch (e) {
      console.warn('FitTrack persistence hydrate failed:', e);
    }
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="toggle-set"]');
    if (!button) return;
    setTimeout(saveSnapshot, 0);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) setTimeout(hydrate, 0);
    else activeSessionId = null;
  });

  supabase.auth.getSession().then(({ data }) => {
    if (data?.session?.user) hydrate();
  });
})();
