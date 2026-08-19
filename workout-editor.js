// FitTrack in-session workout editor.
// Enhances the Session screen without changing core navigation/rendering.
(function () {
  const state = window.fitTrackState;
  const render = window.fitTrackRender;
  const toast = window.fitTrackShowToast;
  if (!state || !render) return;

  function enhanceSession() {
    if (state.route !== 'workout' || state.activeTab !== 'Session') return;

    document.querySelectorAll('.exercise-session').forEach((exerciseEl, exIndex) => {
      if (exerciseEl.dataset.editorReady === '1') return;
      exerciseEl.dataset.editorReady = '1';

      const rows = exerciseEl.querySelectorAll('.set-row');
      rows.forEach((row, setIndex) => {
        const values = row.querySelectorAll('.set-value');
        if (values.length < 2) return;
        const set = state.workout.exercises[exIndex]?.sets[setIndex];
        if (!set) return;

        values[0].innerHTML = `<input class="fittrack-set-input" type="number" inputmode="decimal" min="0" step="0.5" value="${Number(set.weight || 0)}" data-edit-weight data-ex="${exIndex}" data-set="${setIndex}" aria-label="Weight in kg">`;
        values[1].innerHTML = `<input class="fittrack-set-input" type="number" inputmode="numeric" min="0" step="1" value="${Number(set.reps || 0)}" data-edit-reps data-ex="${exIndex}" data-set="${setIndex}" aria-label="Repetitions">`;
      });

      const body = exerciseEl.querySelector('.exercise-session-body');
      if (body && !body.querySelector('[data-add-edit-set]')) {
        const add = document.createElement('button');
        add.type = 'button';
        add.className = 'ghost-btn full-btn';
        add.dataset.addEditSet = String(exIndex);
        add.textContent = '+ Add set';
        body.appendChild(add);
      }
    });
  }

  async function persist(message) {
    if (typeof window.fitTrackSaveDraft === 'function') {
      await window.fitTrackSaveDraft(message);
    }
  }

  document.addEventListener('change', (event) => {
    const weight = event.target.closest('[data-edit-weight]');
    const reps = event.target.closest('[data-edit-reps]');
    const input = weight || reps;
    if (!input) return;

    const ex = Number(input.dataset.ex);
    const set = Number(input.dataset.set);
    const target = state.workout.exercises?.[ex]?.sets?.[set];
    if (!target) return;

    if (weight) target.weight = Math.max(0, Number(input.value || 0));
    if (reps) target.reps = Math.max(0, Math.round(Number(input.value || 0)));
    persist('Workout updated');
  });

  document.addEventListener('click', (event) => {
    const add = event.target.closest('[data-add-edit-set]');
    if (!add) return;

    const ex = Number(add.dataset.addEditSet);
    const exercise = state.workout.exercises?.[ex];
    if (!exercise) return;

    const last = exercise.sets.at(-1) || { weight: 0, reps: 8 };
    exercise.sets.push({
      weight: Number(last.weight || 0),
      reps: Number(last.reps || 8),
      done: false
    });
    render();
    setTimeout(enhanceSession, 0);
    persist('Set added');
  });

  const style = document.createElement('style');
  style.textContent = `
    .fittrack-set-input{width:100%;border:0;outline:0;background:transparent;color:inherit;text-align:center;font:inherit;font-weight:700;padding:0}
    .fittrack-set-input::-webkit-outer-spin-button,.fittrack-set-input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
    .fittrack-set-input[type=number]{appearance:textfield;-moz-appearance:textfield}
  `;
  document.head.appendChild(style);

  const observer = new MutationObserver(() => enhanceSession());
  observer.observe(document.getElementById('app'), { childList: true, subtree: true });
  enhanceSession();
})();
