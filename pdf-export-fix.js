/* Wealth Arrays — canonical direct PDF download fix.
   Generates a real PDF Blob in-browser instead of opening the print dialog.
   This is intentionally self-contained: no CDN, popup, print-preview, or external library.
*/
(function(){
  'use strict';
  if(window.__WA_PDF_EXPORT_FIX__)return;
  window.__WA_PDF_EXPORT_FIX__=true;

  const escHtml=v=>String(v??'').replace(/[&<>\\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\"':'&quot;',"'":'&#39;'}[c]));
  const pdfText=v=>String(v??'')
    .replace(/₹/g,'INR ')
    .replace(/€/g,'EUR ')
    .replace(/£/g,'GBP ')
    .replace(/¥/g,'JPY ')
    .replace(/[“”„]/g,'"')
    .replace(/[‘’]/g,"'")
    .replace(/[–—]/g,'-')
    .replace(/×/g,'x')
    .replace(/→/g,'->')
    .replace(/…/g,'...')
    .replace(/[^\\x20-\\x7E\\r\\n]/g,'');

  const format=(v,f)=>window.waFormatValue?window.waFormatValue(v,f):String(v??'');

  function wrap(text,max){
    const words=pdfText(text).split(/\\s+/).filter(Boolean);
    const lines=[];let line='';
    for(const word of words){
      if((line+' '+word).trim().length>max&&line){lines.push(line);line=word;}
      else line=(line+' '+word).trim();
    }
    if(line)lines.push(line);
    return lines.length?lines:[''];
  }

  function makePdf(calc,values,results){
    const lines=[];
    const add=(text,bold=false)=>wrap(text,92).forEach(line=>lines.push({text,bold}));
    add('WEALTH ARRAYS',true);
    add('CALCULATION REPORT');
    add(calc.title,true);
    add('Generated from the assumptions you entered.');
    add('');
    add('YOUR INPUTS',true);
    calc.fields.forEach(f=>add(f.label+': '+(values[f.id]??'')));
    add('');
    add('YOUR CALCULATED RESULTS',true);
    results.forEach(r=>add(r.label+': '+format(r.value,r.format)));
    add('');
    add('Educational estimate only. Not financial, tax, legal or investment advice.');
    const pageHeight=720, top=750, bottom=54, lineHeight=14, linesPerPage=Math.floor((top-bottom)/lineHeight);
    const pages=[];
    for(let i=0;i<lines.length;i+=linesPerPage)pages.push(lines.slice(i,i+linesPerPage));
    const objects=[];
    const pageIds=[];
    const contentIds=[];
    const fontId=3;
    objects[1]='<< /Type /Catalog /Pages 2 0 R >>';
    objects[2]='<< /Type /Pages /Kids [PAGE_IDS] /Count '+pages.length+' >>';
    objects[3]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
    pages.forEach((page,index)=>{
      const pageId=4+index*2, contentId=pageId+1;
      pageIds.push(pageId+' 0 R');contentIds.push(contentId+' 0 R');
      const commands=['BT','/'+(page.some(x=>x.bold)?'F1':'F1')+' 10 Tf','1 0 0 1 50 750 Tm'];
      let y=750;
      for(const item of page){
        const size=item.bold?12:10;
        commands.push('/F1 '+size+' Tf');
        if(y!==750)commands.push('0 -'+lineHeight+' Td');
        commands.push('('+pdfText(item.text).replace(/([\\()\\])/g,'\\$1')+') Tj');
        y-=lineHeight;
      }
      commands.push('ET');
      const stream=commands.join('\\n')+'\\n';
      objects[pageId]='<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 '+fontId+' 0 R >> >> /Contents '+contentId+' 0 R >>';
      objects[contentId]='<< /Length '+stream.length+' >>\\nstream\\n'+stream+'endstream';
    });
    objects[2]=objects[2].replace('PAGE_IDS',pageIds.join(' '));
    let pdf='%PDF-1.4\\n%\\xE2\\xE3\\xCF\\xD3\\n';
    const offsets=[0];
    for(let i=1;i<objects.length;i++){
      offsets[i]=pdf.length;
      pdf+=i+' 0 obj\\n'+objects[i]+'\\nendobj\\n';
    }
    const xref=pdf.length;
    pdf+='xref\\n0 '+objects.length+'\\n0000000000 65535 f \\n';
    for(let i=1;i<objects.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \\n';
    pdf+='trailer\\n<< /Size '+objects.length+' /Root 1 0 R >>\\nstartxref\\n'+xref+'\\n%%EOF';
    return new Blob([pdf],{type:'application/pdf'});
  }

  function findCalculator(id){
    const list=window.CALCULATORS||[];
    return list.find(c=>c.id===id)||list.find(c=>c.slug===id);
  }

  function readCurrent(calc){
    const values={};
    calc.fields.forEach(f=>{
      const el=document.getElementById('f-'+f.id)||document.querySelector('[name="'+CSS.escape(f.id)+'"]')||document.querySelector('[data-field="'+CSS.escape(f.id)+'"]');
      if(!el)return;
      values[f.id]=f.type==='select'?el.value:(String(el.value).trim()===''?NaN:Number(el.value));
    });
    return values;
  }

  function compute(calc,values){
    try{return calc.compute(values)||[];}catch(e){console.error('PDF export calculation failed',e);return[];}
  }

  function download(calc,values,results){
    if(!results.length){
      alert('Please calculate your result first, then export the PDF report.');
      return;
    }
    const blob=makePdf(calc,values,results);
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    const slug=calc.slug||calc.id||'wealth-arrays';
    a.href=url;
    a.download=slug+'-report.pdf';
    a.style.display='none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  }

  window.waDownloadPdfReport=function(calc,values,results){
    if(!calc)return;
    download(calc,values||readCurrent(calc),results||compute(calc,values||readCurrent(calc)));
  };

  document.addEventListener('click',function(event){
    const button=event.target.closest('button,a,[role="button"]');
    if(!button)return;
    const label=((button.textContent||'')+' '+(button.id||'')+' '+(button.getAttribute('data-action')||'')).trim();
    if(!/\\b(pdf|print report|export report)\\b/i.test(label)&&!/pdf|export/i.test(label))return;
    if(button.classList.contains('no-print'))return;
    const id=document.documentElement.dataset.waCalculator||'';
    const calc=findCalculator(id);
    if(!calc)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const values=readCurrent(calc);
    const results=compute(calc,values);
    download(calc,values,results);
  },true);
})();
