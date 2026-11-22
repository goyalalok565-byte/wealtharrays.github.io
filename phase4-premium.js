/* Wealth Arrays Phase 4 — accessibility, performance and premium UX guardrails. */
(function(){
  'use strict';
  function ready(fn){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn,{once:true}); else fn(); }
  function addSkip(){
    if(document.querySelector('.wa-skip-link')) return;
    var main=document.querySelector('main'); if(!main) return;
    if(!main.id) main.id='main-content';
    var a=document.createElement('a'); a.className='wa-skip-link'; a.href='#'+main.id; a.textContent='Skip to main content';
    document.body.insertBefore(a,document.body.firstChild);
  }
  function improveControls(){
    document.querySelectorAll('input,select,textarea').forEach(function(el){
      if(!el.getAttribute('aria-label') && !el.id){ el.setAttribute('aria-label','Financial calculator input'); }
    });
    document.querySelectorAll('button').forEach(function(b){
      if(!b.getAttribute('aria-label') && !b.textContent.trim() && !b.title) b.setAttribute('aria-label','Button');
    });
  }
  function dedupeSharedControls(){
    var controls=document.querySelector('.masthead-controls');
    if(!controls)return;
    ['currency-select','language-select','theme-toggle'].forEach(function(id){
      var nodes=Array.prototype.slice.call(controls.querySelectorAll('#'+id));
      if(nodes.length<2)return;
      var keep=nodes.find(function(n){return n.offsetParent!==null})||nodes[0];
      nodes.forEach(function(n){if(n!==keep)n.remove();});
    });
    var seen={};
    Array.prototype.slice.call(controls.children).forEach(function(node){
      var key=node.querySelector?.('#currency-select')?'currency':node.querySelector?.('#language-select')?'language':node.querySelector?.('#theme-toggle')?'theme':'';
      if(key){if(seen[key])node.remove();else seen[key]=true;}
    });
  }
  function announceErrors(){
    document.querySelectorAll('.calc-error,[role="alert"]').forEach(function(el){ el.setAttribute('aria-live','polite'); });
  }
  function observeVitals(){
    if(!('PerformanceObserver' in window)) return;
    try{
      new PerformanceObserver(function(list){
        list.getEntries().forEach(function(e){
          if(e.entryType==='largest-contentful-paint' && e.startTime>2500) document.documentElement.dataset.waLcp='slow';
        });
      }).observe({type:'largest-contentful-paint',buffered:true});
    }catch(e){}
  }
  function externalLinks(){
    document.querySelectorAll('a[target="_blank"]').forEach(function(a){
      var rel=(a.getAttribute('rel')||'').split(/\s+/).filter(Boolean);
      if(rel.indexOf('noopener')<0) rel.push('noopener');
      if(rel.indexOf('noreferrer')<0) rel.push('noreferrer');
      a.setAttribute('rel',rel.join(' '));
    });
  }
  ready(function(){
    addSkip();
    dedupeSharedControls();
    improveControls();
    announceErrors();
    externalLinks();
    observeVitals();
    // Only watch the header control cluster. Observing the whole document body
    // reruns header deduplication for unrelated calculator, search and consent mutations.
    var mastheadControls=document.querySelector('.masthead-controls');
    if(mastheadControls&&window.MutationObserver){
      var pending=false;
      new MutationObserver(function(){
        if(pending)return;
        pending=true;
        requestAnimationFrame(function(){pending=false;dedupeSharedControls();});
      }).observe(mastheadControls,{childList:true,subtree:true});
    }
  });
})();
