/* Wealth Arrays canonical site runtime bundle. Generated 20260917. */
(function(){const key="__WA_CANONICAL_SITE_RUNTIME_BUNDLE__";if(window[key])return;window[key]=true;})();
/* ===== WA CANONICAL MODULE | site | wa-core.js | sha256:5e2efc7e2d57 ===== */
/* Wealth Arrays core runtime — one owner for shared site behaviour. */
(function () {
  'use strict';
  if (window.__WEALTH_ARRAYS_CORE_LOADED__) return;
  window.__WEALTH_ARRAYS_CORE_LOADED__ = true;
  const CURRENCIES=[['USD','$','US Dollar'],['EUR','€','Euro'],['JPY','¥','Japanese Yen'],['GBP','£','British Pound'],['AUD','A$','Australian Dollar'],['CAD','C$','Canadian Dollar'],['CHF','CHF','Swiss Franc'],['CNY','CN¥','Chinese Yuan'],['HKD','HK$','Hong Kong Dollar'],['NZD','NZ$','New Zealand Dollar'],['SEK','kr','Swedish Krona'],['KRW','₩','South Korean Won'],['SGD','S$','Singapore Dollar'],['NOK','kr','Norwegian Krone'],['MXN','MX$','Mexican Peso'],['INR','₹','Indian Rupee'],['ZAR','R','South African Rand'],['BRL','R$','Brazilian Real'],['AED','د.إ','UAE Dirham'],['SAR','﷼','Saudi Riyal'],['TRY','₺','Turkish Lira'],['PLN','zł','Polish Zloty'],['THB','฿','Thai Baht'],['IDR','Rp','Indonesian Rupiah'],['MYR','RM','Malaysian Ringgit'],['PHP','₱','Philippine Peso'],['DKK','kr','Danish Krone'],['ILS','₪','Israeli Shekel'],['CZK','Kč','Czech Koruna'],['HUF','Ft','Hungarian Forint']];
  const RELATED={investment:[['sip-calculator.html','SIP Calculator'],['compound-interest-calculator.html','Compound Interest'],['lumpsum-calculator.html','Lump Sum Calculator'],['cagr-calculator.html','CAGR Calculator'],['roi-calculator.html','ROI Calculator']],loan:[['mortgage-emi-calculator.html','Mortgage & EMI'],['car-loan-calculator.html','Car Loan'],['personal-loan-calculator.html','Personal Loan'],['debt-payoff-calculator.html','Debt Payoff']],banking:[['fixed-deposit-calculator.html','Fixed Deposit'],['recurring-deposit-calculator.html','Recurring Deposit'],['simple-interest-calculator.html','Simple Interest'],['inflation-calculator.html','Inflation']],retirement:[['retirement-calculator.html','Retirement'],['inflation-calculator.html','Inflation'],['compound-interest-calculator.html','Compound Interest'],['net-worth-calculator.html','Net Worth']],salary:[['salary-to-hourly-calculator.html','Salary to Hourly'],['overtime-pay-calculator.html','Overtime Pay'],['freelance-rate-calculator.html','Freelance Rate'],['income-tax-scenario-calculator.html','Income Tax Scenario Calculator']],business:[['profit-margin-calculator.html','Profit Margin'],['roi-calculator.html','ROI Calculator'],['freelance-rate-calculator.html','Freelance Rate'],['income-tax-scenario-calculator.html','Income Tax Scenario Calculator']]};
  const CALCULATOR_CATALOG=[['SIP Calculator','sip-calculator.html','Monthly investing and projected wealth.','sip systematic investment plan monthly mutual fund investing'],['Compound Interest','compound-interest-calculator.html','See how compounding changes growth over time.','compound interest compounding savings growth investing'],['Mortgage / EMI','mortgage-emi-calculator.html','Estimate monthly payment and total interest.','mortgage emi home loan loan payment interest'],['ROI Calculator','roi-calculator.html','Measure total and annualized investment return.','roi return investment profit annualized'],['Simple Interest','simple-interest-calculator.html','Calculate flat interest on principal.','simple interest banking loan deposit'],['Retirement Calculator','retirement-calculator.html','Estimate a financial-independence target.','retirement fire pension financial independence goal'],['Salary to Hourly','salary-to-hourly-calculator.html','Convert annual salary and hourly pay.','salary hourly wage income pay'],['Profit Margin','profit-margin-calculator.html','Calculate revenue, cost and margin.','profit margin business revenue cost'],['Fixed Deposit','fixed-deposit-calculator.html','Project deposit growth and maturity value.','fixed deposit fd banking maturity interest'],['Recurring Deposit','recurring-deposit-calculator.html','Plan monthly deposits and maturity value.','recurring deposit rd monthly banking maturity'],['Lumpsum Calculator','lumpsum-calculator.html','Project a one-time investment.','lumpsum lump sum investment one time'],['CAGR Calculator','cagr-calculator.html','Calculate compound annual growth rate.','cagr compound annual growth rate return'],['Car Loan EMI','car-loan-calculator.html','Plan vehicle-loan payments and interest.','car loan auto vehicle emi repayment'],['Personal Loan','personal-loan-calculator.html','Estimate personal-loan repayment cost.','personal loan emi payment repayment'],['Debt Payoff','debt-payoff-calculator.html','Plan a faster route out of debt.','debt payoff repayment credit loan'],['Inflation Calculator','inflation-calculator.html','Understand future purchasing power.','inflation future value purchasing power prices'],['Net Worth','net-worth-calculator.html','Track assets minus liabilities.','net worth assets liabilities wealth'],['Overtime Pay','overtime-pay-calculator.html','Estimate overtime earnings.','overtime pay salary wage income'],['Freelance Rate','freelance-rate-calculator.html','Turn target income into an hourly rate.','freelance rate hourly pricing business income'],['Income Tax Scenario Calculator','income-tax-scenario-calculator.html','Explore tax scenarios using an effective-rate assumption.','income tax tax scenario effective rate planning']];
  const get=(key,fallback)=>{try{return localStorage.getItem(key)||fallback}catch(error){return fallback}};
  const set=(key,value)=>{try{localStorage.setItem(key,value)}catch(error){}};
  function renderFooter(){let footer=document.querySelector('footer');document.querySelectorAll('footer').forEach((node,index)=>{if(index>0)node.remove()});if(!footer){footer=document.createElement('footer');document.body.appendChild(footer)}footer.className='site-footer premium-footer';footer.innerHTML='<div class="site-footer-inner"><div class="footer-brand-row"><a class="footer-logo" href="/index.html" aria-label="Wealth Arrays home"><img src="/favicon-v2.svg" alt="Wealth Arrays logo" width="44" height="44"><span><b>Wealth Arrays</b><small>Financial tools that make numbers clearer.</small></span></a><p class="footer-brand-copy">Fast, browser-first financial calculators for clearer decisions. Results are educational estimates and not financial, tax, legal or investment advice.</p></div><nav class="footer-nav-box" aria-label="Company and legal pages"><a class="footer-link" href="/privacy.html">Privacy Policy</a><a class="footer-link" href="/terms.html">Terms &amp; Conditions</a><a class="footer-link" href="/disclaimer.html">Disclaimer</a><a class="footer-link" href="/about.html">About Us</a><a class="footer-link" href="/contact.html">Contact Us</a><a class="footer-link" href="/methodology.html">Methodology</a><a class="footer-link" href="/editorial-policy.html">Editorial Standards</a><a class="footer-link" href="/advertising-policy.html">Advertising Policy</a><a class="footer-link" href="/faq.html">FAQ</a><button class="footer-link" type="button" data-wa-open-consent>Privacy choices</button></nav><div class="footer-bottom"><span>© 2026 Wealth Arrays</span><span>Questions or corrections: <a href="mailto:goyalalok565@gmail.com">goyalalok565@gmail.com</a></span></div></div>'}
  function addRelatedAndTrust(){const article=document.querySelector('.tool-article');if(!article)return;const tag=document.querySelector('.calc-category-tag');if(!document.querySelector('.wa-related')&&tag){const href=tag.getAttribute('href')||'';const key=href.includes('investment')?'investment':href.includes('loan')?'loan':href.includes('banking')?'banking':href.includes('retirement')?'retirement':href.includes('salary')?'salary':href.includes('business')?'business':'';const current=location.pathname.split('/').pop()||'index.html';const items=(RELATED[key]||[]).filter(item=>item[0]!==current).slice(0,4);if(items.length){const section=document.createElement('section');section.className='related-tools wa-related';section.setAttribute('aria-label','Related calculators');section.innerHTML='<div class="related-heading">Related calculators</div><div class="related-list">'+items.map(item=>'<a href="'+item[0]+'">'+item[1]+' <span>→</span></a>').join('')+'</div><div class="calc-next-links"><a href="'+href+'">Browse this category →</a><a href="/tools.html">Explore all 20 calculators →</a><a href="/faq.html">Read calculator FAQs →</a></div>';article.appendChild(section)}}if(!document.querySelector('.wa-trust-signals')){const section=document.createElement('aside');section.className='wa-trust-signals';section.setAttribute('aria-label','Calculator methodology and trust information');section.innerHTML='<div><strong>Transparent assumptions</strong><span>Results depend on the values and formula shown on this page.</span></div><div><strong>Educational estimates</strong><span>These tools do not replace financial, tax, legal or investment advice.</span></div><div><strong>Your browser</strong><span>Calculator inputs are designed to be processed locally where possible.</span></div><p><a href="/disclaimer.html">Disclaimer</a><a href="/privacy.html">Privacy</a><a href="/contact.html">Contact &amp; corrections</a></p>';article.appendChild(section)}}
  function applyTheme(themeName){const theme=themeName==='dark'?'dark':'light';document.documentElement.dataset.theme=theme;set('waTheme',theme);const button=document.getElementById('theme-toggle');if(button){button.setAttribute('aria-pressed',String(theme==='dark'));button.setAttribute('aria-label','Switch to '+(theme==='dark'?'light':'dark')+' mode');const label=button.querySelector('[data-theme-label]');if(label)label.textContent=theme==='dark'?'Light mode':'Dark mode'}}
  function setupTheme(){applyTheme(get('waTheme',document.documentElement.dataset.theme==='dark'?'dark':'light'));if(document.documentElement.dataset.waThemeOwner==='1')return;document.documentElement.dataset.waThemeOwner='1';document.addEventListener('click',function(event){const button=event.target.closest&&event.target.closest('#theme-toggle');if(!button)return;event.preventDefault();applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark')},true)}
  function applyCurrency(){const select=document.getElementById('currency-select');if(!select)return;const saved=get('waCurrency','INR');select.innerHTML=CURRENCIES.map(item=>'<option value="'+item[0]+'">'+item[0]+' · '+item[1]+' · '+item[2]+'</option>').join('');select.value=CURRENCIES.some(item=>item[0]===saved)?saved:'INR';document.documentElement.dataset.currency=select.value;if(select.dataset.waCurrencyOwner==='1')return;select.dataset.waCurrencyOwner='1';select.addEventListener('change',function(){set('waCurrency',select.value);document.documentElement.dataset.currency=select.value;window.dispatchEvent(new CustomEvent('wa-currency',{detail:{currency:select.value}}));if(typeof window.waTrack==='function')window.waTrack('currency_change',{currency:select.value})})}
  function applyCategories(){const colors={investment:'#0F766E',loan:'#B45309',banking:'#2563EB',retirement:'#6D28D9',salary:'#BE185D',business:'#0E7490'};document.querySelectorAll('.home-tool-card,.tool-card,.ledger-row').forEach(card=>{const text=((card.dataset.search||'')+' '+card.textContent).toLowerCase();let key='investment';if(/mortgage|emi|loan|debt/.test(text))key='loan';else if(/retirement|pension|freedom/.test(text))key='retirement';else if(/salary|hourly|overtime|wage|income/.test(text))key='salary';else if(/business|profit margin|freelance/.test(text))key='business';else if(/fd|fixed deposit|rd|recurring deposit|banking|interest/.test(text))key='banking';card.dataset.waCategory=key;card.style.setProperty('--wa-card-accent',colors[key])})}
  function calculatorSearch(){let input=document.getElementById('tool-search');let box=document.getElementById('tool-search-results');if(!input||!box){const host=document.querySelector('.calc-page');const title=host&&host.querySelector('.calc-title');if(!host)return;const shell=document.createElement('div');shell.className='tool-search-shell wa-calculator-search';shell.innerHTML='<input id="tool-search" type="search" autocomplete="off" placeholder="Search any calculator: SIP, EMI, FD, ROI…" aria-label="Search calculators"><div id="tool-search-results" class="tool-search-results" hidden></div>';if(title)title.insertAdjacentElement('afterend',shell);else host.insertBefore(shell,host.firstChild);input=shell.querySelector('#tool-search');box=shell.querySelector('#tool-search-results')}if(!input||!box||input.dataset.waSearchOwner==='1')return;window.__WA_SEARCH_OWNER__='wa-core';input.dataset.waSearchOwner='1';document.querySelectorAll('.ledger-hero,.hero-copy,.search-bar').forEach(el=>{el.style.overflow='visible'});const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();const escapeHtml=value=>String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));const aliases={sip:'systematic investment plan monthly mutual fund',emi:'mortgage home loan monthly payment',fd:'fixed deposit banking',rd:'recurring deposit monthly banking',roi:'return investment profit',cagr:'compound annual growth return',tax:'income tax scenario',salary:'hourly wage income',loan:'mortgage personal car debt',retirement:'pension financial independence',inflation:'purchasing power future prices',lumpsum:'lump sum investment one time','net worth':'assets liabilities wealth',networth:'assets liabilities wealth','compound interest':'compounding growth','simple interest':'flat interest','profit margin':'business revenue cost margin','car loan':'vehicle loan emi','personal loan':'loan repayment',freelance:'freelance rate hourly pricing',overtime:'overtime pay salary'};function render(){const query=normalize(input.value);if(!query){box.innerHTML='';box.hidden=true;box.style.display='none';return}const terms=(query+' '+(aliases[query]||'')).split(/\s+/).filter(Boolean);const hits=CALCULATOR_CATALOG.map(item=>{const hay=normalize(item[0]+' '+item[2]+' '+item[3]);let score=hay.includes(query)?100:0;terms.forEach(term=>{if(term.length>1&&hay.includes(term))score+=term===query?20:4});return{item,score}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,8);const cards=Array.from(document.querySelectorAll('.home-tool-card,.tool-card,.cat-card,.ledger-row')).map(card=>{const hay=normalize((card.dataset.search||'')+' '+card.textContent);let score=hay.includes(query)?80:0;terms.forEach(term=>{if(term.length>1&&hay.includes(term))score+=2});return{card,score}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,4);const merged=hits.map(({item})=>({title:item[0],desc:item[2],href:'/'+item[1],score:1000})).concat(cards.map(({card,score})=>({title:(card.querySelector('b,h2,h3')?.textContent||'Calculator').trim(),desc:(card.querySelector('p,small')?.textContent||'').trim(),href:card.getAttribute('href')||'#',score}))).filter((item,i,self)=>self.findIndex(x=>x.href===item.href)===i).sort((a,b)=>b.score-a.score).slice(0,8);box.innerHTML=merged.length?merged.map(item=>'<a class="wa-search-suggestion" href="'+item.href+'"><span><strong>'+escapeHtml(item.title)+'</strong><small>'+escapeHtml(item.desc)+'</small></span><b aria-hidden="true">→</b></a>').join(''):'<div class="tool-search-empty">No calculator found. Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';box.hidden=false;box.style.setProperty('display','block','important')}['input','keyup','search','focus'].forEach(name=>input.addEventListener(name,render,true));input.addEventListener('keydown',event=>{if(event.key==='Escape'){box.hidden=true;box.style.display='none';input.blur()}},true);document.addEventListener('click',event=>{if(!input.contains(event.target)&&!box.contains(event.target)){box.hidden=true;box.style.display='none'}},true);render();input.setAttribute('data-wa-search-ready','1');window.__WA_SEARCH_READY__=true}
  function analytics(){const id='G-GYN4W5VFEY';window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments)}window.gtag=window.gtag||gtag;gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});gtag('js',new Date());gtag('config',id,{anonymize_ip:true});if(!document.querySelector('script[data-wa-gtag]')){const script=document.createElement('script');script.async=true;script.dataset.waGtag='1';script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);document.head.appendChild(script)}window.waTrack=function(name,params){try{if(get('waAnalyticsConsent','')==='granted')window.gtag('event',name,params||{})}catch(error){}};const saved=get('waAnalyticsConsent','');if(saved)gtag('consent','update',{analytics_storage:saved==='granted'?'granted':'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'})}
  function consentDialog(){let box=document.getElementById('wa-consent');let style=document.getElementById('wa-consent-css');if(!style){style=document.createElement('style');style.id='wa-consent-css';style.textContent='#wa-consent{position:fixed;z-index:100001;left:16px;right:16px;bottom:16px;margin:auto;width:min(620px,calc(100% - 32px));display:flex;align-items:center;justify-content:space-between;gap:18px;padding:15px 16px;border:1px solid var(--line,#e2e6ed);border-radius:16px;background:var(--surface,#fff);color:var(--text,#10141b);box-shadow:0 16px 48px rgba(0,0,0,.18);font:500 13px/1.4 system-ui,sans-serif}#wa-consent[hidden]{display:none!important}#wa-consent p{margin:3px 0 0;color:var(--muted,#667085);font-size:11px}.wa-consent-actions{display:flex;gap:8px;flex:none}.wa-consent-actions button{padding:9px 14px;border-radius:9px;font:800 11px system-ui,sans-serif;cursor:pointer}.wa-consent-actions button[data-wa-consent="reject"]{background:transparent;color:var(--text,#10141b);border:1px solid var(--text,#10141b)}.wa-consent-actions button[data-wa-consent="accept"]{background:var(--text,#10141b);color:var(--bg,#fff);border:1px solid var(--text,#10141b)}html[data-theme="dark"] .wa-consent-actions button[data-wa-consent="reject"]{color:#fff;border-color:#fff}html[data-theme="dark"] .wa-consent-actions button[data-wa-consent="accept"]{background:#fff;color:#080a0f;border-color:#fff}@media(max-width:560px){#wa-consent{align-items:stretch;flex-direction:column;gap:10px}.wa-consent-actions{justify-content:flex-end}}';document.head.appendChild(style)}if(!box){box=document.createElement('aside');box.id='wa-consent';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Privacy choices');box.innerHTML='<div><strong>Privacy choices</strong><p>We use analytics only with your permission to understand site usage and improve Wealth Arrays.</p></div><div class="wa-consent-actions"><button type="button" data-wa-consent="reject">Reject</button><button type="button" data-wa-consent="accept">Accept</button></div>';document.body.appendChild(box);box.addEventListener('click',event=>{const button=event.target.closest('[data-wa-consent]');if(!button)return;const granted=button.dataset.waConsent==='accept';set('waAnalyticsConsent',granted?'granted':'denied');if(typeof window.gtag==='function')window.gtag('consent','update',{analytics_storage:granted?'granted':'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});box.hidden=true})}document.addEventListener('click',event=>{const opener=event.target.closest&&event.target.closest('[data-wa-open-consent]');if(!opener)return;event.preventDefault();box.hidden=false;const accept=box.querySelector('[data-wa-consent="accept"]');if(accept)setTimeout(()=>accept.focus(),0)},true);box.hidden=!!get('waAnalyticsConsent','')}
  let installEvent=null;
  function installStyles(){if(document.getElementById('wa-install-css'))return;const style=document.createElement('style');style.id='wa-install-css';style.textContent='#wa-install{position:fixed;z-index:100000;left:16px;right:16px;bottom:92px;margin:auto;width:min(620px,calc(100% - 32px));display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 16px;border:1px solid var(--line,#e2e6ed);border-radius:16px;background:var(--surface,#fff);color:var(--text,#10141b);box-shadow:0 16px 48px rgba(0,0,0,.18);font:600 13px/1.35 system-ui,sans-serif}#wa-install p{margin:3px 0 0;color:var(--muted,#667085);font-size:11px}#wa-install .wa-install-actions{display:flex;gap:8px;align-items:center;flex:none}#wa-install button{padding:9px 13px;border-radius:9px;font:800 11px system-ui,sans-serif;cursor:pointer}#wa-install button[data-wa-install-action=install]{background:var(--text,#10141b);color:var(--bg,#fff);border:1px solid var(--text,#10141b)}#wa-install button[data-wa-install-action=close]{background:transparent;color:var(--text,#10141b);border:1px solid var(--line,#e2e6ed)}@media(max-width:560px){#wa-install{bottom:140px;align-items:stretch;flex-direction:column;gap:9px}.wa-install-actions{justify-content:flex-end}}';document.head.appendChild(style)}
  function showInstallBanner(){if(!installEvent||(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone===true)return;const dismissed=Number(get('waInstallDismissedV2','0'));if(dismissed&&Date.now()-dismissed<7*24*60*60*1000)return;if(document.getElementById('wa-install'))return;installStyles();const box=document.createElement('aside');box.id='wa-install';box.setAttribute('role','status');box.innerHTML='<div><strong>Install Wealth Arrays</strong><p>Use Wealth Arrays like an app from your home screen.</p></div><div class="wa-install-actions"><button type="button" data-wa-install-action="close">Not now</button><button type="button" data-wa-install-action="install">Install app</button></div>';document.body.appendChild(box);box.addEventListener('click',async function(event){const button=event.target.closest('[data-wa-install-action]');if(!button)return;if(button.dataset.waInstallAction==='close'){set('waInstallDismissedV2',String(Date.now()));box.remove();return}if(!installEvent){box.remove();return}const promptEvent=installEvent;installEvent=null;window.__WA_INSTALL_PROMPT__=null;try{promptEvent.prompt();await promptEvent.userChoice}catch(error){}box.remove()})}
  window.addEventListener('beforeinstallprompt',function(event){event.preventDefault();installEvent=event;window.__WA_INSTALL_PROMPT__=event;showInstallBanner()},false);
  window.addEventListener('appinstalled',function(){installEvent=null;window.__WA_INSTALL_PROMPT__=null;const box=document.getElementById('wa-install');if(box)box.remove();set('waInstallDismissedV2',String(Date.now()))});
  function registerServiceWorker(){if(!('serviceWorker' in navigator)||!window.isSecureContext)return;const start=()=>navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(()=>{});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start()}
  function styles(){if(document.getElementById('wa-core-css'))return;const style=document.createElement('style');style.id='wa-core-css';style.textContent='.tool-search-shell{position:relative!important;z-index:100!important;overflow:visible!important}.tool-search-shell input{position:relative!important;z-index:101!important}#tool-search-results{position:absolute!important;left:0!important;right:0!important;top:calc(100% + 8px)!important;z-index:2147483647!important;background:var(--surface,#fff)!important;border:1px solid var(--line,#e2e6ed)!important;border-radius:14px!important;overflow:hidden!important;box-shadow:0 18px 50px rgba(0,0,0,.16)!important}.wa-search-suggestion{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px;padding:13px 15px;text-decoration:none!important;color:inherit!important;background:var(--surface,#fff)!important;border-bottom:1px solid var(--line,#e2e6ed)!important}.wa-search-suggestion span{display:grid;gap:2px;min-width:0}.wa-search-suggestion small{color:var(--muted,#667085);font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wa-search-suggestion>b{flex:none}.tool-search-empty{padding:14px;color:var(--muted,#667085);font-size:11px}.tool-card[data-wa-category],.home-tool-card[data-wa-category],.ledger-row[data-wa-category]{position:relative!important;box-sizing:border-box!important;background:var(--surface)!important;border-left:1.5px solid var(--line)!important;border-right:1.5px solid var(--line)!important;border-bottom:1.5px solid var(--line)!important;border-top:3.5px solid var(--wa-card-accent)!important;border-radius:18px!important;box-shadow:0 6px 20px rgba(16,24,40,.06)!important;overflow:hidden}#tool-search-results{max-height:min(55vh,520px);overflow-y:auto!important;-webkit-overflow-scrolling:touch}.ledger-hero:has(#tool-search){overflow:visible!important}.hero-copy:has(#tool-search),.search-bar:has(#tool-search){overflow:visible!important}';document.head.appendChild(style)}
  function runSafe(name,fn){try{fn()}catch(error){try{console.error('[Wealth Arrays]',name,error)}catch(_){}}}
  function installPromptInit(){return}
  function init(){[['styles',styles],['theme',setupTheme],['currency',applyCurrency],['categories',applyCategories],['search',calculatorSearch],['related',addRelatedAndTrust],['footer',renderFooter],['analytics',analytics],['consent',consentDialog],['serviceWorker',registerServiceWorker],['install',installPromptInit]].forEach(task=>runSafe(task[0],task[1]));setTimeout(calculatorSearch,250);setTimeout(calculatorSearch,1000);window.addEventListener('load',calculatorSearch,{once:true});window.addEventListener('pageshow',calculatorSearch)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>runSafe('init',init),{once:true});else runSafe('init',init);
})();

