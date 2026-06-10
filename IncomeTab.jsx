// Zerofi Income Tab
import { useState, useEffect, useCallback } from 'react';
import { fmt, sign, uid, getWeekStart, getDaysUntil, nextQuarterDate } from '../utils/format';
import { save, load, KEYS } from '../utils/storage';
import { USER_TYPES, NOVA, MILEAGE_RATE, BUDGET_CATEGORIES } from '../utils/constants';
import { Card, Label, BigVal, Tag, Bar, Btn, Toast, InlineEditor } from '../components/UI';

const pct = (n) => `${Number(n||0).toFixed(1)}%`;

// ─── INCOME TAB ───────────────────────────────────────────────────────────────
function IncomeTab({T,ut,config,incLog,logIncome,weekEarned,weeklyGoal,goalMet,weekBonus,todayIncome,taxJar,taxRate,userType}) {
  const accentColor=ut?.color||T.accent;
  const sources = userType==="gig"?config.gigPlatforms:config.incomeSrc;
  const [selSrc,setSelSrc]=useState(sources[0]?.name||"");
  const [amt,setAmt]=useState("");
  const [note,setNote]=useState("");
  const weekPct=Math.min((weekEarned/weeklyGoal)*100,100);
  const totalEarned=incLog.reduce((a,b)=>a+b.amount,0);

  const handleLog=()=>{const a=parseFloat(amt);if(!a||a<=0)return;const src=sources.find(s=>s.name===selSrc);if(!src)return;logIncome(src,a,note.trim());setAmt("");setNote("");};
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Weekly goal */}
      <Card T={T} style={{borderColor:goalMet?`${T.green}44`:T.border}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div><Label T={T}>Week of {getWeekStart().toLocaleDateString("en-US",{month:"short",day:"numeric"})} (Mon–Sun)</Label><BigVal T={T} color={goalMet?T.green:T.text} size={26}>{fmt(weekEarned)}</BigVal><div style={{fontSize:11,color:T.muted,marginTop:2}}>of {fmt(weeklyGoal)} weekly goal</div></div>
          {goalMet?<Tag color={T.green} bg={T.greenLt}>✓ Goal Met</Tag>:<div style={{textAlign:"right"}}><div style={{fontSize:10,color:T.muted}}>still need</div><div style={{fontSize:18,fontFamily:"'Fraunces',serif",fontWeight:800,color:T.amber}}>{fmt(Math.max(0,weeklyGoal-weekEarned))}</div></div>}
        </div>
        <div style={{position:"relative",marginBottom:4}}>
          <div style={{background:T.faint,borderRadius:99,height:10,overflow:"hidden"}}>
            <div style={{width:`${weekPct}%`,height:"100%",background:goalMet?`linear-gradient(90deg,${T.green},${T.teal})`:`linear-gradient(90deg,${accentColor},${T.purple})`,borderRadius:99,transition:"width .6s ease"}} />
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,fontFamily:"'DM Mono',monospace",color:T.muted}}><span>$0</span><span>{weekPct.toFixed(0)}%</span><span>{fmt(weeklyGoal)}</span></div>
        {weekBonus>0&&<div style={{marginTop:8,padding:"8px 10px",background:T.greenLt,borderRadius:8,fontSize:12,color:T.green}}>🎉 {fmt(weekBonus)} bonus above goal!</div>}
      </Card>

      {/* Summary row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"+(taxRate>0?" 1fr":""),gap:10}}>
        <Card T={T}><Label T={T}>Today</Label><BigVal T={T} color={accentColor} size={20}>{fmt(todayIncome)}</BigVal></Card>
        <Card T={T}><Label T={T}>All Time</Label><BigVal T={T} color={T.green} size={20}>{fmt(totalEarned)}</BigVal></Card>
        {taxRate>0&&<Card T={T}><Label T={T}>Tax Jar ({taxRate}%)</Label><BigVal T={T} color={T.amber} size={20}>{fmt(taxJar)}</BigVal></Card>}
      </div>

      {/* Log form */}
      <Card T={T} style={{borderColor:`${accentColor}44`}}>
        <Label T={T}>Log Income</Label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8,marginBottom:10}}>
          {sources.map(s=>(
            <button key={s.name} onClick={()=>setSelSrc(s.name)} style={{padding:"7px 12px",borderRadius:8,fontSize:12,fontFamily:"'DM Mono',monospace",cursor:"pointer",background:selSrc===s.name?`${accentColor}22`:T.surface,border:`1px solid ${selSrc===s.name?accentColor:T.border}`,color:selSrc===s.name?accentColor:T.muted}}>
              {s.icon||"💵"} {s.name}
            </button>
          ))}
        </div>
        {selSrc&&(()=>{const src=sources.find(s=>s.name===selSrc);return src&&<div style={{fontSize:12,color:T.muted,padding:"6px 10px",background:T.bg,borderRadius:8,marginBottom:10}}>Routes to → <span style={{color:accentColor,fontWeight:600}}>{src.account}</span></div>;})()}
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <div style={{position:"relative",flex:1}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:T.muted}}>$</span><input type="number" value={amt} onChange={e=>setAmt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLog()} placeholder="0.00" style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 10px 9px 22px",color:T.text,fontSize:14,fontFamily:"'DM Mono',monospace",outline:"none"}} /></div>
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Note (optional)" style={{flex:1.2,background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:T.text,fontSize:12,outline:"none"}} />
        </div>
        <button onClick={handleLog} style={{background:`linear-gradient(90deg,${accentColor},${accentColor}bb)`,border:"none",borderRadius:8,padding:"10px 0",fontSize:13,fontFamily:"'DM Mono',monospace",color:"#fff",fontWeight:600,cursor:"pointer",width:"100%"}}>+ Log Income</button>
      </Card>

      {/* Routing rules */}
      <Card T={T}><Label T={T}>Routing Rules</Label>
        {sources.map(s=>(
          <div key={s.name} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
            <span>{s.icon||"💵"}</span><span style={{flex:1,fontSize:13,color:T.text}}>{s.name}</span><span style={{fontSize:11,color:T.muted}}>→</span><Tag color={accentColor} bg={`${accentColor}18`}>{s.account}</Tag>
          </div>
        ))}
      </Card>

      {/* History */}
      {incLog.length>0&&(
        <Card T={T}><Label T={T}>Income History</Label>
          {incLog.slice(0,15).map(e=>(
            <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:16}}>{e.icon||"💵"}</span>
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,color:T.text,fontWeight:500}}>{e.sourceName} → {e.account}</div><div style={{fontSize:10,color:T.muted,fontFamily:"'DM Mono',monospace"}}>{new Date(e.date).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}{e.note?` · ${e.note}`:""}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:T.green,fontWeight:600}}>{fmt(e.amount)}</div>{e.taxAside>0&&<div style={{fontSize:10,color:T.amber,fontFamily:"'DM Mono',monospace"}}>tax: {fmt(e.taxAside)}</div>}</div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}


export default IncomeTab;
