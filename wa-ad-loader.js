(function(){
  'use strict';
  if(window.__waAdLoaderScheduled||window.__waAdLoaderStarted)return;
  window.__waAdLoaderScheduled=true;
  var started=false, fallbackTimer=0, idleId=0;
  function loadAds(){
    if(started)return;
    started=true;
    window.__waAdLoaderStarted=true;
    if(fallbackTimer)clearTimeout(fallbackTimer);
    if(idleId&&window.cancelIdleCallback)window.cancelIdleCallback(idleId);
    var load=function(){
      var session=null;
      try{session=JSON.parse(localStorage.getItem('waSupabaseSession')||'null')}catch(_error){}
      var inject=function(){
        if(document.querySelector('script[data-wa-adsense="1"]'))return;
        var script=document.createElement('script');
        script.async=true;
        script.dataset.waAdsense='1';
        script.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6507600103785450';
        script.crossOrigin='anonymous';
        document.head.appendChild(script);
        var preconnect=document.createElement('link');
        preconnect.rel='preconnect';preconnect.href='https://pagead2.googlesyndication.com';preconnect.crossOrigin='anonymous';
        document.head.appendChild(preconnect);
        var doubleclick=document.createElement('link');
        doubleclick.rel='preconnect';doubleclick.href='https://googleads.g.doubleclick.net';doubleclick.crossOrigin='anonymous';
        document.head.appendChild(doubleclick);
      };
      if(!session||!session.access_token){inject();return}
      fetch('/v1/billing/status',{headers:{Authorization:'Bearer '+session.access_token,Accept:'application/json'},cache:'no-store'})
        .then(async function(response){
          if(!response.ok)throw new Error('Subscription status unavailable');
          var data=await response.json(),subscription=data.subscription;
          var paid=subscription&&subscription.status==='active'&&subscription.current_period_end&&Date.parse(subscription.current_period_end)>Date.now();
          if(!paid)inject();
        }).catch(inject);
    };
    var consentReady=window.__waFundingChoicesPromise||Promise.resolve();
    Promise.race([consentReady,new Promise(function(resolve){setTimeout(resolve,2000)})]).then(load);
  }
  function schedule(){
    if(started)return;
    if(window.requestIdleCallback)idleId=window.requestIdleCallback(loadAds,{timeout:1000});
    else setTimeout(loadAds,500);
  }
  if(document.readyState==='complete')schedule();
  else window.addEventListener('load',schedule,{once:true,passive:true});
  ['pointerdown','keydown','touchstart','scroll'].forEach(function(name){
    window.addEventListener(name,loadAds,{once:true,passive:true});
  });
  fallbackTimer=setTimeout(loadAds,4000);
})();
