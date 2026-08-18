const state = {
  route: 'home',
  activeTab: 'All',
  workout: {
    name: 'Chest A',
    exercises: [
      {
        name: 'Barbell Bench Press',
        target: 'Chest · Triceps · Front Delts',
        sets: [
          { weight: 70, reps: 10, done: true },
          { weight: 70, reps: 9, done: true },
          { weight: 72.5, reps: 8, done: false },
          { weight: 72.5, reps: 8, done: false }
        ]
      },
      {
        name: 'Incline Dumbbell Press',
        target: 'Upper Chest · Triceps',
        sets: [
          { weight: 24, reps: 10, done: false },
          { weight: 24, reps: 10, done: false },
          { weight: 24, reps: 8, done: false }
        ]
      },
      {
        name: 'Cable Crossover',
        target: 'Chest',
        sets: [
          { weight: 17.5, reps: 12, done: false },
          { weight: 17.5, reps: 12, done: false },
          { weight: 17.5, reps: 12, done: false }
        ]
      }
    ]
  },
  rides: [
    { date: '18 Aug', name: 'Morning Ride', distance: 18.7, duration: '47:52', calories: 486 },
    { date: '16 Aug', name: 'Weekend Ride', distance: 24.4, duration: '1:01:18', calories: 612 },
    { date: '13 Aug', name: 'Evening Ride', distance: 12.6, duration: '33:47', calories: 318 }
  ],
  workoutHistory: [
    { date: '18 Aug', name: 'Chest A', duration: '52 min', volume: '7,420 kg' },
    { date: '17 Aug', name: 'Back A', duration: '56 min', volume: '8,110 kg' },
    { date: '15 Aug', name: 'Legs A', duration: '61 min', volume: '11,280 kg' }
  ]
};

const app = document.getElementById('app');
const toast = document.getElementById('toast');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 1900);
}

function navigate(route) {
  state.route = route;
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.route === route));
  render();
  app.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function pageHead(eyebrow, title, copy) {
  return `
    <div class="page-head">
      <div class="eyebrow">${eyebrow}</div>
      <h1 class="page-title">${title}</h1>
      <p class="page-copy">${copy}</p>
    </div>`;
}

function metricCard(label, value, sub, icon = '') {
  return `
    <article class="card activity-card">
      <div class="meta-row">
        <div class="activity-icon">${icon}</div>
        <span class="eyebrow">${label}</span>
      </div>
      <div>
        <div class="metric metric-sm">${value}</div>
        <div class="metric-label">${sub}</div>
      </div>
    </article>`;
}

function renderHome() {
  const workoutDone = state.workout.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.done).length, 0);
  const workoutSets = state.workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  return `
    ${pageHead('Tuesday · 18 Aug', 'Good evening, Anirudh', 'Your next session is ready. Keep the focus on consistency and clean progression.')}

    <section class="card hero-card">
      <div>
        <div class="eyebrow">Today · Strength</div>
        <h2 class="page-title" style="font-size:34px; margin-top:8px">${state.workout.name}</h2>
        <p class="page-copy">4 exercises · ${workoutSets + 3} planned sets · ~52 min</p>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;position:relative;z-index:2">
        <button class="primary-btn" data-action="start-workout">Start workout →</button>
        <button class="ghost-btn" data-route="workout">Edit session</button>
      </div>
    </section>

    <div style="height:14px"></div>
    <div class="section-title">Activity</div>
    <section class="grid grid-4">
      ${metricCard('Gym', '52 min', '~340 kcal', '⌁')}
      ${metricCard('Ride', '18.7 km', '~486 kcal', '◉')}
      ${metricCard('Sets', workoutDone + ' / ' + workoutSets, 'completed today', '✓')}
      ${metricCard('Streak', '4 days', 'current streak', '4')}
    </section>

    <div style="height:14px"></div>
    <section class="grid grid-2">
      <article class="card">
        <div class="meta-row"><h2 class="card-title">This week</h2><span class="chip">4 / 5 workouts</span></div>
        <div class="progress-copy"><span>Consistency</span><strong>80%</strong></div>
        <div class="progress-track"><div class="progress-fill" style="width:80%"></div></div>
        <div class="chips"><span class="chip">3 strength</span><span class="chip">2 rides</span><span class="chip">86.4 km</span></div>
      </article>
      <article class="card">
        <div class="meta-row"><h2 class="card-title">Next plan</h2><span class="chip">Tomorrow</span></div>
        <div class="list" style="margin-top:12px">
          <div class="list-row"><div><div class="list-row-title">Back A</div><div class="list-row-meta">4 exercises · 15 sets</div></div><strong>→</strong></div>
          <div class="list-row"><div><div class="list-row-title">Target</div><div class="list-row-meta">Progress from last session</div></div><span class="accent">+2.5 kg</span></div>
        </div>
      </article>
    </section>
  `;
}

