/* Wealth Arrays UX enhancements — live calculation/PDF hardening. */
(function(){
  'use strict';
  function liveCalculator(){let timer=0;const isControl=target=>target&&target.matches&&target.matches('#calc-widget input,#calc-widget select,#calc-widget textarea');const trigger=()=>{const root=document.getElementById('calc-widget');if(!root)return;const button=Array.from(root.querySelectorAll('button')).find(item=>/^(calculate|recalculate|update|compute|show result|calculate now)/i.test((item.textContent||'').trim())||item.dataset.action==='calculate');if(button&&!button.disabled)button.click()};const schedule=()=>{clearTimeout(timer);timer=setTimeout(trigger,40)};document.addEventListener('input',event=>{if(isControl(event.target))schedule()},true);document.addEventListener('change',event=>{if(isControl(event.target))schedule()},true);[250,700,1400].forEach(delay=>setTimeout(trigger,delay))}
  function patchPdfLogo(){
    if(window.waPdfLogoPatched||typeof window.waOpenPrintReport!=='function')return;
    window.waPdfLogoPatched=true;
    const original=window.waOpenPrintReport;
    window.waOpenPrintReport=function(calc,values,results){
      const oldOpen=window.open;
      window.open=function(){
        const win=oldOpen.apply(window,arguments);
        if(win&&win.document){
          const oldWrite=win.document.write.bind(win.document);
          win.document.write=function(html){
            const brand='<div class="pdf-brand"><img alt="Wealth Arrays logo" src="/favicon-v3.svg"><span>WEALTH ARRAYS</span></div>';
            html=String(html).replace('<div class="brand">WEALTH ARRAYS · CALCULATION REPORT</div>',brand);
            html=html.replace('</style>','.pdf-brand{display:flex;align-items:center;gap:10px;margin-bottom:14px;font-weight:800;letter-spacing:.08em;color:#475467}.pdf-brand img{width:52px;height:52px;display:block;object-fit:contain}.pdf-brand span{font-size:13px}</style>');
            oldWrite(html);
          };
          const oldClose=win.document.close.bind(win.document);
          win.document.close=function(){oldClose();setTimeout(()=>{try{const imgs=Array.from(win.document.images);Promise.all(imgs.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=img.onerror=resolve}))).then(()=>{win.focus();win.print()})}catch(e){}},180)};
        }
        return win;
      };
      try{return original(calc,values,results)}finally{setTimeout(()=>{window.open=oldOpen},0)}
    };
  }
  function start(){liveCalculator();patchPdfLogo();setTimeout(patchPdfLogo,300);setTimeout(patchPdfLogo,900)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
