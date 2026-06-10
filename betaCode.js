// ── Zerofi Beta Code System ───────────────────────────────────────────────────
// Organized by tester segment so you can connect feedback to usage patterns.
// Each code tracks: segment, tester name (once assigned), notes.

export const BETA_CODES = {
  // ── Original codes ──────────────────────────────────────────────────────────
  'ZEROFI2026':  { segment: 'general',    assigned: null, notes: 'General access' },
  'NOVA2026':    { segment: 'general',    assigned: null, notes: 'Nova launch code' },
  'GETPAID2026': { segment: 'gig',        assigned: null, notes: 'Gig worker access' },
  'ZEROFIBETA':  { segment: 'general',    assigned: null, notes: 'General beta' },
  'FAMILYBETA':  { segment: 'family',     assigned: null, notes: 'Family access' },
  'GIGLIFE2026': { segment: 'gig',        assigned: null, notes: 'Gig life code' },

  // ── Gig workers (6-8 testers) ──────────────────────────────────────────────
  'SPARK2026':   { segment: 'gig',        assigned: null, notes: 'Spark drivers' },
  'FLEXDRIVER':  { segment: 'gig',        assigned: null, notes: 'Amazon Flex drivers' },
  'DASHBETA':    { segment: 'gig',        assigned: null, notes: 'DoorDash drivers' },
  'UBERBETA':    { segment: 'gig',        assigned: null, notes: 'Uber / Uber Eats' },
  'ROADIEBETA':  { segment: 'gig',        assigned: null, notes: 'Roadie drivers' },
  'GIGWORKER1':  { segment: 'gig',        assigned: null, notes: 'Gig worker slot 1' },
  'GIGWORKER2':  { segment: 'gig',        assigned: null, notes: 'Gig worker slot 2' },

  // ── Individuals (5-7 testers) ──────────────────────────────────────────────
  'DEBTFREE26':  { segment: 'individual', assigned: null, notes: 'Debt payoff focused' },
  'SAVEBETA':    { segment: 'individual', assigned: null, notes: 'Savings focused' },
  'FINBETA1':    { segment: 'individual', assigned: null, notes: 'Individual slot 1' },
  'FINBETA2':    { segment: 'individual', assigned: null, notes: 'Individual slot 2' },
  'FINBETA3':    { segment: 'individual', assigned: null, notes: 'Individual slot 3' },

  // ── Students (3-4 testers) ─────────────────────────────────────────────────
  'TCCBETA':     { segment: 'student',    assigned: null, notes: 'TCC Fort Worth students' },
  'STUDENT26':   { segment: 'student',    assigned: null, notes: 'Student slot 1' },
  'CAMPUSBETA':  { segment: 'student',    assigned: null, notes: 'Student slot 2' },

  // ── Families (2-3 testers) ─────────────────────────────────────────────────
  'HOMEBETA':    { segment: 'family',     assigned: null, notes: 'Family slot 1' },
  'HOUSEBETA':   { segment: 'family',     assigned: null, notes: 'Family slot 2' },

  // ── Freelancers / side hustlers (2-3 testers) ─────────────────────────────
  'FREELANCE26': { segment: 'freelancer', assigned: null, notes: 'Freelancer slot 1' },
  'SIDEHUSTLE':  { segment: 'freelancer', assigned: null, notes: 'Side hustler' },
  'BIZOWNER1':   { segment: 'freelancer', assigned: null, notes: 'Small business owner' },

  // ── Wildcards (1-2 testers) ────────────────────────────────────────────────
  'WILDCARD1':   { segment: 'wildcard',   assigned: null, notes: 'Wildcard slot 1' },
  'WILDCARD2':   { segment: 'wildcard',   assigned: null, notes: 'Wildcard slot 2' },

  // ── Reserve (extras if needed) ─────────────────────────────────────────────
  'RESERVE01':   { segment: 'reserve',    assigned: null, notes: 'Reserve slot' },
  'RESERVE02':   { segment: 'reserve',    assigned: null, notes: 'Reserve slot' },
  'RESERVE03':   { segment: 'reserve',    assigned: null, notes: 'Reserve slot' },
  'RESERVE04':   { segment: 'reserve',    assigned: null, notes: 'Reserve slot' },
  'RESERVE05':   { segment: 'reserve',    assigned: null, notes: 'Reserve slot' },
};

export const SEGMENT_CONFIG = {
  gig:        { label: 'Gig Worker',   icon: '🚗', color: '#22d3ee', target: '6-8'  },
  individual: { label: 'Individual',   icon: '👤', color: '#10b981', target: '5-7'  },
  student:    { label: 'Student',      icon: '🎓', color: '#3b82f6', target: '3-4'  },
  family:     { label: 'Family',       icon: '🏡', color: '#f59e0b', target: '2-3'  },
  freelancer: { label: 'Freelancer',   icon: '💼', color: '#a78bfa', target: '2-3'  },
  wildcard:   { label: 'Wildcard',     icon: '🎲', color: '#ec4899', target: '1-2'  },
  general:    { label: 'General',      icon: '⭐', color: '#5a7094', target: '—'    },
  reserve:    { label: 'Reserve',      icon: '📋', color: '#334155', target: '—'    },
};

const BETA_STORAGE_KEY = 'zerofi_beta_v1';
const BETA_TESTER_KEY  = 'zerofi_beta_tester_v1';

// Validate a code
export const validateBetaCode = (code) => {
  return code?.toUpperCase().trim() in BETA_CODES;
};

// Get code metadata
export const getCodeMeta = (code) => {
  return BETA_CODES[code?.toUpperCase().trim()] || null;
};

// Unlock beta access
export const unlockBeta = (code) => {
  localStorage.setItem(BETA_STORAGE_KEY, 'true');
  if (code) {
    const meta = getCodeMeta(code);
    localStorage.setItem(BETA_TESTER_KEY, JSON.stringify({
      code:     code.toUpperCase().trim(),
      segment:  meta?.segment || 'general',
      unlockedAt: new Date().toISOString(),
    }));
  }
};

export const isBetaUnlocked = () => {
  return localStorage.getItem(BETA_STORAGE_KEY) === 'true';
};

export const getBetaTesterInfo = () => {
  try {
    const v = localStorage.getItem(BETA_TESTER_KEY);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
};

// Get available codes by segment (for admin view)
export const getCodesBySegment = () => {
  const bySegment = {};
  Object.entries(BETA_CODES).forEach(([code, meta]) => {
    if (!bySegment[meta.segment]) bySegment[meta.segment] = [];
    bySegment[meta.segment].push({ code, ...meta });
  });
  return bySegment;
};

// Count totals
export const getBetaStats = () => {
  const codes = Object.values(BETA_CODES);
  return {
    total:    codes.length,
    assigned: codes.filter(c => c.assigned).length,
    available:codes.filter(c => !c.assigned && !['reserve'].includes(c.segment)).length,
    reserve:  codes.filter(c => c.segment === 'reserve').length,
  };
};
