/* Wealth Arrays — canonical PDF export branding fix. */
(function(){
  'use strict';
  if(window.__WA_PDF_EXPORT_FIX__)return;
  window.__WA_PDF_EXPORT_FIX__=true;

  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const format=(v,f)=>window.waFormatValue?window.waFormatValue(v,f):String(v??'');

  function report(calc,values,results){
    const logo=new URL('/favicon-v3.svg',window.location.origin).href;
    const inputs=calc.fields.map(f=>`<tr><td>${esc(f.label)}</td><td>${esc(values[f.id]??'')}</td></tr>`).join('');
    const rows=results.map(r=>`<tr><td>${esc(r.label)}</td><td>${esc(format(r.value,r.format))}</td></tr>`).join('');
    const html=`<!doctype html><html><head><meta charset="utf-8"><title>${esc(calc.title)} Report · Wealth Arrays</title><style>body{font-family:Arial,sans-serif;max-width:760px;margin:36px auto;padding:0 24px;color:#101828;background:#fff}header{display:flex;align-items:center;gap:14px;padding-bottom:18px;border-bottom:1px solid #e4e7ec;margin-bottom:24px}header img{width:56px;height:56px;object-fit:contain}header strong{display:block;font-size:17px}header span{display:block;margin-top:3px;color:#667085;font-size:10px;letter-spacing:.12em}h1{font-size:30px;margin:0 0 6px}h2{font-size:17px;margin:28px 0 8px}p{color:#667085}table{width:100%;border-collapse:collapse;margin:10px 0 24px;border:1px solid #e4e7ec}td{padding:11px;border-bottom:1px solid #eaecf0}td:last-child{text-align:right;font-weight:700}.no-print{padding:10px 16px;border:0;border-radius:8px;cursor:pointer}@media print{body{margin:18px auto;padding:0}.no-print{display:none}}</style></head><body><header><img id="wa-current-logo" src="${esc(logo)}" alt="Wealth Arrays logo" width="56" height="56"><div><strong>Wealth Arrays</strong><span>CALCULATION REPORT</span></div></header><h1>${esc(calc.title)}</h1><p>Generated from the assumptions you entered.</p><h2>Your inputs</h2><table>${inputs}</table><h2>Your calculated results</h2><table>${rows}</table><p>Educational estimate only. Not financial, tax, legal or investment advice.</p><button class="no-print" type="button" onclick="window.print()">Save as PDF</button><script>const logo=document.getElementById('wa-current-logo');function go(){setTimeout(()=>{try{window.focus();window.print()}catch(e){}},180)}if(logo.complete)go();else logo.addEventListener('load',go,{once:true});<\/script></body></html>`;
    const win=window.open('','_blank');
    if(!win){alert('Your browser blocked the PDF report window. Please allow pop-ups for Wealth Arrays and try again.');return;}
    win.document.open();win.document.write(html);win.document.close();
  }

  function findCalculator(id){
    const list=window.CALCULATORS||[];
    return list.find(c=>c.id===id)||list.find(c=>c.slug===id)||list.find(c=>c.title?.toLowerCase()===document.querySelector('.calc-title')?.textContent.trim().toLowerCase());
  }

  document.addEventListener('click',function(event){
    const button=event.target.closest('[id$="-export"]');
    if(!button)return;
    const host=document.getElementById('calc-widget');
    const id=host?.id||'calc-widget';
    const calc=findCalculator((document.documentElement.dataset.waCalculator||''));
    if(!calc)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const values={};
    calc.fields.forEach(f=>{const el=document.getElementById(`f-${f.id}`);if(el)values[f.id]=f.type==='select'?el.value:(String(el.value).trim()===''?NaN:Number(el.value));});
    let results=[];
    try{results=calc.compute(values)||[]}catch(e){return;}
    if(!results.length)return;
    report(calc,values,results);
  },true);
})();
