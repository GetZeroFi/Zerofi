// ── Multi-State Privacy Law Compliance ───────────────────────────────────────
// As of June 2026, 20 states have active comprehensive privacy laws.
// Strategy: build to CPRA (California) as the strictest baseline.
// A CPRA-compliant program satisfies obligations under all other state laws.
//
// States with active laws (2026):
//   California (CPRA), Virginia (VCDPA), Colorado (CPA), Connecticut (CTDPA),
//   Utah (UCPA), Iowa, Indiana, Tennessee, Texas (TDPSA), Montana, Oregon,
//   Delaware, New Hampshire, New Jersey, Nebraska, Kentucky, Maryland,
//   Minnesota, Rhode Island, Florida (limited scope)

export const MULTI_STATE_CONFIG = {
  strategy:       'CPRA-baseline',
  texasSpecific:  true,  // We are a Texas company — TDPSA applies directly
  lastReviewed:   '2026-06-09',
  nextReview:     '2026-12-09', // Review every 6 months — laws change fast
};

// ── Consumer Rights Matrix ────────────────────────────────────────────────────
// How each right is satisfied across all 20 state laws
export const CONSUMER_RIGHTS = {
  right_to_know: {
    description:   'Know what personal data is collected and how it is used',
    howSatisfied:  'Privacy Policy data inventory. In-app data export (planned).',
    cpra:  true, vcdpa: true, tdpsa: true, allOthers: true,
    status: 'implemented',
  },
  right_to_delete: {
    description:   'Request deletion of personal data',
    howSatisfied:  'Account deletion in Settings. deletion_requests table in Supabase.',
    cpra:  true, vcdpa: true, tdpsa: true, allOthers: true,
    status: 'implemented',
  },
  right_to_correct: {
    description:   'Correct inaccurate personal data',
    howSatisfied:  'All financial data is user-editable by design. Email request for account data.',
    cpra:  true, vcdpa: true, tdpsa: true, allOthers: true,
    status: 'implemented',
  },
  right_to_portability: {
    description:   'Receive data in portable format',
    howSatisfied:  'JSON data export endpoint (planned Q3 2026).',
    cpra:  true, vcdpa: true, tdpsa: true, allOthers: false,
    status: 'roadmap',
    target: 'Q3 2026',
  },
  right_to_opt_out_sale: {
    description:   'Opt out of sale of personal data',
    howSatisfied:  'Zerofi does not sell data. Right automatically satisfied. Do Not Sell link in footer.',
    cpra:  true, vcdpa: true, tdpsa: true, allOthers: true,
    status: 'implemented',
  },
  right_to_opt_out_profiling: {
    description:   'Opt out of automated profiling for consequential decisions',
    howSatisfied:  'Nova provides general financial coaching — not consequential automated decisions (credit, employment, housing). Low risk. Disclosure in Privacy Policy.',
    cpra:  true, vcdpa: true, tdpsa: false, allOthers: false,
    status: 'implemented',
  },
  right_to_limit_sensitive: {
    description:   'Limit use of sensitive personal information',
    howSatisfied:  'Financial data used only for service delivery. No advertising, no profiling for third parties.',
    cpra:  true, vcdpa: false, tdpsa: false, allOthers: false,
    status: 'implemented',
  },
  right_to_non_discrimination: {
    description:   'Not be discriminated against for exercising privacy rights',
    howSatisfied:  'Policy commitment in Terms of Service. No differential treatment for rights requests.',
    cpra:  true, vcdpa: true, tdpsa: true, allOthers: true,
    status: 'implemented',
  },
};

// ── Texas TDPSA Specific Requirements ────────────────────────────────────────
// Texas Data Privacy and Security Act — directly applies as a Texas company
export const TDPSA_REQUIREMENTS = {
  privacy_notice:          { status: 'implemented', note: 'Privacy Policy covers all required disclosures' },
  consumer_rights:         { status: 'implemented', note: 'All applicable rights implemented above' },
  data_protection_assessment:{ status: 'roadmap',  note: 'Required for processing sensitive data. Financial data qualifies. Target: Q3 2026', target: 'Q3 2026' },
  no_sale_without_consent: { status: 'implemented', note: 'We do not sell data' },
  sensitive_data_consent:  { status: 'implemented', note: 'Users consent at signup to financial data processing for service delivery' },
  attorney_general_enforcement:{ status: 'noted',  note: 'TX AG enforces TDPSA. No private right of action.' },
};

// ── Data Protection Impact Assessment (DPIA) Template ─────────────────────────
// Required by TDPSA, CPRA, Colorado, Connecticut, and others for processing sensitive data
export const DPIA_TEMPLATE = {
  required_by: ['TDPSA', 'CPRA', 'Colorado CPA', 'Connecticut CTDPA', 'Virginia VCDPA'],
  triggeringActivities: [
    'Processing sensitive personal information (financial data)',
    'Processing data for targeted advertising (N/A — we do not do this)',
    'Selling personal data (N/A — we do not sell data)',
    'Processing for profiling consequential decisions (N/A — Nova is advisory only)',
  ],
  sections: [
    { section: '1. Processing Description',   content: 'Zerofi processes user-provided financial data (account balances, income, debt, expenses, goals, tax information) solely to provide the financial management service and Nova AI advisor recommendations.' },
    { section: '2. Necessity & Proportionality', content: 'Processing is necessary and proportionate — no financial data is processed beyond what the user explicitly inputs for the purpose of receiving the Service.' },
    { section: '3. Risks Identified',          content: 'Primary risk: unauthorized access to financial data. Mitigated by AES-256-GCM encryption, Supabase RLS, and authentication controls.' },
    { section: '4. Mitigation Measures',       content: 'Encryption at rest and in transit. Row-level security. No third-party data sharing. No advertising use. SOC 2 certification roadmap.' },
    { section: '5. Residual Risk',             content: 'Low — technical safeguards substantially mitigate identified risks.' },
    { section: '6. Conclusion',               content: 'Processing is lawful, necessary, and proportionate. Risks are adequately mitigated.' },
  ],
  completedDate: '2026-06-09',
  nextReview:    '2027-06-09',
};

// ── Readiness Score ───────────────────────────────────────────────────────────
export function getMultiStateReadiness() {
  const rights = Object.values(CONSUMER_RIGHTS);
  const impl   = rights.filter(r => r.status === 'implemented').length;
  const tdpsa  = Object.values(TDPSA_REQUIREMENTS).filter(r => r.status === 'implemented').length;
  const tdpsaTotal = Object.keys(TDPSA_REQUIREMENTS).length;
  return {
    rightsImplemented: impl,
    rightsTotal:       rights.length,
    tdpsaScore:        Math.round((tdpsa / tdpsaTotal) * 100),
    overallPct:        Math.round((impl / rights.length) * 100),
  };
}
