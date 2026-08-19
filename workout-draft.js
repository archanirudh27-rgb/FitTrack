// FitTrack workout draft persistence.
// Isolated from the core navigation/rendering code.
(function () {
  const supabase = window.fitTrackSupabase;
  const state = window.fitTrackState;
  const render = window.fitTrackRender;
  const toast = window.fitTrackShowToast;
  if (!supabase || !state || !render) return;

  let loadedUserId = null;

  async function getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user || null;
  }

  async function loadDraft() {
    const user = await getUser();
    if (!user || loadedUserId === user.id) return;

    const { data, error } = await supabase
      .from('workout_drafts')
      .select('workout_state')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.warn('FitTrack draft load failed:', error.message);
      return;
    }

    loadedUserId = user.id;
    if (data?.workout_state?.exercises) {
      state.workout = data.workout_state;
      render();
    }
  }

  async function saveDraft(message = 'Set saved') {
    const user = await getUser();
    if (!user) {
      toast?.('Sign in to save this workout');
      return false;
    }

    const { error } = await supabase
      .from('workout_drafts')
      .upsert({
        user_id: user.id,
        workout_state: state.workout,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      console.warn('FitTrack draft save failed:', error.message);
      toast?.('Could not save workout');
      return false;
    }

    if (message) toast?.(message);
    return true;
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="toggle-set"]');
    if (!button) return;
    setTimeout(() => saveDraft('Set saved'), 0);
  });

  window.fitTrackSaveDraft = saveDraft;
  window.fitTrackLoadDraft = loadDraft;

  // Load once after auth has had a chance to initialise.
  setTimeout(loadDraft, 800);
  window.addEventListener('focus', loadDraft);
})();
