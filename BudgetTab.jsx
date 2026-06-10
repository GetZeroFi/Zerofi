// Zerofi Budget Tab
import { useState, useEffect, useCallback } from 'react';
import { fmt, sign, uid, getWeekStart, getDaysUntil, nextQuarterDate } from '../utils/format';
import { save, load, KEYS } from '../utils/storage';
import { USER_TYPES, NOVA, MILEAGE_RATE, BUDGET_CATEGORIES } from '../utils/constants';
import { Card, Label, BigVal, Tag, Bar, Btn, Toast, InlineEditor } from '../components/UI';

// ─── BUDGET TAB ───────────────────────────────────────────────────────────────
function BudgetTab({T,ut,config,totalBudget}) {
  const cats=[...new Set(config.budget.map(b=>b.category))];
  const catColors={bills:T.red,subscriptions:T.purple,insurance:T.amber,utilities:T.teal,other:T.muted};
  const catTotals=Object.fromEntries(cats.map(c=>[c,config.budget.filter(b=>b.category===c).reduce((a,b)=>a+b.amount,0)]));
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Card T={T}><Label T={T}>Monthly Total</Label><BigVal T={T} color={T.red} size={24}>{fmt(totalBudget)}</BigVal></Card>
        <Card T={T}><Label T={T}>Annual Total</Label><BigVal T={T} color={T.amber} size={24}>{fmt(totalBudget*12)}</BigVal></Card>
      </div>
      <Card T={T}><Label T={T}>By Category</Label>
        <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:8}}>
          {cats.map(cat=>(
            <div key={cat}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:T.muted,textTransform:"capitalize"}}>{cat}</span><span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:catColors[cat]||T.muted}}>{fmt(catTotals[cat])}</span></div><Bar value={catTotals[cat]} max={totalBudget} color={catColors[cat]||T.muted} T={T} height={6} /></div>
          ))}
        </div>
      </Card>
      <Card T={T}><Label T={T}>All Expenses</Label>
        {config.budget.map(b=>(
          <div key={b.id||b.name} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{fontSize:18,width:28,textAlign:"center"}}>{b.icon}</span>
            <div style={{flex:1}}><div style={{fontSize:13,color:T.text}}>{b.name}</div><Tag color={catColors[b.category]||T.muted} bg={`${catColors[b.category]||T.muted}18`}>{b.category}</Tag></div>
            <span style={{fontFamily:"'DM Mono',monospace",color:catColors[b.category]||T.muted,fontSize:13}}>{fmt(b.amount)}</span>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,borderTop:`1px solid ${T.border}`,marginTop:2}}><span style={{fontSize:13,color:T.text,fontWeight:600}}>Total</span><span style={{fontFamily:"'DM Mono',monospace",color:T.red,fontSize:14,fontWeight:700}}>{fmt(totalBudget)}</span></div>
      </Card>
    </div>
  );
}


export default BudgetTab;
