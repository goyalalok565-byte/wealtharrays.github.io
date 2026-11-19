/*
 * Wealth Arrays — deferred Google Funding Choices loader.
 * Funding Choices is requested on first interaction, or after a 4 s post-load idle fallback.
 * The shared promise lets the AdSense loader wait for the CMP script to load or fail.
 */
(function(){
  'use strict';
  if(window.__waFundingChoicesScheduled||window.__waFundingChoicesPromise)return;
  window.__waFundingChoicesScheduled=true;
  var started=false,timer=0,idle=0;
  function load(){
    if(started)return;started=true;
    if(timer)clearTimeout(timer);
    if(idle&&window.cancelIdleCallback)window.cancelIdleCallback(idle);
    window.__waFundingChoicesPromise=new Promise(function(resolve){
      var script=document.createElement('script');
      script.async=true;
      script.src='https://fundingchoicesmessages.google.com/i/pub-6507600103785450?ers=1';
      script.onload=function(){resolve(true)};
      script.onerror=function(){resolve(false)};
      document.head.appendChild(script);
      function signalGooglefcPresent(){
        if(window.frames.googlefcPresent)return;
        if(!document.body){window.setTimeout(signalGooglefcPresent,0);return}
        var iframe=document.createElement('iframe');
        iframe.title='Google Funding Choices presence';
        iframe.style.cssText='width:0;height:0;border:none;z-index:-1000;left:-1000px;top:-1000px;display:none;';
        iframe.name='googlefcPresent';
        document.body.appendChild(iframe);
      }
      signalGooglefcPresent();
    });
  }
  function schedule(){
    if(started||timer)return;
    timer=setTimeout(function(){
      if(window.requestIdleCallback)idle=window.requestIdleCallback(load,{timeout:1000});
      else load();
    },4000);
  }
  if(document.readyState==='complete')schedule();
  else window.addEventListener('load',schedule,{once:true,passive:true});
  ['pointerdown','keydown','touchstart','scroll'].forEach(function(name){
    window.addEventListener(name,load,{once:true,passive:true});
  });
})();