function renderWorkout() {
  const completed = state.workout.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.done).length, 0);
  const total = state.workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  return `
    ${pageHead('Workout planner · Tuesday 18 Aug', state.workout.name, 'This session is editable without changing your saved workout template.')}

    <div class="tabs">
      ${['Session', 'Planner', 'Library'].map(t => `<button class="tab ${state.activeTab === t ? 'active' : ''}" data-tab="${t}">${t}</button>`).join('')}
    </div>

    ${state.activeTab === 'Session' ? `
      <section class="card" style="margin-bottom:14px">
        <div class="meta-row"><div><div class="section-title" style="margin-bottom:4px">Planned session</div><div class="card-title">${completed} / ${total} sets completed</div></div><button class="secondary-btn" data-action="edit-session">Edit sets / reps</button></div>
      </section>
      <div class="workout-shell">
        ${state.workout.exercises.map((ex, exIndex) => `
          <section class="exercise-session">
            <div class="exercise-session-head">
              <div class="meta-row">
                <div>
                  <div class="card-title">${ex.name}</div>
                  <div class="card-subtitle">${ex.target}</div>
                </div>
                <button class="ghost-btn" data-action="tutorial" data-exercise="${ex.name}">How to</button>
              </div>
            </div>
            <div class="exercise-session-body">
              ${ex.sets.map((set, setIndex) => `
                <div class="set-row">
                  <div class="set-index">${setIndex + 1}</div>
                  <div class="set-value">${set.weight} kg</div>
                  <div class="set-value">${set.reps} reps</div>
                  <button class="set-complete ${set.done ? 'done' : ''}" data-action="toggle-set" data-ex="${exIndex}" data-set="${setIndex}">${set.done ? '✓ Done' : 'Complete'}</button>
                </div>`).join('')}
              <button class="ghost-btn full-btn" data-action="add-set" data-ex="${exIndex}">+ Add set</button>
            </div>
          </section>`).join('')}
      </div>
      <button class="primary-btn full-btn" data-action="finish-workout">Finish workout</button>
    ` : ''}

    ${state.activeTab === 'Planner' ? renderPlanner() : ''}
    ${state.activeTab === 'Library' ? renderLibrary() : ''}
  `;
}

function renderPlanner() {
  const days = [
    ['24', 'CHEST'], ['25', 'BACK'], ['26', 'REST'], ['27', 'LEGS'], ['28', 'ARMS'], ['29', 'RIDE'], ['30', 'REST'],
    ['31', 'CHEST'], ['1', 'BACK'], ['2', 'REST'], ['3', 'LEGS'], ['4', 'ARMS'], ['5', 'RIDE'], ['6', 'REST'],
    ['7', 'CHEST'], ['8', 'BACK'], ['9', 'REST'], ['10', 'LEGS'], ['11', 'ARMS'], ['12', 'RIDE'], ['13', 'REST'],
    ['14', 'CHEST'], ['15', 'BACK'], ['16', 'REST'], ['17', 'LEGS'], ['18', 'ARMS'], ['19', 'RIDE'], ['20', 'REST']
  ];
  return `
    <section class="card">
      <div class="meta-row"><div><div class="section-title" style="margin-bottom:4px">Monthly plan</div><div class="card-title">September 2026</div></div><button class="primary-btn" data-action="new-plan">+ Plan day</button></div>
      <p class="page-copy" style="margin-top:8px">Customize sets, reps, weight and exercise order for a specific date. The planned session is frozen once saved.</p>
      <div style="height:14px"></div>
      <div class="calendar">
        ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => `<div class="calendar-head">${d}</div>`).join('')}
        ${days.map(([date, plan], i) => `<div class="calendar-day ${i < 8 ? 'done' : ''}"><div class="date">${date}</div><div class="plan">${plan}</div></div>`).join('')}
      </div>
    </section>`;
}

