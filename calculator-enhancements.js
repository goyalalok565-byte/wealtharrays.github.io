/* Wealth Arrays calculator enhancements: visual SVG chart, CSV export, and WebApplication schema. */
(function(){
  'use strict';
  function esc(v){return String(v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
  function number(v){const n=Number(v);return Number.isFinite(n)?n:0;}
  function readValues(calc,host){
    const controls=[...host.querySelectorAll('input,select,textarea')];
    const byId={};
    controls.forEach((el)=>{if(el.id) byId[el.id]=el; if(el.name) byId[el.name]=el;});
    const values={};
    calc.fields.forEach((f,i)=>{
      let el=byId[f.id]||host.querySelector(`[data-field="${CSS.escape(f.id)}"]`)||controls[i];
      if(!el)return;
      values[f.id]=f.type==='number'?number(el.value):(el.value??f.default);
    });
    return values;
  }
  function formatValue(r){
    const n=number(r.value);
    if(r.format==='percent')return n.toFixed(2)+'%';
    if(r.format==='years')return n.toFixed(1)+' yrs';
    if(r.format==='number')return Math.round(n).toLocaleString('en-US');
    return (window.waFormatValue?window.waFormatValue(n,r.format):n.toLocaleString('en-US',{maximumFractionDigits:2}));
  }
  function resultsFor(calc,host){try{return calc.compute(readValues(calc,host))||[]}catch(e){return[];}}
  function renderChart(calc,host){
    const rows=resultsFor(calc,host).filter(r=>Number.isFinite(Number(r.value))&&Number(r.value)>=0).slice(0,6);
    if(rows.length<2)return;
    let chart=host.querySelector('.wa-export-chart');
    if(!chart){chart=document.createElement('section');chart.className='wa-export-chart';chart.setAttribute('aria-label','Visual calculation summary');
      chart.innerHTML='<div class="wa-export-head"><span>VISUAL SUMMARY</span><h3>See your calculated results</h3><p>The bars use the actual values from this calculator.</p></div><div class="wa-export-bars"></div>';
      const anchor=host.querySelector('.wa-portfolio-card')||host.firstElementChild;anchor?anchor.after(chart):host.appendChild(chart);
    }
    const max=Math.max(...rows.map(r=>number(r.value)),1);
    chart.querySelector('.wa-export-bars').innerHTML=rows.map(r=>`<div class="wa-export-bar"><span>${esc(r.label)}</span><div><i style="width:${Math.max(2,number(r.value)/max*100).toFixed(2)}%"></i></div><b>${esc(formatValue(r))}</b></div>`).join('');
  }
  function downloadCsv(calc,host){
    const values=readValues(calc,host), rows=resultsFor(calc,host);
    const lines=[['Calculator',calc.title],[],['Input','Value'],...calc.fields.map(f=>[f.label,values[f.id]??'']),[],['Result','Value'],...rows.map(r=>[r.label,formatValue(r)])];
    const csv=lines.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=(calc.slug||calc.id)+'-report.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function addExportControls(calc,host){
    if(host.querySelector('.wa-export-tools'))return;
    const bar=document.createElement('div');bar.className='wa-export-tools';
    const csv=document.createElement('button');csv.type='button';csv.className='wa-export-btn';csv.textContent='Download CSV';csv.addEventListener('click',()=>downloadCsv(calc,host));
    const pdf=document.createElement('button');pdf.type='button';pdf.className='wa-export-btn wa-export-btn-primary';pdf.textContent='Download PDF';pdf.addEventListener('click',()=>{
      const values=readValues(calc,host),rows=resultsFor(calc,host);
      if(typeof window.waOpenPrintReport==='function')window.waOpenPrintReport(calc,values,rows);
    });
    bar.append(csv,pdf);host.appendChild(bar);
  }
  function addSchema(calc){
    const id='wa-webapplication-schema';let node=document.getElementById(id);if(!node){node=document.createElement('script');node.type='application/ld+json';node.id=id;document.head.appendChild(node);}
    const canonical=`https://wealtharrays.com/${calc.slug||calc.id}/`;
    node.textContent=JSON.stringify({'@context':'https://schema.org','@type':'WebApplication','name':calc.title,'applicationCategory':'FinanceApplication','operatingSystem':'Any','isAccessibleForFree':true,'description':calc.desc||calc.short||'Free financial calculator from Wealth Arrays.','url':canonical,'provider':{'@type':'Organization','name':'Wealth Arrays','url':'https://wealtharrays.com/'}});
  }
  function enhance(calc){
    const host=document.getElementById('calc-widget');if(!host||!calc)return;
    addSchema(calc);addExportControls(calc,host);renderChart(calc,host);
    const observer=new MutationObserver(()=>renderChart(calc,host));observer.observe(host,{childList:true,subtree:true});
    setTimeout(()=>renderChart(calc,host),100);
  }
  window.WA_CALCULATOR_ENHANCEMENTS={enhance,downloadCsv};
})();
