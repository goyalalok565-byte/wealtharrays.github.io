/* Wealth Arrays core runtime — one owner for shared site behaviour. */
(function () {
  'use strict';
  if (window.__WEALTH_ARRAYS_CORE_LOADED__) return;
  window.__WEALTH_ARRAYS_CORE_LOADED__ = true;

  const CURRENCIES = [
    ['USD','$','US Dollar'],['EUR','€','Euro'],['JPY','¥','Japanese Yen'],['GBP','£','British Pound'],
    ['AUD','A$','Australian Dollar'],['CAD','C$','Canadian Dollar'],['CHF','CHF','Swiss Franc'],['CNY','CN¥','Chinese Yuan'],
    ['HKD','HK$','Hong Kong Dollar'],['NZD','NZ$','New Zealand Dollar'],['SEK','kr','Swedish Krona'],['KRW','₩','South Korean Won'],
    ['SGD','S$','Singapore Dollar'],['NOK','kr','Norwegian Krone'],['MXN','MX$','Mexican Peso'],['INR','₹','Indian Rupee'],
    ['ZAR','R','South African Rand'],['BRL','R$','Brazilian Real'],['AED','د.إ','UAE Dirham'],['SAR','﷼','Saudi Riyal'],
    ['TRY','₺','Turkish Lira'],['PLN','zł','Polish Zloty'],['THB','฿','Thai Baht'],['IDR','Rp','Indonesian Rupiah'],
    ['MYR','RM','Malaysian Ringgit'],['PHP','₱','Philippine Peso'],['DKK','kr','Danish Krone'],['ILS','₪','Israeli Shekel'],
    ['CZK','Kč','Czech Koruna'],['HUF','Ft','Hungarian Forint']
  ];

  const RELATED = {
    investment:[['sip-calculator.html','SIP Calculator'],['compound-interest-calculator.html','Compound Interest'],['lumpsum-calculator.html','Lump Sum Calculator'],['cagr-calculator.html','CAGR Calculator'],['roi-calculator.html','ROI Calculator']],
    loan:[['mortgage-emi-calculator.html','Mortgage & EMI'],['car-loan-calculator.html','Car Loan'],['personal-loan-calculator.html','Personal Loan'],['debt-payoff-calculator.html','Debt Payoff']],
    banking:[['fixed-deposit-calculator.html','Fixed Deposit'],['recurring-deposit-calculator.html','Recurring Deposit'],['simple-interest-calculator.html','Simple Interest'],['inflation-calculator.html','Inflation']],
    retirement:[['retirement-calculator.html','Retirement'],['inflation-calculator.html','Inflation'],['compound-interest-calculator.html','Compound Interest'],['net-worth-calculator.html','Net Worth']],
    salary:[['salary-to-hourly-calculator.html','Salary to Hourly'],['overtime-pay-calculator.html','Overtime Pay'],['freelance-rate-calculator.html','Freelance Rate'],['income-tax-planner.html','Income Tax Planner']],
    business:[['profit-margin-calculator.html','Profit Margin'],['roi-calculator.html','ROI Calculator'],['freelance-rate-calculator.html','Freelance Rate'],['income-tax-planner.html','Income Tax Planner']]
  };

  const CALCULATOR_CATALOG = [
    ['SIP Calculator','sip-calculator.html','Monthly investing and projected wealth.','sip systematic investment plan monthly mutual fund investing'],
    ['Compound Interest','compound-interest-calculator.html','See how compounding changes growth over time.','compound interest compounding savings growth investing'],
    ['Mortgage / EMI','mortgage-emi-calculator.html','Estimate monthly payment and total interest.','mortgage emi home loan loan payment interest'],
    ['ROI Calculator','roi-calculator.html','Measure total and annualized investment return.','roi return investment profit annualized'],
    ['Simple Interest','simple-interest-calculator.html','Calculate flat interest on principal.','simple interest banking loan deposit'],
    ['Retirement Calculator','retirement-calculator.html','Estimate a financial-independence target.','retirement fire pension financial independence goal'],
    ['Salary to Hourly','salary-to-hourly-calculator.html','Convert annual salary and hourly pay.','salary hourly wage income pay'],
    ['Profit Margin','profit-margin-calculator.html','Calculate revenue, cost and margin.','profit margin business revenue cost'],
    ['Fixed Deposit','fixed-deposit-calculator.html','Project deposit growth and maturity value.','fixed deposit fd banking maturity interest'],
    ['Recurring Deposit','recurring-deposit-calculator.html','Plan monthly deposits and maturity value.','recurring deposit rd monthly banking maturity'],
    ['Lumpsum Calculator','lumpsum-calculator.html','Project a one-time investment.','lumpsum lump sum investment one time'],
    ['CAGR Calculator','cagr-calculator.html','Calculate compound annual growth rate.','cagr compound annual growth rate return'],
    ['Car Loan EMI','car-loan-calculator.html','Plan vehicle-loan payments and interest.','car loan auto vehicle emi repayment'],
    ['Personal Loan','personal-loan-calculator.html','Estimate personal-loan repayment cost.','personal loan emi payment repayment'],
    ['Debt Payoff','debt-payoff-calculator.html','Plan a faster route out of debt.','debt payoff repayment credit loan'],
    ['Inflation Calculator','inflation-calculator.html','Understand future purchasing power.','inflation future value purchasing power prices'],
    ['Net Worth','net-worth-calculator.html','Track assets minus liabilities.','net worth assets liabilities wealth'],
    ['Overtime Pay','overtime-pay-calculator.html','Estimate overtime earnings.','overtime pay salary wage income'],
    ['Freelance Rate','freelance-rate-calculator.html','Turn target income into an hourly rate.','freelance rate hourly pricing business income'],
    ['Income Tax Planner','income-tax-planner.html','Plan transparent tax scenarios.','income tax planner effective rate tax'],
  ];

  const get = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch (error) { return fallback; } };
  const set = (key, value) => { try { localStorage.setItem(key, value); } catch (error) {} };

  function renderFooter() {
    let footer = document.querySelector('footer');
    document.querySelectorAll('footer').forEach((node, index) => { if (index > 0) node.remove(); });
    if (!footer) { footer = document.createElement('footer'); document.body.appendChild(footer); }
    footer.className = 'site-footer premium-footer';
    footer.innerHTML = '<div class="site-footer-inner"><div class="footer-brand-row"><a class="footer-logo" href="/index.html" aria-label="Wealth Arrays home"><img src="/favicon-v2.svg" alt="Wealth Arrays logo" width="44" height="44"><span><b>Wealth Arrays</b><small>Financial tools that make numbers clearer.</small></span></a><p class="footer-brand-copy">Fast, browser-first financial calculators for clearer decisions. Results are educational estimates and not financial, tax, legal or investment advice.</p></div><nav class="footer-nav-box" aria-label="Company and legal pages"><a class="footer-link" href="/privacy.html">Privacy Policy</a><a class="footer-link" href="/terms.html">Terms &amp; Conditions</a><a class="footer-link" href="/disclaimer.html">Disclaimer</a><a class="footer-link" href="/about.html">About Us</a><a class="footer-link" href="/contact.html">Contact Us</a><a class="footer-link" href="/methodology.html">Methodology</a><a class="footer-link" href="/editorial-policy.html">Editorial Standards</a><a class="footer-link" href="/advertising-policy.html">Advertising Policy</a><a class="footer-link" href="/faq.html">FAQ</a><button class="footer-link" type="button" data-wa-open-consent>Privacy choices</button></nav><div class="footer-bottom"><span>© 2026 Wealth Arrays</span><span>Questions or corrections: <a href="mailto:goyalalok565@gmail.com">goyalalok565@gmail.com</a></span></div></div>';
  }

  function addRelatedAndTrust() {
    const article = document.querySelector('.tool-article');
    if (!article) return;
    const tag = document.querySelector('.calc-category-tag');
    if (!document.querySelector('.wa-related') && tag) {
      const href = tag.getAttribute('href') || '';
      const key = href.includes('investment') ? 'investment' : href.includes('loan') ? 'loan' : href.includes('banking') ? 'banking' : href.includes('retirement') ? 'retirement' : href.includes('salary') ? 'salary' : href.includes('business') ? 'business' : '';
      const current = location.pathname.split('/').pop() || 'index.html';
      const items = (RELATED[key] || []).filter((item) => item[0] !== current).slice(0, 4);
      if (items.length) {
        const section = document.createElement('section'); section.className = 'related-tools wa-related'; section.setAttribute('aria-label', 'Related calculators');
        section.innerHTML = '<div class="related-heading">Related calculators</div><div class="related-list">' + items.map((item) => '<a href="' + item[0] + '">' + item[1] + ' <span>→</span></a>').join('') + '</div><div class="calc-next-links"><a href="' + href + '">Browse this category →</a><a href="/tools.html">Explore all 20 calculators →</a><a href="/faq.html">Read calculator FAQs →</a></div>'; article.appendChild(section);
      }
    }
    if (!document.querySelector('.wa-trust-signals')) {
      const section = document.createElement('aside'); section.className = 'wa-trust-signals'; section.setAttribute('aria-label', 'Calculator methodology and trust information');
      section.innerHTML = '<div><strong>Transparent assumptions</strong><span>Results depend on the values and formula shown on this page.</span></div><div><strong>Educational estimates</strong><span>These tools do not replace financial, tax, legal or investment advice.</span></div><div><strong>Your browser</strong><span>Calculator inputs are designed to be processed locally where possible.</span></div><p><a href="/disclaimer.html">Disclaimer</a><a href="/privacy.html">Privacy</a><a href="/contact.html">Contact &amp; corrections</a></p>'; article.appendChild(section);
    }
  }

  function applyTheme(themeName) { const theme = themeName === 'dark' ? 'dark' : 'light'; document.documentElement.dataset.theme = theme; set('waTheme', theme); const button = document.getElementById('theme-toggle'); if (button) { button.setAttribute('aria-pressed', String(theme === 'dark')); button.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode'); const label = button.querySelector('[data-theme-label]'); if (label) label.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode'; } }
  function setupTheme() { applyTheme(get('waTheme', document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')); if (document.documentElement.dataset.waThemeOwner === '1') return; document.documentElement.dataset.waThemeOwner = '1'; document.addEventListener('click', function (event) { const button = event.target.closest && event.target.closest('#theme-toggle'); if (!button) return; event.preventDefault(); applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); }, true); }
  function applyCurrency() { const select = document.getElementById('currency-select'); if (!select) return; const saved = get('waCurrency', 'INR'); select.innerHTML = CURRENCIES.map((item) => '<option value="' + item[0] + '">' + item[0] + ' · ' + item[1] + ' · ' + item[2] + '</option>').join(''); select.value = CURRENCIES.some((item) => item[0] === saved) ? saved : 'INR'; document.documentElement.dataset.currency = select.value; if (select.dataset.waCurrencyOwner === '1') return; select.dataset.waCurrencyOwner = '1'; select.addEventListener('change', function () { set('waCurrency', select.value); document.documentElement.dataset.currency = select.value; window.dispatchEvent(new CustomEvent('wa-currency', { detail: { currency: select.value } })); if (typeof window.waTrack === 'function') window.waTrack('currency_change', { currency: select.value }); }); }
  function applyCategories() { const colors = { investment:'#0F766E', loan:'#B45309', banking:'#2563EB', retirement:'#6D28D9', salary:'#BE185D', business:'#0E7490' }; document.querySelectorAll('.home-tool-card,.tool-card,.ledger-row').forEach((card) => { const text = ((card.dataset.search || '') + ' ' + card.textContent).toLowerCase(); let key = 'investment'; if (/mortgage|emi|loan|debt/.test(text)) key = 'loan'; else if (/retirement|pension|freedom/.test(text)) key = 'retirement'; else if (/salary|hourly|overtime|wage|income/.test(text)) key = 'salary'; else if (/business|profit margin|freelance/.test(text)) key = 'business'; else if (/fd|fixed deposit|rd|recurring deposit|banking|interest/.test(text)) key = 'banking'; card.dataset.waCategory = key; card.style.setProperty('--wa-card-accent', colors[key]); }); }

  function calculatorSearch() {
    let input = document.getElementById('tool-search');
    let box = document.getElementById('tool-search-results');
    if (!input || !box) {
      const host = document.querySelector('.calc-page');
      const title = host && host.querySelector('.calc-title');
      if (!host) return;
      const shell = document.createElement('div');
      shell.className = 'tool-search-shell wa-calculator-search';
      shell.innerHTML = '<input id="tool-search" type="search" autocomplete="off" placeholder="Search any calculator: SIP, EMI, FD, ROI…" aria-label="Search calculators"><div id="tool-search-results" class="tool-search-results" hidden></div>';
      if (title) title.insertAdjacentElement('afterend', shell); else host.insertBefore(shell, host.firstChild);
      input = shell.querySelector('#tool-search');
      box = shell.querySelector('#tool-search-results');
    }
    if (!input || !box || input.dataset.waSearchOwner === '1') return;
    input.dataset.waSearchOwner = '1';
    const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    const aliases = {sip:'systematic investment plan monthly mutual fund',emi:'mortgage home loan monthly payment',fd:'fixed deposit banking',rd:'recurring deposit monthly banking',roi:'return investment profit',cagr:'compound annual growth return',tax:'income tax planner',salary:'hourly wage income',loan:'mortgage personal car debt',retirement:'pension financial independence',inflation:'purchasing power future prices',lumpsum:'lump sum investment','net worth':'assets liabilities wealth',networth:'assets liabilities wealth','compound interest':'compounding growth','simple interest':'flat interest','profit margin':'business revenue cost margin','car loan':'vehicle loan emi','personal loan':'loan repayment',freelance:'freelance rate hourly pricing',overtime:'overtime pay salary'};
    function render() {
      const query = normalize(input.value);
      if (!query) { box.innerHTML = ''; box.hidden = true; box.style.display = 'none'; return; }
      const terms = (query + ' ' + (aliases[query] || '')).split(/\s+/).filter(Boolean);
      const hits = CALCULATOR_CATALOG.map(item => { const hay = normalize(item[0] + ' ' + item[2] + ' ' + item[3]); let score = hay.includes(query) ? 100 : 0; terms.forEach(term => { if (term.length > 1 && hay.includes(term)) score += term === query ? 20 : 4; }); return {item,score}; }).filter(x => x.score > 0).sort((a,b) => b.score-a.score).slice(0,8);
      const cards = Array.from(document.querySelectorAll('.home-tool-card,.tool-card,.cat-card,.ledger-row')).map(card => { const hay = normalize((card.dataset.search || '') + ' ' + card.textContent); let score = hay.includes(query) ? 80 : 0; terms.forEach(term => { if (term.length > 1 && hay.includes(term)) score += 2; }); return {card,score}; }).filter(x => x.score > 0).sort((a,b) => b.score-a.score).slice(0,4);
      const merged = hits.map(({item}) => ({title:item[0],desc:item[2],href:'/' + item[1],score:1000})).concat(cards.map(({card,score}) => ({title:(card.querySelector('b,h2,h3')?.textContent || 'Calculator').trim(),desc:(card.querySelector('p,small')?.textContent || '').trim(),href:card.getAttribute('href') || '#',score}))).filter((item,i,self) => self.findIndex(x => x.href === item.href) === i).sort((a,b) => b.score-a.score).slice(0,8);
      box.innerHTML = merged.length ? merged.map(item => '<a class="wa-search-suggestion" href="' + item.href + '"><span><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.desc) + '</small></span><b aria-hidden="true">→</b></a>').join('') : '<div class="tool-search-empty">No calculator found. Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';
      box.hidden = false; box.style.setProperty('display','block','important');
    }
    ['input','keyup','search','focus'].forEach(name => input.addEventListener(name, render, true));
    input.addEventListener('keydown', event => { if (event.key === 'Escape') { box.hidden = true; box.style.display = 'none'; input.blur(); } }, true);
    document.addEventListener('click', event => { if (!input.contains(event.target) && !box.contains(event.target)) { box.hidden = true; box.style.display = 'none'; } }, true);
    render();
  }

  function analytics() { const id = 'G-GYN4W5VFEY'; window.dataLayer = window.dataLayer || []; function gtag() { window.dataLayer.push(arguments); } window.gtag = window.gtag || gtag; gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500}); gtag('js', new Date()); gtag('config', id, { anonymize_ip: true }); if (!document.querySelector('script[data-wa-gtag]')) { const script = document.createElement('script'); script.async = true; script.dataset.waGtag = '1'; script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id); document.head.appendChild(script); } window.waTrack = function (name, params) { try { if (get('waAnalyticsConsent','') === 'granted') window.gtag('event', name, params || {}); } catch (error) {} }; const saved = get('waAnalyticsConsent',''); if (saved) gtag('consent','update',{analytics_storage:saved === 'granted' ? 'granted' : 'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'}); }
  function consentDialog() {
    let box = document.getElementById('wa-consent');
    let style = document.getElementById('wa-consent-css');
    if (!style) {
      style = document.createElement('style'); style.id = 'wa-consent-css';
      style.textContent = '#wa-consent{position:fixed;z-index:100001;left:16px;right:16px;bottom:16px;margin:auto;width:min(620px,calc(100% - 32px));display:flex;align-items:center;justify-content:space-between;gap:18px;padding:15px 16px;border:1px solid var(--line,#e2e6ed);border-radius:16px;background:var(--surface,#fff);color:var(--text,#10141b);box-shadow:0 16px 48px rgba(0,0,0,.18);font:500 13px/1.4 system-ui,sans-serif}#wa-consent[hidden]{display:none!important}#wa-consent p{margin:3px 0 0;color:var(--muted,#667085);font-size:11px}.wa-consent-actions{display:flex;gap:8px;flex:none}.wa-consent-actions button{padding:9px 14px;border-radius:9px;font:800 11px system-ui,sans-serif;cursor:pointer}.wa-consent-actions button[data-wa-consent="reject"]{background:transparent;color:var(--text,#10141b);border:1px solid var(--text,#10141b)}.wa-consent-actions button[data-wa-consent="accept"]{background:var(--text,#10141b);color:var(--bg,#fff);border:1px solid var(--text,#10141b)}html[data-theme="dark"] .wa-consent-actions button[data-wa-consent="reject"]{color:#fff;border-color:#fff}html[data-theme="dark"] .wa-consent-actions button[data-wa-consent="accept"]{background:#fff;color:#080a0f;border-color:#fff}@media(max-width:560px){#wa-consent{align-items:stretch;flex-direction:column;gap:10px}.wa-consent-actions{justify-content:flex-end}}';
      document.head.appendChild(style);
    }
    if (!box) {
      box = document.createElement('aside'); box.id = 'wa-consent'; box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true'); box.setAttribute('aria-label','Privacy choices');
      box.innerHTML = '<div><strong>Privacy choices</strong><p>We use analytics only with your permission to understand site usage and improve Wealth Arrays.</p></div><div class="wa-consent-actions"><button type="button" data-wa-consent="reject">Reject</button><button type="button" data-wa-consent="accept">Accept</button></div>';
      document.body.appendChild(box);
      box.addEventListener('click', event => { const button = event.target.closest('[data-wa-consent]'); if (!button) return; const granted = button.dataset.waConsent === 'accept'; set('waAnalyticsConsent', granted ? 'granted' : 'denied'); if (typeof window.gtag === 'function') window.gtag('consent','update',{analytics_storage:granted ? 'granted' : 'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'}); box.hidden = true; });
    }
    document.addEventListener('click', event => { const opener = event.target.closest && event.target.closest('[data-wa-open-consent]'); if (!opener) return; event.preventDefault(); box.hidden = false; const accept = box.querySelector('[data-wa-consent="accept"]'); if (accept) setTimeout(() => accept.focus(),0); }, true);
    box.hidden = !!get('waAnalyticsConsent','');
  }


  let installEvent = null;
  function installStyles() { if (document.getElementById('wa-install-css')) return; const style = document.createElement('style'); style.id = 'wa-install-css'; style.textContent = '#wa-install{position:fixed;z-index:100000;left:16px;right:16px;bottom:92px;margin:auto;width:min(620px,calc(100% - 32px));display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 16px;border:1px solid var(--line,#e2e6ed);border-radius:16px;background:var(--surface,#fff);color:var(--text,#10141b);box-shadow:0 16px 48px rgba(0,0,0,.18);font:600 13px/1.35 system-ui,sans-serif}#wa-install p{margin:3px 0 0;color:var(--muted,#667085);font-size:11px}#wa-install .wa-install-actions{display:flex;gap:8px;align-items:center;flex:none}#wa-install button{padding:9px 13px;border-radius:9px;font:800 11px system-ui,sans-serif;cursor:pointer}#wa-install button[data-wa-install-action=install]{background:var(--text,#10141b);color:var(--bg,#fff);border:1px solid var(--text,#10141b)}#wa-install button[data-wa-install-action=close]{background:transparent;color:var(--text,#10141b);border:1px solid var(--line,#e2e6ed)}@media(max-width:560px){#wa-install{bottom:140px;align-items:stretch;flex-direction:column;gap:9px}.wa-install-actions{justify-content:flex-end}}'; document.head.appendChild(style); }
  function showInstallBanner() { if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return; const dismissed = Number(get('waInstallDismissed','0')); if (dismissed && Date.now() - dismissed < 7*24*60*60*1000) return; if (document.getElementById('wa-install')) return; installStyles(); const box = document.createElement('aside'); box.id = 'wa-install'; box.setAttribute('role','status'); box.innerHTML = '<div><strong>Install Wealth Arrays</strong><p>Use Wealth Arrays like an app from your home screen.</p></div><div class="wa-install-actions"><button type="button" data-wa-install-action="close">Not now</button><button type="button" data-wa-install-action="install">Install app</button></div>'; document.body.appendChild(box); box.addEventListener('click', async function(event){ const button=event.target.closest('[data-wa-install-action]'); if(!button)return; if(button.dataset.waInstallAction==='close'){set('waInstallDismissed',String(Date.now()));box.remove();return;} if(installEvent){ try{installEvent.prompt(); await installEvent.userChoice;}catch(error){} installEvent=null; window.__WA_INSTALL_PROMPT__=null; box.remove(); return; } const ua=navigator.userAgent||''; let msg='Use your browser menu and choose “Install Wealth Arrays” or “Add to Home screen”.'; if(/iPhone|iPad|iPod/i.test(ua)) msg='On iPhone/iPad, tap Share → Add to Home Screen.'; alert(msg); }); }
  window.addEventListener('beforeinstallprompt', function(event){ event.preventDefault(); installEvent=event; window.__WA_INSTALL_PROMPT__=event; showInstallBanner(); }, false);
  window.addEventListener('appinstalled', function(){ installEvent=null; window.__WA_INSTALL_PROMPT__=null; const box=document.getElementById('wa-install'); if(box) box.remove(); set('waInstallDismissed',String(Date.now())); });
  function registerServiceWorker() { if (!('serviceWorker' in navigator) || !window.isSecureContext) return; const start = () => navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(() => {}); if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true }); else start(); }
  function installPromptInit() { setTimeout(() => { if (installEvent) showInstallBanner(); }, 900); }
  function styles() { if (document.getElementById('wa-core-css')) return; const style = document.createElement('style'); style.id = 'wa-core-css'; style.textContent = '.tool-search-shell{position:relative!important;z-index:100!important;overflow:visible!important}.tool-search-shell input{position:relative!important;z-index:101!important}#tool-search-results{position:absolute!important;left:0!important;right:0!important;top:calc(100% + 8px)!important;z-index:2147483647!important;background:var(--surface,#fff)!important;border:1px solid var(--line,#e2e6ed)!important;border-radius:14px!important;overflow:hidden!important;box-shadow:0 18px 50px rgba(0,0,0,.16)!important}.wa-search-suggestion{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px;padding:13px 15px;text-decoration:none!important;color:inherit!important;background:var(--surface,#fff)!important;border-bottom:1px solid var(--line,#e2e6ed)!important}.wa-search-suggestion span{display:grid;gap:2px;min-width:0}.wa-search-suggestion small{color:var(--muted,#667085);font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wa-search-suggestion>b{flex:none}.tool-search-empty{padding:14px;color:var(--muted,#667085);font-size:11px}.tool-card[data-wa-category],.home-tool-card[data-wa-category],.ledger-row[data-wa-category]{position:relative!important;box-sizing:border-box!important;background:var(--surface)!important;border-left:1.5px solid var(--line)!important;border-right:1.5px solid var(--line)!important;border-bottom:1.5px solid var(--line)!important;border-top:3.5px solid var(--wa-card-accent)!important;border-radius:18px!important;box-shadow:0 6px 20px rgba(16,24,40,.06)!important;overflow:hidden}'; document.head.appendChild(style); }
  function init() { styles(); setupTheme(); applyCurrency(); applyCategories(); calculatorSearch(); addRelatedAndTrust(); renderFooter(); analytics(); consentDialog(); registerServiceWorker(); installPromptInit(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true }); else init();
})();