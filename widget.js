/* Wealth Arrays — lightweight calculator UI */
const safeStorage={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const currencyList=()=>window.WA?.currencies||[['USD','$','US Dollar'],['EUR','€','Euro'],['GBP','£','British Pound'],['INR','₹','Indian Rupee']];
const waState={currency:safeStorage.get('waCurrency')||'INR',theme:safeStorage.get('waTheme')||'light'};
function waCurrencySymbol(){const c=currencyList().find(c=>c[0]===waState.currency);return c?c[1]:'₹'}
function waFormatValue(value,format){if(!Number.isFinite(Number(value)))return'—';const n=Number(value);if(format==='percent')return n.toFixed(2)+'%';if(format==='number')return Math.round(n).toLocaleString('en-US');if(format==='years')return n.toFixed(1)+' yrs';return waCurrencySymbol()+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function esc(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function applyGlobalTheme(){document.documentElement.dataset.theme=waState.theme;const b=document.getElementById('theme-toggle'),s=b?.querySelector('[data-theme-label]')||document.getElementById('theme-toggle-label');if(s)s.textContent=waState.theme==='dark'?'Light mode':'Dark mode';if(b)b.setAttribute('aria-pressed',String(waState.theme==='dark'))}
function initMasthead(onChange){const select=document.getElementById('currency-select'),toggle=document.getElementById('theme-toggle');if(select){select.innerHTML=currencyList().map(c=>`<option value="${c[0]}">${c[0]} (${c[1]})</option>`).join('');select.value=waState.currency;select.addEventListener('change',()=>{waState.currency=select.value;safeStorage.set('waCurrency',waState.currency);document.documentElement.dataset.currency=waState.currency;onChange?.()})}toggle?.addEventListener('click',()=>{waState.theme=waState.theme==='dark'?'light':'dark';safeStorage.set('waTheme',waState.theme);applyGlobalTheme()});applyGlobalTheme()}
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
 const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(calc.title)} Report</title><style>body{font-family:Arial,sans-serif;max-width:760px;margin:36px auto;padding:0 24px;color:#101828;background:#fff}h1{font-size:30px;margin:0 0 6px}h2{font-size:17px;margin:28px 0 8px}p{color:#667085}table{width:100%;border-collapse:collapse;margin:10px 0 24px;border:1px solid #e4e7ec}td{padding:11px;border-bottom:1px solid #eaecf0}td:last-child{text-align:right;font-weight:700}.brand{color:#667085;font-size:12px;letter-spacing:.08em;font-weight:700}.chartbox{padding:18px;border:1px solid #e4e7ec;border-radius:14px;margin:24px 0}.chartbox h2{margin:0 0 4px}.chartsvg{max-width:560px;margin:14px auto}.chartsvg svg{display:block;width:100%;height:auto}.bar{display:grid;grid-template-columns:160px 1fr auto;gap:10px;align-items:center;margin:12px 0;font-size:12px}.bar>div{height:12px;background:#eef2f6;border-radius:999px;overflow:hidden}.bar i{display:block;height:100%;background:#2563eb;border-radius:999px}.bar b{text-align:right;font-weight:700}@media print{body{margin:18px auto;padding:0}.no-print{display:none}}</style></head><body><div class="brand">WEALTH ARRAYS · CALCULATION REPORT</div><h1>${esc(calc.title)}</h1><p>Generated from the assumptions you entered.</p><h2>Your inputs</h2><table>${inputs}</table><h2>Your calculated results</h2><table>${rows}</table>${chart}<p>Educational estimate only. Not financial, tax, legal or investment advice.</p><button class="no-print" id="wa-print-report" type="button">Print / Save as PDF</button><script>document.getElementById("wa-print-report").addEventListener("click",function(){window.print()})<\/script></body></html>`;
 const blob=new Blob([html],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob);
 const win=window.open(url,'_blank');
 if(!win){URL.revokeObjectURL(url);alert('Your browser blocked the report. Please allow pop-ups for this site and try again.');return;}
 setTimeout(()=>URL.revokeObjectURL(url),60000);
}
async function waCopyEmbed(calc){const src=new URL(`widget.html?calc=${encodeURIComponent(calc.id)}`,document.baseURI).href;const code=`<iframe title="${esc(calc.title)} — Wealth Arrays" src="${src}" width="100%" height="620" loading="lazy" style="border:0;border-radius:16px;max-width:900px"></iframe>`;try{await navigator.clipboard.writeText(code);alert('Embed code copied.')}catch(e){prompt('Copy this embed code:',code)}}
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
