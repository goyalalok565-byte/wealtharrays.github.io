/* Wealth Arrays canonical site runtime. Generated 20261119054746. */
(function(){const k='__WA_CANONICAL_SITE_RUNTIME__';if(window[k])return;window[k]=true;})();
/* ===== WA CANONICAL MODULE | site | wa-core.js | sha256:394efae3afbf ===== */
/* Wealth Arrays core runtime — one owner for shared site behaviour. */
(function () {
  'use strict';
  if (window.__WEALTH_ARRAYS_CORE_LOADED__) return;
  window.__WEALTH_ARRAYS_CORE_LOADED__ = true;
  const CURRENCIES=[["USD","$","US Dollar"],["EUR","€","Euro"],["GBP","£","British Pound"],["INR","₹","Indian Rupee"],["JPY","¥","Japanese Yen"],["CNY","CN¥","Chinese Yuan"],["CAD","C$","Canadian Dollar"],["AUD","A$","Australian Dollar"],["CHF","CHF","Swiss Franc"],["SGD","S$","Singapore Dollar"],["HKD","HK$","Hong Kong Dollar"],["KRW","₩","South Korean Won"],["AED","د.إ","UAE Dirham"],["SAR","﷼","Saudi Riyal"],["NZD","NZ$","New Zealand Dollar"],["MXN","MX$","Mexican Peso"],["BRL","R$","Brazilian Real"],["ZAR","R","South African Rand"],["TRY","₺","Turkish Lira"],["THB","฿","Thai Baht"],["MYR","RM","Malaysian Ringgit"],["IDR","Rp","Indonesian Rupiah"],["PHP","₱","Philippine Peso"],["PLN","zł","Polish Zloty"],["SEK","kr","Swedish Krona"]];
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
  function analytics(){const id='G-GYN4W5VFEY';window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments)}window.gtag=window.gtag||gtag;gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});gtag('js',new Date());gtag('config',id,{anonymize_ip:true});if(!document.querySelector('script[data-wa-gtag]')){const script=document.createElement('script');script.async=true;script.dataset.waGtag='1';script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);document.head.appendChild(script)}window.waTrack=function(name,params){try{const events=new Set(['currency_change','calculator_open','calculator_calculate','pdf_export','embed_copy','scenario_share','scenario_run','goal_run','workspace_calculate','workspace_save','workspace_load','workspace_delete','report_export','login','sign_up','begin_checkout','subscription_cancel_request']);if(!events.has(name)||get('waAnalyticsConsent','')!=='granted')return;const allowed=new Set(['calculator_id','currency','plan','page_type','result_count','feature','method','status']);const safe={};Object.keys(params||{}).forEach(key=>{if(!allowed.has(key))return;const value=params[key];if(typeof value==='string'&&/^[a-z0-9_.-]{1,80}$/i.test(value))safe[key]=value;else if(typeof value==='number'&&Number.isFinite(value))safe[key]=value;else if(typeof value==='boolean')safe[key]=value});window.gtag('event',name,safe)}catch(error){}};const saved=get('waAnalyticsConsent','');if(saved)gtag('consent','update',{analytics_storage:saved==='granted'?'granted':'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'})}
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

