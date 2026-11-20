/*
 * Wealth Arrays — consent-safe Google Funding Choices loader.
 * The CMP is loaded only for pages with an actual ad placement and only after
 * first paint plus an idle period. AdSense waits for CONSENT_MODE_DATA_READY.
 */
(function(){
  'use strict';
  var AD_SLOT_SELECTOR='ins.adsbygoogle,[data-ad-slot],.wa-ad-slot';
  var started=false,scheduled=false,waitingForAdLoader=false,observer=null;
  window.googlefc=window.googlefc||{};
  window.googlefc.callbackQueue=window.googlefc.callbackQueue||[];
  function hasAdSlot(){return !!document.querySelector(AD_SLOT_SELECTOR);}
  function signalGooglefcPresent(){
    if(window.frames.googlefcPresent)return;
    if(!document.body){window.setTimeout(signalGooglefcPresent,0);return;}
    var iframe=document.createElement('iframe');
    iframe.style.cssText='width:0;height:0;border:none;z-index:-1000;left:-1000px;top:-1000px;display:none;';
    iframe.name='googlefcPresent';
    document.body.appendChild(iframe);
  }
  function loadFundingChoices(){
    scheduled=false;
    if(started||!hasAdSlot()||!window.__waAdLoaderReady)return;
    started=true;
    if(observer)observer.disconnect();
    var preconnect=document.createElement('link');
    preconnect.rel='preconnect';
    preconnect.href='https://fundingchoicesmessages.google.com';
    preconnect.crossOrigin='anonymous';
    document.head.appendChild(preconnect);
    var script=document.createElement('script');
    script.async=true;
    script.src='https://fundingchoicesmessages.google.com/i/pub-6507600103785450?ers=1';
    script.addEventListener('load',function(){
      window.dispatchEvent(new Event('wa:fundingchoices-ready'));
    },{once:true});
    document.head.appendChild(script);
    window.__waFundingChoicesLoaded=true;
    signalGooglefcPresent();
  }
  function scheduleLoad(){
    if(started||scheduled||!hasAdSlot())return;
    if(!window.__waAdLoaderReady){
      if(!waitingForAdLoader){
        waitingForAdLoader=true;
        window.addEventListener('wa:ad-loader-ready',function(){
          waitingForAdLoader=false;
          scheduleLoad();
        },{once:true});
      }
      return;
    }
    scheduled=true;
    var afterPaint=function(){
      var idle=function(){
        if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(loadFundingChoices,{timeout:3500});
        else window.setTimeout(loadFundingChoices,3500);
      };
      if(typeof window.requestAnimationFrame==='function')window.requestAnimationFrame(function(){window.requestAnimationFrame(idle);});
      else window.setTimeout(idle,100);
    };
    if(document.readyState==='complete')afterPaint();
    else window.addEventListener('load',afterPaint,{once:true});
  }
  if(hasAdSlot())scheduleLoad();
  if('MutationObserver' in window&&document.documentElement){
    observer=new MutationObserver(function(){
      if(hasAdSlot())scheduleLoad();
      if(started)observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }
})();