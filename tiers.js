// ── Zerofi Tier System ────────────────────────────────────────────────────────
// Free:  Always free, no time limit, no credit card ever
// Plus:  $8/month — full Nova, bank sync, unlimited everything
// Pro:   $15/month — family, business, accountant exports, Nova Pro
//
// Trial: 7 days of Plus/Pro — NO credit card required
//        After 7 days → automatically drops to Free, nothing charged

export const TIERS = {
  free: {
    id:          'free',
    name:        'Free',
    price:       0,
    interval:    null,
    color:       '#5a7094',
    badge:       null,
    tagline:     'Always free. No credit card. Ever.',
    stripePriceId: null,
    features: {
      // Limits
      maxAccounts:    3,
      maxDebts:       3,
      maxGoals:       1,
      maxBudgetItems: 5,
      maxStocks:      5,
      historyDays:    7,
      // Features
      bankSync:       false,
      novaInsights:   3,       // per week
      novaProactive:  false,
      weeklySummary:  false,
      taxExport:      false,
      multiUser:      false,
      businessMode:   false,
      accountantExport: false,
      advancedCharts: false,
      mileageTracking:true,    // always free for gig workers
      taxTracking:    true,    // always free for gig workers
    },
    limits_copy: [
      '3 accounts, 3 debts, 1 goal',
      'Basic Nova (3 insights/week)',
      'Manual entry only',
      '7-day history',
    ],
  },

  plus: {
    id:          'plus',
    name:        'Plus',
    price:       8,
    interval:    'month',
    color:       '#3b82f6',
    badge:       'Most Popular',
    tagline:     'Full Nova. Bank sync. Unlimited everything.',
    stripePriceId: 'price_zerofi_plus_monthly', // replace with real Stripe ID
    features: {
      maxAccounts:    Infinity,
      maxDebts:       Infinity,
      maxGoals:       Infinity,
      maxBudgetItems: Infinity,
      maxStocks:      Infinity,
      historyDays:    365,
      bankSync:       true,
      novaInsights:   Infinity,
      novaProactive:  true,
      weeklySummary:  true,
      taxExport:      true,
      multiUser:      false,
      businessMode:   false,
      accountantExport: false,
      advancedCharts: true,
      mileageTracking:true,
      taxTracking:    true,
    },
    limits_copy: [
      'Unlimited accounts, debts & goals',
      'Full Nova — unlimited insights',
      'Bank sync via Plaid',
      'Weekly summary from Nova',
      'Tax PDF export',
      '1-year history charts',
    ],
  },

  pro: {
    id:          'pro',
    name:        'Pro',
    price:       15,
    interval:    'month',
    color:       '#a78bfa',
    badge:       'Best Value',
    tagline:     'Family, business, accountant-ready. Nova at full power.',
    stripePriceId: 'price_zerofi_pro_monthly', // replace with real Stripe ID
    features: {
      maxAccounts:    Infinity,
      maxDebts:       Infinity,
      maxGoals:       Infinity,
      maxBudgetItems: Infinity,
      maxStocks:      Infinity,
      historyDays:    730,  // 2 years
      bankSync:       true,
      novaInsights:   Infinity,
      novaProactive:  true,
      weeklySummary:  true,
      taxExport:      true,
      multiUser:      true,   // up to 5 members
      businessMode:   true,
      accountantExport: true,
      advancedCharts: true,
      mileageTracking:true,
      taxTracking:    true,
    },
    limits_copy: [
      'Everything in Plus',
      'Family multi-user (up to 5)',
      'Business mode (P&L, invoices)',
      'Accountant-ready tax reports',
      '2-year history charts',
      'Nova Pro (AI-powered)',
      'Onboarding call with team',
    ],
  },
};

export const TRIAL = {
  days:              7,
  requiresCreditCard: false,
  appliesTo:         ['plus', 'pro'],
  afterTrialAction:  'downgrade_to_free', // never charge, never cancel — just drop to free
  message:           'No credit card. No gotcha. After 7 days you stay on Free forever — or upgrade if you love it.',
};

// ── Feature gate checker ──────────────────────────────────────────────────────
export function canUse(feature, userTier) {
  const tier = TIERS[userTier] || TIERS.free;
  return tier.features[feature] !== false && tier.features[feature] !== 0;
}

export function getLimit(feature, userTier) {
  const tier = TIERS[userTier] || TIERS.free;
  return tier.features[feature] ?? 0;
}

export function isAtLimit(feature, currentCount, userTier) {
  const limit = getLimit(feature, userTier);
  return limit !== Infinity && currentCount >= limit;
}

// ── Trial helpers ─────────────────────────────────────────────────────────────
export function isInTrial(user) {
  if (!user?.trialStarted) return false;
  const elapsed = (Date.now() - new Date(user.trialStarted).getTime()) / (1000 * 60 * 60 * 24);
  return elapsed < TRIAL.days;
}

export function trialDaysLeft(user) {
  if (!user?.trialStarted) return 0;
  const elapsed = (Date.now() - new Date(user.trialStarted).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(TRIAL.days - elapsed));
}

export function getEffectiveTier(user) {
  // During trial, treat as the trial tier
  if (isInTrial(user)) return user.trialTier || 'plus';
  return user?.tier || 'free';
}
