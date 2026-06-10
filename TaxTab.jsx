// Zerofi Tax Tab
import { useState, useEffect, useCallback } from 'react';
import { fmt, sign, uid, getWeekStart, getDaysUntil, nextQuarterDate } from '../utils/format';
import { save, load, KEYS } from '../utils/storage';
import { USER_TYPES, NOVA, MILEAGE_RATE, BUDGET_CATEGORIES } from '../utils/constants';
import { Card, Label, BigVal, Tag, Bar, Btn, Toast, InlineEditor } from '../components/UI';

// ─── TAX HELPERS ──────────────────────────────────────────────────────────────
function nextQuarterDate() {
  const now = new Date();
  const m = now.getMonth() + 1;
  // Q1 due Apr 15, Q2 due Jun 15, Q3 due Sep 15, Q4 due Jan 15
  const quarters = [{month:4,day:15,label:"Apr 15"},{month:6,day:15,label:"Jun 15"},{month:9,day:15,label:"Sep 15"},{month:1,day:15,label:"Jan 15 (next yr)"}];
  for(const q of quarters) {
    const due = new Date(q.month===1?now.getFullYear()+1:now.getFullYear(), q.month-1, q.day);
    if(due > now) return q.label;
  }
  return "Apr 15";
}

function getQuarterDeadlines(year) {
  return [
    { label:"Q1 (Jan–Mar)",  due:`Apr 15, ${year}`,   dueDateObj: new Date(year,3,15)  },
    { label:"Q2 (Apr–May)",  due:`Jun 15, ${year}`,   dueDateObj: new Date(year,5,15)  },
    { label:"Q3 (Jun–Aug)",  due:`Sep 15, ${year}`,   dueDateObj: new Date(year,8,15)  },
    { label:"Q4 (Sep–Dec)",  due:`Jan 15, ${year+1}`, dueDateObj: new Date(year+1,0,15)},
  ];
}

