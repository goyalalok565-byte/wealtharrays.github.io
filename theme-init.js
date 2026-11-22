/* Tiny synchronous theme + consent-safe ad-request bootstrap. */
(function () {
  try {
    var theme = localStorage.getItem('waTheme');
    if (theme === 'dark' || theme === 'light') document.documentElement.dataset.theme = theme;
  } catch (_error) {}

  try {
    var ads = window.adsbygoogle = window.adsbygoogle || [];
    ads.pauseAdRequests = 1;
    var interacted = false;
    var timerElapsed = false;
    var discoveryComplete = false;
    var resumed = false;

    function cleanup() {
      ['pointerdown', 'keydown', 'scroll', 'focusin'].forEach(function (type) {
        document.removeEventListener(type, noteInteraction, true);
      });
      window.removeEventListener('wa:fundingchoices-ready', maybeResume);
    }
    function maybeResume() {
      if (resumed || !discoveryComplete) return;
      if (window.__waFundingChoicesExpected && !window.__waFundingChoicesReady) return;
      if (!interacted && !timerElapsed) return;
      resumed = true;
      ads.pauseAdRequests = 0;
      cleanup();
    }
    function noteInteraction() {
      interacted = true;
      window.__waAdsInteractionRequested = true;
      window.dispatchEvent(new Event('wa:load-fundingchoices'));
      maybeResume();
    }

    window.addEventListener('wa:fundingchoices-ready', maybeResume);
    document.addEventListener('DOMContentLoaded', function () {
      discoveryComplete = true;
      maybeResume();
    }, { once: true });
    ['pointerdown', 'keydown', 'scroll', 'focusin'].forEach(function (type) {
      document.addEventListener(type, noteInteraction, { once: true, capture: true, passive: type === 'pointerdown' || type === 'scroll' });
    });
    window.setTimeout(function () {
      timerElapsed = true;
      maybeResume();
    }, 6000);
  } catch (_error) {}

  try {
    var hotfixLoaded = false;
    var loadHotfix = function () {
      if (hotfixLoaded) return;
      hotfixLoaded = true;
      if (document.querySelector('script[data-wa-production-hotfix]')) return;
      var script = document.createElement('script');
      script.src = '/production-hotfix.js?v=20260918';
      script.async = true;
      script.dataset.waProductionHotfix = '1';
      document.head.appendChild(script);
      window.removeEventListener('pointerdown', loadHotfix);
      window.removeEventListener('keydown', loadHotfix);
      window.removeEventListener('focusin', loadHotfix);
    };
    window.addEventListener('pointerdown', loadHotfix, { once: true, passive: true });
    window.addEventListener('keydown', loadHotfix, { once: true });
    window.addEventListener('focusin', loadHotfix, { once: true });
    window.setTimeout(loadHotfix, 5000);
  } catch (_error) {}
}());
