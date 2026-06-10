// ── Upgrade Prompt ────────────────────────────────────────────────────────────
// Shown when a free user tries to use a Plus/Pro feature.
// Never aggressive — always shows what they get, never guilt-trips.
import { TIERS, TRIAL } from '../utils/tiers';
import { NOVA } from '../utils/constants';

const T = {
  bg: '#080c14', surface: '#0f172a', card: '#131e35',
  border: '#1e2d47', text: '#e8f0fe', muted: '#5a7094',
  accent: '#3b82f6', green: '#10b981', nova: '#a78bfa',
  novaGrad: 'linear-gradient(135deg,#6d28d9,#a78bfa)',
};

export function UpgradePrompt({ feature, requiredTier = 'plus', onUpgrade, onDismiss, T: theme }) {
  const t = theme || T;
  const tier = TIERS[requiredTier];

  const FEATURE_COPY = {
    bankSync:        { title: 'Bank Sync',         body: 'Connect your accounts and Zerofi updates balances automatically. No more manual entry.' },
    novaInsights:    { title: 'More Nova Insights', body: "You've used your 3 free insights this week. Upgrade for unlimited proactive guidance from Nova." },
    novaProactive:   { title: 'Proactive Nova',     body: 'Nova watches your finances and alerts you before things go wrong — before bills are due, before you fall short.' },
    weeklySummary:   { title: 'Weekly Summary',     body: "Every Sunday, Nova sends you a financial recap — what you earned, what's coming, what to focus on." },
    taxExport:       { title: 'Tax Export',         body: 'Export your income, expenses, and mileage as a PDF for your accountant or your own records.' },
    multiUser:       { title: 'Family Accounts',    body: 'Add up to 5 family members. Everyone sees the shared picture. Great for households managing together.' },
    businessMode:    { title: 'Business Mode',      body: 'Track revenue, expenses, and invoices separately from personal finances.' },
    accountantExport:{ title: 'Accountant Reports', body: 'Professional-grade tax reports your accountant can actually use. Saves hours at tax time.' },
    advancedCharts:  { title: 'Advanced History',   body: 'See your full financial history — net worth trend, income by platform, debt payoff — up to 2 years back.' },
    maxAccounts:     { title: 'More Accounts',      body: "You've reached the 3-account limit on Free. Upgrade to track unlimited accounts." },
    maxDebts:        { title: 'More Debts',         body: "You've reached the 3-debt limit on Free. Upgrade to track all your debts in one place." },
    maxGoals:        { title: 'More Goals',         body: "Free includes 1 goal. Upgrade to set unlimited savings and financial goals." },
  };

  const copy = FEATURE_COPY[feature] || { title: 'Upgrade to ' + tier.name, body: tier.tagline };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000088', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: t.card, border: `1px solid ${tier.color}66`, borderRadius: 20, padding: 28, maxWidth: 380, width: '100%', boxShadow: `0 8px 40px ${tier.color}22` }}>

        {/* Nova message */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: t.novaGrad || T.novaGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{NOVA.icon}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 4 }}>{copy.title}</div>
            <div style={{ fontSize: 13, color: t.muted, lineHeight: 1.6 }}>{copy.body}</div>
          </div>
        </div>

        {/* What you get */}
        <div style={{ background: t.bg || T.bg, borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: tier.color, fontFamily: "'DM Mono',monospace", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            {tier.name} — ${tier.price}/month
          </div>
          {tier.limits_copy.slice(0, 4).map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, fontSize: 12, color: '#94a3b8' }}>
              <span style={{ color: tier.color, fontSize: 10 }}>✓</span> {item}
            </div>
          ))}
        </div>

        {/* Trial promise */}
        <div style={{ fontSize: 12, color: t.green || T.green, textAlign: 'center', marginBottom: 16, lineHeight: 1.5 }}>
          🎁 Try free for {TRIAL.days} days — no credit card required
        </div>

        {/* Buttons */}
        <button onClick={() => onUpgrade?.(requiredTier, 'trial')} style={{ width: '100%', background: `linear-gradient(135deg,${tier.color},${tier.color}bb)`, border: 'none', borderRadius: 10, padding: '13px 0', fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>
          Start 7-Day Free Trial
        </button>
        <button onClick={onDismiss} style={{ width: '100%', background: 'none', border: `1px solid ${t.border || T.border}`, borderRadius: 10, padding: '11px 0', fontSize: 13, color: t.muted || T.muted, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
          Stay on Free for now
        </button>
      </div>
    </div>
  );
}

// ── Trial Banner ──────────────────────────────────────────────────────────────
// Shown at top of dashboard during the 7-day trial
export function TrialBanner({ daysLeft, tierName, onUpgrade, T: theme }) {
  const t = theme || T;
  const tier = TIERS[tierName?.toLowerCase()] || TIERS.plus;
  const urgent = daysLeft <= 2;

  return (
    <div style={{
      background: urgent ? `${T.amber}18` : `${tier.color}11`,
      border: `1px solid ${urgent ? T.amber : tier.color}44`,
      borderRadius: 10, padding: '10px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, marginBottom: 12,
    }}>
      <div style={{ fontSize: 13, color: t.text }}>
        <span style={{ color: urgent ? T.amber : tier.color, fontWeight: 600 }}>
          {daysLeft} day{daysLeft !== 1 ? 's' : ''} left in your {tier.name} trial
        </span>
        {urgent
          ? " — upgrade to keep full access, or stay on Free forever."
          : " — no credit card needed to keep exploring."}
      </div>
      <button onClick={() => onUpgrade?.(tierName, 'subscribe')} style={{ background: `linear-gradient(135deg,${tier.color},${tier.color}bb)`, border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>
        Upgrade ${tier.price}/mo
      </button>
    </div>
  );
}

// ── Feature Lock Indicator ────────────────────────────────────────────────────
// Small lock shown on locked tabs/features
export function FeatureLock({ tierName = 'Plus', color = '#3b82f6' }) {
  return (
    <span style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 20, padding: '1px 6px', marginLeft: 6, verticalAlign: 'middle' }}>
      {tierName}
    </span>
  );
}
