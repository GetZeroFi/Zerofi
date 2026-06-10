// ── Nova Insights Engine ──────────────────────────────────────────────────────
// Generates contextual, actionable financial insights based on user data.
// Separated from UI so it can be tested independently and eventually
// replaced with a real AI call when ready.
//
// Each insight has:
//   type:  'urgent' | 'warning' | 'win' | 'progress' | 'advice' | 'info'
//   icon:  emoji
//   title: short headline
//   body:  specific, dollar-level explanation
//   color: hex color for the left border

import { fmt } from './format';
import { NOVA_TAGLINES } from './constants';

// ── Helper: days left in current Mon–Sun week ─────────────────────────────────
function daysLeftInWeek() {
  const day = new Date().getDay(); // 0=Sun
  return day === 0 ? 0 : 7 - day;
}

// ── Helper: next quarterly tax deadline ───────────────────────────────────────
function nextQuarterDeadline() {
  const now = new Date();
  const year = now.getFullYear();
  const deadlines = [
    new Date(year, 3, 15),
    new Date(year, 5, 15),
    new Date(year, 8, 15),
    new Date(year + 1, 0, 15),
  ];
  return deadlines.find(d => d > now) || deadlines[3];
}

// ── Main insight generator ────────────────────────────────────────────────────
export function generateInsights(ctx) {
  const {
    totalCash = 0,
    totalDebt = 0,
    totalBudget = 0,
    totalSavings = 0,
    totalStocks = 0,
    netWorth = 0,
    weekEarned = 0,
    weeklyGoal = 0,
    runwayDays = 0,
    upcomingDues = [],
    goals = [],
    incLog = [],
    taxRate = 25,
    mileDeduction = 0,
    userType = 'individual',
    config = {},
  } = ctx;

  const insights = [];
  const daysLeft       = daysLeftInWeek();
  const weeklyProgress = weeklyGoal > 0 ? (weekEarned / weeklyGoal) * 100 : 0;
  const dailyNeeded    = daysLeft > 0 ? Math.max(0, weeklyGoal - weekEarned) / daysLeft : 0;
  const monthsRunway   = totalBudget > 0 ? totalCash / totalBudget : 0;
  const ytdIncome      = incLog.reduce((a, b) => a + b.amount, 0);
  const today          = new Date().getDay();  // 0=Sun
  const isLateWeek     = today >= 4 || today === 0; // Thu–Sun
  const nextQDate      = nextQuarterDeadline();
  const daysToQ        = Math.ceil((nextQDate - new Date()) / (1000 * 60 * 60 * 24));

  // ── 1. Upcoming bill alerts (highest priority) ─────────────────────────────
  const todayDue = upcomingDues.find(d => d.daysUntil === 0);
  const soonDue  = upcomingDues.find(d => d.daysUntil > 0 && d.daysUntil <= 3);

  if (todayDue) {
    insights.push({
      type: 'urgent', icon: '🔔',
      title: `${todayDue.name} is due TODAY`,
      body: `${fmt(todayDue.monthly)} is due today. ${totalCash >= todayDue.monthly ? `You have ${fmt(totalCash)} — you're covered.` : `You're ${fmt(todayDue.monthly - totalCash)} short. Focus on income today.`}`,
      color: '#ef4444',
    });
  } else if (soonDue) {
    insights.push({
      type: 'warning', icon: '🔔',
      title: `${soonDue.name} due in ${soonDue.daysUntil} day${soonDue.daysUntil === 1 ? '' : 's'}`,
      body: `${fmt(soonDue.monthly)} due on the ${soonDue.dueDay}th. ${totalCash >= soonDue.monthly ? 'You have enough to cover it.' : `You're ${fmt(soonDue.monthly - totalCash)} short — prioritize income before then.`}`,
      color: '#f59e0b',
    });
  }

  // ── 2. Runway (critical if under 7 days) ──────────────────────────────────
  if (runwayDays < 7) {
    insights.push({
      type: 'urgent', icon: '⚠️',
      title: `${Math.floor(runwayDays)}-day cash runway`,
      body: `At your current burn rate, you have ${Math.floor(runwayDays)} days of cash left. Income this week is the priority — everything else waits.`,
      color: '#ef4444',
    });
  }

  // ── 3. Weekly goal tracking ───────────────────────────────────────────────
  if (weeklyGoal > 0) {
    if (weeklyProgress >= 100) {
      const bonus = weekEarned - weeklyGoal;
      const highAPR = config?.debts?.filter(d => d.apr >= 20).sort((a, b) => b.apr - a.apr)[0];
      insights.push({
        type: 'win', icon: '🎉',
        title: 'Weekly goal hit!',
        body: `${fmt(weekEarned)} earned — ${fmt(bonus)} above your ${fmt(weeklyGoal)} goal.${highAPR ? ` Throw that extra at ${highAPR.name} (${highAPR.apr}% APR) before the week ends.` : ' Great week.'}`,
        color: '#10b981',
      });
    } else if (weeklyProgress < 50 && isLateWeek) {
      insights.push({
        type: 'warning', icon: '⚡',
        title: 'Behind on weekly goal',
        body: `${fmt(weekEarned)} of ${fmt(weeklyGoal)} with ${daysLeft} day${daysLeft === 1 ? '' : 's'} left. You need ${fmt(dailyNeeded)}/day to hit it. ${userType === 'gig' ? 'Dinner rush (5–9pm) is your best window.' : 'What can you do today to close the gap?'}`,
        color: '#f59e0b',
      });
    } else if (weeklyProgress >= 50 && weeklyProgress < 100) {
      insights.push({
        type: 'progress', icon: '📈',
        title: `${Math.round(weeklyProgress)}% to weekly goal`,
        body: `${fmt(weekEarned)} earned. ${daysLeft > 0 ? `${fmt(dailyNeeded)}/day keeps you on track.` : 'Last day of the week — push for the finish.'}`,
        color: '#3b82f6',
      });
    }
  }

  // ── 4. Bill forecast / savings coverage ───────────────────────────────────
  if (totalBudget > 0 && runwayDays >= 7) {
    if (monthsRunway >= 3) {
      insights.push({
        type: 'win', icon: '🛡️',
        title: `${monthsRunway.toFixed(1)} months of bills covered`,
        body: `${fmt(totalCash)} covers ${monthsRunway.toFixed(1)} months of expenses. You're in a healthy spot. Next move: make sure that cash is earning interest (HYSA).`,
        color: '#10b981',
      });
    } else if (monthsRunway < 1) {
      insights.push({
        type: 'warning', icon: '📅',
        title: 'Less than 1 month of bills saved',
        body: `${fmt(totalCash)} covers ${monthsRunway.toFixed(1)} months of ${fmt(totalBudget)}/mo in expenses. Target is 3 months — ${fmt(Math.max(0, (3 - monthsRunway) * totalBudget))} to go. Even $50/week into savings moves this.`,
        color: '#f59e0b',
      });
    }
  }

  // ── 5. High-APR debt + extra income ───────────────────────────────────────
  if (weeklyProgress >= 100 && config?.debts?.length > 0) {
    const highAPR = config.debts
      .filter(d => d.apr >= 20 && (d.balance || 0) > 0)
      .sort((a, b) => b.apr - a.apr)[0];
    if (highAPR && !insights.some(i => i.body?.includes(highAPR.name))) {
      insights.push({
        type: 'advice', icon: '💡',
        title: `Extra income → ${highAPR.name}`,
        body: `At ${highAPR.apr}% APR, ${highAPR.name} costs ${fmt(highAPR.balance * highAPR.apr / 100 / 12)}/month in interest. Every extra dollar here is a guaranteed ${highAPR.apr}% return.`,
        color: '#a78bfa',
      });
    }
  }

  // ── 6. Net worth milestone ─────────────────────────────────────────────────
  if (netWorth > 0 && netWorth < 1000) {
    insights.push({
      type: 'progress', icon: '📊',
      title: 'Positive net worth',
      body: `Net worth is ${fmt(netWorth)} — positive territory. Every debt payment and dollar saved grows this number. Check the History tab to see the trend.`,
      color: '#3b82f6',
    });
  }

  // ── 7. Quarterly tax reminder ─────────────────────────────────────────────
  if ((userType === 'gig' || userType === 'individual') && ytdIncome > 0 && daysToQ <= 30) {
    const estimated = ytdIncome * 0.153 + (ytdIncome * (taxRate / 100));
    insights.push({
      type: 'warning', icon: '🧾',
      title: `Quarterly tax due in ${daysToQ} day${daysToQ === 1 ? '' : 's'}`,
      body: `Estimated ~${fmt(estimated / 4)} due for this quarter based on ${fmt(ytdIncome)} logged. Check your Tax tab for the full breakdown and payment options.`,
      color: '#f59e0b',
    });
  }

  // ── 8. Mileage deduction reminder (gig) ───────────────────────────────────
  if (userType === 'gig' && mileDeduction > 500 && incLog.length > 0) {
    insights.push({
      type: 'info', icon: '🚗',
      title: `${fmt(mileDeduction)} in mileage deductions`,
      body: `That directly reduces your taxable income. Keep logging every work trip — it adds up fast at $0.67/mile.`,
      color: '#22d3ee',
    });
  }

  // ── 9. Savings milestone ──────────────────────────────────────────────────
  if (totalSavings > 0) {
    const savingsGoal = totalBudget * 3;
    if (savingsGoal > 0 && totalSavings >= savingsGoal) {
      insights.push({
        type: 'win', icon: '🏦',
        title: '3-month emergency fund reached!',
        body: `${fmt(totalSavings)} in savings covers your 3-month target. Your next move: open a Roth IRA if you haven't already — $7,000/year, tax-free growth forever.`,
        color: '#10b981',
      });
    }
  }

  // ── 10. Goals nearing completion ─────────────────────────────────────────
  const nearGoal = goals.find(g => g.target > 0 && g.saved / g.target >= 0.9 && g.saved < g.target);
  if (nearGoal) {
    insights.push({
      type: 'progress', icon: '🎯',
      title: `${nearGoal.name} is 90% there`,
      body: `Only ${fmt(nearGoal.target - nearGoal.saved)} left to hit your ${fmt(nearGoal.target)} goal. You're close — don't let up now.`,
      color: '#10b981',
    });
  }

  return insights.slice(0, 4); // cap at 4 to avoid overwhelming
}

// ── Nova greeting by user type + time of day ─────────────────────────────────
export function getNovaGreeting(userName, userType) {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const tagline = NOVA_TAGLINES[userType] || NOVA_TAGLINES.default;
  return `${timeGreeting}${userName ? `, ${userName}` : ''}. ${tagline}`;
}

// ── Nova summary sentence for Overview header ─────────────────────────────────
export function getNovaSummary(ctx) {
  const { weekEarned, weeklyGoal, runwayDays, totalDebt, netWorth } = ctx;
  const weekPct = weeklyGoal > 0 ? Math.round((weekEarned / weeklyGoal) * 100) : 0;

  if (runwayDays < 7)    return `⚠️ Under a week of runway — income is the priority right now.`;
  if (weekPct >= 100)    return `🎉 Weekly goal hit at ${weekPct}% — strong week.`;
  if (weekPct >= 75)     return `📈 At ${weekPct}% of your weekly goal — on track.`;
  if (weekPct >= 50)     return `💪 Halfway to your weekly goal — keep the momentum.`;
  if (netWorth > 0)      return `📊 Net worth positive at ${fmt(netWorth)} — moving in the right direction.`;
  return `Let's make this week count.`;
}
