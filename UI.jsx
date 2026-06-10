// ── Zerofi UI Primitives ──────────────────────────────────────────────────────

export const Card = ({ children, style = {}, T }) => (
  <div style={{
    background: T.card, border: `1px solid ${T.border}`,
    borderRadius: 16, padding: 18,
    boxShadow: `0 2px 8px ${T.bg}88`, ...style
  }}>{children}</div>
);

export const Label = ({ children, T }) => (
  <div style={{
    fontSize: 10, color: T.muted, fontFamily: "'DM Mono',monospace",
    letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 5
  }}>{children}</div>
);

export const BigVal = ({ children, color, size = 26, T }) => (
  <div style={{
    fontSize: size, fontFamily: "'Fraunces',serif",
    color: color || T.text, fontWeight: 800, lineHeight: 1.1
  }}>{children}</div>
);

export const Tag = ({ children, color, bg }) => (
  <span style={{
    fontSize: 10, fontFamily: "'DM Mono',monospace",
    background: bg, color, border: `1px solid ${color}44`,
    borderRadius: 20, padding: '2px 8px'
  }}>{children}</span>
);

export const Bar = ({ value, max, color, T, height = 7 }) => (
  <div style={{ background: T.faint, borderRadius: 99, height, overflow: 'hidden' }}>
    <div style={{
      width: `${Math.min((value / (max || 1)) * 100, 100)}%`,
      height: '100%', background: color, borderRadius: 99,
      transition: 'width .5s ease'
    }} />
  </div>
);

export const Btn = ({ children, onClick, color, bg, style = {}, disabled = false }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: bg || 'transparent', color,
    border: `1px solid ${color}66`, borderRadius: 9,
    padding: '9px 18px', fontSize: 12, fontFamily: "'DM Mono',monospace",
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1, transition: 'opacity .15s', ...style
  }}>{children}</button>
);

export const Input = ({ style = {}, T, ...props }) => (
  <input style={{
    background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: 8, padding: '9px 11px', color: T.text,
    fontSize: 13, fontFamily: 'inherit', width: '100%', ...style
  }} {...props} />
);

export const Select = ({ children, style = {}, T, ...props }) => (
  <select style={{
    background: T.surface, border: `1px solid ${T.border}`,
    borderRadius: 8, padding: '9px 11px', color: T.text,
    fontSize: 13, width: '100%', ...style
  }} {...props}>{children}</select>
);

export const Toast = ({ msg, color, T }) => (
  <div style={{
    position: 'fixed', top: 18, left: '50%', transform: 'translateX(-50%)',
    background: T.surface, border: `1px solid ${color}66`, color,
    padding: '10px 20px', borderRadius: 10, fontSize: 12,
    fontFamily: "'DM Mono',monospace", zIndex: 1000,
    whiteSpace: 'nowrap', boxShadow: '0 4px 24px #00000033'
  }}>{msg}</div>
);

export const InlineEditor = ({ value, onSave, onCancel, T, color }) => {
  const { useState } = require('react');
  const [val, setVal] = useState(String(value));
  return (
    <div style={{ display: 'flex', gap: 8, padding: '8px 10px 10px', background: T.bg, borderRadius: '0 0 10px 10px' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: T.muted, fontSize: 13 }}>$</span>
        <input autoFocus type="number" step="0.01" min="0" value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onSave(parseFloat(val)); if (e.key === 'Escape') onCancel(); }}
          style={{ width: '100%', background: T.card, border: `1px solid ${color}66`, borderRadius: 8, padding: '8px 10px 8px 22px', color: T.text, fontSize: 13, fontFamily: "'DM Mono',monospace", outline: 'none' }} />
      </div>
      <button onClick={() => onSave(parseFloat(val))} style={{ background: `${color}22`, border: `1px solid ${color}66`, color, borderRadius: 8, padding: '8px 14px', fontSize: 11, cursor: 'pointer' }}>Save</button>
      <button onClick={onCancel} style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.muted, borderRadius: 8, padding: '8px 10px', fontSize: 11, cursor: 'pointer' }}>✕</button>
    </div>
  );
};
