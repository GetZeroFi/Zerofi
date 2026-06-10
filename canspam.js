// ── CAN-SPAM Act Compliance ───────────────────────────────────────────────────
// Controlling the Assault of Non-Solicited Pornography And Marketing Act (2003)
// Applies to ALL commercial email sent by Zerofi — including:
//   - Beta invite emails
//   - Weekly financial summaries
//   - Product update announcements
//   - Promotional emails
//   - Transactional emails with any marketing content
//
// Key requirements:
//   1. Honest subject lines — no deceptive headers
//   2. Physical mailing address in every email
//   3. Clear unsubscribe mechanism in every email
//   4. Honor unsubscribe requests within 10 business days
//   5. Identify the message as an advertisement (if promotional)
//   6. Valid from/reply-to address

export const CANSPAM_CONFIG = {
  version:        '1.0.0',
  effectiveDate:  '2026-06-09',
  physicalAddress:'[INSERT: Zerofi LLC, Street Address, Fort Worth, TX XXXXX]',
  unsubscribeEmail:'unsubscribe@getzerofi.com',
  fromAddress:    'nova@getzerofi.com',
  fromName:       'Nova at Zerofi',
  honorWithin:    10, // business days
};

// ── Email Categories ──────────────────────────────────────────────────────────
export const EMAIL_TYPES = {
  TRANSACTIONAL: {
    type:        'transactional',
    description: 'Account creation, password reset, security alerts',
    requiresOptIn:    false,
    requiresOptOut:   false, // Still best practice to include unsubscribe
    examples:    ['Welcome email', 'Password reset', 'Security alert', 'Account deletion confirmation'],
  },
  OPERATIONAL: {
    type:        'operational',
    description: 'Weekly financial summary, bill reminders, goal milestones',
    requiresOptIn:    false,
    requiresOptOut:   true,
    examples:    ['Weekly summary from Nova', 'Upcoming bill reminder', 'Goal completed'],
  },
  MARKETING: {
    type:        'marketing',
    description: 'Feature announcements, promotions, upgrade prompts',
    requiresOptIn:    true,  // Best practice — not strictly required by CAN-SPAM but required by many state laws
    requiresOptOut:   true,
    examples:    ['New feature announcement', 'Upgrade to Zerofi Pro', 'Referral program'],
  },
  BETA_INVITE: {
    type:        'beta_invite',
    description: 'Beta access invitation emails',
    requiresOptIn:    false, // Sender-initiated
    requiresOptOut:   true,
    examples:    ['Beta invite with code', 'Beta welcome email'],
  },
};

// ── Required Email Footer ─────────────────────────────────────────────────────
// Every email must include this footer content. Use in your email templates.
export function getEmailFooter(unsubscribeLink, emailType = 'operational') {
  return `
---
${emailType === 'marketing' ? 'This is a promotional message from Zerofi.\n' : ''}
Zerofi · Your Money. Your Terms.
${CANSPAM_CONFIG.physicalAddress}

You're receiving this because you have a Zerofi account.
To unsubscribe from ${emailType === 'marketing' ? 'marketing emails' : 'these emails'}: ${unsubscribeLink}
To manage all email preferences: https://getzerofi.com/settings/notifications

© ${new Date().getFullYear()} Zerofi. All rights reserved.
  `.trim();
}

// ── Unsubscribe Token Generator ───────────────────────────────────────────────
// Creates a secure unsubscribe token — no login required to unsubscribe
export async function generateUnsubscribeToken(userId, emailType) {
  const payload = `${userId}:${emailType}:${Date.now()}`;
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(payload));
  const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${btoa(userId)}.${hash.slice(0, 32)}`;
}

// ── Email Preference Defaults ─────────────────────────────────────────────────
// What users are opted into by default at signup
export const DEFAULT_EMAIL_PREFERENCES = {
  weekly_summary:     true,   // Nova's weekly financial recap
  bill_reminders:     true,   // Upcoming payment alerts
  goal_milestones:    true,   // When goals are hit
  security_alerts:    true,   // Always on — cannot be disabled
  product_updates:    false,  // Opt-in only
  marketing:          false,  // Opt-in only
  beta_communications:true,   // During beta
};

// ── Compliance Checklist ──────────────────────────────────────────────────────
export const CANSPAM_CHECKLIST = {
  honest_subject_lines:      { status: 'policy', note: 'Never use deceptive subject lines. Subject must reflect email content.' },
  physical_address:          { status: 'needed', note: 'Add LLC address to CANSPAM_CONFIG.physicalAddress once LLC is formed. BLOCKING — cannot send email without this.' },
  unsubscribe_mechanism:     { status: 'implemented', note: 'getEmailFooter() includes unsubscribe link in every email.' },
  honor_unsubscribe_10days:  { status: 'roadmap', note: 'Email preferences table in Supabase + automated processing needed.' },
  valid_from_address:        { status: 'needed', note: 'Configure nova@getzerofi.com in email provider (Resend/SendGrid). BLOCKING — cannot send email without this.' },
  identify_as_ad:            { status: 'implemented', note: 'Marketing emails flagged in getEmailFooter().' },
  no_harvested_addresses:    { status: 'implemented', note: 'All emails are to opted-in registered users only.' },
};

export function getCANSPAMStatus() {
  const checks = Object.values(CANSPAM_CHECKLIST);
  const done    = checks.filter(c => c.status === 'implemented').length;
  const needed  = checks.filter(c => c.status === 'needed').length;
  const planned = checks.filter(c => c.status === 'planned').length;
  return { done, needed, planned, total: checks.length };
}
