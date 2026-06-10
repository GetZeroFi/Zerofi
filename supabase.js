// ── Zerofi Supabase Client ────────────────────────────────────────────────────
// Set your Supabase project URL and publishable key in .env:
//   VITE_SUPABASE_URL=https://your-project.supabase.co
//   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('⚠️ Zerofi: Supabase env vars not set. Running in localStorage-only mode.');
}

export const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        autoRefreshToken:   true,
        persistSession:     true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const isSupabaseEnabled = !!supabase;
