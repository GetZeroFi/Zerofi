// ── Nova Conversational Onboarding ────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import { THEMES } from '../utils/theme';
import { USER_TYPES, GOAL_OPTIONS, NOVA } from '../utils/constants';
import { fmt, uid } from '../utils/format';

const SCRIPT = [
  { id: 'q_type',    text: (n)    => `Nice to meet you, ${n}! 👋\n\nTo set up your dashboard, which best describes you?`,           input: 'usertype' },
  { id: 'q_theme',   text: ()     => `Got it! Quick preference — dark mode or light mode for your dashboard?`,                        input: 'theme'    },
  { id: 'q_stress',  text: (n)    => `Alright ${n}, what's your biggest financial stress right now? Just talk to me naturally.`,      input: 'freetext', key: 'stress'      },
  { id: 'q_cash',    text: ()     => `I hear you. How much do you have across all your accounts right now? (Ballpark is fine)`,       input: 'money',    key: 'totalCash'    },
  { id: 'q_income',  text: ()     => `Got it. How much do you typically earn per week on average?`,                                   input: 'money',    key: 'weeklyIncome' },
  { id: 'q_debt',    text: ()     => `Do you have any debts — credit cards, loans, anything you owe?`,                               input: 'yesno',    key: 'hasDebt'      },
  { id: 'q_debtamt', text: ()     => `Roughly how much do you owe in total?`,                                                         input: 'money',    key: 'totalDebt',   conditional: 'hasDebt' },
  { id: 'q_goal',    text: (n)    => `You're doing great, ${n}. Last one — what's your #1 financial goal right now?`,                input: 'goal'     },
  { id: 'q_done',    text: (n, d) => `Perfect. Here's what I'm seeing, ${n}:\n\n• ${fmt(parseFloat(d.totalCash)||0)} across your accounts\n• ~${fmt(parseFloat(d.weeklyIncome)||0)}/week income\n• Goal: ${d.goal || 'take control of your money'}\n\nI'm setting up your Zerofi dashboard now. You can add more details anytime — I'll be right here. Ready?`, input: 'confirm' },
];

