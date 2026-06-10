// Zerofi Debts Tab
import { useState, useEffect, useCallback } from 'react';
import { fmt, sign, uid, getWeekStart, getDaysUntil, nextQuarterDate } from '../utils/format';
import { save, load, KEYS } from '../utils/storage';
import { USER_TYPES, NOVA, MILEAGE_RATE, BUDGET_CATEGORIES } from '../utils/constants';
import { Card, Label, BigVal, Tag, Bar, Btn, Toast, InlineEditor } from '../components/UI';

// ─── DEBTS TAB ────────────────────────────────────────────────────────────────
function DebtsTab({T,ut,config,debts,debtLog,logDebt,totalDebt}) {
  const accentColor=ut?.color||T.accent;
  const [selDebt,setSelDebt]=useState(config.debts[0]?.id||"");
  const [amt,setAmt]=useState("");
  const [note,setNote]=useState("");
  const totalPaid=debtLog.reduce((a,b)=>a+b.amount,0);
  const handleLog=()=>{const a=parseFloat(amt);if(!a||a<=0)return;const d=config.debts.find(x=>x.id===selDebt);if(!d)return;logDebt(d,a,note.trim());setAmt("");setNote("");};
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card T={T}><Label T={T}>Total Debt Remaining</Label><BigVal T={T} color={T.red} size={28}>{fmt(totalDebt)}</BigVal>{totalPaid>0&&<div style={{fontSize:11,color:T.green,marginTop:3}}>↓ {fmt(totalPaid)} paid via Zerofi</div>}</Card>

      {/* Payment logger */}
      <Card T={T} style={{borderColor:`${T.green}44`}}>
        <Label T={T}>Log a Payment</Label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8,marginBottom:10}}>
          {config.debts.map(d=>(
            <button key={d.id} onClick={()=>setSelDebt(d.id)} style={{padding:"6px 11px",borderRadius:8,fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer",background:selDebt===d.id?`${T.red}22`:T.surface,border:`1px solid ${selDebt===d.id?T.red:T.border}`,color:selDebt===d.id?T.red:T.muted}}>{d.name.split(" ").slice(0,2).join(" ")}</button>
          ))}
        </div>
        {selDebt&&(()=>{const d=config.debts.find(x=>x.id===selDebt);return d&&<div style={{fontSize:12,color:T.muted,padding:"6px 10px",background:T.bg,borderRadius:8,marginBottom:10}}>Balance: <span style={{color:T.red,fontWeight:600}}>{fmt(debts[d.id]??d.balance)}</span>{d.apr>0&&` · ${d.apr}% APR`}</div>;})()}
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <div style={{position:"relative",flex:1}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:T.muted}}>$</span><input type="number" value={amt} onChange={e=>setAmt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLog()} placeholder="0.00" style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 10px 9px 22px",color:T.text,fontSize:14,fontFamily:"'DM Mono',monospace",outline:"none"}} /></div>
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Note" style={{flex:1.2,background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:T.text,fontSize:12,outline:"none"}} />
        </div>
        <button onClick={handleLog} style={{background:`linear-gradient(90deg,${T.red},${T.red}bb)`,border:"none",borderRadius:8,padding:"10px 0",fontSize:12,fontFamily:"'DM Mono',monospace",color:"#fff",fontWeight:600,cursor:"pointer",width:"100%"}}>− Log Payment</button>
      </Card>

      {/* Debt cards */}
      {config.debts.map(d=>{
        const bal=debts[d.id]??d.balance;
        const hasLimit=d.limit>0;
        const over=hasLimit&&bal>d.limit;
        const util=hasLimit?(bal/d.limit)*100:0;
        return (
          <Card key={d.id} T={T} style={{borderColor:over?`${T.red}66`:T.border}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <div><div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:4}}>{d.name}</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{d.apr>0&&<Tag color={d.apr>20?T.red:T.muted} bg={d.apr>20?T.redLt:T.bg}>{d.apr}% APR</Tag>}{d.dueDay>0&&<Tag color={T.teal} bg={T.tealLt}>Due {d.dueDay}th</Tag>}</div></div>
              <BigVal T={T} color={T.red} size={18}>{fmt(bal)}</BigVal>
            </div>
            {hasLimit&&<><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:over?T.red:T.muted,marginBottom:4}}>{over?<span>⚠ Over limit by {fmt(bal-d.limit)}</span>:<span>Available: {fmt(d.limit-bal)}</span>}<span>{fmt(d.limit)} limit · {util.toFixed(0)}%</span></div><Bar value={bal} max={d.limit*1.05} color={over?T.red:util>80?T.amber:T.green} T={T} height={7} /></>}
            {d.monthly>0&&<div style={{fontSize:11,color:T.muted,marginTop:6}}>Min payment: {fmt(d.monthly)}/mo</div>}
          </Card>
        );
      })}

      {/* Payment history */}
      {debtLog.length>0&&(
        <Card T={T}><Label T={T}>Payment History</Label>
          {debtLog.slice(0,10).map(e=>(
            <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
              <div style={{flex:1}}><div style={{fontSize:12,color:T.text}}>{e.debtName}</div><div style={{fontSize:10,color:T.muted}}>{new Date(e.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}{e.note?` · ${e.note}`:""}</div></div>
              <span style={{fontFamily:"'DM Mono',monospace",color:T.red,fontSize:13}}>−{fmt(e.amount)}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}


export default DebtsTab;
