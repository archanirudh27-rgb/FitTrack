// FitTrack Session V2 polish: exercise management, previous-performance card and fullscreen rest.
(function(){
  const state=window.fitTrackState,app=document.getElementById('app'),toast=window.fitTrackShowToast;
  if(!state||!app)return;
  let busy=false;
  const isSession=()=>state.route==='workout'&&state.activeTab==='Session'&&!!app.querySelector('.workout-shell');
  async function save(msg){if(window.fitTrackSaveDraft)await window.fitTrackSaveDraft(msg)}
  function exerciseControls(){
    if(!isSession())return;
    app.querySelectorAll('.exercise-session').forEach((card,i)=>{
      const head=card.querySelector('.exercise-session-head'); if(!head||head.querySelector('[data-session-manage]'))return;
      const wrap=document.createElement('div'); wrap.dataset.sessionManage='1'; wrap.className='session-manage';
      wrap.innerHTML=`<button class="ghost-btn" data-ex-up="${i}" aria-label="Move exercise up">↑</button><button class="ghost-btn" data-ex-down="${i}" aria-label="Move exercise down">↓</button><button class="ghost-btn danger" data-ex-remove="${i}" aria-label="Remove exercise">Remove</button>`;
      head.appendChild(wrap);
    });
  }
  function previousCards(){
    if(!isSession())return;
    app.querySelectorAll('[data-previous-performance]').forEach(n=>{
      if(n.dataset.cardReady==='1')return;n.dataset.cardReady='1';n.classList.add('session-previous-card');
      const text=n.textContent.trim();n.innerHTML=`<span class="session-prev-icon">↺</span><span><small>Previous performance</small><strong>${text.replace(/^Last time:\s*/,'')}</strong></span>`;
    });
  }
  function restOverlay(){
    const panel=app.querySelector('[data-rest-panel]');
    let overlay=document.querySelector('[data-rest-overlay]');
    if(!panel||panel.style.display==='none') {overlay?.remove();return}
    if(!overlay){overlay=document.createElement('div');overlay.dataset.restOverlay='1';overlay.className='session-rest-overlay';document.body.appendChild(overlay)}
    const title=panel.querySelector('.card-title')?.textContent||'1:30';
    overlay.innerHTML=`<div class="session-rest-modal"><div class="eyebrow">Rest time</div><div class="session-rest-time">${title}</div><div class="session-rest-ring"><span>${title}</span></div><div class="session-rest-actions"><button class="secondary-btn" data-rest-minus="15">−15 sec</button><button class="primary-btn" data-rest-add="30">+30 sec</button></div><button class="ghost-btn full-btn" data-rest-skip>Skip rest</button></div>`;
  }
  function enhance(){if(!isSession()){document.querySelector('[data-rest-overlay]')?.remove();return}exerciseControls();previousCards();restOverlay()}
  document.addEventListener('click',async e=>{
    const up=e.target.closest('[data-ex-up]'),down=e.target.closest('[data-ex-down]'),rem=e.target.closest('[data-ex-remove]');
    if(up||down||rem){e.preventDefault();const btn=up||down||rem,i=Number(btn.dataset.exUp??btn.dataset.exDown??btn.dataset.exRemove),arr=state.workout?.exercises||[];if(!arr[i])return;
      if(rem){if(arr.length<=1)return toast?.('Keep at least one exercise');const name=arr[i].name;arr.splice(i,1);window.fitTrackRender?.();await save(`${name} removed`);return}
      const j=up?i-1:i+1;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];window.fitTrackRender?.();await save('Exercise order updated');return;
    }
    const minus=e.target.closest('[data-rest-minus]');if(minus){const panel=app.querySelector('[data-rest-panel]');const add=panel?.querySelector('[data-rest-add]');if(add){add.dataset.restAdd=String(-Math.abs(Number(minus.dataset.restMinus||15)));add.click()}return}
  },true);
  const obs=new MutationObserver(()=>{if(busy)return;busy=true;requestAnimationFrame(()=>{busy=false;enhance()})});
  obs.observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:['style']});
  setInterval(()=>{if(document.querySelector('[data-rest-overlay]'))restOverlay()},500);
  setTimeout(enhance,100);
})();