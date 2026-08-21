// FitTrack Planner scheduling: assign saved templates to dates and show upcoming workouts.
(function () {
  const supabase = window.fitTrackSupabase;
  const app = document.getElementById('app');
  const toast = window.fitTrackShowToast;
  if (!supabase || !app) return;

  let renderToken = 0;
  let observerBusy = false;

  async function getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user || null;
  }

  function esc(value) {
    return String(value ?? '')
      .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
      .replaceAll('"','&quot;').replaceAll("'",'&#039;');
  }

  function todayISO() {
    const d = new Date();
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0,10);
  }

  function prettyDate(value) {
    if (!value) return '';
    const d = new Date(`${value}T00:00:00`);
    return d.toLocaleDateString(undefined, { weekday:'short', day:'numeric', month:'short', year:'numeric' });
  }

  function isPlannerList() {
    return !!app.querySelector('[data-planner-open-library]') &&
      app.querySelector('.page-title')?.textContent?.trim() === 'My workouts' &&
      !app.querySelector('[data-template-row]');
  }

  async function enhancePlanner() {
    if (!isPlannerList() || app.querySelector('[data-fit-schedule-module]')) return;
    const token = ++renderToken;
    const user = await getUser();
    if (!user || token !== renderToken || !isPlannerList()) return;

    const [{ data: templates, error: tErr }, { data: planned, error: pErr }] = await Promise.all([
      supabase.from('workout_templates').select('id,name').eq('user_id', user.id).order('name'),
      supabase.from('planned_sessions').select('id,template_id,session_date,name,status').eq('user_id', user.id).gte('session_date', todayISO()).order('session_date', { ascending:true }).limit(20)
    ]);
    if (token !== renderToken || !isPlannerList()) return;
    if (tErr || pErr) {
      console.warn('FitTrack planner scheduling load failed:', tErr?.message || pErr?.message);
      return;
    }

    const module = document.createElement('section');
    module.className = 'card';
    module.dataset.fitScheduleModule = 'true';
    module.style.marginBottom = '14px';
    module.innerHTML = `
      <div class="section-title">Schedule a workout</div>
      <p class="page-copy" style="margin-top:6px">Assign one of your saved workouts to a specific date.</p>
      ${(templates||[]).length ? `
        <div class="grid grid-2" style="margin-top:12px">
          <label><div class="card-subtitle">Workout</div><select id="fitScheduleTemplate" class="auth-input" style="width:100%;margin-top:6px">${templates.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select></label>
          <label><div class="card-subtitle">Date</div><input id="fitScheduleDate" class="auth-input" type="date" min="${todayISO()}" value="${todayISO()}" style="width:100%;margin-top:6px"></label>
        </div>
        <button type="button" class="primary-btn full-btn" data-fit-schedule-save style="margin-top:12px">Schedule workout</button>` : `<div class="card-subtitle" style="margin-top:10px">Create a workout template first, then schedule it here.</div>`}
      <div style="height:16px"></div>
      <div class="section-title">Upcoming</div>
      <div data-fit-upcoming-list style="margin-top:10px">
        ${(planned||[]).length ? planned.map(s=>`
          <div class="meta-row" style="padding:10px 0;border-top:1px solid rgba(255,255,255,.08)">
            <div><div class="card-title" style="font-size:15px">${esc(s.name)}</div><div class="card-subtitle">${esc(prettyDate(s.session_date))}</div></div>
            <button type="button" class="ghost-btn" data-fit-schedule-delete="${s.id}">Remove</button>
          </div>`).join('') : `<div class="card-subtitle">No upcoming workouts scheduled yet.</div>`}
      </div>`;

    const savedCard = Array.from(app.querySelectorAll('.card')).find(card => card.textContent.includes('Saved templates'));
    if (savedCard?.parentNode) savedCard.parentNode.insertBefore(module, savedCard.nextSibling);
  }

  async function scheduleWorkout(button) {
    const user = await getUser();
    if (!user) return;
    const templateId = document.getElementById('fitScheduleTemplate')?.value;
    const date = document.getElementById('fitScheduleDate')?.value;
    if (!templateId || !date) { toast?.('Choose a workout and date'); return; }

    button.disabled = true; button.textContent = 'Scheduling…';
    const { data: template, error: tErr } = await supabase.from('workout_templates').select('id,name').eq('id',templateId).eq('user_id',user.id).maybeSingle();
    if (tErr || !template) {
      button.disabled = false; button.textContent = 'Schedule workout'; toast?.('Could not load workout'); return;
    }

    const { data: duplicate } = await supabase.from('planned_sessions').select('id').eq('user_id',user.id).eq('template_id',templateId).eq('session_date',date).eq('status','planned').limit(1);
    if (duplicate?.length) {
      button.disabled = false; button.textContent = 'Schedule workout'; toast?.('This workout is already scheduled for that date'); return;
    }

    const { error } = await supabase.from('planned_sessions').insert({
      user_id: user.id,
      template_id: templateId,
      session_date: date,
      name: template.name,
      status: 'planned'
    });
    button.disabled = false; button.textContent = 'Schedule workout';
    if (error) { console.warn('FitTrack schedule save failed:', error.message); toast?.('Could not schedule workout'); return; }
    toast?.('Workout scheduled');
    document.querySelector('[data-fit-schedule-module]')?.remove();
    enhancePlanner();
  }

  async function removeScheduled(id) {
    const user = await getUser(); if (!user) return;
    const { error } = await supabase.from('planned_sessions').delete().eq('id',id).eq('user_id',user.id);
    if (error) { toast?.('Could not remove scheduled workout'); return; }
    toast?.('Scheduled workout removed');
    document.querySelector('[data-fit-schedule-module]')?.remove();
    enhancePlanner();
  }

  document.addEventListener('click', event => {
    const save = event.target.closest('[data-fit-schedule-save]');
    if (save) { event.preventDefault(); scheduleWorkout(save); return; }
    const del = event.target.closest('[data-fit-schedule-delete]');
    if (del) { event.preventDefault(); removeScheduled(del.dataset.fitScheduleDelete); return; }
  });

  const observer = new MutationObserver(() => {
    if (observerBusy) return;
    observerBusy = true;
    setTimeout(() => { observerBusy = false; enhancePlanner(); }, 30);
  });
  observer.observe(app, { childList:true, subtree:true });
  setTimeout(enhancePlanner, 100);
})();
