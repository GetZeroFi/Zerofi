// ── Zerofi Compliance Dashboard ───────────────────────────────────────────────
// Internal admin view — shows real-time compliance posture.
// Not linked from any user-facing page.
import { useState } from 'react';
import { getGLBAStatus, TECHNICAL_SAFEGUARDS, VENDOR_ASSESSMENTS } from '../compliance/glba';
import { getCCPAStatus, DATA_INVENTORY } from '../compliance/ccpa';
import { getSOC2ReadinessScore, SOC2_CONFIG, COMMON_CRITERIA } from '../compliance/soc2';
import { getCANSPAMStatus, CANSPAM_CHECKLIST } from '../compliance/canspam';
import { getMultiStateReadiness, CONSUMER_RIGHTS, TDPSA_REQUIREMENTS } from '../compliance/multiStatePrivacy';
import { getFTCReadiness, REQUIRED_DISCLOSURES, ACCESSIBILITY_ROADMAP } from '../compliance/ftcCompliance';
import { CURRENT_VERSIONS } from '../compliance/consentLogger';

const T = {
  bg: '#080c14', surface: '#0f172a', card: '#131e35',
  border: '#1e2d47', text: '#e8f0fe', muted: '#5a7094', faint: '#2a3d5a',
  accent: '#3b82f6', green: '#10b981', red: '#ef4444', amber: '#f59e0b',
  purple: '#a78bfa', teal: '#22d3ee', pink: '#ec4899',
};

// ── Three-tier compliance status system ──────────────────────────────────────
// implemented = active in production code right now
// policy      = documented but not technically enforced
// roadmap     = planned future control (with target date)
// needed      = blocking — must be done before specific milestone
// partial     = started but incomplete
// n/a         = not applicable to Zerofi

const STATUS_COLORS = {
  implemented: '#10b981',  // green  — live in production
  policy:      '#3b82f6',  // blue   — documented, not enforced
  roadmap:     '#a78bfa',  // purple — planned with target date
  partial:     '#f59e0b',  // amber  — in progress
  needed:      '#ef4444',  // red    — blocking
  noted:       '#5a7094',  // gray   — acknowledged, low priority
  'n/a':       '#334155',  // dark   — not applicable
  unknown:     '#334155',  // dark   — not yet assessed
  planned:     '#a78bfa',  // alias for roadmap
};

const TIER_LEGEND = [
  { status: 'implemented', label: 'Implemented',  desc: 'Active in production code' },
  { status: 'policy',      label: 'Policy',       desc: 'Documented, not yet enforced' },
  { status: 'roadmap',     label: 'Roadmap',      desc: 'Planned with target date' },
  { status: 'partial',     label: 'Partial',      desc: 'Started but incomplete' },
  { status: 'needed',      label: 'Needed',       desc: 'Blocking — required before launch' },
  { status: 'n/a',         label: 'N/A',          desc: 'Not applicable to Zerofi' },
];

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || T.muted;
  return (
    <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 20, padding: '2px 8px', flexShrink: 0 }}>
      {status}
    </span>
  );
}

