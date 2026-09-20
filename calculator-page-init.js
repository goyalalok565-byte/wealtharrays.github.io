/* CSP-friendly calculator page bootstrap. */
(function(){
  'use strict';
  function mount(){
    if(typeof window.mountCalculator!=='function') return;
    var host=document.getElementById('calc-widget');
    var id=document.documentElement.getAttribute('data-wa-calculator');
    if(!id && host){ id=new URLSearchParams(location.search).get('calc')||''; }
    if(!host||!id||host.dataset.waBooted==='1'||typeof window.CALCULATORS==='undefined') return;
    var def=window.CALCULATORS.find(function(c){return c.id===id;});
    if(def){
      host.dataset.waBooted='1';
      window.mountCalculator(def,'calc-widget');
      /* NOTE: WA_CALCULATOR_ENHANCEMENTS.enhance() is intentionally NOT called here.
       * It re-mounted the calculator a second time and injected a duplicate
       * "Download PDF"/"Download CSV" button that recomputed results directly
       * from raw (possibly empty/unvalidated) DOM input values instead of the
       * actually-displayed, Calculate-button-gated results — producing PDFs
       * that silently disagreed with what was on screen. The widget's own
       * built-in "Export PDF report" button (which uses the real computed
       * results) is the only calculator PDF export path. */
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true}); else mount();
})();