function renderLibrary() {
  const groups = [
    { name: 'Chest', count: 8, examples: 'Bench Press · Incline DB · Cable Crossover · Pec Deck' },
    { name: 'Back', count: 10, examples: 'Pull-up · Lat Pulldown · Row · T-bar Row' },
    { name: 'Shoulders', count: 9, examples: 'OHP · Lateral Raise · Rear Delt · Face Pull' },
    { name: 'Quads', count: 8, examples: 'Squat · Hack Squat · Leg Press · Leg Extension' },
    { name: 'Hamstrings', count: 7, examples: 'RDL · Leg Curl · Good Morning · Nordic Curl' },
    { name: 'Glutes', count: 8, examples: 'Hip Thrust · Split Squat · Lunge · Kickback' },
    { name: 'Biceps', count: 8, examples: 'DB Curl · EZ Curl · Hammer Curl · Cable Curl' },
    { name: 'Triceps', count: 8, examples: 'Pushdown · Skull Crusher · Dip · Overhead Extension' }
  ];
  return `
    <section class="grid grid-2">
      ${groups.map(g => `<article class="card exercise-card">
        <div class="exercise-placeholder">Personalised imagery coming next</div>
        <div class="meta-row"><div><div class="card-title">${g.name}</div><div class="card-subtitle">${g.count} exercise variations</div></div><span class="chip">Browse</span></div>
        <div class="chips">${g.examples.split(' · ').map(x => `<span class="chip">${x}</span>`).join('')}</div>
        <button class="secondary-btn full-btn" data-action="browse-muscle" data-muscle="${g.name}">Explore ${g.name}</button>
      </article>`).join('')}
    </section>`;
}

function renderRide() {
  return `
    ${pageHead('Cycling', 'Ride tracking', 'A dedicated cycling view with GPS, performance metrics and saved ride history. The live GPS engine will be connected during the next build step.')}
    <section class="card">
      <div class="map-panel">
        <div class="map-grid"></div>
        <div class="map-label">GPS preview · ready for live tracking</div>
        <svg class="map-route" viewBox="0 0 800 450" preserveAspectRatio="none" aria-label="Illustrated ride route">
          <path d="M40 350 C120 305, 120 180, 205 210 S315 360, 370 270 S470 120, 545 165 S625 330, 748 70" />
        </svg>
      </div>
      <div class="ride-stats">
        <div class="card"><div class="metric">18.72</div><div class="metric-label">km</div></div>
        <div class="card"><div class="metric">23.4</div><div class="metric-label">avg km/h</div></div>
        <div class="card"><div class="metric">47:52</div><div class="metric-label">duration</div></div>
        <div class="card"><div class="metric">486</div><div class="metric-label">estimated kcal</div></div>
      </div>
      <div class="grid grid-2" style="margin-top:14px">
        <button class="primary-btn" data-action="start-ride">Start ride</button>
        <button class="ghost-btn" data-action="ride-info">Ride settings</button>
      </div>
    </section>`;
}

function renderHistory() {
  const gymRows = state.workoutHistory.map(x => `<div class="list-row"><div><div class="list-row-title">${x.name}</div><div class="list-row-meta">${x.date} · ${x.duration}</div></div><strong>${x.volume}</strong></div>`).join('');
  const rideRows = state.rides.map(x => `<div class="list-row"><div><div class="list-row-title">${x.name}</div><div class="list-row-meta">${x.date} · ${x.duration}</div></div><strong>${x.distance} km</strong></div>`).join('');
  return `
    ${pageHead('Activity log', 'History', 'Every planned session and completed activity will live here, with filters and drill-down detail.')}
    <div class="tabs">${['All','Gym','Cycling'].map(t => `<button class="tab ${state.activeTab === t ? 'active':''}" data-history-tab="${t}">${t}</button>`).join('')}</div>
    <section class="card">
      <div class="list">
        ${(state.activeTab === 'Cycling' ? rideRows : state.activeTab === 'Gym' ? gymRows : gymRows + rideRows)}
      </div>
    </section>`;
}

