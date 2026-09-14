/* Wealth Arrays interaction hotfix v2 — authoritative homepage search + install button. */
(function () {
  'use strict';
  if (window.__WA_INTERACTION_HOTFIX_V2__) return;
  window.__WA_INTERACTION_HOTFIX_V2__ = true;

  var installEvent = null;
  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    installEvent = event;
    window.__WA_INSTALL_PROMPT__ = event;
    enableInstallButton();
  }, true);

  function norm(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  var aliases = {
    sip: 'sip systematic investment plan mutual fund monthly investment',
    emi: 'emi mortgage home loan monthly payment',
    fd: 'fd fixed deposit maturity interest',
    rd: 'rd recurring deposit monthly deposit',
    roi: 'roi return investment profit',
    cagr: 'cagr compound annual growth',
    loan: 'loan mortgage personal car debt emi',
    tax: 'tax income tax planner',
    salary: 'salary hourly wage income',
    retirement: 'retirement pension corpus financial independence',
    inflation: 'inflation purchasing power future prices',
    lumpsum: 'lumpsum lump sum investment',
    'lump sum': 'lumpsum lump sum investment',
    networth: 'net worth assets liabilities wealth',
    'net worth': 'net worth assets liabilities wealth'
  };

  function getSearchElements() {
    return {
      input: document.getElementById('tool-search'),
      box: document.getElementById('tool-search-results')
    };
  }

  function renderSearch() {
    var els = getSearchElements();
    if (!els.input || !els.box) return;
    var query = norm(els.input.value);
    if (!query) {
      els.box.innerHTML = '';
      els.box.hidden = true;
      els.box.style.display = 'none';
      return;
    }

    var expanded = (query + ' ' + (aliases[query] || '')).trim();
    var terms = expanded.split(/\s+/).filter(Boolean);
    var cards = Array.prototype.slice.call(document.querySelectorAll('.home-tool-card,.ledger-row'));
    var hits = cards.map(function (card) {
      var text = norm((card.getAttribute('data-search') || '') + ' ' + card.textContent);
      var score = text.indexOf(query) !== -1 ? 100 : 0;
      terms.forEach(function (term) {
        if (term.length > 1 && text.indexOf(term) !== -1) score += term === query ? 25 : 3;
      });
      return { card: card, score: score };
    }).filter(function (item) { return item.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 8);

    if (!hits.length) {
      els.box.innerHTML = '<div class="tool-search-empty">No calculator found. Try SIP, EMI, FD, RD, ROI, loan, tax or salary.</div>';
    } else {
      els.box.innerHTML = hits.map(function (item) {
        var card = item.card;
        var titleNode = card.querySelector('b');
        var descNode = card.querySelector('p') || card.querySelector('small');
        var title = titleNode ? titleNode.textContent.trim() : 'Calculator';
        var desc = descNode ? descNode.textContent.trim() : '';
        var href = card.getAttribute('href') || '#';
        return '<a class="wa-search-suggestion" href="' + href.replace(/"/g, '&quot;') + '"><span><strong>' + title + '</strong><small>' + desc + '</small></span><b>→</b></a>';
      }).join('');
    }
    els.box.hidden = false;
    els.box.style.setProperty('display', 'block', 'important');
  }

  function bindSearch() {
    var input = document.getElementById('tool-search');
    if (!input || input.dataset.waHotfixBound === '1') return;
    input.dataset.waHotfixBound = '1';
    ['input', 'keyup', 'search', 'change', 'focus'].forEach(function (eventName) {
      input.addEventListener(eventName, renderSearch, true);
    });
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        var box = document.getElementById('tool-search-results');
        if (box) { box.hidden = true; box.style.display = 'none'; }
      }
    }, true);
    renderSearch();
  }

  function enableInstallButton() {
    var button = document.querySelector('.wa-install-btn');
    if (button) button.disabled = false;
  }

  function bindInstall() {
    var button = document.querySelector('.wa-install-btn');
    if (!button || button.dataset.waHotfixBound === '1') return;
    button.dataset.waHotfixBound = '1';
    button.disabled = false;
    button.addEventListener('click', function () {
      var event = installEvent || window.__WA_INSTALL_PROMPT__;
      if (event) {
        event.prompt();
        event.userChoice.catch(function () {}).finally(function () {
          installEvent = null;
          window.__WA_INSTALL_PROMPT__ = null;
        });
        return;
      }
      var ua = navigator.userAgent || '';
      var message = /iPhone|iPad|iPod/i.test(ua)
        ? 'iPhone/iPad: Share → Add to Home Screen.'
        : /Android/i.test(ua)
          ? 'Android Chrome: ⋮ → Add to Home screen / Install app.'
          : 'Chrome/Edge: use the address-bar install icon or browser menu → Install Wealth Arrays.';
      window.alert(message);
    }, true);
  }

  function init() {
    bindSearch();
    bindInstall();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
  setTimeout(init, 50);
  setTimeout(init, 300);
  setTimeout(init, 1000);
  if (window.MutationObserver) {
    new MutationObserver(function () { bindSearch(); bindInstall(); }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
