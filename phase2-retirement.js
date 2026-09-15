/* Wealth Arrays — Phase 2 retirement decision layer */
(function () {
  'use strict';
  if (window.waPhase2RetirementLoaded) return;
  window.waPhase2RetirementLoaded = true;
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const n=v=>Number.isFinite(Number(v))?Number(v):null;
  const fmt=v=>{const x=n(v);if(x===null)return'—';const s=(window.WA?.currencies||[['INR','₹']]).find(c=>c[0]===(localStorage.waCurrency||'INR'))?.[1]||'₹';return s+x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});};
  function mount(){
    const id=window.CALCULATORS?.find(c=>c.slug===location.pathname.split('/').pop().replace(/\.html$/,'')||c.id===new URLSearchParams(location.search).get('calc'))?.id;
    if(id!=='freedom-milestone'||document.querySelector('[data-wa-retirement-intelligence]'))return;
    const calc=window.CALCULATORS.find(c=>c.id===id), fields=calc.fields||[], values={};
    fields.forEach(f=>{const el=document.getElementById('calc-widget')?.querySelector('#'+CSS.escape(f.id)+',[name="'+CSS.escape(f.id)+'"]');const x=Number(el?.value);values[f.id]=Number.isFinite(x)?x:Number(f.default);});
    const pick=(re)=>fields.find(f=>re.test((f.label||'')+' '+f.id));
    const expenseField=pick(/annual.*expense|annual.*spend|spending|expenses/i), rateField=pick(/withdrawal|safe.*rate/i), savingsField=pick(/current.*saving|current.*portfolio|savings|portfolio/i);
    if(!expenseField||!rateField)return;
    const expenses=n(values[expenseField.id])||0, rate=n(values[rateField.id])||0, savings=savingsField?n(values[savingsField.id])||0:0;
    if(expenses<=0||rate<=0)return;
    const target=expenses/(rate/100), shortfall=Math.max(0,target-savings), progress=target>0?Math.min(100,savings/target*100):0;
    const scenarios=[rate-1,rate,rate+1].filter(x=>x>0).map(x=>({rate:x,target:expenses/(x/100)}));
    const anchor=document.querySelector('.tool-article')||document.getElementById('calc-widget')?.parentElement;if(!anchor)return;
    const el=document.createElement('section');el.className='wa2-panel wa2-retirement';el.dataset.waRetirementIntelligence='true';el.innerHTML=`<div class="wa2-kicker">RETIREMENT DECISION VIEW</div><h2>Target, gap and sensitivity</h2><p class="wa2-muted">The headline target is only the starting point. This view separates the portfolio target from what you already have and shows how strongly the result depends on the withdrawal-rate assumption.</p><div class="wa2-retirement-grid"><div><span>Estimated target</span><strong>${esc(fmt(target))}</strong></div><div><span>Still needed</span><strong>${esc(fmt(shortfall))}</strong></div><div><span>Current progress</span><strong>${progress.toFixed(1)}%</strong></div></div><div class="wa2-table-wrap"><table class="wa2-table"><thead><tr><th>Withdrawal rate</th><th>Required target</th><th>Change vs current target</th></tr></thead><tbody>${scenarios.map(x=>`<tr class="${x.rate===rate?'is-base':''}"><td>${x.rate.toFixed(1)}%</td><td>${esc(fmt(x.target))}</td><td>${x.rate===rate?'Base':((x.target-target)/target*100).toFixed(1)+'%'}</td></tr>`).join('')}</tbody></table></div><p class="wa2-foot">A lower withdrawal rate produces a larger target. Historical withdrawal research is not a guarantee of future portfolio survival; taxes, fees, asset allocation, retirement length and spending changes can materially alter the outcome.</p></section>`;
    anchor.parentNode.insertBefore(el,anchor);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setTimeout(mount,250);setTimeout(mount,1000)},{once:true});else{setTimeout(mount,250);setTimeout(mount,1000)}
})();
