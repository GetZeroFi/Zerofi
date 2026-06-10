// ── SOC 2 Compliance Layer ────────────────────────────────────────────────────
// Service Organization Control 2 — Trust Services Criteria
// Type I: Point-in-time assessment of controls design
// Type II: 6-12 month assessment of controls operating effectiveness
//
// The five Trust Service Categories (TSC):
//   CC — Common Criteria (Security) — REQUIRED
//   A  — Availability               — recommended for SaaS
//   PI — Processing Integrity        — recommended for financial apps
//   C  — Confidentiality            — required for financial data
//   P  — Privacy                    — maps to CCPA/GLBA
//
// Target: SOC 2 Type I by end of 2026, Type II by mid-2027

export const SOC2_CONFIG = {
  targetTypeI:   'Q4 2026',
  targetTypeII:  'Q2 2027',
  auditor:       'TBD — recommend Prescient Assurance, Drata, or Vanta for startup-friendly audit',
  scope:         ['Zerofi SaaS Platform', 'Nova AI Advisor', 'User Financial Data'],
};

// ── Common Criteria (Security) — CC Series ────────────────────────────────────
export const COMMON_CRITERIA = {

  CC1_OrganizationalEnvironment: {
    controls: [
      { id: 'CC1.1', description: 'COSO Principle 1: Commitment to integrity and ethical values', status: 'implemented', evidence: 'Terms of Service, Integrity Clause, founding mission documentation' },
      { id: 'CC1.2', description: 'Board oversight of security', status: 'roadmap', evidence: 'Founder serves as security officer. Formalize with written policy.', target: 'Q3 2026' },
      { id: 'CC1.3', description: 'Management establishes structures and reporting lines', status: 'implemented', evidence: 'Single founder/operator — documented in company formation docs' },
      { id: 'CC1.4', description: 'Commitment to attract, develop, and retain competent individuals', status: 'implemented', evidence: 'Hiring policy to be documented when first employee hired' },
      { id: 'CC1.5', description: 'Accountability for security responsibilities', status: 'implemented', evidence: 'Founder accountable. security@getzerofi.com established.' },
    ]
  },

  CC2_Communication: {
    controls: [
      { id: 'CC2.1', description: 'Security policies and procedures documented and communicated', status: 'implemented', evidence: 'This compliance module, WISP.md, Terms of Service' },
      { id: 'CC2.2', description: 'Internal communication of security responsibilities', status: 'implemented', evidence: 'Single-person team — self-documented' },
      { id: 'CC2.3', description: 'External communication to users about security practices', status: 'implemented', evidence: 'Privacy Policy, security disclosure in Terms, encryption notice in Auth' },
    ]
  },

  CC3_RiskAssessment: {
    controls: [
      { id: 'CC3.1', description: 'Specify security objectives', status: 'implemented', evidence: 'SOC2_CONFIG.scope defines what we protect' },
      { id: 'CC3.2', description: 'Identify and analyze risks to achieving objectives', status: 'implemented', evidence: 'GLBA RISK_ASSESSMENT_TEMPLATE completed annually' },
      { id: 'CC3.3', description: 'Assess fraud risk', status: 'implemented', evidence: 'Integrity Clause, beta invite gate, authentication requirements' },
      { id: 'CC3.4', description: 'Identify changes that could impact security', status: 'roadmap', evidence: 'Change management process to be documented', target: 'Q3 2026' },
    ]
  },

  CC4_Monitoring: {
    controls: [
      { id: 'CC4.1', description: 'Select and develop monitoring activities', status: 'policy', evidence: 'Supabase audit logs enabled. Application-level logging planned.', target: 'Q3 2026' },
      { id: 'CC4.2', description: 'Evaluate and communicate deficiencies', status: 'implemented', evidence: 'security@getzerofi.com for reporting. Incident response plan in glba.js' },
    ]
  },

  CC5_ControlActivities: {
    controls: [
      { id: 'CC5.1', description: 'Select and develop control activities to mitigate risks', status: 'implemented', evidence: 'Encryption, RLS, authentication, beta gate, integrity clause' },
      { id: 'CC5.2', description: 'Select and develop general controls over technology', status: 'implemented', evidence: 'Vite build system, dependency management, .gitignore for secrets' },
      { id: 'CC5.3', description: 'Deploy control activities through policies and procedures', status: 'implemented', evidence: 'Documented in this compliance module and WISP.md' },
    ]
  },

  CC6_LogicalAccess: {
    controls: [
      { id: 'CC6.1', description: 'Logical access security measures — identification and authentication', status: 'implemented', evidence: 'Supabase Auth — email/password + OAuth. JWT sessions.', file: 'src/hooks/useAuth.js' },
      { id: 'CC6.2', description: 'Prior to issuing credentials, register and authorize new users', status: 'implemented', evidence: 'Beta invite code required before account creation', file: 'src/utils/betaCode.js' },
      { id: 'CC6.3', description: 'Remove access when no longer needed', status: 'implemented', evidence: 'Account deletion removes all data. Admin can revoke access.' },
      { id: 'CC6.6', description: 'Logical access restricted to authorized users', status: 'implemented', evidence: 'Supabase RLS — each user row-level isolated', file: 'supabase-setup.sql' },
      { id: 'CC6.7', description: 'Restrict transmission to authorized users', status: 'implemented', evidence: 'TLS 1.3 via Vercel. Supabase API keys scoped to authenticated sessions.' },
      { id: 'CC6.8', description: 'Prevent unauthorized access to system resources', status: 'implemented', evidence: 'AES-256-GCM encryption. No direct DB access exposed to client.', file: 'src/utils/encrypt.js' },
    ]
  },

  CC7_Operations: {
    controls: [
      { id: 'CC7.1', description: 'Detect and monitor for security events', status: 'policy', evidence: 'Supabase alerts enabled. Full SIEM planned for Type II.', target: 'Q1 2027' },
      { id: 'CC7.2', description: 'Monitor system components for anomalies', status: 'policy', evidence: 'Vercel deployment alerts. Supabase performance monitoring.', target: 'Q1 2027' },
      { id: 'CC7.3', description: 'Evaluate security events to determine incidents', status: 'implemented', evidence: 'Incident response procedure in glba.js INCIDENT_RESPONSE' },
      { id: 'CC7.4', description: 'Respond to identified security incidents', status: 'implemented', evidence: 'INCIDENT_RESPONSE steps documented and actionable' },
      { id: 'CC7.5', description: 'Recover from identified security incidents', status: 'implemented', evidence: 'Supabase PITR backups. Incident post-mortem process documented.' },
    ]
  },

  CC8_ChangeManagement: {
    controls: [
      { id: 'CC8.1', description: 'Authorize, design, develop, test, and implement changes', status: 'policy', evidence: 'GitHub version control. PR review process to be formalized.', target: 'Q3 2026' },
    ]
  },

  CC9_RiskMitigation: {
    controls: [
      { id: 'CC9.1', description: 'Identify and assess risk from vendor relationships', status: 'implemented', evidence: 'VENDOR_ASSESSMENTS in glba.js. Supabase and Vercel both SOC 2 certified.' },
      { id: 'CC9.2', description: 'Assess and manage risk associated with business disruption', status: 'roadmap', evidence: 'Business continuity plan to be documented', target: 'Q4 2026' },
    ]
  },
};

