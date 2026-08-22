// FitTrack multi-user account + onboarding layer.
(function () {
  const client = window.fitTrackSupabase;
  const profileButton = document.getElementById('profileButton');
  const app = document.getElementById('app');
  if (!client || !profileButton || !app) return;

  const style = document.createElement('style');
  style.textContent = `
    .auth-backdrop{position:fixed;inset:0;z-index:1000;background:rgba(7,9,12,.97);display:flex;align-items:center;justify-content:center;padding:20px}
    .auth-card{width:min(460px,100%);max-height:92vh;overflow:auto;background:#11151a;border:1px solid #252b33;border-radius:22px;padding:26px;box-shadow:0 24px 80px rgba(0,0,0,.45)}
    .auth-logo{width:48px;height:48px;border-radius:14px;background:var(--accent,#c8753d);color:#0b0d10;display:grid;place-items:center;font-weight:900;font-size:24px;margin-bottom:18px}
    .auth-title{font-size:28px;font-weight:700;margin:0 0 7px;color:#f5f7fa}.auth-copy{color:#9da6b2;line-height:1.5;margin:0 0 22px}
    .auth-label{display:block;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#8f98a5;margin:14px 0 7px}
    .auth-input{width:100%;box-sizing:border-box;background:#0b0d10;border:1px solid #2a313a;color:#f5f7fa;border-radius:12px;padding:13px 14px;outline:none}
    .auth-primary{width:100%;margin-top:18px;border:0;border-radius:12px;padding:13px 16px;background:var(--accent,#c8753d);color:#0b0d10;font-weight:800;cursor:pointer}
    .auth-switch{margin-top:17px;text-align:center;color:#8f98a5;font-size:13px}.auth-switch button{border:0;background:none;color:var(--accent,#c8753d);cursor:pointer;font:inherit;font-weight:700}
    .auth-message{min-height:20px;margin-top:14px;font-size:13px;color:#ffb078;line-height:1.4}.auth-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .account-panel{position:fixed;top:72px;right:18px;z-index:900;width:min(350px,calc(100vw - 36px));background:#11151a;border:1px solid #252b33;border-radius:16px;padding:18px;box-shadow:0 18px 50px rgba(0,0,0,.4)}
    .account-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.account-panel-close{border:0;background:transparent;color:#9da6b2;font-size:24px;line-height:1;cursor:pointer;padding:2px 4px;border-radius:8px}.account-panel-close:hover{background:#1a2027;color:#fff}
    .account-email{font-size:13px;color:#9da6b2;margin:4px 0 14px;word-break:break-word}.account-btn{width:100%;border:1px solid #303741;background:transparent;color:#f5f7fa;border-radius:10px;padding:10px;cursor:pointer;font-weight:700}.account-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.account-meta div{background:#171b20;border-radius:10px;padding:9px}.account-meta span{display:block;font-size:10px;color:#8f98a5;text-transform:uppercase}.account-meta b{font-size:13px;font-weight:500}
    @media(max-width:520px){.auth-grid{grid-template-columns:1fr}.account-panel{top:64px;right:10px;width:calc(100vw - 20px);box-sizing:border-box}}
  `;
  document.head.appendChild(style);

  function initials(text){ const t=(text||'FT').trim(); return t.includes(' ')?t.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase():t.slice(0,2).toUpperCase(); }
  function setLoggedOutIcon(){ profileButton.innerHTML='<span aria-hidden="true" style="font-size:20px;line-height:1">♙</span>'; }
  function resetPersonalState(){
    const s=window.fitTrackState;
    if(s){s.workout={name:'My Workout',exercises:[]};s.rides=[];s.workoutHistory=[];s.route='home';s.activeTab='Session';}
    sessionStorage.removeItem('fittrackWorkoutStartedAt');
  }
  function closeAccount(){document.getElementById('fittrackAccount')?.remove();profileButton.setAttribute('aria-expanded','false');}

  function showAuth(mode='login', message=''){
    closeAccount();document.getElementById('fittrackAuth')?.remove();
    const el=document.createElement('div');el.id='fittrackAuth';el.className='auth-backdrop';
    el.innerHTML=`<form class="auth-card" id="fittrackAuthForm"><div class="auth-logo">F</div><h2 class="auth-title">${mode==='signup'?'Create your FitTrack account':'Welcome to FitTrack'}</h2><p class="auth-copy">${mode==='signup'?'Your workouts, history and activities stay private to your account.':'Sign in to open your personal fitness tracker.'}</p>${mode==='signup'?'<label class="auth-label">Name</label><input class="auth-input" id="authName" required autocomplete="name" placeholder="Your name">':''}<label class="auth-label">Email</label><input class="auth-input" id="authEmail" type="email" required autocomplete="email" placeholder="you@example.com"><label class="auth-label">Password</label><input class="auth-input" id="authPassword" type="password" minlength="6" required autocomplete="current-password" placeholder="At least 6 characters"><button class="auth-primary" type="submit">${mode==='signup'?'Create account':'Sign in'}</button><div class="auth-message" id="authMessage">${message}</div><div class="auth-switch">${mode==='signup'?'Already have an account?':'New to FitTrack?'} <button type="button" id="authSwitch">${mode==='signup'?'Sign in':'Create account'}</button></div></form>`;
    document.body.appendChild(el);
    document.getElementById('authSwitch').onclick=()=>showAuth(mode==='signup'?'login':'signup');
    document.getElementById('fittrackAuthForm').onsubmit=async(e)=>{
      e.preventDefault();const msg=document.getElementById('authMessage');msg.textContent='Please wait…';
      const email=document.getElementById('authEmail').value.trim(),password=document.getElementById('authPassword').value;
      const name=document.getElementById('authName')?.value.trim()||'';
      const result=mode==='signup'?await client.auth.signUp({email,password,options:{data:{display_name:name}}}):await client.auth.signInWithPassword({email,password});
      if(result.error){msg.textContent=result.error.message;return;}
      if(mode==='signup'&&!result.data.session){msg.textContent='Account created. Confirm your email, then sign in.';return;}
      document.getElementById('fittrackAuth')?.remove();await applySession(result.data.session,true);
    };
  }

  async function loadProfile(user){
    let profile=null;
    try{const{data}=await client.from('profiles').select('*').eq('id',user.id).maybeSingle();profile=data||null;}catch(e){console.warn('Profile load skipped',e)}
    return profile;
  }

  async function applySession(session, allowOnboarding=false){
    if(!session?.user){window.fitTrackUser=null;setLoggedOutIcon();resetPersonalState();showAuth('login');return;}
    const profile=await loadProfile(session.user);
    const meta=session.user.user_metadata||{};
    const displayName=profile?.display_name||meta.display_name||session.user.email?.split('@')[0]||'FitTrack User';
    window.fitTrackUser={...session.user,display_name:displayName,profile};
    profileButton.textContent=initials(displayName);profileButton.setAttribute('aria-expanded','false');
    try{if(!profile)await client.from('profiles').upsert({id:session.user.id,display_name:displayName});}catch(e){console.warn('Profile create skipped',e)}
    const onboardingDone=Boolean(meta.fittrack_onboarded || (profile?.height_cm&&profile?.weight_kg));
    if(!onboardingDone&&allowOnboarding!==false)showOnboarding();
    window.dispatchEvent(new CustomEvent('fittrack:user-ready',{detail:{user:window.fitTrackUser}}));
    if(window.fitTrackLoadDraft)window.fitTrackLoadDraft();
    if(window.fitTrackRender)window.fitTrackRender();
  }

  function showOnboarding(){
    closeAccount();document.getElementById('fittrackOnboarding')?.remove();
    const u=window.fitTrackUser;if(!u)return;
    const current=u.profile||{},meta=u.user_metadata||{};
    const el=document.createElement('div');el.id='fittrackOnboarding';el.className='auth-backdrop';
    el.innerHTML=`<form class="auth-card" id="fittrackOnboardingForm"><div class="auth-logo">F</div><h2 class="auth-title">Make FitTrack yours</h2><p class="auth-copy">A few basics help personalise your dashboard and activity estimates. You can change these later.</p><label class="auth-label">Name</label><input class="auth-input" id="onboardName" required value="${String(u.display_name||'').replaceAll('"','&quot;')}"><div class="auth-grid"><label><span class="auth-label">Height (cm)</span><input class="auth-input" id="onboardHeight" type="number" min="120" max="230" value="${current.height_cm||''}" placeholder="170"></label><label><span class="auth-label">Weight (kg)</span><input class="auth-input" id="onboardWeight" type="number" step="0.1" min="30" max="300" value="${current.weight_kg||''}" placeholder="70"></label></div><div class="auth-grid"><label><span class="auth-label">Goal</span><select class="auth-input" id="onboardGoal"><option value="general">General fitness</option><option value="strength">Strength</option><option value="muscle">Build muscle</option><option value="fat-loss">Fat loss</option><option value="endurance">Endurance</option></select></label><label><span class="auth-label">Units</span><select class="auth-input" id="onboardUnits"><option value="metric">Metric (kg / km)</option><option value="imperial">Imperial</option></select></label></div><button class="auth-primary" type="submit">Continue to FitTrack</button><div class="auth-message" id="onboardMessage"></div></form>`;
    document.body.appendChild(el);
    if(meta.training_goal)document.getElementById('onboardGoal').value=meta.training_goal;if(meta.units)document.getElementById('onboardUnits').value=meta.units;
    document.getElementById('fittrackOnboardingForm').onsubmit=async(e)=>{
      e.preventDefault();const msg=document.getElementById('onboardMessage');msg.textContent='Saving…';
      const display_name=document.getElementById('onboardName').value.trim(),height_cm=Number(document.getElementById('onboardHeight').value)||null,weight_kg=Number(document.getElementById('onboardWeight').value)||null,training_goal=document.getElementById('onboardGoal').value,units=document.getElementById('onboardUnits').value;
      const profilePayload={id:u.id,display_name};if(height_cm)profilePayload.height_cm=height_cm;if(weight_kg)profilePayload.weight_kg=weight_kg;
      const [{error:pErr},{error:mErr}]=await Promise.all([client.from('profiles').upsert(profilePayload),client.auth.updateUser({data:{display_name,training_goal,units,fittrack_onboarded:true}})]);
      if(pErr||mErr){msg.textContent=(pErr||mErr).message||'Could not save profile';return;}
      document.getElementById('fittrackOnboarding')?.remove();const{data}=await client.auth.getSession();await applySession(data.session,false);
    };
  }

  function showAccount(){
    const existing=document.getElementById('fittrackAccount');
    if(existing){closeAccount();return;}
    if(!window.fitTrackUser){showAuth('login');return;}
    const u=window.fitTrackUser,p=u.profile||{},m=u.user_metadata||{};
    const panel=document.createElement('div');panel.id='fittrackAccount';panel.className='account-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Account menu');
    panel.innerHTML=`<div class="account-panel-head"><div><strong>${u.display_name||'FitTrack User'}</strong><div class="account-email">${u.email||''}</div></div><button class="account-panel-close" id="fittrackAccountClose" aria-label="Close account menu">×</button></div><div class="account-meta"><div><span>Weight</span><b>${p.weight_kg?`${Number(p.weight_kg).toFixed(1)} kg`:'Not set'}</b></div><div><span>Goal</span><b>${String(m.training_goal||'General').replace('-',' ')}</b></div></div><button class="account-btn" id="fittrackEditProfile" style="margin-bottom:8px">Edit profile</button><button class="account-btn" id="fittrackLogout">Sign out</button>`;
    document.body.appendChild(panel);profileButton.setAttribute('aria-expanded','true');
    document.getElementById('fittrackAccountClose').onclick=closeAccount;
    document.getElementById('fittrackEditProfile').onclick=()=>{closeAccount();showOnboarding();};
    document.getElementById('fittrackLogout').onclick=async()=>{await client.auth.signOut();closeAccount();window.fitTrackUser=null;resetPersonalState();setLoggedOutIcon();showAuth('login');};
  }

  profileButton.setAttribute('aria-haspopup','dialog');profileButton.setAttribute('aria-expanded','false');
  profileButton.onclick=(e)=>{e.stopPropagation();showAccount();};setLoggedOutIcon();
  document.addEventListener('click',e=>{const panel=document.getElementById('fittrackAccount');if(panel&&!panel.contains(e.target)&&e.target!==profileButton)closeAccount();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAccount();});
  window.addEventListener('resize',()=>{if(window.innerWidth<360)closeAccount();});
  client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT')applySession(null);else if(event==='SIGNED_IN'&&session)applySession(session,true);});
  setTimeout(async()=>{try{const{data}=await client.auth.getSession();if(data?.session)await applySession(data.session,true);else showAuth('login');}catch(e){showAuth('login','Could not restore your session. Please sign in.');}},0);
})();