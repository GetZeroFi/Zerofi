// ── Nova Persistent Sidebar / Drawer ─────────────────────────────────────────
// Nova is always reachable — not just in onboarding.
// Tap the Nova button from any tab to get contextual advice.
import { useState, useEffect } from 'react';
import { fmt, sign, getWeekStart } from '../utils/format';
import { NOVA, NOVA_TAGLINES, USER_TYPES } from '../utils/constants';
import { getNovaResponse } from '../services/novaEngine';

export default function NovaSidebar({ T, context, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = getNovaResponse('', context);
      setMessages([{ id: 'g0', text: greeting, type: 'nova' }]);
    }
  }, [isOpen]);

  const send = (text) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now() + 'u', text, type: 'user' };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const response = getNovaResponse(text, context);
      setMessages(p => [...p, { id: Date.now() + 'n', text: response, type: 'nova' }]);
      setTyping(false);
    }, 600 + Math.random() * 400);
  };

  const QUICK = ['Am I on track?', 'What should I focus on?', 'How are my debts?', 'Tax estimate'];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: '#00000066', zIndex: 200 }} />

      {/* Drawer */}
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: 420,
        background: T.surface, borderLeft: `1px solid ${T.border}`,
        zIndex: 201, display: 'flex', flexDirection: 'column',
        animation: 'slideIn .25s ease',
      }}>
        {/* Header */}
        <div style={{ background: T.card, borderBottom: `1px solid ${T.border}`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: T.novaGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{NOVA.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, fontFamily: "'Fraunces',serif" }}>{NOVA.name}</div>
            <div style={{ fontSize: 10, color: T.nova, fontFamily: "'DM Mono',monospace" }}>{NOVA.title} · {USER_TYPES[context?.userType]?.label || 'All users'}</div>
          <div style={{ fontSize: 9, color: T.muted, marginTop: 1 }}>Not a licensed financial advisor · Educational only</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.muted, fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>✕</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: m.type === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
              {m.type === 'nova' && (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: T.novaGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{NOVA.icon}</div>
              )}
              <div style={{
                maxWidth: '82%', padding: '10px 14px',
                borderRadius: m.type === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                background: m.type === 'user' ? `linear-gradient(135deg,${T.accent},#2563eb)` : T.card,
                border: m.type === 'nova' ? `1px solid ${T.border}` : 'none',
                fontSize: 13, color: T.text, lineHeight: 1.65, whiteSpace: 'pre-wrap',
              }}>{m.text}</div>
            </div>
          ))}
          {typing && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: T.novaGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{NOVA.icon}</div>
              <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '4px 16px 16px 16px', padding: '12px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0,1,2].map(i => <div key={i} className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: T.nova, animationDelay: `${i*0.2}s` }} />)}
              </div>
            </div>
          )}
        </div>

        {/* Quick prompts */}
        <div style={{ padding: '8px 16px 0', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {QUICK.map(q => (
            <button key={q} onClick={() => send(q)} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: '6px 12px', fontSize: 11, color: T.muted, fontFamily: "'DM Mono',monospace", cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>{q}</button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '10px 16px 16px', display: 'flex', gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask Nova anything…"
            style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 24, padding: '10px 16px', color: T.text, fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: 'none' }} />
          <button onClick={() => send(input)} disabled={!input.trim()}
            style={{ background: input.trim() ? T.novaGrad : T.faint, border: 'none', borderRadius: '50%', width: 42, height: 42, cursor: input.trim() ? 'pointer' : 'not-allowed', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            ➤
          </button>
        </div>
      </div>
    </>
  );
}
