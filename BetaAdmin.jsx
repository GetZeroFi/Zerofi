// ── Zerofi Beta Admin Dashboard ───────────────────────────────────────────────
// Tracks who has which code, segment coverage, and beta feedback.
// Your command center for managing the 15-30 beta testers.
import { useState } from 'react';
import { BETA_CODES, SEGMENT_CONFIG, getCodesBySegment, getBetaStats } from '../utils/betaCode';

const T = {
  bg: '#080c14', surface: '#0f172a', card: '#131e35',
  border: '#1e2d47', text: '#e8f0fe', muted: '#5a7094', faint: '#2a3d5a',
  accent: '#3b82f6', green: '#10b981', red: '#ef4444', amber: '#f59e0b',
  purple: '#a78bfa', teal: '#22d3ee',
};

// ── Local tester registry ─────────────────────────────────────────────────────
// When you give someone a code, update their entry here.
// This is your ground truth for who has access.
const TESTER_REGISTRY = {
  // Format: CODE: { name, contact, sentDate, segment, notes }
  // Fill these in as you assign codes:
  // 'SPARK2026':  { name: 'Marcus J.', contact: '@marcus_ig', sentDate: '2026-06-10', notes: 'Drives Spark in FW' },
  // 'TCCBETA':    { name: 'Sarah K.',  contact: '817-555-0100', sentDate: '2026-06-10', notes: 'TCC classmate' },
};

// ── Beta week schedule ────────────────────────────────────────────────────────
const BETA_SCHEDULE = [
  { week: 1, action: 'Onboarding check',    message: "Hey [name] — did you get set up okay? Anything confusing about the onboarding?",                                          timing: '3 days after invite' },
  { week: 2, action: 'First impression',    message: "Quick check-in — what's the first thing Nova told you that you didn't already know?",                                    timing: 'Day 7' },
  { week: 3, action: 'Passive observation', message: null,                                                                                                                      timing: 'Watch who comes back without a nudge' },
  { week: 4, action: 'Exit survey',         message: "Last check-in! 5 quick questions:\n1. Did you come back week 2 without me nudging?\n2. What tab did you use most?\n3. What did Nova get right?\n4. What confused you?\n5. Would you pay $8/month?", timing: 'Day 28' },
];

function StatCard({ value, label, color, sub }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 18px', textAlign: 'center' }}>
      <div style={{ fontSize: 32, fontFamily: "'DM Mono',monospace", fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: T.text, fontWeight: 600, marginBottom: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: T.muted }}>{sub}</div>}
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{ background: copied ? `${T.green}22` : T.surface, border: `1px solid ${copied ? T.green : T.border}`, borderRadius: 6, padding: '4px 10px', fontSize: 10, color: copied ? T.green : T.muted, cursor: 'pointer', fontFamily: "'DM Mono',monospace", flexShrink: 0 }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

