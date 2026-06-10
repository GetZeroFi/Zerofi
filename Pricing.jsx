// ── Zerofi Pricing Page ───────────────────────────────────────────────────────
import { useState } from 'react';
import { TIERS, TRIAL } from '../utils/tiers';
import { NOVA } from '../utils/constants';

const T = {
  bg: '#080c14', surface: '#0f172a', card: '#131e35',
  border: '#1e2d47', text: '#e8f0fe', muted: '#5a7094', faint: '#2a3d5a',
  accent: '#3b82f6', green: '#10b981', red: '#ef4444', amber: '#f59e0b',
  nova: '#a78bfa', novaGrad: 'linear-gradient(135deg,#6d28d9,#a78bfa)',
};

const CHECK = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0, marginTop: 1 }}>
    <circle cx="8" cy="8" r="8" fill={`${color}22`} />
    <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Pricing({ onSelectTier, currentTier = 'free', onBack }) {
  const [billing, setBilling] = useState('monthly');

  const tiers = Object.values(TIERS);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@800;900&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Header */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        {onBack && <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 18 }}>←</button>}
        <div style={{ flex: 1, fontSize: 20, fontFamily: "'Fraunces',serif", fontWeight: 900, color: T.text }}>
          Zero<span style={{ color: T.accent }}>fi</span>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 16px 80px' }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, fontFamily: "'Fraunces',serif", fontWeight: 900, color: T.text, marginBottom: 10, letterSpacing: '-0.02em' }}>
            Simple, honest pricing
          </h1>
          <p style={{ fontSize: 15, color: T.muted, maxWidth: 500, margin: '0 auto', lineHeight: 1.65 }}>
            Start free forever. Try Plus or Pro for 7 days — no credit card, no gotcha.
            After the trial, stay on Free or upgrade. Your call.
          </p>
        </div>

        {/* Nova trust message */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: '14px 18px', marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: T.novaGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{NOVA.icon}</div>
          <div style={{ fontSize: 13, color: T.text, lineHeight: 1.65 }}>
            <strong style={{ color: T.nova }}>Nova here.</strong> A lot of apps trap you with a "free trial" that auto-charges you if you forget to cancel. We don't do that. Try Plus or Pro free for 7 days — no card needed. If you don't upgrade, you stay on Free. Simple.
          </div>
        </div>

        {/* Tier cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 40 }}>
          {tiers.map(tier => {
            const isCurrent  = currentTier === tier.id;
            const isPopular  = tier.badge === 'Most Popular';
            const isBestVal  = tier.badge === 'Best Value';

            return (
              <div key={tier.id} style={{
                background: T.card,
                border: `2px solid ${isCurrent ? tier.color : isPopular ? `${tier.color}66` : T.border}`,
                borderRadius: 20,
                padding: '28px 24px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {/* Badge */}
                {tier.badge && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: tier.color, color: '#fff', fontSize: 10, fontFamily: "'DM Mono',monospace", fontWeight: 700, padding: '4px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                    {tier.badge}
                  </div>
                )}
                {isCurrent && (
                  <div style={{ position: 'absolute', top: -12, right: 20, background: T.green, color: '#fff', fontSize: 10, fontFamily: "'DM Mono',monospace", padding: '4px 10px', borderRadius: 20 }}>
                    Current Plan
                  </div>
                )}

                {/* Tier name + price */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", color: tier.color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{tier.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                    {tier.price === 0
                      ? <span style={{ fontSize: 38, fontFamily: "'Fraunces',serif", fontWeight: 900, color: T.text }}>Free</span>
                      : <>
                          <span style={{ fontSize: 14, color: T.muted, marginTop: 8 }}>$</span>
                          <span style={{ fontSize: 38, fontFamily: "'Fraunces',serif", fontWeight: 900, color: T.text }}>{tier.price}</span>
                          <span style={{ fontSize: 13, color: T.muted }}>/month</span>
                        </>
                    }
                  </div>
                  <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{tier.tagline}</div>
                </div>

                {/* Features */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                  {tier.limits_copy.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <CHECK color={tier.color} />
                      <span style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.4 }}>{item}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                {tier.price === 0 ? (
                  <button onClick={() => onSelectTier?.('free')} disabled={isCurrent}
                    style={{ background: isCurrent ? T.faint : T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 0', fontSize: 13, fontWeight: 600, color: isCurrent ? T.muted : T.text, cursor: isCurrent ? 'default' : 'pointer', fontFamily: "'DM Sans',sans-serif", width: '100%' }}>
                    {isCurrent ? 'Your current plan' : 'Stay on Free'}
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button onClick={() => onSelectTier?.(tier.id, 'trial')}
                      style={{ background: `linear-gradient(135deg,${tier.color},${tier.color}cc)`, border: 'none', borderRadius: 10, padding: '12px 0', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", width: '100%' }}>
                      Try {tier.name} Free — 7 Days
                    </button>
                    <button onClick={() => onSelectTier?.(tier.id, 'subscribe')}
                      style={{ background: 'none', border: `1px solid ${tier.color}55`, borderRadius: 10, padding: '10px 0', fontSize: 12, color: tier.color, cursor: 'pointer', fontFamily: "'DM Mono',monospace", width: '100%' }}>
                      Subscribe ${tier.price}/mo
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Trial promise */}
        <div style={{ background: `${T.green}11`, border: `1px solid ${T.green}33`, borderRadius: 14, padding: '20px 24px', marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.green, marginBottom: 6 }}>Our 7-Day Trial Promise</div>
          <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
            {TRIAL.message}<br />
            No credit card required. No automatic charges. No cancellation needed.
            If you try it and don't love it, you're automatically on Free — forever.
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 20, fontFamily: "'Fraunces',serif", fontWeight: 800, color: T.text, marginBottom: 20, textAlign: 'center' }}>Common Questions</div>
          {[
            { q: 'Is Free really free forever?', a: 'Yes. No time limit, no credit card, no hidden fees. Free is free.' },
            { q: 'What happens after my 7-day trial?', a: 'Nothing. You automatically drop back to the Free plan. No charges, no cancellation needed, no annoying emails.' },
            { q: 'Can I upgrade or downgrade anytime?', a: 'Yes. Switch plans anytime from your account settings. Downgrades take effect at the end of your billing period.' },
            { q: 'Does Zerofi sell my financial data?', a: 'Never. We earn money from subscriptions, not from your data. Your financial information is encrypted and stays yours.' },
            { q: 'When is bank sync (Plaid) available?', a: 'Bank sync is coming to Plus and Pro users. We\'ll notify you when it\'s live — no action needed.' },
            { q: 'What\'s the difference between Nova on Free vs Plus?', a: 'Free gets 3 Nova insights per week. Plus and Pro get unlimited proactive insights — Nova watches your finances and alerts you before things go wrong.' },
          ].map((item, i) => (
            <div key={i} style={{ padding: '16px 0', borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 6 }}>{item.q}</div>
              <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>{item.a}</div>
            </div>
          ))}
        </div>

        {/* Footer trust */}
        <div style={{ textAlign: 'center', marginTop: 40, fontSize: 11, color: T.muted, lineHeight: 1.8 }}>
          🔒 End-to-end encrypted · No commissions · No data selling · Cancel anytime<br />
          For gig workers · individuals · families · businesses
        </div>
      </div>
    </div>
  );
}
