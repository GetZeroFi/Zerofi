// ── CCPA / CPRA Compliance Layer ──────────────────────────────────────────────
// California Consumer Privacy Act + California Privacy Rights Act
// Applies when you have California users — which you will.
//
// Key rights we must support:
//   1. Right to Know — what data we collect and why
//   2. Right to Delete — users can request full data deletion
//   3. Right to Correct — users can correct inaccurate data
//   4. Right to Opt-Out — of sale of personal information (we don't sell — easy)
//   5. Right to Non-Discrimination — can't penalize for exercising rights
//   6. Right to Limit Use of Sensitive Personal Information

export const CCPA_CONFIG = {
  version:        '1.0.0',
  effectiveDate:  '2026-06-09',
  lastUpdated:    '2026-06-09',
  doNotSell:      true,   // We never sell data — this is always true
  sensitiveDataLimitation: true,
};

// ── Data Inventory (required by CCPA) ────────────────────────────────────────
// Every category of personal information collected, with purpose and retention.

export const DATA_INVENTORY = [
  {
    category:      'Identifiers',
    examples:      ['Name', 'Email address', 'Account ID'],
    purpose:       ['Account creation', 'Authentication', 'Service delivery'],
    retention:     'Duration of account + 30 days after deletion request',
    thirdParties:  ['Supabase (auth/storage)'],
    sold:          false,
    shared:        false,
  },
  {
    category:      'Financial Information (Sensitive)',
    examples:      ['Account balances', 'Income', 'Debt amounts', 'Expenses', 'Tax data'],
    purpose:       ['Providing financial dashboard and Nova recommendations'],
    retention:     'Duration of account + 30 days after deletion request',
    thirdParties:  ['Supabase (encrypted storage)'],
    sold:          false,
    shared:        false,
    sensitive:     true,
    note:          'Encrypted AES-256-GCM before storage — Supabase cannot read content',
  },
  {
    category:      'Usage Data',
    examples:      ['Features used', 'Error logs', 'Session duration'],
    purpose:       ['Service improvement', 'Bug fixing'],
    retention:     '90 days',
    thirdParties:  ['Vercel (hosting logs)'],
    sold:          false,
    shared:        false,
  },
];

// ── Consumer Rights Request Handler ───────────────────────────────────────────
// These functions define HOW we respond to CCPA rights requests.
// Actual implementation hooks into Supabase admin API.

export const RIGHTS_REQUEST_PROCEDURES = {
  right_to_know: {
    description:   'User requests to know what personal information we have collected',
    responseTime:  '45 days (extendable to 90 days with notice)',
    method:        'Email to privacy@getzerofi.com or in-app request',
    verification:  'Must verify identity via authenticated session or email confirmation',
    deliverable:   'Exportable JSON of all user data from Supabase',
  },
  right_to_delete: {
    description:   'User requests deletion of all personal information',
    responseTime:  '45 days',
    method:        'Settings > Account > Delete Account (in-app) or email request',
    verification:  'Authenticated session required',
    process: [
      '1. User submits deletion request',
      '2. System marks account for deletion',
      '3. All user_data rows deleted from Supabase',
      '4. Auth account deleted from Supabase Auth',
      '5. localStorage cleared on user device',
      '6. Confirmation email sent within 24 hours',
      '7. Backup purge completes within 30 days',
    ],
  },
  right_to_correct: {
    description:   'User requests correction of inaccurate personal information',
    responseTime:  '45 days',
    method:        'In-app editing (all financial data is user-editable) or email request',
    note:          'Most data is self-edited by design — users control all inputs',
  },
  right_to_opt_out: {
    description:   'User opts out of sale of personal information',
    note:          'Zerofi does not sell personal information. This right is automatically satisfied.',
    doNotSellLink: 'Included in Privacy Policy and footer of all pages',
  },
  right_to_limit_sensitive: {
    description:   'User limits use of sensitive personal information',
    scope:         'Financial data used only for providing the Service — no advertising, no profiling',
    note:          'Already limited by design. No additional action needed.',
  },
};

// ── Privacy Notice Requirements ───────────────────────────────────────────────
export const PRIVACY_NOTICE_CHECKLIST = {
  categories_collected:      true, // in Privacy Policy
  purposes:                  true, // in Privacy Policy
  third_parties:             true, // in Privacy Policy
  consumer_rights:           true, // in Privacy Policy
  do_not_sell_link:          true, // in footer
  contact_info:              true, // privacy@getzerofi.com
  effective_date:            true, // in Privacy Policy
  last_updated:              true, // in Privacy Policy
};

// ── Consent Management ────────────────────────────────────────────────────────
export const CONSENT_RECORDS = {
  // When a user signs up, we record:
  fields_to_capture: [
    'user_id',
    'timestamp',
    'ip_address_hash',  // hashed, not stored raw
    'terms_version',
    'privacy_version',
    'beta_agreement_version',
    'integrity_clause_version',
    'consent_method',   // 'checkbox_signup'
  ],
  storage:  'Supabase user_consents table',
  retention:'Indefinite (legal requirement to prove consent)',
};

export function getCCPAStatus() {
  const checks = Object.values(PRIVACY_NOTICE_CHECKLIST);
  const passing = checks.filter(Boolean).length;
  return { passing, total: checks.length, pct: Math.round((passing / checks.length) * 100) };
}
