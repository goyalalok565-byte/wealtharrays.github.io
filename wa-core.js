/* Wealth Arrays core runtime — single canonical shared site behavior. */
(function () {
  'use strict';

  const CURRENCIES = [
    ['USD', '$', 'US Dollar'], ['EUR', '€', 'Euro'], ['JPY', '¥', 'Japanese Yen'], ['GBP', '£', 'British Pound'],
    ['AUD', 'A$', 'Australian Dollar'], ['CAD', 'C$', 'Canadian Dollar'], ['CHF', 'CHF', 'Swiss Franc'], ['CNY', 'CN¥', 'Chinese Yuan'],
    ['HKD', 'HK$', 'Hong Kong Dollar'], ['NZD', 'NZ$', 'New Zealand Dollar'], ['SEK', 'kr', 'Swedish Krona'], ['KRW', '₩', 'South Korean Won'],
    ['SGD', 'S$', 'Singapore Dollar'], ['NOK', 'kr', 'Norwegian Krone'], ['MXN', 'MX$', 'Mexican Peso'], ['INR', '₹', 'Indian Rupee'],
    ['ZAR', 'R', 'South African Rand'], ['BRL', 'R$', 'Brazilian Real'], ['AED', 'د.إ', 'UAE Dirham'], ['SAR', '﷼', 'Saudi Riyal'],
    ['TRY', '₺', 'Turkish Lira'], ['PLN', 'zł', 'Polish Zloty'], ['THB', '฿', 'Thai Baht'], ['IDR', 'Rp', 'Indonesian Rupiah'],
    ['MYR', 'RM', 'Malaysian Ringgit'], ['PHP', '₱', 'Philippine Peso'], ['DKK', 'kr', 'Danish Krone'], ['ILS', '₪', 'Israeli Shekel'],
    ['CZK', 'Kč', 'Czech Koruna'], ['HUF', 'Ft', 'Hungarian Forint']
  ];

  const RELATED = {
    investment: [['sip-calculator.html', 'SIP Calculator'], ['compound-interest-calculator.html', 'Compound Interest'], ['lumpsum-calculator.html', 'Lump Sum Calculator'], ['cagr-calculator.html', 'CAGR Calculator'], ['roi-calculator.html', 'ROI Calculator']],
    loan: [['mortgage-emi-calculator.html', 'Mortgage & EMI'], ['car-loan-calculator.html', 'Car Loan'], ['personal-loan-calculator.html', 'Personal Loan'], ['debt-payoff-calculator.html', 'Debt Payoff']],
    banking: [['fixed-deposit-calculator.html', 'Fixed Deposit'], ['recurring-deposit-calculator.html', 'Recurring Deposit'], ['simple-interest-calculator.html', 'Simple Interest'], ['inflation-calculator.html', 'Inflation']],
    retirement: [['retirement-calculator.html', 'Retirement'], ['inflation-calculator.html', 'Inflation'], ['compound-interest-calculator.html', 'Compound Interest'], ['net-worth-calculator.html', 'Net Worth']],
    salary: [['salary-to-hourly-calculator.html', 'Salary to Hourly'], ['overtime-pay-calculator.html', 'Overtime Pay'], ['freelance-rate-calculator.html', 'Freelance Rate'], ['income-tax-planner.html', 'Income Tax Planner']],
    business: [['profit-margin-calculator.html', 'Profit Margin'], ['roi-calculator.html', 'ROI Calculator'], ['freelance-rate-calculator.html', 'Freelance Rate'], ['income-tax-planner.html', 'Income Tax Planner']]
  };

  const get = (key, fallback) => {
    try { return localStorage.getItem(key) || fallback; } catch (error) { return fallback; }
  };

  const set = (key, value) => {
    try { localStorage.setItem(key, value); } catch (error) {}
  };

  function renderFooter() {
    let footer = document.querySelector('footer');
    document.querySelectorAll('footer').forEach((node, index) => {
      if (index > 0) node.remove();
    });
    if (!footer) {
      footer = document.createElement('footer');
      document.body.appendChild(footer);
    }
    footer.className = 'site-footer premium-footer';
    footer.innerHTML = '<div class="site-footer-inner"><div class="footer-brand-row"><a class="footer-logo" href="/index.html" aria-label="Wealth Arrays home"><img src="/favicon-v2.svg" alt="Wealth Arrays logo" width="44" height="44"><span><b>Wealth Arrays</b><small>Financial tools that make numbers clearer.</small></span></a><p class="footer-brand-copy">Fast, browser-first financial calculators for clearer decisions. Results are educational estimates and not financial, tax, legal or investment advice.</p></div><nav class="footer-nav-box" aria-label="Company and legal pages"><a class="footer-link" href="/privacy.html">Privacy Policy</a><a class="footer-link" href="/terms.html">Terms &amp; Conditions</a><a class="footer-link" href="/disclaimer.html">Disclaimer</a><a class="footer-link" href="/about.html">About Us</a><a class="footer-link" href="/contact.html">Contact Us</a><a class="footer-link" href="/methodology.html">Methodology</a><a class="footer-link" href="/editorial-standards.html">Editorial Standards</a><a class="footer-link" href="/advertising-policy.html">Advertising Policy</a><a class="footer-link" href="/faq.html">FAQ</a></nav><div class="footer-bottom"><span>© 2026 Wealth Arrays</span><span>Questions or corrections: <a href="mailto:goyalalok565@gmail.com">goyalalok565@gmail.com</a></span></div></div>';
  }

  function addRelatedAndTrust() {
    const article = document.querySelector('.tool-article');
    if (!article) return;
    if (!document.querySelector('.wa-related')) {
      const tag = document.querySelector('.calc-category-tag');
      if (tag) {
        const href = tag.getAttribute('href') || '';
        const key = href.includes('investment') ? 'investment' : href.includes('loan') ? 'loan' : href.includes('banking') ? 'banking' : href.includes('retirement') ? 'retirement' : href.includes('salary') ? 'salary' : href.includes('business') ? 'business' : '';
        const current = location.pathname.split('/').pop() || 'index.html';
        const items = (RELATED[key] || []).filter((item) => item[0] !== current).slice(0, 4);
        if (items.length) {
          const section = document.createElement('section');
          section.className = 'related-tools wa-related';
          section.setAttribute('aria-label', 'Related calculators');
          section.innerHTML = '<div class="related-heading">Related calculators</div><div class="related-list">' + items.map((item) => '<a href="' + item[0] + '">' + item[1] + ' <span>→</span></a>').join('') + '</div><div class="calc-next-links"><a href="' + href + '">Browse this category →</a><a href="tools.html">Explore all 20 calculators →</a><a href="/faq.html">Read calculator FAQs →</a></div>';
          article.appendChild(section);
        }
      }
    }
    if (!document.querySelector('.wa-trust-signals')) {
      const section = document.createElement('aside');
      section.className = 'wa-trust-signals';
      section.setAttribute('aria-label', 'Calculator methodology and trust information');
      section.innerHTML = '<div><strong>Transparent assumptions</strong><span>Results depend on the values and formula shown on this page.</span></div><div><strong>Educational estimates</strong><span>These tools do not replace financial, tax, legal or investment advice.</span></div><div><strong>Your browser</strong><span>Calculator inputs are designed to be processed locally where possible.</span></div><p><a href="/disclaimer.html">Disclaimer</a><a href="/privacy.html">Privacy</a><a href="/contact.html">Contact &amp; corrections</a></p>';
      article.appendChild(section);
    }
  }

  function applyTheme(themeName) {
    const theme = themeName === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    set('waTheme', theme);
    const button = document.getElementById('theme-toggle');
    if (button) {
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
      const label = button.querySelector('[data-theme-label]');
      if (label) label.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    }
  }

  function applyCurrency() {
    const select = document.getElementById('currency-select');
    if (!select) return;
    const saved = get('waCurrency', 'INR');
    select.innerHTML = CURRENCIES.map((item) => '<option value="' + item[0] + '">' + item[0] + ' · ' + item[1] + ' · ' + item[2] + '</option>').join('');
    select.value = CURRENCIES.some((item) => item[0] === saved) ? saved : 'INR';
    document.documentElement.dataset.currency = select.value;
    if (!select.dataset.waCurrencyOwner) {
      select.dataset.waCurrencyOwner = '1';
      select.addEventListener('change', function () {
        set('waCurrency', select.value);
        document.documentElement.dataset.currency = select.value;
        window.dispatchEvent(new CustomEvent('wa-currency', { detail: { currency: select.value } }));
        if (typeof window.waTrack === 'function') window.waTrack('currency_change', { currency: select.value });
      });
    }
  }

  function applyCategories() {
    const colors = { investment: '#0F766E', loan: '#B45309', banking: '#2563EB', retirement: '#6D28D9', salary: '#BE185D', business: '#0E7490' };
    document.querySelectorAll('.home-tool-card,.tool-card,.ledger-row').forEach((card) => {
      const text = ((card.dataset.search || '') + ' ' + card.textContent).toLowerCase();
      let key = 'investment';
      if (/mortgage|emi|loan|debt/.test(text)) key = 'loan';
      else if (/retirement|pension|freedom/.test(text)) key = 'retirement';
      else if (/salary|hourly|overtime|wage|income/.test(text)) key = 'salary';
      else if (/business|profit margin|freelance/.test(text)) key = 'business';
      else if (/fd|fixed deposit|rd|recurring deposit|banking|interest/.test(text)) key = 'banking';
      card.dataset.waCategory = key;
      card.style.setProperty('--wa-card-accent', colors[key]);
    });
  }

  function calculatorSearch() {
    const input = document.getElementById('tool-search');
    const box = document.getElementById('tool-search-results');
    if (!input || !box || input.dataset.waSearchOwner === '1') return;
    input.dataset.waSearchOwner = '1';
    const aliases = { sip: 'systematic investment plan monthly investment mutual fund', emi: 'mortgage home loan monthly payment', fd: 'fixed deposit banking deposit', rd: 'recurring deposit banking monthly deposit', roi: 'return investment profit', cagr: 'compound annual growth', tax: 'income tax planner', salary: 'hourly wage income', loan: 'mortgage personal car debt', retirement: 'pension financial independence', inflation: 'purchasing power prices', lumpsum: 'lump sum investment', networth: 'assets liabilities wealth' };
    const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    function render() {
      const query = normalize(input.value);
      if (!query) { box.innerHTML = ''; box.hidden = true; box.style.display = 'none'; return; }
      const terms = (query + ' ' + (aliases[query] || '')).split(/\s+/).filter(Boolean);
      const cards = Array.from(document.querySelectorAll('.home-tool-card,.cat-card,.ledger-row'));
      const hits = cards.map((card) => {
        const text = normalize((card.dataset.search || '') + ' ' + card.textContent);
        let score = text.includes(query) ? 100 : 0;
        terms.forEach((term) => { if (term.length > 1 && text.includes(term)) score += 3; });
        return { card, score };
      }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 8);
      box.innerHTML = hits.length ? hits.map(({ card }) => {
        const title = (card.querySelector('b,h2')?.textContent || card.textContent || '').trim().split('\n')[0];
        const desc = (card.querySelector('p,small')?.textContent || '').trim();
        const href = card.getAttribute('href') || '#';
        return '<a class="wa-search-suggestion" href="' + href + '"><span><strong>' + title + '</strong><small>' + desc + '</small></span><b>→</b></a>';
      }).join('') : '<div class="tool-search-empty">No exact match. Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';
      box.hidden = false;
      box.style.setProperty('display', 'block', 'important');
      box.style.position = 'absolute';
      box.style.zIndex = '2147483647';
    }
    ['input', 'keyup', 'search', 'focus'].forEach((eventName) => input.addEventListener(eventName, render, true));
    input.addEventListener('keydown', (event) => { if (event.key === 'Escape') { box.hidden = true; box.style.display = 'none'; } }, true);
    document.addEventListener('click', (event) => { if (!input.contains(event.target) && !box.contains(event.target)) { box.hidden = true; box.style.display = 'none'; } }, true);
    render();
  }

  function analytics() {
    const id = 'G-GYN4W5VFEY';
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;
    gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', wait_for_update: 500 });
    gtag('js', new Date());
    gtag('config', id, { anonymize_ip: true });
    if (!document.querySelector('script[data-wa-gtag]')) {
      const script = document.createElement('script');
      script.async = true;
      script.dataset.waGtag = '1';
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
      document.head.appendChild(script);
    }
    window.waTrack = function (name, params) {
      try { if (localStorage.getItem('waAnalyticsConsent') === 'granted') window.gtag('event', name, params || {}); } catch (error) {}
    };
    const saved = get('waAnalyticsConsent', '');
    if (saved) gtag('consent', 'update', { analytics_storage: saved === 'granted' ? 'granted' : 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => console.warn('Wealth Arrays service worker registration failed:', error));
  }

  function installRuntimeStyles() {
    if (document.getElementById('wa-core-css')) return;
    const style = document.createElement('style');
    style.id = 'wa-core-css';
    style.textContent = '.tool-search-shell{position:relative!important;z-index:100!important;overflow:visible!important}.tool-search-shell input{position:relative!important;z-index:101!important}#tool-search-results{position:absolute!important;left:0!important;right:0!important;top:calc(100% + 8px)!important;z-index:2147483647!important;background:var(--surface,#fff)!important;border:1px solid var(--line,#e2e6ed)!important;border-radius:14px!important;overflow:hidden!important;box-shadow:0 18px 50px rgba(0,0,0,.16)!important}#tool-search-results[hidden]{display:none!important}.wa-search-suggestion{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px;padding:13px 15px;text-decoration:none!important;color:inherit!important;background:var(--surface,#fff)!important;border-bottom:1px solid var(--line,#e2e6ed)!important}.wa-search-suggestion strong,.wa-search-suggestion small{display:block}.wa-search-suggestion small{margin-top:3px;color:var(--muted)}.tool-search-empty{padding:14px;color:var(--muted)}';
    document.head.appendChild(style);
  }

  function init() {
    renderFooter();
    addRelatedAndTrust();
    applyTheme(get('waTheme', 'light'));
    applyCurrency();
    applyCategories();
    calculatorSearch();
    analytics();
    registerServiceWorker();
    installRuntimeStyles();
    document.querySelectorAll('#language-select').forEach((node) => node.remove());
    const themeButton = document.getElementById('theme-toggle');
    if (themeButton && !themeButton.dataset.waThemeOwner) {
      themeButton.dataset.waThemeOwner = '1';
      themeButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
      }, true);
    }
  }

  window.WA = { currencies: CURRENCIES };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