/* ===== WA CANONICAL MODULE | site | site-runtime.js | sha256:6ab379094710 ===== */
/* Wealth Arrays visual runtime — cards, charts and defensive UX fallbacks. */
(function () {
  'use strict';
  /* Hub pages already have one shared runtime owner; keep this visual/calculator layer off them. */
  if(window.__WEALTH_ARRAYS_CORE_LOADED__&&!document.querySelector('.calc-page'))return;
  function installAdSense(){
    if(document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) return;
    var s=document.createElement('script');
    s.async=true;
    s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6507600103785450';
    s.crossOrigin='anonymous';
    document.head.appendChild(s);
  }
  function resultRows() { return Array.from(document.querySelectorAll('.calc-result-row')).map(function (row) { var text = row.querySelector('.calc-result-value')?.textContent || ''; return { label: row.querySelector('.calc-result-label')?.textContent?.trim() || '', text: text.trim(), value: Number(text.replace(/[^0-9.eE+-]/g, '')) }; }).filter(function (row) { return Number.isFinite(row.value); }); }
  function safePie(host) { var rows = resultRows().filter(function (row) { return row.value > 0; }).slice(0, 6); if (!rows.length) return; var total = rows.reduce(function (a, r) { return a + r.value; }, 0); if (!Number.isFinite(total) || total <= 0) return; var ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '0 0 200 200'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Result composition chart'); var angle = -Math.PI / 2; rows.forEach(function (r) { var next = angle + (r.value / total) * Math.PI * 2, x1 = 100 + 78 * Math.cos(angle), y1 = 100 + 78 * Math.sin(angle), x2 = 100 + 78 * Math.cos(next), y2 = 100 + 78 * Math.sin(next), large = next - angle > Math.PI ? 1 : 0; var path = document.createElementNS(ns, 'path'); path.setAttribute('d', 'M100 100 L' + x1 + ' ' + y1 + ' A78 78 0 ' + large + ' 1 ' + x2 + ' ' + y2 + ' Z'); path.setAttribute('fill', 'none'); path.setAttribute('stroke', 'currentColor'); path.setAttribute('stroke-width', '30'); path.setAttribute('stroke-dasharray', '1 1'); path.setAttribute('pathLength', '1'); path.setAttribute('stroke-dashoffset', String(-angle / (Math.PI * 2))); svg.appendChild(path); angle = next; }); host.innerHTML = ''; host.appendChild(svg); }
  function graphGuard() { document.querySelectorAll('[data-chart],.calc-chart,.chart-wrap').forEach(function (host) { var svg = host.querySelector('svg'); if (!svg) return; var rect = svg.getBoundingClientRect(); if (rect.width >= 20 && rect.height >= 20 && !/NaN|Infinity|-Infinity/.test(svg.outerHTML)) return; safePie(host); }); }
  function styles() { if (document.getElementById('wa-visual-runtime-css')) return; var style = document.createElement('style'); style.id = 'wa-visual-runtime-css'; style.textContent = '.tool-card[data-wa-category],.home-tool-card[data-wa-category],.ledger-row[data-wa-category]{position:relative!important;box-sizing:border-box!important;background:var(--surface)!important;border-left:1.5px solid var(--line)!important;border-right:1.5px solid var(--line)!important;border-bottom:1.5px solid var(--line)!important;border-top:3.5px solid var(--wa-card-accent)!important;border-radius:18px!important;box-shadow:0 6px 20px rgba(16,24,40,.06)!important;overflow:hidden}.wa-scale-safe{margin-top:14px;border:1px solid var(--line);border-radius:15px;padding:16px;background:var(--surface2)}.wa-scale-safe-head span{font-size:9px;letter-spacing:.14em;color:var(--accent);font-weight:850}.wa-scale-safe-head h3{margin:3px 0;font-size:15px}.wa-scale-safe-head p{margin:0 0 12px;color:var(--muted);font-size:10px}.wa-pie-wrap{display:grid;grid-template-columns:160px 1fr;gap:18px;align-items:center}.wa-pie-wrap svg{width:160px;height:160px;display:block}.wa-pie-row{display:grid;grid-template-columns:10px 1fr auto;gap:7px;align-items:center;padding:8px 0;border-top:1px solid var(--line);font-size:10px}.wa-pie-row i{width:9px;height:9px;border-radius:50%;display:block}@media(max-width:600px){.wa-pie-wrap{grid-template-columns:1fr}.wa-pie-wrap svg{margin:auto}}'; document.head.appendChild(style); }
  function init() {
    installAdSense();
    styles(); graphGuard();
    if ('MutationObserver' in window) {
      var scheduled = false;
      var rerun = function(){ if(scheduled) return; scheduled=true; requestAnimationFrame(function(){scheduled=false;graphGuard();}); };
      new MutationObserver(rerun).observe(document.body,{childList:true,subtree:true});
      window.addEventListener('resize', rerun, {passive:true});
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();

/* ===== WA CANONICAL MODULE | site | final-polish.js | sha256:df556e32bd4f ===== */
/* Wealth Arrays final polish — non-destructive UX, content consistency and trust signals. */
(function(){'use strict';
/* Shared hub behaviour is owned by wa-core. Keep this legacy layer calculator-only so it cannot compete for search/theme ownership. */
if(window.__WEALTH_ARRAYS_CORE_LOADED__&&!document.querySelector('.calc-page'))return;
const CURRENCY_SYMBOLS={USD:'$',EUR:'€',JPY:'¥',GBP:'£',AUD:'A$',CAD:'C$',CHF:'CHF',CNY:'CN¥',HKD:'HK$',NZD:'NZ$',SEK:'kr',KRW:'₩',SGD:'S$',NOK:'kr',MXN:'MX$',INR:'₹',ZAR:'R',BRL:'R$',AED:'د.إ',SAR:'﷼',TRY:'₺',PLN:'zł',THB:'฿',IDR:'Rp',MYR:'RM',PHP:'₱',DKK:'kr',ILS:'₪',CZK:'Kč',HUF:'Ft'};
function tidy(){
 document.querySelectorAll('#language-select').forEach(s=>{if(!s.options.length||!s.value)s.remove()});
 const footers=[...document.querySelectorAll('footer')];if(footers.length>1)footers.slice(1).forEach(f=>f.remove());
 const f=document.querySelector('footer');if(f){const brands=[...f.querySelectorAll('.footer-logo,.footer-mark')];if(brands.length>1)brands.slice(1).forEach(x=>x.remove());const imgs=[...f.querySelectorAll('.footer-brand-row img,.footer-brand-row svg')];if(imgs.length>1)imgs.slice(1).forEach(x=>x.remove());}
}
function selectedCurrencySymbol(){const code=document.documentElement.dataset.currency||'INR';return CURRENCY_SYMBOLS[code]||'₹'}
function syncStaticCurrencyExamples(){const article=document.querySelector('.tool-article');if(!article)return;const symbol=selectedCurrencySymbol();article.querySelectorAll('p').forEach(p=>{if(p.dataset.waCurrencyPatched==='1')return;p.innerHTML=p.innerHTML.replace(/\$(?=\s*[0-9])/g,symbol);p.dataset.waCurrencyPatched='1';});}
function addReviewStamp(){const title=document.querySelector('.calc-title'),desc=document.querySelector('.calc-desc');if(!title||!desc||document.querySelector('.wa-review-stamp'))return;const stamp=document.createElement('p');stamp.className='wa-review-stamp';stamp.textContent='Last reviewed: September 15, 2026 · Formula and assumptions checked during release validation.';stamp.style.cssText='margin:8px 0 0;color:var(--muted,#667085);font-size:11px;line-height:1.5';desc.insertAdjacentElement('afterend',stamp)}
function rewriteTaxLinks(){document.querySelectorAll('a[href="income-tax-planner.html"],a[href="/income-tax-planner.html"]').forEach(a=>a.setAttribute('href','/income-tax-scenario-calculator.html'));}
function reframeTaxScenario(){
 const isTax=/income-tax-(planner|scenario-calculator)\.html$/i.test(location.pathname);
 rewriteTaxLinks();
 if(!isTax){document.querySelectorAll('[data-search]').forEach(el=>{if(typeof el.dataset.search==='string')el.dataset.search=el.dataset.search.replace(/income tax planner/gi,'income tax scenario calculator')});document.querySelectorAll('b,h2,h3,small,p,a').forEach(el=>{if(el.children.length===0&&/Income Tax Planner/i.test(el.textContent||''))el.textContent=(el.textContent||'').replace(/Income Tax Planner/gi,'Income Tax Scenario Calculator')});return;}
 const title=document.querySelector('.calc-title');if(title)title.textContent='Income Tax Scenario Calculator';document.title='Income Tax Scenario Calculator — Free Planning Tool | Wealth Arrays';const desc=document.querySelector('.calc-desc');if(desc)desc.textContent='Explore tax scenarios using a user-entered effective tax-rate assumption. This is not jurisdiction-specific tax software.';document.querySelectorAll('script[type="application/ld+json"]').forEach(s=>{try{s.textContent=s.textContent.replaceAll('Income Tax Planner','Income Tax Scenario Calculator')}catch(e){}});document.querySelectorAll('a,b,h2,h3,small,p').forEach(el=>{if(el.children.length===0&&/Income Tax Planner/i.test(el.textContent||''))el.textContent=(el.textContent||'').replace(/Income Tax Planner/gi,'Income Tax Scenario Calculator')});
}
function mobileSearchFallback(){
 const input=document.getElementById('tool-search'),box=document.getElementById('tool-search-results');
 if(!input||!box||window.__WA_MOBILE_SEARCH_FALLBACK__)return;
 window.__WA_MOBILE_SEARCH_FALLBACK__=true;
 const shell=input.closest('.tool-search-shell,.search-bar,.hero-copy')||box.parentElement;
 if(shell){shell.style.position='relative';shell.style.zIndex='10000';shell.style.isolation='isolate'}
 box.style.position='absolute';box.style.left='0';box.style.right='0';box.style.top='calc(100% + 8px)';box.style.zIndex='10001';box.style.background='var(--surface,#fff)';box.style.border='1px solid var(--line,#e2e6ed)';box.style.borderRadius='14px';box.style.boxShadow='0 18px 45px rgba(16,20,27,.18)';box.style.maxHeight='min(55vh,420px)';box.style.overflowY='auto';box.style.webkitOverflowScrolling='touch';
 const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const aliases={sip:'systematic investment plan monthly mutual fund',emi:'mortgage home loan monthly payment',fd:'fixed deposit banking',rd:'recurring deposit monthly banking',roi:'return investment profit',tax:'income tax scenario',salary:'hourly wage income',loan:'mortgage personal car debt',retirement:'pension financial independence',inflation:'purchasing power future prices'};
 const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function render(){
   const q=norm(input.value); if(!q){box.innerHTML='';box.hidden=true;box.style.display='none';return;}
   const terms=(q+' '+(aliases[q]||'')).split(/\s+/).filter(Boolean);
   const rows=[...document.querySelectorAll('.home-tool-card,.tool-card,.ledger-row')].map(card=>{const hay=norm((card.dataset.search||'')+' '+card.textContent);let score=hay.includes(q)?100:0;terms.forEach(t=>{if(t.length>1&&hay.includes(t))score+=3});return{card,score}}).filter(x=>x.score).sort((a,b)=>b.score-a.score).slice(0,8);
   box.innerHTML=rows.length?rows.map(({card})=>{const title=(card.querySelector('b,h2,h3')?.textContent||'Calculator').trim();const desc=(card.querySelector('p,small')?.textContent||'').trim();return '<a class="wa-search-suggestion" href="'+(card.getAttribute('href')||'#')+'"><span><strong>'+esc(title)+'</strong><small>'+esc(desc)+'</small></span><b aria-hidden="true">→</b></a>'}).join(''):'<div class="tool-search-empty">No calculator found. Try SIP, EMI, FD, RD, loan, tax or ROI.</div>';
   box.hidden=false;box.style.display='block';
 }
 ['input','keyup','search','focus','touchstart'].forEach(name=>input.addEventListener(name,render,{passive:name==='touchstart',capture:true}));
 input.addEventListener('click',render,true); input.addEventListener('keydown',e=>{if(e.key==='Escape'){box.hidden=true;box.style.display='none';input.blur()}},true);
}
function moveHomepageSearchUp(){
 if(window.innerWidth>760)return;
 const input=document.getElementById('tool-search');
 const shell=input?.closest('.tool-search-shell,.search-bar');
 const hero=document.querySelector('.hero-copy');
 if(!shell||!hero)return;
 hero.style.display='flex';hero.style.flexDirection='column';hero.style.alignItems='stretch';
 shell.style.order='-1';shell.style.marginTop='0';shell.style.marginBottom='26px';shell.style.maxWidth='620px';shell.style.width='100%';
}
function mobileSearchLayerFix(){
 const input=document.getElementById('tool-search'),box=document.getElementById('tool-search-results');
 if(!input||!box||window.innerWidth>680)return;
 const place=()=>{if(box.hidden||box.style.display==='none')return;const r=input.getBoundingClientRect();box.style.position='fixed';box.style.left=Math.max(8,r.left)+'px';box.style.top=Math.min(window.innerHeight-120,r.bottom+8)+'px';box.style.width=Math.min(r.width,window.innerWidth-16)+'px';box.style.right='auto';box.style.zIndex='2147483647';box.style.maxHeight=Math.max(120,window.innerHeight-(r.bottom+20))+'px';};
 input.addEventListener('input',()=>setTimeout(place,0),true);input.addEventListener('focus',()=>setTimeout(place,0),true);window.addEventListener('resize',place,{passive:true});window.addEventListener('scroll',place,{passive:true});
 const observer=new MutationObserver(place);observer.observe(box,{childList:true,attributes:true,subtree:true});
}
function cardVisualPolish(){
 const styleId='wa-card-visual-polish';
 if(document.getElementById(styleId))return;
 const s=document.createElement('style');s.id=styleId;s.textContent=`
.home-tool-grid,.tools-grid{align-items:stretch!important}
.home-tool-card,.tools-grid>.tool-card{box-sizing:border-box!important;border:2px solid var(--line)!important;border-radius:20px!important;background:linear-gradient(145deg,var(--surface),var(--surface2))!important;box-shadow:0 10px 28px rgba(15,23,42,.06)!important;min-height:158px!important;position:relative!important;overflow:hidden!important;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease!important}
.home-tool-card:before,.tools-grid>.tool-card:before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,var(--accent),var(--accent2));opacity:.8}
.home-tool-card:hover,.tools-grid>.tool-card:hover{transform:translateY(-3px)!important;border-color:color-mix(in srgb,var(--accent) 55%,var(--line))!important;box-shadow:0 16px 36px rgba(15,23,42,.11)!important}
.home-tool-index{min-width:30px!important;min-height:30px!important;padding:6px 7px!important;display:grid!important;place-items:center!important;border:1px solid color-mix(in srgb,var(--accent) 35%,var(--line))!important;border-radius:9px!important;background:color-mix(in srgb,var(--accent) 8%,var(--surface))!important}
.cat-grid{align-items:stretch!important}.cat-card{box-sizing:border-box!important;border:2px solid var(--line)!important;border-radius:20px!important;min-height:158px!important;box-shadow:0 10px 28px rgba(15,23,42,.06)!important}.cat-card:hover{border-color:color-mix(in srgb,var(--accent) 55%,var(--line))!important;box-shadow:0 16px 36px rgba(15,23,42,.11)!important}
@media(max-width:760px){.home-tool-grid,.tools-grid{gap:10px!important}.home-tool-card,.tools-grid>.tool-card,.cat-card{border-width:2px!important;border-radius:17px!important;min-height:140px!important}.home-tool-card{padding:14px!important}}
@media(prefers-reduced-motion:reduce){.home-tool-card,.tools-grid>.tool-card,.cat-card{transition:none!important}}
`;
 document.head.appendChild(s);
}
function expansionCalculatorRescue(){
 const match=/^(step-up-sip|emergency-fund|real-return)-calculator\.html$/i.exec(location.pathname.split('/').pop()||'');
 if(!match)return;
 const key=match[1],host=document.getElementById('calc-widget');
 if(!host)return;
 const rescue=()=>{if(host.querySelector('input[type="number"]'))return;if(typeof window.mountExtraCalculator==='function'&&window.WA_EXTRA_CALCULATORS?.[key]){try{window.mountExtraCalculator(window.WA_EXTRA_CALCULATORS[key],'calc-widget');return}catch(e){}}
   if(!document.querySelector('script[data-wa-extra-rescue]')){const s=document.createElement('script');s.src='/extra-calculators-runtime.js?v=20260915-rescue-2';s.dataset.waExtraRescue='1';document.head.appendChild(s);}
 };
 [0,150,400,900,1800,3000].forEach(ms=>setTimeout(rescue,ms));
}
function directExpansionRender(){
 const match=/^(step-up-sip|emergency-fund|real-return)-calculator\.html$/i.exec(location.pathname.split('/').pop()||'');
 if(!match)return;const host=document.getElementById('calc-widget');if(!host)return;
 const data={
  'step-up-sip':{fields:[['monthly','Starting monthly investment',5000,0,''],['stepUp','Annual increase',10,0,'%'],['rate','Expected annual return',10,0,'%'],['years','Investment period',15,1,'yrs'],['inflation','Expected annual inflation',6,0,'%']]},
  'emergency-fund':{fields:[['expenses','Essential monthly expenses',50000,0,''],['months','Months of coverage',6,1,'mos'],['current','Current emergency savings',100000,0,'']]},
  'real-return':{fields:[['nominal','Nominal annual return',10,-99,'%'],['inflation','Annual inflation',6,-99,'%'],['amount','Starting amount',100000,0,''],['years','Time period',10,1,'yrs']]}
 }[match[1]];
 if(!data||host.querySelector('input[type="number"]'))return;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const id='wa-direct-'+match[1];let html='<section id="'+id+'" style="display:block!important;visibility:visible!important;opacity:1!important;border:1px solid #e5e7eb;border-radius:18px;padding:18px;background:#fff;box-shadow:0 8px 28px rgba(15,23,42,.08)"><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px">';
 data.fields.forEach(f=>{html+='<label style="display:flex;flex-direction:column;gap:6px;font-weight:700;font-size:13px">'+esc(f[1])+'<span style="display:flex;align-items:center;border:1px solid #d1d5db;border-radius:10px;min-height:46px;background:#fff"><input id="'+id+'-'+f[0]+'" type="number" inputmode="decimal" value="'+f[2]+'" min="'+f[3]+'" style="width:100%;border:0;outline:0;padding:11px;font:inherit;font-size:16px;background:transparent"><b style="padding:0 10px;color:#667085">'+esc(f[4])+'</b></span></label>'});
 html+='</div><div id="'+id+'-results" style="display:grid;gap:8px;margin-top:18px"></div></section>';host.innerHTML=html;
 const val=k=>Number(document.getElementById(id+'-'+k).value)||0, money=n=>'₹'+Number(n).toLocaleString('en-IN',{maximumFractionDigits:0}), results=document.getElementById(id+'-results');
 function calc(){let rows=[];if(match[1]==='step-up-sip'){let c=val('monthly'),r=val('rate')/1200,f=0,inv=0,m=val('years')*12;for(let i=1;i<=m;i++){f=(f+c)*(1+r);inv+=c;if(i%12===0)c*=1+val('stepUp')/100}rows=[['Total invested',money(inv)],['Growth / profit',money(f-inv)],['Projected future value',money(f)],['Future value in today\'s money',money(f/Math.pow(1+val('inflation')/100,val('years')))]]}else if(match[1]==='emergency-fund'){let target=val('expenses')*val('months'),gap=Math.max(0,target-val('current'));rows=[['Emergency-fund target',money(target)],['Already saved',money(val('current'))],['Remaining gap',money(gap)],['Current coverage',val('expenses')?((val('current')/val('expenses')).toFixed(1)+' yrs'):'0 yrs']]}else{let n=val('nominal')/100,i=val('inflation')/100,real=((1+n)/(1+i)-1)*100,f=val('amount')*Math.pow(1+n,val('years'));rows=[['Real annual return',real.toFixed(2)+'%'],['Nominal future value',money(f)],['Future value in today\'s purchasing power',money(f/Math.pow(1+i,val('years')))]]}results.innerHTML=rows.map(r=>'<div style="display:flex;justify-content:space-between;gap:12px;padding:12px;border-radius:10px;background:#f8fafc"><span>'+esc(r[0])+'</span><strong>'+esc(r[1])+'</strong></div>').join('')}
 data.fields.forEach(f=>document.getElementById(id+'-'+f[0]).addEventListener('input',calc));calc();
 const mo=new MutationObserver(()=>{if(!host.querySelector('input[type="number"]')){host.innerHTML='';setTimeout(directExpansionRender,0)}});mo.observe(host,{childList:true});
}
function start(){tidy();reframeTaxScenario();addReviewStamp();syncStaticCurrencyExamples();moveHomepageSearchUp();mobileSearchFallback();mobileSearchLayerFix();cardVisualPolish();expansionCalculatorRescue();directExpansionRender();setTimeout(()=>{tidy();reframeTaxScenario();syncStaticCurrencyExamples();moveHomepageSearchUp();mobileSearchFallback();mobileSearchLayerFix();cardVisualPolish();expansionCalculatorRescue();directExpansionRender()},400);setTimeout(()=>{tidy();reframeTaxScenario();syncStaticCurrencyExamples();moveHomepageSearchUp();mobileSearchFallback();mobileSearchLayerFix();cardVisualPolish();expansionCalculatorRescue();directExpansionRender()},1200);window.addEventListener('wa-currency',syncStaticCurrencyExamples);window.addEventListener('resize',moveHomepageSearchUp,{passive:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

/* ===== WA CANONICAL MODULE | site | wa-enhancements.js | sha256:e9db32c15ce1 ===== */
/* Wealth Arrays UX enhancements — live calculation/PDF hardening. */
(function () {
  'use strict';
  function liveCalculator() {
    let timer = 0;
    const isControl = function (target) { return target && target.matches && target.matches('#calc-widget input,#calc-widget select,#calc-widget textarea'); };
    const trigger = function () {
      const root = document.getElementById('calc-widget');
      if (!root) return;
      const button = Array.from(root.querySelectorAll('button')).find(function (item) {
        return /^(calculate|recalculate|update|compute|show result|calculate now)/i.test((item.textContent || '').trim()) || item.dataset.action === 'calculate';
      });
      if (button && !button.disabled) button.click();
    };
    const schedule = function () { clearTimeout(timer); timer = setTimeout(trigger, 40); };
    document.addEventListener('input', function (event) { if (isControl(event.target)) schedule(); }, true);
    document.addEventListener('change', function (event) { if (isControl(event.target)) schedule(); }, true);
    [250,700,1400].forEach(function (delay) { setTimeout(trigger, delay); });
  }
  function patchPdfLogo() {
    if (window.waPdfLogoPatched || typeof window.waOpenPrintReport !== 'function') return;
    window.waPdfLogoPatched = true;
    const original = window.waOpenPrintReport;
    const logo = 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgcng9IjMwIiBmaWxsPSIjMEIxMjIwIi8+PHBhdGggZD0iTTIxIDY2IDQ2IDQ3IDY4IDU0IDEwMyAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjBBNUZBIiBzdHJva2Utd2lkdGg9IjkiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yNSA5MlY3ME01MiA5MlY1NU03OSA5MlYzOSIgc3Ryb2tlPSIjRUFGMkZGIiBzdHJva2Utd2lkdGg9IjEwIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=';
    window.waOpenPrintReport = function (calc, values, results) {
      const oldOpen = window.open;
      window.open = function () {
        const win = oldOpen.apply(window, arguments);
        if (win && win.document) {
          const oldWrite = win.document.write.bind(win.document);
          win.document.write = function (html) {
            const brand = '<div class="pdf-brand"><img alt="Wealth Arrays logo" src="data:image/svg+xml;base64,' + logo + '"><span>WEALTH ARRAYS</span></div>';
            html = String(html).replace('<div class="brand">WEALTH ARRAYS · CALCULATION REPORT</div>', brand);
            html = html.replace('</style>', '.pdf-brand{display:flex;align-items:center;gap:10px;margin-bottom:14px;font-weight:800;letter-spacing:.08em;color:#475467}.pdf-brand img{width:42px;height:42px;display:block}</style>');
            oldWrite(html);
          };
        }
        return win;
      };
      try { return original(calc, values, results); } finally { setTimeout(function () { window.open = oldOpen; }, 0); }
    };
  }
  function start() {
    liveCalculator();
    patchPdfLogo();
    setTimeout(patchPdfLogo, 300);
    setTimeout(patchPdfLogo, 900);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();

/* ===== WA CANONICAL MODULE | site | theme-fix.js | sha256:237818d51e88 ===== */
/* Wealth Arrays global theme controller — calculator fallback only. Hub pages are owned by wa-core. */
(function(){
  'use strict';
  if(window.__WEALTH_ARRAYS_CORE_LOADED__&&!document.querySelector('.calc-page'))return;
  var KEY='waTheme';
  var REMOVED=['step-up-sip-calculator.html','emergency-fund-calculator.html','real-return-calculator.html'];
  function read(){try{return localStorage.getItem(KEY)==='dark'?'dark':'light'}catch(e){return document.documentElement.dataset.theme==='dark'?'dark':'light'}}
  function write(v){try{localStorage.setItem(KEY,v)}catch(e){}}
  function paint(v){
    v=v==='dark'?'dark':'light';
    document.documentElement.dataset.theme=v;
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',v==='dark'?'#080a0f':'#f7f8fb');
    document.querySelectorAll('#theme-toggle,.theme-toggle').forEach(function(button){
      button.setAttribute('aria-pressed',String(v==='dark'));
      button.setAttribute('aria-label','Switch to '+(v==='dark'?'light':'dark')+' mode');
      var label=button.querySelector('[data-theme-label],#theme-toggle-label');
      if(label)label.textContent=v==='dark'?'Light mode':'Dark mode';
    });
  }
  function removeRetiredCards(){
    document.querySelectorAll('a,button,[data-search]').forEach(function(node){
      var href=node.getAttribute('href')||'';
      var text=(node.textContent||'').toLowerCase();
      var retired=REMOVED.some(function(file){return href.indexOf(file)>=0}) || /step[ -]?up sip|emergency fund|real return/.test(text);
      if(retired){
        var card=node.closest('.home-tool-card,.tool-card,.ledger-row,.cat-card');
        if(card)card.remove();
      }
    });
  }
  function init(){
    paint(read());
    removeRetiredCards();
    if(document.documentElement.dataset.waThemeOwner!=='1'){
      document.addEventListener('click',function(e){
        var button=e.target.closest&&e.target.closest('#theme-toggle,.theme-toggle');
        if(!button)return;
        e.preventDefault();
        e.stopImmediatePropagation();
        var next=document.documentElement.dataset.theme==='dark'?'light':'dark';
        write(next);paint(next);
      },true);
    }
    window.addEventListener('storage',function(e){if(e.key===KEY)paint(e.newValue==='dark'?'dark':'light')});
    window.addEventListener('pageshow',function(){paint(read());removeRetiredCards()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

/* ===== WA CANONICAL MODULE | site | phase2-intelligence.js | sha256:9968483bb46c ===== */
/* Wealth Arrays — Phase 2 decision intelligence */
(function () {
  'use strict';
  if (window.waPhase2Loaded) return;
  window.waPhase2Loaded = true;
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const finite=v=>Number.isFinite(Number(v))?Number(v):null;
  const money=v=>{const n=finite(v);if(n===null)return'—';const s=(window.WA?.currencies||[['INR','₹']]).find(c=>c[0]===(localStorage.waCurrency||'INR'))?.[1]||'₹';return s+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});};
  const pct=v=>{const n=finite(v);return n===null?'—':n.toFixed(2)+'%';};
  const number=v=>{const n=finite(v);return n===null?'—':n.toLocaleString('en-US',{maximumFractionDigits:2});};
  const registry=()=>{try{if(typeof calculators!=='undefined'&&Array.isArray(calculators))return calculators;}catch(_){}try{if(typeof calculatorData!=='undefined'&&Array.isArray(calculatorData))return calculatorData;}catch(_){}try{if(typeof CALCULATORS!=='undefined'&&Array.isArray(CALCULATORS))return CALCULATORS;}catch(_){}return window.CALCULATORS||window.calculators||window.calculatorData||[];};
  const field=(calc,re)=>calc.fields?.find(f=>re.test((f.label||'')+' '+f.id));
  const getCalc=()=>{const list=registry(),slug=location.pathname.split('/').pop().replace(/\.html$/,''),q=new URLSearchParams(location.search).get('calc');return list.find(c=>c.slug===slug||c.id===q)||null;};
  const control=f=>document.getElementById('calc-widget')?.querySelector(`#f-${CSS.escape(f.id)},[name="${CSS.escape(f.id)}"],#${CSS.escape(f.id)}`);
  const readValues=calc=>Object.fromEntries((calc.fields||[]).map(f=>{const el=control(f);if(f.type==='select')return[f.id,el?.value??f.default];const x=Number(el?.value);return[f.id,Number.isFinite(x)?x:Number(f.default)];}));
  const compute=(calc,v)=>{try{const rows=calc.compute(v)||[];return rows.length&&rows.every(r=>Number.isFinite(Number(r.value)))?rows:null;}catch(_){return null;}};
  const rowBy=(rows,re)=>rows?.find(r=>re.test(String(r.label)));
  const primary=(calc,rows)=>{if(!rows?.length)return null;const ordered=[/projected value|future value|final amount|maturity value|estimated corpus|target corpus|net worth|after-tax income|total repayment|annualized ROI|annualized return|total ROI|payoff/i,/monthly payment/i,/today's purchasing power|purchasing power/i,/growth|profit|interest earned/i];for(const re of ordered){const r=rowBy(rows,re);if(r)return r;}return rows[rows.length-1];};
  const format=r=>{if(!r)return'—';if(r.format==='percent')return pct(r.value);if(r.format==='years')return number(r.value)+' yrs';if(r.format==='number')return number(r.value);return money(r.value);};
  function profile(calc){const id=calc.id;if(['sip','compound-interest','lumpsum','fixed-deposit','recurring-deposit'].includes(id))return{kind:'growth',field:'rate',label:'expected return / interest rate',deltas:[-2,0,2]};if(['mortgage','car-loan','personal-loan'].includes(id))return{kind:'loan',field:'rate',label:'interest rate',deltas:[-1,0,1]};if(id==='roi')return{kind:'roi',field:'finalValue',label:'final value',deltas:[-10,0,10],relative:true};if(id==='debt-payoff')return{kind:'debt',field:'payment',label:'monthly payment',deltas:[-20,0,20],relative:true};return null;}
  function scenarioValues(calc,base,delta,p){const v={...base},current=finite(base[p.field]);if(current===null)return null;v[p.field]=p.relative?Math.max(0,current*(1+delta/100)):Math.max(0,current+delta);const f=calc.fields.find(x=>x.id===p.field);if(f?.max!=null)v[p.field]=Math.min(f.max,v[p.field]);return v;}
  function scenarioName(p,delta){if(delta===0)return'Base';if(p.kind==='loan')return delta<0?'Lower rate':'Higher rate';if(p.kind==='debt')return delta<0?'Lower payment':'Higher payment';return delta<0?'Conservative':'Optimistic';}
  function renderScenarios(calc,base){const p=profile(calc);if(!p)return'';const cards=p.deltas.map(delta=>{const v=scenarioValues(calc,base,delta,p),rows=v?compute(calc,v):null,r=primary(calc,rows);return{name:scenarioName(p,delta),delta,r};}).filter(x=>x.r);if(cards.length!==3)return'';const b=cards.find(x=>x.delta===0),bn=finite(b.r.value);return `<section class="wa2-panel" aria-labelledby="wa2-scenarios-title"><div class="wa2-kicker">DECISION RANGE</div><h2 id="wa2-scenarios-title">What if the key assumption changes?</h2><p class="wa2-muted">Three planning cases change only ${esc(p.label)}. They are scenarios, not forecasts.</p><div class="wa2-scenario-grid">${cards.map(c=>{const n=finite(c.r.value),diff=n!==null&&bn!==null&&bn!==0?(n-bn)/Math.abs(bn)*100:0;return `<div class="wa2-scenario ${c.delta===0?'is-base':''}"><span>${esc(c.name)}</span><strong>${esc(format(c.r))}</strong><small>${c.delta===0?'Your current inputs':(diff>=0?'+':'')+diff.toFixed(1)+'% vs base'}</small></div>`;}).join('')}</div><p class="wa2-foot">A different assumption changes the result; it does not make that scenario more likely.</p></section>`;}
  function renderSensitivity(calc,base){const p=profile(calc);if(!p)return'';const vals=[-10,-5,0,5,10].map(delta=>{const v=scenarioValues(calc,base,delta,p),rows=v?compute(calc,v):null,r=primary(calc,rows);return{delta,r};}).filter(x=>x.r);if(vals.length<3)return'';const br=vals.find(x=>x.delta===0)?.r,bn=finite(br?.value),current=finite(base[p.field]);return `<section class="wa2-panel" aria-labelledby="wa2-sensitivity-title"><div class="wa2-kicker">SENSITIVITY</div><h2 id="wa2-sensitivity-title">See how the result moves</h2><p class="wa2-muted">Only <strong>${esc(p.label)}</strong> changes. Every other input stays fixed.</p><div class="wa2-table-wrap"><table class="wa2-table"><thead><tr><th>${esc(p.label)}</th><th>${esc(br?.label||'Result')}</th><th>vs base</th></tr></thead><tbody>${vals.map(x=>{const n=finite(x.r.value),diff=n!==null&&bn!==null&&bn!==0?(n-bn)/Math.abs(bn)*100:0;let setting='Base';if(x.delta!==0&&current!==null)setting=p.relative?(current*(1+x.delta/100)).toFixed(2):Math.max(0,current+x.delta).toFixed(2);return `<tr class="${x.delta===0?'is-base':''}"><td>${x.delta===0?'Base':setting}</td><td>${esc(format(x.r))}</td><td>${x.delta===0?'—':(diff>=0?'+':'')+diff.toFixed(1)+'%'}</td></tr>`;}).join('')}</tbody></table></div><p class="wa2-foot">Sensitivity is mathematical. It does not model fees, taxes, volatility or provider-specific terms unless those are part of the calculator inputs.</p></section>`;}
  function renderLoanTerm(calc,base){if(!['mortgage','car-loan','personal-loan'].includes(calc.id))return'';const yf=field(calc,/loan term|time period|years/i);if(!yf)return'';const years=finite(base[yf.id]);if(years===null||years<=1)return'';const terms=[Math.max(1,Math.round(years-5)),Math.round(years),Math.min(yf.max||200,Math.round(years+5))].filter((x,i,a)=>x>0&&a.indexOf(x)===i);const rows=terms.map(term=>{const out=compute(calc,{...base,[yf.id]:term});return{term,r:rowBy(out,/monthly payment/i),interest:rowBy(out,/total interest/i)};}).filter(x=>x.r&&x.interest);if(rows.length<2)return'';return `<section class="wa2-panel" aria-labelledby="wa2-term-title"><div class="wa2-kicker">LOAN INTELLIGENCE</div><h2 id="wa2-term-title">Monthly payment vs total interest</h2><p class="wa2-muted">The same loan and rate, viewed across different terms. This makes the trade-off visible instead of focusing only on the monthly payment.</p><div class="wa2-table-wrap"><table class="wa2-table"><thead><tr><th>Term</th><th>Monthly payment</th><th>Total interest</th></tr></thead><tbody>${rows.map(x=>`<tr class="${x.term===Math.round(years)?'is-base':''}"><td>${x.term} yrs</td><td>${esc(format(x.r))}</td><td>${esc(format(x.interest))}</td></tr>`).join('')}</tbody></table></div><p class="wa2-foot">A shorter term generally increases the payment but reduces interest because the balance is outstanding for less time.</p></section>`;}
  function renderMeaning(calc,rows){if(!rows?.length)return'';const id=calc.id,p=primary(calc,rows),pieces=[];if(['sip','compound-interest','lumpsum','fixed-deposit','recurring-deposit'].includes(id)){const invested=rowBy(rows,/you put in|principal|deposited|invested/i),gain=rowBy(rows,/growth|profit|interest earned|interest$/i);if(invested&&gain)pieces.push(`Your projected result combines <strong>${esc(format(invested))}</strong> of contributions/principal with <strong>${esc(format(gain))}</strong> of growth or interest.`);if(rowBy(rows,/today's|purchasing power/i))pieces.push('The inflation-adjusted figure is the better number for thinking about future spending power. A larger nominal balance does not automatically mean more purchasing power.');}else if(['mortgage','car-loan','personal-loan'].includes(id)){const pay=rowBy(rows,/monthly payment/i),interest=rowBy(rows,/total interest/i),total=rowBy(rows,/total repayment/i);if(pay&&interest&&total)pieces.push(`You pay <strong>${esc(format(pay))}</strong> per month. Over the full term, repayment is <strong>${esc(format(total))}</strong>, including <strong>${esc(format(interest))}</strong> of interest.`);pieces.push('The cheapest loan is not always the one with the lowest monthly payment. Compare total interest and term as well.');}else if(id==='roi'){const roi=rowBy(rows,/total ROI/i),ann=rowBy(rows,/annualized/i);if(roi)pieces.push(`Total return is <strong>${esc(format(roi))}</strong>${ann?' and the annualized rate is <strong>'+esc(format(ann))+'</strong>.':''} Annualized return helps compare investments held for different lengths of time.`);}else if(id==='debt-payoff'){const months=rowBy(rows,/payoff|months/i),interest=rowBy(rows,/total interest/i);if(months)pieces.push(`At this payment, estimated payoff is <strong>${esc(format(months))}</strong>${interest?' with about <strong>'+esc(format(interest))+'</strong> of interest.':''}`);pieces.push('Test a higher payment in the sensitivity table to see whether the extra monthly cash flow meaningfully reduces time or interest.');}else if(p)pieces.push(`The headline result is <strong>${esc(format(p))}</strong>. It is a planning estimate based on the assumptions you entered, not a guarantee.`);return pieces.length?`<section class="wa2-panel wa2-meaning" aria-labelledby="wa2-meaning-title"><div class="wa2-kicker">YOUR RESULT</div><h2 id="wa2-meaning-title">What this number means</h2>${pieces.map(x=>`<p>${x}</p>`).join('')}</section>`:'';}
  const journeys={sip:[['ROI Calculator','roi-calculator.html'],['Compound Interest','compound-interest-calculator.html']],'compound-interest':[['SIP Calculator','sip-calculator.html'],['Fixed Deposit Calculator','fixed-deposit-calculator.html']],mortgage:[['Debt Payoff Calculator','debt-payoff-calculator.html'],['Personal Loan Calculator','personal-loan-calculator.html']],'car-loan':[['Debt Payoff Calculator','debt-payoff-calculator.html'],['Mortgage / Loan EMI','mortgage-emi-calculator.html']],'personal-loan':[['Debt Payoff Calculator','debt-payoff-calculator.html'],['Mortgage / Loan EMI','mortgage-emi-calculator.html']],roi:[['SIP Calculator','sip-calculator.html'],['Compound Interest','compound-interest-calculator.html']],'debt-payoff':[['Mortgage / Loan EMI','mortgage-emi-calculator.html'],['SIP Calculator','sip-calculator.html']],'freedom-milestone':[['SIP Calculator','sip-calculator.html'],['Net Worth Calculator','net-worth-calculator.html']],'profit-margin':[['ROI Calculator','roi-calculator.html'],['Freelance Rate Calculator','freelance-rate-calculator.html']]};
  function renderJourney(calc){const links=journeys[calc.id];if(!links)return'';return `<section class="wa2-panel wa2-next" aria-labelledby="wa2-next-title"><div class="wa2-kicker">NEXT STEP</div><h2 id="wa2-next-title">Continue the decision</h2><p class="wa2-muted">Use a related tool to test the next part of the decision instead of stopping at one number.</p><div class="wa2-next-grid">${links.map(([name,url])=>`<a href="/${url}"><strong>${esc(name)}</strong><span>Open calculator →</span></a>`).join('')}</div></section>`;}
  function mount(){const calc=getCalc(),widget=document.getElementById('calc-widget');if(!calc||!widget||document.querySelector('[data-wa-phase2]'))return;const base=readValues(calc),rows=compute(calc,base);if(!rows)return;const anchor=document.querySelector('.tool-article')||widget.parentElement;if(!anchor)return;const wrap=document.createElement('div');wrap.dataset.waPhase2='true';wrap.className='wa2-wrap';const render=v=>{const r=compute(calc,v);return renderMeaning(calc,r)+renderScenarios(calc,v)+renderSensitivity(calc,v)+renderLoanTerm(calc,v)+renderJourney(calc);};wrap.innerHTML=render(base);if(!wrap.innerHTML)return;anchor.parentNode.insertBefore(wrap,anchor);let timer=0;const refresh=()=>{clearTimeout(timer);timer=setTimeout(()=>{const v=readValues(calc),r=compute(calc,v);if(!r)return;const next=document.createElement('div');next.dataset.waPhase2='true';next.className='wa2-wrap';next.innerHTML=render(v);wrap.replaceWith(next);},120);};document.addEventListener('input',e=>{if(e.target.closest('#calc-widget'))refresh();},true);document.addEventListener('change',e=>{if(e.target.closest('#calc-widget'))refresh();},true);window.addEventListener('wa-currency',refresh);}
  function css(){if(document.getElementById('wa2-style'))return;const s=document.createElement('style');s.id='wa2-style';s.textContent=`.wa2-wrap{max-width:100%;margin:28px 0}.wa2-panel{margin:18px 0;padding:24px;border:1px solid var(--border,#e4e7ec);border-radius:18px;background:var(--surface,#fff);box-shadow:0 8px 30px rgba(16,24,40,.05)}.wa2-panel h2{margin:4px 0 8px;font-size:20px}.wa2-muted,.wa2-foot{color:var(--muted,#667085);line-height:1.6}.wa2-kicker{font-size:11px;font-weight:800;letter-spacing:.12em;color:var(--accent,#2563eb)}.wa2-scenario-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px}.wa2-scenario{padding:16px;border:1px solid var(--border,#e4e7ec);border-radius:14px;display:flex;flex-direction:column;gap:6px}.wa2-scenario.is-base{box-shadow:inset 0 0 0 2px rgba(37,99,235,.18)}.wa2-scenario span{font-size:12px;font-weight:800}.wa2-scenario strong{font-size:20px}.wa2-scenario small{color:var(--muted,#667085)}.wa2-table-wrap{overflow:auto;margin-top:16px}.wa2-table{width:100%;border-collapse:collapse;min-width:480px}.wa2-table th,.wa2-table td{text-align:left;padding:12px;border-bottom:1px solid var(--border,#e4e7ec)}.wa2-table th:last-child,.wa2-table td:last-child{text-align:right}.wa2-table .is-base{font-weight:800;background:rgba(37,99,235,.05)}.wa2-next-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:16px}.wa2-next-grid a{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:15px 16px;border:1px solid var(--border,#e4e7ec);border-radius:14px;text-decoration:none;color:inherit}.wa2-next-grid span{font-size:12px;color:var(--muted,#667085);white-space:nowrap}.wa2-foot{font-size:12px;margin:14px 0 0}.wa2-meaning p{margin:10px 0;line-height:1.65}@media(max-width:700px){.wa2-scenario-grid,.wa2-next-grid{grid-template-columns:1fr}.wa2-panel{padding:18px;border-radius:14px}}`;document.head.appendChild(s);}
  function start(){css();mount();setTimeout(mount,500);setTimeout(mount,1400);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

/* ===== WA CANONICAL MODULE | site | phase2-retirement.js | sha256:087956c9f330 ===== */
/* Wealth Arrays — Phase 2 retirement decision layer */
(function () {
  'use strict';
  if (window.waPhase2RetirementLoaded) return;
  window.waPhase2RetirementLoaded = true;
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const n=v=>Number.isFinite(Number(v))?Number(v):null;
  const registry=()=>{try{if(typeof calculators!=='undefined'&&Array.isArray(calculators))return calculators;}catch(_){}try{if(typeof calculatorData!=='undefined'&&Array.isArray(calculatorData))return calculatorData;}catch(_){}try{if(typeof CALCULATORS!=='undefined'&&Array.isArray(CALCULATORS))return CALCULATORS;}catch(_){}return window.CALCULATORS||window.calculators||window.calculatorData||[];};
  const fmt=v=>{const x=n(v);if(x===null)return'—';const s=(window.WA?.currencies||[['INR','₹']]).find(c=>c[0]===(localStorage.waCurrency||'INR'))?.[1]||'₹';return s+x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});};
  function render(calc,el){const fields=calc.fields||[],values={};fields.forEach(f=>{const q=`#f-${CSS.escape(f.id)},[name="${CSS.escape(f.id)}"],#${CSS.escape(f.id)}`,node=document.getElementById('calc-widget')?.querySelector(q),x=Number(node?.value);values[f.id]=Number.isFinite(x)?x:Number(f.default);});const pick=re=>fields.find(f=>re.test((f.label||'')+' '+f.id));const expenseField=pick(/annual.*expense|annual.*spend|spending|expenses/i),rateField=pick(/withdrawal|safe.*rate/i),savingsField=pick(/current.*saving|current.*portfolio|savings|portfolio/i);if(!expenseField||!rateField)return false;const expenses=n(values[expenseField.id])||0,rate=n(values[rateField.id])||0,savings=savingsField?n(values[savingsField.id])||0:0;if(expenses<=0||rate<=0)return false;const target=expenses/(rate/100),shortfall=Math.max(0,target-savings),progress=target>0?Math.min(100,savings/target*100):0,scenarios=[rate-1,rate,rate+1].filter(x=>x>0).map(x=>({rate:x,target:expenses/(x/100)}));el.innerHTML=`<div class="wa2-kicker">RETIREMENT DECISION VIEW</div><h2>Target, gap and sensitivity</h2><p class="wa2-muted">The headline target is only the starting point. This view separates the portfolio target from what you already have and shows how strongly the result depends on the withdrawal-rate assumption.</p><div class="wa2-retirement-grid"><div><span>Estimated target</span><strong>${esc(fmt(target))}</strong></div><div><span>Still needed</span><strong>${esc(fmt(shortfall))}</strong></div><div><span>Current progress</span><strong>${progress.toFixed(1)}%</strong></div></div><div class="wa2-table-wrap"><table class="wa2-table"><thead><tr><th>Withdrawal rate</th><th>Required target</th><th>Change vs current target</th></tr></thead><tbody>${scenarios.map(x=>`<tr class="${x.rate===rate?'is-base':''}"><td>${x.rate.toFixed(1)}%</td><td>${esc(fmt(x.target))}</td><td>${x.rate===rate?'Base':((x.target-target)/target*100).toFixed(1)+'%'}</td></tr>`).join('')}</tbody></table></div><p class="wa2-foot">A lower withdrawal rate produces a larger target. Historical withdrawal research is not a guarantee of future portfolio survival; taxes, fees, asset allocation, retirement length and spending changes can materially alter the outcome.</p>`;return true;}
  function mount(){const slug=location.pathname.split('/').pop().replace(/\.html$/,''),calc=registry().find(c=>c.slug===slug||c.id===new URLSearchParams(location.search).get('calc'));if(calc?.id!=='freedom-milestone'||document.querySelector('[data-wa-retirement-intelligence]'))return;const anchor=document.querySelector('.tool-article')||document.getElementById('calc-widget')?.parentElement;if(!anchor)return;const el=document.createElement('section');el.className='wa2-panel wa2-retirement';el.dataset.waRetirementIntelligence='true';if(!render(calc,el))return;anchor.parentNode.insertBefore(el,anchor);let timer=0;const refresh=()=>{clearTimeout(timer);timer=setTimeout(()=>render(calc,el),100);};document.addEventListener('input',e=>{if(e.target.closest('#calc-widget'))refresh();},true);document.addEventListener('change',e=>{if(e.target.closest('#calc-widget'))refresh();},true);window.addEventListener('wa-currency',refresh);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setTimeout(mount,250);setTimeout(mount,1000)},{once:true});else{setTimeout(mount,250);setTimeout(mount,1000)}
})();

/* ===== WA CANONICAL MODULE | site | phase3-seo.js | sha256:b1dcc15b6c93 ===== */
/* Wealth Arrays Phase 3 — SEO, topic-cluster and internal-linking runtime. */
(() => {
  'use strict';
  if (window.__WA_PHASE3_SEO__) return;
  window.__WA_PHASE3_SEO__ = true;

  const C = 'https://wealtharrays.com';
  const calculators = {
    sip: ['SIP Calculator', '/sip-calculator.html'], 'compound-interest': ['Compound Interest Calculator', '/compound-interest-calculator.html'],
    mortgage: ['Mortgage / Loan EMI Calculator', '/mortgage-emi-calculator.html'], roi: ['ROI Calculator', '/roi-calculator.html'],
    'simple-interest': ['Simple Interest Calculator', '/simple-interest-calculator.html'], 'freedom-milestone': ['Retirement Calculator', '/retirement-calculator.html'],
    'salary-conversion': ['Salary to Hourly Calculator', '/salary-to-hourly-calculator.html'], 'profit-margin': ['Profit Margin Calculator', '/profit-margin-calculator.html'],
    'fixed-deposit': ['Fixed Deposit Calculator', '/fixed-deposit-calculator.html'], 'recurring-deposit': ['Recurring Deposit Calculator', '/recurring-deposit-calculator.html'],
    lumpsum: ['Lumpsum Calculator', '/lumpsum-calculator.html'], cagr: ['CAGR Calculator', '/cagr-calculator.html'],
    'car-loan': ['Car Loan Calculator', '/car-loan-calculator.html'], 'personal-loan': ['Personal Loan Calculator', '/personal-loan-calculator.html'],
    'debt-payoff': ['Debt Payoff Calculator', '/debt-payoff-calculator.html'], inflation: ['Inflation Calculator', '/inflation-calculator.html'],
    'net-worth': ['Net Worth Calculator', '/net-worth-calculator.html'], overtime: ['Overtime Pay Calculator', '/overtime-pay-calculator.html'],
    'freelance-rate': ['Freelance Rate Calculator', '/freelance-rate-calculator.html'], 'income-tax-scenario': ['Income Tax Scenario Calculator', '/income-tax-scenario-calculator.html']
  };
  const guides = {
    sip: ['SIP Calculator Guide', '/articles/sip-calculator-guide.html'], compound: ['Compound Interest Guide', '/articles/compound-interest-guide.html'],
    loan: ['EMI & Loan Payments Guide', '/articles/loan-emi-guide.html'], roi: ['ROI vs Annualized Return Guide', '/articles/roi-guide.html'],
    debt: ['How to Use a Debt Payoff Calculator', '/articles/how-to-use-a-debt-payoff-calculator.html'], retirement: ['How to Stress-Test a Retirement Goal', '/articles/how-to-stress-test-a-retirement-goal.html'],
    inflation: ['How to Use an Inflation Calculator', '/articles/how-to-use-an-inflation-calculator.html'], networth: ['How to Use a Net Worth Calculator', '/articles/how-to-use-a-net-worth-calculator.html'],
    salary: ['How to Use a Salary-to-Hourly Calculator', '/articles/how-to-use-a-salary-to-hourly-calculator.html'], cagr: ['When CAGR Can Mislead You', '/articles/when-cagr-can-mislead-you.html'],
    scenario: ['How to Compare SIP Scenarios Properly', '/articles/how-to-compare-sip-scenarios-properly.html'], calculator: ['How to Use a Financial Calculator Without Fooling Yourself', '/articles/how-to-use-financial-calculators.html']
  };
  const clusters = {
    sip: [calculators.lumpsum, calculators['compound-interest'], guides.sip, guides.scenario],
    'compound-interest': [calculators.sip, calculators.lumpsum, calculators['fixed-deposit'], guides.compound],
    mortgage: [calculators['car-loan'], calculators['personal-loan'], calculators['debt-payoff'], guides.loan],
    'car-loan': [calculators.mortgage, calculators['personal-loan'], calculators['debt-payoff'], guides.loan],
    'personal-loan': [calculators.mortgage, calculators['debt-payoff'], calculators['car-loan'], guides.loan],
    roi: [calculators.cagr, calculators.sip, calculators.lumpsum, guides.roi],
    cagr: [calculators.roi, calculators['compound-interest'], calculators.sip, guides.cagr],
    'debt-payoff': [calculators.mortgage, calculators['personal-loan'], calculators['car-loan'], guides.debt],
    inflation: [calculators.sip, calculators['compound-interest'], calculators['freedom-milestone'], guides.inflation],
    'freedom-milestone': [calculators.sip, calculators['net-worth'], calculators.inflation, guides.retirement],
    'net-worth': [calculators['debt-payoff'], calculators['freedom-milestone'], calculators.roi, guides.networth],
    'salary-conversion': [calculators.overtime, calculators['freelance-rate'], guides.salary],
    'freelance-rate': [calculators['salary-conversion'], calculators['profit-margin'], calculators.roi],
    'profit-margin': [calculators.roi, calculators['freelance-rate']], 'fixed-deposit': [calculators['recurring-deposit'], calculators['compound-interest'], calculators.sip],
    'recurring-deposit': [calculators['fixed-deposit'], calculators.sip, calculators['compound-interest']], lumpsum: [calculators.sip, calculators['compound-interest'], calculators.roi],
    'simple-interest': [calculators['compound-interest'], calculators['fixed-deposit']], overtime: [calculators['salary-conversion'], calculators['freelance-rate']],
    'income-tax-scenario': [calculators['salary-conversion'], calculators['freelance-rate']]
  };

  const path = location.pathname.replace(/\/+$/, '') || '/';
  const file = path.split('/').pop() || 'index.html';
  const id = Object.keys(calculators).find(k => file === calculators[k][1].slice(1));
  const root = document.querySelector('main');
  if (!root) return;

  function abs(href) { return href.startsWith('/') ? C + href : new URL(href, location.href).href; }
  function addMeta(name, content, property = false) {
    if (!content) return;
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    if (!document.head.querySelector(selector)) {
      const m = document.createElement('meta');
      if (property) m.setAttribute('property', name); else m.setAttribute('name', name);
      m.content = content; document.head.appendChild(m);
    }
  }
  function schemaOnce(type, data) {
    const existing = [...document.querySelectorAll('script[type="application/ld+json"]')].some(s => {
      try { return JSON.parse(s.textContent || '{}')['@type'] === type; } catch { return false; }
    });
    if (existing) return;
    const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(data); document.head.appendChild(s);
  }
  function uniqueLinks(items) {
    const seen = new Set([location.pathname]);
    return items.filter(x => x && x[1] && !seen.has(x[1]) && !seen.add(x[1])).slice(0, 5);
  }
  function renderCluster(title, items) {
    const clean = uniqueLinks(items);
    if (!clean.length || root.querySelector('[data-wa-phase3-cluster]')) return;
    const section = document.createElement('section');
    section.dataset.waPhase3Cluster = 'true'; section.className = 'wa-phase3-cluster'; section.setAttribute('aria-labelledby', 'wa-phase3-cluster-title');
    section.innerHTML = `<div class="wa-phase3-kicker">NEXT STEPS</div><h2 id="wa-phase3-cluster-title">${title}</h2><p>Continue with a closely related calculator or guide so you can test the assumptions behind the result.</p><div class="wa-phase3-links"></div>`;
    const box = section.querySelector('.wa-phase3-links');
    clean.forEach(([label, href]) => { const a = document.createElement('a'); a.href = href; a.className = 'wa-phase3-link'; a.textContent = label; box.appendChild(a); });
    root.appendChild(section);
  }

  addMeta('robots', 'index,follow'); addMeta('author', 'Wealth Arrays'); addMeta('publisher', 'Wealth Arrays');
  addMeta('og:site_name', 'Wealth Arrays', true); addMeta('og:type', path.startsWith('/articles/') ? 'article' : 'website', true);
  addMeta('og:title', document.title, true); addMeta('og:description', document.querySelector('meta[name="description"]')?.content || '', true);
  addMeta('og:url', location.href.split('#')[0], true); addMeta('og:image', `${C}/og-image.png`, true);
  addMeta('twitter:card', 'summary_large_image'); addMeta('twitter:title', document.title); addMeta('twitter:description', document.querySelector('meta[name="description"]')?.content || ''); addMeta('twitter:image', `${C}/og-image.png`);

  if (id) {
    renderCluster('Related calculators and guides', clusters[id] || []);
    schemaOnce('WebApplication', { '@context':'https://schema.org', '@type':'WebApplication', name:document.title.replace(/\s*\|.*$/,''), applicationCategory:'FinanceApplication', operatingSystem:'Web', url:abs(path), publisher:{'@type':'Organization',name:'Wealth Arrays',url:C+'/' } });
  } else if (path.startsWith('/articles/')) {
    const article = document.querySelector('article') || root.querySelector('article');
    const h1 = article?.querySelector('h1')?.textContent?.trim() || document.title.replace(/\s*\|.*$/,'');
    const description = document.querySelector('meta[name="description"]')?.content || '';
    schemaOnce('Article', { '@context':'https://schema.org','@type':'Article',headline:h1,description,author:{'@type':'Organization',name:'Wealth Arrays',url:C+'/about.html'},publisher:{'@type':'Organization',name:'Wealth Arrays',url:C+'/'},mainEntityOfPage:location.href.split('#')[0],dateModified:'2026-09-15' });
    renderCluster('Related tools and reading', [guides.calculator, calculators.sip, calculators['compound-interest'], calculators.mortgage, calculators.inflation]);
  } else if (path.startsWith('/category-')) {
    renderCluster('Explore related calculators and guides', [guides.calculator, calculators.sip, calculators.mortgage, calculators['net-worth'], calculators['compound-interest']]);
  }
})();

/* ===== WA CANONICAL MODULE | site | phase4-premium.js | sha256:99a2ba6efee4 ===== */
/* Wealth Arrays Phase 4 — accessibility, performance and premium UX guardrails. */
(function(){
  'use strict';
  function ready(fn){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn,{once:true}); else fn(); }
  function addSkip(){
    if(document.querySelector('.wa-skip-link')) return;
    var main=document.querySelector('main'); if(!main) return;
    if(!main.id) main.id='main-content';
    var a=document.createElement('a'); a.className='wa-skip-link'; a.href='#'+main.id; a.textContent='Skip to main content';
    document.body.insertBefore(a,document.body.firstChild);
  }
  function improveControls(){
    document.querySelectorAll('input,select,textarea').forEach(function(el){
      if(!el.getAttribute('aria-label') && !el.id){ el.setAttribute('aria-label','Financial calculator input'); }
    });
    document.querySelectorAll('button').forEach(function(b){
      if(!b.getAttribute('aria-label') && !b.textContent.trim() && !b.title) b.setAttribute('aria-label','Button');
    });
  }
  function announceErrors(){
    document.querySelectorAll('.calc-error,[role="alert"]').forEach(function(el){ el.setAttribute('aria-live','polite'); });
  }
  function observeVitals(){
    if(!('PerformanceObserver' in window)) return;
    try{
      new PerformanceObserver(function(list){
        list.getEntries().forEach(function(e){
          if(e.entryType==='largest-contentful-paint' && e.startTime>2500) document.documentElement.dataset.waLcp='slow';
        });
      }).observe({type:'largest-contentful-paint',buffered:true});
    }catch(e){}
  }
  function externalLinks(){
    document.querySelectorAll('a[target="_blank"]').forEach(function(a){
      var rel=(a.getAttribute('rel')||'').split(/\s+/).filter(Boolean);
      if(rel.indexOf('noopener')<0) rel.push('noopener');
      if(rel.indexOf('noreferrer')<0) rel.push('noreferrer');
      a.setAttribute('rel',rel.join(' '));
    });
  }
  ready(function(){ addSkip(); improveControls(); announceErrors(); externalLinks(); observeVitals(); });
})();
