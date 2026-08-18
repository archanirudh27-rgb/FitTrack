// FitTrack authentication layer
// Uses Supabase Auth without changing the existing FitTrack screens.
(function () {
  const supabase = window.fitTrackSupabase;
  if (!supabase) return;

  const shell = document.querySelector('.app-shell');
  const profileButton = document.getElementById('profileButton');

  const style = document.createElement('style');
  style.textContent = `
    .auth-backdrop{position:fixed;inset:0;z-index:100;background:rgba(7,9,12,.94);display:flex;align-items:center;justify-content:center;padding:20px}
    .auth-card{width:min(430px,100%);background:#11151a;border:1px solid #252b33;border-radius:22px;padding:26px;box-shadow:0 24px 80px rgba(0,0,0,.45)}
    .auth-logo{width:48px;height:48px;border-radius:14px;background:#ff6a00;color:#0b0d10;display:grid;place-items:center;font-weight:900;font-size:24px;margin-bottom:18px}
    .auth-title{font-size:28px;font-weight:800;margin:0 0 7px;color:#f5f7fa}
    .auth-copy{color:#9da6b2;line-height:1.5;margin:0 0 22px}
    .auth-label{display:block;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#8f98a5;margin:14px 0 7px}
    .auth-input{width:100%;box-sizing:border-box;background:#0b0d10;border:1px solid #2a313a;color:#f5f7fa;border-radius:12px;padding:13px 14px;font:inherit;outline:none}
    .auth-input:focus{border-color:#ff6a00}
    .auth-primary{width:100%;margin-top:18px;border:0;border-radius:12px;padding:13px 16px;background:#ff6a00;color:#0b0d10;font-weight:800;cursor:pointer}
    .auth-secondary{width:100%;margin-top:10px;border:1px solid #303741;border-radius:12px;padding:12px 16px;background:transparent;color:#f5f7fa;font-weight:700;cursor:pointer}
    .auth-switch{margin-top:17px;text-align:center;color:#8f98a5;font-size:13px}.auth-switch button{border:0;background:none;color:#ff8a3d;cursor:pointer;font:inherit;font-weight:700}
    .auth-message{min-height:20px;margin-top:14px;font-size:13px;color:#ffb078;line-height:1.4}
    .account-panel{position:fixed;top:72px;right:18px;z-index:90;width:min(330px,calc(100vw - 36px));background:#11151a;border:1px solid #252b33;border-radius:16px;padding:18px;box-shadow:0 18px 50px rgba(0,0,0,.4);display:none}
    .account-panel.show{display:block}.account-email{font-size:13px;color:#9da6b2;margin:4px 0 14px;word-break:break-word}
    .account-btn{width:100%;border:1px solid #303741;background:transparent;color:#f5f7fa;border-radius:10px;padding:10px;cursor:pointer;font-weight:700}
  `;
  document.head.appendChild(style);

  function initials(nameOrEmail) {
    const text = (nameOrEmail || 'FT').trim();
    if (text.includes(' ')) return text.split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
    return text.slice(0, 2).toUpperCase();
  }

  function showAuth(message = '', mode = 'login') {
    document.getElementById('fittrackAuth')?.remove();
    const backdrop = document.createElement('div');
    backdrop.className = 'auth-backdrop';
    backdrop.id = 'fittrackAuth';
    backdrop.innerHTML = `
      <form class="auth-card" id="fittrackAuthForm">
        <div class="auth-logo">F</div>
        <h2 class="auth-title">${mode === 'signup' ? 'Create your FitTrack account' : 'Welcome back'}</h2>
        <p class="auth-copy">Your workouts, rides and progress will be saved to your personal FitTrack account.</p>
        ${mode === 'signup' ? '<label class="auth-label">Name</label><input class="auth-input" id="authName" autocomplete="name" placeholder="Your name" required />' : ''}
        <label class="auth-label">Email</label>
        <input class="auth-input" id="authEmail" type="email" autocomplete="email" placeholder="you@example.com" required />
        <label class="auth-label">Password</label>
        <input class="auth-input" id="authPassword" type="password" autocomplete="current-password" minlength="6" placeholder="At least 6 characters" required />
        <button class="auth-primary" type="submit">${mode === 'signup' ? 'Create account' : 'Sign in'}</button>
        <div class="auth-message" id="authMessage">${message}</div>
        <div class="auth-switch">${mode === 'signup' ? 'Already have an account?' : 'New to FitTrack?'} <button type="button" id="authSwitch">${mode === 'signup' ? 'Sign in' : 'Create account'}</button></div>
      </form>`;
    document.body.appendChild(backdrop);

    document.getElementById('authSwitch').addEventListener('click', () => showAuth('', mode === 'signup' ? 'login' : 'signup'));
    document.getElementById('fittrackAuthForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const msg = document.getElementById('authMessage');
      const email = document.getElementById('authEmail').value.trim();
      const password = document.getElementById('authPassword').value;
      const name = document.getElementById('authName')?.value.trim() || '';
      msg.textContent = 'Please wait…';

      let result;
      if (mode === 'signup') {
        result = await supabase.auth.signUp({ email, password, options: { data: { display_name: name } } });
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
      }

      if (result.error) {
        msg.textContent = result.error.message;
        return;
      }

      if (mode === 'signup' && !result.data.session) {
        msg.textContent = 'Account created. Check your email to confirm the account, then sign in.';
        return;
      }

      await handleSession(result.data.session);
    });
  }

  async function ensureProfile(user) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (profile) return profile;

    const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'FitTrack User';
    const { data: created, error } = await supabase.from('profiles').insert({ id: user.id, display_name: displayName }).select().single();
    if (error) {
      console.warn('FitTrack profile creation:', error.message);
      return { id: user.id, display_name: displayName };
    }
    return created;
  }

  async function handleSession(session) {
    if (!session?.user) {
      window.fitTrackUser = null;
      if (profileButton) profileButton.textContent = 'AK';
      return;
    }

    const profile = await ensureProfile(session.user);
    window.fitTrackUser = { ...session.user, profile };
    if (profileButton) profileButton.textContent = initials(profile.display_name || session.user.email);
    document.getElementById('fittrackAuth')?.remove();
    shell?.classList.remove('auth-hidden');
  }

  function showAccount() {
    document.getElementById('fittrackAccount')?.remove();
    const user = window.fitTrackUser;
    if (!user) {
      showAuth();
      return;
    }
    const panel = document.createElement('div');
    panel.id = 'fittrackAccount';
    panel.className = 'account-panel show';
    panel.innerHTML = `
      <strong>${user.profile?.display_name || 'FitTrack User'}</strong>
      <div class="account-email">${user.email || ''}</div>
      <button class="account-btn" id="fittrackLogout">Sign out</button>`;
    document.body.appendChild(panel);
    document.getElementById('fittrackLogout').addEventListener('click', async () => {
      await supabase.auth.signOut();
      panel.remove();
      window.fitTrackUser = null;
      if (profileButton) profileButton.textContent = 'AK';
      showAuth('You have been signed out.');
    });
  }

  window.fitTrackAuth = { showAuth, showAccount, handleSession };
  profileButton?.addEventListener('click', showAccount);

  supabase.auth.onAuthStateChange((_event, session) => {
    // Defer database work out of the auth callback to avoid Supabase auth lock contention.
    setTimeout(() => handleSession(session), 0);
  });

  supabase.auth.getSession().then(({ data }) => {
    if (data.session) {
      handleSession(data.session);
    }
  });
})();