// ─── TAX TAB ──────────────────────────────────────────────────────────────────
function TaxTab({T, ut, incLog, taxRate, taxJar, mileLog, mileDeduction, totalBudget, config}) {
  const accentColor = ut?.color || T.amber;
  const [deductions, setDeductions] = useState([
    { id:"tx1", name:"Phone Bill (business use)", amount:"", icon:"📱", saved:0 },
    { id:"tx2", name:"Internet (business use)",   amount:"", icon:"📡", saved:0 },
    { id:"tx3", name:"Hot Bags / Equipment",       amount:"", icon:"🧳", saved:0 },
    { id:"tx4", name:"App Subscriptions",         amount:"", icon:"📲", saved:0 },
    { id:"tx5", name:"Other Business Expense",    amount:"", icon:"📦", saved:0 },
  ]);
  const [editDeduct, setEditDeduct] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(()=>setToast(null),2000); };

  useEffect(()=>{
    const _ded = load(KEYS.deductions); if(_ded) setDeductions(_ded);
  },[]);

  const saveDeduction = async(id, val) => {
    const amt = parseFloat(val)||0;
    const updated = deductions.map(d=>d.id===id?{...d,saved:amt,amount:""}:d);
    setDeductions(updated);
    save(KEYS.deductions, updated)
    showToast("Deduction saved");
    setEditDeduct(null);
  };

  const now = new Date();
  const year = now.getFullYear();
  const quarterDates = getQuarterDeadlines(year);

  // YTD calculations
  const ytdIncome      = incLog.reduce((a,b)=>a+b.amount, 0);
  const seTax          = ytdIncome * 0.153;             // Self-employment tax
  const seTaxDeduction = seTax * 0.5;                   // SE tax deduction (50% deductible)
  const adjustedIncome = ytdIncome - seTaxDeduction;
  const incomeTaxEst   = adjustedIncome * (taxRate/100);
  const totalTaxEst    = seTax + incomeTaxEst;
  const quarterlyAmt   = totalTaxEst / 4;

  const manualDeductTotal = deductions.reduce((a,d)=>a+d.saved,0);
  const totalDeductions   = mileDeduction + manualDeductTotal;
  const effectiveTaxable  = Math.max(0, adjustedIncome - totalDeductions);
  const revisedTaxEst     = (effectiveTaxable * (taxRate/100)) + seTax;

  // Which quarter are we in
  const currentQ = now.getMonth()<3?0:now.getMonth()<5?1:now.getMonth()<8?2:3;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {toast&&<div style={{position:"fixed",top:18,left:"50%",transform:"translateX(-50%)",background:T.surface,border:`1px solid ${T.amber}66`,color:T.amber,padding:"9px 18px",borderRadius:9,fontSize:11,fontFamily:"'DM Mono',monospace",zIndex:999,whiteSpace:"nowrap"}}>{toast}</div>}

      {/* YTD Summary */}
      <Card T={T} style={{borderColor:`${T.amber}44`}}>
        <Label T={T}>Year-to-Date Tax Estimate ({year})</Label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}>
          {[
            {label:"YTD Income",      value:fmt(ytdIncome),       color:T.green  },
            {label:"SE Tax (15.3%)",  value:fmt(seTax),           color:T.red    },
            {label:"Income Tax Est",  value:fmt(incomeTaxEst),    color:T.amber  },
            {label:"Total Tax Est",   value:fmt(totalTaxEst),     color:T.red    },
            {label:"Set Aside So Far",value:fmt(taxJar),          color:T.green  },
            {label:"Gap",             value:fmt(Math.max(0,totalTaxEst-taxJar)), color:taxJar>=totalTaxEst?T.green:T.red},
          ].map(s=>(
            <div key={s.label} style={{background:T.bg,borderRadius:9,padding:"10px 12px"}}>
              <div style={{fontSize:9,color:T.muted,fontFamily:"'DM Mono',monospace",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3}}>{s.label}</div>
              <div style={{fontSize:15,fontFamily:"'DM Mono',monospace",color:s.color,fontWeight:700}}>{s.value}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:12,padding:"10px 12px",background:`${T.amber}11`,borderRadius:9,fontSize:11,color:T.amber,lineHeight:1.6}}>
          💡 SE Tax deduction: You can deduct 50% of SE tax ({fmt(seTaxDeduction)}) from your taxable income. This estimate includes that.
        </div>
      </Card>

      {/* Self-Employment Tax Calculator */}
      <Card T={T}>
        <Label T={T}>Self-Employment Tax Breakdown (15.3%)</Label>
        <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:8}}>
          {[
            {label:"Social Security (12.4%)", value:ytdIncome*0.124, max:ytdIncome*0.124+5000},
            {label:"Medicare (2.9%)",          value:ytdIncome*0.029, max:ytdIncome*0.029+2000},
          ].map(r=>(
            <div key={r.label}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:12,color:T.muted}}>{r.label}</span>
                <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:T.red}}>{fmt(r.value)}</span>
              </div>
              <Bar value={r.value} max={r.max} color={T.red} T={T} height={5} />
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:8,borderTop:`1px solid ${T.border}`}}>
            <span style={{fontSize:13,color:T.text,fontWeight:600}}>Total SE Tax</span>
            <span style={{fontSize:14,fontFamily:"'DM Mono',monospace",color:T.red,fontWeight:700}}>{fmt(seTax)}</span>
          </div>
        </div>
      </Card>

      {/* Tax Jar */}
      <Card T={T} style={{borderColor:`${T.green}44`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div><Label T={T}>Tax Jar · {taxRate}% of Every Paycheck</Label><BigVal T={T} color={T.amber} size={26}>{fmt(taxJar)}</BigVal><div style={{fontSize:11,color:T.muted,marginTop:2}}>auto-calculated from {incLog.length} income entr{incLog.length===1?"y":"ies"}</div></div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:10,color:T.muted,fontFamily:"'DM Mono',monospace",marginBottom:2}}>quarterly need</div>
            <div style={{fontSize:17,fontFamily:"'DM Mono',monospace",color:T.amber,fontWeight:700}}>{fmt(quarterlyAmt)}</div>
          </div>
        </div>
        <Bar value={taxJar} max={totalTaxEst||1} color={taxJar>=totalTaxEst?T.green:T.amber} T={T} height={9} />
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,fontFamily:"'DM Mono',monospace",color:T.muted,marginTop:4}}>
          <span>$0</span><span>{taxJar>=totalTaxEst?"✓ Fully covered":"Need "+fmt(Math.max(0,totalTaxEst-taxJar))+" more"}</span><span>{fmt(totalTaxEst)} goal</span>
        </div>
      </Card>

      {/* Quarterly Due Dates */}
      <Card T={T}>
        <Label T={T}>Quarterly Estimated Tax Due Dates ({year})</Label>
        <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:8}}>
          {quarterDates.map((q,i)=>{
            const isPast = q.dueDateObj < now;
            const isCurrent = i===currentQ;
            const daysLeft = Math.ceil((q.dueDateObj-now)/(1000*60*60*24));
            return (
              <div key={q.label} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:isCurrent?`${T.amber}11`:T.bg,borderRadius:10,border:`1px solid ${isCurrent?T.amber:T.border}`}}>
                <div style={{width:36,height:36,borderRadius:8,background:isPast?T.greenLt:isCurrent?`${T.amber}22`:T.surface,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:14}}>{isPast?"✓":isCurrent?"⏰":"📅"}</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,color:T.text,fontWeight:500}}>{q.label}</div>
                  <div style={{fontSize:11,color:isPast?T.green:isCurrent?T.amber:T.muted,fontFamily:"'DM Mono',monospace"}}>Due {q.due}{!isPast&&daysLeft>0?` · ${daysLeft} days away`:""}{isPast?" · Passed":""}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:isPast?T.muted:T.amber,fontWeight:600}}>{fmt(quarterlyAmt)}</div>
                  <div style={{fontSize:9,color:T.muted}}>estimated</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop:10,fontSize:11,color:T.muted,lineHeight:1.6,padding:"8px 10px",background:T.bg,borderRadius:8}}>
          ⚠️ These are estimates based on your logged income. Consult a tax professional for accurate figures.
        </div>
      </Card>

      {/* Deductions Tracker */}
      <Card T={T}>
        <Label T={T}>Deductions Tracker</Label>
        <div style={{fontSize:11,color:T.muted,marginBottom:10,marginTop:2}}>Tap any item to log your monthly amount. These reduce your taxable income.</div>

        {/* Mileage deduction from mileage log */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 8px",borderBottom:`1px solid ${T.border}`}}>
          <span style={{fontSize:18,width:28,textAlign:"center"}}>🚗</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,color:T.text}}>Mileage Deduction</div>
            <div style={{fontSize:10,color:T.muted,fontFamily:"'DM Mono',monospace"}}>{mileLog.reduce((a,b)=>a+b.miles,0).toFixed(1)} mi × $0.67</div>
          </div>
          <span style={{fontFamily:"'DM Mono',monospace",color:T.teal,fontSize:13,fontWeight:600}}>{fmt(mileDeduction)}</span>
        </div>

        {deductions.map(d=>(
          <div key={d.id} style={{borderBottom:`1px solid ${T.border}`}}>
            <div onClick={()=>setEditDeduct(editDeduct===d.id?null:d.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 8px",cursor:"pointer"}}>
              <span style={{fontSize:18,width:28,textAlign:"center"}}>{d.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:T.text}}>{d.name}</div>
                <div style={{fontSize:10,color:T.muted,fontFamily:"'DM Mono',monospace"}}>{d.saved>0?"monthly amount logged":"tap to add"}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontFamily:"'DM Mono',monospace",color:d.saved>0?T.teal:T.muted,fontSize:13,fontWeight:600}}>{d.saved>0?fmt(d.saved):"-"}</span>
                <span style={{fontSize:13,color:editDeduct===d.id?accentColor:T.faint}}>✎</span>
              </div>
            </div>
            {editDeduct===d.id&&(
              <div style={{display:"flex",gap:8,padding:"8px 10px 10px",background:T.bg}}>
                <div style={{position:"relative",flex:1}}>
                  <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:T.muted}}>$</span>
                  <input autoFocus type="number" step="0.01" min="0" defaultValue={d.saved||""} id={`deduct-${d.id}`} onKeyDown={e=>{if(e.key==="Enter")saveDeduction(d.id,e.target.value);if(e.key==="Escape")setEditDeduct(null);}} placeholder="Monthly amount" style={{width:"100%",background:T.card,border:`1px solid ${T.amber}66`,borderRadius:8,padding:"8px 10px 8px 22px",color:T.text,fontSize:13,fontFamily:"'DM Mono',monospace",outline:"none"}} />
                </div>
                <button onClick={()=>{const el=document.getElementById(`deduct-${d.id}`);saveDeduction(d.id,el?.value||"0");}} style={{background:`${T.amber}22`,border:`1px solid ${T.amber}66`,color:T.amber,borderRadius:8,padding:"8px 14px",fontSize:11,fontFamily:"'DM Mono',monospace",cursor:"pointer"}}>Save</button>
                <button onClick={()=>setEditDeduct(null)} style={{background:T.surface,border:`1px solid ${T.border}`,color:T.muted,borderRadius:8,padding:"8px 10px",fontSize:11,cursor:"pointer"}}>✕</button>
              </div>
            )}
          </div>
        ))}

        <div style={{display:"flex",justifyContent:"space-between",padding:"10px 8px 0",borderTop:`1px solid ${T.border}`,marginTop:4}}>
          <span style={{fontSize:13,color:T.text,fontWeight:600}}>Total Deductions</span>
          <span style={{fontSize:14,fontFamily:"'DM Mono',monospace",color:T.teal,fontWeight:700}}>{fmt(totalDeductions)}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"6px 8px 0"}}>
          <span style={{fontSize:12,color:T.muted}}>Revised taxable income</span>
          <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:T.green}}>{fmt(effectiveTaxable)}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",padding:"4px 8px 0"}}>
          <span style={{fontSize:12,color:T.muted}}>Revised tax estimate</span>
          <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:T.amber,fontWeight:600}}>{fmt(revisedTaxEst)}</span>
        </div>
      </Card>
    </div>
  );
}




export default TaxTab;
