/* Wealth Arrays — deterministic PDF download.
 * Generates the same report data directly in a real PDF Blob.
 * The chart is drawn as PDF vector geometry, so pie charts survive export
 * without print dialogs, async image conversion, or external libraries.
 */
(function(){
  'use strict';
  if(window.__WA_DIRECT_PDF_EXPORT__)return;
  window.__WA_DIRECT_PDF_EXPORT__=true;

  const text=v=>String(v??'')
    .replace(/₹/g,'INR ').replace(/€/g,'EUR ').replace(/£/g,'GBP ')
    .replace(/¥/g,'JPY ').replace(/₩/g,'KRW ').replace(/₺/g,'TRY ')
    .replace(/₽/g,'RUB ').replace(/₦/g,'NGN ')
    .replace(/[^\x20-\x7E]/g,'?');

  const esc=v=>text(v).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
  const enc=s=>new TextEncoder().encode(s);
  const join=parts=>{let n=0;parts.forEach(p=>n+=p.length);const o=new Uint8Array(n);let at=0;parts.forEach(p=>{o.set(p,at);at+=p.length});return o};

  function fmt(r){
    const n=Number(r?.value);
    if(!Number.isFinite(n))return '—';
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
    if(calc.id==='sip'||calc.id==='investment'){
      const inv=row(/you put in|invested amount/i),gain=row(/growth|profit|returns/i);
      if(inv&&gain)parts=[p('Money invested',inv.value),p('Growth / returns',gain.value)];
    }else if(calc.id==='compound-interest'||calc.id==='lumpsum'||calc.id==='fixed-deposit'){
      const t=total(),i=row(/interest earned|growth|returns/i);
      if(t&&i)parts=[p('Original investment',num(t.value)-num(i.value)),p('Growth / interest',i.value)];
    }else if(calc.id==='recurring-deposit'){
      const t=total(),invested=num(values.monthly)*12*num(values.years);
      if(t)parts=[p('Money deposited',invested),p('Interest earned',num(t.value)-invested)];
    }else if(['mortgage','car-loan','personal-loan'].includes(calc.id)){
      const repay=row(/total repayment/i),interest=row(/total interest/i);
      if(repay&&interest)parts=[p('Loan amount',num(repay.value)-num(interest.value)),p('Total interest',interest.value)];
    }else if(calc.id==='simple-interest'){
      const t=row(/total amount/i),i=row(/^interest$/i);
      if(t&&i)parts=[p('Original amount',num(t.value)-num(i.value)),p('Interest',i.value)];
    }else if(calc.id==='roi'){
      const cost=num(values.cost),finalValue=num(values.finalValue);
      if(finalValue>=cost&&cost>0)parts=[p('Original investment',cost),p('Profit',finalValue-cost)];
    }else if(calc.id==='profit-margin'){
      const revenue=num(values.revenue),cogs=num(values.cogs),expenses=num(values.expenses),net=revenue-cogs-expenses;
      if(revenue>0&&net>=0)parts=[p('Cost of goods',cogs),p('Operating expenses',expenses),p('Net profit',net)];
    }else if(calc.id==='net-worth'){
      const assets=num(values.cash)+num(values.investments)+num(values.property),debt=num(values.debt);
      if(assets>0)parts=[p('Cash',values.cash),p('Investments',values.investments),p('Property',values.property),p('Debt reduction',Math.min(debt,assets))].filter(x=>x.value>0);
    }else if(calc.id==='overtime'){
      const regular=row(/regular pay/i),overtime=row(/overtime pay/i);
      if(regular&&overtime)parts=[p('Regular pay',regular.value),p('Overtime pay',overtime.value)];
    }else if(calc.id==='debt-payoff'){
      const balance=num(values.balance),interest=Math.max(0,num(row(/total interest/i)?.value));
      if(balance>0&&interest>=0)parts=[p('Debt principal',balance),p('Estimated interest',interest)];
    }else if(calc.id==='income-tax-planner'){
      const income=num(values.income),tax=Math.max(0,num(row(/tax/i)?.value));
      if(income>0)parts=[p('Tax',Math.min(tax,income)),p('After-tax income',Math.max(0,income-tax))];
    }
    if(!parts||parts.length<2||parts.some(x=>x.value<0)||parts.reduce((s,x)=>s+x.value,0)<=0)return null;
    return parts;
  }

  function makePdf(calc,values,results){
    const W=595,H=842,M=42,CW=W-M*2;
    const pages=[],cmd=[];let y=H-46;
    const flush=()=>{if(cmd.length)pages.push(cmd.splice(0));y=H-46};
    const ensure=h=>{if(y-h<42)flush()};
    const line=(s,size=9,bold=false)=>{
      const words=text(s).split(/\s+/);let cur='',lines=[];
      words.forEach(w=>{const next=cur?cur+' '+w:w;if(next.length>Math.max(30,Math.floor(CW/(size*.52)))&&cur){lines.push(cur);cur=w}else cur=next});
      if(cur||!lines.length)lines.push(cur);
      lines.forEach(v=>{ensure(size+8);cmd.push('BT /F'+(bold?2:1)+' '+size+' Tf '+M+' '+y+' Td ('+esc(v)+') Tj ET');y-=size+8});
      y-=2;
    };
    const center=(s,size=9,bold=false)=>{const v=text(s),w=v.length*size*.5;ensure(size+8);cmd.push('BT /F'+(bold?2:1)+' '+size+' Tf '+Math.max(M,(W-w)/2)+' '+y+' Td ('+esc(v)+') Tj ET');y-=size+8};
    const table=(title,rows)=>{
      ensure(38);line(title,15,true);y-=2;
      rows.forEach((r,i)=>{
        ensure(25);
        if(i%2===0)cmd.push('0.97 0.98 0.99 rg '+M+' '+(y-19)+' '+CW+' 23 re f');
        cmd.push('0.86 0.88 0.91 RG 0.5 w '+M+' '+(y-19)+' '+CW+' 23 re S');
        const a=text(r[0]).slice(0,68),b=text(r[1]).slice(0,48),rw=Math.min(220,b.length*4.5);
        cmd.push('BT /F1 9 Tf '+(M+8)+' '+(y-13)+' Td ('+esc(a)+') Tj ET');
        cmd.push('BT /F2 9 Tf '+(W-M-8-rw)+' '+(y-13)+' Td ('+esc(b)+') Tj ET');
        y-=23;
      });
      y-=9;
    };
    const pie=(parts)=>{
      ensure(290);line('Result breakdown',15,true);line('The same genuine components shown by the calculator pie chart.',9,false);y-=4;
      const cx=W/2,cy=y-118,r=86,total=parts.reduce((s,p)=>s+p.value,0);
      const rgb=['0.15 0.39 0.92','0.08 0.72 0.65','0.49 0.24 0.93','0.96 0.62 0.04'];
      let angle=-Math.PI/2;
      parts.forEach((p,i)=>{
        const end=angle+(p.value/total)*Math.PI*2;
        const pts=[[cx,cy]];
        const steps=Math.max(8,Math.ceil(Math.abs(end-angle)*18));
        for(let k=0;k<=steps;k++){const a=angle+(end-angle)*k/steps;pts.push([cx+r*Math.cos(a),cy+r*Math.sin(a)])}
        cmd.push(rgb[i%rgb.length]+' rg');
        cmd.push(pts.map((q,j)=>(j?'L ':'M ')+q[0].toFixed(2)+' '+q[1].toFixed(2)).join(' ')+' h f');
        angle=end;
      });
      let ly=cy-r+8;
      parts.forEach((p,i)=>{
        const pct=p.value/total*100;
        cmd.push(rgb[i%rgb.length]+' rg '+(M)+' '+(ly-3)+' 9 9 re f');
        cmd.push('BT /F1 8 Tf '+(M+15)+' '+ly+' Td ('+esc(p.label)+' — '+esc(fmt({value:p.value,format:'currency'}))+' — '+pct.toFixed(pct<10?1:0)+'%) Tj ET');
        ly-=18;
      });
      y=cy-r-12;
    };
    const bars=(rows)=>{
      ensure(260);line('Calculation summary',15,true);line('The bars use the actual calculated values.',9,false);y-=5;
      const numeric=rows.filter(r=>Number.isFinite(Number(r.value))&&Number(r.value)>=0).slice(0,6),max=Math.max(...numeric.map(r=>Number(r.value)),1);
      numeric.forEach(r=>{
        ensure(30);const label=text(r.label).slice(0,30),v=Number(r.value),bw=250*v/max;
        cmd.push('0.92 0.93 0.95 rg '+(M+145)+' '+(y-8)+' 250 10 re f');
        cmd.push('0.15 0.39 0.92 rg '+(M+145)+' '+(y-8)+' '+Math.max(4,bw).toFixed(1)+' 10 re f');
        cmd.push('BT /F1 8 Tf '+M+' '+(y-6)+' Td ('+esc(label)+') Tj ET');
        cmd.push('BT /F2 8 Tf '+(M+405)+' '+(y-6)+' Td ('+esc(fmt(r))+') Tj ET');
        y-=27;
      });
      y-=8;
    };

    center('WEALTH ARRAYS',18,true);center('CALCULATION REPORT',8,true);
    cmd.push('0.86 0.88 0.91 RG 0.7 w '+M+' '+y+' m '+(W-M)+' '+y+' l S');y-=16;
    line(calc.title,21,true);line('Generated from the assumptions you entered.',9);y-=3;
    table('Your inputs',calc.fields.map(f=>[f.label,values[f.id]??'']));
    table('Your calculated results',results.map(r=>[r.label,fmt(r)]));
    const parts=partsFor(calc,values,results);
    if(parts)pie(parts);else bars(results);
    line('Educational estimate only. Not financial, tax, legal or investment advice.',8);
    flush();

    const objects=[null,enc('<< /Type /Catalog /Pages 2 0 R >>'),null];
    const f1=objects.length;objects.push(enc('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'));
    const f2=objects.length;objects.push(enc('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'));
    const pageRefs=[],contentRefs=[];
    pages.forEach(c=>{
      const p=objects.length;pageRefs.push(p);objects.push(null);
      const co=objects.length;contentRefs.push(co);
      const body=enc(c.join('\n')+'\n');objects.push(join([enc('<< /Length '+body.length+' >>\nstream\n'),body,enc('endstream')]));
    });
    objects[2]=enc('<< /Type /Pages /Kids ['+pageRefs.map(n=>n+' 0 R').join(' ')+'] /Count '+pageRefs.length+' >>');
    pageRefs.forEach((p,i)=>{objects[p]=enc('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+W+' '+H+'] /Resources << /Font << /F1 '+f1+' 0 R /F2 '+f2+' 0 R >> >> /Contents '+contentRefs[i]+' 0 R >>')});

    const chunks=[enc('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n')],off=[0];let pos=chunks[0].length;
    for(let i=1;i<objects.length;i++){off[i]=pos;const h=enc(i+' 0 obj\n'),t=enc('\nendobj\n');chunks.push(h,objects[i],t);pos+=h.length+objects[i].length+t.length}
    const xref=pos;chunks.push(enc('xref\n0 '+objects.length+'\n0000000000 65535 f \n'));
    for(let i=1;i<objects.length;i++)chunks.push(enc(String(off[i]).padStart(10,'0')+' 00000 n \n'));
    chunks.push(enc('trailer\n<< /Size '+objects.length+' /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF'));
    return join(chunks);
  }

  function download(calc,values,results){
    const pdf=makePdf(calc,values,results);
    const blob=new Blob([pdf],{type:'application/pdf'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=(calc.slug||calc.id||'wealth-arrays')+'-report.pdf';a.rel='noopener';a.style.display='none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),5000);
  }
  window.waOpenPrintReport=download;
  window.WA_DIRECT_PDF_EXPORT={download};
})();