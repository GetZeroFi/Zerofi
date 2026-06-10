// Zerofi Accounts Tab
import { useState, useEffect, useCallback } from 'react';
import { fmt, sign, uid, getWeekStart, getDaysUntil, nextQuarterDate } from '../utils/format';
import { save, load, KEYS } from '../utils/storage';
import { USER_TYPES, NOVA, MILEAGE_RATE, BUDGET_CATEGORIES } from '../utils/constants';
import { Card, Label, BigVal, Tag, Bar, Btn, Toast, InlineEditor } from '../components/UI';
import { isAtLimit } from '../utils/tiers';
import { FeatureLock } from '../components/UpgradePrompt';

// ─── ACCOUNTS TAB ─────────────────────────────────────────────────────────────
function AccountsTab({T,ut,accounts,transfers,editingAcct,setEditingAcct,editAcct,doTransfer}) {
  const totalCash = Object.values(accounts).reduce((a,b)=>a+b,0);
  const acctNames = Object.keys(accounts);
  const [showXfer, setShowXfer] = useState(false);
  const [xFrom,setXFrom]=useState(acctNames[0]||"");
  const [xTo,setXTo]=useState(acctNames[1]||"");
  const [xAmt,setXAmt]=useState("");
  const [xNote,setXNote]=useState("");
  const accentColor=ut?.color||T.accent;

  const handleXfer=()=>{const a=parseFloat(xAmt);if(!a||a<=0||xFrom===xTo)return;doTransfer(xFrom,xTo,a,xNote.trim());setXAmt("");setXNote("");setShowXfer(false);};
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Card T={T}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div><Label T={T}>Total Liquid Cash</Label><BigVal T={T} color={T.green} size={28}>{fmt(totalCash)}</BigVal><div style={{fontSize:11,color:T.muted,marginTop:3}}>Tap any account to edit · includes all adjustments</div></div>
          <button onClick={()=>setShowXfer(v=>!v)} style={{background:showXfer?`${accentColor}22`:T.surface,border:`1px solid ${showXfer?accentColor:T.border}`,color:showXfer?accentColor:T.muted,borderRadius:9,padding:"8px 14px",fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>⇄ Transfer</button>
        </div>
      </Card>
      {showXfer&&(
        <Card T={T} style={{borderColor:`${accentColor}44`}}>
          <Label T={T}>Move Money</Label>
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,marginBottom:8}}>
            <div style={{flex:1}}><div style={{fontSize:10,color:T.muted,marginBottom:3}}>FROM</div><select value={xFrom} onChange={e=>setXFrom(e.target.value)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 10px",color:T.text,fontSize:12,outline:"none",width:"100%"}}>{acctNames.map(n=><option key={n} value={n}>{n} ({fmt(accounts[n])})</option>)}</select></div>
            <div style={{color:T.muted,fontSize:18,marginTop:12}}>→</div>
            <div style={{flex:1}}><div style={{fontSize:10,color:T.muted,marginBottom:3}}>TO</div><select value={xTo} onChange={e=>setXTo(e.target.value)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 10px",color:T.text,fontSize:12,outline:"none",width:"100%"}}>{acctNames.filter(n=>n!==xFrom).map(n=><option key={n} value={n}>{n} ({fmt(accounts[n])})</option>)}</select></div>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <div style={{position:"relative",flex:1}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:T.muted}}>$</span><input type="number" value={xAmt} onChange={e=>setXAmt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleXfer()} placeholder="0.00" style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 10px 8px 22px",color:T.text,fontSize:13,outline:"none"}} /></div>
            <input value={xNote} onChange={e=>setXNote(e.target.value)} placeholder="Note (optional)" style={{flex:1.4,background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 11px",color:T.text,fontSize:12,outline:"none"}} />
          </div>
          <button onClick={handleXfer} style={{background:`linear-gradient(90deg,${accentColor},${accentColor}cc)`,border:"none",borderRadius:8,padding:"10px 0",fontSize:12,fontFamily:"'DM Mono',monospace",color:"#fff",fontWeight:600,cursor:"pointer",width:"100%"}}>⇄ Confirm Transfer</button>
        </Card>
      )}
      <Card T={T}><Label T={T}>Accounts · Tap to Edit</Label>
        {Object.entries(accounts).map(([name,bal])=>(
          <div key={name} style={{borderBottom:`1px solid ${T.border}`}}>
            <div onClick={()=>{setEditingAcct(editingAcct===name?null:name);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 6px",cursor:"pointer"}}>
              <span style={{fontSize:13,color:T.text}}>{name}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:14,fontFamily:"'DM Mono',monospace",color:bal>0?T.teal:T.muted}}>{fmt(bal)}</span>
                <span style={{fontSize:13,color:editingAcct===name?accentColor:T.faint}}>✎</span>
              </div>
            </div>
            {editingAcct===name&&<InlineEditor value={bal} onSave={v=>editAcct(name,v)} onCancel={()=>setEditingAcct(null)} T={T} color={accentColor} />}
          </div>
        ))}
      </Card>
      {transfers.length>0&&(
        <Card T={T}><Label T={T}>Transfer History</Label>
          {transfers.slice(0,8).map(t=>(
            <div key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{color:T.teal}}>⇄</span>
              <div style={{flex:1}}><div style={{fontSize:12,color:T.text}}>{t.from} → {t.to}</div><div style={{fontSize:10,color:T.muted}}>{new Date(t.date).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}{t.note?` · ${t.note}`:""}</div></div>
              <span style={{fontFamily:"'DM Mono',monospace",color:T.teal,fontSize:13}}>{fmt(t.amount)}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}


export default AccountsTab;
