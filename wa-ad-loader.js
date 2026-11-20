/*
 * AdSense is loaded only after Funding Choices has made consent-mode data
 * available and the required ad purposes are granted or not applicable.
 * Unknown, denied, missing or unconfigured consent fails closed.
 */
(function(){
  'use strict';
  var consentQueued=false,adsLoaded=false;
  function loadAds(){
    if(adsLoaded||window.__waAdsLoaded)return;
    adsLoaded=true;
    window.__waAdsLoaded=true;
    var script=document.createElement('script');
    script.async=true;
    script.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6507600103785450';
    script.crossOrigin='anonymous';
    document.head.appendChild(script);
  }
  function consentAllowsAds(){
    var api=window.googlefc;
    if(!api||typeof api.getGoogleConsentModeValues!=='function'||!api.ConsentModePurposeStatusEnum)return false;
    var values;
    try{values=api.getGoogleConsentModeValues();}catch(_error){return false;}
    if(!values)return false;
    var status=api.ConsentModePurposeStatusEnum;
    var granted=status.CONSENT_MODE_PURPOSE_STATUS_GRANTED;
    var notApplicable=status.CONSENT_MODE_PURPOSE_STATUS_NOT_APPLICABLE;
    var purposes=[values.adStoragePurposeConsentStatus,values.adUserDataPurposeConsentStatus,values.adPersonalizationPurposeConsentStatus];
    return purposes.every(function(value){return value===granted||value===notApplicable;});
  }
  function waitForConsent(){
    if(consentQueued)return true;
    consentQueued=true;
    var api=window.googlefc;
    if(!api||!api.callbackQueue||typeof api.callbackQueue.push!=='function')return false;
    api.callbackQueue.push({CONSENT_MODE_DATA_READY:function(){if(consentAllowsAds())loadAds();}});
    return true;
  }
  function signalAdLoaderReady(){
    if(window.__waAdLoaderReady)return;
    window.__waAdLoaderReady=true;
    window.dispatchEvent(new Event('wa:ad-loader-ready'));
  }
  function checkSubscription(){
    try{
      var session=JSON.parse(localStorage.getItem('waSupabaseSession')||'null');
      if(!session||!session.access_token){waitForConsent();signalAdLoaderReady();return;}
      fetch('/v1/billing/status',{
        headers:{Authorization:'Bearer '+session.access_token,Accept:'application/json'},
        cache:'no-store'
      }).then(async function(response){
        if(!response.ok)throw new Error('Subscription status unavailable');
        var data=await response.json();
        var subscription=data.subscription;
        var paid=subscription&&subscription.status==='active'&&subscription.current_period_end&&Date.parse(subscription.current_period_end)>Date.now();
        if(!paid){waitForConsent();signalAdLoaderReady();}
      }).catch(function(){waitForConsent();signalAdLoaderReady();});
    }catch(_error){waitForConsent();signalAdLoaderReady();}
  }
  checkSubscription();
})();