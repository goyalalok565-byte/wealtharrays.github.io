(()=>{const C=[['USD','$','US Dollar'],['EUR','€','Euro'],['GBP','£','British Pound'],['INR','₹','Indian Rupee'],['JPY','¥','Japanese Yen'],['CNY','¥','Chinese Yuan'],['AUD','A$','Australian Dollar'],['CAD','C$','Canadian Dollar'],['CHF','CHF','Swiss Franc'],['HKD','HK$','Hong Kong Dollar'],['SGD','S$','Singapore Dollar'],['NZD','NZ$','New Zealand Dollar'],['AED','د.إ','UAE Dirham'],['SAR','﷼','Saudi Riyal'],['QAR','﷼','Qatari Riyal'],['KWD','د.ك','Kuwaiti Dinar'],['BHD','ب.د','Bahraini Dinar'],['OMR','﷼','Omani Rial'],['ZAR','R','South African Rand'],['BRL','R$','Brazilian Real'],['MXN','$','Mexican Peso'],['ARS','$','Argentine Peso'],['CLP','$','Chilean Peso'],['COP','$','Colombian Peso'],['PEN','S/','Peruvian Sol'],['UYU','$U','Uruguayan Peso'],['BOB','Bs','Bolivian Boliviano'],['PYG','₲','Paraguayan Guarani'],['CRC','₡','Costa Rican Colón'],['DOP','RD$','Dominican Peso'],['GTQ','Q','Guatemalan Quetzal'],['HNL','L','Honduran Lempira'],['NIO','C$','Nicaraguan Córdoba'],['PAB','B/.','Panamanian Balboa'],['JMD','J$','Jamaican Dollar'],['TTD','TT$','Trinidad Dollar'],['BBD','Bds$','Barbadian Dollar'],['BSD','B$','Bahamian Dollar'],['XCD','EC$','East Caribbean Dollar'],['BZD','BZ$','Belize Dollar'],['ISK','kr','Icelandic Króna'],['NOK','kr','Norwegian Krone'],['SEK','kr','Swedish Krona'],['DKK','kr','Danish Krone'],['PLN','zł','Polish Zloty'],['CZK','Kč','Czech Koruna'],['HUF','Ft','Hungarian Forint'],['RON','lei','Romanian Leu'],['BGN','лв','Bulgarian Lev'],['RSD','дин','Serbian Dinar'],['UAH','₴','Ukrainian Hryvnia'],['GEL','₾','Georgian Lari'],['TRY','₺','Turkish Lira'],['RUB','₽','Russian Ruble'],['KZT','₸','Kazakhstani Tenge'],['UZS','soʻm','Uzbekistani Som'],['AZN','₼','Azerbaijani Manat'],['AMD','֏','Armenian Dram'],['MDL','L','Moldovan Leu'],['BYN','Br','Belarusian Ruble'],['ILS','₪','Israeli Shekel'],['JOD','د.ا','Jordanian Dinar'],['LBP','ل.ل','Lebanese Pound'],['EGP','E£','Egyptian Pound'],['MAD','د.م.','Moroccan Dirham'],['DZD','دج','Algerian Dinar'],['TND','د.ت','Tunisian Dinar'],['LYD','ل.د','Libyan Dinar'],['ETB','Br','Ethiopian Birr'],['KES','KSh','Kenyan Shilling'],['NGN','₦','Nigerian Naira'],['GHS','₵','Ghanaian Cedi'],['UGX','USh','Ugandan Shilling'],['TZS','TSh','Tanzanian Shilling'],['RWF','FRw','Rwandan Franc'],['BWP','P','Botswana Pula'],['NAD','N$','Namibian Dollar'],['ZMW','ZK','Zambian Kwacha'],['MUR','₨','Mauritian Rupee'],['SCR','₨','Seychellois Rupee'],['MGA','Ar','Malagasy Ariary'],['XOF','CFA','West African CFA'],['XAF','FCFA','Central African CFA'],['CDF','FC','Congolese Franc'],['SDG','ج.س.','Sudanese Pound'],['SOS','S','Somali Shilling'],['DJF','Fdj','Djiboutian Franc'],['ERN','Nfk','Eritrean Nakfa'],['MZN','MT','Mozambican Metical'],['AOA','Kz','Angolan Kwanza'],['BIF','FBu','Burundian Franc'],['MWK','MK','Malawian Kwacha'],['SLE','Le','Sierra Leonean Leone'],['LRD','L$','Liberian Dollar'],['GMD','D','Gambian Dalasi'],['GNF','FG','Guinean Franc'],['CVE','$','Cape Verde Escudo'],['SHP','£','Saint Helena Pound'],['BTN','Nu.','Bhutanese Ngultrum'],['NPR','₨','Nepalese Rupee'],['PKR','₨','Pakistani Rupee'],['LKR','Rs','Sri Lankan Rupee'],['BDT','৳','Bangladeshi Taka'],['MMK','K','Myanmar Kyat'],['THB','฿','Thai Baht'],['VND','₫','Vietnamese Dong'],['IDR','Rp','Indonesian Rupiah'],['MYR','RM','Malaysian Ringgit'],['PHP','₱','Philippine Peso'],['KRW','₩','South Korean Won'],['TWD','NT$','Taiwan Dollar'],['MNT','₮','Mongolian Tögrög'],['LAK','₭','Lao Kip'],['KHR','៛','Cambodian Riel'],['BND','B$','Brunei Dollar'],['FJD','FJ$','Fijian Dollar'],['PGK','K','Papua New Guinean Kina'],['WST','T','Samoan Tala'],['TOP','T$','Tongan Paʻanga'],['VUV','VT','Vanuatu Vatu'],['SBD','SI$','Solomon Islands Dollar'],['XPF','₣','CFP Franc'],['MVR','Rf','Maldivian Rufiyaa'],['AFN','؋','Afghan Afghani'],['IRR','﷼','Iranian Rial'],['IQD','ع.د','Iraqi Dinar'],['YER','﷼','Yemeni Rial'],['SYP','£','Syrian Pound']];const L=[['en','English'],['hi','हिन्दी'],['es','Español'],['fr','Français'],['de','Deutsch'],['pt','Português'],['it','Italiano'],['nl','Nederlands'],['tr','Türkçe'],['ar','العربية'],['bn','বাংলা'],['ta','தமிழ்'],['te','తెలుగు'],['mr','मराठी'],['gu','ગુજરાતી'],['pa','ਪੰਜਾਬੀ'],['ja','日本語'],['ko','한국어'],['zh','中文'],['ru','Русский'],['id','Bahasa Indonesia'],['ms','Bahasa Melayu'],['th','ไทย'],['vi','Tiếng Việt'],['ur','اردو']];function renderGlobalFooter(){const f=document.querySelector('footer');if(!f)return;f.className='site-footer premium-footer';f.innerHTML='<div class="site-footer-inner"><div class="footer-brand-row"><a class="footer-logo" href="/index.html" aria-label="Wealth Arrays home"><img src="/favicon-v2.svg" alt="Wealth Arrays logo" width="44" height="44"><span><b>Wealth Arrays</b><small>Financial tools that make numbers clearer.</small></span></a><p class="footer-brand-copy">Fast, browser-first financial calculators for clearer decisions. Results are educational estimates and not financial, tax, legal or investment advice.</p></div><nav class="footer-nav-box" aria-label="Company and legal pages"><a class="footer-link" href="/privacy.html">Privacy Policy</a><a class="footer-link" href="/terms.html">Terms &amp; Conditions</a><a class="footer-link" href="/disclaimer.html">Disclaimer</a><a class="footer-link" href="/about.html">About Us</a><a class="footer-link" href="/contact.html">Contact Us</a><a class="footer-link" href="/methodology.html">Methodology</a><a class="footer-link" href="/editorial-standards.html">Editorial Standards</a><a class="footer-link" href="/advertising-policy.html">Advertising Policy</a><a class="footer-link" href="/faq.html">FAQ</a></nav><div class="footer-bottom"><span>© 2026 Wealth Arrays</span><span>Questions or corrections: <a href="mailto:goyalalok565@gmail.com">goyalalok565@gmail.com</a></span></div></div>'}const RELATED={investment:[['sip-calculator.html','SIP Calculator'],['compound-interest-calculator.html','Compound Interest'],['lumpsum-calculator.html','Lump Sum Calculator'],['cagr-calculator.html','CAGR Calculator'],['roi-calculator.html','ROI Calculator']],loan:[['mortgage-emi-calculator.html','Mortgage & EMI'],['car-loan-calculator.html','Car Loan'],['personal-loan-calculator.html','Personal Loan'],['debt-payoff-calculator.html','Debt Payoff']],banking:[['fixed-deposit-calculator.html','Fixed Deposit'],['recurring-deposit-calculator.html','Recurring Deposit'],['simple-interest-calculator.html','Simple Interest'],['inflation-calculator.html','Inflation']],retirement:[['retirement-calculator.html','Retirement'],['inflation-calculator.html','Inflation'],['compound-interest-calculator.html','Compound Interest'],['net-worth-calculator.html','Net Worth']],salary:[['salary-to-hourly-calculator.html','Salary to Hourly'],['overtime-pay-calculator.html','Overtime Pay'],['freelance-rate-calculator.html','Freelance Rate'],['income-tax-planner.html','Income Tax Planner']],business:[['profit-margin-calculator.html','Profit Margin'],['roi-calculator.html','ROI Calculator'],['freelance-rate-calculator.html','Freelance Rate'],['income-tax-planner.html','Income Tax Planner']]};function addRelatedTools(){const tag=document.querySelector('.calc-category-tag');const article=document.querySelector('.tool-article');if(!tag||!article||document.querySelector('.wa-related'))return;const href=tag.getAttribute('href')||'';const key=href.includes('investment')?'investment':href.includes('loan')?'loan':href.includes('banking')?'banking':href.includes('retirement')?'retirement':href.includes('salary')?'salary':href.includes('business')?'business':'';const current=location.pathname.split('/').pop()||'index.html';const items=(RELATED[key]||[]).filter(x=>x[0]!==current).slice(0,4);const sec=document.createElement('section');sec.className='related-tools wa-related';sec.setAttribute('aria-label','Related calculators');sec.innerHTML='<div class="related-heading">Related calculators</div><div class="related-list">'+items.map(x=>'<a href="'+x[0]+'">'+x[1]+' <span>→</span></a>').join('')+'</div><div class="calc-next-links"><a href="'+href+'">Browse this category →</a><a href="tools.html">Explore all 20 calculators →</a><a href="/faq.html">Read calculator FAQs →</a></div>';article.appendChild(sec)}function addTrustSignals(){const article=document.querySelector('.tool-article');if(!article||document.querySelector('.wa-trust-signals'))return;const sec=document.createElement('aside');sec.className='wa-trust-signals';sec.setAttribute('aria-label','Calculator methodology and trust information');sec.innerHTML='<div><strong>Transparent assumptions</strong><span>Results depend on the values and formula shown on this page.</span></div><div><strong>Educational estimates</strong><span>These tools do not replace financial, tax, legal or investment advice.</span></div><div><strong>Your browser</strong><span>Calculator inputs are designed to be processed locally where possible.</span></div><p><a href="/disclaimer.html">Disclaimer</a><a href="/privacy.html">Privacy</a><a href="/contact.html">Contact & corrections</a></p>';article.appendChild(sec)}function init(){renderGlobalFooter();addRelatedTools();addTrustSignals();

const WA_CATEGORY_COLORS={
  'Investing':'investing','Loans':'loans','Loans & EMI':'loans','Banking':'banking','Retirement':'retirement',
  'Planning':'planning','Income':'income','Business':'business','Tax':'tax'
};
document.querySelectorAll('.home-tool-card,.tool-card').forEach(card=>{
  const label=(card.querySelector('small')?.textContent||card.querySelector('.tool-num')?.textContent||'').trim();
  let key=Object.keys(WA_CATEGORY_COLORS).find(k=>label.toLowerCase().includes(k.toLowerCase()));
  if(!key){
    const x=label.toLowerCase();
    if(x.includes('invest'))key='Investing';else if(x.includes('loan'))key='Loans';else if(x.includes('bank'))key='Banking';else if(x.includes('retire'))key='Retirement';else if(x.includes('salary')||x.includes('income'))key='Income';else if(x.includes('business'))key='Business';else if(x.includes('tax'))key='Tax';else if(x.includes('planning'))key='Planning';
  }
  if(key&&WA_CATEGORY_COLORS[key])card.dataset.category=WA_CATEGORY_COLORS[key];
});
document.querySelectorAll('.cat-card').forEach(card=>{
  const href=card.getAttribute('href')||'';
  const map=href.includes('investment')?'investing':href.includes('loan')?'loans':href.includes('bank')?'banking':href.includes('retirement')?'retirement':href.includes('income')||href.includes('salary')?'income':href.includes('business')?'business':href.includes('tax')?'tax':'planning';
  card.dataset.category=map;
});

// Home calculator library recovery guard: the homepage must always expose all 20 tools unless the user is actively searching.
document.querySelectorAll('#home-calculators .home-tool-card').forEach(card=>{card.hidden=false;card.removeAttribute('aria-hidden');});
const recoverySearch=document.querySelector('#tool-search');
if(recoverySearch&&recoverySearch.value.trim()==='')document.querySelectorAll('#home-calculators .home-tool-card').forEach(card=>card.hidden=false);

const homeLibrary=document.querySelector('#home-calculators');
const hero=document.querySelector('.ledger-hero,.hero');
if(homeLibrary&&hero&&hero.nextElementSibling!==homeLibrary)hero.insertAdjacentElement('afterend',homeLibrary);

const cur=document.querySelector('#currency-select');
if(cur){cur.innerHTML=C.map(x=>`<option value="${x[0]}">${x[0]} · ${x[1]} · ${x[2]}</option>`).join('');cur.value=localStorage.waCurrency||'INR';document.documentElement.dataset.currency=cur.value;cur.onchange=()=>{localStorage.waCurrency=cur.value;document.documentElement.dataset.currency=cur.value;window.waTrack?.('currency_change',{currency:cur.value});window.dispatchEvent(new Event('wa-currency'))}}

document.querySelectorAll('#language-select').forEach(el=>el.remove());
document.querySelectorAll('a[href="#"]').forEach(a=>{if(!a.dataset.allowHash){a.addEventListener('click',e=>e.preventDefault())}});

const b=document.querySelector('#theme-toggle');
const apply=t=>{document.documentElement.dataset.theme=t;localStorage.waTheme=t;if(b){b.setAttribute('aria-label',`Switch to ${t==='dark'?'light':'dark'} mode`);const label=b.querySelector('[data-theme-label]');if(label)label.textContent=t==='dark'?'Light mode':'Dark mode'}};
apply(localStorage.waTheme||'light');
if(b)b.onclick=()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';apply(next);window.waTrack?.('theme_change',{theme:next})};

// Homepage search is handled only by index.html; do not attach a second handler here.



// Google Analytics 4 + privacy-friendly consent controls
const WA_GA_ID='G-GYN4W5VFEY';
window.dataLayer=window.dataLayer||[];
function gtag(){window.dataLayer.push(arguments)}
gtag('consent','default',{
  analytics_storage:'denied',
  ad_storage:'denied',
  ad_user_data:'denied',
  ad_personalization:'denied',
  wait_for_update:500
});
gtag('js',new Date());
gtag('config',WA_GA_ID,{anonymize_ip:true});
(()=>{
  const s=document.createElement('script');
  s.async=true;
  s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(WA_GA_ID);
  document.head.appendChild(s);
})();

// GA4 interaction events — only sent after the visitor explicitly accepts analytics.
window.waTrack=function(name,params={}){
  try{
    if(localStorage.getItem('waAnalyticsConsent')!=='granted')return;
    if(typeof window.gtag==='function')window.gtag('event',name,params);
  }catch(e){}
};
const waConsent=()=>{try{return localStorage.getItem('waAnalyticsConsent')}catch(e){return null}};
const waSetConsent=value=>{
  try{localStorage.setItem('waAnalyticsConsent',value)}catch(e){}
  gtag('consent','update',{
    analytics_storage:value==='granted'?'granted':'denied',
    ad_storage:'denied',
    ad_user_data:'denied',
    ad_personalization:'denied'
  });
};
if(waConsent())waSetConsent(waConsent());
const waConsentBanner=()=>{
  if(waConsent())return;
  const box=document.createElement('div');
  box.id='wa-consent';
  box.setAttribute('role','dialog');
  box.setAttribute('aria-label','Privacy choices');
  box.innerHTML='<div><strong>Privacy choices</strong><p>We use analytics to understand which pages and tools are useful. Calculator numbers stay in your browser.</p></div><div class="wa-consent-actions"><button type="button" data-wa-consent="reject">Reject</button><button type="button" data-wa-consent="granted">Accept analytics</button></div>';
  const style=document.createElement('style');
  style.textContent='#wa-consent{position:fixed;z-index:99999;left:max(16px,env(safe-area-inset-left));right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));margin:auto;max-width:720px;padding:16px 18px;border:1px solid rgba(120,130,150,.28);border-radius:20px;background:rgba(20,25,35,.96);color:#f7f8fb;box-shadow:0 18px 60px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:space-between;gap:18px;font:500 14px/1.5 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}#wa-consent strong{font-size:15px}#wa-consent p{margin:4px 0 0;color:#c7ceda}.wa-consent-actions{display:flex;gap:8px;flex:none}.wa-consent-actions button{border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:10px 14px;background:transparent;color:#fff;font:inherit;cursor:pointer}.wa-consent-actions button[data-wa-consent="granted"]{background:#fff;color:#111827;border-color:#fff}@media(max-width:620px){#wa-consent{display:block}.wa-consent-actions{margin-top:12px}.wa-consent-actions button{flex:1}}';
  document.head.appendChild(style);
  document.body.appendChild(box);
  box.querySelectorAll('[data-wa-consent]').forEach(btn=>btn.onclick=()=>{waSetConsent(btn.dataset.waConsent);box.remove();style.remove()});
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',waConsentBanner);else waConsentBanner();

window.WA={currencies:C,languages:L};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();