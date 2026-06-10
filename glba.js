// ── GLBA Compliance Layer ─────────────────────────────────────────────────────
// Gramm-Leach-Bliley Act — Safeguards Rule (16 CFR Part 314)
// Required when handling nonpublic personal financial information (NPI).
//
// Key requirements we implement here:
//   1. Written Information Security Program (WISP) — documented in WISP.md
//   2. Access controls — only authenticated users see their own data (Supabase RLS)
//   3. Encryption — AES-256-GCM at rest, TLS in transit (Vercel default)
//   4. Incident response — breach detection and notification procedures
//   5. Vendor oversight — Supabase, Vercel assessed below
//   6. Annual risk assessment — template provided
//   7. Employee training — documented procedures

export const GLBA_CONFIG = {
  version:        '1.0.0',
  effectiveDate:  '2026-06-09',
  lastReviewed:   '2026-06-09',
  nextReview:     '2027-06-09',
  officer:        'Zerofi Founder / CEO',
  contactEmail:   'security@getzerofi.com',
};

// ── NPI Data Classification ────────────────────────────────────────────────────
// GLBA defines NPI as any personally identifiable financial information
// provided by a consumer to obtain a financial product or service.

export const NPI_FIELDS = [
  'account_balances',
  'income_data',
  'debt_information',
  'credit_card_data',
  'investment_holdings',
  'savings_balances',
  'tax_information',
  'expense_data',
  'financial_goals',
];

export const NON_NPI_FIELDS = [
  'user_name',         // PII but not NPI
  'email_address',     // PII but not NPI
  'theme_preference',  // non-sensitive
  'onboarding_type',   // non-sensitive
];

// ── Technical Safeguards Checklist ────────────────────────────────────────────
export const TECHNICAL_SAFEGUARDS = {
  encryption_at_rest: {
    status:      'implemented',
    method:      'AES-256-GCM via Web Crypto API',
    keyDerivation:'PBKDF2 with 100,000 iterations',
    file:        'src/utils/encrypt.js',
  },
  encryption_in_transit: {
    status:      'implemented',
    method:      'TLS 1.3 enforced by Vercel',
    hsts:        true,
  },
  access_controls: {
    status:      'implemented',
    method:      'Supabase Row Level Security + JWT authentication',
    mfa_available: true,
    file:        'supabase-setup.sql',
  },
  data_minimization: {
    status:      'implemented',
    note:        'Only user-provided data stored. No behavioral tracking.',
  },
  audit_logging: {
    status: 'roadmap',
    target:      'Q3 2026',
    note:        'Supabase audit logs + application-level event logging',
  },
};

// ── Vendor Risk Assessment ─────────────────────────────────────────────────────
export const VENDOR_ASSESSMENTS = [
  {
    vendor:       'Supabase',
    service:      'Database, Authentication, Storage',
    npi_access:   true,
    certifications:['SOC 2 Type II', 'ISO 27001'],
    dataRegion:   'US East (AWS us-east-1)',
    dpa_signed:   true,
    notes:        'Row-level security enforced. Encrypted backups. PITR enabled.',
    reviewDate:   '2026-06-09',
  },
  {
    vendor:       'Vercel',
    service:      'Application Hosting, CDN',
    npi_access:   false,
    certifications:['SOC 2 Type II'],
    dataRegion:   'US',
    dpa_signed:   true,
    notes:        'No NPI stored at CDN layer. Static assets only.',
    reviewDate:   '2026-06-09',
  },
];

// ── Incident Response Plan ────────────────────────────────────────────────────
export const INCIDENT_RESPONSE = {
  detection: [
    'Supabase anomaly alerts configured',
    'Failed authentication monitoring',
    'Unusual data access pattern alerts',
  ],
  notification_timeline: {
    internal:     'Immediate upon detection',
    affected_users:'Within 72 hours of confirmed breach',
    regulators:   'Per applicable state law (varies 30–90 days)',
  },
  contact: 'security@getzerofi.com',
  steps: [
    '1. Contain — isolate affected systems, revoke compromised credentials',
    '2. Assess — determine scope of exposure, what NPI was accessed',
    '3. Notify — internal team, then affected users, then regulators if required',
    '4. Remediate — patch vulnerability, rotate keys, audit access logs',
    '5. Document — full incident report within 30 days',
    '6. Review — update WISP and safeguards based on lessons learned',
  ],
};

// ── Annual Risk Assessment Template ───────────────────────────────────────────
export const RISK_ASSESSMENT_TEMPLATE = {
  year: new Date().getFullYear(),
  areas: [
    { area: 'Employee access controls',      risk: 'low',    control: 'Limited team, role-based access' },
    { area: 'Third-party vendor risk',        risk: 'low',    control: 'SOC 2 certified vendors only' },
    { area: 'Data encryption',               risk: 'low',    control: 'AES-256-GCM + TLS 1.3' },
    { area: 'Authentication security',        risk: 'medium', control: 'Supabase Auth + MFA available' },
    { area: 'Insider threat',                risk: 'low',    control: 'Small team, limited NPI access' },
    { area: 'Physical security',             risk: 'low',    control: 'Cloud-only, no physical systems' },
    { area: 'Incident detection',            risk: 'medium', control: 'Supabase alerts, manual review' },
    { area: 'Disaster recovery',             risk: 'medium', control: 'Supabase PITR backups' },
  ],
};

export function getGLBAStatus() {
  const implemented = Object.values(TECHNICAL_SAFEGUARDS)
    .filter(s => s.status === 'implemented').length;
  const total = Object.keys(TECHNICAL_SAFEGUARDS).length;
  return { implemented, total, pct: Math.round((implemented / total) * 100) };
}
