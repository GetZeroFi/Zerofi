// Zerofi History Tab — Weekly income trends, net worth, debt payoff charts
import { useState, useEffect } from 'react';
import { fmt, sign, getWeekStart } from '../utils/format';
import { save, load } from '../utils/storage';
import { Card, Label, BigVal, Tag } from '../components/UI';
import { AreaChart, BarChart, DebtProgress } from '../components/Charts';

const INCOME_HISTORY_KEY  = 'zerofi_income_history_v1';
const NETWORTH_HISTORY_KEY = 'zerofi_networth_history_v1';

function HistoryTab({ T, ut, incLog, config, totalDebt, netWorth, debtBals }) {
  const accentColor = ut?.color || T.accent;

  // ── Build weekly income history from incLog ───────────────────────────────
  const weeklyHistory = (() => {
    if (!incLog || incLog.length === 0) return [];
    const byWeek = {};
    incLog.forEach(entry => {
      const d = new Date(entry.date);
      d.setHours(0, 0, 0, 0);
      const day = d.getDay();
      d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
      const key = d.toISOString().slice(0, 10);
      byWeek[key] = (byWeek[key] || 0) + entry.amount;
    });
    return Object.entries(byWeek)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // last 12 weeks
      .map(([date, value]) => ({
        date,
        value,
        label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }));
  })();

  // ── Net worth history ─────────────────────────────────────────────────────
  const nwHistory = (load(NETWORTH_HISTORY_KEY) || [])
    .slice(-30)
    .map(h => ({ ...h, label: h.date?.slice(5) }));

  // ── Per-platform income breakdown ─────────────────────────────────────────
  const platformBreakdown = (() => {
    if (!incLog || incLog.length === 0) return [];
    const bySource = {};
    incLog.forEach(e => {
      bySource[e.sourceName] = (bySource[e.sourceName] || 0) + e.amount;
    });
    return Object.entries(bySource)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);
  })();
  const platformTotal = platformBreakdown.reduce((a, [, v]) => a + v, 0);

  // ── Debt payoff progress ──────────────────────────────────────────────────
  const debtsWithProgress = config?.debts?.filter(d => d.balance > 0 || (debtBals?.[d.id] !== undefined)) || [];

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalEarned  = incLog?.reduce((a, b) => a + b.amount, 0) || 0;
  const avgWeekly    = weeklyHistory.length > 0 ? weeklyHistory.reduce((a, w) => a + w.value, 0) / weeklyHistory.length : 0;
  const bestWeek     = weeklyHistory.length > 0 ? Math.max(...weeklyHistory.map(w => w.value)) : 0;
  const weeklyGoal   = config?.weeklyGoal || 0;
  const weeksOnGoal  = weeklyHistory.filter(w => w.value >= weeklyGoal).length;
  const nwChange30   = nwHistory.length >= 2 ? nwHistory.at(-1)?.value - nwHistory[0]?.value : 0;

  const PLATFORM_COLORS = [accentColor, T.green, T.purple, T.amber, T.teal, '#ec4899', '#f97316', '#60a5fa'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Income Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Card T={T}>
          <Label T={T}>Total Earned</Label>
          <BigVal T={T} color={T.green} size={22}>{fmt(totalEarned)}</BigVal>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>all time logged</div>
        </Card>
        <Card T={T}>
          <Label T={T}>Avg / Week</Label>
          <BigVal T={T} color={accentColor} size={22}>{fmt(avgWeekly)}</BigVal>
          <div style={{ fontSize: 11, color: avgWeekly >= weeklyGoal ? T.green : T.muted, marginTop: 2 }}>
            {weeklyGoal > 0 ? (avgWeekly >= weeklyGoal ? '✓ above goal' : `goal: ${fmt(weeklyGoal)}`) : 'last 12 weeks'}
          </div>
        </Card>
        <Card T={T}>
          <Label T={T}>Best Week</Label>
          <BigVal T={T} color={T.amber} size={22}>{fmt(bestWeek)}</BigVal>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>single week record</div>
        </Card>
        <Card T={T}>
          <Label T={T}>Weeks on Goal</Label>
          <BigVal T={T} color={weeksOnGoal > 0 ? T.green : T.muted} size={22}>{weeksOnGoal}</BigVal>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>of {weeklyHistory.length} tracked</div>
        </Card>
      </div>

      {/* ── Weekly Income Chart ── */}
      <Card T={T}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Label T={T}>Weekly Income (Last 12 Weeks)</Label>
          {weeklyGoal > 0 && <Tag color={accentColor} bg={`${accentColor}18`}>Goal: {fmt(weeklyGoal)}</Tag>}
        </div>
        {weeklyHistory.length >= 2
          ? <BarChart data={weeklyHistory} color={accentColor} height={120} T={T} />
          : <div style={{ padding: '24px 0', textAlign: 'center', color: T.muted, fontSize: 12, fontFamily: "'DM Mono',monospace" }}>Log income to see weekly trends</div>
        }
      </Card>

      {/* ── Net Worth Chart ── */}
      <Card T={T}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Label T={T}>Net Worth (Last 30 Days)</Label>
          {nwChange30 !== 0 && (
            <Tag color={nwChange30 >= 0 ? T.green : T.red} bg={nwChange30 >= 0 ? T.greenLt : T.redLt}>
              {sign(nwChange30)}{fmt(nwChange30)}
            </Tag>
          )}
        </div>
        {nwHistory.length >= 2
          ? <AreaChart data={nwHistory} color={netWorth >= 0 ? T.green : T.red} height={130} T={T} />
          : <div style={{ padding: '24px 0', textAlign: 'center', color: T.muted, fontSize: 12, fontFamily: "'DM Mono',monospace" }}>
              Net worth history builds over time. Check back tomorrow!
            </div>
        }
      </Card>

      {/* ── Platform Breakdown ── */}
      {platformBreakdown.length > 0 && (
        <Card T={T}>
          <Label T={T}>Income by Source</Label>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {platformBreakdown.map(([name, amount], i) => {
              const pct = platformTotal > 0 ? (amount / platformTotal) * 100 : 0;
              const color = PLATFORM_COLORS[i % PLATFORM_COLORS.length];
              return (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: T.text }}>{name}</span>
                    <span style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color }}>
                      {fmt(amount)} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ background: T.faint, borderRadius: 99, height: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width .5s' }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, padding: '8px 10px', background: T.bg, borderRadius: 8, fontSize: 11, color: T.muted }}>
            💡 {platformBreakdown[0]?.[0]} is your top earner at {fmt(platformBreakdown[0]?.[1])}.
            {platformBreakdown.length > 1 && ` Diversifying across platforms reduces slow-week risk.`}
          </div>
        </Card>
      )}

      {/* ── Debt Payoff Progress ── */}
      {debtsWithProgress.length > 0 && (
        <Card T={T}>
          <Label T={T}>Debt Payoff Progress</Label>
          <div style={{ marginTop: 12 }}>
            {debtsWithProgress.map(d => {
              const current = debtBals?.[d.id] ?? d.balance;
              const original = d.balance; // starting balance
              if (!original || original <= 0) return null;
              return (
                <DebtProgress
                  key={d.id}
                  name={d.name}
                  original={original}
                  current={current}
                  color={d.apr >= 20 ? T.red : d.apr >= 10 ? T.amber : T.green}
                  T={T}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', borderTop: `1px solid ${T.border}`, marginTop: 8 }}>
            <span style={{ fontSize: 12, color: T.muted }}>Total remaining</span>
            <span style={{ fontSize: 14, fontFamily: "'DM Mono',monospace", color: T.red, fontWeight: 700 }}>{fmt(totalDebt)}</span>
          </div>
        </Card>
      )}

    </div>
  );
}

export default HistoryTab;
