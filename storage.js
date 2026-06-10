// ── Zerofi Storage Layer ──────────────────────────────────────────────────────
// Dual-mode: Supabase (cloud, encrypted) when configured, localStorage (local) as fallback.
// To switch to cloud: set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env

import { supabase, isSupabaseEnabled } from './supabase';

export const KEYS = {
  config:     'zerofi_config_v1',
  accounts:   'zerofi_accounts_v1',
  inclog:     'zerofi_inclog_v1',
  debtlog:    'zerofi_debtlog_v1',
  transfers:  'zerofi_transfers_v1',
  stocks:     'zerofi_stocks_v1',
  savings:    'zerofi_savings_v1',
  mileage:    'zerofi_mileage_v1',
  goals:      'zerofi_goals_v1',
  deductions: 'zerofi_deductions_v1',
  onboarded:  'zerofi_onboarded_v1',
};

// ── localStorage (local fallback) ─────────────────────────────────────────────
export const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (e) { console.error('Zerofi save error:', e); return false; }
};

export const load = (key) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
  catch { return null; }
};

export const remove  = (key) => { try { localStorage.removeItem(key); } catch {} };
export const clearAll = () => { Object.values(KEYS).forEach(k => remove(k)); };

// ── Supabase cloud storage (when enabled) ─────────────────────────────────────
// Each user's data is isolated via Row Level Security — users can ONLY see their own rows.

export const cloudSave = async (userId, key, value) => {
  if (!isSupabaseEnabled || !userId) return save(key, value);
  const { error } = await supabase
    .from('user_data')
    .upsert({ user_id: userId, key, value: JSON.stringify(value), updated_at: new Date().toISOString() },
            { onConflict: 'user_id,key' });
  if (error) { console.error('Cloud save error:', error); save(key, value); }
  else save(key, value); // keep local copy as cache
};

export const cloudLoad = async (userId, key) => {
  if (!isSupabaseEnabled || !userId) return load(key);
  const { data, error } = await supabase
    .from('user_data')
    .select('value')
    .eq('user_id', userId)
    .eq('key', key)
    .single();
  if (error || !data) return load(key); // fallback to local
  try { return JSON.parse(data.value); } catch { return null; }
};

export const cloudLoadAll = async (userId) => {
  if (!isSupabaseEnabled || !userId) return null;
  const { data, error } = await supabase
    .from('user_data')
    .select('key, value')
    .eq('user_id', userId);
  if (error || !data) return null;
  const result = {};
  data.forEach(row => {
    try { result[row.key] = JSON.parse(row.value); } catch {}
  });
  return result;
};
