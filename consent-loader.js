/*
 * Wealth Arrays — Google Funding Choices loader
 * The publisher-specific tag is kept in one external file so CSP does not
 * require inline script execution. Message configuration itself is managed
 * in Google AdSense / Privacy & messaging.
 */
(function () {
  if (window.__waFundingChoicesLoaded) return;
  window.__waFundingChoicesLoaded = true;

  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://fundingchoicesmessages.google.com/i/pub-6507600103785450?ers=1';
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);

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
  signalGooglefcPresent();
}());
