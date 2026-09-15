/* Wealth Arrays — Phase 2 decision intelligence
   Adds scenario planning, sensitivity analysis, result interpretation and
   next-step journeys without changing calculator math. All calculations
   reuse the calculator's own compute() function. */
(function () {
  'use strict';
  if (window.waPhase2Loaded) return;
  window.waPhase2Loaded = true;

  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const finite = (v) => Number.isFinite(Number(v)) ? Number(v) : null;
  const money = (v) => { const n = finite(v); if (n === null) return '—'; const symbol = (window.WA && window.WA.currencies || [['INR','₹']]).find(c => c[0] === (localStorage.waCurrency || 'INR'))?.[1] || '₹'; return symbol + n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}); };
  const pct = (v) => { const n = finite(v); return n === null ? '—' : n.toFixed(2) + '%'; };
  const number = (v) => { const n = finite(v); return n === null ? '—' : n.toLocaleString('en-US',{maximumFractionDigits:2}); };
  const getCalc = () => {
    const id = new URLSearchParams(location.search).get('calc');
    if (window.CALCULATORS && window.CALCULATORS.length) {
      const slug = location.pathname.split('/').pop().replace(/\.html$/,'');
      return window.CALCULATORS.find(c => c.slug === slug || c.id === id) || null;
    }
    return null;
  };
  const readValues = (calc) => Object.fromEntries((calc.fields || []).map(f => {
    const el = document.getElementById('calc-widget')?.querySelector(`[name="${CSS.escape(f.id)}"],#${CSS.escape(f.id)}`);
    const raw = el?.value;
    if (f.type === 'select') return [f.id, raw ?? f.default];
    const n = Number(raw); return [f.id, Number.isFinite(n) ? n : Number(f.default)];
  }));
  const compute = (calc, values) => { try { const rows = calc.compute(values) || []; return rows.every(r => Number.isFinite(Number(r.value))) ? rows : null; } catch (_) { return null; } };
  const primary = (rows) => rows?.find(r => /future|final|corpus|maturity|monthly payment|annualized|net worth|after-tax|profit|total repayment|interest/i.test(r.label)) || rows?.[rows.length - 1];
  const rowBy = (rows, re) => rows?.find(r => re.test(String(r.label)));
  const format = (r) => { if (!r) return '—'; if (r.format === 'percent') return pct(r.value); if (r.format === 'years') return number(r.value) + ' yrs'; if (r.format === 'number') return number(r.value); return money(r.value); };

  function profile(calc, values) {
    const id = calc.id;
    if (['sip','compound-interest','lumpsum','fixed-deposit','recurring-deposit'].includes(id)) return {kind:'growth', field: id === 'sip' ? 'rate' : 'rate', direction:'higher', label:'expected return / interest rate', deltas:[-2,0,2]};
    if (['mortgage','car-loan','personal-loan'].includes(id)) return {kind:'loan', field:'rate', direction:'lower', label:'interest rate', deltas:[-1,0,1]};
    if (id === 'roi') return {kind:'roi', field:'finalValue', direction:'higher', label:'final value', deltas:[-10,0,10], relative:true};
    if (id === 'debt-payoff') return {kind:'debt', field:'payment', direction:'higher', label:'monthly payment', deltas:[-20,0,20], relative:true};
    if (['retirement','retirement-corpus','retirement-planning'].includes(id)) return {kind:'retirement', field:'rate', direction:'higher', label:'expected return', deltas:[-2,0,2]};
    return null;
  }
  function scenarioValues(calc, base, delta, p) {
    const v = {...base}; const current = finite(base[p.field]); if (current === null) return null;
    v[p.field] = p.relative ? Math.max(0, current * (1 + delta / 100)) : Math.max(0, current + delta);
    const field = calc.fields.find(f => f.id === p.field); if (field?.max != null) v[p.field] = Math.min(field.max, v[p.field]);
    return v;
  }
  function scenarioName(p, delta) { if (delta === 0) return 'Base'; if (p.kind === 'loan') return delta < 0 ? 'Lower rate' : 'Higher rate'; if (p.kind === 'debt') return delta < 0 ? 'Lower payment' : 'Higher payment'; return delta < 0 ? 'Conservative' : 'Optimistic'; }

  function renderScenarios(calc, base, host) {
    const p = profile(calc, base); if (!p) return '';
    const cards = [-1,0,1].map((_,i) => p.deltas[i]).map(delta => {
      const v = scenarioValues(calc,base,delta,p), rows = v ? compute(calc,v) : null, r = primary(rows);
      return {name:scenarioName(p,delta),delta, value:r, values:v};
    }).filter(x => x.value);
    if (cards.length < 3) return '';
    const baseCard = cards.find(c => c.delta === 0), baseNum = finite(baseCard.value.value);
    return `<section class="wa2-panel" aria-labelledby="wa2-scenarios-title"><div class="wa2-kicker">DECISION RANGE</div><h2 id="wa2-scenarios-title">What if the key assumption changes?</h2><p class="wa2-muted">Three planning cases show how sensitive this result is to ${esc(p.label)}. They are scenarios, not forecasts.</p><div class="wa2-scenario-grid">${cards.map(c => { const n=finite(c.value.value), diff=(n!==null&&baseNum!==null&&baseNum!==0)?((n-baseNum)/Math.abs(baseNum))*100:0; return `<div class="wa2-scenario ${c.delta===0?'is-base':''}"><span>${esc(c.name)}</span><strong>${esc(format(c.value))}</strong><small>${c.delta===0?'Your current inputs':(diff>=0?'+':'')+diff.toFixed(1)+'% vs base'}</small></div>`; }).join('')}</div><p class="wa2-foot">Change the assumption above to test your own range. Wealth Arrays does not predict which case will occur.</p></section>`;
  }

  function renderSensitivity(calc, base) {
    const p = profile(calc,base); if (!p) return '';
    const values = [-10,-5,0,5,10].map(delta => { const v=scenarioValues(calc,base,delta,p); const rows=v?compute(calc,v):null; const r=primary(rows); return {delta,r}; }).filter(x=>x.r);
    if (values.length < 3) return '';
    const baseRow=values.find(x=>x.delta===0)?.r, baseNum=finite(baseRow?.value);
    return `<section class="wa2-panel" aria-labelledby="wa2-sensitivity-title"><div class="wa2-kicker">SENSITIVITY</div><h2 id="wa2-sensitivity-title">See how the result moves</h2><p class="wa2-muted">The table changes only <strong>${esc(p.label)}</strong>; all other inputs stay fixed.</p><div class="wa2-table-wrap"><table class="wa2-table"><thead><tr><th>${esc(p.label)}</th><th>${esc(baseRow?.label || 'Result')}</th><th>vs base</th></tr></thead><tbody>${values.map(x=>{const n=finite(x.r.value),diff=(n!==null&&baseNum!==null&&baseNum!==0)?(n-baseNum)/Math.abs(baseNum)*100:0; const current=finite(base[p.field]); const shown=p.relative&&current!==null?current*(1+x.delta/100):current!==null?Math.max(0,current+x.delta):null; return `<tr class="${x.delta===0?'is-base':''}"><td>${x.delta===0?'Base':(x.delta>0?'+':'')+x.delta+(p.relative?'%':' percentage points')}</td><td>${esc(format(x.r))}</td><td>${x.delta===0?'—':(diff>=0?'+':'')+diff.toFixed(1)+'%'}</td></tr>`;}).join('')}</tbody></table></div><p class="wa2-foot">Sensitivity is mathematical only. It does not account for fees, taxes, market volatility, or lender/provider-specific terms unless your inputs do.</p></section>`;
  }

  function renderMeaning(calc, values, rows) {
    if (!rows?.length) return '';
    const id=calc.id, p=primary(rows), pieces=[];
    if (['sip','compound-interest','lumpsum','fixed-deposit','recurring-deposit'].includes(id)) {
      const invested=rowBy(rows,/you put in|principal|deposited|invested/i), gain=rowBy(rows,/growth|profit|interest earned|interest$/i);
      if (invested && gain) pieces.push(`Your projected result is driven by <strong>${esc(format(invested))}</strong> of contributions/principal and <strong>${esc(format(gain))}</strong> of growth or interest.`);
      if (rowBy(rows,/today's|purchasing power/i)) pieces.push('The inflation-adjusted figure is the more useful number for judging future spending power; nominal money can look larger simply because prices rise over time.');
    } else if (['mortgage','car-loan','personal-loan'].includes(id)) {
      const pay=rowBy(rows,/monthly payment/i), interest=rowBy(rows,/total interest/i), total=rowBy(rows,/total repayment/i);
      if(pay&&interest&&total) pieces.push(`Your payment is <strong>${esc(format(pay))}</strong> per month. Over the full term, you repay <strong>${esc(format(total))}</strong>, including <strong>${esc(format(interest))}</strong> of interest.`);
      pieces.push('A shorter term usually raises the monthly payment but reduces the time interest can accrue. Compare both payment and total interest before choosing a term.');
    } else if(id==='roi') {
      const roi=rowBy(rows,/total ROI/i), ann=rowBy(rows,/annualized/i); if(roi) pieces.push(`The investment gained or lost <strong>${esc(format(roi))}</strong> in total; annualized return helps compare holdings with different time periods${ann?' and is shown here as '+esc(format(ann)):''}.`);
    } else if(id==='debt-payoff') {
      const months=rowBy(rows,/payoff|months/i), interest=rowBy(rows,/total interest/i); if(months) pieces.push(`At the payment you entered, the estimated payoff period is <strong>${esc(format(months))}</strong>${interest?' with about <strong>'+esc(format(interest))+'</strong> of interest.':''}`); pieces.push('The most useful lever is usually the payment amount: test a higher payment in the sensitivity table to see how much time and interest can change.');
    } else if (p) pieces.push(`The headline result is <strong>${esc(format(p))}</strong>. Treat it as a planning estimate based on your inputs, not a guaranteed outcome.`);
    return pieces.length?`<section class="wa2-panel wa2-meaning" aria-labelledby="wa2-meaning-title"><div class="wa2-kicker">YOUR RESULT</div><h2 id="wa2-meaning-title">What this number means</h2>${pieces.map(x=>`<p>${x}</p>`).join('')}</section>`:'';
  }

  const journeys = {
    sip:[['ROI Calculator','roi-calculator.html'],['Compound Interest','compound-interest-calculator.html']],
    'compound-interest':[['SIP Calculator','sip-calculator.html'],['Fixed Deposit Calculator','fixed-deposit-calculator.html']],
    mortgage:[['Debt Payoff Calculator','debt-payoff-calculator.html'],['ROI Calculator','roi-calculator.html']],
    'car-loan':[['Debt Payoff Calculator','debt-payoff-calculator.html'],['Mortgage / Loan EMI','mortgage-emi-calculator.html']],
    'personal-loan':[['Debt Payoff Calculator','debt-payoff-calculator.html'],['Mortgage / Loan EMI','mortgage-emi-calculator.html']],
    roi:[['SIP Calculator','sip-calculator.html'],['Compound Interest','compound-interest-calculator.html']],
    'debt-payoff':[['Mortgage / Loan EMI','mortgage-emi-calculator.html'],['SIP Calculator','sip-calculator.html']],
    'profit-margin':[['ROI Calculator','roi-calculator.html'],['Overtime Calculator','overtime-calculator.html']]
  };
  function renderJourney(calc) {
    const links=journeys[calc.id]; if(!links) return '';
    return `<section class="wa2-panel wa2-next" aria-labelledby="wa2-next-title"><div class="wa2-kicker">NEXT STEP</div><h2 id="wa2-next-title">Continue the decision</h2><p class="wa2-muted">One calculation rarely answers the whole question. Use a related tool to pressure-test the next part of the decision.</p><div class="wa2-next-grid">${links.map(([name,url])=>`<a href="/${url}"><strong>${esc(name)}</strong><span>Open calculator →</span></a>`).join('')}</div></section>`;
  }

  function mount() {
    const calc=getCalc(); const widget=document.getElementById('calc-widget'); if(!calc||!widget||document.querySelector('[data-wa-phase2]')) return;
    const base=readValues(calc), rows=compute(calc,base); if(!rows) return;
    const anchor=document.querySelector('.tool-article') || widget.parentElement;
    if(!anchor) return;
    const wrap=document.createElement('div'); wrap.dataset.waPhase2='true'; wrap.className='wa2-wrap';
    wrap.innerHTML=renderMeaning(calc,base,rows)+renderScenarios(calc,base,wrap)+renderSensitivity(calc,base)+renderJourney(calc);
    if (!wrap.innerHTML) return;
    anchor.parentNode.insertBefore(wrap,anchor);
    let timer=0;
    const refresh=()=>{ clearTimeout(timer); timer=setTimeout(()=>{
      const v=readValues(calc), r=compute(calc,v); if(!r)return;
      const next=document.createElement('div'); next.className='wa2-wrap'; next.dataset.waPhase2='true'; next.innerHTML=renderMeaning(calc,v,r)+renderScenarios(calc,v,next)+renderSensitivity(calc,v)+renderJourney(calc); wrap.replaceWith(next);
    },120); };
    document.addEventListener('input',e=>{if(e.target.closest('#calc-widget'))refresh();},true);
    document.addEventListener('change',e=>{if(e.target.closest('#calc-widget'))refresh();},true);
    window.addEventListener('wa-currency',refresh);
  }
  function css(){ if(document.getElementById('wa2-style'))return; const s=document.createElement('style');s.id='wa2-style';s.textContent=`
    .wa2-wrap{max-width:100%;margin:28px 0}.wa2-panel{margin:18px 0;padding:24px;border:1px solid var(--border,#e4e7ec);border-radius:18px;background:var(--surface,#fff);box-shadow:0 8px 30px rgba(16,24,40,.05)}.wa2-panel h2{margin:4px 0 8px;font-size:20px}.wa2-muted,.wa2-foot{color:var(--muted,#667085);line-height:1.6}.wa2-kicker{font-size:11px;font-weight:800;letter-spacing:.12em;color:var(--accent,#2563eb)}.wa2-scenario-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px}.wa2-scenario{padding:16px;border:1px solid var(--border,#e4e7ec);border-radius:14px;display:flex;flex-direction:column;gap:6px}.wa2-scenario.is-base{box-shadow:inset 0 0 0 2px rgba(37,99,235,.18)}.wa2-scenario span{font-size:12px;font-weight:800}.wa2-scenario strong{font-size:20px}.wa2-scenario small{color:var(--muted,#667085)}.wa2-table-wrap{overflow:auto;margin-top:16px}.wa2-table{width:100%;border-collapse:collapse;min-width:480px}.wa2-table th,.wa2-table td{text-align:left;padding:12px;border-bottom:1px solid var(--border,#e4e7ec)}.wa2-table th:last-child,.wa2-table td:last-child{text-align:right}.wa2-table .is-base{font-weight:800;background:rgba(37,99,235,.05)}.wa2-next-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:16px}.wa2-next-grid a{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:15px 16px;border:1px solid var(--border,#e4e7ec);border-radius:14px;text-decoration:none;color:inherit}.wa2-next-grid a:hover{transform:translateY(-1px)}.wa2-next-grid span{font-size:12px;color:var(--muted,#667085);white-space:nowrap}.wa2-foot{font-size:12px;margin:14px 0 0}.wa2-meaning p{margin:10px 0;line-height:1.65}.wa2-meaning strong{font-weight:800}@media(max-width:700px){.wa2-scenario-grid,.wa2-next-grid{grid-template-columns:1fr}.wa2-panel{padding:18px;border-radius:14px}.wa2-scenario strong{font-size:18px}}
  `;document.head.appendChild(s); }
  function start(){css();mount();setTimeout(mount,500);setTimeout(mount,1400);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
