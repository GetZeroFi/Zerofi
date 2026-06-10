// ── Zerofi Formatting Utilities ───────────────────────────────────────────────

export const fmt = (n) =>
  Number(n || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export const fmtPct = (n) => `${Number(n || 0).toFixed(1)}%`;

export const sign = (n) => (n >= 0 ? '+' : '');

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

export const getWeekStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
};

export const getDaysUntil = (dueDay) => {
  const today = new Date().getDate();
  return dueDay >= today ? dueDay - today : null;
};

export const nextQuarterDate = () => {
  const now = new Date();
  const quarters = [
    { month: 4, day: 15, label: 'Apr 15' },
    { month: 6, day: 15, label: 'Jun 15' },
    { month: 9, day: 15, label: 'Sep 15' },
    { month: 1, day: 15, label: 'Jan 15' },
  ];
  for (const q of quarters) {
    const year = q.month === 1 ? now.getFullYear() + 1 : now.getFullYear();
    if (new Date(year, q.month - 1, q.day) > now) return q.label;
  }
  return 'Apr 15';
};
