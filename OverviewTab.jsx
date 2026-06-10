// Zerofi Overview Tab — Net Worth, Weekly Goal, Bill Forecast, Nova Insights
import { useState, useEffect } from 'react';
import { fmt, sign, getWeekStart } from '../utils/format';
import { save, load, KEYS } from '../utils/storage';
import { NOVA } from '../utils/constants';
import { Card, Label, BigVal, Tag, Bar } from '../components/UI';
import { generateInsights } from '../services/novaEngine';
import { getLimit } from '../utils/tiers';
import { FeatureLock } from '../components/UpgradePrompt';
import { Sparkline, AreaChart, BarChart, DebtProgress } from '../components/Charts';

const NET_WORTH_KEY = 'zerofi_networth_history_v1';

// ── Net Worth History ─────────────────────────────────────────────────────────
function useNetWorthHistory(netWorth) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const stored = load(NET_WORTH_KEY) || [];
    const today = new Date().toISOString().slice(0, 10);
    const existing = stored.findIndex(h => h.date === today);
    let updated;
    if (existing >= 0) {
      updated = stored.map((h, i) => i === existing ? { ...h, value: netWorth } : h);
    } else {
      updated = [...stored, { date: today, value: netWorth }].slice(-90); // 90-day history
    }
    setHistory(updated);
    save(NET_WORTH_KEY, updated);
  }, [netWorth]);

  return history;
}

