/* Wealth Arrays calculator enhancements: visual SVG chart, CSV export, PDF branding, and WebApplication schema. */
(function(){
  'use strict';
  function esc(v){return String(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
  function number(v){const n=Number(v);return Number.isFinite(n)?n:0;}
  function readValues(calc,host){
    const controls=[...host.querySelectorAll('input,select,textarea')],byId={};
    controls.forEach(el=>{if(el.id)byId[el.id]=el;if(el.name)byId[el.name]=el;});
    const values={};
    calc.fields.forEach((f,i)=>{const el=byId[f.id]||host.querySelector(`[data-field="${CSS.escape(f.id)}"]`)||controls[i];if(el)values[f.id]=f.type==='number'?number(el.value):(el.value??f.default);});
    return values;
  }
  function formatValue(r){const n=number(r.value);if(r.format==='percent')return n.toFixed(2)+'%';if(r.format==='years')return n.toFixed(1)+' yrs';if(r.format==='number')return Math.round(n).toLocaleString('en-US');return(window.waFormatValue?window.waFormatValue(n,r.format):n.toLocaleString('en-US',{maximumFractionDigits:2}));}
  function resultsFor(calc,host){try{return calc.compute(readValues(calc,host))||[]}catch(e){return[];}}
  function renderChart(calc,host){
    const rows=resultsFor(calc,host).filter(r=>Number.isFinite(Number(r.value))&&Number(r.value)>=0).slice(0,6);if(rows.length<2)return;
    let chart=host.querySelector('.wa-export-chart');
    if(!chart){chart=document.createElement('section');chart.className='wa-export-chart';chart.setAttribute('aria-label','Visual calculation summary');chart.innerHTML='<div class="wa-export-head"><span>VISUAL SUMMARY</span><h3>See your calculated results</h3><p>The bars use the actual values from this calculator.</p></div><div class="wa-export-bars"></div>';const anchor=host.querySelector('.wa-portfolio-card')||host.firstElementChild;anchor?anchor.after(chart):host.appendChild(chart);}
    const max=Math.max(...rows.map(r=>number(r.value)),1);chart.querySelector('.wa-export-bars').innerHTML=rows.map(r=>`<div class="wa-export-bar"><span>${esc(r.label)}</span><div><i style="width:${Math.max(2,number(r.value)/max*100).toFixed(2)}%"></i></div><b>${esc(formatValue(r))}</b></div>`).join('');
  }
  function downloadCsv(calc,host){
    const values=readValues(calc,host),rows=resultsFor(calc,host),lines=[['Calculator',calc.title],[],['Input','Value'],...calc.fields.map(f=>[f.label,values[f.id]??'']),[],['Result','Value'],...rows.map(r=>[r.label,formatValue(r)])];
    const csv=lines.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n'),blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=(calc.slug||calc.id)+'-report.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  /* Canonical print/PDF report owner. It deliberately uses the current production
     icon asset instead of the retired favicon-v2 branding used by older reports. */
  function waOpenPrintReportCurrent(calc,values,results){
    const logoUrl=new URL('/icon-512.png',window.location.origin).href;
    const rows=results.map(r=>`<tr><td>${esc(r.label)}</td><td>${esc(formatValue(r))}</td></tr>`).join('');
    const inputs=calc.fields.map(f=>`<tr><td>${esc(f.label)}</td><td>${esc(values[f.id]??'')}</td></tr>`).join('');
    const numeric=results.map(r=>({label:r.label,value:Number(r.value),format:r.format})).filter(r=>Number.isFinite(r.value)&&r.value>=0).slice(0,6);
    const max=Math.max(...numeric.map(r=>r.value),1);
    const bars=numeric.map(r=>`<div class="bar"><span>${esc(r.label)}</span><div><i style="width:${Math.max(2,r.value/max*100).toFixed(2)}%"></i></div><b>${esc(formatValue(r))}</b></div>`).join('');
    const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(calc.title)} Report · Wealth Arrays</title><style>body{font-family:Arial,sans-serif;max-width:760px;margin:36px auto;padding:0 24px;color:#101828;background:#fff}header{display:flex;align-items:center;gap:14px;padding-bottom:18px;border-bottom:1px solid #e4e7ec;margin-bottom:24px}header img{width:56px;height:56px;object-fit:contain}header strong{display:block;font-size:17px;letter-spacing:-.02em}header span{display:block;margin-top:3px;color:#667085;font-size:10px;letter-spacing:.12em}h1{font-size:30px;margin:0 0 6px}h2{font-size:17px;margin:28px 0 8px}p{color:#667085}table{width:100%;border-collapse:collapse;margin:10px 0 24px;border:1px solid #e4e7ec}td{padding:11px;border-bottom:1px solid #eaecf0}td:last-child{text-align:right;font-weight:700}.chartbox{padding:18px;border:1px solid #e4e7ec;border-radius:14px;margin:24px 0}.bar{display:grid;grid-template-columns:160px 1fr auto;gap:10px;align-items:center;margin:12px 0;font-size:12px}.bar>div{height:12px;background:#eef2f6;border-radius:999px;overflow:hidden}.bar i{display:block;height:100%;background:#2563eb;border-radius:999px}.bar b{text-align:right;font-weight:700}@media print{body{margin:18px auto;padding:0}.no-print{display:none}}</style></head><body><header><img id="wa-pdf-logo" src="${esc(logoUrl)}" alt="Wealth Arrays logo" width="56" height="56"><div><strong>Wealth Arrays</strong><span>CALCULATION REPORT</span></div></header><h1>${esc(calc.title)}</h1><p>Generated from the assumptions you entered.</p><h2>Your inputs</h2><table>${inputs}</table><h2>Your calculated results</h2><table>${rows}</table>${bars?`<section class="chartbox"><h2>Calculation summary</h2>${bars}</section>`:''}<p>Educational estimate only. Not financial, tax, legal or investment advice.</p><button class="no-print" type="button" onclick="window.print()">Save as PDF</button><script>const logo=document.getElementById('wa-pdf-logo');function printWhenReady(){try{window.focus();window.print()}catch(e){const b=document.querySelector('.no-print');if(b)b.style.display='inline-block'}}if(logo.complete)window.setTimeout(printWhenReady,180);else logo.addEventListener('load',()=>window.setTimeout(printWhenReady,180),{once:true});<\/script></body></html>`;
    const win=window.open('','_blank');
    if(!win){alert('Your browser blocked the PDF report window. Please allow pop-ups for Wealth Arrays and try again.');return;}
    win.document.open();win.document.write(html);win.document.close();win.focus();
  }

  function addExportControls(calc,host){
    if(host.querySelector('.wa-export-tools'))return;
    const bar=document.createElement('div');bar.className='wa-export-tools';
    const csv=document.createElement('button');csv.type='button';csv.className='wa-export-btn';csv.textContent='Download CSV';csv.addEventListener('click',()=>downloadCsv(calc,host));
    const pdf=document.createElement('button');pdf.type='button';pdf.className='wa-export-btn wa-export-btn-primary';pdf.textContent='Download PDF';pdf.addEventListener('click',()=>{const values=readValues(calc,host),results=resultsFor(calc,host);if(window.WA_DIRECT_PDF_EXPORT&&typeof window.WA_DIRECT_PDF_EXPORT.download==='function'){window.WA_DIRECT_PDF_EXPORT.download(calc,values,results).catch(function(e){console.error('PDF export failed',e);waOpenPrintReportCurrent(calc,values,results);});}else{waOpenPrintReportCurrent(calc,values,results);}});
    bar.append(csv,pdf);host.appendChild(bar);
  }
  function addSchema(calc){const id='wa-webapplication-schema';let node=document.getElementById(id);if(!node){node=document.createElement('script');node.type='application/ld+json';node.id=id;document.head.appendChild(node);}const canonical=`https://wealtharrays.com/${calc.slug||calc.id}/`;node.textContent=JSON.stringify({'@context':'https://schema.org','@type':'WebApplication','name':calc.title,'applicationCategory':'FinanceApplication','operatingSystem':'Any','isAccessibleForFree':true,'description':calc.desc||calc.short||'Free financial calculator from Wealth Arrays.','url':canonical,'provider':{'@type':'Organization','name':'Wealth Arrays','url':'https://wealtharrays.com/'}});}
  function enhance(calc){const host=document.getElementById('calc-widget');if(!host||!calc)return;addSchema(calc);addExportControls(calc,host);renderChart(calc,host);const observer=new MutationObserver(()=>renderChart(calc,host));observer.observe(host,{childList:true,subtree:true});setTimeout(()=>renderChart(calc,host),100);}
  window.WA_CALCULATOR_ENHANCEMENTS={enhance,downloadCsv,waOpenPrintReport:waOpenPrintReportCurrent};
  window.waOpenPrintReport=waOpenPrintReportCurrent;
})();
