(function(){
  'use strict';
  if(window.__waFundingChoicesScheduled)return;
  window.__waFundingChoicesScheduled=true;
  var started=false,timer=0,idle=0;
  function load(){
    if(started)return;started=true;
    if(timer)clearTimeout(timer);
    if(idle&&window.cancelIdleCallback)window.cancelIdleCallback(idle);
    if(document.querySelector('script[data-wa-funding-choices="1"]'))return;
    var script=document.createElement('script');
    script.async=true;script.dataset.waFundingChoices='1';script.src='/consent-loader.js';
    document.head.appendChild(script);
  }
  function schedule(){
    if(started)return;
    if(window.requestIdleCallback)idle=window.requestIdleCallback(load,{timeout:1000});
    else setTimeout(load,500);
  }
  if(document.readyState==='complete')schedule();
  else window.addEventListener('load',schedule,{once:true,passive:true});
  ['pointerdown','keydown','touchstart','scroll'].forEach(function(name){window.addEventListener(name,load,{once:true,passive:true})});
  timer=setTimeout(load,4000);
})();