// ── Main OverviewTab ──────────────────────────────────────────────────────────
function OverviewTab(props) {
  const { T, ut, totalCash, totalDebt, totalBudget, totalStocks, totalSavings,
  netWorth, weekEarned, weeklyGoal, goalMet, weekBonus, runwayDays, runwayColor,
  dailyBurn, taxJar, taxRate, todayIncome, userType, debts, debtBals,
  upcomingDues, goals, colors, mileDeduction, incLog, config,
  userTier, onUpgrade } = props;

  const accentColor = ut?.color || T.accent;
  const runDate = new Date();
  runDate.setDate(runDate.getDate() + Math.floor(runwayDays));
  const monthsRunway = totalBudget > 0 ? totalCash / totalBudget : 0;
  const netWorthHistory = useNetWorthHistory(netWorth);
  const netWorthChange = netWorthHistory.length >= 2
    ? netWorth - netWorthHistory[netWorthHistory.length - 2]?.value
    : 0;

  const insights = generateInsights({
    totalCash, totalDebt, totalBudget, totalSavings, totalStocks,
    netWorth, weekEarned, weeklyGoal, runwayDays, upcomingDues,
    goals, incLog, taxRate, mileDeduction, userType, config,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Net Worth ── */}
      <Card T={T} style={{ borderColor: `${netWorth >= 0 ? T.green : T.red}44` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Label T={T}>Net Worth</Label>
            <BigVal T={T} color={netWorth >= 0 ? T.green : T.red} size={32}>{fmt(netWorth)}</BigVal>
            <div style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color: netWorthChange >= 0 ? T.green : T.red, marginTop: 4 }}>
              {sign(netWorthChange)}{fmt(netWorthChange)} since yesterday
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Sparkline data={netWorthHistory} color={netWorth >= 0 ? T.green : T.red} />
            <div style={{ fontSize: 9, color: T.muted, fontFamily: "'DM Mono',monospace", marginTop: 4 }}>
              {netWorthHistory.length} day{netWorthHistory.length !== 1 ? 's' : ''} tracked
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
          {[
            { label: 'Cash',    value: totalCash,    color: T.teal   },
            { label: 'Stocks',  value: totalStocks,  color: T.green  },
            { label: 'Savings', value: totalSavings,  color: T.purple },
            { label: 'Debt',    value: -totalDebt,   color: T.red    },
          ].map(r => (
            <div key={r.label} style={{ background: T.bg, borderRadius: 8, padding: '8px 10px' }}>
              <div style={{ fontSize: 9, color: T.muted, fontFamily: "'DM Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{r.label}</div>
              <div style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", color: r.color, fontWeight: 700 }}>{fmt(Math.abs(r.value))}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Weekly Income Goal ── */}
      <Card T={T} style={{ borderColor: goalMet ? `${T.green}44` : T.border }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <Label T={T}>Weekly Income Goal (Mon–Sun)</Label>
            <BigVal T={T} color={goalMet ? T.green : T.text} size={26}>{fmt(weekEarned)}</BigVal>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
              of {fmt(weeklyGoal)} · {goalMet ? '🎉 Goal met!' : fmt(Math.max(0, weeklyGoal - weekEarned)) + ' to go'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {goalMet
              ? <Tag color={T.green} bg={T.greenLt}>✓ Done</Tag>
              : <div>
                  <div style={{ fontSize: 9, color: T.muted, fontFamily: "'DM Mono',monospace", marginBottom: 2 }}>today</div>
                  <div style={{ fontSize: 16, fontFamily: "'DM Mono',monospace", color: accentColor, fontWeight: 700 }}>{fmt(todayIncome)}</div>
                </div>
            }
          </div>
        </div>
        <div style={{ position: 'relative', marginBottom: 4 }}>
          <div style={{ background: T.faint, borderRadius: 99, height: 10, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min((weekEarned / (weeklyGoal || 1)) * 100, 100)}%`, height: '100%', background: goalMet ? `linear-gradient(90deg,${T.green},${T.teal})` : `linear-gradient(90deg,${accentColor},${T.purple})`, borderRadius: 99, transition: 'width .6s ease' }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: "'DM Mono',monospace", color: T.muted }}>
          <span>$0</span>
          <span>{weeklyGoal > 0 ? Math.round((weekEarned / weeklyGoal) * 100) : 0}%</span>
          <span>{fmt(weeklyGoal)}</span>
        </div>
        {weekBonus > 0 && (
          <div style={{ marginTop: 8, padding: '8px 10px', background: T.greenLt, borderRadius: 8, fontSize: 12, color: T.green }}>
            🎉 {fmt(weekBonus)} above goal — put it toward your highest-APR debt!
          </div>
        )}
      </Card>

      {/* ── Bill Forecast ── */}
      <Card T={T}>
        <Label T={T}>Bill Forecast</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
          <div style={{ background: T.bg, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 9, color: T.muted, fontFamily: "'DM Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Monthly Bills</div>
            <div style={{ fontSize: 20, fontFamily: "'DM Mono',monospace", color: T.amber, fontWeight: 700 }}>{fmt(totalBudget)}</div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>fixed expenses</div>
          </div>
          <div style={{ background: T.bg, borderRadius: 10, padding: '12px 14px', borderLeft: `3px solid ${monthsRunway >= 3 ? T.green : monthsRunway >= 1 ? T.amber : T.red}` }}>
            <div style={{ fontSize: 9, color: T.muted, fontFamily: "'DM Mono',monospace", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Cash Covers</div>
            <div style={{ fontSize: 20, fontFamily: "'DM Mono',monospace", color: monthsRunway >= 3 ? T.green : monthsRunway >= 1 ? T.amber : T.red, fontWeight: 700 }}>
              {monthsRunway.toFixed(1)}mo
            </div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>of bills · {monthsRunway >= 3 ? '✓ healthy' : monthsRunway >= 1 ? 'building' : 'low'}</div>
          </div>
        </div>
        {totalBudget > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.muted, marginBottom: 4 }}>
              <span>0 months</span>
              <span style={{ color: monthsRunway >= 3 ? T.green : T.amber }}>{monthsRunway.toFixed(1)} months covered</span>
              <span>3 months (goal)</span>
            </div>
            <Bar value={monthsRunway} max={3} color={monthsRunway >= 3 ? T.green : monthsRunway >= 1 ? T.amber : T.red} T={T} height={8} />
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, padding: '8px 0', borderTop: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 11, color: T.muted }}>Daily burn rate</div>
          <div style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", color: T.amber }}>{fmt(dailyBurn)}/day → {Math.floor(runwayDays)} days runway</div>
        </div>
      </Card>

      {/* ── Nova Insights ── */}
      {insights.length > 0 && (
        <Card T={T} style={{ borderColor: `${T.nova}44` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: T.novaGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🌟</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Nova's Insights</div>
              <div style={{ fontSize: 10, color: T.nova, fontFamily: "'DM Mono',monospace" }}>based on your current data</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {insights.slice(0, props.userTier === 'free' ? 1 : insights.length).map((ins, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: T.bg, borderRadius: 10, borderLeft: `3px solid ${ins.color}` }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{ins.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 3 }}>{ins.title}</div>
                  <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.55 }}>{ins.body}</div>
                </div>
              </div>
            ))}
          </div>
          {userTier === 'free' && insights.length > 1 && (
            <div onClick={() => onUpgrade?.('novaInsights')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: T.bg, borderRadius: 10, cursor: 'pointer', border: `1px dashed ${T.border}`, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: T.muted }}>🌟 {insights.length - 1} more insight{insights.length - 1 !== 1 ? 's' : ''} available in Plus</span>
              <span style={{ fontSize: 11, color: '#3b82f6', fontFamily: "'DM Mono',monospace" }}>Upgrade →</span>
            </div>
          )}
        </Card>
      )}

      {/* ── Upcoming bills ── */}
      {upcomingDues.length > 0 && (
        <Card T={T} style={{ borderColor: `${T.red}44`, background: T.redLt }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
            <span>🔔</span><Label T={T}>Bills Due Soon</Label>
          </div>
          {upcomingDues.map(d => (
            <div key={d.id || d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${T.red}22` }}>
              <div>
                <span style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{d.name}</span>
                <span style={{ fontSize: 11, color: T.red, marginLeft: 8 }}>{d.daysUntil === 0 ? 'Due TODAY' : `in ${d.daysUntil}d`}</span>
              </div>
              <span style={{ fontFamily: "'DM Mono',monospace", color: T.red, fontSize: 13, fontWeight: 600 }}>{fmt(d.monthly)}</span>
            </div>
          ))}
        </Card>
      )}

      {/* ── Goals preview ── */}
      {goals?.length > 0 && goals.some(g => g.target > 0) && (
        <Card T={T}>
          <Label T={T}>Savings Goals</Label>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {goals.filter(g => g.target > 0).map((g, i) => (
              <div key={g.id || i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: T.text }}>{g.icon} {g.name}</span>
                  <span style={{ fontSize: 12, fontFamily: "'DM Mono',monospace", color: colors[i % colors.length] }}>{fmt(g.saved)} / {fmt(g.target)}</span>
                </div>
                <Bar value={g.saved} max={g.target} color={colors[i % colors.length]} T={T} height={6} />
              </div>
            ))}
          </div>
          {userTier === 'free' && insights.length > 1 && (
            <div onClick={() => onUpgrade?.('novaInsights')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: T.bg, borderRadius: 10, cursor: 'pointer', border: `1px dashed ${T.border}`, marginTop: 4 }}>
              <span style={{ fontSize: 12, color: T.muted }}>🌟 {insights.length - 1} more insight{insights.length - 1 !== 1 ? 's' : ''} available in Plus</span>
              <span style={{ fontSize: 11, color: '#3b82f6', fontFamily: "'DM Mono',monospace" }}>Upgrade →</span>
            </div>
          )}
        </Card>
      )}

    </div>
  );
}

export default OverviewTab;