function ScoreRing({ score, color, label, sub }) {
  const r = 32; const C = 40;
  const circ = 2 * Math.PI * r;
  const dash = ((score || 0) / 100) * circ;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={80} height={80} viewBox="0 0 80 80">
        <circle cx={C} cy={C} r={r} fill="none" stroke={T.faint} strokeWidth={7} />
        <circle cx={C} cy={C} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash.toFixed(1)} ${(circ - dash).toFixed(1)}`}
          strokeDashoffset={circ / 4} strokeLinecap="round" />
        <text x={C} y={C - 3} textAnchor="middle" fill={color} fontSize={14} fontWeight={700} fontFamily="'DM Mono',monospace">{score}%</text>
        <text x={C} y={C + 11} textAnchor="middle" fill={T.muted} fontSize={8} fontFamily="'DM Mono',monospace">{label}</text>
      </svg>
      <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function Card({ children, style = {} }) {
  return <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20, ...style }}>{children}</div>;
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{children}</div>
      {sub && <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function ControlRow({ label, note, status, target, extra }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '10px 0', borderBottom: `1px solid ${T.faint}` }}>
      <div style={{ flex: 1, paddingRight: 12 }}>
        <div style={{ fontSize: 13, color: T.text, marginBottom: note ? 3 : 0 }}>{label}</div>
        {note   && <div style={{ fontSize: 11, color: T.muted }}>{note}</div>}
        {target && <div style={{ fontSize: 10, color: T.amber, marginTop: 2 }}>Target: {target}</div>}
        {extra  && <div style={{ fontSize: 10, color: T.accent, marginTop: 2 }}>{extra}</div>}
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

export default function ComplianceDashboard({ onBack }) {
  const [tab, setTab] = useState('overview');

  // Live scores from each compliance module
  const glba      = getGLBAStatus();
  const ccpa      = getCCPAStatus();
  const soc2      = getSOC2ReadinessScore();
  const canspam   = getCANSPAMStatus();
  const multiState= getMultiStateReadiness();
  const ftc       = getFTCReadiness();

  const scores = {
    GLBA:        glba.pct,
    CCPA:        ccpa.pct,
    'SOC 2':     soc2.score,
    'CAN-SPAM':  Math.round((canspam.done / canspam.total) * 100),
    'State Laws':multiState.overallPct,
    FTC:         Math.round((ftc.disclosuresImplemented / ftc.disclosuresTotal) * 100),
  };
  const overall = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length);

  // Tier counts across all compliance modules — for auditor summary
  const tierSummary = { implemented: 0, policy: 0, roadmap: 0, needed: 0, partial: 0 };
  [
    ...Object.values(glba.implemented ? {} : {}), // glba uses pct
    ...(soc2.implemented ? Array(soc2.implemented).fill('implemented') : []),
    ...(soc2.partial ? Array(soc2.partial).fill('policy') : []),
    ...(soc2.planned ? Array(soc2.planned).fill('roadmap') : []),
  ].forEach(t => { if (tierSummary[t] !== undefined) tierSummary[t]++; });

  const TABS = [
    ['overview',   'Overview'],
    ['glba',       'GLBA'],
    ['ccpa',       'CCPA'],
    ['soc2',       'SOC 2'],
    ['canspam',    'CAN-SPAM'],
    ['multistate', 'State Laws'],
    ['ftc',        'FTC + ADA'],
  ];

  const RING_COLORS = [T.teal, T.green, T.purple, T.amber, T.teal, T.accent];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800;900&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Header */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        {onBack && <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 18 }}>←</button>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontFamily: "'Fraunces',serif", fontWeight: 900, color: T.text }}>
            Zero<span style={{ color: T.accent }}>fi</span>
            <span style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Mono',monospace", marginLeft: 10 }}>Compliance Dashboard</span>
          </div>
          <div style={{ fontSize: 9, color: T.red, fontFamily: "'DM Mono',monospace", marginTop: 2, letterSpacing: '0.08em' }}>INTERNAL — NOT FOR DISTRIBUTION</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: T.muted, fontFamily: "'DM Mono',monospace", marginBottom: 1 }}>OVERALL READINESS</div>
          <div style={{ fontSize: 26, fontFamily: "'DM Mono',monospace", color: overall >= 80 ? T.green : overall >= 60 ? T.amber : T.red, fontWeight: 700 }}>{overall}%</div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '0 16px', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {TABS.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ padding: '11px 14px', background: 'none', border: 'none', borderBottom: tab === key ? `2px solid ${T.accent}` : '2px solid transparent', color: tab === key ? T.text : T.muted, cursor: 'pointer', fontSize: 11, fontFamily: "'DM Mono',monospace", whiteSpace: 'nowrap', flexShrink: 0 }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Score rings */}
            <Card>
              <SectionTitle sub="Real-time scores from each compliance module">Compliance Posture</SectionTitle>
              <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
                {Object.entries(scores).map(([name, score], i) => (
                  <ScoreRing key={name} score={score} color={RING_COLORS[i]} label={name} sub={score >= 80 ? 'ready' : score >= 60 ? 'partial' : 'needs work'} />
                ))}
              </div>
            </Card>

            {/* Control Status Legend */}
            <Card>
              <SectionTitle sub="How to read the compliance dashboard">Control Status Tiers</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {TIER_LEGEND.map(tier => (
                  <div key={tier.status} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: T.bg, borderRadius: 8 }}>
                    <StatusBadge status={tier.status} />
                    <div>
                      <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.4 }}>{tier.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: T.muted, lineHeight: 1.6, padding: '8px 10px', background: T.bg, borderRadius: 8 }}>
                💡 <strong style={{ color: T.text }}>Investors and auditors care about the distinction.</strong> "MFA required for admins" (implemented) is very different from "MFA policy documented" (policy) — even though both sound similar at first glance.
              </div>
            </Card>

            {/* SOC 2 Roadmap */}
            <Card>
              <SectionTitle sub={`Target Type I: ${SOC2_CONFIG.targetTypeI} · Type II: ${SOC2_CONFIG.targetTypeII}`}>SOC 2 Roadmap</SectionTitle>
              {[
                { label: 'Beta Launch',                    date: 'Now',       done: true  },
                { label: 'Form Zerofi LLC + EIN',          date: 'ASAP',      done: false, color: T.amber },
                { label: 'Attorney review Terms + WISP',   date: 'Pre-launch',done: false, color: T.amber },
                { label: 'Trademark Zerofi + Nova',        date: 'Post-funding',done: false, color: T.amber },
                { label: 'SOC 2 Type I Assessment',        date: SOC2_CONFIG.targetTypeI, done: false, color: T.purple },
                { label: 'SOC 2 Type II Audit',            date: SOC2_CONFIG.targetTypeII, done: false, color: T.purple },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 5 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: item.done ? `${T.green}22` : `${item.color || T.muted}22`, border: `2px solid ${item.done ? T.green : item.color || T.muted}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>
                    {item.done ? '✓' : '○'}
                  </div>
                  <div style={{ flex: 1, fontSize: 13, color: item.done ? T.muted : T.text }}>{item.label}</div>
                  <div style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: item.done ? T.green : item.color || T.muted }}>{item.date}</div>
                </div>
              ))}
            </Card>

            {/* Document versions */}
            <Card>
              <SectionTitle sub="Recorded in user_consents table at signup">Current Agreement Versions</SectionTitle>
              {Object.entries(CURRENT_VERSIONS).map(([key, ver]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${T.faint}`, fontSize: 13 }}>
                  <span style={{ color: T.text, textTransform: 'capitalize' }}>{key} Agreement</span>
                  <span style={{ fontFamily: "'DM Mono',monospace", color: T.green }}>v{ver}</span>
                </div>
              ))}
            </Card>

            {/* Action items */}
            <Card style={{ borderColor: `${T.amber}44` }}>
              <SectionTitle sub="Complete before public launch">Open Action Items</SectionTitle>
              {[
                { action: 'Add LLC physical address to CAN-SPAM config',      priority: 'high',   when: 'After LLC formation' },
                { action: 'Configure nova@getzerofi.com email address',        priority: 'high',   when: 'Before first email' },
                { action: 'Attorney review: Terms, Privacy Policy, WISP',      priority: 'high',   when: 'Pre-launch' },
                { action: 'Texas DPIA sign-off (TDPSA requirement)',           priority: 'medium', when: 'Pre-launch' },
                { action: 'Add data export endpoint (CPRA portability right)', priority: 'medium', when: 'Q3 2026' },
                { action: 'Set up Supabase anomaly monitoring alerts',         priority: 'medium', when: 'Q3 2026' },
                { action: 'SOC 2 Type I auditor selection',                    priority: 'low',    when: 'Q4 2026' },
                { action: 'WCAG 2.1 Level AA audit (mobile app phase)',        priority: 'low',    when: 'Mobile launch' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: `1px solid ${T.faint}` }}>
                  <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", background: item.priority === 'high' ? `${T.red}22` : item.priority === 'medium' ? `${T.amber}22` : `${T.muted}22`, color: item.priority === 'high' ? T.red : item.priority === 'medium' ? T.amber : T.muted, border: `1px solid currentColor`, borderRadius: 20, padding: '2px 7px', flexShrink: 0, marginTop: 1 }}>{item.priority}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: T.text }}>{item.action}</div>
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>{item.when}</div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ── GLBA ──────────────────────────────────────────────────────────── */}
        {tab === 'glba' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <SectionTitle sub={`${glba.implemented} of ${glba.total} technical safeguards implemented`}>GLBA Safeguards Rule — Technical Controls</SectionTitle>
              {Object.entries(TECHNICAL_SAFEGUARDS).map(([key, s]) => (
                <ControlRow key={key} label={key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} note={s.method || s.note} status={s.status} />
              ))}
            </Card>
            <Card>
              <SectionTitle sub="All vendors with access to NPI must be SOC 2 certified">Vendor Risk Assessments</SectionTitle>
              {VENDOR_ASSESSMENTS.map(v => (
                <div key={v.vendor} style={{ padding: '12px 0', borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{v.vendor}</span>
                    <StatusBadge status="implemented" />
                  </div>
                  <div style={{ fontSize: 12, color: T.muted, marginBottom: 6 }}>{v.service} · {v.dataRegion}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {v.certifications.map(c => <span key={c} style={{ fontSize: 10, background: `${T.green}18`, color: T.green, border: `1px solid ${T.green}33`, borderRadius: 20, padding: '2px 8px', fontFamily: "'DM Mono',monospace" }}>{c}</span>)}
                    {v.dpa_signed && <span style={{ fontSize: 10, background: `${T.accent}18`, color: T.accent, border: `1px solid ${T.accent}33`, borderRadius: 20, padding: '2px 8px', fontFamily: "'DM Mono',monospace" }}>DPA ✓</span>}
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ── CCPA ──────────────────────────────────────────────────────────── */}
        {tab === 'ccpa' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <SectionTitle sub="All personal information categories collected by Zerofi">Data Inventory</SectionTitle>
              {DATA_INVENTORY.map(item => (
                <div key={item.category} style={{ padding: '12px 0', borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: item.sensitive ? T.amber : T.text }}>
                      {item.category}{item.sensitive ? ' ⚠️' : ''}
                    </span>
                    <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", background: `${T.red}18`, color: T.red, border: `1px solid ${T.red}33`, borderRadius: 20, padding: '2px 8px' }}>NOT SOLD</span>
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, marginBottom: 3 }}>{item.examples.join(', ')}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>Retention: {item.retention}</div>
                  {item.note && <div style={{ fontSize: 11, color: T.green, marginTop: 3 }}>🔒 {item.note}</div>}
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ── SOC 2 ─────────────────────────────────────────────────────────── */}
        {tab === 'soc2' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <SectionTitle sub={`${soc2.implemented} impl · ${soc2.partial} partial · ${soc2.planned} planned`}>SOC 2 Controls</SectionTitle>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 28, fontFamily: "'DM Mono',monospace", color: T.purple, fontWeight: 700 }}>{soc2.score}%</div>
                  <div style={{ fontSize: 10, color: T.muted }}>Type I ready</div>
                </div>
              </div>
              {Object.entries(COMMON_CRITERIA).map(([catKey, cat]) => (
                <div key={catKey} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: T.accent, fontFamily: "'DM Mono',monospace", letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, paddingBottom: 4, borderBottom: `1px solid ${T.border}` }}>
                    {catKey.replace(/([A-Z][0-9])/g, ' $1').replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  {cat.controls.map(ctrl => (
                    <ControlRow key={ctrl.id} label={`${ctrl.id} — ${ctrl.description}`} note={ctrl.evidence} status={ctrl.status} target={ctrl.target} />
                  ))}
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ── CAN-SPAM ──────────────────────────────────────────────────────── */}
        {tab === 'canspam' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <SectionTitle sub="Required for every commercial email Zerofi sends">CAN-SPAM Act Compliance</SectionTitle>
              <div style={{ background: `${T.amber}11`, border: `1px solid ${T.amber}33`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: T.amber, lineHeight: 1.6 }}>
                ⚠️ Two items need action after LLC formation: (1) add physical mailing address to canspam.js, (2) configure nova@getzerofi.com in your email provider (Resend or SendGrid recommended).
              </div>
              {Object.entries(CANSPAM_CHECKLIST).map(([key, item]) => (
                <ControlRow key={key} label={key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} note={item.note} status={item.status} />
              ))}
            </Card>
          </div>
        )}

        {/* ── MULTI-STATE ───────────────────────────────────────────────────── */}
        {tab === 'multistate' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <SectionTitle sub="CPRA-baseline strategy satisfies all 20 state laws">Consumer Rights — All States</SectionTitle>
              {Object.entries(CONSUMER_RIGHTS).map(([key, right]) => (
                <ControlRow key={key} label={right.description} note={right.howSatisfied} status={right.status} target={right.target} />
              ))}
            </Card>
            <Card>
              <SectionTitle sub="Directly applicable — Zerofi is a Texas company">Texas TDPSA Requirements</SectionTitle>
              {Object.entries(TDPSA_REQUIREMENTS).map(([key, req]) => (
                <ControlRow key={key} label={key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} note={req.note} status={req.status} target={req.target} />
              ))}
            </Card>
          </div>
        )}

        {/* ── FTC + ADA ─────────────────────────────────────────────────────── */}
        {tab === 'ftc' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card>
              <SectionTitle sub="All claims must be truthful, prominent, and substantiated">FTC Section 5 — Required Disclosures</SectionTitle>
              {Object.entries(REQUIRED_DISCLOSURES).map(([key, disc]) => (
                <div key={key} style={{ padding: '10px 0', borderBottom: `1px solid ${T.faint}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: T.text }}>{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                    <StatusBadge status={disc.status} />
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, marginBottom: 3 }}>{disc.text}</div>
                  <div style={{ fontSize: 10, color: T.accent }}>Placement: {disc.placement.join(' · ')}</div>
                  {disc.note && <div style={{ fontSize: 10, color: T.amber, marginTop: 2 }}>→ {disc.note}</div>}
                </div>
              ))}
            </Card>
            <Card>
              <SectionTitle sub="Target: WCAG 2.1 Level AA — Mobile app development phase">ADA / WCAG Accessibility Roadmap</SectionTitle>
              {ACCESSIBILITY_ROADMAP.requirements.map((r, i) => (
                <ControlRow key={i} label={`${r.criterion} — ${r.description}`} note={r.note} status={r.status || 'planned'} extra={`Priority: ${r.priority}`} />
              ))}
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
