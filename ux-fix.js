/* Wealth Arrays UX fix — resilient calculator search + PWA install handling. */
(function () {
  'use strict';

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function setupSearch() {
    const input = document.getElementById('tool-search');
    const box = document.getElementById('tool-search-results');
    if (!input || !box || input.dataset.waUxSearch === '1') return;
    input.dataset.waUxSearch = '1';

    const aliases = {
      sip: 'systematic investment plan monthly investment mutual fund',
      emi: 'mortgage home loan monthly payment',
      fd: 'fixed deposit banking deposit maturity interest',
      rd: 'recurring deposit banking monthly deposit maturity',
      roi: 'return investment profit annualized return',
      cagr: 'compound annual growth annualized return',
      tax: 'income tax planner tax scenario effective rate',
      salary: 'hourly wage income annual pay',
      loan: 'mortgage personal car debt repayment emi',
      retirement: 'pension financial independence retirement corpus',
      inflation: 'purchasing power future prices inflation',
      lumpsum: 'lump sum one time investment',
      networth: 'assets liabilities wealth net worth'
    };

    function render() {
      const query = normalize(input.value);
      if (!query) {
        box.innerHTML = '';
        box.hidden = true;
        box.style.display = 'none';
        return;
      }

      const expanded = aliases[query] || '';
      const terms = Array.from(new Set((query + ' ' + expanded).split(/\s+/).filter(Boolean)));
      const cards = Array.from(document.querySelectorAll('.home-tool-card,.cat-card,.ledger-row'));
      const hits = cards.map(function (card) {
        const text = normalize((card.dataset.search || '') + ' ' + card.textContent);
        const words = query.split(/\s+/).filter(Boolean);
        let score = text.includes(query) ? 100 : 0;
        words.forEach(function (word) { if (word.length > 1 && text.includes(word)) score += 15; });
        terms.forEach(function (term) { if (term.length > 1 && text.includes(term)) score += 2; });
        return { card: card, score: score };
      }).filter(function (item) { return item.score > 0; })
        .sort(function (a, b) { return b.score - a.score; })
        .slice(0, 8);

      box.innerHTML = hits.length ? hits.map(function (item) {
        const card = item.card;
        const title = (card.querySelector('b,h2')?.textContent || card.textContent || '').trim().split('\n')[0];
        const desc = (card.querySelector('p,small')?.textContent || '').trim();
        const href = card.getAttribute('href') || '#';
        return '<a class="wa-search-suggestion" href="' + href + '"><span><strong>' + title + '</strong><small>' + desc + '</small></span><b>→</b></a>';
      }).join('') : '<div class="tool-search-empty">No calculator found. Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';
      box.hidden = false;
      box.style.setProperty('display', 'block', 'important');
    }

    ['input', 'keyup', 'search', 'focus'].forEach(function (eventName) {
      input.addEventListener(eventName, render, true);
    });
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        box.hidden = true;
        box.style.display = 'none';
      }
    }, true);
    document.addEventListener('click', function (event) {
      if (!input.contains(event.target) && !box.contains(event.target)) {
        box.hidden = true;
        box.style.display = 'none';
      }
    }, true);
    render();
  }

  function setupInstall() {
    const banner = document.getElementById('wa-install-banner');
    if (!banner || banner.dataset.waUxInstall === '1') return;
    banner.dataset.waUxInstall = '1';
    const button = banner.querySelector('.wa-install-btn');
    if (!button) return;

    let deferred = window.__WA_DEFERRED_INSTALL_PROMPT__ || null;
    button.disabled = false;
    button.title = 'Install Wealth Arrays';

    function closeBanner() {
      banner.classList.add('wa-install-hide');
      setTimeout(function () { banner.remove(); }, 320);
    }

    function instructions() {
      const ua = navigator.userAgent || '';
      let message = 'To install Wealth Arrays, use your browser menu and choose “Install app” or “Add to Home screen”.';
      if (/iPhone|iPad|iPod/i.test(ua)) {
        message = 'On iPhone/iPad: tap Share, then choose “Add to Home Screen”.';
      } else if (/Android/i.test(ua)) {
        message = 'On Android Chrome: open the ⋮ menu, then choose “Add to Home screen” or “Install app”.';
      } else if (/Macintosh|Windows|Linux/i.test(ua)) {
        message = 'On desktop Chrome/Edge: use the install icon in the address bar, or open the browser menu and choose “Install Wealth Arrays”.';
      }
      window.alert(message);
    }

    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      deferred = event;
      window.__WA_DEFERRED_INSTALL_PROMPT__ = event;
      button.disabled = false;
    });

    button.addEventListener('click', async function () {
      if (!deferred) {
        instructions();
        return;
      }
      const promptEvent = deferred;
      deferred = null;
      window.__WA_DEFERRED_INSTALL_PROMPT__ = null;
      button.disabled = true;
      try {
        await promptEvent.prompt();
        await promptEvent.userChoice;
      } catch (_) {
        instructions();
      }
      closeBanner();
    });
  }

  function init() {
    setupSearch();
    setupInstall();
    [100, 500, 1200].forEach(function (delay) {
      setTimeout(function () {
        setupSearch();
        setupInstall();
      }, delay);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
