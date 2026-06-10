// ── Zerofi Setup Wizard ──────────────────────────────────────────────────────
import { useState } from 'react';
import { THEMES } from '../utils/theme';
import { USER_TYPES } from '../utils/constants';
import { uid } from '../utils/format';

function Wizard({ onComplete, onDemoMode }) {
  const [step, setStep]   = useState(0);
  const [theme, setTheme] = useState(null);
  const [userType, setUserType] = useState(null);
  const [name, setName]   = useState("");
  const [accounts, setAccounts]     = useState([{ id: uid(), name: "", balance: "" }]);
  const [debts, setDebts]           = useState([{ id: uid(), name: "", balance: "", apr: "", limit: "", monthly: "", dueDay: "" }]);
  const [budget, setBudget]         = useState([{ id: uid(), name: "", amount: "", category: "bills", icon: "📄" }]);
  const [incomeSrc, setIncomeSrc]   = useState([{ id: uid(), name: "", account: "", icon: "💵" }]);
  const [gigPlatforms, setGigPlatforms] = useState([{ id: uid(), name: "", account: "", icon: "🚗" }]);
  const [stocks, setStocks]         = useState([{ id: uid(), ticker: "", shares: "", costBasis: "" }]);
  const [savings, setSavings]       = useState([{ id: uid(), name: "", balance: "", apy: "" }]);
  const [goals, setGoals]           = useState([{ id: uid(), name: "", target: "", saved: "", icon: "🎯" }]);
  const [dailyBurn, setDailyBurn]   = useState("30");
  const [weeklyGoal, setWeeklyGoal] = useState("");
  const [taxRate, setTaxRate]       = useState("25");

  const T = theme ? THEMES[theme] : THEMES.dark;
  const ut = userType ? USER_TYPES[userType] : null;

  const addRow = (setter, tmpl) => setter(p => [...p, { ...tmpl, id: uid() }]);
  const rmRow  = (setter, id)   => setter(p => p.filter(r => r.id !== id));
  const upRow  = (setter, id, f, v) => setter(p => p.map(r => r.id === id ? { ...r, [f]: v } : r));

  const totalSteps = userType === "gig" ? 9 : userType === "business" ? 8 : 8;

  const finish = () => {
    const cfg = {
      theme, userType, name,
      accounts: accounts.filter(a=>a.name).map(a=>({...a, balance: parseFloat(a.balance)||0})),
      debts: debts.filter(d=>d.name).map(d=>({...d, balance:parseFloat(d.balance)||0, apr:parseFloat(d.apr)||0, limit:parseFloat(d.limit)||0, monthly:parseFloat(d.monthly)||0, dueDay:parseInt(d.dueDay)||0})),
      budget: budget.filter(b=>b.name).map(b=>({...b, amount:parseFloat(b.amount)||0})),
      incomeSrc: incomeSrc.filter(s=>s.name),
      gigPlatforms: gigPlatforms.filter(p=>p.name),
      stocks: stocks.filter(s=>s.ticker).map(s=>({...s, shares:parseFloat(s.shares)||0, costBasis:parseFloat(s.costBasis)||0})),
      savings: savings.filter(s=>s.name).map(s=>({...s, balance:parseFloat(s.balance)||0, apy:parseFloat(s.apy)||0})),
      goals: goals.filter(g=>g.name).map(g=>({...g, target:parseFloat(g.target)||0, saved:parseFloat(g.saved)||0})),
      dailyBurn: parseFloat(dailyBurn)||30,
      weeklyGoal: parseFloat(weeklyGoal)||0,
      taxRate: parseFloat(taxRate)||25,
    };
    onComplete(cfg);
  };

  const cardStyle = { background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, padding: 24, maxWidth: 560, width: "100%" };
  const inputStyle = { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", color: T.text, fontSize: 13, outline: "none", fontFamily: "inherit", width: "100%", marginBottom: 2 };
  const selectStyle = { ...inputStyle, marginBottom: 0 };
  const subText = { fontSize: 12, color: T.muted, lineHeight: 1.6, marginBottom: 16 };
  const fieldLabel = { fontSize: 10, color: T.muted, fontFamily: "'DM Mono',monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4, marginTop: 12 };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px 80px", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,800;0,900;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}input:focus,select:focus{border-color:${T.accent}!important}`}</style>

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 38, fontFamily: "'Fraunces',serif", fontWeight: 900, color: T.text, letterSpacing: "-0.03em" }}>
          Flow<span style={{ color: T.accent }}>Fi</span>
        </div>
        <div style={{ fontSize: 11, color: T.muted, fontFamily: "'DM Mono',monospace", letterSpacing: "0.2em", marginTop: 2 }}>YOUR MONEY. YOUR TERMS.</div>
      </div>

      {/* Progress dots */}
      {step > 0 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} style={{ width: i === step-1 ? 24 : 8, height: 8, borderRadius: 99, background: i < step ? (ut?.color||T.accent) : i === step-1 ? (ut?.color||T.accent) : T.faint, transition: "all .3s" }} />
          ))}
        </div>
      )}

      <div style={cardStyle}>

        {/* STEP 0: Theme */}
        {step === 0 && (
          <div>
            <div style={{ fontSize: 26, fontFamily: "'Fraunces',serif", fontWeight: 800, color: T.text, marginBottom: 6 }}>Pick your vibe</div>
            <div style={subText}>Choose how your dashboard looks. You can change this anytime.</div>
            <div style={{ display: "flex", gap: 12 }}>
              {[["dark","🌙","Dark Mode","Deep navy & electric accents"],["light","☀️","Light Mode","Warm cream & earth tones"]].map(([k,icon,label,desc])=>(
                <div key={k} onClick={()=>setTheme(k)} style={{ flex: 1, padding: 16, borderRadius: 14, border: `2px solid ${theme===k?(k==="dark"?"#3b82f6":"#b45309"):T.border}`, background: k==="dark"?"#080c14":"#faf8f5", cursor: "pointer", textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: k==="dark"?"#e8f0fe":"#1a1208", marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 11, color: k==="dark"?"#5a7094":"#7a6e62" }}>{desc}</div>
                </div>
              ))}
            </div>
            {onDemoMode && (
              <div style={{ marginTop: 20, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>Want to explore first?</div>
                <button onClick={onDemoMode} style={{ background:`${T.amber}22`, border:`1px solid ${T.amber}55`, color:T.amber, borderRadius:9, padding:"8px 20px", fontSize:12, fontFamily:"'DM Mono',monospace", cursor:"pointer" }}>
                  🔍 Preview Demo Accounts
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: User Type */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 26, fontFamily: "'Fraunces',serif", fontWeight: 800, color: T.text, marginBottom: 6 }}>Who are you managing money for?</div>
            <div style={subText}>Your dashboard adapts to your situation.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {Object.entries(USER_TYPES).map(([k,v])=>(
                <div key={k} onClick={()=>setUserType(k)} style={{ padding: "14px 16px", borderRadius: 12, border: `2px solid ${userType===k?v.color:T.border}`, background: userType===k?`${v.color}11`:T.surface, cursor: "pointer" }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{v.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2 }}>{v.label}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Name */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 26, fontFamily: "'Fraunces',serif", fontWeight: 800, color: T.text, marginBottom: 6 }}>{ut?.icon} Welcome, {userType === "family" ? "family" : "friend"}!</div>
            <div style={subText}>{userType==="business"?"What's your business name?":userType==="family"?"What should we call your household?":"What's your name?"}</div>
            <div style={fieldLabel}>Name</div>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder={userType==="business"?"e.g. Smith Plumbing LLC":userType==="family"?"e.g. The Johnson Family":"e.g. Marcus"} style={inputStyle} />
          </div>
        )}

        {/* STEP 3: Accounts */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: 22, fontFamily: "'Fraunces',serif", fontWeight: 800, color: T.text, marginBottom: 4 }}>🏦 Your Accounts</div>
            <div style={subText}>Every account where you hold money — checking, savings, cash, PayPal, Venmo, etc.</div>
            {accounts.map((a,i)=>(
              <div key={a.id} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
                <input value={a.name} onChange={e=>upRow(setAccounts,a.id,"name",e.target.value)} placeholder="Account name" style={{...inputStyle,flex:2,marginBottom:0}} />
                <div style={{position:"relative",flex:1}}>
                  <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:T.muted,fontSize:13}}>$</span>
                  <input value={a.balance} onChange={e=>upRow(setAccounts,a.id,"balance",e.target.value)} placeholder="0.00" type="number" style={{...inputStyle,paddingLeft:22,marginBottom:0}} />
                </div>
                {accounts.length>1&&<button onClick={()=>rmRow(setAccounts,a.id)} style={{background:"none",border:"none",color:T.muted,fontSize:18,cursor:"pointer"}}>✕</button>}
              </div>
            ))}
            <button onClick={()=>addRow(setAccounts,{name:"",balance:""})} style={{background:"none",border:`1px dashed ${T.border}`,color:T.muted,borderRadius:8,padding:"8px 16px",fontSize:12,cursor:"pointer",width:"100%",marginTop:4}}>+ Add Account</button>
          </div>
        )}

        {/* STEP 4: Debts */}
        {step === 4 && (
          <div>
            <div style={{ fontSize: 22, fontFamily: "'Fraunces',serif", fontWeight: 800, color: T.text, marginBottom: 4 }}>💳 Debts & Loans</div>
            <div style={subText}>Anything you owe — credit cards, car loans, student loans, mortgages. Skip fields that don't apply.</div>
            {debts.map(d=>(
              <div key={d.id} style={{background:T.surface,borderRadius:10,padding:12,marginBottom:10,border:`1px solid ${T.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <input value={d.name} onChange={e=>upRow(setDebts,d.id,"name",e.target.value)} placeholder="Debt name (e.g. Car Loan)" style={{...inputStyle,flex:1,marginRight:8,marginBottom:0}} />
                  {debts.length>1&&<button onClick={()=>rmRow(setDebts,d.id)} style={{background:"none",border:"none",color:T.muted,fontSize:18,cursor:"pointer"}}>✕</button>}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {[["balance","Balance ($)","0.00"],["apr","APR (%)","0.00"],["monthly","Monthly ($)","0.00"],["limit","Credit Limit","optional"],["dueDay","Due Day","e.g. 15"]].map(([f,label,ph])=>(
                    <div key={f}><div style={fieldLabel}>{label}</div><input value={d[f]} onChange={e=>upRow(setDebts,d.id,f,e.target.value)} placeholder={ph} type="number" style={{...inputStyle,marginBottom:0}} /></div>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={()=>addRow(setDebts,{name:"",balance:"",apr:"",limit:"",monthly:"",dueDay:""})} style={{background:"none",border:`1px dashed ${T.border}`,color:T.muted,borderRadius:8,padding:"8px 16px",fontSize:12,cursor:"pointer",width:"100%"}}>+ Add Debt</button>
          </div>
        )}

        {/* STEP 5: Budget */}
        {step === 5 && (
          <div>
            <div style={{ fontSize: 22, fontFamily: "'Fraunces',serif", fontWeight: 800, color: T.text, marginBottom: 4 }}>📋 Monthly Expenses</div>
            <div style={subText}>Fixed monthly bills — subscriptions, insurance, utilities, rent, phone, etc.</div>
            {budget.map(b=>(
              <div key={b.id} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                <input value={b.icon} onChange={e=>upRow(setBudget,b.id,"icon",e.target.value)} placeholder="📄" style={{...inputStyle,width:44,textAlign:"center",flexShrink:0,marginBottom:0}} />
                <input value={b.name} onChange={e=>upRow(setBudget,b.id,"name",e.target.value)} placeholder="Expense name" style={{...inputStyle,flex:2,marginBottom:0}} />
                <div style={{position:"relative",flex:1}}>
                  <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:T.muted,fontSize:13}}>$</span>
                  <input value={b.amount} onChange={e=>upRow(setBudget,b.id,"amount",e.target.value)} placeholder="0.00" type="number" style={{...inputStyle,paddingLeft:22,marginBottom:0}} />
                </div>
                <select value={b.category} onChange={e=>upRow(setBudget,b.id,"category",e.target.value)} style={{...selectStyle,flex:1}}>
                  <option value="bills">Bills</option><option value="subscriptions">Subs</option><option value="insurance">Insurance</option><option value="utilities">Utilities</option><option value="other">Other</option>
                </select>
                {budget.length>1&&<button onClick={()=>rmRow(setBudget,b.id)} style={{background:"none",border:"none",color:T.muted,fontSize:18,cursor:"pointer"}}>✕</button>}
              </div>
            ))}
            <button onClick={()=>addRow(setBudget,{name:"",amount:"",category:"bills",icon:"📄"})} style={{background:"none",border:`1px dashed ${T.border}`,color:T.muted,borderRadius:8,padding:"8px 16px",fontSize:12,cursor:"pointer",width:"100%",marginTop:4}}>+ Add Expense</button>
          </div>
        )}

        {/* STEP 6: Income Sources */}
        {step === 6 && (
          <div>
            <div style={{ fontSize: 22, fontFamily: "'Fraunces',serif", fontWeight: 800, color: T.text, marginBottom: 4 }}>
              {userType==="gig"?"🚗 Gig Platforms":"💰 Income Sources"}
            </div>
            <div style={subText}>{userType==="gig"?"Which platforms do you work? Each earns into a specific account.":"Where does money come in, and which account does it land in?"}</div>
            {(userType==="gig"?gigPlatforms:incomeSrc).map(s=>(
              <div key={s.id} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                <input value={s.icon} onChange={e=>upRow(userType==="gig"?setGigPlatforms:setIncomeSrc,s.id,"icon",e.target.value)} placeholder="💵" style={{...inputStyle,width:44,textAlign:"center",flexShrink:0,marginBottom:0}} />
                <input value={s.name} onChange={e=>upRow(userType==="gig"?setGigPlatforms:setIncomeSrc,s.id,"name",e.target.value)} placeholder={userType==="gig"?"Platform (e.g. Uber Eats)":"Income source"} style={{...inputStyle,flex:2,marginBottom:0}} />
                <select value={s.account} onChange={e=>upRow(userType==="gig"?setGigPlatforms:setIncomeSrc,s.id,"account",e.target.value)} style={{...selectStyle,flex:1.5}}>
                  <option value="">→ Account</option>
                  {accounts.filter(a=>a.name).map(a=><option key={a.id} value={a.name}>{a.name}</option>)}
                </select>
                {(userType==="gig"?gigPlatforms:incomeSrc).length>1&&<button onClick={()=>rmRow(userType==="gig"?setGigPlatforms:setIncomeSrc,s.id)} style={{background:"none",border:"none",color:T.muted,fontSize:18,cursor:"pointer"}}>✕</button>}
              </div>
            ))}
            <button onClick={()=>addRow(userType==="gig"?setGigPlatforms:setIncomeSrc,{name:"",account:"",icon:"💵"})} style={{background:"none",border:`1px dashed ${T.border}`,color:T.muted,borderRadius:8,padding:"8px 16px",fontSize:12,cursor:"pointer",width:"100%",marginTop:4}}>+ Add {userType==="gig"?"Platform":"Source"}</button>
          </div>
        )}

        {/* STEP 7: Stocks + Savings */}
        {step === 7 && (
          <div>
            <div style={{ fontSize: 22, fontFamily: "'Fraunces',serif", fontWeight: 800, color: T.text, marginBottom: 4 }}>📈 Investments & Savings</div>
            <div style={subText}>Stocks, ETFs, HYS accounts, 401k, IRA — anything you're growing. All optional.</div>
            <div style={fieldLabel}>Stock / ETF Holdings</div>
            {stocks.map(s=>(
              <div key={s.id} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                <input value={s.ticker} onChange={e=>upRow(setStocks,s.id,"ticker",e.target.value.toUpperCase())} placeholder="TICKER" style={{...inputStyle,width:80,flexShrink:0,marginBottom:0,fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}} />
                <input value={s.shares} onChange={e=>upRow(setStocks,s.id,"shares",e.target.value)} placeholder="Shares" type="number" style={{...inputStyle,flex:1,marginBottom:0}} />
                <div style={{position:"relative",flex:1}}>
                  <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:T.muted,fontSize:13}}>$</span>
                  <input value={s.costBasis} onChange={e=>upRow(setStocks,s.id,"costBasis",e.target.value)} placeholder="Cost basis" type="number" style={{...inputStyle,paddingLeft:22,marginBottom:0}} />
                </div>
                {stocks.length>1&&<button onClick={()=>rmRow(setStocks,s.id)} style={{background:"none",border:"none",color:T.muted,fontSize:18,cursor:"pointer"}}>✕</button>}
              </div>
            ))}
            <button onClick={()=>addRow(setStocks,{ticker:"",shares:"",costBasis:""})} style={{background:"none",border:`1px dashed ${T.border}`,color:T.muted,borderRadius:8,padding:"7px 14px",fontSize:12,cursor:"pointer",marginBottom:16}}>+ Add Stock</button>

            <div style={fieldLabel}>Savings / 401k / IRA</div>
            {savings.map(s=>(
              <div key={s.id} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                <input value={s.name} onChange={e=>upRow(setSavings,s.id,"name",e.target.value)} placeholder="Account name (e.g. Roth IRA)" style={{...inputStyle,flex:2,marginBottom:0}} />
                <div style={{position:"relative",flex:1}}>
                  <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:T.muted,fontSize:13}}>$</span>
                  <input value={s.balance} onChange={e=>upRow(setSavings,s.id,"balance",e.target.value)} placeholder="Balance" type="number" style={{...inputStyle,paddingLeft:22,marginBottom:0}} />
                </div>
                <input value={s.apy} onChange={e=>upRow(setSavings,s.id,"apy",e.target.value)} placeholder="APY%" type="number" style={{...inputStyle,width:70,flexShrink:0,marginBottom:0}} />
                {savings.length>1&&<button onClick={()=>rmRow(setSavings,s.id)} style={{background:"none",border:"none",color:T.muted,fontSize:18,cursor:"pointer"}}>✕</button>}
              </div>
            ))}
            <button onClick={()=>addRow(setSavings,{name:"",balance:"",apy:""})} style={{background:"none",border:`1px dashed ${T.border}`,color:T.muted,borderRadius:8,padding:"7px 14px",fontSize:12,cursor:"pointer"}}>+ Add Savings Account</button>
          </div>
        )}

        {/* STEP 8: Goals + Settings */}
        {step === 8 && (
          <div>
            <div style={{ fontSize: 22, fontFamily: "'Fraunces',serif", fontWeight: 800, color: T.text, marginBottom: 4 }}>🎯 Goals & Settings</div>
            <div style={subText}>Set savings targets and configure how your dashboard tracks your money.</div>

            <div style={fieldLabel}>Savings Goals</div>
            {goals.map(g=>(
              <div key={g.id} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
                <input value={g.icon} onChange={e=>upRow(setGoals,g.id,"icon",e.target.value)} placeholder="🎯" style={{...inputStyle,width:44,textAlign:"center",flexShrink:0,marginBottom:0}} />
                <input value={g.name} onChange={e=>upRow(setGoals,g.id,"name",e.target.value)} placeholder="Goal name (e.g. Emergency Fund)" style={{...inputStyle,flex:2,marginBottom:0}} />
                <div style={{position:"relative",flex:1}}>
                  <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:T.muted}}>$</span>
                  <input value={g.target} onChange={e=>upRow(setGoals,g.id,"target",e.target.value)} placeholder="Target" type="number" style={{...inputStyle,paddingLeft:20,marginBottom:0}} />
                </div>
                <div style={{position:"relative",flex:1}}>
                  <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:T.muted}}>$</span>
                  <input value={g.saved} onChange={e=>upRow(setGoals,g.id,"saved",e.target.value)} placeholder="Saved" type="number" style={{...inputStyle,paddingLeft:20,marginBottom:0}} />
                </div>
                {goals.length>1&&<button onClick={()=>rmRow(setGoals,g.id)} style={{background:"none",border:"none",color:T.muted,fontSize:18,cursor:"pointer"}}>✕</button>}
              </div>
            ))}
            <button onClick={()=>addRow(setGoals,{name:"",target:"",saved:"",icon:"🎯"})} style={{background:"none",border:`1px dashed ${T.border}`,color:T.muted,borderRadius:8,padding:"7px 14px",fontSize:12,cursor:"pointer",marginBottom:16}}>+ Add Goal</button>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <div style={fieldLabel}>Daily Spending Limit ($)</div>
                <input value={dailyBurn} onChange={e=>setDailyBurn(e.target.value)} placeholder="30" type="number" style={inputStyle} />
              </div>
              <div>
                <div style={fieldLabel}>Weekly Income Goal ($)</div>
                <input value={weeklyGoal} onChange={e=>setWeeklyGoal(e.target.value)} placeholder="auto from budget" type="number" style={inputStyle} />
              </div>
              {(userType==="gig"||userType==="individual") && (
                <div>
                  <div style={fieldLabel}>Tax Set-Aside (%)</div>
                  <input value={taxRate} onChange={e=>setTaxRate(e.target.value)} placeholder="25" type="number" style={inputStyle} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nav */}
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:24 }}>
          {step > 0
            ? <button onClick={()=>setStep(s=>s-1)} style={{background:"none",border:`1px solid ${T.border}`,color:T.muted,borderRadius:9,padding:"9px 18px",fontSize:12,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>← Back</button>
            : <div />
          }
          {step === 0
            ? <button onClick={()=>theme&&setStep(1)} disabled={!theme} style={{background:theme?T.accent:T.faint,border:"none",color:"#fff",borderRadius:9,padding:"9px 22px",fontSize:12,fontFamily:"'DM Mono',monospace",cursor:theme?"pointer":"not-allowed"}}>Next →</button>
            : step === 1
            ? <button onClick={()=>userType&&setStep(2)} disabled={!userType} style={{background:userType?(ut?.color||T.accent):T.faint,border:"none",color:"#fff",borderRadius:9,padding:"9px 22px",fontSize:12,fontFamily:"'DM Mono',monospace",cursor:userType?"pointer":"not-allowed"}}>Next →</button>
            : step < 8
            ? <button onClick={()=>setStep(s=>s+1)} style={{background:ut?.color||T.accent,border:"none",color:"#fff",borderRadius:9,padding:"9px 22px",fontSize:12,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>Next →</button>
            : <button onClick={finish} style={{background:ut?.color||T.accent,border:"none",color:"#fff",borderRadius:9,padding:"9px 22px",fontSize:13,fontFamily:"'DM Mono',monospace",cursor:"pointer",fontWeight:600}}>Launch Zerofi 🚀</button>
          }
        </div>
      </div>
    </div>
  );
}



export default Wizard;
