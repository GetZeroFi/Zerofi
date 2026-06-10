// ── Zerofi Auth Page ──────────────────────────────────────────────────────────
import { useState } from 'react';
import { NOVA, USER_TYPES } from '../utils/constants';
import { TermsPage } from './Terms';
import { recordConsent, logSecurityEvent, AUDIT_EVENTS } from '../compliance/consentLogger';

const T = {
  bg: '#080c14', surface: '#0f172a', card: '#131e35',
  border: '#1e2d47', text: '#e8f0fe', muted: '#5a7094', faint: '#2a3d5a',
  accent: '#3b82f6', green: '#10b981', red: '#ef4444', amber: '#f59e0b',
  nova: '#a78bfa', novaGrad: 'linear-gradient(135deg,#6d28d9,#a78bfa)',
};

const NOVA_SIGNIN_LINES = [
  "Welcome back. Let's see where things stand.",
  "Ready to pick up where we left off.",
  "Your money doesn't stop moving. Neither does Zerofi.",
];
const NOVA_SIGNUP_LINES = [
  "Let's build your financial command center.",
  "No jargon. No commissions. Just clarity.",
  "For gig workers, families, individuals, and businesses — finally, one place.",
];

export default function Auth({ onAuth, isSupabaseEnabled }) {
  const [mode,     setMode]     = useState('signin');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [dob,      setDob]      = useState('');
  const [ageError, setAgeError] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [message,  setMessage]  = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedBeta,  setAgreedBeta]  = useState(false);
  const [agreedHonesty, setAgreedHonesty] = useState(false);
  const [showTerms,   setShowTerms]   = useState(false);

  const novaLine = mode === 'signin'
    ? NOVA_SIGNIN_LINES[Math.floor(Date.now() / 1000) % NOVA_SIGNIN_LINES.length]
    : NOVA_SIGNUP_LINES[Math.floor(Date.now() / 1000) % NOVA_SIGNUP_LINES.length];

  const canSubmit = mode !== 'signup' || (agreedTerms && agreedBeta && agreedHonesty);

  const validateAge = () => {
    if (mode !== 'signup') return true;
    if (!dob) { setAgeError('Date of birth is required.'); return false; }
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear()
      - (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);
    if (age < 18) {
      setAgeError('You must be 18 or older to use Zerofi. If you are under 18, please ask a parent or guardian to set up an account on your behalf.');
      return false;
    }
    if (age > 120) { setAgeError('Please enter a valid date of birth.'); return false; }
    setAgeError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMessage(''); 
    if (!validateAge()) return;
    setLoading(true);
    const result = await onAuth(mode, { email, password, name });
    setLoading(false);
    if (result?.error) {
      setError(result.error.message || 'Something went wrong. Try again.');
      if (mode === 'signin') logSecurityEvent(null, AUDIT_EVENTS.FAILED_LOGIN, { email });
    }
    if (result?.message) setMessage(result.message);
    if (!result?.error && mode === 'signup' && result?.data?.user?.id) {
      await recordConsent(result.data.user.id, { dob_verified: true, age_confirmed: true });
      logSecurityEvent(result.data.user.id, AUDIT_EVENTS.SIGNUP, { method: 'email', age_verified: true });
    }
    if (!result?.error && mode === 'signin' && result?.data?.user?.id) {
      logSecurityEvent(result.data.user.id, AUDIT_EVENTS.SIGNIN, { method: 'email' });
    }
  };

  const inputStyle = {
    width: '100%', background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: 10, padding: '12px 16px', color: T.text, fontSize: 14,
    fontFamily: "'DM Sans',sans-serif",
  };
  const labelStyle = {
    fontSize: 11, color: T.muted, fontFamily: "'DM Mono',monospace",
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, display: 'block',
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@800;900&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}input:focus{border-color:${T.accent}!important;outline:none;box-shadow:0 0 0 2px ${T.accent}33}`}</style>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 44, fontFamily: "'Fraunces',serif", fontWeight: 900, color: T.text, letterSpacing: '-0.03em', marginBottom: 4 }}>
          Zero<span style={{ color: T.accent }}>fi</span>
        </div>
        <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Mono',monospace", letterSpacing: '0.2em' }}>YOUR MONEY. YOUR TERMS.</div>
      </div>

      {/* Nova message */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: 400, width: '100%', marginBottom: 20 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: T.novaGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
          {NOVA.icon}
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '4px 18px 18px 18px', padding: '12px 16px', fontSize: 13, color: T.text, lineHeight: 1.6 }}>
          <strong style={{ color: T.nova }}>Nova</strong> here. {novaLine}
        </div>
      </div>

      {/* Auth card */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: '28px 28px 24px', maxWidth: 400, width: '100%' }}>

        {/* Tabs */}
        {mode !== 'reset' && (
          <div style={{ display: 'flex', background: T.surface, borderRadius: 10, padding: 3, marginBottom: 24, gap: 3 }}>
            {[['signin', 'Sign In'], ['signup', 'Create Account']].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setError(''); setMessage(''); }}
                style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: mode === m ? 600 : 400, background: mode === m ? T.card : 'transparent', color: mode === m ? T.text : T.muted, fontFamily: "'DM Sans',sans-serif", transition: 'all .15s' }}>
                {label}
              </button>
            ))}
          </div>
        )}

        {mode === 'reset' && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 4, fontFamily: "'Fraunces',serif" }}>Reset your password</div>
            <div style={{ fontSize: 13, color: T.muted }}>We'll send a link to your email.</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'signup' && (
            <div>
              <label style={labelStyle}>Your Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="What should Nova call you?" required style={inputStyle} />
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label style={labelStyle}>Date of Birth <span style={{ color: T.muted, fontWeight: 400 }}>(must be 18+)</span></label>
              <input type="date" value={dob} onChange={e => { setDob(e.target.value); setAgeError(''); }}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                required style={inputStyle} />
              {ageError && (
                <div style={{ fontSize: 12, color: T.red, marginTop: 6, lineHeight: 1.5, background: `${T.red}11`, border: `1px solid ${T.red}33`, borderRadius: 8, padding: '8px 12px' }}>
                  ⚠️ {ageError}
                </div>
              )}
              <div style={{ fontSize: 11, color: T.muted, marginTop: 6, lineHeight: 1.5 }}>
                Required by applicable state and federal law (COPPA). Your date of birth is stored securely and never shared.
              </div>
            </div>
          )}

          <div>
            <label style={labelStyle}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required style={inputStyle} />
          </div>

          {mode !== 'reset' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                {mode === 'signin' && (
                  <span onClick={() => { setMode('reset'); setError(''); setMessage(''); }}
                    style={{ fontSize: 11, color: T.accent, cursor: 'pointer', fontFamily: "'DM Mono',monospace" }}>
                    Forgot?
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Minimum 8 characters' : '••••••••'}
                  required minLength={8}
                  style={{ ...inputStyle, paddingRight: 48 }} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {mode === 'signup' && (
                <div style={{ fontSize: 11, color: T.muted, marginTop: 6, lineHeight: 1.5 }}>
                  Your financial data is encrypted with your password. Even we can't read it.
                </div>
              )}
            </div>
          )}

          {error   && <div style={{ fontSize: 13, color: T.red,   background: '#ef444418', border: `1px solid ${T.red}44`,   borderRadius: 8, padding: '10px 14px', lineHeight: 1.5 }}>⚠️ {error}</div>}
          {message && <div style={{ fontSize: 13, color: T.green, background: '#10b98118', border: `1px solid ${T.green}44`, borderRadius: 8, padding: '10px 14px', lineHeight: 1.5 }}>✅ {message}</div>}

          {/* Agreement checkboxes — signup only */}
          {mode === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 0 4px' }}>
              {[
                { key: 'terms',   state: agreedTerms,   setter: setAgreedTerms,
                  label: <>I have read and agree to the <span onClick={() => setShowTerms(true)} style={{ color: T.accent, cursor: 'pointer', textDecoration: 'underline' }}>Terms of Service</span> and <span onClick={() => setShowTerms(true)} style={{ color: T.accent, cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</span>.</> },
                { key: 'beta',    state: agreedBeta,    setter: setAgreedBeta,
                  label: 'I understand Zerofi is in private beta. I will not share my access or disclose proprietary details of the platform.' },
                { key: 'honesty', state: agreedHonesty, setter: setAgreedHonesty,
                  label: 'I agree to the Integrity Clause — I will not attempt to reverse-engineer, scrape, or misuse Zerofi's systems or data.' },
              ].map(({ key, state, setter, label }) => (
                <div key={key} onClick={() => setter(v => !v)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '2px 0' }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${state ? T.green : T.border}`, background: state ? `${T.green}22` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all .15s' }}>
                    {state && <span style={{ fontSize: 11, color: T.green, lineHeight: 1 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{label}</span>
                </div>
              ))}
            </div>
          )}

          <button type="submit" disabled={loading || !canSubmit}
            style={{ background: (loading || !canSubmit) ? T.faint : `linear-gradient(135deg,${T.accent},#2563eb)`, border: 'none', borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 700, color: '#fff', cursor: (loading || !canSubmit) ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", marginTop: 4, transition: 'opacity .15s' }}>
            {loading ? '⏳ Please wait…'
              : mode === 'signin' ? 'Sign In to Zerofi'
              : mode === 'signup' ? 'Create My Account'
              : 'Send Reset Link'}
          </button>
        </form>

        {/* OAuth */}
        {mode !== 'reset' && isSupabaseEnabled && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 16px' }}>
              <div style={{ flex: 1, height: 1, background: T.border }} />
              <span style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Mono',monospace" }}>OR</span>
              <div style={{ flex: 1, height: 1, background: T.border }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[['google', '🔵', 'Google'], ['apple', '🍎', 'Apple']].map(([p, icon, label]) => (
                <button key={p} onClick={() => onAuth(p, {})}
                  style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '11px 0', fontSize: 13, color: T.text, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif', display: 'flex", alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {icon} {label}
                </button>
              ))}
            </div>
          </>
        )}

        {mode === 'reset' && (
          <button onClick={() => { setMode('signin'); setError(''); setMessage(''); }}
            style={{ width: '100%', marginTop: 14, background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>
            ← Back to Sign In
          </button>
        )}
      </div>

      {/* Terms modal */}
      {showTerms && (
        <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 500, overflowY: 'auto' }}>
          <div style={{ minHeight: '100vh' }}>
            <TermsPage onBack={() => setShowTerms(false)} />
          </div>
        </div>
      )}

      {/* For everyone line */}
      <div style={{ marginTop: 20, maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.8 }}>
          For gig workers · individuals · families · businesses<br />
          <span style={{ fontSize: 11 }}>🔒 Encrypted · No ads · No commissions · No data selling</span>
        </div>
      </div>
    </div>
  );
}
