// Zerofi Investments Tab
import { useState, useEffect, useCallback } from 'react';
import { fmt, sign, uid, getWeekStart, getDaysUntil, nextQuarterDate } from '../utils/format';
import { save, load, KEYS } from '../utils/storage';
import { USER_TYPES, NOVA, MILEAGE_RATE, BUDGET_CATEGORIES } from '../utils/constants';
import { Card, Label, BigVal, Tag, Bar, Btn, Toast, InlineEditor } from '../components/UI';

const pct = (n) => `${Number(n||0).toFixed(1)}%`;

// ─── INVESTMENTS TAB ──────────────────────────────────────────────────────────
function InvestmentsTab({T,ut,config,enrichedStocks,totalStocks,savingsBals,totalSavings,editingStock,setEditingStock,editStock,editingSaving,setEditingSaving,editSaving,colors}) {
  const accentColor=ut?.color||T.accent;
  const totalGainLoss=enrichedStocks.reduce((a,s)=>a+s.gainLoss,0);
  const totalInvested=totalStocks+totalSavings;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Card T={T}><Label T={T}>Stocks Value</Label><BigVal T={T} color={T.green} size={22}>{fmt(totalStocks)}</BigVal><div style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:totalGainLoss>=0?T.green:T.red,marginTop:2}}>{sign(totalGainLoss)}{fmt(totalGainLoss)} vs cost</div></Card>
        <Card T={T}><Label T={T}>Savings & 401k</Label><BigVal T={T} color={T.purple} size={22}>{fmt(totalSavings)}</BigVal></Card>
      </div>

      {/* Stocks */}
      {config.stocks.length>0&&(
        <Card T={T}><Label T={T}>Holdings · Tap to Update Price</Label>
          {enrichedStocks.map((s,i)=>(
            <div key={s.ticker} style={{borderBottom:`1px solid ${T.border}`}}>
              <div onClick={()=>setEditingStock(editingStock===s.ticker?null:s.ticker)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 6px",cursor:"pointer"}}>
                <div style={{width:40,height:40,borderRadius:9,background:T.surface,border:`1px solid ${colors[i%colors.length]}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:9,fontFamily:"'DM Mono',monospace",color:colors[i%colors.length],fontWeight:700}}>{s.ticker}</span>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,color:T.text,fontWeight:500}}>{s.ticker}</div>
                  <div style={{fontSize:10,color:T.muted,fontFamily:"'DM Mono',monospace"}}>{s.shares}sh · {fmt(s.price)}/sh{s.updatedAt?` · ${s.updatedAt}`:""}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:T.text,fontWeight:600}}>{fmt(s.value)}</div>
                  <div style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:s.gainLoss>=0?T.green:T.red}}>{sign(s.gainLoss)}{fmt(s.gainLoss)} ({sign(s.gainPct)}{s.gainPct.toFixed(1)}%)</div>
                </div>
                <span style={{fontSize:13,color:editingStock===s.ticker?accentColor:T.faint,flexShrink:0}}>✎</span>
              </div>
              {editingStock===s.ticker&&<InlineEditor value={s.price} onSave={v=>editStock(s.ticker,v)} onCancel={()=>setEditingStock(null)} T={T} color={accentColor} />}
            </div>
          ))}
          {/* Allocation */}
          {enrichedStocks.length>1&&totalStocks>0&&<>
            <div style={{display:"flex",height:8,borderRadius:99,overflow:"hidden",gap:1,marginTop:12}}>
              {enrichedStocks.map((s,i)=><div key={s.ticker} style={{width:`${(s.value/totalStocks)*100}%`,background:colors[i%colors.length]}} />)}
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:"4px 10px",marginTop:6}}>
              {enrichedStocks.map((s,i)=>(
                <div key={s.ticker} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.muted}}>
                  <div style={{width:7,height:7,borderRadius:2,background:colors[i%colors.length]}} />
                  <span style={{fontFamily:"'DM Mono',monospace"}}>{s.ticker}</span>
                  <span style={{color:T.faint}}>{((s.value/totalStocks)*100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </>}
        </Card>
      )}

      {/* Savings */}
      {config.savings.length>0&&(
        <Card T={T}><Label T={T}>Savings & Retirement · Tap to Edit</Label>
          {config.savings.map(s=>{
            const bal=savingsBals[s.name]??s.balance;
            return (
              <div key={s.name} style={{borderBottom:`1px solid ${T.border}`}}>
                <div onClick={()=>setEditingSaving(editingSaving===s.name?null:s.name)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 6px",cursor:"pointer"}}>
                  <div style={{width:40,height:40,borderRadius:9,background:T.surface,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:16}}>{s.apy?"🏦":"📈"}</span></div>
                  <div style={{flex:1}}><div style={{fontSize:13,color:T.text,fontWeight:500}}>{s.name}</div>{s.apy>0?<Tag color={T.purple} bg={T.purpleLt}>{s.apy}% APY</Tag>:<Tag color={T.muted} bg={T.bg}>Retirement</Tag>}</div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:T.purple,fontWeight:600}}>{fmt(bal)}</div>
                    {s.apy>0&&<div style={{fontSize:10,color:T.muted}}>+{fmt(bal*s.apy/100/12)}/mo</div>}
                  </div>
                  <span style={{fontSize:13,color:editingSaving===s.name?T.purple:T.faint,flexShrink:0}}>✎</span>
                </div>
                {editingSaving===s.name&&<InlineEditor value={bal} onSave={v=>editSaving(s.name,v)} onCancel={()=>setEditingSaving(null)} T={T} color={T.purple} />}
              </div>
            );
          })}
          <div style={{display:"flex",justifyContent:"space-between",paddingTop:10,borderTop:`1px solid ${T.border}`,marginTop:2}}><span style={{fontSize:11,color:T.muted,fontFamily:"'DM Mono',monospace"}}>Total saved + invested</span><span style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:T.purple,fontWeight:700}}>{fmt(totalInvested)}</span></div>
        </Card>
      )}

      {config.stocks.length===0&&config.savings.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:T.muted,fontFamily:"'DM Mono',monospace",fontSize:12}}>No investments set up yet.<br/>Edit your profile to add stocks or savings.</div>}
    </div>
  );
}


export default InvestmentsTab;