/* ===== WA CANONICAL MODULE | site | site-runtime.js | sha256:5c9ef46299a9 ===== */
/* Wealth Arrays visual runtime — cards, charts and defensive UX fallbacks. */
(function () {
  'use strict';
  /* Hub pages already have one shared runtime owner; keep this visual/calculator layer off them. */
  if(window.__WEALTH_ARRAYS_CORE_LOADED__&&!document.querySelector('.calc-page'))return;
  function installAdSense(){
    if(/(?:^|\/)404\.html$|(?:^|\/)widget\.html$/.test(location.pathname)) return;
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

/* ===== WA CANONICAL MODULE | site | final-polish.js | sha256:52ec999406af ===== */
/* Wealth Arrays final polish — non-destructive UX, content consistency and trust signals. */
(function(){'use strict';
/* Search fallback is shared by the home/tool hubs; the canonical bundle already owns theme/currency state. */
if(window.__WEALTH_ARRAYS_FINAL_POLISH_LOADED__)return; window.__WEALTH_ARRAYS_FINAL_POLISH_LOADED__=true;
const CURRENCY_SYMBOLS={"USD":"$","EUR":"€","GBP":"£","INR":"₹","JPY":"¥","CNY":"CN¥","CAD":"C$","AUD":"A$","CHF":"CHF","SGD":"S$","HKD":"HK$","KRW":"₩","AED":"د.إ","SAR":"﷼","NZD":"NZ$","MXN":"MX$","BRL":"R$","ZAR":"R","TRY":"₺","THB":"฿","MYR":"RM","IDR":"Rp","PHP":"₱","PLN":"zł","SEK":"kr"};
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
 if(window.__WA_HOMEPAGE_SEARCH_LOADED__)return;
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
 if(window.__WA_HOMEPAGE_SEARCH_LOADED__)return;
 if(window.innerWidth>760)return;
 const input=document.getElementById('tool-search');
 const shell=input?.closest('.tool-search-shell,.search-bar');
 const hero=document.querySelector('.hero-copy');
 if(!shell||!hero)return;
 hero.style.display='flex';hero.style.flexDirection='column';hero.style.alignItems='stretch';
 shell.style.order='-1';shell.style.marginTop='0';shell.style.marginBottom='26px';shell.style.maxWidth='620px';shell.style.width='100%';
}
function mobileSearchLayerFix(){
 if(window.__WA_HOMEPAGE_SEARCH_LOADED__)return;
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
 const data={'step-up-sip':{fields:[['monthly','Starting monthly investment',5000,0,''],['stepUp','Annual increase',10,0,'%'],['rate','Expected annual return',10,0,'%'],['years','Investment period',15,1,'yrs'],['inflation','Expected annual inflation',6,0,'%']]},'emergency-fund':{fields:[['expenses','Essential monthly expenses',50000,0,''],['months','Months of coverage',6,1,'mos'],['current','Current emergency savings',100000,0,'']]},'real-return':{fields:[['nominal','Nominal annual return',10,-99,'%'],['inflation','Annual inflation',6,-99,'%'],['amount','Starting amount',100000,0,''],['years','Time period',10,1,'yrs']]}}[match[1]];
 if(!data||host.querySelector('input[type="number"]'))return;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const id='wa-direct-'+match[1];let html='<section id="'+id+'" style="display:block!important;visibility:visible!important;opacity:1!important;border:1px solid #e5e7eb;border-radius:18px;padding:18px;background:#fff;box-shadow:0 8px 28px rgba(15,23,42,.08)"><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px">';
 data.fields.forEach(f=>{html+='<label style="display:flex;flex-direction:column;gap:6px;font-weight:700;font-size:13px">'+esc(f[1])+'<span style="display:flex;align-items:center;border:1px solid #d1d5db;border-radius:10px;min-height:46px;background:#fff"><input id="'+id+'-'+f[0]+'" type="number" inputmode="decimal" value="'+f[2]+'" min="'+f[3]+'" style="width:100%;border:0;outline:0;padding:11px;font:inherit;font-size:16px;background:transparent"><b style="padding:0 10px;color:#667085">'+esc(f[4])+'</b></span></label>'});
 html+='</div><div id="'+id+'-results" style="display:grid;gap:8px;margin-top:18px"></div></section>';host.innerHTML=html;
 const val=k=>Number(document.getElementById(id+'-'+k).value)||0,money=n=>'₹'+Number(n).toLocaleString('en-IN',{maximumFractionDigits:0}),results=document.getElementById(id+'-results');
 function calc(){let rows=[];if(match[1]==='step-up-sip'){let c=val('monthly'),r=val('rate')/1200,f=0,inv=0,m=val('years')*12;for(let i=1;i<=m;i++){f=(f+c)*(1+r);inv+=c;if(i%12===0)c*=1+val('stepUp')/100}rows=[['Total invested',money(inv)],['Growth / profit',money(f-inv)],['Projected future value',money(f)],['Future value in today\'s money',money(f/Math.pow(1+val('inflation')/100,val('years')))]]}else if(match[1]==='emergency-fund'){let target=val('expenses')*val('months'),gap=Math.max(0,target-val('current'));rows=[['Emergency-fund target',money(target)],['Already saved',money(val('current'))],['Remaining gap',money(gap)],['Current coverage',val('expenses')?((val('current')/val('expenses')).toFixed(1)+' yrs'):'0 yrs']]}else{let n=val('nominal')/100,i=val('inflation')/100,real=((1+n)/(1+i)-1)*100,f=val('amount')*Math.pow(1+n,val('years'));rows=[['Real annual return',real.toFixed(2)+'%'],['Nominal future value',money(f)],['Future value in today\'s purchasing power',money(f/Math.pow(1+i,val('years')))]]}results.innerHTML=rows.map(r=>'<div style="display:flex;justify-content:space-between;gap:12px;padding:12px;border-radius:10px;background:#f8fafc"><span>'+esc(r[0])+'</span><strong>'+esc(r[1])+'</strong></div>').join('')}
 data.fields.forEach(f=>document.getElementById(id+'-'+f[0]).addEventListener('input',calc));calc();
 const mo=new MutationObserver(()=>{if(!host.querySelector('input[type="number"]')){host.innerHTML='';setTimeout(directExpansionRender,0)}});mo.observe(host,{childList:true});
}
function start(){tidy();reframeTaxScenario();addReviewStamp();syncStaticCurrencyExamples();moveHomepageSearchUp();mobileSearchFallback();mobileSearchLayerFix();cardVisualPolish();expansionCalculatorRescue();directExpansionRender();setTimeout(()=>{tidy();reframeTaxScenario();syncStaticCurrencyExamples();moveHomepageSearchUp();mobileSearchFallback();mobileSearchLayerFix();cardVisualPolish();expansionCalculatorRescue();directExpansionRender()},400);setTimeout(()=>{tidy();reframeTaxScenario();syncStaticCurrencyExamples();moveHomepageSearchUp();mobileSearchFallback();mobileSearchLayerFix();cardVisualPolish();expansionCalculatorRescue();directExpansionRender()},1200);window.addEventListener('wa-currency',syncStaticCurrencyExamples);window.addEventListener('resize',moveHomepageSearchUp,{passive:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
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

/* ===== WA CANONICAL MODULE | site | phase3-seo.js | sha256:6fbe3402d666 ===== */
/* Wealth Arrays Phase 3 — SEO, topic-cluster and internal-linking runtime. */
(() => {
  'use strict';
  if (window.__WA_PHASE3_SEO__) return;
  window.__WA_PHASE3_SEO__ = true;

  const C = 'https://wealtharrays.com';
  const calculators = {
    sip: ['SIP Calculator', '/sip-calculator/'], 'compound-interest': ['Compound Interest Calculator', '/compound-interest-calculator/'],
    mortgage: ['Mortgage / Loan EMI Calculator', '/mortgage-emi-calculator/'], roi: ['ROI Calculator', '/roi-calculator/'],
    'simple-interest': ['Simple Interest Calculator', '/simple-interest-calculator/'], 'freedom-milestone': ['Retirement Calculator', '/retirement-calculator/'],
    'salary-conversion': ['Salary to Hourly Calculator', '/salary-to-hourly-calculator/'], 'profit-margin': ['Profit Margin Calculator', '/profit-margin-calculator/'],
    'fixed-deposit': ['Fixed Deposit Calculator', '/fixed-deposit-calculator/'], 'recurring-deposit': ['Recurring Deposit Calculator', '/recurring-deposit-calculator/'],
    lumpsum: ['Lumpsum Calculator', '/lumpsum-calculator/'], cagr: ['CAGR Calculator', '/cagr-calculator/'],
    'car-loan': ['Car Loan Calculator', '/car-loan-calculator/'], 'personal-loan': ['Personal Loan Calculator', '/personal-loan-calculator/'],
    'debt-payoff': ['Debt Payoff Calculator', '/debt-payoff-calculator/'], inflation: ['Inflation Calculator', '/inflation-calculator/'],
    'net-worth': ['Net Worth Calculator', '/net-worth-calculator/'], overtime: ['Overtime Pay Calculator', '/overtime-pay-calculator/'],
    'freelance-rate': ['Freelance Rate Calculator', '/freelance-rate-calculator/'], 'income-tax-scenario': ['Income Tax Scenario Calculator', '/income-tax-scenario-calculator/']
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
  function schemaHasType(node, type) {
    return !!node && (node['@type'] === type || (Array.isArray(node['@graph']) && node['@graph'].some(item => schemaHasType(item, type))));
  }
  function schemaOnce(type, data) {
    const existing = [...document.querySelectorAll('script[type="application/ld+json"]')].some(s => {
      try {
        const parsed = JSON.parse(s.textContent || '{}');
        return schemaHasType(parsed, type) || (type === 'WebApplication' && schemaHasType(parsed, 'SoftwareApplication'));
      } catch { return false; }
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
  addMeta('og:url', location.href.split('#')[0], true); addMeta('og:image', `${C}/og-card.svg`, true);
  addMeta('twitter:card', 'summary_large_image'); addMeta('twitter:title', document.title); addMeta('twitter:description', document.querySelector('meta[name="description"]')?.content || ''); addMeta('twitter:image', `${C}/og-card.svg`);

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

/* ===== WA CANONICAL MODULE | site | phase4-premium.js | sha256:269419f67ba9 ===== */
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
  function dedupeSharedControls(){
    ['currency-select','language-select','theme-toggle'].forEach(function(id){
      var nodes=Array.prototype.slice.call(document.querySelectorAll('#'+id));
      if(nodes.length<2)return;
      var keep=nodes.find(function(n){return n.offsetParent!==null})||nodes[0];
      nodes.forEach(function(n){if(n!==keep)n.remove();});
    });
    var controls=document.querySelector('.masthead-controls');
    if(controls){
      var seen={};
      Array.prototype.slice.call(controls.children).forEach(function(node){
        var key=node.querySelector?.('#currency-select')?'currency':node.querySelector?.('#language-select')?'language':node.querySelector?.('#theme-toggle')?'theme':'';
        if(key){if(seen[key])node.remove();else seen[key]=true;}
      });
    }
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
  ready(function(){
    addSkip();
    dedupeSharedControls();
    improveControls();
    announceErrors();
    externalLinks();
    observeVitals();
    if(window.MutationObserver){
      var pending=false;
      new MutationObserver(function(){
        if(pending)return;
        pending=true;
        requestAnimationFrame(function(){pending=false;dedupeSharedControls();});
      }).observe(document.body,{childList:true,subtree:true});
    }
  });
})();

/* ===== WA CANONICAL MODULE | site | calculator-search.js | sha256:83bf8facdb1c ===== */
/* Wealth Arrays calculator search — single resilient owner for calculator and library search. */
(function () {
  'use strict';
  if (window.__WA_CALCULATOR_SEARCH_LOADED__) return;
  window.__WA_CALCULATOR_SEARCH_LOADED__ = true;
  const CATALOG=[["SIP Calculator","/sip-calculator/","Monthly investing and projected wealth.","sip systematic investment plan monthly mutual fund investing"],["Compound Interest","/compound-interest-calculator/","See compounding over time.","compound interest savings growth investing"],["Mortgage / EMI","/mortgage-emi-calculator/","Monthly payment and total interest.","mortgage emi home loan payment"],["ROI Calculator","/roi-calculator/","Total and annualized returns.","roi return investment profit"],["Simple Interest","/simple-interest-calculator/","Flat interest on principal.","simple interest banking loan"],["Freedom Milestone","/retirement-calculator/","Estimate your financial independence target.","retirement fire pension financial independence"],["Salary ↔ Hourly","/salary-to-hourly-calculator/","Convert annual and hourly pay.","salary hourly wage income"],["Profit Margin","/profit-margin-calculator/","Revenue, cost and margin math.","profit margin business revenue cost"],["Fixed Deposit","/fixed-deposit-calculator/","Deposit growth and maturity value.","fixed deposit fd banking maturity"],["Recurring Deposit","/recurring-deposit-calculator/","Monthly deposit maturity planning.","recurring deposit rd monthly banking"],["Lumpsum Calculator","/lumpsum-calculator/","One-time investment projection.","lumpsum lump sum investment"],["CAGR Calculator","/cagr-calculator/","Compound annual growth rate.","cagr annual growth return"],["Car Loan EMI","/car-loan-calculator/","Vehicle loan payment planning.","car auto vehicle loan emi"],["Personal Loan","/personal-loan-calculator/","Payment and repayment cost.","personal loan emi payment"],["Debt Payoff","/debt-payoff-calculator/","Plan a faster route out of debt.","debt payoff repayment credit"],["Inflation Calculator","/inflation-calculator/","Understand future purchasing power.","inflation future value purchasing power"],["Net Worth","/net-worth-calculator/","Assets minus liabilities.","net worth assets liabilities wealth"],["Overtime Pay","/overtime-pay-calculator/","Estimate overtime earnings.","overtime pay salary wage"],["Freelance Rate","/freelance-rate-calculator/","Turn target income into an hourly rate.","freelance rate hourly pricing business"],["Income Tax Planner","/income-tax-planner/","Scenario planning for tax estimates.","income tax planner effective rate"],["Home Loan EMI Calculator","/home-loan-emi-calculator/","Calculate a home-loan EMI, total interest and total repayment.","home loan emi calculator loan calculate a home-loan emi, total interest and total repayment."],["Currency Converter","/currency-converter/","Convert an amount using an exchange rate you provide.","currency converter banking convert an amount using an exchange rate you provide."],["Flat Cost Calculator","/flat-cost-calculator/","Estimate the all-in purchase cost of a flat or apartment.","flat cost calculator loan estimate the all-in purchase cost of a flat or apartment."],["Loan EMI Calculator","/loan-emi-calculator/","Calculate EMI and total interest for a standard loan.","loan emi calculator loan calculate emi and total interest for a standard loan."],["Capital Gain Calculator","/capital-gain-calculator/","Estimate gain, taxable gain and tax using your assumptions.","capital gain calculator investment estimate gain, taxable gain and tax using your assumptions."],["Lumpsum + SIP Calculator","/lumpsum-sip-calculator/","Combine an initial investment with a monthly SIP.","lumpsum + sip calculator investment combine an initial investment with a monthly sip."],["Loan Against Property Calculator","/loan-against-property-calculator/","Estimate borrowing capacity against a property.","loan against property calculator loan estimate borrowing capacity against a property."],["Home Loan Eligibility Calculator","/home-loan-eligibility-calculator/","Estimate a home-loan amount from income and EMI capacity.","home loan eligibility calculator loan estimate a home-loan amount from income and emi capacity."],["Silver Jewelry Calculator","/silver-jewelry-calculator/","Estimate silver jewellery value with purity and making charges.","silver jewelry calculator banking estimate silver jewellery value with purity and making charges."],["Advanced Home Loan Eligibility Calculator","/advanced-home-loan-eligibility-calculator/","Model eligibility with co-applicant income and obligations.","advanced home loan eligibility calculator loan model eligibility with co-applicant income and obligations."],["Consumer Durable Loan Calculator","/consumer-durable-loan-calculator/","Estimate EMI for a phone, appliance or other financed purchase.","consumer durable loan calculator loan estimate emi for a phone, appliance or other financed purchase."],["Gold Jewelry Calculator","/gold-jewelry-calculator/","Estimate gold jewellery price from rate, weight, purity and charges.","gold jewelry calculator banking estimate gold jewellery price from rate, weight, purity and charges."],["Loan Prepayment vs SIP Calculator","/loan-prepayment-vs-sip-calculator/","Compare loan-interest savings with investing the same extra cash.","loan prepayment vs sip calculator investment compare loan-interest savings with investing the same extra cash."],["Loan-to-Value (LTV) Calculator","/loan-to-value-ltv-calculator/","Calculate LTV and the loan supported by a property value.","loan-to-value (ltv) calculator loan calculate ltv and the loan supported by a property value."],["Stamp Duty Calculator","/stamp-duty-calculator/","Estimate stamp duty and registration costs on a property purchase.","stamp duty calculator loan estimate stamp duty and registration costs on a property purchase."],["Property Calculator","/property-calculator/","Estimate upfront cash, EMI and total home-buying cost.","property calculator loan estimate upfront cash, emi and total home-buying cost."],["Loan Interest Calculator","/loan-interest-calculator/","Calculate interest and total repayment on an amortizing loan.","loan interest calculator loan calculate interest and total repayment on an amortizing loan."],["PPF Calculator","/ppf-calculator/","Estimate PPF growth from annual contributions and an assumed rate.","ppf public provident fund annual contribution"],["EPF Calculator","/epf-calculator/","Estimate EPF savings from pay, contributions, salary growth and interest.","epf employee provident fund retirement"],["GST Calculator","/gst-calculator/","Calculate GST on a taxable amount and estimate the invoice total.","gst goods services tax invoice"],["Emergency Fund Calculator","/emergency-fund-calculator/","Set a cash reserve target from monthly expenses and savings capacity.","emergency fund savings expenses cash reserve"],["Credit Card Payoff Calculator","/credit-card-payoff-calculator/","Estimate payoff time and interest for a fixed monthly card payment.","credit card payoff balance apr interest"],["Step-Up SIP Calculator","/step-up-sip-calculator/","Model a monthly SIP that increases each year.","step up sip systematic investment plan annual increase"],["SIP Goal Calculator","/sip-goal-calculator/","Estimate the monthly SIP needed to work toward a target corpus.","sip goal target corpus monthly investment"],["Gratuity Calculator","/gratuity-calculator/","Estimate gratuity from last-drawn basic pay, DA and service years.","gratuity salary service years"],["HRA Exemption Calculator","/hra-exemption-calculator/","Estimate HRA exemption from salary, rent and city percentage.","hra exemption house rent allowance salary rent tax",["NPS Calculator","/nps-calculator/","Estimate an NPS retirement corpus and illustrative annuity income.","nps national pension system retirement pension corpus annuity"]],["SWP Calculator","/swp-calculator/","See how long a corpus lasts when you withdraw a fixed amount every month.","swp systematic withdrawal plan monthly withdrawal corpus mutual fund retirement income"],["Sukanya Samriddhi (SSY)","/ssy-calculator/","Project the Sukanya Samriddhi Yojana balance at the 21-year maturity.","sukanya samriddhi ssy girl child savings scheme maturity"],["Rule of 72","/rule-of-72-calculator/","Find how many years it takes money to double at a given annual return.","rule of 72 doubling time compounding years to double inflation"],["Rent vs Buy","/rent-vs-buy-calculator/","Compare the net worth from buying a home with renting and investing the difference.","rent vs buy home loan emi rent property decision net worth"],["FIRE Calculator","/fire-calculator/","Estimate the years left until your savings can cover your spending.","fire financial independence retire early corpus withdrawal rate"],["50/30/20 Budget","/budget-calculator/","Split take-home pay into needs, wants and savings and compare with what you spend.","budget 50 30 20 needs wants savings monthly spending"],["Break-Even Calculator","/break-even-calculator/","Find how many units you must sell to cover fixed costs and reach a profit target.","break even business fixed cost variable cost units profit cafe shop"],["Cost of Delay SIP","/cost-of-delay-sip-calculator/","See how much waiting a few years to start a SIP can cost at the end.","cost of delay sip start late investing compounding catch up"]];
  const ALIASES={sip:'systematic investment plan monthly mutual fund',emi:'mortgage home loan monthly payment',fd:'fixed deposit banking',rd:'recurring deposit monthly banking',roi:'return investment profit',cagr:'compound annual growth return',tax:'income tax scenario',salary:'hourly wage income',loan:'mortgage personal car debt',retirement:'pension financial independence',inflation:'purchasing power future prices',lumpsum:'lump sum investment one time',networth:'assets liabilities wealth','net worth':'assets liabilities wealth','compound interest':'compounding growth','simple interest':'flat interest','profit margin':'business revenue cost margin','car loan':'vehicle loan emi','personal loan':'loan repayment',freelance:'freelance rate hourly pricing',overtime:'overtime pay salary',home:'home loan mortgage eligibility emi',property:'property flat home stamp duty',gold:'gold jewellery jewelry rate purity',silver:'silver jewellery jewelry rate purity',currency:'currency converter exchange rate',ltv:'loan to value property',prepayment:'loan prepayment vs sip',jewelry:'gold silver jewellery price',stamp:'stamp duty property charges','ppf':'public provident fund annual contribution','epf':'employee provident fund retirement','gst':'goods services tax invoice','emergency fund':'emergency savings cash reserve','credit card':'credit card payoff apr interest','step up sip':'annual sip increase','sip goal':'target corpus monthly sip','gratuity':'payment of gratuity salary years','hra':'house rent allowance exemption rent tax'};
  const normalize=v=>String(v||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
  const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function score(c,q){const t=normalize(c[0]),s=normalize(c[1]),k=normalize(c[3]),d=normalize(c[2]),a=normalize(ALIASES[q]||'');let n=0;if(t===q)n+=500;if(t.includes(q))n+=250;if(s.includes(q))n+=180;if(k.includes(q))n+=160;if(d.includes(q))n+=60;for(const x of normalize(`${q} ${a}`).split(' ').filter(Boolean))if(x.length>1&&(t.includes(x)||k.includes(x)||s.includes(x)))n+=x===q?35:8;return n;}
  function nodes(){return{input:document.getElementById('tool-search'),box:document.getElementById('tool-search-results')}}
  function install(){
    const calc=!!document.querySelector('.calc-page'),lib=!!document.querySelector('.tool-library-search');if(!calc&&!lib)return false;
    let{input,box}=nodes();if(!input||!box)return false;
    if(input.dataset.waSearchOwner==='calculator-search')return true;
    input.dataset.waSearchOwner='calculator-search';
    const shell=input.closest('.tool-search-shell,.search-bar,.tool-library-search,.calc-page');
    if(shell){shell.style.position='relative';shell.style.zIndex='1000';shell.style.overflow='visible'}
    Object.assign(box.style,{position:'absolute',top:'calc(100% + 8px)',left:'0',right:'0',width:'100%',zIndex:'99999',maxHeight:'350px',overflowY:'auto',overflowX:'hidden',background:'var(--surface,#fff)',border:'1px solid var(--line,#e2e6ed)',borderRadius:'14px',boxShadow:'0 10px 25px rgba(0,0,0,.15)'});
    const hide=()=>{box.hidden=true;box.style.display='none'},show=()=>{box.hidden=false;box.style.setProperty('display','block','important')};
    const render=()=>{const q=normalize(input.value);if(!q){box.innerHTML='';hide();if(lib)document.querySelectorAll('.tools-grid .tool-card').forEach(c=>c.hidden=false);return}
      if(lib){const terms=normalize(`${q} ${ALIASES[q]||''}`).split(' ').filter(Boolean),cards=[...document.querySelectorAll('.tools-grid .tool-card')],matches=cards.map(card=>{const h=normalize(`${card.querySelector('h2')?.textContent||''} ${card.dataset.search||''} ${card.querySelector('p')?.textContent||''}`);let n=h.includes(q)?300:0;for(const x of terms)if(x.length>1&&h.includes(x))n+=x===q?30:5;return{card,score:n}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);cards.forEach(c=>c.hidden=!matches.some(x=>x.card===c));box.innerHTML=matches.slice(0,8).map(({card})=>{const t=card.querySelector('h2')?.textContent?.trim()||'Calculator',d=card.querySelector('p')?.textContent?.trim()||'';return`<a class="wa-search-suggestion" href="${esc(card.getAttribute('href')||'#')}"><span><strong>${esc(t)}</strong><small>${esc(d)}</small></span><b aria-hidden="true">→</b></a>`}).join('')||'<div class="tool-search-empty">No calculator found. Try SIP, EMI, FD, RD, loan, tax or ROI.</div>'}
      else{const results=CATALOG.map(c=>({c,score:score(c,q)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,8);box.innerHTML=results.length?results.map(({c})=>`<a class="wa-search-suggestion" href="${esc(c[1])}"><span><strong>${esc(c[0])}</strong><small>${esc(c[2])}</small></span><b aria-hidden="true">→</b></a>`).join(''):'<div class="tool-search-empty">No calculator found. Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>'}show()};
    input.addEventListener('input',render);input.addEventListener('search',render);input.addEventListener('keyup',render);input.addEventListener('focus',render);input.addEventListener('keydown',e=>{if(e.key==='Escape'){hide();input.blur()}});document.addEventListener('click',e=>{if(!input.contains(e.target)&&!box.contains(e.target))hide()});window.WA_CALCULATOR_SEARCH_CATALOG=CATALOG;window.__WA_SEARCH_READY__=true;render();return true;
  }
  function boot(){if(install())return;const observer=new MutationObserver(()=>{if(install())observer.disconnect()});observer.observe(document.documentElement,{childList:true,subtree:true});[50,150,300,600,1200,2500].forEach(ms=>setTimeout(install,ms))}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
