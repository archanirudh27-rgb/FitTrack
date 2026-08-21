// FitTrack Home: today's real scheduled workout + compact quick activity starts.
(function () {
  const supabase = window.fitTrackSupabase;
  const app = document.getElementById('app');
  const state = window.fitTrackState;
  if (!supabase || !app || !state) return;

  let token = 0;
  let busy = false;

  async function getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user || null;
  }

  function todayISO() {
    const d = new Date();
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function esc(v) {
    return String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  }

  function isHome() {
    return state.route === 'home' && !!app.querySelector('.hero-card');
  }

  function injectQuickActivities() {
    if (!isHome() || app.querySelector('[data-home-quick-activities]')) return;
    const hero = app.querySelector('.hero-card');
    if (!hero) return;
    const section = document.createElement('section');
    section.className = 'card home-activity-card';
    section.dataset.homeQuickActivities = '1';
    section.innerHTML = `
      <div class="home-section-head">
        <div>
          <div class="section-title">Outdoor activity</div>
          <div class="card-title home-section-title">Start something else</div>
        </div>
        <span class="home-section-hint">GPS starts after tap</span>
      </div>
      <div class="home-quick-actions">
        <button class="home-quick-action" data-home-start-activity="walk" aria-label="Start Walk">
          <span class="home-quick-icon">W</span><span>Walk</span>
        </button>
        <button class="home-quick-action" data-home-start-activity="run" aria-label="Start Run">
          <span class="home-quick-icon">R</span><span>Run</span>
        </button>
        <button class="home-quick-action" data-home-start-activity="cycle" aria-label="Start Cycle">
          <span class="home-quick-icon">C</span><span>Cycle</span>
        </button>
      </div>`;
    hero.insertAdjacentElement('afterend', section);
  }

  async function enhanceHome() {
    if (!isHome()) return;
    const myToken = ++token;
    const user = await getUser();
    if (!user || myToken !== token || !isHome()) return;

    const { data: planned, error } = await supabase
      .from('planned_sessions')
      .select('id,template_id,session_date,name,status')
      .eq('user_id', user.id)
      .eq('session_date', todayISO())
      .eq('status', 'planned')
      .order('id', { ascending:true })
      .limit(1)
      .maybeSingle();
    if (error || myToken !== token || !isHome()) return;

    const hero = app.querySelector('.hero-card');
    if (!hero) return;

    if (!planned) {
      hero.innerHTML = `<div><div class="eyebrow">Today · Planner</div><h2 class="page-title home-hero-title">No workout scheduled</h2><p class="page-copy">Plan a workout for today, or start an outdoor activity below.</p></div><button class="primary-btn home-primary-action" data-fit-home-planner>Open Planner →</button>`;
      injectQuickActivities();
      return;
    }

    const { data: rows } = await supabase
      .from('workout_template_exercises')
      .select('planned_sets')
      .eq('template_id', planned.template_id);
    if (myToken !== token || !isHome()) return;
    const exercises = (rows || []).length;
    const sets = (rows || []).reduce((sum, row) => sum + Math.max(1, Number(row.planned_sets || 0)), 0);

    hero.innerHTML = `<div><div class="eyebrow">Today · Strength</div><h2 class="page-title home-hero-title">${esc(planned.name)}</h2><p class="page-copy">${exercises} exercise${exercises===1?'':'s'} · ${sets} planned set${sets===1?'':'s'}</p></div><button class="primary-btn home-primary-action" data-fit-session-load="${planned.id}">Start workout →</button>`;
    injectQuickActivities();
  }

  document.addEventListener('click', event => {
    const planner = event.target.closest('[data-fit-home-planner]');
    if (planner) {
      event.preventDefault();
      state.route = 'workout';
      state.activeTab = 'Planner';
      document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.route === 'workout'));
      window.fitTrackRender?.();
      window.scrollTo(0,0);
      return;
    }

    const activityButton = event.target.closest('[data-home-start-activity]');
    if (activityButton) {
      event.preventDefault();
      const type = activityButton.dataset.homeStartActivity;
      if (typeof window.fitTrackStartActivity === 'function') window.fitTrackStartActivity(type);
    }
  });

  const observer = new MutationObserver(() => {
    if (busy) return;
    busy = true;
    setTimeout(() => { busy = false; enhanceHome(); }, 35);
  });
  observer.observe(app, { childList:true, subtree:true });
  setTimeout(enhanceHome, 120);
})();
