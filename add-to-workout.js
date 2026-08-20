// FitTrack Add to Workout flow.
// Intercepts the Library placeholder button in capture phase so existing library logic stays untouched.
(function () {
  const supabase = window.fitTrackSupabase;
  const state = window.fitTrackState;
  const app = document.getElementById('app');
  const toast = window.fitTrackShowToast;
  if (!supabase || !state || !app) return;

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

  function numeric(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  async function openAddFlow() {
    const detailTitle = app.querySelector('.card .card-title');
    const exerciseName = detailTitle?.textContent?.trim();
    if (!exerciseName) {
      toast?.('Could not identify exercise');
      return;
    }

    const user = await getUser();
    if (!user) {
      toast?.('Sign in to add exercises to a workout');
      return;
    }

    const { data: exercise, error: exerciseError } = await supabase
      .from('exercises')
      .select('id,name,equipment,difficulty')
      .eq('name', exerciseName)
      .maybeSingle();

    if (exerciseError || !exercise) {
      toast?.('Could not load exercise');
      return;
    }

    const { data: templates, error: templateError } = await supabase
      .from('workout_templates')
      .select('id,name,description,updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (templateError) {
      toast?.('Could not load workouts');
      return;
    }

    renderAddScreen(exercise, templates || []);
  }

  function renderAddScreen(exercise, templates) {
    const hasTemplates = templates.length > 0;
    app.innerHTML = `
      <div class="page-head">
        <div class="eyebrow">Add to workout</div>
        <h1 class="page-title">${esc(exercise.name)}</h1>
        <p class="page-copy">Choose an existing workout or create a new one, then set the planned sets, reps, weight and rest time. You can still change weight and reps during the live session.</p>
      </div>

      <section class="card" style="margin-bottom:14px">
        <div class="section-title">Workout</div>
        ${hasTemplates ? `
          <label class="card-subtitle" for="fitTemplateSelect">Choose existing workout</label>
          <select id="fitTemplateSelect" class="auth-input" style="margin-top:8px;width:100%">
            ${templates.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}
            <option value="__new__">＋ Create new workout</option>
          </select>` : `
          <input id="fitNewTemplateName" class="auth-input" type="text" placeholder="Workout name e.g. Chest A" style="width:100%" />`}

        ${hasTemplates ? `<div id="fitNewTemplateWrap" style="display:none;margin-top:12px"><input id="fitNewTemplateName" class="auth-input" type="text" placeholder="New workout name" style="width:100%" /></div>` : ''}
      </section>

      <section class="card" style="margin-bottom:14px">
        <div class="section-title">Plan this exercise</div>
        <div class="grid grid-2">
          <label><div class="card-subtitle">Sets</div><input id="fitPlannedSets" class="auth-input" type="number" min="1" max="10" value="3" style="width:100%;margin-top:6px" /></label>
          <label><div class="card-subtitle">Target weight (kg)</div><input id="fitTargetWeight" class="auth-input" type="number" min="0" max="1000" step="0.5" placeholder="Optional" style="width:100%;margin-top:6px" /></label>
          <label><div class="card-subtitle">Reps min</div><input id="fitRepsMin" class="auth-input" type="number" min="1" max="100" value="8" style="width:100%;margin-top:6px" /></label>
          <label><div class="card-subtitle">Reps max</div><input id="fitRepsMax" class="auth-input" type="number" min="1" max="100" value="12" style="width:100%;margin-top:6px" /></label>
          <label><div class="card-subtitle">Rest (sec)</div><input id="fitRestSeconds" class="auth-input" type="number" min="15" max="600" step="15" value="90" style="width:100%;margin-top:6px" /></label>
        </div>
        <p class="card-subtitle" style="margin-top:12px">Target weight is optional. Leave it blank for bodyweight exercises or if you prefer to decide the load during the session.</p>
      </section>

      <div class="grid grid-2">
        <button type="button" class="ghost-btn" data-cancel-add-workout>← Back</button>
        <button type="button" class="primary-btn" data-save-add-workout data-exercise-id="${exercise.id}">Save to workout</button>
      </div>`;

    const select = document.getElementById('fitTemplateSelect');
    select?.addEventListener('change', () => {
      const wrap = document.getElementById('fitNewTemplateWrap');
      if (wrap) wrap.style.display = select.value === '__new__' ? 'block' : 'none';
    });
  }

  async function saveToWorkout(button) {
    const user = await getUser();
    if (!user) return;

    button.disabled = true;
    button.textContent = 'Saving…';

    const exerciseId = button.dataset.exerciseId;
    const select = document.getElementById('fitTemplateSelect');
    let templateId = select?.value || '__new__';

    if (!select) templateId = '__new__';

    if (templateId === '__new__') {
      const name = document.getElementById('fitNewTemplateName')?.value?.trim();
      if (!name) {
        toast?.('Enter a workout name');
        button.disabled = false;
        button.textContent = 'Save to workout';
        return;
      }

      const { data: created, error: createError } = await supabase
        .from('workout_templates')
        .insert({ user_id: user.id, name, description: 'Created in FitTrack' })
        .select('id')
        .single();

      if (createError || !created) {
        toast?.('Could not create workout');
        button.disabled = false;
        button.textContent = 'Save to workout';
        return;
      }
      templateId = created.id;
    }

    const { data: existingRows, error: existingError } = await supabase
      .from('workout_template_exercises')
      .select('id,exercise_id,exercise_order')
      .eq('template_id', templateId)
      .order('exercise_order', { ascending: false });

    if (existingError) {
      toast?.('Could not read workout');
      button.disabled = false;
      button.textContent = 'Save to workout';
      return;
    }

    const duplicate = (existingRows || []).some(row => row.exercise_id === exerciseId);
    if (duplicate) {
      toast?.('Exercise already in this workout');
      button.disabled = false;
      button.textContent = 'Save to workout';
      return;
    }

    const nextOrder = (existingRows?.[0]?.exercise_order || 0) + 1;
    const plannedSets = Math.max(1, Math.min(10, numeric(document.getElementById('fitPlannedSets')?.value, 3)));
    const repsMin = Math.max(1, numeric(document.getElementById('fitRepsMin')?.value, 8));
    const repsMax = Math.max(repsMin, numeric(document.getElementById('fitRepsMax')?.value, 12));
    const restSeconds = Math.max(15, numeric(document.getElementById('fitRestSeconds')?.value, 90));
    const rawWeight = document.getElementById('fitTargetWeight')?.value?.trim();
    const targetWeight = rawWeight === '' ? null : Math.max(0, numeric(rawWeight, 0));

    const { error: insertError } = await supabase
      .from('workout_template_exercises')
      .insert({
        template_id: templateId,
        exercise_id: exerciseId,
        exercise_order: nextOrder,
        planned_sets: plannedSets,
        target_reps_min: repsMin,
        target_reps_max: repsMax,
        target_weight_kg: targetWeight,
        rest_seconds: restSeconds
      });

    if (insertError) {
      console.warn('FitTrack add to workout failed:', insertError.message);
      toast?.('Could not add exercise');
      button.disabled = false;
      button.textContent = 'Save to workout';
      return;
    }

    await supabase.from('workout_templates').update({ updated_at: new Date().toISOString() }).eq('id', templateId).eq('user_id', user.id);
    toast?.('Exercise added to workout');
    state.activeTab = 'Planner';
    window.fitTrackRender?.();
  }

  document.addEventListener('click', (event) => {
    const placeholderButton = event.target.closest('[data-library-add-soon]');
    if (placeholderButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openAddFlow();
      return;
    }

    const save = event.target.closest('[data-save-add-workout]');
    if (save) {
      event.preventDefault();
      saveToWorkout(save);
      return;
    }

    if (event.target.closest('[data-cancel-add-workout]')) {
      state.activeTab = 'Library';
      window.fitTrackRender?.();
      setTimeout(() => document.querySelector('[data-tab="Library"]')?.click(), 0);
    }
  }, true);
})();
