/*
 * Wealth Arrays — Google Funding Choices loader.
 * Load after the first rendering window or immediately on interaction.
 * Ad requests remain paused until this consent script has loaded.
 */
(function () {
  if (window.__waFundingChoicesExpected) return;
  window.__waFundingChoicesExpected = true;

  var requested = false;
  function loadFundingChoices() {
    if (requested) return;
    requested = true;
    window.__waFundingChoicesRequested = true;
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://fundingchoicesmessages.google.com/i/pub-6507600103785450?ers=1';
    script.onload = function () {
      window.__waFundingChoicesReady = true;
      window.dispatchEvent(new Event('wa:fundingchoices-ready'));
    };
    script.onerror = function () {
      window.__waFundingChoicesFailed = true;
      window.__waFundingChoicesReady = true;
      window.dispatchEvent(new Event('wa:fundingchoices-ready'));
      window.dispatchEvent(new Event('wa:fundingchoices-failed'));
    };
    document.head.appendChild(script);
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

  window.addEventListener('wa:load-fundingchoices', loadFundingChoices, { once: true });
  if (window.__waAdsInteractionRequested) {
    loadFundingChoices();
  } else {
    window.setTimeout(function () {
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(loadFundingChoices, { timeout: 1000 });
      } else {
        loadFundingChoices();
      }
    }, 3200);
  }
  signalGooglefcPresent();
}());
