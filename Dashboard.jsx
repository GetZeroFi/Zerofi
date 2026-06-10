// ── Zerofi Dashboard — Orchestrator ──────────────────────────────────────────
// Dashboard manages state and routing. Each tab is its own component in src/tabs/
import { useState, useEffect, useCallback } from 'react';
import { fmt, sign, uid, getWeekStart, getDaysUntil, nextQuarterDate } from '../utils/format';
import { save, load, KEYS } from '../utils/storage';
import { THEMES } from '../utils/theme';
import { USER_TYPES, NOVA, MILEAGE_RATE } from '../utils/constants';
import { Card, Label, BigVal, Tag, Bar, Btn, Toast, InlineEditor } from '../components/UI';
import { useAuth } from '../hooks/useAuth';
import { getEffectiveTier, trialDaysLeft, isInTrial, TIERS } from '../utils/tiers';
import { TrialBanner, UpgradePrompt, FeatureLock } from '../components/UpgradePrompt';
import Pricing from './Pricing';
import { useClock } from '../hooks/useClock';
import OverviewTab    from '../tabs/OverviewTab';
import AccountsTab    from '../tabs/AccountsTab';
import IncomeTab      from '../tabs/IncomeTab';
import DebtsTab       from '../tabs/DebtsTab';
import BudgetTab      from '../tabs/BudgetTab';
import InvestmentsTab from '../tabs/InvestmentsTab';
import GoalsTab       from '../tabs/GoalsTab';
import MileageTab     from '../tabs/MileageTab';
import TaxTab         from '../tabs/TaxTab';
import HistoryTab     from '../tabs/HistoryTab';
import NovaSidebar    from '../components/NovaSidebar';
import { TermsPage } from './Terms';
import BetaAdmin from './BetaAdmin';

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
function Dashboard({ config, onEdit, onReset, isDemo, onExitDemo }) {
  const T   = THEMES[config.theme] || THEMES.dark;
  const now  = useClock();
  const auth = useAuth();
  const ut  = USER_TYPES[config.userType];

  const [tab, setTab]         = useState("Overview");
  const [toastData, setToastData] = useState(null);
  const [novaOpen,     setNovaOpen]     = useState(false);
  const [termsOpen,    setTermsOpen]    = useState(false);
  const [adminOpen,    setAdminOpen]    = useState(false);
  const [pricingOpen,  setPricingOpen]  = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState(null);

  // Derive tier from auth user metadata
  const userTier    = getEffectiveTier(auth?.user?.user_metadata) || 'free';
  const inTrial     = isInTrial(auth?.user?.user_metadata);
  const daysLeft    = trialDaysLeft(auth?.user?.user_metadata);
  const tierConfig  = TIERS[userTier] || TIERS.free;
  const showToast = (msg, color) => { setToastData({msg,color}); setTimeout(()=>setToastData(null),2500); };

  // Live state
  const [accounts,  setAccounts]  = useState(Object.fromEntries(config.accounts.map(a=>[a.name,a.balance])));
  const [debts,     setDebts]     = useState(Object.fromEntries(config.debts.map(d=>[d.id,d.balance])));
  const [stockPrices, setStockPrices] = useState(Object.fromEntries(config.stocks.map(s=>[s.ticker,{price:(s.costBasis/s.shares)||0,updatedAt:null}])));
  const [savingsBals, setSavingsBals] = useState(Object.fromEntries(config.savings.map(s=>[s.name,s.balance])));
  const [goals,       setGoals]       = useState(config.goals.map(g=>({...g})));
  const [incLog,    setIncLog]    = useState([]);
  const [debtLog,   setDebtLog]   = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [mileLog,   setMileLog]   = useState([]);
  const [expLog,    setExpLog]    = useState([]);
  const [editingAcct, setEditingAcct] = useState(null);
  const [editingStock, setEditingStock] = useState(null);
  const [editingSaving, setEditingSaving] = useState(null);

  // Rehydrate
  useEffect(()=>{
    (async()=>{
      const [il,dl,tr,ml,el,sp,sb] = await Promise.all([load(SK.inclog),load(SK.debtlog),load(SK.transfers),load(SK.mileage),load(SK.expenses),load(SK.stocks),load(SK.savings)]);
      if(il){ setIncLog(il); const adj={}; il.forEach(e=>{adj[e.account]=(adj[e.account]||0)+e.amount;}); setAccounts(prev=>{const n={...prev};Object.entries(adj).forEach(([k,v])=>{if(k in n)n[k]=(config.accounts.find(a=>a.name===k)?.balance||0)+v;});return n;}); }
      if(dl){ setDebtLog(dl); const red={}; dl.forEach(e=>{red[e.debtId]=(red[e.debtId]||0)+e.amount;}); setDebts(prev=>{const n={...prev};Object.entries(red).forEach(([k,v])=>{if(k in n)n[k]=Math.max(0,(config.debts.find(d=>d.id===k)?.balance||0)-v);});return n;}); }
      if(tr){ setTransfers(tr); const fa={},ta={}; tr.forEach(e=>{fa[e.from]=(fa[e.from]||0)+e.amount;ta[e.to]=(ta[e.to]||0)+e.amount;}); setAccounts(prev=>{const n={...prev};Object.entries(fa).forEach(([k,v])=>{if(k in n)n[k]=Math.max(0,n[k]-v);});Object.entries(ta).forEach(([k,v])=>{if(k in n)n[k]=(n[k]||0)+v;});return n;}); }
      if(ml) setMileLog(ml);
      if(el) setExpLog(el);
      if(sp) setStockPrices(prev=>({...prev,...sp}));
      if(sb) setSavingsBals(prev=>({...prev,...sb}));
    })();
  },[]);

  // Derived
  const totalCash    = Object.values(accounts).reduce((a,b)=>a+b,0);
  const totalDebt    = Object.values(debts).reduce((a,b)=>a+b,0);
  const totalBudget  = config.budget.reduce((a,b)=>a+b.amount,0);
  const weeklyGoal   = config.weeklyGoal || (totalBudget/4.33);
  const dailyBurn    = config.dailyBurn || 30;
  const taxRate      = config.taxRate || 25;
  const runwayDays   = totalCash / dailyBurn;
  const runwayColor  = runwayDays<7?T.red:runwayDays<14?T.amber:T.green;

  const enrichedStocks = config.stocks.map(s=>{
    const saved = stockPrices[s.ticker];
    const price = parseFloat(saved?.price) || (s.costBasis/s.shares);
    const value = price*s.shares;
    return {...s,price,value,gainLoss:value-s.costBasis,gainPct:((value-s.costBasis)/s.costBasis)*100,updatedAt:saved?.updatedAt};
  });
  const totalStocks  = enrichedStocks.reduce((a,s)=>a+s.value,0);
  const totalSavings = Object.values(savingsBals).reduce((a,b)=>a+b,0);
  const netWorth     = totalCash+totalStocks+totalSavings-totalDebt;

  const weekStart  = getWeekStart();
  const weekIncome = incLog.filter(e=>new Date(e.date)>=weekStart).reduce((a,b)=>a+b.amount,0);
  const weekEarned = weekIncome;
  const goalMet    = weekEarned>=weeklyGoal;
  const weekBonus  = Math.max(0,weekEarned-weeklyGoal);
  const taxJar     = incLog.reduce((a,b)=>a+b.amount*taxRate/100,0);
  const totalMiles = mileLog.reduce((a,b)=>a+b.miles,0);
  const mileDeduction = totalMiles*0.67;
  const todayIncome = incLog.filter(e=>new Date(e.date).toDateString()===new Date().toDateString()).reduce((a,b)=>a+b.amount,0);

  // Upcoming due dates
  const upcomingDues = config.debts.filter(d=>d.dueDay>0&&d.monthly>0).map(d=>({...d,daysUntil:getDaysUntil(d.dueDay)})).filter(d=>d.daysUntil!==null&&d.daysUntil<=7).sort((a,b)=>a.daysUntil-b.daysUntil);

  // Handlers
  const logIncome = useCallback((src, amt, note) => {
    const entry={id:uid(),sourceId:src.id||src.name,sourceName:src.name,account:src.account,amount:amt,note,date:new Date().toISOString(),icon:src.icon||"💵",color:ut?.color||T.accent,taxAside:amt*taxRate/100};
    const updated=[entry,...incLog]; setIncLog(updated); save(SK.inclog,updated);
    setAccounts(p=>({...p,[src.account]:(p[src.account]||0)+amt}));
    showToast(`${fmt(amt)} logged → ${src.account}`,T.green);
  },[incLog,taxRate]);

  const logDebt = useCallback((debt, amt, note) => {
    const entry={id:uid(),debtId:debt.id,debtName:debt.name,amount:amt,note,date:new Date().toISOString()};
    const updated=[entry,...debtLog]; setDebtLog(updated); save(SK.debtlog,updated);
    setDebts(p=>({...p,[debt.id]:Math.max(0,(p[debt.id]||0)-amt)}));
    showToast(`${fmt(amt)} paid on ${debt.name}`,T.green);
  },[debtLog]);

  const doTransfer = useCallback((from,to,amt,note) => {
    if((accounts[from]||0)<amt){showToast("Insufficient funds",T.red);return;}
    const entry={id:uid(),from,to,amount:amt,note,date:new Date().toISOString()};
    const updated=[entry,...transfers]; setTransfers(updated); save(SK.transfers,updated);
    setAccounts(p=>({...p,[from]:Math.max(0,(p[from]||0)-amt),[to]:(p[to]||0)+amt}));
    showToast(`${fmt(amt)}: ${from} → ${to}`,T.teal);
  },[accounts,transfers]);

  const editAcct = useCallback((name,val)=>{
    setAccounts(p=>({...p,[name]:val}));
    showToast(`${name} updated`,T.teal);
    setEditingAcct(null);
  },[]);

  const editStock = useCallback((ticker,price)=>{
    const updated={...stockPrices,[ticker]:{price:price.toFixed(2),updatedAt:new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"})}};
    setStockPrices(updated); save(SK.stocks,updated);
    showToast(`${ticker} → ${fmt(price)}`,T.green);
    setEditingStock(null);
  },[stockPrices]);

  const editSaving = useCallback((name,val)=>{
    const updated={...savingsBals,[name]:val};
    setSavingsBals(updated); save(SK.savings,updated);
    showToast(`${name} updated`,T.purple);
    setEditingSaving(null);
  },[savingsBals]);

  const logMile = useCallback((miles,platform,note)=>{
    const entry={id:uid(),miles,platform,note,date:new Date().toISOString(),deduction:miles*0.67};
    const updated=[entry,...mileLog]; setMileLog(updated); save(SK.mileage,updated);
    showToast(`${miles} mi logged · ${fmt(miles*0.67)} deduction`,T.amber);
  },[mileLog]);

  const logGoalContrib = useCallback((idx,amt)=>{
    const updated=goals.map((g,i)=>i===idx?{...g,saved:Math.min(g.target,g.saved+amt)}:g);
    setGoals(updated); save(SK.goals,updated);
    showToast(`${fmt(amt)} added to ${goals[idx].name}`,T.green);
  },[goals]);

  // Tab config by user type
  const allTabs = ["Overview","History","Accounts","Income","Debts","Budget","Investments","Goals"];
  if(config.userType==="gig"||config.userType==="individual") allTabs.push("Tax");
  if(config.userType==="gig") allTabs.push("Mileage");
  const tabs = allTabs;

  const colors = [T.teal,T.green,T.purple,T.amber,"#ec4899","#f97316","#60a5fa","#34d399"];

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'DM Sans',sans-serif",paddingBottom:60}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,800;0,900;1,700&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}input:focus,select:focus{border-color:${ut?.color||T.accent}!important;outline:none}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${T.border};border-radius:4px}@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.fu{animation:fu .3s ease both}button:active{opacity:.7}`}</style>

      {toastData && <Toast {...toastData} T={T} />}

      {/* Trial banner */}
      {inTrial && daysLeft > 0 && (
        <TrialBanner daysLeft={daysLeft} tierName={userTier} T={T}
          onUpgrade={() => setPricingOpen(true)} />
      )}

      {/* Upgrade prompt modal */}
      {upgradeFeature && (
        <UpgradePrompt feature={upgradeFeature} T={T}
          onUpgrade={() => { setUpgradeFeature(null); setPricingOpen(true); }}
          onDismiss={() => setUpgradeFeature(null)} />
      )}

      {/* Pricing modal */}
      {pricingOpen && (
        <div style={{ position: 'fixed', inset: 0, background: T.bg, zIndex: 300, overflowY: 'auto' }}>
          <Pricing currentTier={userTier} onBack={() => setPricingOpen(false)}
            onSelectTier={(tier, type) => {
              setPricingOpen(false);
              // TODO: wire to Stripe when ready
              console.log('Selected tier:', tier, type);
            }} />
        </div>
      )}

      {/* Footer legal link */}
      <div style={{ textAlign: 'center', padding: '8px 0 4px', fontSize: 10, color: T.muted, fontFamily: "'DM Mono',monospace" }}>
        <span onClick={() => setTermsOpen(true)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Terms & Privacy</span>
        {userTier === 'free' && <span style={{ margin: '0 8px' }}>·</span>}
        {userTier === 'free' && <span onClick={() => setPricingOpen(true)} style={{ cursor: 'pointer', color: T.accent, textDecoration: 'underline', fontWeight: 600 }}>Upgrade to Plus</span>}
        {auth?.user && <span style={{ margin: '0 8px' }}>·</span>}
        {auth?.user && <span onClick={() => { if(window.confirm('Sign out of Zerofi?')) auth.signOut(); }} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Sign Out</span>}
        <span style={{ margin: '0 8px' }}>·</span>
        <span onClick={() => setAdminOpen(true)} style={{ cursor: 'pointer', color: T.faint, fontSize: 9 }}>⚙</span>
      </div>

      {adminOpen && (
        <div style={{ position: 'fixed', inset: 0, background: T.bg, zIndex: 400, overflowY: 'auto' }}>
          <BetaAdmin onBack={() => setAdminOpen(false)} />
        </div>
      )}

      {termsOpen && (
        <div style={{ position: 'fixed', inset: 0, background: '#000000cc', zIndex: 300, overflowY: 'auto' }}>
          <TermsPage onBack={() => setTermsOpen(false)} />
        </div>
      )}

      {/* Nova floating button */}
      <button onClick={() => setNovaOpen(true)} style={{
        position: 'fixed', bottom: 24, right: 20, width: 52, height: 52,
        borderRadius: '50%', background: T.novaGrad, border: 'none',
        boxShadow: `0 4px 20px ${T.nova}66`, cursor: 'pointer',
        fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, transition: 'transform .2s',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
        🌟
      </button>

      {/* Nova sidebar */}
      <NovaSidebar
        T={T}
        isOpen={novaOpen}
        onClose={() => setNovaOpen(false)}
        context={{
          totalCash, totalDebt, weekEarned, weeklyGoal, runwayDays,
          totalBudget, netWorth, userType: config.userType,
          config, incLog, totalSavings,
        }}
      />

      {/* Demo banner */}
      {isDemo && (
        <div style={{ background:`${T.amber}22`, borderBottom:`1px solid ${T.amber}44`, padding:"8px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontSize:11, color:T.amber, fontFamily:"'DM Mono',monospace" }}>🔍 DEMO MODE — {ut?.icon} {ut?.label} · Data is sample only, nothing is saved</div>
          <button onClick={onExitDemo} style={{ background:`${T.amber}22`, border:`1px solid ${T.amber}55`, color:T.amber, borderRadius:7, padding:"4px 12px", fontSize:11, fontFamily:"'DM Mono',monospace", cursor:"pointer" }}>Exit Demo →</button>
        </div>
      )}

      {/* Header */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"16px 20px 0",position:"sticky",top:0,zIndex:90}}>
        <div style={{maxWidth:820,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                <span style={{fontSize:22,fontFamily:"'Fraunces',serif",fontWeight:900,color:T.text,letterSpacing:"-0.02em"}}>Flow<span style={{color:ut?.color||T.accent}}>Fi</span></span>
                <span style={{fontSize:10,background:`${ut?.color||T.accent}22`,color:ut?.color||T.accent,border:`1px solid ${ut?.color||T.accent}44`,borderRadius:20,padding:"2px 8px",fontFamily:"'DM Mono',monospace"}}>{ut?.icon} {ut?.label}</span>
              </div>
              <div style={{fontSize:11,color:T.muted,fontFamily:"'DM Mono',monospace"}}>{now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:17,fontFamily:"'DM Mono',monospace",color:ut?.color||T.accent,fontWeight:700}}>{now.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",second:"2-digit",hour12:true})}</div>
              <div style={{fontSize:9,color:T.muted,fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:1}}>Net Worth</div>
              <div style={{fontSize:20,fontFamily:"'Fraunces',serif",fontWeight:800,color:netWorth>=0?T.green:T.red}}>{fmt(netWorth)}</div>
            </div>
          </div>
          <div style={{className:"tab-bar",display:"flex",gap:2,overflowX:"auto"}}>
            {tabs.map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{
                padding:"8px 14px", borderRadius:"8px 8px 0 0", fontSize:11,
                fontFamily:"'DM Mono',monospace", background:tab===t?T.bg:"transparent",
                color:tab===t?(ut?.color||T.accent):T.muted, border:"none",
                cursor:"pointer", borderBottom:tab===t?`2px solid ${ut?.color||T.accent}`:"2px solid transparent",
                whiteSpace:"nowrap", minHeight:36,
              }}>
                {t}
              </button>
            ))}
            <div style={{marginLeft:"auto",display:"flex",gap:4,paddingBottom:4}}>
              <button onClick={onEdit} style={{padding:"5px 10px",fontSize:10,fontFamily:"'DM Mono',monospace",background:"none",border:`1px solid ${T.border}`,color:ut?.color||T.accent,cursor:"pointer",borderRadius:7}}>⚙ Edit</button>
              <button onClick={onReset} style={{padding:"5px 10px",fontSize:10,fontFamily:"'DM Mono',monospace",background:"none",border:"none",color:T.muted,cursor:"pointer"}}>↺</button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="tab-content safe-bottom" style={{maxWidth:820,margin:"0 auto",padding:"20px 16px 40px"}} className="fu">

        {/* ── OVERVIEW ── */}
        {tab==="Overview" && <OverviewTab T={T} ut={ut} userTier={userTier} onUpgrade={(f) => setUpgradeFeature(f)} totalCash={totalCash} totalDebt={totalDebt} totalBudget={totalBudget} totalStocks={totalStocks} totalSavings={totalSavings} netWorth={netWorth} weekEarned={weekEarned} weeklyGoal={weeklyGoal} goalMet={goalMet} weekBonus={weekBonus} runwayDays={runwayDays} runwayColor={runwayColor} dailyBurn={dailyBurn} taxJar={taxJar} taxRate={taxRate} todayIncome={todayIncome} userType={config.userType} debts={config.debts} debtBals={debts} upcomingDues={upcomingDues} goals={goals} colors={colors} mileDeduction={mileDeduction} incLog={incLog} config={config} />}

        {/* ── ACCOUNTS ── */}
        {tab==="Accounts" && <AccountsTab T={T} ut={ut} accounts={accounts} transfers={transfers} editingAcct={editingAcct} setEditingAcct={setEditingAcct} editAcct={editAcct} doTransfer={doTransfer} />}

        {/* ── INCOME ── */}
        {tab==="Income" && <IncomeTab T={T} ut={ut} config={config} incLog={incLog} logIncome={logIncome} weekEarned={weekEarned} weeklyGoal={weeklyGoal} goalMet={goalMet} weekBonus={weekBonus} todayIncome={todayIncome} taxJar={taxJar} taxRate={taxRate} userType={config.userType} />}

        {/* ── DEBTS ── */}
        {tab==="Debts" && <DebtsTab T={T} ut={ut} config={config} debts={debts} debtLog={debtLog} logDebt={logDebt} totalDebt={totalDebt} />}

        {/* ── BUDGET ── */}
        {tab==="Budget" && <BudgetTab T={T} ut={ut} config={config} totalBudget={totalBudget} />}

        {/* ── INVESTMENTS ── */}
        {tab==="Investments" && <InvestmentsTab T={T} ut={ut} config={config} enrichedStocks={enrichedStocks} totalStocks={totalStocks} savingsBals={savingsBals} totalSavings={totalSavings} editingStock={editingStock} setEditingStock={setEditingStock} editStock={editStock} editingSaving={editingSaving} setEditingSaving={setEditingSaving} editSaving={editSaving} colors={colors} />}

        {/* ── GOALS ── */}
        {tab==="Goals" && <GoalsTab T={T} ut={ut} goals={goals} logGoalContrib={logGoalContrib} totalCash={totalCash} />}

        {/* ── TAX (gig/individual) ── */}
        {tab==="History" && <HistoryTab T={T} ut={ut} incLog={incLog} config={config} totalDebt={totalDebt} netWorth={netWorth} debtBals={debts} />}

        {tab==="Tax" && (config.userType==="gig"||config.userType==="individual") && <TaxTab T={T} ut={ut} incLog={incLog} taxRate={taxRate} taxJar={taxJar} mileLog={mileLog} mileDeduction={mileDeduction} totalBudget={totalBudget} config={config} />}

        {/* ── MILEAGE (gig only) ── */}
        {tab==="Mileage" && config.userType==="gig" && <MileageTab T={T} ut={ut} mileLog={mileLog} logMile={logMile} totalMiles={totalMiles} mileDeduction={mileDeduction} config={config} />}
      </div>
    </div>
  );
}

export default Dashboard;
