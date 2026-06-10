// Zerofi Goals Tab
import { useState, useEffect, useCallback } from 'react';
import { fmt, sign, uid, getWeekStart, getDaysUntil, nextQuarterDate } from '../utils/format';
import { save, load, KEYS } from '../utils/storage';
import { USER_TYPES, NOVA, MILEAGE_RATE, BUDGET_CATEGORIES } from '../utils/constants';
import { Card, Label, BigVal, Tag, Bar, Btn, Toast, InlineEditor } from '../components/UI';

const pct = (n) => `${Number(n||0).toFixed(1)}%`;

// ─── GOALS TAB ────────────────────────────────────────────────────────────────
function GoalsTab({T,ut,goals,logGoalContrib,totalCash}) {
  const accentColor=ut?.color||T.accent;
  const [amounts,setAmounts]=useState(Object.fromEntries(goals.map((_,i)=>[i,""])));
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {goals.filter(g=>g.target>0).length===0&&<div style={{textAlign:"center",padding:"40px 0",color:T.muted,fontFamily:"'DM Mono',monospace",fontSize:12}}>No goals set up yet.<br/>Edit your profile to add savings goals.</div>}
      {goals.filter(g=>g.target>0).map((g,i)=>{
        const pct=Math.min((g.saved/g.target)*100,100);
        const remaining=Math.max(0,g.target-g.saved);
        const done=g.saved>=g.target;
        return (
          <Card key={g.id||i} T={T} style={{borderColor:done?`${T.green}44`:T.border}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div><div style={{fontSize:15,fontWeight:600,color:T.text,marginBottom:2}}>{g.icon} {g.name}</div><div style={{fontSize:11,color:T.muted}}>{fmt(g.saved)} saved of {fmt(g.target)} goal</div></div>
              {done?<Tag color={T.green} bg={T.greenLt}>✓ Complete</Tag>:<div style={{textAlign:"right"}}><div style={{fontSize:10,color:T.muted}}>remaining</div><div style={{fontSize:18,fontFamily:"'Fraunces',serif",fontWeight:800,color:accentColor}}>{fmt(remaining)}</div></div>}
            </div>
            <Bar value={g.saved} max={g.target} color={done?T.green:accentColor} T={T} height={9} />
            <div style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:T.muted,marginTop:4,textAlign:"right"}}>{pct.toFixed(0)}% complete</div>
            {!done&&<div style={{display:"flex",gap:8,marginTop:10}}>
              <div style={{position:"relative",flex:1}}><span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:T.muted}}>$</span><input type="number" value={amounts[i]||""} onChange={e=>setAmounts(p=>({...p,[i]:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"){const a=parseFloat(amounts[i]);if(a>0){logGoalContrib(i,a);setAmounts(p=>({...p,[i]:""}))}}} } placeholder="Add amount" style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 10px 8px 22px",color:T.text,fontSize:13,fontFamily:"'DM Mono',monospace",outline:"none"}} /></div>
              <button onClick={()=>{const a=parseFloat(amounts[i]);if(a>0){logGoalContrib(i,a);setAmounts(p=>({...p,[i]:""}))}}} style={{background:`${accentColor}22`,border:`1px solid ${accentColor}66`,color:accentColor,borderRadius:8,padding:"8px 14px",fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>+ Add</button>
            </div>}
          </Card>
        );
      })}
    </div>
  );
}


export default GoalsTab;
