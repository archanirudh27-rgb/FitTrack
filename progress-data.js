// FitTrack real progress analytics from completed workouts.
// This script only owns the Progress screen and does not modify core navigation.
(function () {
  const supabase = window.fitTrackSupabase;
  const state = window.fitTrackState;
  if (!supabase || !state) return;

  let requestId = 0;

  async function getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user || null;
  }

  function esc(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function fmt(value) {
    return Math.round(Number(value || 0)).toLocaleString();
  }

  function analyse(rows) {
    let totalVolume = 0;
    let totalSets = 0;
    const byExercise = new Map();

    rows.forEach(row => {
      totalVolume += Number(row.total_volume_kg || 0);
      totalSets += Number(row.completed_sets || 0);
      const exercises = row.workout_state?.exercises || [];
      exercises.forEach(ex => {
        const doneSets = (ex.sets || []).filter(set => set.done);
        if (!doneSets.length) return;
        const maxWeight = Math.max(...doneSets.map(set => Number(set.weight || 0)));
        const previous = byExercise.get(ex.name) || [];
        previous.push({ date: row.completed_at, maxWeight });
        byExercise.set(ex.name, previous);
      });
    });

    let strongest = null;
    let strongestWeight = -1;
    let mostImproved = null;
    let improvement = null;

    byExercise.forEach((points, name) => {
      const localMax = Math.max(...points.map(p => p.maxWeight));
      if (localMax > strongestWeight) {
        strongestWeight = localMax;
        strongest = name;
      }

      const sorted = [...points].sort((a, b) => new Date(a.date) - new Date(b.date));
      if (sorted.length >= 2) {
        const first = sorted[0].maxWeight;
        const last = sorted.at(-1).maxWeight;
        const delta = last - first;
        if (improvement == null || delta > improvement) {
          improvement = delta;
          mostImproved = name;
        }
      }
    });

    const recent = rows.slice(0, 6).reverse();
    return { totalVolume, totalSets, strongest, strongestWeight, mostImproved, improvement, recent };
  }

  function miniBars(rows) {
    if (!rows.length) return '<div class="page-copy">Complete workouts to build your trend.</div>';
    const max = Math.max(...rows.map(r => Number(r.total_volume_kg || 0)), 1);
    return `<div style="display:flex;align-items:end;gap:8px;height:150px;margin-top:18px">${rows.map(row => {
      const height = Math.max(8, Math.round((Number(row.total_volume_kg || 0) / max) * 130));
      const date = new Date(row.completed_at).toLocaleDateString(undefined, { day:'numeric', month:'short' });
      return `<div style="flex:1;display:flex;flex-direction:column;justify-content:end;align-items:center;gap:7px;min-width:0">
        <div title="${fmt(row.total_volume_kg)} kg" style="width:100%;max-width:46px;height:${height}px;border-radius:8px 8px 3px 3px;background:var(--accent)"></div>
        <small style="color:var(--muted);font-size:10px;white-space:nowrap">${date}</small>
      </div>`;
    }).join('')}</div>`;
  }

  function renderProgress(rows) {
    const a = analyse(rows);
    const avgVolume = rows.length ? a.totalVolume / rows.length : 0;

    document.getElementById('app').innerHTML = `
      <div data-real-progress="1">
        <div class="page-head">
          <div class="eyebrow">Analytics</div>
          <h1 class="page-title">Progress</h1>
          <p class="page-copy">Calculated from your actual completed FitTrack workouts.</p>
        </div>

        <section class="grid grid-4">
          <article class="card activity-card">
            <div class="eyebrow">Workouts</div>
            <div><div class="metric metric-sm">${rows.length}</div><div class="metric-label">completed</div></div>
          </article>
          <article class="card activity-card">
            <div class="eyebrow">Sets</div>
            <div><div class="metric metric-sm">${a.totalSets}</div><div class="metric-label">completed</div></div>
          </article>
          <article class="card activity-card">
            <div class="eyebrow">Volume</div>
            <div><div class="metric metric-sm">${fmt(a.totalVolume)}</div><div class="metric-label">total kg</div></div>
          </article>
          <article class="card activity-card">
            <div class="eyebrow">Average</div>
            <div><div class="metric metric-sm">${fmt(avgVolume)}</div><div class="metric-label">kg / workout</div></div>
          </article>
        </section>

        <div style="height:14px"></div>
        <section class="grid grid-2">
          <article class="card">
            <div class="section-title">Workout volume</div>
            <div class="card-title">Recent sessions</div>
            ${miniBars(a.recent)}
          </article>
          <article class="card">
            <div class="section-title">Strength</div>
            <div class="card-title">Top recorded lift</div>
            ${a.strongest ? `
              <div class="metric" style="margin-top:22px">${Number(a.strongestWeight).toLocaleString()} kg</div>
              <div class="metric-label">${esc(a.strongest)}</div>` : `
              <p class="page-copy" style="margin-top:16px">Complete a workout to record your first lift.</p>`}
            <div style="height:20px"></div>
            <div class="section-title">Progression</div>
            ${a.mostImproved && a.improvement > 0 ? `
              <div class="list-row">
                <div><div class="list-row-title">${esc(a.mostImproved)}</div><div class="list-row-meta">First saved workout → latest saved workout</div></div>
                <strong class="accent">+${Number(a.improvement).toLocaleString()} kg</strong>
              </div>` : `
              <div class="page-copy">Log the same exercise across at least two workouts to measure improvement.</div>`}
          </article>
        </section>
      </div>`;
  }

  async function loadProgress() {
    if (state.route !== 'progress') return;
    const mine = ++requestId;
    const user = await getUser();
    if (mine !== requestId || state.route !== 'progress') return;

    if (!user) {
      document.getElementById('app').innerHTML = `
        <div data-real-progress="1">
          <div class="page-head"><div class="eyebrow">Analytics</div><h1 class="page-title">Progress</h1><p class="page-copy">Sign in to see progress from your saved workouts.</p></div>
        </div>`;
      return;
    }

    const { data, error } = await supabase
      .from('completed_workouts')
      .select('workout_name, workout_state, total_volume_kg, completed_sets, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(100);

    if (mine !== requestId || state.route !== 'progress') return;
    if (error) {
      console.warn('FitTrack progress load failed:', error.message);
      return;
    }
    renderProgress(data || []);
  }

  document.addEventListener('click', (event) => {
    const nav = event.target.closest('[data-route]');
    if (!nav) return;
    if (nav.dataset.route === 'progress') setTimeout(loadProgress, 30);
    else requestId += 1;
  });
})();
