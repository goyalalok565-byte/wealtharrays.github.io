/* Wealth Arrays — direct PDF download layer.
 * Keeps the existing calculator report data and live SVG graph/pie chart.
 * No print dialog, no text-only fallback, no external libraries.
 */
(function(){
  'use strict';
  if(window.__WA_DIRECT_PDF_EXPORT__)return;
  window.__WA_DIRECT_PDF_EXPORT__=true;

  const escText=v=>String(v??'')
    .replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)')
    .replace(/[\\u0080-\\uFFFF]/g,'?');
  const pdfText=v=>String(v??'')
    .replace(/₹/g,'INR ').replace(/€/g,'EUR ').replace(/£/g,'GBP ')
    .replace(/¥/g,'JPY ').replace(/₩/g,'KRW ').replace(/﷼/g,'SAR ')
    .replace(/₺/g,'TRY ').replace(/₽/g,'RUB ').replace(/₦/g,'NGN ')
    .replace(/[^\\x20-\\x7E]/g,'?');

  function bytesFromBase64(data){
    const raw=atob(data), out=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);
    return out;
  }
  function joinBytes(parts){
    let n=0;parts.forEach(p=>n+=p.length);
    const out=new Uint8Array(n);let o=0;
    parts.forEach(p=>{out.set(p,o);o+=p.length;});
    return out;
  }
  function ascii(s){return new TextEncoder().encode(s);}
  function pdfObject(body){return ascii(body);}
  function lineWrap(value,max){
    const words=pdfText(value).split(/\\s+/), lines=[];let line='';
    words.forEach(w=>{
      if(!w)return;
      const next=line?line+' '+w:w;
      if(next.length>max&&line){lines.push(line);line=w;}else line=next;
    });
    if(line||!lines.length)lines.push(line);
    return lines;
  }

  function makePdf(calc,values,results,chartData){
    const W=595,H=842,M=42,CW=W-M*2;
    const pages=[],current=[];
    let y=H-48;

    function newPage(){if(current.length)pages.push(current.splice(0));y=H-48;}
    function ensure(h){if(y-h<42)newPage();}
    function txt(text,size=10,bold=false){
      const lines=lineWrap(text,Math.max(24,Math.floor(CW/(size*.53))));
      lines.forEach((line,i)=>{
        ensure(size+7);current.push(`BT /F${bold?2:1} ${size} Tf ${M} ${y} Td (\${escText(line)}) Tj ET`);y-=size+7;
      });y-=2;
    }
    function centered(text,size=9,bold=false){
      const t=pdfText(text),w=t.length*size*.5;
      ensure(size+7);current.push(`BT /F${bold?2:1} ${size} Tf ${Math.max(M,(W-w)/2)} ${y} Td (\${escText(t)}) Tj ET`);y-=size+7;
    }
    function rule(){ensure(12);current.push(`0.88 0.89 0.92 RG 0.7 w ${M} ${y} m ${W-M} ${y} l S`);y-=14;}
    function table(title,rows){
      ensure(34);txt(title,15,true);y-=3;
      const rowH=24;
      rows.forEach((r,i)=>{
        ensure(rowH+2);
        if(i%2===0){current.push(`0.97 0.98 0.99 rg ${M} ${y-rowH+5} ${CW} ${rowH} re f`);}
        current.push(`0.86 0.88 0.91 RG 0.5 w ${M} ${y-rowH+5} ${CW} ${rowH} re S`);
        const left=pdfText(r[0]),right=pdfText(r[1]);
        current.push(`BT /F1 9 Tf ${M+8} ${y-11} Td (\${escText(left.slice(0,70))}) Tj ET`);
        const rw=Math.min(230,right.length*4.7);
        current.push(`BT /F2 9 Tf ${W-M-8-rw} ${y-11} Td (\${escText(right.slice(0,50))}) Tj ET`);
        y-=rowH;
      });
      y-=10;
    }

    centered('WEALTH ARRAYS',18,true);centered('CALCULATION REPORT',8,true);rule();
    txt(calc.title,21,true);txt('Generated from the assumptions you entered.',9,false);y-=4;

    table('Your inputs',calc.fields.map(f=>[f.label,values[f.id]??'']));
    table('Your calculated results',results.map(r=>[r.label,window.waFormatValue?window.waFormatValue(r.value,r.format):r.value]));

    if(chartData){
      ensure(270);txt(chartData.kind==='pie'?'Result breakdown':'Calculation summary',15,true);
      txt(chartData.kind==='pie'?'Visualised from the same calculation shown on the calculator page.':'Bars use the actual calculated values from this calculator.',9,false);
      y-=4;
      const imgW=Math.min(CW,430),imgH=chartData.height?imgW*chartData.height/chartData.width:220;
      ensure(imgH+18);
      chartData._place={x:(W-imgW)/2,y:y-imgH,w:imgW,h:imgH};
      current.push('IMAGE_PLACEHOLDER');
      y-=imgH+18;
    }
    txt('Educational estimate only. Not financial, tax, legal or investment advice.',8,false);
    if(current.length)pages.push(current.splice(0));

    const objects=[null,pdfObject('<< /Type /Catalog /Pages 2 0 R >>'),null];
    const pageNums=[],contentNums=[],imageNums=[];
    const font1=objects.length;objects.push(pdfObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'));
    const font2=objects.length;objects.push(pdfObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'));
    let imgBytes=null,imgW=0,imgH=0;
    if(chartData&&chartData.base64){imgBytes=bytesFromBase64(chartData.base64);imgW=chartData.width;imgH=chartData.height;}
    const imgObj=imgBytes?objects.length:null;
    if(imgBytes)objects.push(null);

    pages.forEach((cmds,pi)=>{
      const pageNo=objects.length;pageNums.push(pageNo);objects.push(null);
      const contentNo=objects.length;contentNums.push(contentNo);objects.push(null);
      if(imgBytes&&pi===0){imageNums[pi]=imgObj;}
    });
    const pagesObj=objects.length;objects[2]=null;objects[2]=pdfObject('<< /Type /Pages /Kids ['+pageNums.map(n=>n+' 0 R').join(' ') + '] /Count '+pages.length+' >>');

    if(imgBytes){
      objects[imgObj]=joinBytes([ascii(`<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>\\nstream\\n`),imgBytes,ascii('\\nendstream')]);
    }

    pages.forEach((cmds,pi)=>{
      const commands=cmds.map(c=>{
        if(c!=='IMAGE_PLACEHOLDER')return c;
        const pos=chartData._place;
        return `q ${pos.w} 0 0 ${pos.h} ${pos.x} ${pos.y} cm /Im1 Do Q`;
      }).join('\\n')+'\\n';
      const cb=ascii(commands);
      objects[contentNums[pi]]=joinBytes([ascii(`<< /Length ${cb.length} >>\\nstream\\n`),cb,ascii('endstream')]);
      const xobj=imgBytes?' /XObject << /Im1 '+imgObj+' 0 R >>':'';
      objects[pageNums[pi]]=pdfObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 ${font1} 0 R /F2 ${font2} 0 R >>${xobj} >> /Contents ${contentNums[pi]} 0 R >>`);
    });

    const chunks=[ascii('%PDF-1.4\\n%\\xFF\\xFF\\xFF\\xFF\\n')],offsets=[0];let offset=chunks[0].length;
    for(let i=1;i<objects.length;i++){
      offsets[i]=offset;
      const head=ascii(i+' 0 obj\\n'),tail=ascii('\\nendobj\\n');
      chunks.push(head,objects[i],tail);offset+=head.length+objects[i].length+tail.length;
    }
    const xref=offset;
    chunks.push(ascii('xref\\n0 '+objects.length+'\\n0000000000 65535 f \\n'));
    for(let i=1;i<objects.length;i++)chunks.push(ascii(String(offsets[i]).padStart(10,'0')+' 00000 n \\n'));
    chunks.push(ascii(`trailer\\n<< /Size ${objects.length} /Root 1 0 R >>\\nstartxref\\n${xref}\\n%%EOF`));
    return joinBytes(chunks);
  }

  async function svgToJpeg(svg){
    if(!svg)return null;
    const clone=svg.cloneNode(true);
    clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
    clone.setAttribute('width','520');clone.setAttribute('height','320');
    clone.setAttribute('viewBox',svg.getAttribute('viewBox')||'0 0 100 100');
    const xml=new XMLSerializer().serializeToString(clone);
    const blob=new Blob([xml],{type:'image/svg+xml;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    try{
      const img=await new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=url;});
      const canvas=document.createElement('canvas');canvas.width=1040;canvas.height=640;
      const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
      const data=canvas.toDataURL('image/jpeg',0.94).split(',')[1];
      return {base64:data,width:canvas.width,height:canvas.height};
    }finally{URL.revokeObjectURL(url);}
  }

  function valuesFor(calc){
    const values={};
    calc.fields.forEach(f=>{
      const el=document.getElementById('f-'+f.id)||document.querySelector('[name="'+CSS.escape(f.id)+'"]');
      if(el)values[f.id]=f.type==='select'?el.value:(String(el.value).trim()===''?NaN:Number(el.value));
    });
    return values;
  }
  function getCalc(id){
    const list=window.CALCULATORS||[];
    return list.find(c=>c.id===id)||list.find(c=>c.slug===id);
  }
  async function download(calc,values,results){
    const graph=document.querySelector('.wa-portfolio-card svg');
    const chart=graph?await svgToJpeg(graph):null;
    const pdf=makePdf(calc,values,results,chart);
    const blob=new Blob([pdf],{type:'application/pdf'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=(calc.slug||calc.id||'wealth-arrays')+'-report.pdf';
    a.style.display='none';document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),3000);
  }

  window.waOpenPrintReport=download;
  window.WA_DIRECT_PDF_EXPORT={download};
})();
