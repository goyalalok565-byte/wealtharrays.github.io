from pathlib import Path
import re

ROOT = Path('.')
CORE = ROOT / 'wa-core.js'

CATALOG = """  const CALCULATOR_CATALOG = [
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

"""

SEARCH = r'''  function calculatorSearch() {
    let input = document.getElementById('tool-search');
    let box = document.getElementById('tool-search-results');
    if (!input || !box) {
      const host = document.querySelector('.calc-page') || document.querySelector('.tool-article') || document.querySelector('main');
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
'''

CONSENT = r'''  function consentDialog() {
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
'''

s = CORE.read_text()
if 'const CALCULATOR_CATALOG' not in s:
    marker = '  const get = (key, fallback) => {'
    if marker not in s: raise SystemExit('catalog marker missing')
    s = s.replace(marker, CATALOG + marker, 1)

s, n = re.subn(r'  function calculatorSearch\(\) \{.*?\n  \}\n\n  function analytics\(\)', SEARCH + '\n  function analytics()', s, count=1, flags=re.S)
if n != 1: raise SystemExit('calculatorSearch replacement failed')

s, n = re.subn(r'  function consentDialog\(\) \{.*?\n\n  let installEvent = null;', CONSENT + '\n\n  let installEvent = null;', s, count=1, flags=re.S)
if n != 1: raise SystemExit('consentDialog replacement failed')

s = s.replace("bottom:16px;margin:auto;width:min(620px,calc(100% - 32px));display:flex;align-items:center;justify-content:space-between;gap:14px", "bottom:92px;margin:auto;width:min(620px,calc(100% - 32px));display:flex;align-items:center;justify-content:space-between;gap:14px", 1)
s = s.replace("@media(max-width:560px){#wa-install{align-items:stretch;flex-direction:column;gap:9px}", "@media(max-width:560px){#wa-install{bottom:140px;align-items:stretch;flex-direction:column;gap:9px}", 1)
s = s.replace("if (get('waInstallDismissed','') === '1' || document.getElementById('wa-install')) return;", "const dismissed = Number(get('waInstallDismissed','0')); if (dismissed && Date.now() - dismissed < 7*24*60*60*1000) return; if (document.getElementById('wa-install')) return;", 1)
s = s.replace("set('waInstallDismissed','1');box.remove();return;", "set('waInstallDismissed',String(Date.now()));box.remove();return;", 1)
s = s.replace("set('waInstallDismissed','1'); });", "set('waInstallDismissed',String(Date.now())); });", 1)
s = s.replace("function installPromptInit() { setTimeout(showInstallBanner, 900); }", "function installPromptInit() { setTimeout(() => { if (installEvent) showInstallBanner(); }, 900); }")

footer_marker = '<a class="footer-link" href="/faq.html">FAQ</a></nav>'
if footer_marker in s:
    s = s.replace(footer_marker, '<a class="footer-link" href="/faq.html">FAQ</a><button class="footer-link" type="button" data-wa-open-consent>Privacy choices</button></nav>', 1)
else:
    raise SystemExit('footer marker missing')
CORE.write_text(s)

pages = sorted(ROOT.glob('*.html')) + sorted((ROOT/'articles').glob('*.html'))
managed = ('wa-core.js','site-runtime.js','final-polish.js','wa-enhancements.js','calculator-runtime.js','calculators.js','widget.js','smart.js')
for page in pages:
    text = page.read_text()
    text = re.sub(r'wa-core\.js\?v=[^"\']+', 'wa-core.js?v=20260914-5', text)
    text = re.sub(r'<link\s+rel=["\']manifest["\'][^>]*>\s*', '', text, flags=re.I)
    text = text.replace('</head>', '<link rel="manifest" href="/manifest.webmanifest"></head>', 1)
    seen = set()
    def dedupe(match):
        src = match.group(1); base = src.split('?',1)[0].lstrip('/')
        if base not in managed: return match.group(0)
        if base in seen: return ''
        seen.add(base); return match.group(0)
    text = re.sub(r'<script\s+src=["\']([^"\']+)["\'][^>]*></script>', dedupe, text, flags=re.I)
    page.write_text(text)

(ROOT/'sw.js').write_text("""const VERSION='wealtharrays-pwa-2';
const STATIC_CACHE=VERSION+'-static';
const STATIC_ASSETS=['/','/index.html','/tools.html','/styles.css','/wa-core.js','/site-runtime.js','/calculator-runtime.js','/wa-enhancements.js','/final-polish.js','/manifest.webmanifest','/favicon-v2.svg','/icon-192.png','/icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(STATIC_CACHE).then(cache=>cache.addAll(STATIC_ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==STATIC_CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin!==self.location.origin)return;if(request.mode==='navigate'){event.respondWith(fetch(request).then(response=>{const copy=response.clone();caches.open(STATIC_CACHE).then(cache=>cache.put(request,copy));return response;}).catch(()=>caches.match(request).then(hit=>hit||caches.match('/index.html'))));return;}event.respondWith(caches.match(request).then(hit=>hit||fetch(request).then(response=>{const copy=response.clone();if(response.ok)caches.open(STATIC_CACHE).then(cache=>cache.put(request,copy));return response;}).catch(()=>hit)));});
""")

(ROOT/'RELEASE-AUDIT.json').write_text('{\n  "release": "2026-09-14-production-hardening",\n  "search": "universal-catalog",\n  "privacy_choices": "reopenable",\n  "pwa_install": "native-prompt-gesture-safe",\n  "service_worker": "offline-shell-v2",\n  "script_dedupe": true,\n  "adsense_account": "not-configured"\n}\n')
