// FitTrack enhanced live Session UX.
(function () {
  const supabase = window.fitTrackSupabase;
  const state = window.fitTrackState;
  const app = document.getElementById('app');
  const toast = window.fitTrackShowToast;
  if (!state || !app) return;

  let enhanceBusy = false;
  let restTimer = null;
  let restEndsAt = 0;
  const previousCache = new Map();

  function isSession() {
    return state.route === 'workout' && state.activeTab === 'Session' && !!app.querySelector('.workout-shell');
  }

  function totals() {
    let total = 0, done = 0;
    (state.workout?.exercises || []).forEach(ex => (ex.sets || []).forEach(set => {
      total += 1;
      if (set.done) done += 1;
    }));
    return { total, done, pct: total ? Math.round(done / total * 100) : 0 };
  }

  function injectProgress() {
    if (!isSession()) return;
    const summary = app.querySelector('.workout-shell')?.previousElementSibling;
    if (!summary || summary.querySelector('[data-session-progress]')) return;
    const { total, done, pct } = totals();
    const wrap = document.createElement('div');
    wrap.dataset.sessionProgress = '1';
    wrap.style.marginTop = '12px';
    wrap.innerHTML = `<div class="meta-row"><span class="card-subtitle">Overall progress</span><strong>${pct}%</strong></div><div style="height:8px;background:rgba(255,255,255,.08);border-radius:999px;overflow:hidden;margin-top:7px"><div style="height:100%;width:${pct}%;background:currentColor;border-radius:999px" class="accent"></div></div><div class="card-subtitle" style="margin-top:6px">${done} of ${total} sets completed</div>`;
    summary.appendChild(wrap);
  }

  function injectRemoveSetButtons() {
    if (!isSession()) return;
    app.querySelectorAll('.exercise-session').forEach((exerciseEl, exIndex) => {
      exerciseEl.querySelectorAll('.set-row').forEach((row, setIndex) => {
        if (row.querySelector('[data-remove-live-set]')) return;
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'ghost-btn';
        remove.dataset.removeLiveSet = `${exIndex}:${setIndex}`;
        remove.textContent = '−';
        remove.setAttribute('aria-label', 'Remove set');
        remove.style.minWidth = '38px';
        row.appendChild(remove);
      });
    });
  }

  function restPanel() {
    let panel = app.querySelector('[data-rest-panel]');
    if (panel) return panel;
    panel = document.createElement('section');
    panel.className = 'card';
    panel.dataset.restPanel = '1';
    panel.style.marginBottom = '14px';
    panel.style.display = 'none';
    const shell = app.querySelector('.workout-shell');
    shell?.parentNode?.insertBefore(panel, shell);
    return panel;
  }

  function stopRestTimer() {
    if (restTimer) clearInterval(restTimer);
    restTimer = null;
    restEndsAt = 0;
    const panel = app.querySelector('[data-rest-panel]');
    if (panel) panel.style.display = 'none';
  }

  function renderRest() {
    const panel = restPanel();
    if (!panel || !restEndsAt) return;
    const remaining = Math.max(0, Math.ceil((restEndsAt - Date.now()) / 1000));
    if (!remaining) {
      stopRestTimer();
      toast?.('Rest complete');
      return;
    }
    const min = Math.floor(remaining / 60);
    const sec = String(remaining % 60).padStart(2, '0');
    panel.style.display = 'block';
    panel.innerHTML = `<div class="meta-row"><div><div class="section-title">Rest timer</div><div class="card-title" style="font-size:30px;margin-top:4px">${min}:${sec}</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="secondary-btn" data-rest-add="30">+30 sec</button><button class="ghost-btn" data-rest-skip>Skip</button></div></div>`;
  }

  function startRest(seconds) {
    stopRestTimer();
    restEndsAt = Date.now() + Math.max(15, Number(seconds || 90)) * 1000;
    renderRest();
    restTimer = setInterval(renderRest, 500);
  }

  async function previousForExercise(exerciseName) {
    if (!supabase || !exerciseName) return null;
    if (previousCache.has(exerciseName)) return previousCache.get(exerciseName);
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) return null;
    const { data, error } = await supabase.from('completed_workouts')
      .select('workout_state,completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending:false })
      .limit(20);
    if (error) return null;
    let found = null;
    for (const workout of data || []) {
      const ex = workout.workout_state?.exercises?.find(item => item.name === exerciseName);
      if (!ex) continue;
      const doneSets = (ex.sets || []).filter(s => s.done);
      if (!doneSets.length) continue;
      const best = doneSets.reduce((a,b) => (Number(b.weight||0) > Number(a.weight||0) ? b : a), doneSets[0]);
      found = { weight:Number(best.weight||0), reps:Number(best.reps||0), date:workout.completed_at };
      break;
    }
    previousCache.set(exerciseName, found);
    return found;
  }

  async function injectPreviousPerformance() {
    if (!isSession()) return;
    const cards = [...app.querySelectorAll('.exercise-session')];
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (card.querySelector('[data-previous-performance]')) continue;
      const exercise = state.workout?.exercises?.[i];
      if (!exercise) continue;
      const prev = await previousForExercise(exercise.name);
      if (!isSession() || !card.isConnected) return;
      const note = document.createElement('div');
      note.dataset.previousPerformance = '1';
      note.className = 'card-subtitle';
      note.style.marginTop = '7px';
      note.textContent = prev ? `Previous: ${prev.weight} kg × ${prev.reps} reps` : 'Previous: no completed history yet';
      card.querySelector('.exercise-session-head')?.appendChild(note);
    }
  }

  function enhance() {
    if (!isSession()) return;
    injectProgress();
    injectRemoveSetButtons();
    injectPreviousPerformance();
  }

  document.addEventListener('click', event => {
    const remove = event.target.closest('[data-remove-live-set]');
    if (remove) {
      event.preventDefault();
      const [exIndex, setIndex] = remove.dataset.removeLiveSet.split(':').map(Number);
      const exercise = state.workout?.exercises?.[exIndex];
      if (!exercise || exercise.sets.length <= 1) { toast?.('Keep at least one set'); return; }
      exercise.sets.splice(setIndex, 1);
      window.fitTrackRender?.();
      window.fitTrackSaveDraft?.('Set removed');
      return;
    }

    const addRest = event.target.closest('[data-rest-add]');
    if (addRest && restEndsAt) {
      restEndsAt += Number(addRest.dataset.restAdd || 30) * 1000;
      renderRest();
      return;
    }
    if (event.target.closest('[data-rest-skip]')) {
      stopRestTimer();
      return;
    }

    const complete = event.target.closest('[data-action="toggle-set"]');
    if (complete) {
      const exIndex = Number(complete.dataset.ex);
      const setIndex = Number(complete.dataset.set);
      const wasDone = !!state.workout?.exercises?.[exIndex]?.sets?.[setIndex]?.done;
      if (!wasDone) {
        const restSeconds = state.workout?.exercises?.[exIndex]?.restSeconds || 90;
        setTimeout(() => startRest(restSeconds), 60);
      }
    }
  }, true);

  const observer = new MutationObserver(() => {
    if (enhanceBusy) return;
    enhanceBusy = true;
    setTimeout(() => { enhanceBusy = false; enhance(); }, 30);
  });
  observer.observe(app, { childList:true, subtree:true });
  setTimeout(enhance, 100);
})();
