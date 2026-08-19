// FitTrack account layer. Kept deliberately isolated from app navigation/rendering.
(function () {
  const client = window.fitTrackSupabase;
  const profileButton = document.getElementById('profileButton');
  if (!client || !profileButton) return;

  const style = document.createElement('style');
  style.textContent = `
    .auth-backdrop{position:fixed;inset:0;z-index:100;background:rgba(7,9,12,.94);display:flex;align-items:center;justify-content:center;padding:20px}
    .auth-card{width:min(430px,100%);background:#11151a;border:1px solid #252b33;border-radius:22px;padding:26px;box-shadow:0 24px 80px rgba(0,0,0,.45)}
    .auth-logo{width:48px;height:48px;border-radius:14px;background:#ff6a00;color:#0b0d10;display:grid;place-items:center;font-weight:900;font-size:24px;margin-bottom:18px}
    .auth-title{font-size:28px;font-weight:800;margin:0 0 7px;color:#f5f7fa}.auth-copy{color:#9da6b2;line-height:1.5;margin:0 0 22px}
    .auth-label{display:block;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#8f98a5;margin:14px 0 7px}
    .auth-input{width:100%;box-sizing:border-box;background:#0b0d10;border:1px solid #2a313a;color:#f5f7fa;border-radius:12px;padding:13px 14px;outline:none}
    .auth-primary{width:100%;margin-top:18px;border:0;border-radius:12px;padding:13px 16px;background:#ff6a00;color:#0b0d10;font-weight:800;cursor:pointer}
    .auth-switch{margin-top:17px;text-align:center;color:#8f98a5;font-size:13px}.auth-switch button{border:0;background:none;color:#ff8a3d;cursor:pointer;font:inherit;font-weight:700}
    .auth-message{min-height:20px;margin-top:14px;font-size:13px;color:#ffb078;line-height:1.4}
    .account-panel{position:fixed;top:72px;right:18px;z-index:90;width:min(330px,calc(100vw - 36px));background:#11151a;border:1px solid #252b33;border-radius:16px;padding:18px;box-shadow:0 18px 50px rgba(0,0,0,.4)}
    .account-email{font-size:13px;color:#9da6b2;margin:4px 0 14px;word-break:break-word}.account-btn{width:100%;border:1px solid #303741;background:transparent;color:#f5f7fa;border-radius:10px;padding:10px;cursor:pointer;font-weight:700}
  `;
  document.head.appendChild(style);

  function setLoggedOutIcon(){ profileButton.innerHTML = '<span aria-hidden="true" style="font-size:20px;line-height:1">♙</span>'; }
  function initials(text){ const t=(text||'FT').trim(); return t.includes(' ')?t.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase():t.slice(0,2).toUpperCase(); }

  function showAuth(mode='login', message=''){
    document.getElementById('fittrackAuth')?.remove();
    const el=document.createElement('div'); el.id='fittrackAuth'; el.className='auth-backdrop';
    el.innerHTML=`<form class="auth-card" id="fittrackAuthForm"><div class="auth-logo">F</div><h2 class="auth-title">${mode==='signup'?'Create your FitTrack account':'Welcome back'}</h2><p class="auth-copy">Sign in to keep your FitTrack data tied to your account.</p>${mode==='signup'?'<label class="auth-label">Name</label><input class="auth-input" id="authName" required autocomplete="name" placeholder="Your name">':''}<label class="auth-label">Email</label><input class="auth-input" id="authEmail" type="email" required autocomplete="email" placeholder="you@example.com"><label class="auth-label">Password</label><input class="auth-input" id="authPassword" type="password" minlength="6" required autocomplete="current-password" placeholder="At least 6 characters"><button class="auth-primary" type="submit">${mode==='signup'?'Create account':'Sign in'}</button><div class="auth-message" id="authMessage">${message}</div><div class="auth-switch">${mode==='signup'?'Already have an account?':'New to FitTrack?'} <button type="button" id="authSwitch">${mode==='signup'?'Sign in':'Create account'}</button></div></form>`;
    document.body.appendChild(el);
    document.getElementById('authSwitch').onclick=()=>showAuth(mode==='signup'?'login':'signup');
    document.getElementById('fittrackAuthForm').onsubmit=async(e)=>{
      e.preventDefault(); const msg=document.getElementById('authMessage'); msg.textContent='Please wait…';
      const email=document.getElementById('authEmail').value.trim(), password=document.getElementById('authPassword').value;
      const result=mode==='signup'?await client.auth.signUp({email,password,options:{data:{display_name:document.getElementById('authName')?.value.trim()||''}}}):await client.auth.signInWithPassword({email,password});
      if(result.error){msg.textContent=result.error.message;return;}
      if(mode==='signup'&&!result.data.session){msg.textContent='Account created. Check your email to confirm it, then sign in.';return;}
      document.getElementById('fittrackAuth')?.remove(); await applySession(result.data.session);
    };
  }

  async function applySession(session){
    if(!session?.user){ window.fitTrackUser=null; setLoggedOutIcon(); return; }
    let displayName=session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'FitTrack User';
    try{
      const {data}=await client.from('profiles').select('display_name').eq('id',session.user.id).maybeSingle();
      if(data?.display_name) displayName=data.display_name;
      else await client.from('profiles').upsert({id:session.user.id,display_name:displayName});
    }catch(err){ console.warn('FitTrack profile load skipped:',err); }
    window.fitTrackUser={...session.user,display_name:displayName}; profileButton.textContent=initials(displayName);
  }

  function showAccount(){
    document.getElementById('fittrackAccount')?.remove();
    if(!window.fitTrackUser){ showAuth('login'); return; }
    const p=document.createElement('div'); p.id='fittrackAccount'; p.className='account-panel';
    p.innerHTML=`<strong>${window.fitTrackUser.display_name||'FitTrack User'}</strong><div class="account-email">${window.fitTrackUser.email||''}</div><button class="account-btn" id="fittrackLogout">Sign out</button>`;
    document.body.appendChild(p); document.getElementById('fittrackLogout').onclick=async()=>{await client.auth.signOut();p.remove();window.fitTrackUser=null;setLoggedOutIcon();};
  }

  profileButton.onclick=showAccount;
  setLoggedOutIcon();
  setTimeout(async()=>{ try{ const {data}=await client.auth.getSession(); if(data?.session) await applySession(data.session); }catch(err){ console.warn('FitTrack session restore skipped:',err); } },0);
})();
