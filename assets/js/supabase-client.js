'use strict';
// Requires: supabase CDN script + config.js loaded before this file
const { createClient } = window.supabase;
window.sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON, {
  auth: {
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: true,
  },
});