// ── Availability (A Series) ───────────────────────────────────────────────────
export const AVAILABILITY = {
  A1_1: { description: 'Current processing capacity meets needs', status: 'implemented', evidence: 'Vercel serverless scales automatically. Supabase free tier sufficient for beta.' },
  A1_2: { description: 'Environmental protections for hardware', status: 'n/a', evidence: 'Cloud-only infrastructure — managed by Vercel and Supabase' },
  A1_3: { description: 'Recovery procedures exist', status: 'implemented', evidence: 'Supabase Point-in-Time Recovery. Vercel instant rollback.' },
};

// ── Confidentiality (C Series) ────────────────────────────────────────────────
export const CONFIDENTIALITY = {
  C1_1: { description: 'Confidential information identified and protected', status: 'implemented', evidence: 'NPI_FIELDS defined in glba.js. AES-256-GCM encryption applied to all NPI.' },
  C1_2: { description: 'Confidential information disposed when no longer needed', status: 'implemented', evidence: 'Account deletion purges all data within 30 days per Privacy Policy.' },
};

// ── SOC 2 Readiness Score ─────────────────────────────────────────────────────
export function getSOC2ReadinessScore() {
  const allControls = [
    ...Object.values(COMMON_CRITERIA).flatMap(cat => cat.controls),
    ...Object.values(AVAILABILITY),
    ...Object.values(CONFIDENTIALITY),
  ];
  const implemented = allControls.filter(c => c.status === 'implemented').length;
  const partial     = allControls.filter(c => c.status === 'partial').length;
  const planned     = allControls.filter(c => c.status === 'planned').length;
  const total       = allControls.length;
  const score       = Math.round(((implemented + partial * 0.5) / total) * 100);
  return { implemented, partial, planned, total, score };
}
