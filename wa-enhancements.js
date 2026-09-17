/* Wealth Arrays UX enhancements — live calculation hardening. */
(function(){
  'use strict';
  function liveCalculator(){
    let timer=0;
    const isControl=target=>target&&target.matches&&target.matches('#calc-widget input,#calc-widget select,#calc-widget textarea');
    const trigger=()=>{
      const root=document.getElementById('calc-widget');
      if(!root)return;
      const button=Array.from(root.querySelectorAll('button')).find(item=>/^(calculate|recalculate|update|compute|show result|calculate now)/i.test((item.textContent||'').trim())||item.dataset.action==='calculate');
      if(button&&!button.disabled)button.click();
    };
    const schedule=()=>{clearTimeout(timer);timer=setTimeout(trigger,40)};
    document.addEventListener('input',event=>{if(isControl(event.target))schedule()},true);
    document.addEventListener('change',event=>{if(isControl(event.target))schedule()},true);
    [250,700,1400].forEach(delay=>setTimeout(trigger,delay));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',liveCalculator,{once:true});else liveCalculator();
})();
