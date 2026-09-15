/* CSP-friendly calculator page bootstrap. */
(function(){
  'use strict';
  function mount(){
    if(typeof window.mountCalculator!=='function') return;
    var host=document.getElementById('calc-widget');
    var id=document.documentElement.getAttribute('data-wa-calculator');
    if(!host||!id||typeof window.CALCULATORS==='undefined') return;
    var def=window.CALCULATORS.find(function(c){return c.id===id;});
    if(def) window.mountCalculator(def,'calc-widget');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true}); else mount();
})();
