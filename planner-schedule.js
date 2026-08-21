// FitTrack Planner scheduling: weekly view + scheduling + upcoming workouts.
(function(){
  const supabase=window.fitTrackSupabase;
  const app=document.getElementById('app');
  const toast=window.fitTrackShowToast;
  if(!supabase||!app)return;
  let renderToken=0,observerBusy=false;

  async function getUser(){const{data,error}=await supabase.auth.getUser();return error?null:(data.user||null)}
  function esc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
  function iso(d){const local=new Date(d.getTime()-d.getTimezoneOffset()*60000);return local.toISOString().slice(0,10)}
  function todayISO(){return iso(new Date())}
  function prettyDate(value){const d=new Date(`${value}T00:00:00`);return d.toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'})}
  function weekDays(){const now=new Date();const day=now.getDay();const diff=(day+6)%7;const monday=new Date(now);monday.setHours(0,0,0,0);monday.setDate(now.getDate()-diff);return Array.from({length:7},(_,i)=>{const d=new Date(monday);d.setDate(monday.getDate()+i);return d})}
  function isPlannerList(){return app.querySelector('.page-title')?.textContent?.trim()==='My workouts'&&!app.querySelector('[data-template-row]')&&!!app.querySelector('[data-planner-open-library]')}

  async function enhancePlanner(){
    if(!isPlannerList()||app.querySelector('[data-fit-schedule-module]'))return;
    const token=++renderToken,user=await getUser();if(!user||token!==renderToken||!isPlannerList())return;
    const days=weekDays(),start=iso(days[0]),end=iso(days[6]);
    const [{data:templates,error:tErr},{data:planned,error:pErr}]=await Promise.all([
      supabase.from('workout_templates').select('id,name').eq('user_id',user.id).order('name'),
      supabase.from('planned_sessions').select('id,template_id,session_date,name,status').eq('user_id',user.id).gte('session_date',start).order('session_date',{ascending:true}).limit(50)
    ]);
    if(token!==renderToken||!isPlannerList()||tErr||pErr)return;
    const byDate=new Map();(planned||[]).forEach(s=>{if(!byDate.has(s.session_date))byDate.set(s.session_date,[]);byDate.get(s.session_date).push(s)});
    const upcoming=(planned||[]).filter(s=>s.session_date>=todayISO()).slice(0,20);
    const module=document.createElement('section');module.className='card';module.dataset.fitScheduleModule='true';module.style.marginBottom='14px';
    module.innerHTML=`
      <div class="meta-row"><div><div class="section-title">This week</div><div class="card-title">Training plan</div></div><div class="card-subtitle">${esc(prettyDate(start))} – ${esc(prettyDate(end))}</div></div>
      <div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:7px;margin-top:14px;overflow-x:auto">
        ${days.map(d=>{const key=iso(d),items=byDate.get(key)||[],today=key===todayISO();return `<button type="button" data-fit-day="${key}" style="min-width:76px;border:1px solid ${today?'var(--accent-border)':'rgba(255,255,255,.06)'};background:${today?'var(--accent-soft)':'var(--surface-2)'};border-radius:13px;padding:10px 7px;text-align:left;color:inherit;cursor:pointer"><div class="eyebrow" style="font-size:9px">${d.toLocaleDateString(undefined,{weekday:'short'})}</div><div style="font-size:18px;font-weight:500;margin-top:3px">${d.getDate()}</div><div class="card-subtitle" style="margin-top:7px;white-space:normal">${items.length?items.map(x=>esc(x.name)).join(' · '):(today?'Today':'Rest / open')}</div></button>`}).join('')}
      </div>
      <div style="height:18px"></div><div class="section-title">Schedule a workout</div><p class="page-copy">Choose a saved workout and date.</p>
      ${(templates||[]).length?`<div class="grid grid-2" style="margin-top:12px"><label><div class="card-subtitle">Workout</div><select id="fitScheduleTemplate" class="auth-input" style="width:100%;margin-top:6px">${templates.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select></label><label><div class="card-subtitle">Date</div><input id="fitScheduleDate" class="auth-input" type="date" min="${todayISO()}" value="${todayISO()}" style="width:100%;margin-top:6px"></label></div><button class="primary-btn full-btn" data-fit-schedule-save style="margin-top:12px">Schedule workout</button>`:`<div class="card-subtitle" style="margin-top:10px">Create a saved workout first, then schedule it here.</div>`}
      <div style="height:18px"></div><div class="section-title">Upcoming</div><div style="margin-top:8px">${upcoming.length?upcoming.map(s=>`<div class="meta-row" style="padding:11px 0;border-top:1px solid rgba(255,255,255,.07);gap:10px"><div><div class="card-title" style="font-size:15px">${esc(s.name)}</div><div class="card-subtitle">${esc(prettyDate(s.session_date))}${s.session_date===todayISO()?' · Today':''}</div></div><div style="display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end"><button class="secondary-btn" data-fit-session-load="${s.id}">${s.session_date===todayISO()?'Start / load':'Load'}</button><button class="ghost-btn" data-fit-schedule-delete="${s.id}">Remove</button></div></div>`).join(''):'<div class="card-subtitle">No upcoming workouts scheduled.</div>'}</div>`;
    const summary=Array.from(app.querySelectorAll('.card')).find(c=>c.textContent.includes('saved workout')||c.textContent.includes('My workouts'));
    if(summary?.parentNode)summary.parentNode.insertBefore(module,summary.nextSibling);else app.querySelector('.tabs')?.insertAdjacentElement('afterend',module);
  }

  async function scheduleWorkout(button){const user=await getUser();if(!user)return;const templateId=document.getElementById('fitScheduleTemplate')?.value,date=document.getElementById('fitScheduleDate')?.value;if(!templateId||!date)return toast?.('Choose a workout and date');button.disabled=true;button.textContent='Scheduling…';const{data:t}=await supabase.from('workout_templates').select('id,name').eq('id',templateId).eq('user_id',user.id).maybeSingle();if(!t){button.disabled=false;button.textContent='Schedule workout';return toast?.('Could not load workout')}const{data:dup}=await supabase.from('planned_sessions').select('id').eq('user_id',user.id).eq('template_id',templateId).eq('session_date',date).eq('status','planned').limit(1);if(dup?.length){button.disabled=false;button.textContent='Schedule workout';return toast?.('Already scheduled for that date')}const{error}=await supabase.from('planned_sessions').insert({user_id:user.id,template_id:templateId,session_date:date,name:t.name,status:'planned'});button.disabled=false;button.textContent='Schedule workout';if(error)return toast?.('Could not schedule workout');toast?.('Workout scheduled');document.querySelector('[data-fit-schedule-module]')?.remove();enhancePlanner()}
  async function removeScheduled(id){const user=await getUser();if(!user)return;const{error}=await supabase.from('planned_sessions').delete().eq('id',id).eq('user_id',user.id);if(error)return toast?.('Could not remove scheduled workout');toast?.('Scheduled workout removed');document.querySelector('[data-fit-schedule-module]')?.remove();enhancePlanner()}
  document.addEventListener('click',e=>{const day=e.target.closest('[data-fit-day]');if(day){const input=document.getElementById('fitScheduleDate');if(input)input.value=day.dataset.fitDay;return}const save=e.target.closest('[data-fit-schedule-save]');if(save){e.preventDefault();scheduleWorkout(save);return}const del=e.target.closest('[data-fit-schedule-delete]');if(del){e.preventDefault();removeScheduled(del.dataset.fitScheduleDelete);return}});
  const observer=new MutationObserver(()=>{if(observerBusy)return;observerBusy=true;setTimeout(()=>{observerBusy=false;enhancePlanner()},35)});observer.observe(app,{childList:true,subtree:true});setTimeout(enhancePlanner,100);
})();