// ── Zerofi Beta Gate ──────────────────────────────────────────────────────────
import { useState } from 'react';
import { validateBetaCode, unlockBeta } from '../utils/betaCode';
import { TermsPage } from './Terms';
import { NOVA, USER_TYPES } from '../utils/constants';

const T = {
  bg: '#080c14', surface: '#0f172a', card: '#131e35',
  border: '#1e2d47', text: '#e8f0fe', muted: '#5a7094',
  accent: '#3b82f6', green: '#10b981', red: '#ef4444', amber: '#f59e0b',
  nova: '#a78bfa', novaGrad: 'linear-gradient(135deg,#6d28d9,#a78bfa)',
};

const AUDIENCE_LINES = [
  { icon: '🚗', label: 'Gig Workers',    desc: 'Spark, Uber, DoorDash, Flex — weekly goals, mileage, taxes' },
  { icon: '👤', label: 'Individuals',    desc: 'Salaries, side hustles, debt payoff, first investments'      },
  { icon: '🏡', label: 'Families',       desc: 'Mortgage, kids, shared goals, two incomes in one place'      },
  { icon: '💼', label: 'Businesses',     desc: 'Revenue, payroll, quarterly taxes, cash flow visibility'     },
];

export default function BetaGate({ onUnlock }) {
  const [code,    setCode]    = useState('');
  const [error,   setError]   = useState('');
  const [success,  setSuccess]  = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleSubmit = () => {
    if (!code.trim()) return;
    if (validateBetaCode(code)) {
      unlockBeta(code);
      setSuccess(true);
      setTimeout(onUnlock, 1400);
    } else {
      setError("That code doesn't look right. Check with whoever invited you.");
      setCode('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@800;900&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}input:focus{border-color:#3b82f6!important;outline:none}`}</style>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 44, fontFamily: "'Fraunces',serif", fontWeight: 900, color: T.text, letterSpacing: '-0.03em', marginBottom: 4 }}>
          Zero<span style={{ color: T.accent }}>fi</span>
        </div>
        <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Mono',monospace", letterSpacing: '0.2em' }}>YOUR MONEY. YOUR TERMS.</div>
      </div>

      {/* Nova greeting */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: 440, width: '100%', marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: T.novaGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, marginTop: 2 }}>
          {NOVA.icon}
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '4px 18px 18px 18px', padding: '14px 16px', fontSize: 14, color: T.text, lineHeight: 1.65 }}>
          Hi, I'm <strong style={{ color: T.nova }}>Nova</strong> — your Zerofi AI advisor.{'\n\n'}
          Zerofi is your personal financial command center — built for <strong style={{ color: T.text }}>gig workers, individuals, families, and businesses</strong> who want honest guidance without the jargon or the commissions.{'\n\n'}
          We're in private beta. Enter your invite code to get in.
        </div>
      </div>

      {/* Audience grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 440, width: '100%', marginBottom: 24 }}>
        {AUDIENCE_LINES.map(a => (
          <div key={a.label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{a.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 3 }}>{a.label}</div>
            <div style={{ fontSize: 10, color: T.muted, lineHeight: 1.5 }}>{a.desc}</div>
          </div>
        ))}
      </div>

      {/* Code input */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 28, maxWidth: 440, width: '100%' }}>
        {success ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.green, marginBottom: 6 }}>You're in!</div>
            <div style={{ fontSize: 13, color: T.muted }}>Setting up your Zerofi…</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Mono',monospace", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
              Beta Invite Code
            </div>
            <input
              autoFocus value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. ZEROFI2026"
              style={{ width: '100%', background: T.surface, border: `1px solid ${error ? T.red : T.border}`, borderRadius: 10, padding: '13px 16px', color: T.text, fontSize: 15, fontFamily: "'DM Mono',monospace", letterSpacing: '0.1em', marginBottom: 10, display: 'block', textTransform: 'uppercase' }}
            />
            {error && <div style={{ fontSize: 12, color: T.red, marginBottom: 10 }}>⚠️ {error}</div>}
            <button onClick={handleSubmit} disabled={!code.trim()} style={{ width: '100%', background: code.trim() ? `linear-gradient(135deg,${T.accent},#2563eb)` : T.muted, border: 'none', borderRadius: 10, padding: '13px 0', fontSize: 14, fontWeight: 700, color: '#fff', cursor: code.trim() ? 'pointer' : 'not-allowed', fontFamily: "'DM Sans',sans-serif" }}>
              Enter Zerofi →
            </button>
          </>
        )}
      </div>

      {/* Trust line */}
      <div style={{ marginTop: 20, maxWidth: 440, width: '100%', textAlign: 'center', fontSize: 11, color: T.muted, lineHeight: 1.7 }}>
        🔒 End-to-end encrypted · No commissions · No data selling · No jargon<br />
        Built for the people financial advisors ignore.
      </div>
    </div>
  );
}
