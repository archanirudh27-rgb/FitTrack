// FitTrack Supabase connection
// The publishable key is intended for browser use. Row Level Security protects user data.
const FITTRACK_SUPABASE_URL = 'https://hzozkizaechugfaweqjl.supabase.co';
const FITTRACK_SUPABASE_KEY = 'sb_publishable_GUjwPpsrG7DhuMrQwl58nw_ZF886HYz';

window.fitTrackSupabase = window.supabase.createClient(
  FITTRACK_SUPABASE_URL,
  FITTRACK_SUPABASE_KEY
);

window.fitTrackSupabaseReady = false;
window.fitTrackSupabaseError = null;

// A lightweight connection check. It does not require a logged-in user
// and does not read any personal workout data.
window.fitTrackSupabase.auth.getSession()
  .then(({ error }) => {
    if (error) throw error;
    window.fitTrackSupabaseReady = true;
    console.info('FitTrack: Supabase connection verified');
    window.dispatchEvent(new CustomEvent('fittrack:supabase-ready'));
  })
  .catch((error) => {
    window.fitTrackSupabaseError = error;
    console.error('FitTrack: Supabase connection failed', error);
    window.dispatchEvent(new CustomEvent('fittrack:supabase-error', { detail: error }));
  });
