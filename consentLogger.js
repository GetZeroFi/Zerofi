// ── Consent Logger ────────────────────────────────────────────────────────────
// Records proof of user consent at signup for CCPA/GLBA compliance.
// Called immediately after successful account creation.

import { supabase, isSupabaseEnabled } from '../utils/supabase';

export const CURRENT_VERSIONS = {
  terms:     '1.0.0',
  privacy:   '1.0.0',
  beta:      '1.0.0',
  integrity: '1.0.0',
};

// Hash a string using Web Crypto — we never store raw IPs or user agents
async function hashString(str) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Record consent after successful signup
export async function recordConsent(userId, extra = {}) {
  if (!isSupabaseEnabled || !userId) return;
  try {
    const uaHash = await hashString(navigator.userAgent || 'unknown');
    const { error } = await supabase
      .from('user_consents')
      .insert({
        user_id:           userId,
        terms_version:     CURRENT_VERSIONS.terms,
        privacy_version:   CURRENT_VERSIONS.privacy,
        beta_version:      CURRENT_VERSIONS.beta,
        integrity_version: CURRENT_VERSIONS.integrity,
        consent_method:    'checkbox_signup',
        user_agent_hash:   uaHash,
        ...extra,
      });
    if (error) console.error('Consent logging error:', error);
  } catch (e) {
    console.error('Consent logger failed:', e);
  }
}

// Log a security event for SOC 2 audit trail
export async function logSecurityEvent(userId, eventType, eventData = {}) {
  if (!isSupabaseEnabled) return;
  try {
    await supabase
      .from('audit_log')
      .insert({
        user_id:    userId || null,
        event_type: eventType,
        event_data: eventData,
      });
  } catch (e) {
    // Non-blocking — audit log failure should not break the app
    console.error('Audit log error:', e);
  }
}

// Submit a CCPA data deletion request
export async function requestDataDeletion(userId) {
  if (!isSupabaseEnabled || !userId) return { error: 'Not available in local mode' };
  const { data, error } = await supabase
    .from('deletion_requests')
    .insert({ user_id: userId, method: 'in_app' })
    .select()
    .single();
  return { data, error };
}

export const AUDIT_EVENTS = {
  SIGNUP:          'auth.signup',
  SIGNIN:          'auth.signin',
  SIGNOUT:         'auth.signout',
  PASSWORD_RESET:  'auth.password_reset',
  DATA_EXPORT:     'data.export_requested',
  DATA_DELETE:     'data.delete_requested',
  BETA_CODE_USED:  'access.beta_code_used',
  FAILED_LOGIN:    'auth.failed_login',
};
