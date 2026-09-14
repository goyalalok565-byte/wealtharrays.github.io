/* Wealth Arrays interaction fix — search suggestions + reliable PWA install UX. */
(function () {
  'use strict';
  var installEvent = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    installEvent = e;
    window.__WA_INSTALL_PROMPT__ = e;
    var b = document.querySelector('.wa-install-btn');
    if (b) b.disabled = false;
  }, { once: true });

  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  function search() {
    var input = document.getElementById('tool-search'), box = document.getElementById('tool-search-results');
    if (!input || !box || input.dataset.interactionFix === '1') return;
    input.dataset.interactionFix = '1';
    var aliases = { sip:'sip systematic investment plan mutual fund monthly investment', emi:'emi mortgage home loan monthly payment', fd:'fd fixed deposit maturity interest', rd:'rd recurring deposit monthly deposit', roi:'roi return investment profit', cagr:'cagr compound annual growth', loan:'loan mortgage personal car debt emi', tax:'tax income tax planner', salary:'salary hourly wage income', retirement:'retirement pension corpus financial independence', inflation:'inflation purchasing power future prices', lumpsum:'lumpsum lump sum investment', networth:'net worth assets liabilities wealth' };
    function render() {
      var q = norm(input.value);
      if (!q) { box.innerHTML = ''; box.hidden = true; box.style.display = 'none'; return; }
      var terms = (q + ' ' + (aliases[q] || '')).split(/\s+/).filter(Boolean);
      var cards = Array.from(document.querySelectorAll('.home-tool-card,.ledger-row'));
      var hits = cards.map(function (c) {
        var text = norm((c.dataset.search || '') + ' ' + c.textContent), score = text.indexOf(q) >= 0 ? 100 : 0;
        terms.forEach(function (t) { if (t.length > 1 && text.indexOf(t) >= 0) score += t === q ? 25 : 4; });
        return { c:c, score:score };
      }).filter(function (x) { return x.score > 0; }).sort(function (a,b) { return b.score-a.score; }).slice(0,8);
      box.innerHTML = hits.length ? hits.map(function (x) { var c=x.c, title=(c.querySelector('b')?.textContent || '').trim(), desc=(c.querySelector('p,small')?.textContent || '').trim(), href=c.getAttribute('href') || '#'; return '<a class="wa-search-suggestion" href="'+href+'"><span><strong>'+title+'</strong><small>'+desc+'</small></span><b>→</b></a>'; }).join('') : '<div class="tool-search-empty">No calculator found. Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';
      box.hidden = false; box.style.setProperty('display','block','important');
    }
    ['input','keyup','search','focus'].forEach(function (e) { input.addEventListener(e, render, true); });
    input.addEventListener('keydown', function (e) { if (e.key === 'Escape') { box.hidden=true; box.style.display='none'; } }, true);
    render();
  }

  function install() {
    var b = document.querySelector('.wa-install-btn');
    if (!b || b.dataset.interactionFix === '1') return;
    b.dataset.interactionFix = '1'; b.disabled = false;
    b.addEventListener('click', async function () {
      var ev = installEvent || window.__WA_INSTALL_PROMPT__;
      if (ev) {
        try { ev.prompt(); await ev.userChoice; } catch (_) {}
        installEvent = null; window.__WA_INSTALL_PROMPT__ = null; return;
      }
      var ua = navigator.userAgent || '', msg = /iPhone|iPad|iPod/i.test(ua) ? 'iPhone/iPad: Share → Add to Home Screen.' : /Android/i.test(ua) ? 'Android Chrome: ⋮ menu → Add to Home screen / Install app.' : 'Chrome/Edge desktop: address-bar install icon or browser menu → Install Wealth Arrays.';
      window.alert(msg);
    });
  }
  function init() { search(); install(); setTimeout(search, 100); setTimeout(install, 100); setTimeout(search, 700); setTimeout(install, 700); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true }); else init();
})();
