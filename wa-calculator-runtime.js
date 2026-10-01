/* Wealth Arrays canonical calculator runtime. Generated 20261001113130. */
(function(){const k='__WA_CANONICAL_CALCULATOR_RUNTIME__';if(window[k])return;window[k]=true;})();
/* ===== WA CANONICAL MODULE | calculator | widget.js | sha256:014c39ac0fe1 ===== */
/* Wealth Arrays — lightweight calculator UI */
const safeStorage={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const currencyList=()=>window.WA?.currencies||[['USD','$','US Dollar'],['EUR','€','Euro'],['GBP','£','British Pound'],['INR','₹','Indian Rupee']];
const waState={currency:safeStorage.get('waCurrency')||'INR',theme:safeStorage.get('waTheme')||'light'};
function waCurrencySymbol(){const c=currencyList().find(c=>c[0]===waState.currency);return c?c[1]:'₹'}
function waFormatValue(value,format){if(!Number.isFinite(Number(value)))return'—';const n=Number(value);if(format==='percent')return n.toFixed(2)+'%';if(format==='number')return Math.round(n).toLocaleString('en-US');if(format==='years')return n.toFixed(1)+' yrs';return waCurrencySymbol()+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function esc(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function applyGlobalTheme(){document.documentElement.dataset.theme=waState.theme;const b=document.getElementById('theme-toggle'),s=b?.querySelector('[data-theme-label]')||document.getElementById('theme-toggle-label');if(s)s.textContent=waState.theme==='dark'?'Light mode':'Dark mode';if(b)b.setAttribute('aria-pressed',String(waState.theme==='dark'))}
function initMasthead(onChange){
  // wa-core.js owns the shared header controls. This module only observes them.
  const select=document.getElementById('currency-select');
  const toggle=document.getElementById('theme-toggle');
  if(select){
    waState.currency=select.value||safeStorage.get('waCurrency')||'INR';
    select.addEventListener('change',()=>{waState.currency=select.value||'INR';safeStorage.set('waCurrency',waState.currency);onChange?.();});
  }
  if(toggle){
    waState.theme=document.documentElement.dataset.theme||safeStorage.get('waTheme')||'light';
  }
  window.addEventListener('wa-currency',()=>{if(select){waState.currency=select.value||waState.currency;onChange?.();}});
  window.addEventListener('storage',e=>{
    if(e.key==='waCurrency'){waState.currency=e.newValue||'INR';onChange?.();}
    if(e.key==='waTheme'){waState.theme=e.newValue||'light';applyGlobalTheme();}
  });
}

async function waShare(title,text,url){if(navigator.share){try{await navigator.share({title,text,url});return}catch(e){}}try{await navigator.clipboard.writeText(url);alert('Link copied.')}catch(e){}}
function waOpenPrintReport(calc,values,results){
 const rows=results.map(r=>`<tr><td>${esc(r.label)}</td><td>${esc(waFormatValue(r.value,r.format))}</td></tr>`).join('');
 const inputs=calc.fields.map(f=>`<tr><td>${esc(f.label)}</td><td>${esc(values[f.id] ?? '')}</td></tr>`).join('');
 const liveGraph=document.querySelector('.wa-portfolio-card svg');
 let chart='';
 if(liveGraph){
   const svg=liveGraph.cloneNode(true);
   svg.setAttribute('xmlns','http://www.w3.org/2000/svg');
   svg.setAttribute('width','520');svg.setAttribute('height','300');
   chart='<section class="chartbox"><h2>Result breakdown</h2><p>Visualised from the same calculation shown on the calculator page.</p><div class="chartsvg">'+new XMLSerializer().serializeToString(svg)+'</div></section>';
 } else {
   const numeric=results.map(r=>({label:r.label,value:Number(r.value)})).filter(r=>Number.isFinite(r.value)&&r.value>=0);
   const max=Math.max(...numeric.map(r=>r.value),1);
   const bars=numeric.slice(0,6).map(r=>{const pct=Math.max(2,Math.round(r.value/max*100));return `<div class="bar"><span>${esc(r.label)}</span><div><i style="width:${pct}%"></i></div><b>${esc(waFormatValue(r.value,'number'))}</b></div>`;}).join('');
   chart=bars?`<section class="chartbox"><h2>Calculation summary</h2><p>Bars use the actual calculated values; they are not fabricated percentage shares.</p>${bars}</section>`:'';
 }
 const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(calc.title)} Report</title><style>body{font-family:Arial,sans-serif;max-width:760px;margin:36px auto;padding:0 24px;color:#101828;background:#fff}h1{font-size:30px;margin:0 0 6px}h2{font-size:17px;margin:28px 0 8px}p{color:#667085}table{width:100%;border-collapse:collapse;margin:10px 0 24px;border:1px solid #e4e7ec}td{padding:11px;border-bottom:1px solid #eaecf0}td:last-child{text-align:right;font-weight:700}.brand{color:#667085;font-size:12px;letter-spacing:.08em;font-weight:700}.chartbox{padding:18px;border:1px solid #e4e7ec;border-radius:14px;margin:24px 0}.chartbox h2{margin:0 0 4px}.chartsvg{max-width:560px;margin:14px auto}.chartsvg svg{display:block;width:100%;height:auto}.bar{display:grid;grid-template-columns:160px 1fr auto;gap:10px;align-items:center;margin:12px 0;font-size:12px}.bar>div{height:12px;background:#eef2f6;border-radius:999px;overflow:hidden}.bar i{display:block;height:100%;background:#2563eb;border-radius:999px}.bar b{text-align:right;font-weight:700}@media print{body{margin:18px auto;padding:0}.no-print{display:none}}</style></head><body><div class="brand">WEALTH ARRAYS · CALCULATION REPORT</div><h1>${esc(calc.title)}</h1><p>Generated from the assumptions you entered.</p><h2>Your inputs</h2><table>${inputs}</table><h2>Your calculated results</h2><table>${rows}</table>${chart}<p>Educational estimate only. Not financial, tax, legal or investment advice.</p><button class="no-print" type="button" onclick="window.print()">Save as PDF</button></body></html>`;
 const win=window.open('','_blank');
 if(!win){alert('Your browser blocked the PDF report window. Please allow pop-ups for Wealth Arrays and try again.');return;}
 win.document.open();
 win.document.write(html);
 win.document.close();
 win.focus();
 // Native print dialog is the actual PDF mechanism on desktop browsers.
 // Calling it from the user-triggered export flow avoids a second broken report button.
 setTimeout(()=>{try{win.focus();win.print();}catch(e){const b=win.document.querySelector('.no-print');if(b)b.style.display='inline-block';}},250);
}
async function waCopyEmbed(calc){
  const src=new URL(`/widget.html?calc=${encodeURIComponent(calc.id)}`,location.origin).href;
  const code=`<iframe title="${esc(calc.title)} — Wealth Arrays" src="${src}" width="100%" height="620" loading="lazy" style="border:0;border-radius:16px;max-width:900px"></iframe>`;
  const button=document.getElementById('calc-widget-embed')||document.querySelector('.tool-action[id$="-embed"]');
  const original=button?.textContent||'Copy embed';
  const setStatus=(message,ok=true)=>{
    if(button){button.textContent=message;button.setAttribute('aria-live','polite');button.disabled=true;setTimeout(()=>{button.textContent=original;button.disabled=false},1800)}
    else if(message) alert(message);
  };
  if(navigator.clipboard?.writeText && window.isSecureContext){
    try{await navigator.clipboard.writeText(code);setStatus('Embed copied ✓');return}catch(_e){}
  }
  const ta=document.createElement('textarea');
  ta.value=code;ta.setAttribute('readonly','');ta.setAttribute('aria-hidden','true');
  ta.style.position='fixed';ta.style.left='-9999px';ta.style.top='0';ta.style.opacity='0';
  document.body.appendChild(ta);ta.focus();ta.select();ta.setSelectionRange(0,ta.value.length);
  let copied=false;try{copied=document.execCommand('copy')}catch(_e){}
  ta.remove();
  if(copied){setStatus('Embed copied ✓');return}
  const fallback=window.prompt('Copy this embed code:',code);
  if(fallback!==null) setStatus('Embed ready — paste it');
}

function buildComparePanel(id,calc,currentValues,currentResults){const panel=document.getElementById(`${id}-compare-panel`);if(!panel)return;const example=calc.article?.exampleInputs;if(!example){panel.innerHTML='<div style="padding:14px">No reference scenario is available.</div>';return}let ex=[];try{ex=calc.compute(example)||[]}catch(e){}const a=Object.fromEntries(currentResults.map(r=>[r.label,r])),b=Object.fromEntries(ex.map(r=>[r.label,r]));const labels=[...new Set([...Object.keys(a),...Object.keys(b)])];panel.innerHTML=`<div class="compare-inner"><p>Compared with this calculator's worked example.</p><div class="compare-table"><table><thead><tr><th>Metric</th><th>Your scenario</th><th>Example</th></tr></thead><tbody>${labels.map(l=>`<tr><td>${esc(l)}</td><td>${a[l]?esc(waFormatValue(a[l].value,a[l].format)):'—'}</td><td>${b[l]?esc(waFormatValue(b[l].value,b[l].format)):'—'}</td></tr>`).join('')}</tbody></table></div></div>`}

/* Accurate portfolio-style breakdown. Only charts genuine additive components,
   never a derived total together with the values that create it. */
function waRenderAccuratePie(id,calc,values,rows){
 const host=document.getElementById(id+'-graph');if(!host)return;
 const row=(re)=>rows.find(r=>re.test(String(r.label)));
 const n=x=>Number(x), clean=x=>Number.isFinite(n(x))?n(x):0;
 let parts=null, title='Where your result comes from';
 const add=(label,value,format='currency')=>({label,value:clean(value),format});
 const monthly=clean(values.monthly), principal=clean(values.principal), rate=clean(values.rate), years=clean(values.years);
 const firstTotal=()=>rows.find(r=>/future value|maturity value|total amount|final value|estimated corpus|total repayment/i.test(r.label));
 if(calc.id==='sip'||calc.id==='investment'){
   const inv=row(/You put in|Invested amount/i), gain=row(/growth|profit|returns/i);
   if(inv&&gain)parts=[add('Money invested',inv.value),add('Growth / returns',gain.value)];
 } else if(calc.id==='compound-interest'||calc.id==='lumpsum'||calc.id==='fixed-deposit'){
   const total=firstTotal(), interest=row(/interest earned|growth|returns/i);
   if(total&&interest)parts=[add('Original investment',Math.max(0,clean(total.value)-clean(interest.value))),add('Growth / interest',interest.value)];
 } else if(calc.id==='recurring-deposit'){
   const total=firstTotal(); if(total){const invested=monthly*12*years;parts=[add('Money deposited',invested),add('Interest earned',Math.max(0,clean(total.value)-invested))];}
 } else if(['mortgage','car-loan','personal-loan'].includes(calc.id)){
   const repayment=row(/total repayment/i), interest=row(/total interest/i);
   if(repayment&&interest)parts=[add('Loan amount',Math.max(0,clean(repayment.value)-clean(interest.value))),add('Total interest',interest.value)];
 } else if(calc.id==='simple-interest'){
   const total=row(/total amount/i), interest=row(/^Interest$/i);
   if(total&&interest)parts=[add('Original amount',Math.max(0,clean(total.value)-clean(interest.value))),add('Interest',interest.value)];
 } else if(calc.id==='roi'){
   const cost=clean(values.cost), finalValue=clean(values.finalValue);
   if(finalValue>=cost)parts=[add('Original investment',cost),add('Profit',finalValue-cost)];
 } else if(calc.id==='profit-margin'){
   const revenue=clean(values.revenue),cogs=clean(values.cogs),expenses=clean(values.expenses),net=revenue-cogs-expenses;
   if(revenue>0&&net>=0)parts=[add('Cost of goods',cogs),add('Operating expenses',expenses),add('Net profit',net)];
 } else if(calc.id==='net-worth'){
   const assets=clean(values.cash)+clean(values.investments)+clean(values.property),debt=clean(values.debt);
   if(assets>0)parts=[add('Cash',values.cash),add('Investments',values.investments),add('Property',values.property),add('Debt reduction',Math.min(debt,assets))].filter(p=>p.value>0);
   title='Your balance-sheet components';
 } else if(calc.id==='overtime'){
   const regular=row(/regular pay/i), overtime=row(/overtime pay/i);if(regular&&overtime)parts=[add('Regular pay',regular.value),add('Overtime pay',overtime.value)];
 } else if(calc.id==='debt-payoff'){
   const balance=clean(values.balance), payment=clean(values.payment);
   if(balance>0&&payment>0){const interest=Math.max(0,rows.find(r=>/total interest/i.test(r.label))?.value||0);parts=[add('Debt principal',balance),add('Estimated interest',interest)];}
 } else if(calc.id==='income-tax-planner'){
   const income=clean(values.income),ded=clean(values.deductions);const taxRow=row(/tax/i);const tax=taxRow?Math.max(0,clean(taxRow.value)):0;
   if(income>0)parts=[add('Tax',Math.min(tax,income)),add('After-tax income',Math.max(0,income-tax))];
   title='Income split';
 }
 if(!parts||parts.length<2||parts.some(p=>p.value<0)||parts.reduce((s,p)=>s+p.value,0)<=0){
   const numeric=rows.filter(r=>Number.isFinite(clean(r.value))&&clean(r.value)>=0).slice(0,5).map(r=>add(r.label,r.value,r.format||'number'));
   if(numeric.length>=2){host.innerHTML='<div class="wa-pie-head"><span>CALCULATION SUMMARY</span><h3>'+esc(title)+'</h3><p>These bars use the actual values calculated from your inputs.</p></div><div class="wa-value-bars">'+numeric.map(r=>'<div><span>'+esc(r.label)+'</span><i style="width:'+Math.max(4,clean(r.value)/Math.max(...numeric.map(x=>clean(x.value)))*100).toFixed(2)+'%"></i><b>'+esc(waFormatValue(r.value,r.format))+'</b></div>').join('')+'</div>';return;}
   host.innerHTML='';return;
 }
 const total=parts.reduce((s,p)=>s+p.value,0),colors=['#2563eb','#14b8a6','#7c3aed','#f59e0b'];let angle=-90;
 const pt=(a,r)=>{const q=a*Math.PI/180;return[50+r*Math.cos(q),50+r*Math.sin(q)]};
 const path=(a,b)=>{const p1=pt(a,42),p2=pt(b,42),large=b-a>180?1:0;return 'M 50 50 L '+p1[0].toFixed(2)+' '+p1[1].toFixed(2)+' A 42 42 0 '+large+' 1 '+p2[0].toFixed(2)+' '+p2[1].toFixed(2)+' Z'};
 let arcs='',labels='',legend='';
 parts.forEach((p,i)=>{const pct=p.value/total*100,end=angle+pct*3.6,mid=(angle+end)/2;arcs+='<path d="'+path(angle,end)+'" fill="'+colors[i%colors.length]+'"></path>';if(pct>=8){const q=pt(mid,25);labels+='<text x="'+q[0].toFixed(2)+'" y="'+(q[1]+2).toFixed(2)+'" text-anchor="middle" fill="#fff" font-size="7" font-weight="800">'+(pct<10?pct.toFixed(1):pct.toFixed(0))+'%</text>';}legend+='<div class="wa-pie-row"><i style="background:'+colors[i%colors.length]+'"></i><span>'+esc(p.label)+'</span><b>'+esc(waFormatValue(p.value,p.format))+' · '+(pct<10?pct.toFixed(1):pct.toFixed(0))+'%</b></div>';angle=end;});
 host.innerHTML='<div class="wa-pie-head"><span>RESULT BREAKDOWN</span><h3>'+esc(title)+'</h3><p>Percentages are calculated only from genuine parts of the same total.</p></div><div class="wa-pie-layout"><svg viewBox="0 0 100 100" role="img" aria-label="Accurate result breakdown">'+arcs+labels+'<circle cx="50" cy="50" r="14" fill="var(--surface,#fff)"></circle><text x="50" y="51" text-anchor="middle" font-size="9" font-weight="900" fill="currentColor">100%</text></svg><div>'+legend+'</div></div>';
}
// Calculator-page SEO content: formula, worked example, assumptions and FAQs.
function waRenderCalculatorEducation(calc,id){
 const host=document.getElementById(id+'-education');if(!host)return;
 const a=calc.article;
 const fallback={
  formula:'This calculator uses the standard mathematical relationship between the values you enter. Change the assumptions to see how the result changes.',
  exampleInputs:null,
  faqs:[]
 };
 const data=a||fallback;
 const related=(typeof CALCULATORS==='undefined'?[]:CALCULATORS)
  .filter(c=>c.id!==calc.id&&c.category===calc.category).slice(0,4);
 host.innerHTML='<section class="wa-education" aria-label="How this calculator works">'
  +'<div class="eyebrow">UNDERSTAND THE RESULT</div>'
  +'<h2>How this calculation works</h2><p>'+esc(data.formula)+'</p>'
  +(data.exampleInputs?'<h3>A worked example</h3><p>Use the Compare button after calculating to see your numbers beside this calculator\'s reference scenario.</p>':'')
  +'<h3>Important assumptions</h3><p>Results depend entirely on the values and assumptions entered. Rates, returns, inflation, taxes, fees and future conditions can change real-world outcomes.</p>'
  +(data.faqs&&data.faqs.length?'<h3>Common questions</h3><div class="wa-faq-list">'+data.faqs.map(x=>'<details><summary>'+esc(x.q)+'</summary><p>'+esc(x.a)+'</p></details>').join('')+'</div>':'')
  +(related.length?'<h3>Related calculators</h3><div class="wa-related">'+related.map(x=>'<a href="'+esc(x.slug)+'.html"><b>'+esc(x.title)+'</b><span>'+esc(x.short)+'</span></a>').join('')+'</div>':'')
  +'<p class="wa-education-note">Educational estimates only. Read our <a href="methodology.html">methodology</a> and <a href="disclaimer.html">financial disclaimer</a>.</p></section>';
}

function mountCalculator(calc,id){const container=document.getElementById(id);if(!container||!calc)return;const fields=calc.fields.map(f=>f.type==='select'?`<div class="field"><label for="f-${esc(f.id)}">${esc(f.label)}</label><select id="f-${esc(f.id)}" data-field="${esc(f.id)}">${f.options.map(o=>`<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('')}</select></div>`:`<div class="field"><label for="f-${esc(f.id)}">${esc(f.label)}${f.suffix?` <span class="hint">(${esc(f.suffix)})</span>`:''}</label><input id="f-${esc(f.id)}" data-field="${esc(f.id)}" type="number" inputmode="decimal" placeholder="Enter ${esc(f.label.toLowerCase())}" ${f.min!==undefined?`min="${f.min}"`:''} ${f.max!==undefined?`max="${f.max}"`:''} ${f.step!==undefined?`step="${f.step}"`:''}></div>`).join('');container.innerHTML=`<div class="calc-widget-body"><div class="calc-grid">${fields}</div><button type="button" class="wa-calculate-btn" id="${id}-calculate">Calculate result</button><div class="calc-result" id="${id}-result" aria-live="polite"></div><div class="wa-portfolio-card" id="${id}-graph"></div><div class="tool-actions"><button type="button" class="tool-action primary" id="${id}-share">Share</button><button type="button" class="tool-action" id="${id}-export">Export PDF report</button><button type="button" class="tool-action" id="${id}-embed">Copy embed</button><button type="button" class="tool-action" id="${id}-compare" aria-expanded="false">Compare</button></div><div class="compare-panel" id="${id}-compare-panel" hidden></div><div id="${id}-education"></div><p class="calc-note">Estimates only, for planning purposes — not financial, tax or investment advice.</p></div>`;let latest=[],latestValues={};function recompute(){latestValues={};let issues=[];calc.fields.forEach(f=>{const e=document.getElementById(`f-${f.id}`);if(!e)return;latestValues[f.id]=f.type==='select'?e.value:(String(e.value).trim()===''?NaN:Number(e.value));if(f.type!=='select'){const v=latestValues[f.id];if(!Number.isFinite(v))issues.push('Enter '+f.label+'.');else if(f.min!==undefined&&v<f.min)issues.push(f.label+' must be at least '+f.min+'.');else if(f.max!==undefined&&v>f.max)issues.push(f.label+' cannot be more than '+f.max+'.');}});const resultHost=document.getElementById(`${id}-result`),graphHost=document.getElementById(`${id}-graph`);if(issues.length){latest=[];resultHost.innerHTML='<div class="wa-result-empty"><b>Check your inputs.</b><br>'+issues.map(esc).join('<br>')+'</div>';graphHost.innerHTML='';return;}try{latest=calc.compute(latestValues)||[];}catch(e){latest=[];console.error('Calculator compute failed:',calc.id,e);resultHost.innerHTML='<div class="wa-result-empty"><b>This calculation could not be completed.</b><br>Please review your values and try again.</div>';graphHost.innerHTML='';return;}if(!latest.length||latest.some(r=>!Number.isFinite(Number(r.value)))){latest=[];resultHost.innerHTML='<div class="wa-result-empty"><b>No valid result was produced.</b><br>Please review the values and assumptions entered.</div>';graphHost.innerHTML='';return;}resultHost.innerHTML=latest.map(r=>`<div class="calc-result-row"><span class="calc-result-label">${esc(r.label)}</span><span class="calc-result-value ${esc(r.emphasis||'')}">${esc(waFormatValue(r.value,r.format))}</span></div>`).join('');waRenderAccuratePie(id,calc,latestValues,latest);}
document.getElementById(`${id}-calculate`)?.addEventListener('click',recompute);
calc.fields.forEach(f=>{const e=document.getElementById(`f-${f.id}`);if(f.type==='select')e.value=f.default;e.addEventListener('input',()=>{});e.addEventListener('change',()=>{})});function ensureCalculated(){if(latest.length)return true;document.getElementById(`${id}-result`).innerHTML='<div class="wa-result-empty">Enter your values and click Calculate result first.</div>';return false;}document.getElementById(`${id}-share`)?.addEventListener('click',()=>{if(!ensureCalculated())return;waShare(calc.title,latest.map(r=>`${r.label} ${waFormatValue(r.value,r.format)}`).join(' • '),location.href)});document.getElementById(`${id}-export`)?.addEventListener('click',()=>{if(ensureCalculated())waOpenPrintReport(calc,latestValues,latest)});document.getElementById(`${id}-embed`)?.addEventListener('click',()=>waCopyEmbed(calc));document.getElementById(`${id}-compare`)?.addEventListener('click',e=>{const p=document.getElementById(`${id}-compare-panel`);p.hidden=!p.hidden;e.currentTarget.setAttribute('aria-expanded',String(!p.hidden));if(!p.hidden){if(ensureCalculated())buildComparePanel(id,calc,latestValues,latest);else p.hidden=true}});initMasthead(recompute);document.getElementById(`${id}-result`).innerHTML='<div class="wa-result-empty">Enter your details and click Calculate result.</div>';document.getElementById(`${id}-graph`).innerHTML='';waRenderCalculatorEducation(calc,id)}
function initSearch(inputId,listSelector,headingId,totalLabel){const input=document.getElementById(inputId);if(!input)return;input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();let n=0;document.querySelectorAll(listSelector).forEach(el=>{const ok=(el.dataset.search||'').toLowerCase().includes(q);el.hidden=!ok;if(ok)n++});const h=document.getElementById(headingId);if(h)h.textContent=q?`${n} RESULT${n===1?'':'S'} FOR "${q.toUpperCase()}"`:totalLabel})}


/* Emergency production mount guard: runs independently of page inline listeners. */
(function(){
  function boot(){
    var target=document.getElementById('calc-widget');
    if(!target || target.dataset.waBooted==='1' || target.children.length) return;
    if(typeof mountCalculator!=='function' || typeof CALCULATORS==='undefined') return;
    var file=(location.pathname.split('/').pop()||'').replace(/\.html$/,'');
    var calc=CALCULATORS.find(function(c){return c.slug===file;});
    if(!calc){
      var h=document.querySelector('.calc-title');
      var title=h?h.textContent.trim().toLowerCase():'';
      calc=CALCULATORS.find(function(c){return c.title.toLowerCase()===title;});
    }
    if(calc){
      target.dataset.waBooted='1';
      try{mountCalculator(calc,'calc-widget');}catch(err){target.dataset.waBooted='';console.error('Calculator mount failed',err);}
    }
  }
  document.addEventListener('DOMContentLoaded',function(){setTimeout(boot,0);});
  window.addEventListener('load',function(){setTimeout(boot,0);});
  setTimeout(boot,0);
})();

/* ===== WA CANONICAL MODULE | calculator | widget-bootstrap.js | sha256:07552f02a6e0 ===== */
(function(){
'use strict';
function boot(){
  var host=document.getElementById('calc-widget');
  if(window.parent!==window) document.documentElement.dataset.waEmbed='1';
  if(!host||host.dataset.waBooted==='1'||host.children.length)return false;
  if(typeof mountCalculator!=='function'||typeof CALCULATORS==='undefined')return false;
  var id=new URLSearchParams(location.search).get('calc')||'sip';
  var calc=CALCULATORS.find(function(x){return x.id===id||x.slug===id;})||CALCULATORS.find(function(x){return x.id==='sip';})||CALCULATORS[0];
  if(calc){host.dataset.waBooted='1';try{mountCalculator(calc,'calc-widget');return true}catch(e){host.dataset.waBooted='';console.error(e)}}
  return false;
}
if(!boot()){
  var tries=0;
  var timer=setInterval(function(){if(boot()||++tries>=100)clearInterval(timer)},50);
}
window.addEventListener('wa:calculator-runtime-ready',boot);
window.addEventListener('load',boot,{once:true});
})();

/* ===== WA CANONICAL MODULE | calculator | wa-core.js | sha256:5e2efc7e2d57 ===== */
/* Wealth Arrays core runtime — one owner for shared site behaviour. */
(function () {
  'use strict';
  if (window.__WEALTH_ARRAYS_CORE_LOADED__) return;
  window.__WEALTH_ARRAYS_CORE_LOADED__ = true;
  const CURRENCIES=[['USD','$','US Dollar'],['EUR','€','Euro'],['JPY','¥','Japanese Yen'],['GBP','£','British Pound'],['AUD','A$','Australian Dollar'],['CAD','C$','Canadian Dollar'],['CHF','CHF','Swiss Franc'],['CNY','CN¥','Chinese Yuan'],['HKD','HK$','Hong Kong Dollar'],['NZD','NZ$','New Zealand Dollar'],['SEK','kr','Swedish Krona'],['KRW','₩','South Korean Won'],['SGD','S$','Singapore Dollar'],['NOK','kr','Norwegian Krone'],['MXN','MX$','Mexican Peso'],['INR','₹','Indian Rupee'],['ZAR','R','South African Rand'],['BRL','R$','Brazilian Real'],['AED','د.إ','UAE Dirham'],['SAR','﷼','Saudi Riyal'],['TRY','₺','Turkish Lira'],['PLN','zł','Polish Zloty'],['THB','฿','Thai Baht'],['IDR','Rp','Indonesian Rupiah'],['MYR','RM','Malaysian Ringgit'],['PHP','₱','Philippine Peso'],['DKK','kr','Danish Krone'],['ILS','₪','Israeli Shekel'],['CZK','Kč','Czech Koruna'],['HUF','Ft','Hungarian Forint']];
  const RELATED={investment:[['sip-calculator.html','SIP Calculator'],['compound-interest-calculator.html','Compound Interest'],['lumpsum-calculator.html','Lump Sum Calculator'],['cagr-calculator.html','CAGR Calculator'],['roi-calculator.html','ROI Calculator']],loan:[['mortgage-emi-calculator.html','Mortgage & EMI'],['car-loan-calculator.html','Car Loan'],['personal-loan-calculator.html','Personal Loan'],['debt-payoff-calculator.html','Debt Payoff']],banking:[['fixed-deposit-calculator.html','Fixed Deposit'],['recurring-deposit-calculator.html','Recurring Deposit'],['simple-interest-calculator.html','Simple Interest'],['inflation-calculator.html','Inflation']],retirement:[['retirement-calculator.html','Retirement'],['inflation-calculator.html','Inflation'],['compound-interest-calculator.html','Compound Interest'],['net-worth-calculator.html','Net Worth']],salary:[['salary-to-hourly-calculator.html','Salary to Hourly'],['overtime-pay-calculator.html','Overtime Pay'],['freelance-rate-calculator.html','Freelance Rate'],['income-tax-scenario-calculator.html','Income Tax Scenario Calculator']],business:[['profit-margin-calculator.html','Profit Margin'],['roi-calculator.html','ROI Calculator'],['freelance-rate-calculator.html','Freelance Rate'],['income-tax-scenario-calculator.html','Income Tax Scenario Calculator']]};
  const CALCULATOR_CATALOG=[['SIP Calculator','sip-calculator.html','Monthly investing and projected wealth.','sip systematic investment plan monthly mutual fund investing'],['Compound Interest','compound-interest-calculator.html','See how compounding changes growth over time.','compound interest compounding savings growth investing'],['Mortgage / EMI','mortgage-emi-calculator.html','Estimate monthly payment and total interest.','mortgage emi home loan loan payment interest'],['ROI Calculator','roi-calculator.html','Measure total and annualized investment return.','roi return investment profit annualized'],['Simple Interest','simple-interest-calculator.html','Calculate flat interest on principal.','simple interest banking loan deposit'],['Retirement Calculator','retirement-calculator.html','Estimate a financial-independence target.','retirement fire pension financial independence goal'],['Salary to Hourly','salary-to-hourly-calculator.html','Convert annual salary and hourly pay.','salary hourly wage income pay'],['Profit Margin','profit-margin-calculator.html','Calculate revenue, cost and margin.','profit margin business revenue cost'],['Fixed Deposit','fixed-deposit-calculator.html','Project deposit growth and maturity value.','fixed deposit fd banking maturity interest'],['Recurring Deposit','recurring-deposit-calculator.html','Plan monthly deposits and maturity value.','recurring deposit rd monthly banking maturity'],['Lumpsum Calculator','lumpsum-calculator.html','Project a one-time investment.','lumpsum lump sum investment one time'],['CAGR Calculator','cagr-calculator.html','Calculate compound annual growth rate.','cagr compound annual growth rate return'],['Car Loan EMI','car-loan-calculator.html','Plan vehicle-loan payments and interest.','car loan auto vehicle emi repayment'],['Personal Loan','personal-loan-calculator.html','Estimate personal-loan repayment cost.','personal loan emi payment repayment'],['Debt Payoff','debt-payoff-calculator.html','Plan a faster route out of debt.','debt payoff repayment credit loan'],['Inflation Calculator','inflation-calculator.html','Understand future purchasing power.','inflation future value purchasing power prices'],['Net Worth','net-worth-calculator.html','Track assets minus liabilities.','net worth assets liabilities wealth'],['Overtime Pay','overtime-pay-calculator.html','Estimate overtime earnings.','overtime pay salary wage income'],['Freelance Rate','freelance-rate-calculator.html','Turn target income into an hourly rate.','freelance rate hourly pricing business income'],['Income Tax Scenario Calculator','income-tax-scenario-calculator.html','Explore tax scenarios using an effective-rate assumption.','income tax tax scenario effective rate planning']];
  const get=(key,fallback)=>{try{return localStorage.getItem(key)||fallback}catch(error){return fallback}};
  const set=(key,value)=>{try{localStorage.setItem(key,value)}catch(error){}};
  function renderFooter(){let footer=document.querySelector('footer');document.querySelectorAll('footer').forEach((node,index)=>{if(index>0)node.remove()});if(!footer){footer=document.createElement('footer');document.body.appendChild(footer)}footer.className='site-footer premium-footer';footer.innerHTML='<div class="site-footer-inner"><div class="footer-brand-row"><a class="footer-logo" href="/index.html" aria-label="Wealth Arrays home"><img src="/favicon-v2.svg" alt="Wealth Arrays logo" width="44" height="44"><span><b>Wealth Arrays</b><small>Financial tools that make numbers clearer.</small></span></a><p class="footer-brand-copy">Fast, browser-first financial calculators for clearer decisions. Results are educational estimates and not financial, tax, legal or investment advice.</p></div><nav class="footer-nav-box" aria-label="Company and legal pages"><a class="footer-link" href="/privacy.html">Privacy Policy</a><a class="footer-link" href="/terms.html">Terms &amp; Conditions</a><a class="footer-link" href="/disclaimer.html">Disclaimer</a><a class="footer-link" href="/about.html">About Us</a><a class="footer-link" href="/contact.html">Contact Us</a><a class="footer-link" href="/methodology.html">Methodology</a><a class="footer-link" href="/editorial-policy.html">Editorial Standards</a><a class="footer-link" href="/advertising-policy.html">Advertising Policy</a><a class="footer-link" href="/faq.html">FAQ</a><button class="footer-link" type="button" data-wa-open-consent>Privacy choices</button></nav><div class="footer-bottom"><span>© 2026 Wealth Arrays</span><span>Questions or corrections: <a href="mailto:goyalalok565@gmail.com">goyalalok565@gmail.com</a></span></div></div>'}
  function addRelatedAndTrust(){const article=document.querySelector('.tool-article');if(!article)return;const tag=document.querySelector('.calc-category-tag');if(!document.querySelector('.wa-related')&&tag){const href=tag.getAttribute('href')||'';const key=href.includes('investment')?'investment':href.includes('loan')?'loan':href.includes('banking')?'banking':href.includes('retirement')?'retirement':href.includes('salary')?'salary':href.includes('business')?'business':'';const current=location.pathname.split('/').pop()||'index.html';const items=(RELATED[key]||[]).filter(item=>item[0]!==current).slice(0,4);if(items.length){const section=document.createElement('section');section.className='related-tools wa-related';section.setAttribute('aria-label','Related calculators');section.innerHTML='<div class="related-heading">Related calculators</div><div class="related-list">'+items.map(item=>'<a href="'+item[0]+'">'+item[1]+' <span>→</span></a>').join('')+'</div><div class="calc-next-links"><a href="'+href+'">Browse this category →</a><a href="/tools.html">Explore all 20 calculators →</a><a href="/faq.html">Read calculator FAQs →</a></div>';article.appendChild(section)}}if(!document.querySelector('.wa-trust-signals')){const section=document.createElement('aside');section.className='wa-trust-signals';section.setAttribute('aria-label','Calculator methodology and trust information');section.innerHTML='<div><strong>Transparent assumptions</strong><span>Results depend on the values and formula shown on this page.</span></div><div><strong>Educational estimates</strong><span>These tools do not replace financial, tax, legal or investment advice.</span></div><div><strong>Your browser</strong><span>Calculator inputs are designed to be processed locally where possible.</span></div><p><a href="/disclaimer.html">Disclaimer</a><a href="/privacy.html">Privacy</a><a href="/contact.html">Contact &amp; corrections</a></p>';article.appendChild(section)}}
  function applyTheme(themeName){const theme=themeName==='dark'?'dark':'light';document.documentElement.dataset.theme=theme;set('waTheme',theme);const button=document.getElementById('theme-toggle');if(button){button.setAttribute('aria-pressed',String(theme==='dark'));button.setAttribute('aria-label','Switch to '+(theme==='dark'?'light':'dark')+' mode');const label=button.querySelector('[data-theme-label]');if(label)label.textContent=theme==='dark'?'Light mode':'Dark mode'}}
  function setupTheme(){applyTheme(get('waTheme',document.documentElement.dataset.theme==='dark'?'dark':'light'));if(document.documentElement.dataset.waThemeOwner==='1')return;document.documentElement.dataset.waThemeOwner='1';document.addEventListener('click',function(event){const button=event.target.closest&&event.target.closest('#theme-toggle');if(!button)return;event.preventDefault();applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark')},true)}
  function applyCurrency(){const select=document.getElementById('currency-select');if(!select)return;const saved=get('waCurrency','INR');select.innerHTML=CURRENCIES.map(item=>'<option value="'+item[0]+'">'+item[0]+' · '+item[1]+' · '+item[2]+'</option>').join('');select.value=CURRENCIES.some(item=>item[0]===saved)?saved:'INR';document.documentElement.dataset.currency=select.value;if(select.dataset.waCurrencyOwner==='1')return;select.dataset.waCurrencyOwner='1';select.addEventListener('change',function(){set('waCurrency',select.value);document.documentElement.dataset.currency=select.value;window.dispatchEvent(new CustomEvent('wa-currency',{detail:{currency:select.value}}));if(typeof window.waTrack==='function')window.waTrack('currency_change',{currency:select.value})})}
  function applyCategories(){const colors={investment:'#0F766E',loan:'#B45309',banking:'#2563EB',retirement:'#6D28D9',salary:'#BE185D',business:'#0E7490'};document.querySelectorAll('.home-tool-card,.tool-card,.ledger-row').forEach(card=>{const text=((card.dataset.search||'')+' '+card.textContent).toLowerCase();let key='investment';if(/mortgage|emi|loan|debt/.test(text))key='loan';else if(/retirement|pension|freedom/.test(text))key='retirement';else if(/salary|hourly|overtime|wage|income/.test(text))key='salary';else if(/business|profit margin|freelance/.test(text))key='business';else if(/fd|fixed deposit|rd|recurring deposit|banking|interest/.test(text))key='banking';card.dataset.waCategory=key;card.style.setProperty('--wa-card-accent',colors[key])})}
  function calculatorSearch(){let input=document.getElementById('tool-search');let box=document.getElementById('tool-search-results');if(!input||!box){const host=document.querySelector('.calc-page');const title=host&&host.querySelector('.calc-title');if(!host)return;const shell=document.createElement('div');shell.className='tool-search-shell wa-calculator-search';shell.innerHTML='<input id="tool-search" type="search" autocomplete="off" placeholder="Search any calculator: SIP, EMI, FD, ROI…" aria-label="Search calculators"><div id="tool-search-results" class="tool-search-results" hidden></div>';if(title)title.insertAdjacentElement('afterend',shell);else host.insertBefore(shell,host.firstChild);input=shell.querySelector('#tool-search');box=shell.querySelector('#tool-search-results')}if(!input||!box||input.dataset.waSearchOwner==='1')return;window.__WA_SEARCH_OWNER__='wa-core';input.dataset.waSearchOwner='1';document.querySelectorAll('.ledger-hero,.hero-copy,.search-bar').forEach(el=>{el.style.overflow='visible'});const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();const escapeHtml=value=>String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));const aliases={sip:'systematic investment plan monthly mutual fund',emi:'mortgage home loan monthly payment',fd:'fixed deposit banking',rd:'recurring deposit monthly banking',roi:'return investment profit',cagr:'compound annual growth return',tax:'income tax scenario',salary:'hourly wage income',loan:'mortgage personal car debt',retirement:'pension financial independence',inflation:'purchasing power future prices',lumpsum:'lump sum investment one time','net worth':'assets liabilities wealth',networth:'assets liabilities wealth','compound interest':'compounding growth','simple interest':'flat interest','profit margin':'business revenue cost margin','car loan':'vehicle loan emi','personal loan':'loan repayment',freelance:'freelance rate hourly pricing',overtime:'overtime pay salary'};function render(){const query=normalize(input.value);if(!query){box.innerHTML='';box.hidden=true;box.style.display='none';return}const terms=(query+' '+(aliases[query]||'')).split(/\s+/).filter(Boolean);const hits=CALCULATOR_CATALOG.map(item=>{const hay=normalize(item[0]+' '+item[2]+' '+item[3]);let score=hay.includes(query)?100:0;terms.forEach(term=>{if(term.length>1&&hay.includes(term))score+=term===query?20:4});return{item,score}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,8);const cards=Array.from(document.querySelectorAll('.home-tool-card,.tool-card,.cat-card,.ledger-row')).map(card=>{const hay=normalize((card.dataset.search||'')+' '+card.textContent);let score=hay.includes(query)?80:0;terms.forEach(term=>{if(term.length>1&&hay.includes(term))score+=2});return{card,score}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,4);const merged=hits.map(({item})=>({title:item[0],desc:item[2],href:'/'+item[1],score:1000})).concat(cards.map(({card,score})=>({title:(card.querySelector('b,h2,h3')?.textContent||'Calculator').trim(),desc:(card.querySelector('p,small')?.textContent||'').trim(),href:card.getAttribute('href')||'#',score}))).filter((item,i,self)=>self.findIndex(x=>x.href===item.href)===i).sort((a,b)=>b.score-a.score).slice(0,8);box.innerHTML=merged.length?merged.map(item=>'<a class="wa-search-suggestion" href="'+item.href+'"><span><strong>'+escapeHtml(item.title)+'</strong><small>'+escapeHtml(item.desc)+'</small></span><b aria-hidden="true">→</b></a>').join(''):'<div class="tool-search-empty">No calculator found. Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';box.hidden=false;box.style.setProperty('display','block','important')}['input','keyup','search','focus'].forEach(name=>input.addEventListener(name,render,true));input.addEventListener('keydown',event=>{if(event.key==='Escape'){box.hidden=true;box.style.display='none';input.blur()}},true);document.addEventListener('click',event=>{if(!input.contains(event.target)&&!box.contains(event.target)){box.hidden=true;box.style.display='none'}},true);render();input.setAttribute('data-wa-search-ready','1');window.__WA_SEARCH_READY__=true}
  function analytics(){const id='G-GYN4W5VFEY';window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments)}window.gtag=window.gtag||gtag;gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});gtag('js',new Date());gtag('config',id,{anonymize_ip:true});if(!document.querySelector('script[data-wa-gtag]')){const script=document.createElement('script');script.async=true;script.dataset.waGtag='1';script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);document.head.appendChild(script)}window.waTrack=function(name,params){try{if(get('waAnalyticsConsent','')==='granted')window.gtag('event',name,params||{})}catch(error){}};const saved=get('waAnalyticsConsent','');if(saved)gtag('consent','update',{analytics_storage:saved==='granted'?'granted':'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'})}
  function consentDialog(){let box=document.getElementById('wa-consent');let style=document.getElementById('wa-consent-css');if(!style){style=document.createElement('style');style.id='wa-consent-css';style.textContent='#wa-consent{position:fixed;z-index:100001;left:16px;right:16px;bottom:16px;margin:auto;width:min(620px,calc(100% - 32px));display:flex;align-items:center;justify-content:space-between;gap:18px;padding:15px 16px;border:1px solid var(--line,#e2e6ed);border-radius:16px;background:var(--surface,#fff);color:var(--text,#10141b);box-shadow:0 16px 48px rgba(0,0,0,.18);font:500 13px/1.4 system-ui,sans-serif}#wa-consent[hidden]{display:none!important}#wa-consent p{margin:3px 0 0;color:var(--muted,#667085);font-size:11px}.wa-consent-actions{display:flex;gap:8px;flex:none}.wa-consent-actions button{padding:9px 14px;border-radius:9px;font:800 11px system-ui,sans-serif;cursor:pointer}.wa-consent-actions button[data-wa-consent="reject"]{background:transparent;color:var(--text,#10141b);border:1px solid var(--text,#10141b)}.wa-consent-actions button[data-wa-consent="accept"]{background:var(--text,#10141b);color:var(--bg,#fff);border:1px solid var(--text,#10141b)}html[data-theme="dark"] .wa-consent-actions button[data-wa-consent="reject"]{color:#fff;border-color:#fff}html[data-theme="dark"] .wa-consent-actions button[data-wa-consent="accept"]{background:#fff;color:#080a0f;border-color:#fff}@media(max-width:560px){#wa-consent{align-items:stretch;flex-direction:column;gap:10px}.wa-consent-actions{justify-content:flex-end}}';document.head.appendChild(style)}if(!box){box=document.createElement('aside');box.id='wa-consent';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Privacy choices');box.innerHTML='<div><strong>Privacy choices</strong><p>We use analytics only with your permission to understand site usage and improve Wealth Arrays.</p></div><div class="wa-consent-actions"><button type="button" data-wa-consent="reject">Reject</button><button type="button" data-wa-consent="accept">Accept</button></div>';document.body.appendChild(box);box.addEventListener('click',event=>{const button=event.target.closest('[data-wa-consent]');if(!button)return;const granted=button.dataset.waConsent==='accept';set('waAnalyticsConsent',granted?'granted':'denied');if(typeof window.gtag==='function')window.gtag('consent','update',{analytics_storage:granted?'granted':'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});box.hidden=true})}document.addEventListener('click',event=>{const opener=event.target.closest&&event.target.closest('[data-wa-open-consent]');if(!opener)return;event.preventDefault();box.hidden=false;const accept=box.querySelector('[data-wa-consent="accept"]');if(accept)setTimeout(()=>accept.focus(),0)},true);box.hidden=!!get('waAnalyticsConsent','')}
  let installEvent=null;
  function installStyles(){if(document.getElementById('wa-install-css'))return;const style=document.createElement('style');style.id='wa-install-css';style.textContent='#wa-install{position:fixed;z-index:100000;left:16px;right:16px;bottom:92px;margin:auto;width:min(620px,calc(100% - 32px));display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 16px;border:1px solid var(--line,#e2e6ed);border-radius:16px;background:var(--surface,#fff);color:var(--text,#10141b);box-shadow:0 16px 48px rgba(0,0,0,.18);font:600 13px/1.35 system-ui,sans-serif}#wa-install p{margin:3px 0 0;color:var(--muted,#667085);font-size:11px}#wa-install .wa-install-actions{display:flex;gap:8px;align-items:center;flex:none}#wa-install button{padding:9px 13px;border-radius:9px;font:800 11px system-ui,sans-serif;cursor:pointer}#wa-install button[data-wa-install-action=install]{background:var(--text,#10141b);color:var(--bg,#fff);border:1px solid var(--text,#10141b)}#wa-install button[data-wa-install-action=close]{background:transparent;color:var(--text,#10141b);border:1px solid var(--line,#e2e6ed)}@media(max-width:560px){#wa-install{bottom:140px;align-items:stretch;flex-direction:column;gap:9px}.wa-install-actions{justify-content:flex-end}}';document.head.appendChild(style)}
  function showInstallBanner(){if(!installEvent||(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone===true)return;const dismissed=Number(get('waInstallDismissedV2','0'));if(dismissed&&Date.now()-dismissed<7*24*60*60*1000)return;if(document.getElementById('wa-install'))return;installStyles();const box=document.createElement('aside');box.id='wa-install';box.setAttribute('role','status');box.innerHTML='<div><strong>Install Wealth Arrays</strong><p>Use Wealth Arrays like an app from your home screen.</p></div><div class="wa-install-actions"><button type="button" data-wa-install-action="close">Not now</button><button type="button" data-wa-install-action="install">Install app</button></div>';document.body.appendChild(box);box.addEventListener('click',async function(event){const button=event.target.closest('[data-wa-install-action]');if(!button)return;if(button.dataset.waInstallAction==='close'){set('waInstallDismissedV2',String(Date.now()));box.remove();return}if(!installEvent){box.remove();return}const promptEvent=installEvent;installEvent=null;window.__WA_INSTALL_PROMPT__=null;try{promptEvent.prompt();await promptEvent.userChoice}catch(error){}box.remove()})}
  window.addEventListener('beforeinstallprompt',function(event){event.preventDefault();installEvent=event;window.__WA_INSTALL_PROMPT__=event;showInstallBanner()},false);
  window.addEventListener('appinstalled',function(){installEvent=null;window.__WA_INSTALL_PROMPT__=null;const box=document.getElementById('wa-install');if(box)box.remove();set('waInstallDismissedV2',String(Date.now()))});
  function registerServiceWorker(){if(!('serviceWorker' in navigator)||!window.isSecureContext)return;const start=()=>navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(()=>{});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start()}
  function styles(){if(document.getElementById('wa-core-css'))return;const style=document.createElement('style');style.id='wa-core-css';style.textContent='.tool-search-shell{position:relative!important;z-index:100!important;overflow:visible!important}.tool-search-shell input{position:relative!important;z-index:101!important}#tool-search-results{position:absolute!important;left:0!important;right:0!important;top:calc(100% + 8px)!important;z-index:2147483647!important;background:var(--surface,#fff)!important;border:1px solid var(--line,#e2e6ed)!important;border-radius:14px!important;overflow:hidden!important;box-shadow:0 18px 50px rgba(0,0,0,.16)!important}.wa-search-suggestion{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px;padding:13px 15px;text-decoration:none!important;color:inherit!important;background:var(--surface,#fff)!important;border-bottom:1px solid var(--line,#e2e6ed)!important}.wa-search-suggestion span{display:grid;gap:2px;min-width:0}.wa-search-suggestion small{color:var(--muted,#667085);font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wa-search-suggestion>b{flex:none}.tool-search-empty{padding:14px;color:var(--muted,#667085);font-size:11px}.tool-card[data-wa-category],.home-tool-card[data-wa-category],.ledger-row[data-wa-category]{position:relative!important;box-sizing:border-box!important;background:var(--surface)!important;border-left:1.5px solid var(--line)!important;border-right:1.5px solid var(--line)!important;border-bottom:1.5px solid var(--line)!important;border-top:3.5px solid var(--wa-card-accent)!important;border-radius:18px!important;box-shadow:0 6px 20px rgba(16,24,40,.06)!important;overflow:hidden}#tool-search-results{max-height:min(55vh,520px);overflow-y:auto!important;-webkit-overflow-scrolling:touch}.ledger-hero:has(#tool-search){overflow:visible!important}.hero-copy:has(#tool-search),.search-bar:has(#tool-search){overflow:visible!important}';document.head.appendChild(style)}
  function runSafe(name,fn){try{fn()}catch(error){try{console.error('[Wealth Arrays]',name,error)}catch(_){}}}
  function installPromptInit(){return}
  function init(){[['styles',styles],['theme',setupTheme],['currency',applyCurrency],['categories',applyCategories],['search',calculatorSearch],['related',addRelatedAndTrust],['footer',renderFooter],['analytics',analytics],['consent',consentDialog],['serviceWorker',registerServiceWorker],['install',installPromptInit]].forEach(task=>runSafe(task[0],task[1]));setTimeout(calculatorSearch,250);setTimeout(calculatorSearch,1000);window.addEventListener('load',calculatorSearch,{once:true});window.addEventListener('pageshow',calculatorSearch)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>runSafe('init',init),{once:true});else runSafe('init',init);
})();

/* ===== WA CANONICAL MODULE | calculator | site-runtime.js | sha256:5c9ef46299a9 ===== */
/* Wealth Arrays visual runtime — cards, charts and defensive UX fallbacks. */
(function () {
  'use strict';
  /* Hub pages already have one shared runtime owner; keep this visual/calculator layer off them. */
  if(window.__WEALTH_ARRAYS_CORE_LOADED__&&!document.querySelector('.calc-page'))return;
  function installAdSense(){
    if(/(?:^|\/)404\.html$|(?:^|\/)widget\.html$/.test(location.pathname)) return;
    if(document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) return;
    var s=document.createElement('script');
    s.async=true;
    s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6507600103785450';
    s.crossOrigin='anonymous';
    document.head.appendChild(s);
  }
  function resultRows() { return Array.from(document.querySelectorAll('.calc-result-row')).map(function (row) { var text = row.querySelector('.calc-result-value')?.textContent || ''; return { label: row.querySelector('.calc-result-label')?.textContent?.trim() || '', text: text.trim(), value: Number(text.replace(/[^0-9.eE+-]/g, '')) }; }).filter(function (row) { return Number.isFinite(row.value); }); }
  function safePie(host) { var rows = resultRows().filter(function (row) { return row.value > 0; }).slice(0, 6); if (!rows.length) return; var total = rows.reduce(function (a, r) { return a + r.value; }, 0); if (!Number.isFinite(total) || total <= 0) return; var ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '0 0 200 200'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Result composition chart'); var angle = -Math.PI / 2; rows.forEach(function (r) { var next = angle + (r.value / total) * Math.PI * 2, x1 = 100 + 78 * Math.cos(angle), y1 = 100 + 78 * Math.sin(angle), x2 = 100 + 78 * Math.cos(next), y2 = 100 + 78 * Math.sin(next), large = next - angle > Math.PI ? 1 : 0; var path = document.createElementNS(ns, 'path'); path.setAttribute('d', 'M100 100 L' + x1 + ' ' + y1 + ' A78 78 0 ' + large + ' 1 ' + x2 + ' ' + y2 + ' Z'); path.setAttribute('fill', 'none'); path.setAttribute('stroke', 'currentColor'); path.setAttribute('stroke-width', '30'); path.setAttribute('stroke-dasharray', '1 1'); path.setAttribute('pathLength', '1'); path.setAttribute('stroke-dashoffset', String(-angle / (Math.PI * 2))); svg.appendChild(path); angle = next; }); host.innerHTML = ''; host.appendChild(svg); }
  function graphGuard() { document.querySelectorAll('[data-chart],.calc-chart,.chart-wrap').forEach(function (host) { var svg = host.querySelector('svg'); if (!svg) return; var rect = svg.getBoundingClientRect(); if (rect.width >= 20 && rect.height >= 20 && !/NaN|Infinity|-Infinity/.test(svg.outerHTML)) return; safePie(host); }); }
  function styles() { if (document.getElementById('wa-visual-runtime-css')) return; var style = document.createElement('style'); style.id = 'wa-visual-runtime-css'; style.textContent = '.tool-card[data-wa-category],.home-tool-card[data-wa-category],.ledger-row[data-wa-category]{position:relative!important;box-sizing:border-box!important;background:var(--surface)!important;border-left:1.5px solid var(--line)!important;border-right:1.5px solid var(--line)!important;border-bottom:1.5px solid var(--line)!important;border-top:3.5px solid var(--wa-card-accent)!important;border-radius:18px!important;box-shadow:0 6px 20px rgba(16,24,40,.06)!important;overflow:hidden}.wa-scale-safe{margin-top:14px;border:1px solid var(--line);border-radius:15px;padding:16px;background:var(--surface2)}.wa-scale-safe-head span{font-size:9px;letter-spacing:.14em;color:var(--accent);font-weight:850}.wa-scale-safe-head h3{margin:3px 0;font-size:15px}.wa-scale-safe-head p{margin:0 0 12px;color:var(--muted);font-size:10px}.wa-pie-wrap{display:grid;grid-template-columns:160px 1fr;gap:18px;align-items:center}.wa-pie-wrap svg{width:160px;height:160px;display:block}.wa-pie-row{display:grid;grid-template-columns:10px 1fr auto;gap:7px;align-items:center;padding:8px 0;border-top:1px solid var(--line);font-size:10px}.wa-pie-row i{width:9px;height:9px;border-radius:50%;display:block}@media(max-width:600px){.wa-pie-wrap{grid-template-columns:1fr}.wa-pie-wrap svg{margin:auto}}'; document.head.appendChild(style); }
  function init() {
    installAdSense();
    styles(); graphGuard();
    if ('MutationObserver' in window) {
      var scheduled = false;
      var rerun = function(){ if(scheduled) return; scheduled=true; requestAnimationFrame(function(){scheduled=false;graphGuard();}); };
      new MutationObserver(rerun).observe(document.body,{childList:true,subtree:true});
      window.addEventListener('resize', rerun, {passive:true});
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();

/* ===== WA CANONICAL MODULE | calculator | final-polish.js | sha256:b698ae4a9ef3 ===== */
/* Wealth Arrays final polish — non-destructive UX, content consistency and trust signals. */
(function(){'use strict';
/* Search fallback is shared by the home/tool hubs; the canonical bundle already owns theme/currency state. */
if(window.__WEALTH_ARRAYS_FINAL_POLISH_LOADED__)return; window.__WEALTH_ARRAYS_FINAL_POLISH_LOADED__=true;
const CURRENCY_SYMBOLS={USD:'$',EUR:'€',JPY:'¥',GBP:'£',AUD:'A$',CAD:'C$',CHF:'CHF',CNY:'CN¥',HKD:'HK$',NZD:'NZ$',SEK:'kr',KRW:'₩',SGD:'S$',NOK:'kr',MXN:'MX$',INR:'₹',ZAR:'R',BRL:'R$',AED:'د.إ',SAR:'﷼',TRY:'₺',PLN:'zł',THB:'฿',IDR:'Rp',MYR:'RM',PHP:'₱',DKK:'kr',ILS:'₪',CZK:'Kč',HUF:'Ft'};
function tidy(){
 document.querySelectorAll('#language-select').forEach(s=>{if(!s.options.length||!s.value)s.remove()});
 const footers=[...document.querySelectorAll('footer')];if(footers.length>1)footers.slice(1).forEach(f=>f.remove());
 const f=document.querySelector('footer');if(f){const brands=[...f.querySelectorAll('.footer-logo,.footer-mark')];if(brands.length>1)brands.slice(1).forEach(x=>x.remove());const imgs=[...f.querySelectorAll('.footer-brand-row img,.footer-brand-row svg')];if(imgs.length>1)imgs.slice(1).forEach(x=>x.remove());}
}
function selectedCurrencySymbol(){const code=document.documentElement.dataset.currency||'INR';return CURRENCY_SYMBOLS[code]||'₹'}
function syncStaticCurrencyExamples(){const article=document.querySelector('.tool-article');if(!article)return;const symbol=selectedCurrencySymbol();article.querySelectorAll('p').forEach(p=>{if(p.dataset.waCurrencyPatched==='1')return;p.innerHTML=p.innerHTML.replace(/\$(?=\s*[0-9])/g,symbol);p.dataset.waCurrencyPatched='1';});}
function addReviewStamp(){const title=document.querySelector('.calc-title'),desc=document.querySelector('.calc-desc');if(!title||!desc||document.querySelector('.wa-review-stamp'))return;const stamp=document.createElement('p');stamp.className='wa-review-stamp';stamp.textContent='Last reviewed: September 15, 2026 · Formula and assumptions checked during release validation.';stamp.style.cssText='margin:8px 0 0;color:var(--muted,#667085);font-size:11px;line-height:1.5';desc.insertAdjacentElement('afterend',stamp)}
function rewriteTaxLinks(){document.querySelectorAll('a[href="income-tax-planner.html"],a[href="/income-tax-planner.html"]').forEach(a=>a.setAttribute('href','/income-tax-scenario-calculator.html'));}
function reframeTaxScenario(){
 const isTax=/income-tax-(planner|scenario-calculator)\.html$/i.test(location.pathname);
 rewriteTaxLinks();
 if(!isTax){document.querySelectorAll('[data-search]').forEach(el=>{if(typeof el.dataset.search==='string')el.dataset.search=el.dataset.search.replace(/income tax planner/gi,'income tax scenario calculator')});document.querySelectorAll('b,h2,h3,small,p,a').forEach(el=>{if(el.children.length===0&&/Income Tax Planner/i.test(el.textContent||''))el.textContent=(el.textContent||'').replace(/Income Tax Planner/gi,'Income Tax Scenario Calculator')});return;}
 const title=document.querySelector('.calc-title');if(title)title.textContent='Income Tax Scenario Calculator';document.title='Income Tax Scenario Calculator — Free Planning Tool | Wealth Arrays';const desc=document.querySelector('.calc-desc');if(desc)desc.textContent='Explore tax scenarios using a user-entered effective tax-rate assumption. This is not jurisdiction-specific tax software.';document.querySelectorAll('script[type="application/ld+json"]').forEach(s=>{try{s.textContent=s.textContent.replaceAll('Income Tax Planner','Income Tax Scenario Calculator')}catch(e){}});document.querySelectorAll('a,b,h2,h3,small,p').forEach(el=>{if(el.children.length===0&&/Income Tax Planner/i.test(el.textContent||''))el.textContent=(el.textContent||'').replace(/Income Tax Planner/gi,'Income Tax Scenario Calculator')});
}
function mobileSearchFallback(){
 const input=document.getElementById('tool-search'),box=document.getElementById('tool-search-results');
 if(!input||!box||window.__WA_MOBILE_SEARCH_FALLBACK__)return;
 window.__WA_MOBILE_SEARCH_FALLBACK__=true;
 const shell=input.closest('.tool-search-shell,.search-bar,.hero-copy')||box.parentElement;
 if(shell){shell.style.position='relative';shell.style.zIndex='10000';shell.style.isolation='isolate'}
 box.style.position='absolute';box.style.left='0';box.style.right='0';box.style.top='calc(100% + 8px)';box.style.zIndex='10001';box.style.background='var(--surface,#fff)';box.style.border='1px solid var(--line,#e2e6ed)';box.style.borderRadius='14px';box.style.boxShadow='0 18px 45px rgba(16,20,27,.18)';box.style.maxHeight='min(55vh,420px)';box.style.overflowY='auto';box.style.webkitOverflowScrolling='touch';
 const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const aliases={sip:'systematic investment plan monthly mutual fund',emi:'mortgage home loan monthly payment',fd:'fixed deposit banking',rd:'recurring deposit monthly banking',roi:'return investment profit',tax:'income tax scenario',salary:'hourly wage income',loan:'mortgage personal car debt',retirement:'pension financial independence',inflation:'purchasing power future prices'};
 const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function render(){
   const q=norm(input.value); if(!q){box.innerHTML='';box.hidden=true;box.style.display='none';return;}
   const terms=(q+' '+(aliases[q]||'')).split(/\s+/).filter(Boolean);
   const rows=[...document.querySelectorAll('.home-tool-card,.tool-card,.ledger-row')].map(card=>{const hay=norm((card.dataset.search||'')+' '+card.textContent);let score=hay.includes(q)?100:0;terms.forEach(t=>{if(t.length>1&&hay.includes(t))score+=3});return{card,score}}).filter(x=>x.score).sort((a,b)=>b.score-a.score).slice(0,8);
   box.innerHTML=rows.length?rows.map(({card})=>{const title=(card.querySelector('b,h2,h3')?.textContent||'Calculator').trim();const desc=(card.querySelector('p,small')?.textContent||'').trim();return '<a class="wa-search-suggestion" href="'+(card.getAttribute('href')||'#')+'"><span><strong>'+esc(title)+'</strong><small>'+esc(desc)+'</small></span><b aria-hidden="true">→</b></a>'}).join(''):'<div class="tool-search-empty">No calculator found. Try SIP, EMI, FD, RD, loan, tax or ROI.</div>';
   box.hidden=false;box.style.display='block';
 }
 ['input','keyup','search','focus','touchstart'].forEach(name=>input.addEventListener(name,render,{passive:name==='touchstart',capture:true}));
 input.addEventListener('click',render,true); input.addEventListener('keydown',e=>{if(e.key==='Escape'){box.hidden=true;box.style.display='none';input.blur()}},true);
}
function moveHomepageSearchUp(){
 if(window.innerWidth>760)return;
 const input=document.getElementById('tool-search');
 const shell=input?.closest('.tool-search-shell,.search-bar');
 const hero=document.querySelector('.hero-copy');
 if(!shell||!hero)return;
 hero.style.display='flex';hero.style.flexDirection='column';hero.style.alignItems='stretch';
 shell.style.order='-1';shell.style.marginTop='0';shell.style.marginBottom='26px';shell.style.maxWidth='620px';shell.style.width='100%';
}
function mobileSearchLayerFix(){
 const input=document.getElementById('tool-search'),box=document.getElementById('tool-search-results');
 if(!input||!box||window.innerWidth>680)return;
 const place=()=>{if(box.hidden||box.style.display==='none')return;const r=input.getBoundingClientRect();box.style.position='fixed';box.style.left=Math.max(8,r.left)+'px';box.style.top=Math.min(window.innerHeight-120,r.bottom+8)+'px';box.style.width=Math.min(r.width,window.innerWidth-16)+'px';box.style.right='auto';box.style.zIndex='2147483647';box.style.maxHeight=Math.max(120,window.innerHeight-(r.bottom+20))+'px';};
 input.addEventListener('input',()=>setTimeout(place,0),true);input.addEventListener('focus',()=>setTimeout(place,0),true);window.addEventListener('resize',place,{passive:true});window.addEventListener('scroll',place,{passive:true});
 const observer=new MutationObserver(place);observer.observe(box,{childList:true,attributes:true,subtree:true});
}
function cardVisualPolish(){
 const styleId='wa-card-visual-polish';
 if(document.getElementById(styleId))return;
 const s=document.createElement('style');s.id=styleId;s.textContent=`
.home-tool-grid,.tools-grid{align-items:stretch!important}
.home-tool-card,.tools-grid>.tool-card{box-sizing:border-box!important;border:2px solid var(--line)!important;border-radius:20px!important;background:linear-gradient(145deg,var(--surface),var(--surface2))!important;box-shadow:0 10px 28px rgba(15,23,42,.06)!important;min-height:158px!important;position:relative!important;overflow:hidden!important;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease!important}
.home-tool-card:before,.tools-grid>.tool-card:before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,var(--accent),var(--accent2));opacity:.8}
.home-tool-card:hover,.tools-grid>.tool-card:hover{transform:translateY(-3px)!important;border-color:color-mix(in srgb,var(--accent) 55%,var(--line))!important;box-shadow:0 16px 36px rgba(15,23,42,.11)!important}
.home-tool-index{min-width:30px!important;min-height:30px!important;padding:6px 7px!important;display:grid!important;place-items:center!important;border:1px solid color-mix(in srgb,var(--accent) 35%,var(--line))!important;border-radius:9px!important;background:color-mix(in srgb,var(--accent) 8%,var(--surface))!important}
.cat-grid{align-items:stretch!important}.cat-card{box-sizing:border-box!important;border:2px solid var(--line)!important;border-radius:20px!important;min-height:158px!important;box-shadow:0 10px 28px rgba(15,23,42,.06)!important}.cat-card:hover{border-color:color-mix(in srgb,var(--accent) 55%,var(--line))!important;box-shadow:0 16px 36px rgba(15,23,42,.11)!important}
@media(max-width:760px){.home-tool-grid,.tools-grid{gap:10px!important}.home-tool-card,.tools-grid>.tool-card,.cat-card{border-width:2px!important;border-radius:17px!important;min-height:140px!important}.home-tool-card{padding:14px!important}}
@media(prefers-reduced-motion:reduce){.home-tool-card,.tools-grid>.tool-card,.cat-card{transition:none!important}}
`;
 document.head.appendChild(s);
}
function expansionCalculatorRescue(){
 const match=/^(step-up-sip|emergency-fund|real-return)-calculator\.html$/i.exec(location.pathname.split('/').pop()||'');
 if(!match)return;
 const key=match[1],host=document.getElementById('calc-widget');
 if(!host)return;
 const rescue=()=>{if(host.querySelector('input[type="number"]'))return;if(typeof window.mountExtraCalculator==='function'&&window.WA_EXTRA_CALCULATORS?.[key]){try{window.mountExtraCalculator(window.WA_EXTRA_CALCULATORS[key],'calc-widget');return}catch(e){}}
   if(!document.querySelector('script[data-wa-extra-rescue]')){const s=document.createElement('script');s.src='/extra-calculators-runtime.js?v=20260915-rescue-2';s.dataset.waExtraRescue='1';document.head.appendChild(s);}
 };
 [0,150,400,900,1800,3000].forEach(ms=>setTimeout(rescue,ms));
}
function directExpansionRender(){
 const match=/^(step-up-sip|emergency-fund|real-return)-calculator\.html$/i.exec(location.pathname.split('/').pop()||'');
 if(!match)return;const host=document.getElementById('calc-widget');if(!host)return;
 const data={'step-up-sip':{fields:[['monthly','Starting monthly investment',5000,0,''],['stepUp','Annual increase',10,0,'%'],['rate','Expected annual return',10,0,'%'],['years','Investment period',15,1,'yrs'],['inflation','Expected annual inflation',6,0,'%']]},'emergency-fund':{fields:[['expenses','Essential monthly expenses',50000,0,''],['months','Months of coverage',6,1,'mos'],['current','Current emergency savings',100000,0,'']]},'real-return':{fields:[['nominal','Nominal annual return',10,-99,'%'],['inflation','Annual inflation',6,-99,'%'],['amount','Starting amount',100000,0,''],['years','Time period',10,1,'yrs']]}}[match[1]];
 if(!data||host.querySelector('input[type="number"]'))return;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const id='wa-direct-'+match[1];let html='<section id="'+id+'" style="display:block!important;visibility:visible!important;opacity:1!important;border:1px solid #e5e7eb;border-radius:18px;padding:18px;background:#fff;box-shadow:0 8px 28px rgba(15,23,42,.08)"><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px">';
 data.fields.forEach(f=>{html+='<label style="display:flex;flex-direction:column;gap:6px;font-weight:700;font-size:13px">'+esc(f[1])+'<span style="display:flex;align-items:center;border:1px solid #d1d5db;border-radius:10px;min-height:46px;background:#fff"><input id="'+id+'-'+f[0]+'" type="number" inputmode="decimal" value="'+f[2]+'" min="'+f[3]+'" style="width:100%;border:0;outline:0;padding:11px;font:inherit;font-size:16px;background:transparent"><b style="padding:0 10px;color:#667085">'+esc(f[4])+'</b></span></label>'});
 html+='</div><div id="'+id+'-results" style="display:grid;gap:8px;margin-top:18px"></div></section>';host.innerHTML=html;
 const val=k=>Number(document.getElementById(id+'-'+k).value)||0,money=n=>'₹'+Number(n).toLocaleString('en-IN',{maximumFractionDigits:0}),results=document.getElementById(id+'-results');
 function calc(){let rows=[];if(match[1]==='step-up-sip'){let c=val('monthly'),r=val('rate')/1200,f=0,inv=0,m=val('years')*12;for(let i=1;i<=m;i++){f=(f+c)*(1+r);inv+=c;if(i%12===0)c*=1+val('stepUp')/100}rows=[['Total invested',money(inv)],['Growth / profit',money(f-inv)],['Projected future value',money(f)],['Future value in today\'s money',money(f/Math.pow(1+val('inflation')/100,val('years')))]]}else if(match[1]==='emergency-fund'){let target=val('expenses')*val('months'),gap=Math.max(0,target-val('current'));rows=[['Emergency-fund target',money(target)],['Already saved',money(val('current'))],['Remaining gap',money(gap)],['Current coverage',val('expenses')?((val('current')/val('expenses')).toFixed(1)+' yrs'):'0 yrs']]}else{let n=val('nominal')/100,i=val('inflation')/100,real=((1+n)/(1+i)-1)*100,f=val('amount')*Math.pow(1+n,val('years'));rows=[['Real annual return',real.toFixed(2)+'%'],['Nominal future value',money(f)],['Future value in today\'s purchasing power',money(f/Math.pow(1+i,val('years')))]]}results.innerHTML=rows.map(r=>'<div style="display:flex;justify-content:space-between;gap:12px;padding:12px;border-radius:10px;background:#f8fafc"><span>'+esc(r[0])+'</span><strong>'+esc(r[1])+'</strong></div>').join('')}
 data.fields.forEach(f=>document.getElementById(id+'-'+f[0]).addEventListener('input',calc));calc();
 const mo=new MutationObserver(()=>{if(!host.querySelector('input[type="number"]')){host.innerHTML='';setTimeout(directExpansionRender,0)}});mo.observe(host,{childList:true});
}
function start(){tidy();reframeTaxScenario();addReviewStamp();syncStaticCurrencyExamples();moveHomepageSearchUp();mobileSearchFallback();mobileSearchLayerFix();cardVisualPolish();expansionCalculatorRescue();directExpansionRender();setTimeout(()=>{tidy();reframeTaxScenario();syncStaticCurrencyExamples();moveHomepageSearchUp();mobileSearchFallback();mobileSearchLayerFix();cardVisualPolish();expansionCalculatorRescue();directExpansionRender()},400);setTimeout(()=>{tidy();reframeTaxScenario();syncStaticCurrencyExamples();moveHomepageSearchUp();mobileSearchFallback();mobileSearchLayerFix();cardVisualPolish();expansionCalculatorRescue();directExpansionRender()},1200);window.addEventListener('wa-currency',syncStaticCurrencyExamples);window.addEventListener('resize',moveHomepageSearchUp,{passive:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

/* ===== WA CANONICAL MODULE | calculator | theme-fix.js | sha256:237818d51e88 ===== */
/* Wealth Arrays global theme controller — calculator fallback only. Hub pages are owned by wa-core. */
(function(){
  'use strict';
  if(window.__WEALTH_ARRAYS_CORE_LOADED__&&!document.querySelector('.calc-page'))return;
  var KEY='waTheme';
  var REMOVED=['step-up-sip-calculator.html','emergency-fund-calculator.html','real-return-calculator.html'];
  function read(){try{return localStorage.getItem(KEY)==='dark'?'dark':'light'}catch(e){return document.documentElement.dataset.theme==='dark'?'dark':'light'}}
  function write(v){try{localStorage.setItem(KEY,v)}catch(e){}}
  function paint(v){
    v=v==='dark'?'dark':'light';
    document.documentElement.dataset.theme=v;
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',v==='dark'?'#080a0f':'#f7f8fb');
    document.querySelectorAll('#theme-toggle,.theme-toggle').forEach(function(button){
      button.setAttribute('aria-pressed',String(v==='dark'));
      button.setAttribute('aria-label','Switch to '+(v==='dark'?'light':'dark')+' mode');
      var label=button.querySelector('[data-theme-label],#theme-toggle-label');
      if(label)label.textContent=v==='dark'?'Light mode':'Dark mode';
    });
  }
  function removeRetiredCards(){
    document.querySelectorAll('a,button,[data-search]').forEach(function(node){
      var href=node.getAttribute('href')||'';
      var text=(node.textContent||'').toLowerCase();
      var retired=REMOVED.some(function(file){return href.indexOf(file)>=0}) || /step[ -]?up sip|emergency fund|real return/.test(text);
      if(retired){
        var card=node.closest('.home-tool-card,.tool-card,.ledger-row,.cat-card');
        if(card)card.remove();
      }
    });
  }
  function init(){
    paint(read());
    removeRetiredCards();
    if(document.documentElement.dataset.waThemeOwner!=='1'){
      document.addEventListener('click',function(e){
        var button=e.target.closest&&e.target.closest('#theme-toggle,.theme-toggle');
        if(!button)return;
        e.preventDefault();
        e.stopImmediatePropagation();
        var next=document.documentElement.dataset.theme==='dark'?'light':'dark';
        write(next);paint(next);
      },true);
    }
    window.addEventListener('storage',function(e){if(e.key===KEY)paint(e.newValue==='dark'?'dark':'light')});
    window.addEventListener('pageshow',function(){paint(read());removeRetiredCards()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

/* ===== WA CANONICAL MODULE | calculator | phase3-seo.js | sha256:b1dcc15b6c93 ===== */
/* Wealth Arrays Phase 3 — SEO, topic-cluster and internal-linking runtime. */
(() => {
  'use strict';
  if (window.__WA_PHASE3_SEO__) return;
  window.__WA_PHASE3_SEO__ = true;

  const C = 'https://wealtharrays.com';
  const calculators = {
    sip: ['SIP Calculator', '/sip-calculator.html'], 'compound-interest': ['Compound Interest Calculator', '/compound-interest-calculator.html'],
    mortgage: ['Mortgage / Loan EMI Calculator', '/mortgage-emi-calculator.html'], roi: ['ROI Calculator', '/roi-calculator.html'],
    'simple-interest': ['Simple Interest Calculator', '/simple-interest-calculator.html'], 'freedom-milestone': ['Retirement Calculator', '/retirement-calculator.html'],
    'salary-conversion': ['Salary to Hourly Calculator', '/salary-to-hourly-calculator.html'], 'profit-margin': ['Profit Margin Calculator', '/profit-margin-calculator.html'],
    'fixed-deposit': ['Fixed Deposit Calculator', '/fixed-deposit-calculator.html'], 'recurring-deposit': ['Recurring Deposit Calculator', '/recurring-deposit-calculator.html'],
    lumpsum: ['Lumpsum Calculator', '/lumpsum-calculator.html'], cagr: ['CAGR Calculator', '/cagr-calculator.html'],
    'car-loan': ['Car Loan Calculator', '/car-loan-calculator.html'], 'personal-loan': ['Personal Loan Calculator', '/personal-loan-calculator.html'],
    'debt-payoff': ['Debt Payoff Calculator', '/debt-payoff-calculator.html'], inflation: ['Inflation Calculator', '/inflation-calculator.html'],
    'net-worth': ['Net Worth Calculator', '/net-worth-calculator.html'], overtime: ['Overtime Pay Calculator', '/overtime-pay-calculator.html'],
    'freelance-rate': ['Freelance Rate Calculator', '/freelance-rate-calculator.html'], 'income-tax-scenario': ['Income Tax Scenario Calculator', '/income-tax-scenario-calculator.html']
  };
  const guides = {
    sip: ['SIP Calculator Guide', '/articles/sip-calculator-guide.html'], compound: ['Compound Interest Guide', '/articles/compound-interest-guide.html'],
    loan: ['EMI & Loan Payments Guide', '/articles/loan-emi-guide.html'], roi: ['ROI vs Annualized Return Guide', '/articles/roi-guide.html'],
    debt: ['How to Use a Debt Payoff Calculator', '/articles/how-to-use-a-debt-payoff-calculator.html'], retirement: ['How to Stress-Test a Retirement Goal', '/articles/how-to-stress-test-a-retirement-goal.html'],
    inflation: ['How to Use an Inflation Calculator', '/articles/how-to-use-an-inflation-calculator.html'], networth: ['How to Use a Net Worth Calculator', '/articles/how-to-use-a-net-worth-calculator.html'],
    salary: ['How to Use a Salary-to-Hourly Calculator', '/articles/how-to-use-a-salary-to-hourly-calculator.html'], cagr: ['When CAGR Can Mislead You', '/articles/when-cagr-can-mislead-you.html'],
    scenario: ['How to Compare SIP Scenarios Properly', '/articles/how-to-compare-sip-scenarios-properly.html'], calculator: ['How to Use a Financial Calculator Without Fooling Yourself', '/articles/how-to-use-financial-calculators.html']
  };
  const clusters = {
    sip: [calculators.lumpsum, calculators['compound-interest'], guides.sip, guides.scenario],
    'compound-interest': [calculators.sip, calculators.lumpsum, calculators['fixed-deposit'], guides.compound],
    mortgage: [calculators['car-loan'], calculators['personal-loan'], calculators['debt-payoff'], guides.loan],
    'car-loan': [calculators.mortgage, calculators['personal-loan'], calculators['debt-payoff'], guides.loan],
    'personal-loan': [calculators.mortgage, calculators['debt-payoff'], calculators['car-loan'], guides.loan],
    roi: [calculators.cagr, calculators.sip, calculators.lumpsum, guides.roi],
    cagr: [calculators.roi, calculators['compound-interest'], calculators.sip, guides.cagr],
    'debt-payoff': [calculators.mortgage, calculators['personal-loan'], calculators['car-loan'], guides.debt],
    inflation: [calculators.sip, calculators['compound-interest'], calculators['freedom-milestone'], guides.inflation],
    'freedom-milestone': [calculators.sip, calculators['net-worth'], calculators.inflation, guides.retirement],
    'net-worth': [calculators['debt-payoff'], calculators['freedom-milestone'], calculators.roi, guides.networth],
    'salary-conversion': [calculators.overtime, calculators['freelance-rate'], guides.salary],
    'freelance-rate': [calculators['salary-conversion'], calculators['profit-margin'], calculators.roi],
    'profit-margin': [calculators.roi, calculators['freelance-rate']], 'fixed-deposit': [calculators['recurring-deposit'], calculators['compound-interest'], calculators.sip],
    'recurring-deposit': [calculators['fixed-deposit'], calculators.sip, calculators['compound-interest']], lumpsum: [calculators.sip, calculators['compound-interest'], calculators.roi],
    'simple-interest': [calculators['compound-interest'], calculators['fixed-deposit']], overtime: [calculators['salary-conversion'], calculators['freelance-rate']],
    'income-tax-scenario': [calculators['salary-conversion'], calculators['freelance-rate']]
  };

  const path = location.pathname.replace(/\/+$/, '') || '/';
  const file = path.split('/').pop() || 'index.html';
  const id = Object.keys(calculators).find(k => file === calculators[k][1].slice(1));
  const root = document.querySelector('main');
  if (!root) return;

  function abs(href) { return href.startsWith('/') ? C + href : new URL(href, location.href).href; }
  function addMeta(name, content, property = false) {
    if (!content) return;
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    if (!document.head.querySelector(selector)) {
      const m = document.createElement('meta');
      if (property) m.setAttribute('property', name); else m.setAttribute('name', name);
      m.content = content; document.head.appendChild(m);
    }
  }
  function schemaOnce(type, data) {
    const existing = [...document.querySelectorAll('script[type="application/ld+json"]')].some(s => {
      try { return JSON.parse(s.textContent || '{}')['@type'] === type; } catch { return false; }
    });
    if (existing) return;
    const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(data); document.head.appendChild(s);
  }
  function uniqueLinks(items) {
    const seen = new Set([location.pathname]);
    return items.filter(x => x && x[1] && !seen.has(x[1]) && !seen.add(x[1])).slice(0, 5);
  }
  function renderCluster(title, items) {
    const clean = uniqueLinks(items);
    if (!clean.length || root.querySelector('[data-wa-phase3-cluster]')) return;
    const section = document.createElement('section');
    section.dataset.waPhase3Cluster = 'true'; section.className = 'wa-phase3-cluster'; section.setAttribute('aria-labelledby', 'wa-phase3-cluster-title');
    section.innerHTML = `<div class="wa-phase3-kicker">NEXT STEPS</div><h2 id="wa-phase3-cluster-title">${title}</h2><p>Continue with a closely related calculator or guide so you can test the assumptions behind the result.</p><div class="wa-phase3-links"></div>`;
    const box = section.querySelector('.wa-phase3-links');
    clean.forEach(([label, href]) => { const a = document.createElement('a'); a.href = href; a.className = 'wa-phase3-link'; a.textContent = label; box.appendChild(a); });
    root.appendChild(section);
  }

  addMeta('robots', 'index,follow'); addMeta('author', 'Wealth Arrays'); addMeta('publisher', 'Wealth Arrays');
  addMeta('og:site_name', 'Wealth Arrays', true); addMeta('og:type', path.startsWith('/articles/') ? 'article' : 'website', true);
  addMeta('og:title', document.title, true); addMeta('og:description', document.querySelector('meta[name="description"]')?.content || '', true);
  addMeta('og:url', location.href.split('#')[0], true); addMeta('og:image', `${C}/og-image.png`, true);
  addMeta('twitter:card', 'summary_large_image'); addMeta('twitter:title', document.title); addMeta('twitter:description', document.querySelector('meta[name="description"]')?.content || ''); addMeta('twitter:image', `${C}/og-image.png`);

  if (id) {
    renderCluster('Related calculators and guides', clusters[id] || []);
    schemaOnce('WebApplication', { '@context':'https://schema.org', '@type':'WebApplication', name:document.title.replace(/\s*\|.*$/,''), applicationCategory:'FinanceApplication', operatingSystem:'Web', url:abs(path), publisher:{'@type':'Organization',name:'Wealth Arrays',url:C+'/' } });
  } else if (path.startsWith('/articles/')) {
    const article = document.querySelector('article') || root.querySelector('article');
    const h1 = article?.querySelector('h1')?.textContent?.trim() || document.title.replace(/\s*\|.*$/,'');
    const description = document.querySelector('meta[name="description"]')?.content || '';
    schemaOnce('Article', { '@context':'https://schema.org','@type':'Article',headline:h1,description,author:{'@type':'Organization',name:'Wealth Arrays',url:C+'/about.html'},publisher:{'@type':'Organization',name:'Wealth Arrays',url:C+'/'},mainEntityOfPage:location.href.split('#')[0],dateModified:'2026-09-15' });
    renderCluster('Related tools and reading', [guides.calculator, calculators.sip, calculators['compound-interest'], calculators.mortgage, calculators.inflation]);
  } else if (path.startsWith('/category-')) {
    renderCluster('Explore related calculators and guides', [guides.calculator, calculators.sip, calculators.mortgage, calculators['net-worth'], calculators['compound-interest']]);
  }
})();

/* ===== WA CANONICAL MODULE | calculator | phase4-premium.js | sha256:269419f67ba9 ===== */
/* Wealth Arrays Phase 4 — accessibility, performance and premium UX guardrails. */
(function(){
  'use strict';
  function ready(fn){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn,{once:true}); else fn(); }
  function addSkip(){
    if(document.querySelector('.wa-skip-link')) return;
    var main=document.querySelector('main'); if(!main) return;
    if(!main.id) main.id='main-content';
    var a=document.createElement('a'); a.className='wa-skip-link'; a.href='#'+main.id; a.textContent='Skip to main content';
    document.body.insertBefore(a,document.body.firstChild);
  }
  function improveControls(){
    document.querySelectorAll('input,select,textarea').forEach(function(el){
      if(!el.getAttribute('aria-label') && !el.id){ el.setAttribute('aria-label','Financial calculator input'); }
    });
    document.querySelectorAll('button').forEach(function(b){
      if(!b.getAttribute('aria-label') && !b.textContent.trim() && !b.title) b.setAttribute('aria-label','Button');
    });
  }
  function dedupeSharedControls(){
    ['currency-select','language-select','theme-toggle'].forEach(function(id){
      var nodes=Array.prototype.slice.call(document.querySelectorAll('#'+id));
      if(nodes.length<2)return;
      var keep=nodes.find(function(n){return n.offsetParent!==null})||nodes[0];
      nodes.forEach(function(n){if(n!==keep)n.remove();});
    });
    var controls=document.querySelector('.masthead-controls');
    if(controls){
      var seen={};
      Array.prototype.slice.call(controls.children).forEach(function(node){
        var key=node.querySelector?.('#currency-select')?'currency':node.querySelector?.('#language-select')?'language':node.querySelector?.('#theme-toggle')?'theme':'';
        if(key){if(seen[key])node.remove();else seen[key]=true;}
      });
    }
  }
  function announceErrors(){
    document.querySelectorAll('.calc-error,[role="alert"]').forEach(function(el){ el.setAttribute('aria-live','polite'); });
  }
  function observeVitals(){
    if(!('PerformanceObserver' in window)) return;
    try{
      new PerformanceObserver(function(list){
        list.getEntries().forEach(function(e){
          if(e.entryType==='largest-contentful-paint' && e.startTime>2500) document.documentElement.dataset.waLcp='slow';
        });
      }).observe({type:'largest-contentful-paint',buffered:true});
    }catch(e){}
  }
  function externalLinks(){
    document.querySelectorAll('a[target="_blank"]').forEach(function(a){
      var rel=(a.getAttribute('rel')||'').split(/\s+/).filter(Boolean);
      if(rel.indexOf('noopener')<0) rel.push('noopener');
      if(rel.indexOf('noreferrer')<0) rel.push('noreferrer');
      a.setAttribute('rel',rel.join(' '));
    });
  }
  ready(function(){
    addSkip();
    dedupeSharedControls();
    improveControls();
    announceErrors();
    externalLinks();
    observeVitals();
    if(window.MutationObserver){
      var pending=false;
      new MutationObserver(function(){
        if(pending)return;
        pending=true;
        requestAnimationFrame(function(){pending=false;dedupeSharedControls();});
      }).observe(document.body,{childList:true,subtree:true});
    }
  });
})();

/* ===== WA CANONICAL MODULE | calculator | homepage-search.js | sha256:56b95d09d759 ===== */
/* Wealth Arrays homepage search — canonical owner for the hero calculator search. */
(function(){
  'use strict';
  if(window.__WA_HOMEPAGE_SEARCH_LOADED__)return;
  window.__WA_HOMEPAGE_SEARCH_LOADED__=true;
  const norm=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const aliases={sip:'systematic investment plan monthly mutual fund',emi:'mortgage home loan monthly payment',fd:'fixed deposit banking',rd:'recurring deposit monthly banking',roi:'return investment profit',tax:'income tax scenario',loan:'mortgage personal car debt',salary:'hourly wage income',retirement:'pension financial independence',cagr:'compound annual growth return',inflation:'purchasing power future prices',lumpsum:'lump sum investment',networth:'assets liabilities wealth'};
  function install(){
    if(!document.querySelector('.ledger-hero'))return;
    const oldInput=document.getElementById('tool-search'),oldBox=document.getElementById('tool-search-results');
    if(!oldInput||!oldBox)return;
    /* Replace the core-owned nodes so stale listeners cannot hide/overwrite our suggestions. */
    const input=oldInput.cloneNode(true),box=oldBox.cloneNode(false);input.id='tool-search';box.id='tool-search-results';box.className='tool-search-results';box.hidden=true;
    oldInput.replaceWith(input);oldBox.replaceWith(box);input.dataset.waSearchOwner='homepage-search';
    const shell=input.closest('.tool-search-shell,.search-bar,.hero-copy');
    if(shell){shell.style.position='relative';shell.style.zIndex='30';shell.style.overflow='visible'}
    box.style.position='absolute';box.style.left='0';box.style.right='0';box.style.top='calc(100% + 8px)';box.style.zIndex='2147483000';box.style.maxHeight='min(55vh,440px)';box.style.overflowY='auto';box.style.background='var(--surface,#fff)';box.style.border='1px solid var(--line,#e2e6ed)';box.style.borderRadius='14px';box.style.boxShadow='0 18px 45px rgba(16,20,27,.18)';
    const render=()=>{const q=norm(input.value);if(!q){box.innerHTML='';box.hidden=true;box.style.display='none';return}const terms=(q+' '+(aliases[q]||'')).split(/\s+/).filter(Boolean);const hits=[...document.querySelectorAll('.home-tool-card')].map(card=>{const hay=norm((card.dataset.search||'')+' '+card.textContent);let score=hay.includes(q)?100:0;terms.forEach(t=>{if(t.length>1&&hay.includes(t))score+=t===q?20:3});return{card,score}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,8);box.innerHTML=hits.length?hits.map(({card})=>{const title=(card.querySelector('b')?.textContent||'Calculator').trim(),desc=(card.querySelector('p')?.textContent||'').trim(),href=card.getAttribute('href')||'#';return '<a class="wa-search-suggestion" href="'+esc(href)+'"><span><strong>'+esc(title)+'</strong><small>'+esc(desc)+'</small></span><b aria-hidden="true">→</b></a>'}).join(''):'<div class="tool-search-empty">No calculator found. Try SIP, EMI, FD, RD, loan, tax or ROI.</div>';box.hidden=false;box.style.setProperty('display','block','important');};
    ['input','search','focus'].forEach(e=>input.addEventListener(e,render));input.addEventListener('keydown',e=>{if(e.key==='Escape'){box.hidden=true;box.style.display='none';input.blur()}});document.addEventListener('click',e=>{if(!input.contains(e.target)&&!box.contains(e.target)){box.hidden=true;box.style.display='none'}});window.addEventListener('resize',()=>{if(window.innerWidth<=760&&shell){shell.style.width='100%';shell.style.maxWidth='620px';shell.style.margin='0 0 24px'}});if(window.innerWidth<=760&&shell){shell.style.order='-1';shell.style.width='100%';shell.style.maxWidth='620px';shell.style.margin='0 0 24px'}window.__WA_HOME_SEARCH_READY__=true;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();

/* ===== WA CANONICAL MODULE | calculator | calculator-search.js | sha256:c1b702dd064a ===== */
/* Wealth Arrays calculator search — single resilient owner for calculator and library search. */
(function () {
  'use strict';
  if (window.__WA_CALCULATOR_SEARCH_LOADED__) return;
  window.__WA_CALCULATOR_SEARCH_LOADED__ = true;
  const CATALOG=[['SIP Calculator','/sip-calculator/','Monthly investing and projected wealth.','sip systematic investment plan monthly mutual fund investing'],['Compound Interest','/compound-interest-calculator/','See how compounding changes growth over time.','compound interest compounding savings growth investing'],['Mortgage / EMI','/mortgage-emi-calculator/','Estimate monthly payment and total interest.','mortgage emi home loan loan payment interest'],['ROI Calculator','/roi-calculator/','Measure total and annualized investment return.','roi return investment profit annualized'],['Simple Interest','/simple-interest-calculator/','Calculate flat interest on principal.','simple interest banking loan deposit'],['Retirement Calculator','/retirement-calculator/','Estimate a financial-independence target.','retirement fire pension financial independence goal'],['Salary to Hourly','/salary-to-hourly-calculator/','Convert annual salary and hourly pay.','salary hourly wage income pay'],['Profit Margin','/profit-margin-calculator/','Calculate revenue, cost and margin.','profit margin business revenue cost'],['Fixed Deposit','/fixed-deposit-calculator/','Project deposit growth and maturity value.','fixed deposit fd banking maturity interest'],['Recurring Deposit','/recurring-deposit-calculator/','Plan monthly deposits and maturity value.','recurring deposit rd monthly banking maturity'],['Lumpsum Calculator','/lumpsum-calculator/','Project a one-time investment.','lumpsum lump sum investment one time'],['CAGR Calculator','/cagr-calculator/','Calculate compound annual growth rate.','cagr compound annual growth rate return'],['Car Loan EMI','/car-loan-calculator/','Plan vehicle-loan payments and interest.','car loan auto vehicle emi repayment'],['Personal Loan','/personal-loan-calculator/','Estimate personal-loan repayment cost.','personal loan emi payment repayment'],['Debt Payoff','/debt-payoff-calculator/','Plan a faster route out of debt.','debt payoff repayment credit loan'],['Inflation Calculator','/inflation-calculator/','Understand future purchasing power.','inflation future value purchasing power prices'],['Net Worth','/net-worth-calculator/','Track assets minus liabilities.','net worth assets liabilities wealth'],['Overtime Pay','/overtime-pay-calculator/','Estimate overtime earnings.','overtime pay salary wage income'],['Freelance Rate','/freelance-rate-calculator/','Turn target income into an hourly rate.','freelance rate hourly pricing business income'],['Income Tax Scenario Calculator','/income-tax-scenario-calculator/','Explore tax scenarios using an effective-rate assumption.','income tax tax scenario effective rate planning']];
  const ALIASES={sip:'systematic investment plan monthly mutual fund',emi:'mortgage home loan monthly payment',fd:'fixed deposit banking',rd:'recurring deposit monthly banking',roi:'return investment profit',cagr:'compound annual growth return',tax:'income tax scenario',salary:'hourly wage income',loan:'mortgage personal car debt',retirement:'pension financial independence',inflation:'purchasing power future prices',lumpsum:'lump sum investment one time',networth:'assets liabilities wealth','net worth':'assets liabilities wealth','compound interest':'compounding growth','simple interest':'flat interest','profit margin':'business revenue cost margin','car loan':'vehicle loan emi','personal loan':'loan repayment',freelance:'freelance rate hourly pricing',overtime:'overtime pay salary'};
  const normalize=v=>String(v||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
  const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function score(c,q){const t=normalize(c[0]),s=normalize(c[1]),k=normalize(c[3]),d=normalize(c[2]),a=normalize(ALIASES[q]||'');let n=0;if(t===q)n+=500;if(t.includes(q))n+=250;if(s.includes(q))n+=180;if(k.includes(q))n+=160;if(d.includes(q))n+=60;for(const x of normalize(`${q} ${a}`).split(' ').filter(Boolean))if(x.length>1&&(t.includes(x)||k.includes(x)||s.includes(x)))n+=x===q?35:8;return n;}
  function nodes(){return{input:document.getElementById('tool-search'),box:document.getElementById('tool-search-results')}}
  function install(){
    const calc=!!document.querySelector('.calc-page'),lib=!!document.querySelector('.tool-library-search');if(!calc&&!lib)return false;
    let{input,box}=nodes();if(!input||!box)return false;
    if(input.dataset.waSearchOwner==='calculator-search')return true;
    input.dataset.waSearchOwner='calculator-search';
    const shell=input.closest('.tool-search-shell,.search-bar,.tool-library-search,.calc-page');
    if(shell){shell.style.position='relative';shell.style.zIndex='1000';shell.style.overflow='visible'}
    Object.assign(box.style,{position:'absolute',top:'calc(100% + 8px)',left:'0',right:'0',width:'100%',zIndex:'99999',maxHeight:'350px',overflowY:'auto',overflowX:'hidden',background:'var(--surface,#fff)',border:'1px solid var(--line,#e2e6ed)',borderRadius:'14px',boxShadow:'0 10px 25px rgba(0,0,0,.15)'});
    const hide=()=>{box.hidden=true;box.style.display='none'},show=()=>{box.hidden=false;box.style.setProperty('display','block','important')};
    const render=()=>{const q=normalize(input.value);if(!q){box.innerHTML='';hide();if(lib)document.querySelectorAll('.tools-grid .tool-card').forEach(c=>c.hidden=false);return}
      if(lib){const terms=normalize(`${q} ${ALIASES[q]||''}`).split(' ').filter(Boolean),cards=[...document.querySelectorAll('.tools-grid .tool-card')],matches=cards.map(card=>{const h=normalize(`${card.querySelector('h2')?.textContent||''} ${card.dataset.search||''} ${card.querySelector('p')?.textContent||''}`);let n=h.includes(q)?300:0;for(const x of terms)if(x.length>1&&h.includes(x))n+=x===q?30:5;return{card,score:n}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);cards.forEach(c=>c.hidden=!matches.some(x=>x.card===c));box.innerHTML=matches.slice(0,8).map(({card})=>{const t=card.querySelector('h2')?.textContent?.trim()||'Calculator',d=card.querySelector('p')?.textContent?.trim()||'';return`<a class="wa-search-suggestion" href="${esc(card.getAttribute('href')||'#')}"><span><strong>${esc(t)}</strong><small>${esc(d)}</small></span><b aria-hidden="true">→</b></a>`}).join('')||'<div class="tool-search-empty">No calculator found. Try SIP, EMI, FD, RD, loan, tax or ROI.</div>'}
      else{const results=CATALOG.map(c=>({c,score:score(c,q)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,8);box.innerHTML=results.length?results.map(({c})=>`<a class="wa-search-suggestion" href="${esc(c[1])}"><span><strong>${esc(c[0])}</strong><small>${esc(c[2])}</small></span><b aria-hidden="true">→</b></a>`).join(''):'<div class="tool-search-empty">No calculator found. Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>'}show()};
    input.addEventListener('input',render);input.addEventListener('search',render);input.addEventListener('keyup',render);input.addEventListener('focus',render);input.addEventListener('keydown',e=>{if(e.key==='Escape'){hide();input.blur()}});document.addEventListener('click',e=>{if(!input.contains(e.target)&&!box.contains(e.target))hide()});window.WA_CALCULATOR_SEARCH_CATALOG=CATALOG;window.__WA_SEARCH_READY__=true;render();return true;
  }
  function boot(){if(install())return;const observer=new MutationObserver(()=>{if(install())observer.disconnect()});observer.observe(document.documentElement,{childList:true,subtree:true});[50,150,300,600,1200,2500].forEach(ms=>setTimeout(install,ms))}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

/* ===== WA CANONICAL MODULE | calculator | calculator-safety.js | sha256:949864333b74 ===== */
/* Wealth Arrays calculator safety layer: finite inputs, bounds, zero handling, and deterministic output precision. */
(function(){
  'use strict';
  const round=(n,d)=>{const p=10**d;return Math.round((n+Number.EPSILON)*p)/p;};
  const precision=(format)=>format==='currency'?2:format==='percent'?2:format==='years'?1:format==='number'?2:2;
  const safeValue=(field,raw)=>{
    const fallback=Number(field.default);
    let n=Number(raw);
    if(!Number.isFinite(n)) n=Number.isFinite(fallback)?fallback:0;
    if(Number.isFinite(field.min)&&n<field.min)n=field.min;
    if(Number.isFinite(field.max)&&n>field.max)n=field.max;
    return n;
  };
  const sanitize=(calc,values)=>{
    const out={...values};
    (calc.fields||[]).forEach(field=>{if(field.type==='number')out[field.id]=safeValue(field,out[field.id]);});
    return out;
  };
  function wrap(){
    if(!Array.isArray(window.CALCULATORS)||window.__WA_CALCULATOR_SAFETY__)return;
    window.__WA_CALCULATOR_SAFETY__=true;
    window.CALCULATORS.forEach(calc=>{
      if(typeof calc.compute!=='function'||calc.compute.__waSafe)return;
      const original=calc.compute;
      const wrapped=function(values){
        const safe=sanitize(calc,values||{});
        let results=[];
        try{results=original(safe)||[];}catch(_){return[];}
        return results.map(result=>{
          const n=Number(result.value);
          if(!Number.isFinite(n))return {...result,value:0};
          return {...result,value:round(n,precision(result.format))};
        });
      };
      wrapped.__waSafe=true;
      calc.compute=wrapped;
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wrap,{once:true});else wrap();
  setTimeout(wrap,0);
})();

/* ===== WA CANONICAL MODULE | calculator | calculator-page-init.js | sha256:ff89cbd42f9e ===== */
/* CSP-friendly calculator page bootstrap. */
(function(){
  'use strict';
  function mount(){
    if(typeof window.mountCalculator!=='function') return;
    var host=document.getElementById('calc-widget');
    var id=document.documentElement.getAttribute('data-wa-calculator');
    if(!id && host){ id=new URLSearchParams(location.search).get('calc')||''; }
    if(!host||!id||host.dataset.waBooted==='1'||typeof window.CALCULATORS==='undefined') return;
    var def=window.CALCULATORS.find(function(c){return c.id===id;});
    if(def){
      host.dataset.waBooted='1';
      window.mountCalculator(def,'calc-widget');
      /* NOTE: WA_CALCULATOR_ENHANCEMENTS.enhance() is intentionally NOT called here.
       * It re-mounted the calculator a second time and injected a duplicate
       * "Download PDF"/"Download CSV" button that recomputed results directly
       * from raw (possibly empty/unvalidated) DOM input values instead of the
       * actually-displayed, Calculate-button-gated results — producing PDFs
       * that silently disagreed with what was on screen. The widget's own
       * built-in "Export PDF report" button (which uses the real computed
       * results) is the only calculator PDF export path. */
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true}); else mount();
})();

/* ===== WA CANONICAL MODULE | calculator | calculator-enhancements.js | sha256:d5822c893b20 ===== */
/* Wealth Arrays calculator enhancements: visual chart, CSV export, and PDF report. */
(function(){
'use strict';
function esc(v){return String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function number(v){const n=Number(v);return Number.isFinite(n)?n:0;}
function readValues(calc,host){const controls=[...host.querySelectorAll('input,select,textarea')],byId={};controls.forEach(el=>{if(el.id)byId[el.id]=el;if(el.name)byId[el.name]=el;});const values={};calc.fields.forEach((f,i)=>{const el=byId[f.id]||host.querySelector('[data-field="'+CSS.escape(f.id)+'"]')||controls[i];if(el)values[f.id]=f.type==='number'?number(el.value):(el.value??f.default);});return values;}
function formatValue(r){const n=number(r.value);if(r.format==='percent')return n.toFixed(2)+'%';if(r.format==='years')return n.toFixed(1)+' yrs';if(r.format==='number')return Math.round(n).toLocaleString('en-US');return window.waFormatValue?window.waFormatValue(n,r.format):n.toLocaleString('en-US',{maximumFractionDigits:2});}
function resultsFor(calc,host){try{return calc.compute(readValues(calc,host))||[]}catch(e){return[];}}
function renderChart(calc,host){
 const rows=resultsFor(calc,host).filter(r=>Number.isFinite(Number(r.value))&&Number(r.value)>=0).slice(0,6);if(rows.length<2)return;
 let chart=host.querySelector('.wa-export-chart');
 if(!chart){chart=document.createElement('section');chart.className='wa-export-chart';chart.setAttribute('aria-label','Visual calculation summary');chart.innerHTML='<div class="wa-export-head"><span>VISUAL SUMMARY</span><h3>See your calculated results</h3><p>The bars use the actual values from this calculator.</p></div><div class="wa-export-bars"></div>';const anchor=host.querySelector('.wa-portfolio-card')||host.firstElementChild;anchor?anchor.after(chart):host.appendChild(chart);}
 const max=Math.max(...rows.map(r=>number(r.value)),1);chart.querySelector('.wa-export-bars').innerHTML=rows.map(r=>'<div class="wa-export-bar"><span>'+esc(r.label)+'</span><div><i style="width:'+Math.max(2,number(r.value)/max*100).toFixed(2)+'%"></i></div><b>'+esc(formatValue(r))+'</b></div>').join('');
}
function downloadCsv(calc,host){const values=readValues(calc,host),rows=resultsFor(calc,host),lines=[['Calculator',calc.title],[],['Input','Value'],...calc.fields.map(f=>[f.label,values[f.id]??'']),[],['Result','Value'],...rows.map(r=>[r.label,formatValue(r)])];const csv=lines.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n'),blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=(calc.slug||calc.id)+'-report.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function pdfReport(calc,values,results){
 const logo=new URL('/icon-512.png',location.origin).href;
 const rows=results.map(r=>'<tr><td>'+esc(r.label)+'</td><td>'+esc(formatValue(r))+'</td></tr>').join('');
 const inputs=calc.fields.map(f=>'<tr><td>'+esc(f.label)+'</td><td>'+esc(values[f.id]??'')+'</td></tr>').join('');
 const nums=results.filter(r=>Number.isFinite(Number(r.value))&&Number(r.value)>=0).slice(0,6),max=Math.max(...nums.map(r=>number(r.value)),1);
 const bars=nums.map(r=>'<div class="bar"><span>'+esc(r.label)+'</span><div><i style="width:'+Math.max(2,number(r.value)/max*100).toFixed(2)+'%"></i></div><b>'+esc(formatValue(r))+'</b></div>').join('');
 const html='<!doctype html><html><head><meta charset="utf-8"><title>'+esc(calc.title)+' Report · Wealth Arrays</title><style>@page{size:A4;margin:14mm}body{font-family:Arial,sans-serif;color:#101828;background:#fff;margin:0}header{display:flex;align-items:center;gap:14px;padding-bottom:16px;border-bottom:1px solid #ddd;margin-bottom:22px}header img{width:58px;height:58px;object-fit:contain}header strong{display:block;font-size:18px}header span{display:block;color:#667085;font-size:10px;letter-spacing:.12em;margin-top:3px}h1{font-size:27px;margin:0 0 6px}h2{font-size:16px;margin:22px 0 8px}p{color:#667085;font-size:12px}table{width:100%;border-collapse:collapse;margin:8px 0 20px;border:1px solid #ddd}td{padding:9px;border-bottom:1px solid #eee;font-size:12px}td:last-child{text-align:right;font-weight:700}.chartbox{padding:14px;border:1px solid #ddd;border-radius:10px;margin-top:20px}.bar{display:grid;grid-template-columns:150px 1fr auto;gap:9px;align-items:center;margin:11px 0;font-size:11px}.bar>div{height:11px;background:#edf0f4;border-radius:8px;overflow:hidden}.bar i{display:block;height:100%;background:#2563eb;border-radius:8px}.bar b{font-size:11px}.no-print{margin-top:18px;padding:10px 16px;border:0;border-radius:8px;background:#111827;color:#fff;font-weight:700}@media print{.no-print{display:none!important}}</style></head><body><header><img src="'+esc(logo)+'" alt="Wealth Arrays logo"><div><strong>Wealth Arrays</strong><span>CALCULATION REPORT</span></div></header><h1>'+esc(calc.title)+'</h1><p>Generated from the assumptions you entered.</p><h2>Your inputs</h2><table>'+inputs+'</table><h2>Your calculated results</h2><table>'+rows+'</table>'+ (bars?'<section class="chartbox"><h2>Calculation summary</h2>'+bars+'</section>':'') +'<p>Educational estimate only. Not financial, tax, legal or investment advice.</p><button class="no-print" onclick="window.print()">Save as PDF</button><script>window.setTimeout(function(){window.print()},250)<\/script></body></html>';
 const w=window.open('','_blank');if(!w){alert('Please allow pop-ups for Wealth Arrays to export the PDF.');return;}w.document.open();w.document.write(html);w.document.close();w.focus();
}
function addExportControls(calc,host){if(host.querySelector('.wa-export-tools'))return;const bar=document.createElement('div');bar.className='wa-export-tools';const csv=document.createElement('button');csv.type='button';csv.className='wa-export-btn';csv.textContent='Download CSV';csv.onclick=()=>downloadCsv(calc,host);const pdf=document.createElement('button');pdf.type='button';pdf.className='wa-export-btn wa-export-btn-primary';pdf.textContent='Download PDF';pdf.onclick=()=>pdfReport(calc,readValues(calc,host),resultsFor(calc,host));bar.append(csv,pdf);host.appendChild(bar);}
function addSchema(calc){const id='wa-webapplication-schema';let node=document.getElementById(id);if(!node){node=document.createElement('script');node.type='application/ld+json';node.id=id;document.head.appendChild(node);}node.textContent=JSON.stringify({'@context':'https://schema.org','@type':'WebApplication','name':calc.title,'applicationCategory':'FinanceApplication','operatingSystem':'Any','isAccessibleForFree':true,'description':calc.desc||calc.short||'Free financial calculator from Wealth Arrays.','url':'https://wealtharrays.com/'+(calc.slug||calc.id)+'/','provider':{'@type':'Organization','name':'Wealth Arrays','url':'https://wealtharrays.com/'}});}
function enhance(calc){const host=document.getElementById('calc-widget');if(!host||!calc)return;addSchema(calc);addExportControls(calc,host);renderChart(calc,host);new MutationObserver(()=>renderChart(calc,host)).observe(host,{childList:true,subtree:true});setTimeout(()=>renderChart(calc,host),100);}
window.WA_CALCULATOR_ENHANCEMENTS={enhance,downloadCsv,waOpenPrintReport:pdfReport};
window.waOpenPrintReport=pdfReport;
})();

/* ===== WA CANONICAL MODULE | calculator | pdf-export-fix.js | sha256:1032a3003d1a ===== */
/* Wealth Arrays — faithful calculator PDF export.
 * Keeps the calculator's existing result data and pie breakdown, and adds the
 * real Wealth Arrays logo to the generated PDF. No calculator UI is changed.
 */
(function(){
  'use strict';
  if(window.__WA_DIRECT_PDF_EXPORT__)return;
  window.__WA_DIRECT_PDF_EXPORT__=true;

  const text=v=>String(v??'')
    .replace(/₹/g,'INR ').replace(/€/g,'EUR ').replace(/£/g,'GBP ')
    .replace(/¥/g,'JPY ').replace(/₩/g,'KRW ').replace(/₺/g,'TRY ')
    .replace(/₽/g,'RUB ').replace(/₦/g,'NGN ')
    .replace(/[\u0080-\uFFFF]/g,'?');
  const esc=v=>text(v).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
  const enc=s=>new TextEncoder().encode(s);
  const join=parts=>{let n=0;parts.forEach(p=>n+=p.length);const o=new Uint8Array(n);let at=0;parts.forEach(p=>{o.set(p,at);at+=p.length});return o};

  async function loadLogo(){
    try{
      const res=await fetch('/icon-512.png',{cache:'force-cache',credentials:'same-origin'});
      if(!res.ok)return null;
      const bytes=new Uint8Array(await res.arrayBuffer());
      if(bytes.length<24||bytes[0]!==0x89||bytes[1]!==0x50)return null;
      // PNG is not directly embeddable with the tiny PDF writer below.
      // Use the browser's canvas to convert the exact site logo to JPEG bytes.
      const blob=new Blob([bytes],{type:'image/png'});
      const url=URL.createObjectURL(blob);
      try{
        const img=await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=url});
        const c=document.createElement('canvas');c.width=512;c.height=512;
        const ctx=c.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,512,512);ctx.drawImage(img,0,0,512,512);
        const jpg=await new Promise(resolve=>c.toBlob(resolve,'image/jpeg',0.92));
        if(!jpg)return null;
        const jb=new Uint8Array(await jpg.arrayBuffer());
        const dims=parseJpegSize(jb);
        return {bytes:jb,width:dims.width,height:dims.height};
      }finally{URL.revokeObjectURL(url)}
    }catch(e){console.warn('PDF logo conversion failed; continuing without image',e);return null}
  }

  function parseJpegSize(b){
    let i=2;
    while(i+9<b.length){
      if(b[i]!==0xFF){i++;continue}
      const marker=b[i+1];i+=2;
      if(marker===0xD8||marker===0xD9||marker===0x01)continue;
      if(i+2>b.length)break;
      const len=(b[i]<<8)|b[i+1];
      if(marker>=0xC0&&marker<=0xC3){
        return {height:(b[i+3]<<8)|b[i+4],width:(b[i+5]<<8)|b[i+6]};
      }
      i+=len;
    }
    return {width:512,height:512};
  }

  function fmt(r){
    const n=Number(r?.value);if(!Number.isFinite(n))return '-';
    if(r.format==='percent')return n.toFixed(2)+'%';
    if(r.format==='years')return n.toFixed(1)+' yrs';
    if(r.format==='number')return Math.round(n).toLocaleString('en-US');
    return window.waFormatValue?window.waFormatValue(n,r.format):n.toLocaleString('en-US',{maximumFractionDigits:2});
  }

  function partsFor(calc,values,rows){
    const num=x=>Number.isFinite(Number(x))?Number(x):0;
    const row=re=>rows.find(r=>re.test(String(r.label)));
    const total=()=>rows.find(r=>/future value|maturity value|total amount|final value|estimated corpus|total repayment/i.test(String(r.label)));
    const p=(label,value)=>({label,value:Math.max(0,num(value))});
    let parts=null;
    if(calc.id==='sip'||calc.id==='investment'){const inv=row(/you put in|invested amount/i),gain=row(/growth|profit|returns/i);if(inv&&gain)parts=[p('Money invested',inv.value),p('Growth / returns',gain.value)];}
    else if(calc.id==='compound-interest'||calc.id==='lumpsum'||calc.id==='fixed-deposit'){const t=total(),i=row(/interest earned|growth|returns/i);if(t&&i)parts=[p('Original investment',num(t.value)-num(i.value)),p('Growth / interest',i.value)];}
    else if(calc.id==='recurring-deposit'){const t=total(),invested=num(values.monthly)*12*num(values.years);if(t)parts=[p('Money deposited',invested),p('Interest earned',num(t.value)-invested)];}
    else if(['mortgage','car-loan','personal-loan'].includes(calc.id)){const repay=row(/total repayment/i),interest=row(/total interest/i);if(repay&&interest)parts=[p('Loan amount',num(repay.value)-num(interest.value)),p('Total interest',interest.value)];}
    else if(calc.id==='simple-interest'){const t=row(/total amount/i),i=row(/^interest$/i);if(t&&i)parts=[p('Original amount',num(t.value)-num(i.value)),p('Interest',i.value)];}
    else if(calc.id==='roi'){const cost=num(values.cost),finalValue=num(values.finalValue);if(finalValue>=cost&&cost>0)parts=[p('Original investment',cost),p('Profit',finalValue-cost)];}
    else if(calc.id==='profit-margin'){const revenue=num(values.revenue),cogs=num(values.cogs),expenses=num(values.expenses),net=revenue-cogs-expenses;if(revenue>0&&net>=0)parts=[p('Cost of goods',cogs),p('Operating expenses',expenses),p('Net profit',net)];}
    else if(calc.id==='net-worth'){const assets=num(values.cash)+num(values.investments)+num(values.property),debt=num(values.debt);if(assets>0)parts=[p('Cash',values.cash),p('Investments',values.investments),p('Property',values.property),p('Debt reduction',Math.min(debt,assets))].filter(x=>x.value>0);}
    else if(calc.id==='overtime'){const regular=row(/regular pay/i),overtime=row(/overtime pay/i);if(regular&&overtime)parts=[p('Regular pay',regular.value),p('Overtime pay',overtime.value)];}
    else if(calc.id==='debt-payoff'){const balance=num(values.balance),interest=Math.max(0,num(row(/total interest/i)?.value));if(balance>0)parts=[p('Debt principal',balance),p('Estimated interest',interest)];}
    else if(calc.id==='income-tax-planner'){const income=num(values.income),tax=Math.max(0,num(row(/tax/i)?.value));if(income>0)parts=[p('Tax',Math.min(tax,income)),p('After-tax income',Math.max(0,income-tax))];}
    if(!parts||parts.length<2||parts.reduce((s,x)=>s+x.value,0)<=0)return null;
    return parts;
  }

  async function makePdf(calc,values,results){
    const W=595,H=842,M=42,CW=W-M*2,pages=[],cmd=[];let y=H-46;
    const logo=await loadLogo();
    const flush=()=>{if(cmd.length)pages.push(cmd.splice(0));y=H-46};
    const ensure=h=>{if(y-h<42)flush()};
    const line=(s,size=9,bold=false)=>{const words=text(s).split(/\s+/);let cur='',lines=[];words.forEach(w=>{const next=cur?cur+' '+w:w;if(next.length>Math.max(30,Math.floor(CW/(size*.52)))&&cur){lines.push(cur);cur=w}else cur=next});if(cur||!lines.length)lines.push(cur);lines.forEach(v=>{ensure(size+8);cmd.push('0 0 0 rg');cmd.push('BT /F'+(bold?2:1)+' '+size+' Tf '+M+' '+y+' Td ('+esc(v)+') Tj ET');y-=size+8});y-=2};
    const center=(s,size=9,bold=false)=>{const v=text(s),w=v.length*size*.5;ensure(size+8);cmd.push('0 0 0 rg');cmd.push('BT /F'+(bold?2:1)+' '+size+' Tf '+Math.max(M,(W-w)/2)+' '+y+' Td ('+esc(v)+') Tj ET');y-=size+8};
    const table=(title,rows)=>{ensure(38);line(title,15,true);y-=2;rows.forEach((r,i)=>{ensure(25);if(i%2===0)cmd.push('0.97 0.98 0.99 rg '+M+' '+(y-19)+' '+CW+' 23 re f');cmd.push('0.86 0.88 0.91 RG 0.5 w '+M+' '+(y-19)+' '+CW+' 23 re S');cmd.push('0 0 0 rg');const a=text(r[0]).slice(0,68),b=text(r[1]).slice(0,48),rw=Math.min(220,b.length*4.5);cmd.push('BT /F1 9 Tf '+(M+8)+' '+(y-13)+' Td ('+esc(a)+') Tj ET');cmd.push('BT /F2 9 Tf '+(W-M-8-rw)+' '+(y-13)+' Td ('+esc(b)+') Tj ET');y-=23});y-=9};
    const pie=(parts)=>{ensure(290);line('Result breakdown',15,true);line('The same genuine components shown by the calculator pie chart.',9,false);y-=4;const cx=W/2,cy=y-118,r=86,total=parts.reduce((s,p)=>s+p.value,0),rgb=['0.15 0.39 0.92','0.08 0.72 0.65','0.49 0.24 0.93','0.96 0.62 0.04'];let angle=-Math.PI/2;parts.forEach((p,i)=>{const end=angle+(p.value/total)*Math.PI*2,pts=[[cx,cy]],steps=Math.max(8,Math.ceil(Math.abs(end-angle)*18));for(let k=0;k<=steps;k++){const a=angle+(end-angle)*k/steps;pts.push([cx+r*Math.cos(a),cy+r*Math.sin(a)])}cmd.push(rgb[i%rgb.length]+' rg');cmd.push(pts.map((q,j)=>q[0].toFixed(2)+' '+q[1].toFixed(2)+(j?' l':' m')).join(' ')+' h f');angle=end});let ly=cy-r+8;parts.forEach((p,i)=>{const pct=p.value/total*100;cmd.push(rgb[i%rgb.length]+' rg '+M+' '+(ly-3)+' 9 9 re f');cmd.push('0 0 0 rg');cmd.push('BT /F1 8 Tf '+(M+15)+' '+ly+' Td ('+esc(p.label+' - '+fmt({value:p.value,format:'currency'})+' - '+pct.toFixed(pct<10?1:0)+'%')+') Tj ET');ly-=18});y=Math.min(cy-r-12,ly-6)};
    const bars=(rows)=>{ensure(260);line('Calculation summary',15,true);line('The bars use the actual calculated values.',9,false);y-=5;const numeric=rows.filter(r=>Number.isFinite(Number(r.value))&&Number(r.value)>=0).slice(0,6),max=Math.max(...numeric.map(r=>Number(r.value)),1);numeric.forEach(r=>{ensure(30);const label=text(r.label).slice(0,30),v=Number(r.value),bw=250*v/max;cmd.push('0.92 0.93 0.95 rg '+(M+145)+' '+(y-8)+' 250 10 re f');cmd.push('0.15 0.39 0.92 rg '+(M+145)+' '+(y-8)+' '+Math.max(4,bw).toFixed(1)+' 10 re f');cmd.push('0 0 0 rg');cmd.push('BT /F1 8 Tf '+M+' '+(y-6)+' Td ('+esc(label)+') Tj ET');cmd.push('BT /F2 8 Tf '+(M+405)+' '+(y-6)+' Td ('+esc(fmt(r))+') Tj ET');y-=27});y-=8};

    // Real Wealth Arrays logo from the same icon used by the site.
    if(logo){ensure(58);const iw=46,ih=46,ix=M,iy=y-ih+8;cmd.push('q '+iw+' 0 0 '+ih+' '+ix+' '+iy+' cm /Im1 Do Q');cmd.push('0 0 0 rg');cmd.push('BT /F2 18 Tf '+(ix+58)+' '+(y-22)+' Td (WEALTH ARRAYS) Tj ET');y-=58}
    else {center('WEALTH ARRAYS',18,true);y-=2}
    center('CALCULATION REPORT',8,true);
    cmd.push('0.86 0.88 0.91 RG 0.7 w '+M+' '+y+' m '+(W-M)+' '+y+' l S');y-=16;
    line(calc.title,21,true);line('Generated from the assumptions you entered.',9);y-=3;
    table('Your inputs',calc.fields.map(f=>[f.label,values[f.id]??'']));
    table('Your calculated results',results.map(r=>[r.label,fmt(r)]));
    const parts=partsFor(calc,values,results);if(parts)pie(parts);else bars(results);
    line('Educational estimate only. Not financial, tax, legal or investment advice.',8);flush();

    const objects=[null,enc('<< /Type /Catalog /Pages 2 0 R >>'),null];
    const f1=objects.length;objects.push(enc('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'));
    const f2=objects.length;objects.push(enc('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'));
    let imgObj=null;
    if(logo){imgObj=objects.length;objects.push(join([enc('<< /Type /XObject /Subtype /Image /Width '+logo.width+' /Height '+logo.height+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+logo.bytes.length+' >>\nstream\n'),logo.bytes,enc('\nendstream')]))}
    const pageRefs=[],contentRefs=[];
    pages.forEach(c=>{const p=objects.length;pageRefs.push(p);objects.push(null);const co=objects.length;contentRefs.push(co);const body=enc(c.join('\n')+'\n');objects.push(join([enc('<< /Length '+body.length+' >>\nstream\n'),body,enc('endstream')]))});
    objects[2]=enc('<< /Type /Pages /Kids ['+pageRefs.map(n=>n+' 0 R').join(' ')+'] /Count '+pageRefs.length+' >>');
    pageRefs.forEach((p,i)=>{objects[p]=enc('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+W+' '+H+'] /Resources << /Font << /F1 '+f1+' 0 R /F2 '+f2+' 0 R >> '+(imgObj?'/XObject << /Im1 '+imgObj+' 0 R >> ':'')+' >> /Contents '+contentRefs[i]+' 0 R >>')});
    const chunks=[enc('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n')],off=[0];let pos=chunks[0].length;
    for(let i=1;i<objects.length;i++){off[i]=pos;const h=enc(i+' 0 obj\n'),t=enc('\nendobj\n');chunks.push(h,objects[i],t);pos+=h.length+objects[i].length+t.length}
    const xref=pos;chunks.push(enc('xref\n0 '+objects.length+'\n0000000000 65535 f \n'));for(let i=1;i<objects.length;i++)chunks.push(enc(String(off[i]).padStart(10,'0')+' 00000 n \n'));chunks.push(enc('trailer\n<< /Size '+objects.length+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF'));
    return join(chunks);
  }

  async function download(calc,values,results){
    try{
      const pdf=await makePdf(calc,values,results);
      const blob=new Blob([pdf],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download=(calc.slug||calc.id||'wealth-arrays')+'-report.pdf';a.rel='noopener';a.style.display='none';
      document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
    }catch(e){console.error('Wealth Arrays PDF export failed',e);alert('PDF export failed. Please try again.')}
  }
  window.waOpenPrintReport=download;
  window.WA_DIRECT_PDF_EXPORT={download};
})();
