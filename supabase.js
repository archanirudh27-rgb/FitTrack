// FitTrack Supabase connection
// The publishable/anon key is safe for browser use. Row Level Security protects data access.
const FITTRACK_SUPABASE_URL = 'https://hzozkizaechugfaweqjl.supabase.co';
const FITTRACK_SUPABASE_KEY = 'sb_publishable_GUjwPpsrG7DhuMrQwl58nw_ZF886HYz';

window.fitTrackSupabase = window.supabase.createClient(
  FITTRACK_SUPABASE_URL,
  FITTRACK_SUPABASE_KEY
);

window.fitTrackSupabaseReady = true;
console.info('FitTrack: Supabase client initialized');
