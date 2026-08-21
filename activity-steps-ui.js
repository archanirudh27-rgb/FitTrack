// FitTrack activity step estimates in History.
(function(){
  const supabase=window.fitTrackSupabase;
  const state=window.fitTrackState;
  const app=document.getElementById('app');
  if(!supabase||!state||!app) return;
  let activeDetailId=null;
  let busy=false;

  async function user(){const {data}=await supabase.auth.getUser();return data?.user||null;}

  async function enhanceList(){
    const rows=[...app.querySelectorAll('[data-activity-detail]')];
    const ids=rows.map(r=>r.dataset.activityDetail).filter(Boolean);
    if(!ids.length) return;
    const u=await user(); if(!u) return;
    const {data,error}=await supabase.from('activity_sessions').select('id,activity_type,estimated_steps').eq('user_id',u.id).in('id',ids);
    if(error) return;
    const map=new Map((data||[]).map(r=>[r.id,r]));
    rows.forEach(row=>{
      if(row.dataset.stepsReady==='1') return;
      const rec=map.get(row.dataset.activityDetail);
      if(!rec||rec.activity_type==='cycle'||rec.estimated_steps==null) return;
      const meta=row.querySelector('.list-row-meta');
      if(meta) meta.textContent += ` · ${Number(rec.estimated_steps).toLocaleString()} est. steps`;
      row.dataset.stepsReady='1';
    });
  }

  async function enhanceDetail(){
    if(!activeDetailId) return;
    if(app.querySelector('[data-activity-step-card]')) return;
    const heading=[...app.querySelectorAll('.page-copy')].find(x=>x.textContent.includes('Saved outdoor activity'));
    if(!heading) return;
    const u=await user(); if(!u) return;
    const {data,error}=await supabase.from('activity_sessions').select('activity_type,estimated_steps').eq('user_id',u.id).eq('id',activeDetailId).single();
    if(error||!data||data.activity_type==='cycle'||data.estimated_steps==null) return;
    const route=[...app.querySelectorAll('.card')].find(c=>c.querySelector('.section-title')?.textContent==='GPS route');
    if(!route) return;
    const card=document.createElement('article');
    card.className='card activity-card';
    card.dataset.activityStepCard='1';
    card.style.marginTop='14px';
    card.innerHTML=`<div class="eyebrow">Estimated steps</div><div class="metric metric-sm">${Number(data.estimated_steps).toLocaleString()}</div><div class="metric-label">based on GPS distance + profile height</div>`;
    route.insertAdjacentElement('beforebegin',card);
  }

  document.addEventListener('click',e=>{
    const row=e.target.closest('[data-activity-detail]');
    if(row) activeDetailId=row.dataset.activityDetail;
    if(e.target.closest('[data-back-history]')||e.target.closest('[data-history-tab]')||e.target.closest('[data-route]')) activeDetailId=null;
  });

  const observer=new MutationObserver(()=>{
    if(busy||state.route!=='history') return;
    busy=true;
    setTimeout(async()=>{busy=false;await enhanceList();await enhanceDetail();},80);
  });
  observer.observe(app,{childList:true,subtree:true});
})();
