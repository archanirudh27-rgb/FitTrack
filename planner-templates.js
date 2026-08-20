// FitTrack Planner: saved workout templates / My Workouts.
(function () {
  const supabase = window.fitTrackSupabase;
  const state = window.fitTrackState;
  const app = document.getElementById('app');
  const toast = window.fitTrackShowToast;
  if (!supabase || !state || !app) return;

  let requestToken = 0;
  let currentTemplate = null;

  function esc(value) {
    return String(value ?? '')
      .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
      .replaceAll('"','&quot;').replaceAll("'",'&#039;');
  }

  async function getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user || null;
  }

  function head(copy='Build reusable workouts from your Exercise Library. Scheduling them to dates comes next.') {
    return `<div class="page-head"><div class="eyebrow">Workout planner</div><h1 class="page-title">My workouts</h1><p class="page-copy">${copy}</p></div>
      <div class="tabs"><button class="tab" data-planner-tab="Session">Session</button><button class="tab active" data-planner-tab="Planner">Planner</button><button class="tab" data-planner-tab="Library">Library</button></div>`;
  }

  async function loadPlanner() {
    const token = ++requestToken;
    currentTemplate = null;
    state.route = 'workout';
    state.activeTab = 'Planner';
    app.innerHTML = `${head()}<section class="card"><div class="card-subtitle">Loading your workouts…</div></section>`;

    const user = await getUser();
    if (token !== requestToken) return;
    if (!user) {
      app.innerHTML = `${head()}<section class="card"><div class="card-title">Sign in to view your workouts</div></section>`;
      return;
    }

    const { data: templates, error: templateError } = await supabase
      .from('workout_templates')
      .select('id,name,description,updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (token !== requestToken || state.activeTab !== 'Planner') return;
    if (templateError) {
      console.warn('FitTrack planner templates failed:', templateError.message);
      app.innerHTML = `${head()}<section class="card"><div class="card-title">Could not load workouts</div></section>`;
      return;
    }

    const ids = (templates || []).map(t => t.id);
    let rows = [];
    if (ids.length) {
      const res = await supabase.from('workout_template_exercises').select('template_id').in('template_id', ids);
      if (!res.error) rows = res.data || [];
    }
    const counts = new Map();
    rows.forEach(r => counts.set(r.template_id, (counts.get(r.template_id) || 0) + 1));

    app.innerHTML = `${head()}
      <section class="card" style="margin-bottom:14px">
        <div class="meta-row"><div><div class="section-title">Saved templates</div><div class="card-title">${templates?.length || 0} workout${templates?.length===1?'':'s'}</div></div>
        <button type="button" class="secondary-btn" data-planner-open-library>＋ Add exercises</button></div>
      </section>
      ${(templates || []).length ? `<section class="grid grid-2">${templates.map(t => `
        <button type="button" class="card" data-template-open="${t.id}" style="text-align:left;color:inherit;cursor:pointer;width:100%">
          <div class="meta-row"><div><div class="card-title">${esc(t.name)}</div><div class="card-subtitle">${counts.get(t.id)||0} exercise${(counts.get(t.id)||0)===1?'':'s'}</div></div><span class="accent" style="font-size:22px">→</span></div>
          <div class="chips"><span class="chip">Workout template</span><span class="chip">Editable</span></div>
        </button>`).join('')}</section>` : `
        <section class="card"><div class="card-title">No saved workouts yet</div><p class="page-copy" style="margin-top:8px">Open Library, choose an exercise and tap “Add to workout” to create your first template.</p><button type="button" class="primary-btn" style="margin-top:14px" data-planner-open-library>Open Exercise Library</button></section>`}`;
  }

  async function openTemplate(templateId) {
    const token = ++requestToken;
    app.innerHTML = `${head('Review and edit the planned values for this workout. Actual weight and reps remain editable during Session.')}<section class="card"><div class="card-subtitle">Loading workout…</div></section>`;

    const user = await getUser(); if (!user) return;
    const { data: template, error: tErr } = await supabase.from('workout_templates').select('id,name,description').eq('id', templateId).eq('user_id', user.id).maybeSingle();
    if (tErr || !template || token !== requestToken) { toast?.('Could not load workout'); return; }

    const { data: rows, error: rErr } = await supabase.from('workout_template_exercises')
      .select('id,exercise_id,exercise_order,planned_sets,target_reps_min,target_reps_max,target_weight_kg,rest_seconds')
      .eq('template_id', templateId).order('exercise_order');
    if (rErr || token !== requestToken) { toast?.('Could not load workout exercises'); return; }

    const exerciseIds = [...new Set((rows||[]).map(r=>r.exercise_id))];
    let exercises = [];
    if (exerciseIds.length) {
      const res = await supabase.from('exercises').select('id,name,equipment').in('id', exerciseIds);
      if (!res.error) exercises = res.data || [];
    }
    const exMap = new Map(exercises.map(e=>[e.id,e]));
    currentTemplate = { template, rows: rows || [], exMap };
    renderTemplateDetail();
  }

  function renderTemplateDetail() {
    if (!currentTemplate) return;
    const { template, rows, exMap } = currentTemplate;
    app.innerHTML = `${head('Review and edit the planned values for this workout. Actual weight and reps remain editable during Session.')}
      <div class="meta-row" style="margin-bottom:14px"><button type="button" class="ghost-btn" data-template-back>← My workouts</button><button type="button" class="ghost-btn" data-template-delete="${template.id}">Delete test workout</button></div>
      <section class="card" style="margin-bottom:14px"><div class="section-title">Workout template</div><div class="card-title">${esc(template.name)}</div><div class="card-subtitle">${rows.length} exercise${rows.length===1?'':'s'} · values below are planned defaults</div></section>
      ${rows.length ? `<div class="workout-shell">${rows.map((row,index)=>{const ex=exMap.get(row.exercise_id)||{name:'Exercise',equipment:''};return `
        <section class="exercise-session" data-template-row="${row.id}">
          <div class="exercise-session-head"><div class="meta-row"><div><div class="card-title">${index+1}. ${esc(ex.name)}</div><div class="card-subtitle">${esc(ex.equipment||'')}</div></div><button type="button" class="ghost-btn" data-template-remove="${row.id}">Remove</button></div></div>
          <div class="exercise-session-body"><div class="grid grid-2">
            <label><div class="card-subtitle">Sets</div><input class="auth-input" data-field="planned_sets" type="number" min="1" max="10" value="${row.planned_sets ?? 3}" style="width:100%;margin-top:6px"></label>
            <label><div class="card-subtitle">Target weight (kg)</div><input class="auth-input" data-field="target_weight_kg" type="number" min="0" step="0.5" value="${row.target_weight_kg ?? ''}" placeholder="Optional" style="width:100%;margin-top:6px"></label>
            <label><div class="card-subtitle">Reps min</div><input class="auth-input" data-field="target_reps_min" type="number" min="1" max="100" value="${row.target_reps_min ?? 8}" style="width:100%;margin-top:6px"></label>
            <label><div class="card-subtitle">Reps max</div><input class="auth-input" data-field="target_reps_max" type="number" min="1" max="100" value="${row.target_reps_max ?? 12}" style="width:100%;margin-top:6px"></label>
            <label><div class="card-subtitle">Rest (sec)</div><input class="auth-input" data-field="rest_seconds" type="number" min="15" step="15" value="${row.rest_seconds ?? 90}" style="width:100%;margin-top:6px"></label>
          </div><button type="button" class="secondary-btn full-btn" data-template-save-row="${row.id}">Save changes</button></div>
        </section>`}).join('')}</div>` : `<section class="card"><div class="card-title">No exercises in this workout</div><p class="page-copy" style="margin-top:8px">Add exercises from the Library.</p></section>`}
      <button type="button" class="primary-btn full-btn" data-planner-open-library style="margin-top:14px">＋ Add another exercise from Library</button>`;
  }

  async function saveRow(rowId, button) {
    const section = button.closest('[data-template-row]'); if (!section) return;
    const val = field => section.querySelector(`[data-field="${field}"]`)?.value;
    const repsMin = Math.max(1, Number(val('target_reps_min')) || 1);
    const repsMax = Math.max(repsMin, Number(val('target_reps_max')) || repsMin);
    const rawWeight = val('target_weight_kg');
    const payload = {
      planned_sets: Math.max(1, Math.min(10, Number(val('planned_sets')) || 1)),
      target_reps_min: repsMin,
      target_reps_max: repsMax,
      target_weight_kg: rawWeight === '' ? null : Math.max(0, Number(rawWeight) || 0),
      rest_seconds: Math.max(15, Number(val('rest_seconds')) || 90)
    };
    button.disabled = true; button.textContent = 'Saving…';
    const { error } = await supabase.from('workout_template_exercises').update(payload).eq('id', rowId);
    button.disabled = false; button.textContent = 'Save changes';
    if (error) { toast?.('Could not save changes'); return; }
    toast?.('Workout updated');
  }

  async function removeRow(rowId) {
    const { error } = await supabase.from('workout_template_exercises').delete().eq('id', rowId);
    if (error) { toast?.('Could not remove exercise'); return; }
    toast?.('Exercise removed');
    if (currentTemplate) openTemplate(currentTemplate.template.id);
  }

  async function deleteTemplate(templateId) {
    const user = await getUser(); if (!user) return;
    if (!confirm('Delete this workout template? This is useful for clearing test workouts.')) return;
    const { error } = await supabase.from('workout_templates').delete().eq('id', templateId).eq('user_id', user.id);
    if (error) { toast?.('Could not delete workout'); return; }
    toast?.('Workout deleted'); loadPlanner();
  }

  function openLibrary() {
    ++requestToken; currentTemplate = null; state.activeTab = 'Library'; window.fitTrackRender?.();
    setTimeout(()=>document.querySelector('[data-tab="Library"]')?.click(),0);
  }

  document.addEventListener('click', event => {
    const planner = event.target.closest('[data-tab="Planner"], [data-library-tab="Planner"]');
    if (planner) setTimeout(loadPlanner, 0);

    const ownTab = event.target.closest('[data-planner-tab]');
    if (ownTab) {
      const tab = ownTab.dataset.plannerTab;
      if (tab === 'Planner') loadPlanner();
      else if (tab === 'Library') openLibrary();
      else { ++requestToken; currentTemplate=null; state.activeTab='Session'; window.fitTrackRender?.(); }
      return;
    }

    const open = event.target.closest('[data-template-open]'); if (open) { openTemplate(open.dataset.templateOpen); return; }
    if (event.target.closest('[data-template-back]')) { loadPlanner(); return; }
    if (event.target.closest('[data-planner-open-library]')) { openLibrary(); return; }
    const save = event.target.closest('[data-template-save-row]'); if (save) { saveRow(save.dataset.templateSaveRow, save); return; }
    const remove = event.target.closest('[data-template-remove]'); if (remove) { removeRow(remove.dataset.templateRemove); return; }
    const del = event.target.closest('[data-template-delete]'); if (del) { deleteTemplate(del.dataset.templateDelete); return; }
  });

  window.addEventListener('fittrack:planner-refresh', () => setTimeout(loadPlanner, 0));
})();
