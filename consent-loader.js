/*
 * Wealth Arrays — Google Funding Choices loader.
 * Funding Choices is an ad-consent platform, so load it only on pages that
 * actually contain an ad slot. Analytics consent is handled separately by
 * the first-party consent UI in wa-core.js.
 */
(function () {
  'use strict';
  if (window.__waFundingChoicesLoaded) return;
  var AD_SLOT_SELECTOR = 'ins.adsbygoogle,[data-ad-slot],.wa-ad-slot';
  var started = false;

  function hasAdSlot() {
    return !!document.querySelector(AD_SLOT_SELECTOR);
  }

  function signalGooglefcPresent() {
    if (window.frames.googlefcPresent) return;
    if (!document.body) {
      window.setTimeout(signalGooglefcPresent, 0);
      return;
    }
    var iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:0;height:0;border:none;z-index:-1000;left:-1000px;top:-1000px;display:none;';
    iframe.name = 'googlefcPresent';
    document.body.appendChild(iframe);
  }

  function loadFundingChoices() {
    if (started || !hasAdSlot()) return;
    started = true;
    window.__waFundingChoicesLoaded = true;
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://fundingchoicesmessages.google.com/i/pub-6507600103785450?ers=1';
    script.addEventListener('load', function () {
      window.dispatchEvent(new Event('wa:fundingchoices-ready'));
    }, { once: true });
    document.head.appendChild(script);
    signalGooglefcPresent();
  }

  // The loader is deferred in the document head, so static slots are already parsed.
  if (hasAdSlot()) {
    loadFundingChoices();
    return;
  }

  // Support future ad slots inserted dynamically, without loading the CMP site-wide.
  if ('MutationObserver' in window && document.documentElement) {
    var observer = new MutationObserver(function () {
      if (!hasAdSlot()) return;
      observer.disconnect();
      loadFundingChoices();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
}());
