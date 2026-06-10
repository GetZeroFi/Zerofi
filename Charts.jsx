// ── Zerofi Charts — pure SVG, zero dependencies ──────────────────────────────
// All charts are responsive SVG. No chart library needed.

import { fmt } from '../utils/format';

// ── Sparkline ─────────────────────────────────────────────────────────────────
export function Sparkline({ data = [], color = '#10b981', height = 48, width = 140, showDots = false }) {
  if (!data || data.length < 2) return null;
  const values = data.map(d => (typeof d === 'number' ? d : d.value));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const last = pts.split(' ').at(-1).split(',');
  const trend = values.at(-1) >= values.at(-2);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />
      {showDots && values.map((v, i) => {
        const x = (i / (values.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 4) - 2;
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color} opacity="0.6" />;
      })}
      <circle cx={last[0]} cy={last[1]} r="4" fill={color} />
    </svg>
  );
}

// ── Area Chart ────────────────────────────────────────────────────────────────
export function AreaChart({ data = [], color = '#10b981', height = 120, label = '', T }) {
  if (!data || data.length < 2) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T?.muted, fontSize: 12, fontFamily: "'DM Mono',monospace" }}>
      Not enough data yet
    </div>
  );
  const values = data.map(d => typeof d === 'number' ? d : d.value);
  const labels = data.map(d => d.label || d.date?.slice(5) || '');
  const min = Math.min(0, ...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 600; const H = height;
  const pad = { t: 10, r: 10, b: 28, l: 50 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;

  const toX = i => pad.l + (i / (values.length - 1)) * iW;
  const toY = v => pad.t + iH - ((v - min) / range) * iH;

  const linePts = values.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
  const areaPts = [
    `${toX(0).toFixed(1)},${toY(min).toFixed(1)}`,
    ...values.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`),
    `${toX(values.length - 1).toFixed(1)},${toY(min).toFixed(1)}`,
  ].join(' ');

  const yGridLines = [0, 0.25, 0.5, 0.75, 1].map(p => min + p * range);
  const showEvery = Math.ceil(values.length / 6);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      {/* Grid lines */}
      {yGridLines.map((v, i) => (
        <g key={i}>
          <line x1={pad.l} y1={toY(v)} x2={W - pad.r} y2={toY(v)}
            stroke={T?.border || '#1e2d47'} strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
          <text x={pad.l - 6} y={toY(v) + 4} textAnchor="end" fill={T?.muted || '#5a7094'}
            fontSize="11" fontFamily="'DM Mono',monospace">
            {v >= 1000 ? `${(v/1000).toFixed(0)}k` : v.toFixed(0)}
          </text>
        </g>
      ))}
      {/* Area fill */}
      <polygon points={areaPts} fill={color} opacity="0.12" />
      {/* Line */}
      <polyline points={linePts} fill="none" stroke={color} strokeWidth="2.5"
        strokeLinejoin="round" strokeLinecap="round" />
      {/* X labels */}
      {labels.map((l, i) => i % showEvery === 0 && (
        <text key={i} x={toX(i)} y={H - 6} textAnchor="middle"
          fill={T?.muted || '#5a7094'} fontSize="10" fontFamily="'DM Mono',monospace">
          {l}
        </text>
      ))}
      {/* Last value dot + label */}
      <circle cx={toX(values.length - 1)} cy={toY(values.at(-1))} r="5" fill={color} />
      <text x={toX(values.length - 1)} y={toY(values.at(-1)) - 10} textAnchor="middle"
        fill={color} fontSize="11" fontFamily="'DM Mono',monospace" fontWeight="700">
        {fmt(values.at(-1))}
      </text>
    </svg>
  );
}

// ── Bar Chart ─────────────────────────────────────────────────────────────────
export function BarChart({ data = [], color = '#3b82f6', height = 120, T }) {
  if (!data || data.length === 0) return null;
  const values = data.map(d => typeof d === 'number' ? d : d.value);
  const labels = data.map(d => d.label || '');
  const max = Math.max(...values, 1);
  const W = 600; const H = height;
  const pad = { t: 10, r: 10, b: 28, l: 10 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;
  const barW = Math.max(4, iW / values.length - 4);
  const gap = iW / values.length;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      {values.map((v, i) => {
        const barH = (v / max) * iH;
        const x = pad.l + i * gap + (gap - barW) / 2;
        const y = pad.t + iH - barH;
        const isLast = i === values.length - 1;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH}
              fill={isLast ? color : `${color}66`} rx="3" />
            <text x={x + barW / 2} y={H - 6} textAnchor="middle"
              fill={T?.muted || '#5a7094'} fontSize="10" fontFamily="'DM Mono',monospace">
              {labels[i]}
            </text>
            {isLast && (
              <text x={x + barW / 2} y={y - 6} textAnchor="middle"
                fill={color} fontSize="11" fontFamily="'DM Mono',monospace" fontWeight="700">
                {fmt(v)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Donut Chart ───────────────────────────────────────────────────────────────
export function DonutChart({ segments = [], size = 120, thickness = 22, label, sublabel }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let offset = 0;
  const R = (size - thickness) / 2;
  const C = size / 2;
  const circumference = 2 * Math.PI * R;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      {segments.map((s, i) => {
        const pct = s.value / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const el = (
          <circle key={i} cx={C} cy={C} r={R}
            fill="none" stroke={s.color} strokeWidth={thickness}
            strokeDasharray={`${dash.toFixed(2)} ${gap.toFixed(2)}`}
            strokeDashoffset={-offset * circumference}
            strokeLinecap="butt" />
        );
        offset += pct;
        return el;
      })}
      {/* Center text — rotated back */}
      {label && (
        <text x={C} y={C} textAnchor="middle" dominantBaseline="middle"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${C}px ${C}px` }}
          fill="currentColor" fontSize="13" fontWeight="700"
          fontFamily="'DM Mono',monospace">
          {label}
        </text>
      )}
    </svg>
  );
}

// ── Debt Payoff Progress Bar ──────────────────────────────────────────────────
export function DebtProgress({ name, original, current, color, T }) {
  const pct = Math.min(100, ((original - current) / original) * 100);
  const paid = original - current;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: T.text }}>{name}</span>
        <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color }}>
          {fmt(paid)} paid · {pct.toFixed(0)}%
        </span>
      </div>
      <div style={{ background: T.faint, borderRadius: 99, height: 8, overflow: 'hidden', position: 'relative' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg,${color},${color}cc)`, borderRadius: 99, transition: 'width .6s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.muted, fontFamily: "'DM Mono',monospace', marginTop: 2" }}>
        <span>{fmt(current)} left</span>
        <span>started {fmt(original)}</span>
      </div>
    </div>
  );
}
