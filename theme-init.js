/* Synchronous theme bootstrap; small interaction wiring is installed before first paint. */
(function(){
  'use strict';
  function applyTheme(value){
    var theme=value==='dark'?'dark':'light';
    document.documentElement.dataset.theme=theme;
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',theme==='dark'?'#080a0f':'#f7f8fb');
    document.querySelectorAll('#theme-toggle,.theme-toggle').forEach(function(button){
      button.setAttribute('aria-pressed',String(theme==='dark'));
      button.setAttribute('aria-label','Switch to '+(theme==='dark'?'light':'dark')+' mode');
      var label=button.querySelector('[data-theme-label],#theme-toggle-label');
      if(label)label.textContent=theme==='dark'?'Light mode':'Dark mode';
    });
  }
  try{
    var savedTheme=localStorage.getItem('waTheme');
    if(savedTheme==='dark'||savedTheme==='light')document.documentElement.dataset.theme=savedTheme;
  }catch(_error){}
  function syncThemeButton(){applyTheme(document.documentElement.dataset.theme||'light');}
  // Calculator pages already receive this handler from the canonical calculator runtime.
  // Other pages use this early delegated handler so their header toggle is never inert.
  document.addEventListener('click',function(event){
    var target=event.target;
    var button=target&&typeof target.closest==='function'?target.closest('#theme-toggle,.theme-toggle'):null;
    if(!button||document.querySelector('.calc-page'))return;
    event.preventDefault();
    var next=document.documentElement.dataset.theme==='dark'?'light':'dark';
    try{localStorage.setItem('waTheme',next);}catch(_error){}
    applyTheme(next);
  },true);
  window.addEventListener('storage',function(event){
    if(event.key==='waTheme')applyTheme(event.newValue==='dark'?'dark':'light');
  });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',syncThemeButton,{once:true});
  else syncThemeButton();
  function loadProductionHotfix(){
    if(document.querySelector('script[data-wa-production-hotfix]'))return;
    var script=document.createElement('script');
    script.src='/production-hotfix.js?v=20260918';
    script.async=true;
    script.dataset.waProductionHotfix='1';
    document.head.appendChild(script);
  }
  function scheduleHotfix(){
    if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(loadProductionHotfix,{timeout:2500});
    else window.setTimeout(loadProductionHotfix,3500);
  }
  if(document.readyState==='complete')scheduleHotfix();
  else window.addEventListener('load',scheduleHotfix,{once:true});
})();