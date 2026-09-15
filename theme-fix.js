/* Wealth Arrays global theme controller — works on every page, including calculator pages. */
(function(){
  'use strict';
  var KEY='waTheme';
  var REMOVED=['step-up-sip-calculator.html','emergency-fund-calculator.html','real-return-calculator.html'];
  function read(){try{return localStorage.getItem(KEY)==='dark'?'dark':'light'}catch(e){return document.documentElement.dataset.theme==='dark'?'dark':'light'}}
  function write(v){try{localStorage.setItem(KEY,v)}catch(e){}}
  function paint(v){
    v=v==='dark'?'dark':'light';
    document.documentElement.dataset.theme=v;
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',v==='dark'?'#080a0f':'#f7f8fb');
    document.querySelectorAll('#theme-toggle,.theme-toggle').forEach(function(button){
      button.setAttribute('aria-pressed',String(v==='dark'));
      button.setAttribute('aria-label','Switch to '+(v==='dark'?'light':'dark')+' mode');
      var label=button.querySelector('[data-theme-label],#theme-toggle-label');
      if(label)label.textContent=v==='dark'?'Light mode':'Dark mode';
    });
  }
  function removeRetiredCards(){
    document.querySelectorAll('a,button,[data-search]').forEach(function(node){
      var href=node.getAttribute('href')||'';
      var text=(node.textContent||'').toLowerCase();
      var retired=REMOVED.some(function(file){return href.indexOf(file)>=0}) || /step[ -]?up sip|emergency fund|real return/.test(text);
      if(retired){
        var card=node.closest('.home-tool-card,.tool-card,.ledger-row,.cat-card');
        if(card)card.remove();
      }
    });
  }
  function init(){
    paint(read());
    removeRetiredCards();
    /* wa-core is the primary owner when present; this listener is only the fallback. */
    if(document.documentElement.dataset.waThemeOwner!=='1'){
      document.addEventListener('click',function(e){
        var button=e.target.closest&&e.target.closest('#theme-toggle,.theme-toggle');
        if(!button)return;
        e.preventDefault();
        e.stopImmediatePropagation();
        var next=document.documentElement.dataset.theme==='dark'?'light':'dark';
        write(next);paint(next);
      },true);
    }
    window.addEventListener('storage',function(e){if(e.key===KEY)paint(e.newValue==='dark'?'dark':'light')});
    window.addEventListener('pageshow',function(){paint(read());removeRetiredCards()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
