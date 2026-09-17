/* Wealth Arrays production hotfix: runs independently of the generated bundle. */
(function(){
  'use strict';
  if(window.__WA_PRODUCTION_HOTFIX__)return;
  window.__WA_PRODUCTION_HOTFIX__=true;
  function dedupeHeader(){
    const controls=document.querySelector('.masthead-controls');
    if(!controls)return;
    const currencies=[...document.querySelectorAll('#currency-select')];
    currencies.slice(1).forEach(el=>el.remove());
    const languages=[...document.querySelectorAll('#language-select')];
    languages.forEach(el=>{if(!el.options.length)el.remove()});
    const themes=[...document.querySelectorAll('#theme-toggle')];
    themes.slice(1).forEach(el=>el.remove());
    const selects=[...controls.querySelectorAll('select')];
    selects.forEach(el=>{if(el.id!=='currency-select'&&el.id!=='language-select')el.remove()});
  }
  function load(src,key){
    if(document.querySelector('script[data-wa-hotfix="'+key+'"]'))return;
    const s=document.createElement('script');s.src=src;s.dataset.waHotfix=key;s.defer=true;document.head.appendChild(s);
  }
  function boot(){
    dedupeHeader();
    const path=location.pathname;
    if(path==='/tools'||path==='/tools/'||path.endsWith('/tools.html')||document.querySelector('.calc-page')){
      load('/calculator-search.js?v=20260918','calculator-search');
    }
    if(document.querySelector('.calc-page'))load('/pdf-export-fix.js?v=20260918','pdf-export');
    if(window.MutationObserver){
      let queued=false;
      new MutationObserver(()=>{
        if(queued)return;queued=true;
        requestAnimationFrame(()=>{queued=false;dedupeHeader()});
      }).observe(document.documentElement,{childList:true,subtree:true});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
