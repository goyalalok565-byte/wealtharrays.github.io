/* Wealth Arrays — lightweight calculator UI */
const safeStorage={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const currencyList=()=>window.WA?.currencies||[['USD','$','US Dollar'],['EUR','€','Euro'],['GBP','£','British Pound'],['INR','₹','Indian Rupee']];
const waState={currency:safeStorage.get('waCurrency')||'INR',theme:safeStorage.get('waTheme')||'light'};
function waCurrencySymbol(){const c=currencyList().find(c=>c[0]===waState.currency);return c?c[1]:'₹'}
function waFormatValue(value,format){if(!Number.isFinite(value))return'—';if(format==='percent')return value.toFixed(2)+'%';if(format==='number')return Math.round(value).toLocaleString();if(format==='years')return value.toFixed(1)+' yrs';return waCurrencySymbol()+Math.round(value*100)/100 .toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function esc(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function applyGlobalTheme(){document.documentElement.dataset.theme=waState.theme;const b=document.getElementById('theme-toggle'),s=b?.querySelector('[data-theme-label]')||document.getElementById('theme-toggle-label');if(s)s.textContent=waState.theme==='dark'?'Light mode':'Dark mode';if(b)b.setAttribute('aria-pressed',String(waState.theme==='dark'))}
function initMasthead(onChange){const select=document.getElementById('currency-select'),toggle=document.getElementById('theme-toggle');if(select){select.innerHTML=currencyList().map(c=>`<option value="${c[0]}">${c[0]} (${c[1]})</option>`).join('');select.value=waState.currency;select.addEventListener('change',()=>{waState.currency=select.value;safeStorage.set('waCurrency',waState.currency);document.documentElement.dataset.currency=waState.currency;onChange?.()})}toggle?.addEventListener('click',()=>{waState.theme=waState.theme==='dark'?'light':'dark';safeStorage.set('waTheme',waState.theme);applyGlobalTheme()});applyGlobalTheme()}
async function waShare(title,text,url){if(navigator.share){try{await navigator.share({title,text,url});return}catch(e){}}try{await navigator.clipboard.writeText(url);alert('Link copied.')}catch(e){}}
function waOpenPrintReport(calc,values,results){const rows=results.map(r=>`<tr><td>${esc(r.label)}</td><td>${esc(waFormatValue(r.value,r.format))}</td></tr>`).join('');const inputs=calc.fields.map(f=>`<tr><td>${esc(f.label)}</td><td>${esc(values[f.id])}</td></tr>`).join('');const w=window.open('','_blank','noopener,noreferrer,width=900,height=900');if(!w){alert('Please allow pop-ups to export the report.');return}w.document.write(`<!doctype html><html><head><title>${esc(calc.title)}</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;color:#111}table{width:100%;border-collapse:collapse}td{padding:10px;border-bottom:1px solid #ddd}</style></head><body><h1>${esc(calc.title)}</h1><h2>Inputs</h2><table>${inputs}</table><h2>Calculated output</h2><table>${rows}</table><p>For planning purposes only. Not financial, tax, legal or investment advice.</p><script>window.onload=()=>window.print()<\/script></body></html>`);w.document.close()}
async function waCopyEmbed(calc){const src=new URL(`widget.html?calc=${encodeURIComponent(calc.id)}`,document.baseURI).href;const code=`<iframe title="${esc(calc.title)} — Wealth Arrays" src="${src}" width="100%" height="620" loading="lazy" style="border:0;border-radius:16px;max-width:900px"></iframe>`;try{await navigator.clipboard.writeText(code);alert('Embed code copied.')}catch(e){prompt('Copy this embed code:',code)}}
function buildComparePanel(id,calc,currentValues,currentResults){const panel=document.getElementById(`${id}-compare-panel`);if(!panel)return;const example=calc.article?.exampleInputs;if(!example){panel.innerHTML='<div style="padding:14px">No reference scenario is available.</div>';return}let ex=[];try{ex=calc.compute(example)||[]}catch(e){}const a=Object.fromEntries(currentResults.map(r=>[r.label,r])),b=Object.fromEntries(ex.map(r=>[r.label,r]));const labels=[...new Set([...Object.keys(a),...Object.keys(b)])];panel.innerHTML=`<div class="compare-inner"><p>Compared with this calculator's worked example.</p><div class="compare-table"><table><thead><tr><th>Metric</th><th>Your scenario</th><th>Example</th></tr></thead><tbody>${labels.map(l=>`<tr><td>${esc(l)}</td><td>${a[l]?esc(waFormatValue(a[l].value,a[l].format)):'—'}</td><td>${b[l]?esc(waFormatValue(b[l].value,b[l].format)):'—'}</td></tr>`).join('')}</tbody></table></div></div>`}
function mountCalculator(calc,id){const container=document.getElementById(id);if(!container||!calc)return;const fields=calc.fields.map(f=>f.type==='select'?`<div class="field"><label for="f-${esc(f.id)}">${esc(f.label)}</label><select id="f-${esc(f.id)}" data-field="${esc(f.id)}">${f.options.map(o=>`<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('')}</select></div>`:`<div class="field"><label for="f-${esc(f.id)}">${esc(f.label)}${f.suffix?` <span class="hint">(${esc(f.suffix)})</span>`:''}</label><input id="f-${esc(f.id)}" data-field="${esc(f.id)}" type="number" inputmode="decimal" value="${esc(f.default)}" ${f.min!==undefined?`min="${f.min}"`:''} ${f.max!==undefined?`max="${f.max}"`:''} ${f.step!==undefined?`step="${f.step}"`:''}></div>`).join('');container.innerHTML=`<div class="calc-widget-body"><div class="calc-grid">${fields}</div><div class="calc-result" id="${id}-result" aria-live="polite"></div><div class="tool-actions"><button type="button" class="tool-action primary" id="${id}-share">Share</button><button type="button" class="tool-action" id="${id}-export">Export report</button><button type="button" class="tool-action" id="${id}-embed">Copy embed</button><button type="button" class="tool-action" id="${id}-compare" aria-expanded="false">Compare</button></div><div class="compare-panel" id="${id}-compare-panel" hidden></div><p class="calc-note">Estimates only, for planning purposes — not financial, tax or investment advice.</p></div>`;let latest=[],latestValues={};function recompute(){latestValues={};calc.fields.forEach(f=>{const e=document.getElementById(`f-${f.id}`);latestValues[f.id]=f.type==='select'?e.value:(parseFloat(e.value)||0)});try{latest=calc.compute(latestValues)||[]}catch(e){latest=[]}document.getElementById(`${id}-result`).innerHTML=latest.map(r=>`<div class="calc-result-row"><span class="calc-result-label">${esc(r.label)}</span><span class="calc-result-value ${esc(r.emphasis||'')}">${esc(waFormatValue(r.value,r.format))}</span></div>`).join('')};calc.fields.forEach(f=>{const e=document.getElementById(`f-${f.id}`);if(f.type==='select')e.value=f.default;e.addEventListener('input',recompute);e.addEventListener('change',recompute)});document.getElementById(`${id}-share`)?.addEventListener('click',()=>waShare(calc.title,latest.map(r=>`${r.label} ${waFormatValue(r.value,r.format)}`).join(' • '),location.href));document.getElementById(`${id}-export`)?.addEventListener('click',()=>waOpenPrintReport(calc,latestValues,latest));document.getElementById(`${id}-embed`)?.addEventListener('click',()=>waCopyEmbed(calc));document.getElementById(`${id}-compare`)?.addEventListener('click',e=>{const p=document.getElementById(`${id}-compare-panel`);p.hidden=!p.hidden;e.currentTarget.setAttribute('aria-expanded',String(!p.hidden));if(!p.hidden)buildComparePanel(id,calc,latestValues,latest)});initMasthead(recompute);recompute()}
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


/* Wealth Arrays production calculator renderer — hardened for all calculator pages. */
function waFormatValue(value,format){
  if(!Number.isFinite(Number(value))) return '—';
  value=Number(value);
  if(format==='percent') return value.toFixed(2)+'%';
  if(format==='number') return Math.round(value).toLocaleString('en-IN');
  if(format==='years') return value.toFixed(1)+' yrs';
  return waCurrencySymbol()+value.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function waCalcGraphPoints(results){
  var nums=(results||[]).filter(function(r){return Number.isFinite(Number(r.value));}).map(function(r){return Math.max(0,Number(r.value));});
  if(!nums.length) return '';
  var max=Math.max.apply(null,nums)||1, w=640,h=190,p=18;
  var step=(w-p*2)/Math.max(1,nums.length-1);
  return nums.map(function(v,i){var x=p+i*step,y=h-p-(v/max)*(h-p*2);return x.toFixed(1)+','+y.toFixed(1);}).join(' ');
}
function waRenderGraph(id,results){
  var host=document.getElementById(id+'-graph'); if(!host) return;
  var nums=(results||[]).filter(function(r){return Number.isFinite(Number(r.value));});
  if(!nums.length){host.innerHTML='';return;}
  var labels=nums.map(function(r){return '<span>'+esc(r.label)+'</span>';}).join('');
  host.innerHTML='<div class="wa-graph-head"><b>Result snapshot</b><small>Visual comparison of your current calculation</small></div><svg viewBox="0 0 640 190" role="img" aria-label="Calculator result graph" preserveAspectRatio="none"><defs><linearGradient id="waGraphFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity=".28"/><stop offset="100%" stop-color="currentColor" stop-opacity=".02"/></linearGradient></defs><polyline class="wa-graph-area" points="18,172 '+waCalcGraphPoints(results)+' 622,172" fill="url(#waGraphFill)"></polyline><polyline class="wa-graph-line" points="'+waCalcGraphPoints(results)+'" fill="none"></polyline></svg><div class="wa-graph-labels">'+labels+'</div>';
}
function mountCalculator(calc,id){
  var container=document.getElementById(id);
  if(!container||!calc||!Array.isArray(calc.fields)||typeof calc.compute!=='function') return false;
  var fields=calc.fields.map(function(f){
    var def=f.default!==undefined&&f.default!==null?f.default:(f.type==='select'&&f.options&&f.options[0]?f.options[0].value:0);
    if(f.type==='select'){
      return '<div class="field"><label for="f-'+esc(f.id)+'">'+esc(f.label)+'</label><select id="f-'+esc(f.id)+'" data-field="'+esc(f.id)+'">'+(f.options||[]).map(function(o){return '<option value="'+esc(o.value)+'">'+esc(o.label)+'</option>';}).join('')+'</select></div>';
    }
    return '<div class="field"><label for="f-'+esc(f.id)+'">'+esc(f.label)+(f.suffix?' <span class="hint">('+esc(f.suffix)+')</span>':'')+'</label><input id="f-'+esc(f.id)+'" data-field="'+esc(f.id)+'" type="number" inputmode="decimal" value="'+esc(def)+'" '+(f.min!==undefined?'min="'+f.min+'"':'')+' '+(f.max!==undefined?'max="'+f.max+'"':'')+' '+(f.step!==undefined?'step="'+f.step+'"':'')+'></div>';
  }).join('');
  container.innerHTML='<div class="calc-widget calc-widget-live"><div class="calc-widget-body"><div class="calc-grid">'+fields+'</div><div class="calc-result" id="'+id+'-result" aria-live="polite"></div><div class="wa-graph-card" id="'+id+'-graph"></div><div class="tool-actions"><button type="button" class="tool-action primary" id="'+id+'-share">Share</button><button type="button" class="tool-action" id="'+id+'-export">Export report</button><button type="button" class="tool-action" id="'+id+'-embed">Copy embed</button><button type="button" class="tool-action" id="'+id+'-compare" aria-expanded="false">Compare</button></div><div class="compare-panel" id="'+id+'-compare-panel" hidden></div><p class="calc-note">Estimates only, for planning purposes — not financial, tax or investment advice.</p></div></div>';
  var latest=[],latestValues={};
  function recompute(){
    latestValues={};
    calc.fields.forEach(function(f){
      var e=document.getElementById('f-'+f.id); if(!e)return;
      latestValues[f.id]=f.type==='select'?e.value:Number.isFinite(parseFloat(e.value))?parseFloat(e.value):0;
    });
    try{latest=calc.compute(latestValues)||[];}catch(err){
      latest=[{label:'Calculation error',value:NaN,format:'number'}]; console.error('Calculator compute failed:',calc.id,err);
    }
    var result=document.getElementById(id+'-result');
    if(result) result.innerHTML=latest.map(function(r){return '<div class="calc-result-row"><span class="calc-result-label">'+esc(r.label)+'</span><span class="calc-result-value '+esc(r.emphasis||'')+'">'+esc(waFormatValue(r.value,r.format))+'</span></div>';}).join('');
    waRenderGraph(id,latest);
  }
  calc.fields.forEach(function(f){var e=document.getElementById('f-'+f.id);if(!e)return;e.addEventListener('input',recompute);e.addEventListener('change',recompute);});
  document.getElementById(id+'-share').addEventListener('click',function(){waShare(calc.title,latest.map(function(r){return r.label+' '+waFormatValue(r.value,r.format);}).join(' • '),location.href);});
  document.getElementById(id+'-export').addEventListener('click',function(){waOpenPrintReport(calc,latestValues,latest);});
  document.getElementById(id+'-embed').addEventListener('click',function(){waCopyEmbed(calc);});
  document.getElementById(id+'-compare').addEventListener('click',function(e){var p=document.getElementById(id+'-compare-panel');p.hidden=!p.hidden;e.currentTarget.setAttribute('aria-expanded',String(!p.hidden));if(!p.hidden)buildComparePanel(id,calc,latestValues,latest);});
  initMasthead(recompute); recompute(); container.dataset.waMounted='1'; return true;
}
/* Final deterministic page bootstrap: retries until calculator definitions are available. */
(function(){
  function boot(){
    var target=document.getElementById('calc-widget'); if(!target||target.dataset.waMounted==='1')return;
    if(typeof CALCULATORS==='undefined')return;
    var slug=(location.pathname.split('/').pop()||'').replace(/\.html$/,'');
    var calc=CALCULATORS.find(function(c){return c.slug===slug;});
    if(calc) mountCalculator(calc,'calc-widget');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
  setTimeout(boot,100); setTimeout(boot,500);
})();


/* Universal user-first calculator UX: empty inputs, calculate only when the user provides values. */
function waSimpleLabel(label){
  var map={
    'Future Value':'Your money could grow to',
    'Maturity Amount':'You could receive',
    'Total Investment':'You would put in',
    'Total Contributions':'You would put in',
    'Total Interest':'Extra money earned',
    'Interest Earned':'Extra money earned',
    'Monthly Payment':'Your monthly payment could be',
    'EMI':'Your monthly payment could be',
    'Total Payment':'Total amount you may pay',
    'Total Amount Paid':'Total amount you may pay',
    'Total Interest Paid':'Extra cost paid as interest',
    'Monthly Investment':'You may need to invest each month',
    'Required Monthly Investment':'You may need to invest each month',
    'Retirement Corpus':'Money you may need for retirement',
    'Monthly Income':'Estimated monthly income',
    'Net Worth':'What you own minus what you owe',
    'Inflation Adjusted Value':'What your money may be worth in today’s buying power',
    'Purchasing Power':'What your money can buy',
    'Profit':'Money left after costs',
    'Profit Margin':'Profit from each ₹100 of sales',
    'Return on Investment':'Your gain or loss compared with what you invested',
    'CAGR':'Average yearly growth',
    'Tax Payable':'Estimated tax to pay',
    'Take-home Pay':'Estimated money you keep',
    'Hourly Rate':'What you earn per hour'
  };
  return map[label]||label;
}
function waResultSummary(calc,results){
  if(!results||!results.length)return 'Enter your details to see a clear estimate.';
  var primary=results.find(function(r){return r.emphasis==='positive'||/Future Value|Maturity Amount|Monthly Payment|EMI|Net Worth|Tax Payable|Retirement Corpus|Profit/.test(r.label);})||results[0];
  return '<div class="wa-result-summary"><span class="wa-result-kicker">YOUR ESTIMATE</span><strong>'+esc(waSimpleLabel(primary.label))+'</strong><b>'+esc(waFormatValue(primary.value,primary.format))+'</b><p>Change any value above to instantly see how your estimate changes.</p></div>';
}
function waRenderPortfolio(id,results){
  var host=document.getElementById(id+'-graph'); if(!host)return;
  var rows=(results||[]).filter(function(r){return Number.isFinite(Number(r.value));});
  if(!rows.length){host.innerHTML='<div class="wa-portfolio-empty">Your visual summary will appear here after you enter your details.</div>';return;}
  var positive=rows.map(function(r){return Math.max(0,Number(r.value));});
  var total=positive.reduce(function(a,b){return a+b;},0)||1;
  var colors=['#2563eb','#14b8a6','#7c3aed','#f59e0b','#ec4899','#0891b2'];
  var offset=0;
  var segments=positive.map(function(v,i){var pct=(v/total)*100;var seg='<circle cx="50" cy="50" r="40" fill="none" stroke="'+colors[i%colors.length]+'" stroke-width="12" stroke-linecap="round" stroke-dasharray="'+pct+' '+(100-pct)+'" stroke-dashoffset="'+(-offset)+'" pathLength="100"></circle>';offset+=pct;return seg;}).join('');
  host.innerHTML='<div class="wa-portfolio-head"><div><span>YOUR MONEY AT A GLANCE</span><h3>Simple visual summary</h3><p>See the biggest parts of your result without reading complex charts.</p></div></div><div class="wa-portfolio-layout"><div class="wa-donut"><svg viewBox="0 0 100 100" role="img" aria-label="Visual breakdown of your results">'+segments+'</svg></div><div class="wa-portfolio-list">'+rows.map(function(r,i){return '<div class="wa-portfolio-row"><i style="background:'+colors[i%colors.length]+'"></i><span>'+esc(waSimpleLabel(r.label))+'</span><b>'+esc(waFormatValue(r.value,r.format))+'</b></div>';}).join('')+'</div></div>';
}
function mountCalculator(calc,id){
  var container=document.getElementById(id);
  if(!container||!calc||!Array.isArray(calc.fields)||typeof calc.compute!=='function')return false;
  var fields=calc.fields.map(function(f){
    if(f.type==='select')return '<div class="field"><label for="f-'+esc(f.id)+'">'+esc(f.label)+'</label><select id="f-'+esc(f.id)+'" data-field="'+esc(f.id)+'">'+(f.options||[]).map(function(o){return '<option value="'+esc(o.value)+'">'+esc(o.label)+'</option>';}).join('')+'</select></div>';
    return '<div class="field"><label for="f-'+esc(f.id)+'">'+esc(f.label)+(f.suffix?' <span class="hint">'+esc(f.suffix)+'</span>':'')+'</label><input id="f-'+esc(f.id)+'" data-field="'+esc(f.id)+'" type="number" inputmode="decimal" placeholder="Enter '+esc(f.label.toLowerCase())+'" '+(f.min!==undefined?'min="'+f.min+'"':'')+' '+(f.max!==undefined?'max="'+f.max+'"':'')+' '+(f.step!==undefined?'step="'+f.step+'"':'')+'></div>';
  }).join('');
  container.innerHTML='<div class="calc-widget calc-widget-live calc-user-first"><div class="calc-widget-body"><div class="wa-calc-intro"><span>STEP 1</span><b>Enter your own numbers</b><small>Nothing is pre-filled, so you can calculate your situation faster.</small></div><div class="calc-grid">'+fields+'</div><button type="button" class="wa-calculate-btn" id="'+id+'-calculate">Calculate my result</button><div class="calc-result" id="'+id+'-result" aria-live="polite"><div class="wa-result-empty">Enter your details and tap <b>Calculate my result</b>.</div></div><div class="wa-portfolio-card" id="'+id+'-graph"><div class="wa-portfolio-empty">Your visual summary will appear here after you calculate.</div></div><div class="tool-actions"><button type="button" class="tool-action primary" id="'+id+'-share">Share</button><button type="button" class="tool-action" id="'+id+'-export">Export report</button><button type="button" class="tool-action" id="'+id+'-compare" aria-expanded="false">Compare</button></div><div class="compare-panel" id="'+id+'-compare-panel" hidden></div><p class="calc-note">This is an estimate to help you plan. It is not financial or tax advice.</p></div></div>';
  var latest=[],latestValues={};
  function hasAllRequired(){return calc.fields.filter(function(f){return f.type!=='select';}).every(function(f){var e=document.getElementById('f-'+f.id);return e&&String(e.value).trim()!=='';});}
  function compute(show){
    if(!hasAllRequired()){if(show){document.getElementById(id+'-result').innerHTML='<div class="wa-result-empty">Please fill in all the fields first. Then your result will be easy to understand.</div>';}return false;}
    latestValues={};calc.fields.forEach(function(f){var e=document.getElementById('f-'+f.id);latestValues[f.id]=f.type==='select'?e.value:Number(e.value);});
    try{latest=calc.compute(latestValues)||[];}catch(err){console.error('Calculator failed:',calc.id,err);document.getElementById(id+'-result').innerHTML='<div class="wa-result-empty">We could not calculate this right now. Please check your numbers.</div>';return false;}
    var result=document.getElementById(id+'-result');
    result.innerHTML=waResultSummary(calc,latest)+'<div class="wa-simple-results">'+latest.map(function(r){return '<div class="calc-result-row"><span class="calc-result-label">'+esc(waSimpleLabel(r.label))+'</span><span class="calc-result-value '+esc(r.emphasis||'')+'">'+esc(waFormatValue(r.value,r.format))+'</span></div>';}).join('')+'</div>';
    waRenderPortfolio(id,latest);return true;
  }
  calc.fields.forEach(function(f){var e=document.getElementById('f-'+f.id);if(!e)return;e.addEventListener('input',function(){if(latest.length)compute(false);});e.addEventListener('change',function(){if(latest.length)compute(false);});});
  document.getElementById(id+'-calculate').addEventListener('click',function(){compute(true);});
  document.getElementById(id+'-share').addEventListener('click',function(){if(compute(false))waShare(calc.title,latest.map(function(r){return waSimpleLabel(r.label)+' '+waFormatValue(r.value,r.format);}).join(' • '),location.href);});
  document.getElementById(id+'-export').addEventListener('click',function(){if(compute(false))waOpenPrintReport(calc,latestValues,latest);});
  document.getElementById(id+'-compare').addEventListener('click',function(e){if(!compute(false))return;var p=document.getElementById(id+'-compare-panel');p.hidden=!p.hidden;e.currentTarget.setAttribute('aria-expanded',String(!p.hidden));if(!p.hidden)buildComparePanel(id,calc,latestValues,latest);});
  initMasthead(function(){if(latest.length)compute(false);});container.dataset.waMounted='1';return true;
}