export default function BetaAdmin({ onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [filter,    setFilter]    = useState('all');
  const stats     = getBetaStats();
  const bySegment = getCodesBySegment();

  const assignedCount = Object.values(TESTER_REGISTRY).length;
  const segments = Object.entries(SEGMENT_CONFIG).filter(([k]) => !['general','reserve'].includes(k));

  const allCodes = Object.entries(BETA_CODES).map(([code, meta]) => ({
    code, ...meta,
    tester: TESTER_REGISTRY[code] || null,
  }));

  const filtered = filter === 'all'
    ? allCodes.filter(c => c.segment !== 'reserve')
    : allCodes.filter(c => c.segment === filter);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;800;900&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Header */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        {onBack && <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 18 }}>←</button>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontFamily: "'Fraunces',serif", fontWeight: 900, color: T.text }}>
            Zero<span style={{ color: T.accent }}>fi</span>
            <span style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Mono',monospace", marginLeft: 10 }}>Beta Management</span>
          </div>
          <div style={{ fontSize: 9, color: T.red, fontFamily: "'DM Mono',monospace", marginTop: 1, letterSpacing: '0.08em' }}>ADMIN ONLY</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontFamily: "'DM Mono',monospace", fontWeight: 700, color: T.green }}>{assignedCount}<span style={{ fontSize: 13, color: T.muted }}>/{stats.available} sent</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '0 16px', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[['overview','Overview'],['codes','Beta Codes'],['schedule','Check-in Schedule'],['survey','Exit Survey']].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{ padding: '11px 14px', background: 'none', border: 'none', borderBottom: activeTab === key ? `2px solid ${T.accent}` : '2px solid transparent', color: activeTab === key ? T.text : T.muted, cursor: 'pointer', fontSize: 11, fontFamily: "'DM Mono',monospace", whiteSpace: 'nowrap' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <StatCard value={assignedCount}      label="Codes Sent"   color={T.green}  sub="testers invited" />
              <StatCard value={stats.available - assignedCount} label="Slots Left" color={T.accent} sub="ready to assign" />
              <StatCard value={stats.total}         label="Total Codes"  color={T.purple} sub={`incl. ${stats.reserve} reserve`} />
              <StatCard value="30"                  label="Day Goal"     color={T.amber}  sub="beta duration" />
            </div>

            {/* Segment coverage */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 4 }}>Segment Coverage</div>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 16 }}>Target: 15-30 testers across all segments</div>
              {segments.map(([key, seg]) => {
                const segCodes  = bySegment[key] || [];
                const assigned  = segCodes.filter(c => TESTER_REGISTRY[c.code]).length;
                const total     = segCodes.length;
                const pct       = total > 0 ? (assigned / total) * 100 : 0;
                return (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 16 }}>{seg.icon}</span>
                        <span style={{ fontSize: 13, color: T.text }}>{seg.label}</span>
                        <span style={{ fontSize: 10, color: T.muted, fontFamily: "'DM Mono',monospace" }}>target: {seg.target}</span>
                      </div>
                      <span style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color: seg.color }}>{assigned}/{total}</span>
                    </div>
                    <div style={{ background: T.faint, borderRadius: 99, height: 7, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: seg.color, borderRadius: 99, transition: 'width .5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* The metric that matters */}
            <div style={{ background: `${T.amber}11`, border: `1px solid ${T.amber}33`, borderRadius: 14, padding: '18px 20px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.amber, marginBottom: 8 }}>🎯 The Metric That Matters Most</div>
              <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.7 }}>
                <strong style={{ color: T.text }}>Week 2 retention without a nudge.</strong> Not downloads. Not signups. Not compliments.<br />
                If 8 out of 20 people open Zerofi in week 2 without you texting them — that's a real product.<br />
                If it's 2 out of 20 — Nova isn't landing yet. Find out why before building anything else.
              </div>
            </div>
          </div>
        )}

        {/* ── BETA CODES ────────────────────────────────────────────────────── */}
        {activeTab === 'codes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Segment filter */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[['all','All'], ...Object.entries(SEGMENT_CONFIG).filter(([k]) => k !== 'reserve').map(([k, v]) => [k, v.label])].map(([key, label]) => (
                <button key={key} onClick={() => setFilter(key)} style={{ background: filter === key ? `${T.accent}22` : T.card, border: `1px solid ${filter === key ? T.accent : T.border}`, borderRadius: 20, padding: '5px 12px', fontSize: 11, color: filter === key ? T.accent : T.muted, cursor: 'pointer', fontFamily: "'DM Mono',monospace" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Code list */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, overflow: 'hidden' }}>
              {filtered.map((item, i) => {
                const seg = SEGMENT_CONFIG[item.segment];
                const assigned = !!item.tester;
                return (
                  <div key={item.code} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < filtered.length - 1 ? `1px solid ${T.faint}` : 'none', background: assigned ? `${T.green}06` : 'transparent' }}>

                    {/* Segment icon */}
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${seg?.color || T.muted}22`, border: `1px solid ${seg?.color || T.muted}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                      {seg?.icon || '⭐'}
                    </div>

                    {/* Code + segment */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, color: T.text, fontWeight: 600 }}>{item.code}</span>
                        <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", background: `${seg?.color || T.muted}22`, color: seg?.color || T.muted, border: `1px solid ${seg?.color || T.muted}33`, borderRadius: 20, padding: '1px 7px' }}>{seg?.label || item.segment}</span>
                        {assigned && <span style={{ fontSize: 10, color: T.green, fontFamily: "'DM Mono',monospace" }}>✓ sent</span>}
                      </div>
                      {item.tester
                        ? <div style={{ fontSize: 11, color: T.muted }}>{item.tester.name} · {item.tester.contact} · Sent {item.tester.sentDate}</div>
                        : <div style={{ fontSize: 11, color: T.faint }}>{item.notes}</div>
                      }
                    </div>

                    <CopyButton text={item.code} />
                  </div>
                );
              })}
            </div>

            {/* How to assign */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 8 }}>How to assign a code</div>
              <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.7 }}>
                When you give someone a code, open <code style={{ background: T.bg, padding: '1px 5px', borderRadius: 4, color: T.accent }}>src/utils/betaCode.js</code> and add them to the <code style={{ background: T.bg, padding: '1px 5px', borderRadius: 4, color: T.accent }}>TESTER_REGISTRY</code>:<br /><br />
                <code style={{ background: T.bg, padding: '8px 12px', borderRadius: 8, display: 'block', color: T.green, fontSize: 11, lineHeight: 1.8 }}>
                  {'\'SPARK2026\': { name: \'Marcus J.\', contact: \'@marcus_ig\', sentDate: \'2026-06-10\', notes: \'Drives Spark in FW\' },'}
                </code>
              </div>
            </div>
          </div>
        )}

        {/* ── CHECK-IN SCHEDULE ─────────────────────────────────────────────── */}
        {activeTab === 'schedule' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 4 }}>30-Day Beta Check-in Plan</div>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 20 }}>Follow this sequence for every tester. Don't over-communicate — let them use it naturally.</div>

              {BETA_SCHEDULE.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: i < BETA_SCHEDULE.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${T.accent}22`, border: `2px solid ${T.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: T.accent, flexShrink: 0, fontFamily: "'DM Mono',monospace" }}>W{item.week}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{item.action}</span>
                      <span style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Mono',monospace" }}>{item.timing}</span>
                    </div>
                    {item.message
                      ? <div style={{ background: T.bg, borderRadius: 10, padding: '12px 14px', fontSize: 12, color: T.muted, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                          {item.message}
                          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                            <CopyButton text={item.message} />
                          </div>
                        </div>
                      : <div style={{ background: `${T.amber}11`, border: `1px solid ${T.amber}33`, borderRadius: 10, padding: '12px 14px', fontSize: 12, color: T.amber, lineHeight: 1.6 }}>
                          👀 Don't message them this week. Watch who comes back on their own.<br />
                          The people who open Zerofi without a nudge are your real users.
                        </div>
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EXIT SURVEY ───────────────────────────────────────────────────── */}
        {activeTab === 'survey' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 4 }}>Week 4 Exit Survey</div>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 20 }}>Send this after 28 days. Keep it to 5 questions — respect their time.</div>

              {[
                { q: '1. Did you come back week 2 without me reminding you?',          type: 'Yes / No',       why: 'This is the retention signal. The most important answer you get.' },
                { q: '2. Which tab did you use the most?',                             type: 'Open answer',    why: 'Tells you where the real value is. Not where you think it is.' },
                { q: '3. What did Nova tell you that you didn\'t already know?',       type: 'Open answer',    why: 'Validates whether Nova is creating insight or just reflecting data.' },
                { q: '4. What confused you or felt broken?',                           type: 'Open answer',    why: 'Your product roadmap. The most honest feedback you\'ll get.' },
                { q: '5. Would you pay $8/month for Zerofi? Why or why not?',          type: 'Open answer',    why: 'The willingness-to-pay signal. "No" answers are more valuable than "Yes."' },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: i < 4 ? `1px solid ${T.faint}` : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.text, flex: 1, paddingRight: 12 }}>{item.q}</span>
                    <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", background: `${T.accent}18`, color: T.accent, border: `1px solid ${T.accent}33`, borderRadius: 20, padding: '2px 8px', flexShrink: 0 }}>{item.type}</span>
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5, padding: '8px 10px', background: T.bg, borderRadius: 8, borderLeft: `3px solid ${T.accent}44` }}>
                    💡 Why this question: {item.why}
                  </div>
                </div>
              ))}

              <div style={{ background: `${T.green}11`, border: `1px solid ${T.green}33`, borderRadius: 10, padding: '14px 16px', marginTop: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.green, marginBottom: 6 }}>After you collect responses</div>
                <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.7 }}>
                  Count how many answered "Yes" to Q1. That's your retention rate.<br />
                  Look for patterns in Q2 — if everyone says the same tab, double down on it.<br />
                  Q4 is your roadmap. Build what they say is broken or confusing.<br />
                  Q5 "No" answers — ask one follow-up: "What would make it worth $8?"
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