function renderProgress() {
  return `
    ${pageHead('Analytics', 'Progress', 'Your strength and cycling trends are designed to become more intelligent as your history grows.')}
    <section class="grid grid-2">
      <article class="card">
        <div class="meta-row"><div><div class="section-title">Strength</div><div class="card-title">Bench Press</div></div><span class="accent">+12.4%</span></div>
        <div class="metric" style="margin-top:24px">75 kg</div>
        <div class="metric-label">estimated current top set</div>
        <svg viewBox="0 0 500 170" style="width:100%;margin-top:18px" aria-label="Bench press progression chart">
          <polyline points="10,145 70,132 130,138 190,118 250,124 310,92 370,78 430,54 490,34" fill="none" stroke="#ff6a00" stroke-width="4" stroke-linecap="round" />
          <line x1="10" y1="150" x2="490" y2="150" stroke="#30363d" />
        </svg>
      </article>
      <article class="card">
        <div class="meta-row"><div><div class="section-title">Cycling</div><div class="card-title">August distance</div></div><span class="accent">+50%</span></div>
        <div class="metric" style="margin-top:24px">126.4 km</div>
        <div class="metric-label">across 8 saved rides</div>
        <div style="height:18px"></div>
        <div class="progress-copy"><span>Monthly target</span><strong>126 / 160 km</strong></div>
        <div class="progress-track"><div class="progress-fill" style="width:79%"></div></div>
      </article>
    </section>
    <div style="height:14px"></div>
    <section class="grid grid-4">
      ${metricCard('PR', '75 kg', 'Bench Press', '1')}
      ${metricCard('PR', '110 kg', 'Squat', '2')}
      ${metricCard('Ride', '42.8 km', 'Longest ride', '3')}
      ${metricCard('Month', '9', 'Completed sessions', '9')}
    </section>`;
}

function render() {
  if (state.route === 'home') app.innerHTML = renderHome();
  if (state.route === 'workout') app.innerHTML = renderWorkout();
  if (state.route === 'ride') app.innerHTML = renderRide();
  if (state.route === 'history') app.innerHTML = renderHistory();
  if (state.route === 'progress') app.innerHTML = renderProgress();
  wireEvents();
}

function wireEvents() {
  document.querySelectorAll('[data-route]').forEach(el => el.addEventListener('click', () => navigate(el.dataset.route)));
  document.querySelectorAll('[data-tab]').forEach(el => el.addEventListener('click', () => { state.activeTab = el.dataset.tab; render(); }));
  document.querySelectorAll('[data-history-tab]').forEach(el => el.addEventListener('click', () => { state.activeTab = el.dataset.historyTab; render(); }));

  document.querySelectorAll('[data-action="toggle-set"]').forEach(btn => btn.addEventListener('click', () => {
    const ex = Number(btn.dataset.ex); const set = Number(btn.dataset.set);
    const item = state.workout.exercises[ex].sets[set];
    item.done = !item.done;
    showToast(item.done ? 'Set completed · rest timer ready' : 'Set marked incomplete');
    render();
  }));

  document.querySelectorAll('[data-action="add-set"]').forEach(btn => btn.addEventListener('click', () => {
    const ex = Number(btn.dataset.ex);
    const last = state.workout.exercises[ex].sets.at(-1);
    state.workout.exercises[ex].sets.push({ weight: last?.weight || 0, reps: last?.reps || 8, done: false });
    showToast('Set added to this session');
    render();
  }));

  document.querySelectorAll('[data-action="start-workout"]').forEach(btn => btn.addEventListener('click', () => navigate('workout')));
  document.querySelectorAll('[data-action="finish-workout"]').forEach(btn => btn.addEventListener('click', () => { showToast('Workout saved locally · Supabase comes next'); navigate('history'); }));
  document.querySelectorAll('[data-action="start-ride"]').forEach(btn => btn.addEventListener('click', () => showToast('GPS ride mode is next: live tracking will be enabled here')));
  document.querySelectorAll('[data-action="new-plan"]').forEach(btn => btn.addEventListener('click', () => showToast('Planner editor will open in the next build step')));
  document.querySelectorAll('[data-action="edit-session"]').forEach(btn => btn.addEventListener('click', () => showToast('Session editor will let you change exercise, sets, reps, weight and rest')));
  document.querySelectorAll('[data-action="tutorial"]').forEach(btn => btn.addEventListener('click', () => showToast(`${btn.dataset.exercise}: tutorial and personalised imagery are next`)));
  document.querySelectorAll('[data-action="browse-muscle"]').forEach(btn => btn.addEventListener('click', () => showToast(`${btn.dataset.muscle}: exercise library drill-down coming next`)));
  document.querySelectorAll('[data-action="ride-info"]').forEach(btn => btn.addEventListener('click', () => showToast('Ride defaults will include units, auto-pause and calorie settings')));
  document.getElementById('profileButton')?.addEventListener('click', () => showToast('Profile and account settings are coming with authentication'));
}

render();