export default function NovaOnboarding({ onComplete, onUseWizard }) {
  const T = THEMES.dark;
  const [messages,    setMessages]    = useState([]);
  const [scriptIdx,   setScriptIdx]   = useState(-1);
  const [inputVal,    setInputVal]    = useState('');
  const [data,        setData]        = useState({});
  const [userName,    setUserName]    = useState('');
  const [typing,      setTyping]      = useState(false);
  const [currentInput,setCurrentInput]= useState('name');
  const endRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      setMessages([{ id: 'w0', text: `Hi, I'm ${NOVA.name} — your Zerofi AI advisor. ${NOVA.icon}\n\nZerofi is your personal financial command center — built for gig workers, individuals, families, and businesses who deserve the same quality of guidance as people with wealth managers.\n\nNo judgment. No jargon. No commissions. Just clarity.\n\nLet's start simple. What's your first name?`, type: 'nova' }]);
      setCurrentInput('name');
    }, 500);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const addNova = (text, cb) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(p => [...p, { id: uid(), text, type: 'nova' }]);
      if (cb) setTimeout(cb, 300);
    }, 800 + Math.random() * 500);
  };

  const addUser = (text) => setMessages(p => [...p, { id: uid(), text, type: 'user' }]);

  const next = (idx, newData) => {
    const all = { ...data, ...newData };
    setData(all);
    let i = idx;
    while (i < SCRIPT.length) {
      const item = SCRIPT[i];
      if (item.conditional && !all[item.conditional]) { i++; continue; }
      break;
    }
    if (i >= SCRIPT.length) { buildConfig(all); return; }
    setScriptIdx(i);
    const item = SCRIPT[i];
    const text = typeof item.text === 'function' ? item.text(userName, all) : item.text;
    addNova(text, () => setCurrentInput(item.input));
  };

  const handleSubmit = (val) => {
    if (!val?.toString().trim()) return;
    const v = val.toString().trim();
    if (currentInput === 'name') {
      addUser(v); setUserName(v); setData(p => ({ ...p, name: v })); setInputVal('');
      const text = SCRIPT[0].text(v);
      addNova(text, () => setCurrentInput('usertype')); setScriptIdx(0);
      return;
    }
    if (currentInput === 'confirm') { buildConfig(data); return; }
    addUser(v); setInputVal('');
    const item = SCRIPT[scriptIdx];
    next(scriptIdx + 1, item?.key ? { [item.key]: v } : {});
  };

  const handleChoice = (val, label) => {
    addUser(label);
    if (currentInput === 'usertype') {
      setData(p => ({ ...p, userType: val }));
      addNova(SCRIPT[1].text(), () => setCurrentInput('theme')); setScriptIdx(1);
    } else if (currentInput === 'theme') {
      setData(p => ({ ...p, theme: val }));
      addNova(SCRIPT[2].text(userName), () => setCurrentInput('freetext')); setScriptIdx(2);
    } else if (currentInput === 'yesno') {
      const nd = { hasDebt: val === 'yes' };
      setData(p => ({ ...p, ...nd })); next(scriptIdx + 1, nd);
    } else if (currentInput === 'goal') {
      const nd = { goal: label };
      const all = { ...data, ...nd };
      setData(all);
      const doneText = SCRIPT[SCRIPT.length - 1].text(userName, all);
      addNova(doneText, () => setCurrentInput('confirm'));
      setScriptIdx(SCRIPT.length - 1);
    }
  };

  const buildConfig = (d) => {
    onComplete({
      theme: d.theme || 'dark',
      userType: d.userType || 'individual',
      name: d.name || 'Friend',
      accounts: [
        { id: uid(), name: 'Checking Account', balance: parseFloat(d.totalCash) || 0 },
        { id: uid(), name: 'Savings Account',  balance: 0 },
        { id: uid(), name: 'Cash on Hand',     balance: 0 },
      ],
      debts: d.hasDebt ? [{ id: uid(), name: 'Debt (tap to edit)', balance: parseFloat(d.totalDebt) || 0, apr: 0, limit: 0, monthly: 0, dueDay: 0 }] : [],
      budget: [{ id: uid(), name: 'Monthly Bills', amount: 0, category: 'bills', icon: '📄' }],
      incomeSrc: [{ id: uid(), name: 'Primary Income', account: 'Checking Account', icon: '💵' }],
      gigPlatforms: d.userType === 'gig' ? [{ id: uid(), name: 'Gig Platform', account: 'Checking Account', icon: '🚗' }] : [],
      stocks: [], savings: [],
      goals: d.goal ? [{ id: uid(), name: d.goal, target: 0, saved: 0, icon: GOAL_OPTIONS.find(g => g.label === d.goal)?.icon || '🎯' }] : [],
      dailyBurn: 30, weeklyGoal: parseFloat(d.weeklyIncome) || 0, taxRate: 25,
      novaSetup: true, novaStress: d.stress, _saved: true,
    });
  };

  const showInput = !typing && ['name','freetext','money'].includes(currentInput);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans',sans-serif" }}>

      {/* Header */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: NOVA.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{NOVA.icon}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, fontFamily: "'Fraunces',serif" }}>{NOVA.name}</div>
            <div style={{ fontSize: 10, color: NOVA.color, fontFamily: "'DM Mono',monospace" }}>{NOVA.title} · Online</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontFamily: "'Fraunces',serif", fontWeight: 900, color: T.text }}>Zero<span style={{ color: '#3b82f6' }}>fi</span></div>
          <div style={{ fontSize: 9, color: T.muted, fontFamily: "'DM Mono',monospace", letterSpacing: '0.1em' }}>YOUR MONEY. YOUR TERMS.</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 8px', display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 680, width: '100%', margin: '0 auto' }}>
        {messages.map(m => (
          <div key={m.id} className="fu" style={{ display: 'flex', justifyContent: m.type === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
            {m.type === 'nova' && (
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: NOVA.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{NOVA.icon}</div>
            )}
            <div style={{
              maxWidth: '78%', padding: '12px 16px',
              borderRadius: m.type === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
              background: m.type === 'user' ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : T.card,
              border: m.type === 'nova' ? `1px solid ${T.border}` : 'none',
              fontSize: 14, color: T.text, lineHeight: 1.65, whiteSpace: 'pre-wrap',
            }}>{m.text}</div>
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="fu" style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: NOVA.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{NOVA.icon}</div>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '4px 18px 18px 18px', padding: '14px 18px', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0,1,2].map(i => <div key={i} className="pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: NOVA.color, animationDelay: `${i*0.2}s` }} />)}
            </div>
          </div>
        )}

        {/* Choice buttons */}
        {!typing && currentInput === 'usertype' && (
          <div className="fu" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginLeft: 42 }}>
            {Object.entries(USER_TYPES).map(([k, v]) => (
              <button key={k} onClick={() => handleChoice(k, v.label)} style={{ background: T.card, border: `2px solid ${T.border}`, borderRadius: 14, padding: '14px', cursor: 'pointer', textAlign: 'left', transition: 'border-color .15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = v.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
                <div style={{ fontSize: 22, marginBottom: 5 }}>{v.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{v.label}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{v.desc}</div>
              </button>
            ))}
          </div>
        )}

        {!typing && currentInput === 'theme' && (
          <div className="fu" style={{ display: 'flex', gap: 10, marginLeft: 42 }}>
            {[['dark','🌙','Dark','Deep navy & electric accents'],['light','☀️','Light','Warm cream & earth tones']].map(([k,icon,label,desc]) => (
              <button key={k} onClick={() => handleChoice(k, label + ' Mode')} style={{ flex: 1, background: k==='dark'?'#080c14':'#faf8f5', border: `2px solid ${T.border}`, borderRadius: 14, padding: '16px', cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: k==='dark'?'#e8f0fe':'#1a1208', marginBottom: 3 }}>{label} Mode</div>
                <div style={{ fontSize: 11, color: k==='dark'?'#5a7094':'#7a6e62' }}>{desc}</div>
              </button>
            ))}
          </div>
        )}

        {!typing && currentInput === 'yesno' && (
          <div className="fu" style={{ display: 'flex', gap: 10, marginLeft: 42 }}>
            {[['yes','✅  Yes, I have debt'],['no','✨  No, I\'m debt free']].map(([k,label]) => (
              <button key={k} onClick={() => handleChoice(k, label)} style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: '13px', cursor: 'pointer', fontSize: 13, color: T.text, fontFamily: "'DM Sans',sans-serif" }}>{label}</button>
            ))}
          </div>
        )}

        {!typing && currentInput === 'goal' && (
          <div className="fu" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginLeft: 42 }}>
            {GOAL_OPTIONS.map(g => (
              <button key={g.id} onClick={() => handleChoice(g.id, g.label)} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '11px 12px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{g.icon}</span>
                <span style={{ fontSize: 12, color: T.text }}>{g.label}</span>
              </button>
            ))}
          </div>
        )}

        {!typing && currentInput === 'confirm' && (
          <div className="fu" style={{ marginLeft: 42 }}>
            <button onClick={() => buildConfig(data)} style={{ background: NOVA.grad, border: 'none', borderRadius: 14, padding: '14px 28px', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: "'DM Sans',sans-serif" }}>
              🚀 Let's go!
            </button>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Text input */}
      {showInput && (
        <div style={{ background: T.surface, borderTop: `1px solid ${T.border}`, padding: '12px 16px', display: 'flex', gap: 10, maxWidth: 680, width: '100%', margin: '0 auto', alignSelf: 'center', position: 'sticky', bottom: 0 }}>
          <input autoFocus value={inputVal} onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit(inputVal)}
            placeholder={currentInput === 'name' ? 'Type your name…' : currentInput === 'money' ? 'e.g. 500 or 1,200' : 'Tell Nova…'}
            style={{ flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 24, padding: '11px 18px', color: T.text, fontSize: 14, fontFamily: "'DM Sans',sans-serif" }} />
          <button onClick={() => handleSubmit(inputVal)} disabled={!inputVal.trim()}
            style={{ background: inputVal.trim() ? NOVA.grad : T.faint, border: 'none', borderRadius: '50%', width: 44, height: 44, cursor: inputVal.trim() ? 'pointer' : 'not-allowed', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            ➤
          </button>
        </div>
      )}

      {/* Demo + manual wizard links */}
      <div style={{ textAlign: 'center', padding: '10px 0 24px', display: 'flex', justifyContent: 'center', gap: 20 }}>
        <span onClick={onUseWizard} style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Mono',monospace", cursor: 'pointer', textDecoration: 'underline' }}>
          Enter details manually
        </span>
      </div>
    </div>
  );
}
