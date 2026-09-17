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
