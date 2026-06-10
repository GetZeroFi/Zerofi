// Zerofi Mileage Tab
import { useState, useEffect, useCallback } from 'react';
import { fmt, sign, uid, getWeekStart, getDaysUntil, nextQuarterDate } from '../utils/format';
import { save, load, KEYS } from '../utils/storage';
import { USER_TYPES, NOVA, MILEAGE_RATE, BUDGET_CATEGORIES } from '../utils/constants';
import { Card, Label, BigVal, Tag, Bar, Btn, Toast, InlineEditor } from '../components/UI';

// ─── MILEAGE TAB (Gig only) ───────────────────────────────────────────────────
function MileageTab({T,ut,mileLog,logMile,totalMiles,mileDeduction,config}) {
  const [miles,setMiles]=useState("");
  const [platform,setPlatform]=useState(config.gigPlatforms[0]?.name||"");
  const [note,setNote]=useState("");
  const handleLog=()=>{const m=parseFloat(miles);if(!m||m<=0)return;logMile(m,platform,note.trim());setMiles("");setNote("");};
  const byPlatform=config.gigPlatforms.map(p=>({...p,miles:mileLog.filter(e=>e.platform===p.name).reduce((a,b)=>a+b.miles,0)}));
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Card T={T}><Label T={T}>Total Miles</Label><BigVal T={T} color={ut?.color||T.accent} size={24}>{totalMiles.toFixed(1)}</BigVal><div style={{fontSize:11,color:T.muted,marginTop:2}}>{mileLog.length} trips logged</div></Card>
        <Card T={T}><Label T={T}>Tax Deduction</Label><BigVal T={T} color={T.green} size={24}>{fmt(mileDeduction)}</BigVal><div style={{fontSize:11,color:T.muted,marginTop:2}}>@ $0.67/mile (2024)</div></Card>
      </div>

      <Card T={T} style={{borderColor:`${ut?.color||T.accent}44`}}>
        <Label T={T}>Log Miles</Label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8,marginBottom:10}}>
          {config.gigPlatforms.map(p=>(
            <button key={p.name} onClick={()=>setPlatform(p.name)} style={{padding:"6px 11px",borderRadius:8,fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer",background:platform===p.name?`${ut?.color||T.accent}22`:T.surface,border:`1px solid ${platform===p.name?(ut?.color||T.accent):T.border}`,color:platform===p.name?(ut?.color||T.accent):T.muted}}>{p.icon||"🚗"} {p.name}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <input type="number" value={miles} onChange={e=>setMiles(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLog()} placeholder="Miles driven" style={{flex:1,background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:T.text,fontSize:14,fontFamily:"'DM Mono',monospace",outline:"none"}} />
          <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Note (optional)" style={{flex:1.2,background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"9px 11px",color:T.text,fontSize:12,outline:"none"}} />
        </div>
        <button onClick={handleLog} style={{background:`linear-gradient(90deg,${ut?.color||T.accent},${ut?.color||T.accent}bb)`,border:"none",borderRadius:8,padding:"10px 0",fontSize:12,fontFamily:"'DM Mono',monospace",color:"#fff",fontWeight:600,cursor:"pointer",width:"100%"}}>+ Log Miles</button>
      </Card>

      {byPlatform.some(p=>p.miles>0)&&<Card T={T}><Label T={T}>Miles by Platform</Label>
        {byPlatform.filter(p=>p.miles>0).map(p=>(
          <div key={p.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{fontSize:13,color:T.text}}>{p.icon||"🚗"} {p.name}</span>
            <div style={{textAlign:"right"}}><div style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:ut?.color||T.accent,fontWeight:600}}>{p.miles.toFixed(1)} mi</div><div style={{fontSize:10,color:T.muted}}>{fmt(p.miles*0.67)} deduction</div></div>
          </div>
        ))}
      </Card>}

      {mileLog.length>0&&<Card T={T}><Label T={T}>Mileage History</Label>
        {mileLog.slice(0,15).map(e=>(
          <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
            <span>🚗</span>
            <div style={{flex:1}}><div style={{fontSize:12,color:T.text}}>{e.platform}{e.note?` · ${e.note}`:""}</div><div style={{fontSize:10,color:T.muted,fontFamily:"'DM Mono',monospace"}}>{new Date(e.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:ut?.color||T.accent}}>{e.miles.toFixed(1)} mi</div><div style={{fontSize:10,color:T.green}}>{fmt(e.deduction)}</div></div>
          </div>
        ))}
      </Card>}
    </div>
  );
}


export default MileageTab;
