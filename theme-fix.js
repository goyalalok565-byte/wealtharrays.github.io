/* Wealth Arrays global theme fallback — keeps dark mode working on every page. */
(function(){
  'use strict';
  var KEY='waTheme';
  function read(){try{return localStorage.getItem(KEY)==='dark'?'dark':'light'}catch(e){return document.documentElement.dataset.theme==='dark'?'dark':'light'}}
  function write(v){try{localStorage.setItem(KEY,v)}catch(e){}}
  function paint(v){
    v=v==='dark'?'dark':'light';
    document.documentElement.dataset.theme=v;
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',v==='dark'?'#080a0f':'#f7f8fb');
    var button=document.getElementById('theme-toggle');
    if(button){
      button.setAttribute('aria-pressed',String(v==='dark'));
      button.setAttribute('aria-label','Switch to '+(v==='dark'?'light':'dark')+' mode');
      var label=button.querySelector('[data-theme-label],#theme-toggle-label');
      if(label)label.textContent=v==='dark'?'Light mode':'Dark mode';
    }
  }
  function init(){
    paint(read());
    document.addEventListener('click',function(e){
      var button=e.target.closest&&e.target.closest('#theme-toggle');
      if(!button)return;
      /* wa-core.js is the primary owner when it loaded successfully. */
      if(document.documentElement.dataset.waThemeOwner==='1')return;
      e.preventDefault();
      var next=document.documentElement.dataset.theme==='dark'?'light':'dark';
      write(next);paint(next);
    },true);
    window.addEventListener('storage',function(e){if(e.key===KEY)paint(e.newValue==='dark'?'dark':'light')});
    window.addEventListener('pageshow',function(){paint(read())});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
