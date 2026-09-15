/* Wealth Arrays final polish — non-destructive UX, content consistency and trust signals. */
(function(){'use strict';
const CURRENCY_SYMBOLS={USD:'$',EUR:'€',JPY:'¥',GBP:'£',AUD:'A$',CAD:'C$',CHF:'CHF',CNY:'CN¥',HKD:'HK$',NZD:'NZ$',SEK:'kr',KRW:'₩',SGD:'S$',NOK:'kr',MXN:'MX$',INR:'₹',ZAR:'R',BRL:'R$',AED:'د.إ',SAR:'﷼',TRY:'₺',PLN:'zł',THB:'฿',IDR:'Rp',MYR:'RM',PHP:'₱',DKK:'kr',ILS:'₪',CZK:'Kč',HUF:'Ft'};
const CATALOG=[
 ['SIP Calculator','/sip-calculator.html','Monthly investing and projected wealth.','sip systematic investment plan monthly mutual fund investing'],
 ['Compound Interest','/compound-interest-calculator.html','See how compounding changes growth over time.','compound interest compounding savings growth investing'],
 ['Mortgage / EMI','/mortgage-emi-calculator.html','Estimate monthly payment and total interest.','mortgage emi home loan loan payment interest'],
 ['ROI Calculator','/roi-calculator.html','Measure total and annualized investment return.','roi return investment profit annualized'],
 ['Simple Interest','/simple-interest-calculator.html','Calculate flat interest on principal.','simple interest banking loan deposit'],
 ['Retirement Calculator','/retirement-calculator.html','Estimate a financial-independence target.','retirement fire pension financial independence goal'],
 ['Salary to Hourly','/salary-to-hourly-calculator.html','Convert annual salary and hourly pay.','salary hourly wage income pay'],
 ['Profit Margin','/profit-margin-calculator.html','Calculate revenue, cost and margin.','profit margin business revenue cost'],
 ['Fixed Deposit','/fixed-deposit-calculator.html','Project deposit growth and maturity value.','fixed deposit fd banking maturity interest'],
 ['Recurring Deposit','/recurring-deposit-calculator.html','Plan monthly deposits and maturity value.','recurring deposit rd monthly banking maturity'],
 ['Lumpsum Calculator','/lumpsum-calculator.html','Project a one-time investment.','lumpsum lump sum investment one time'],
 ['CAGR Calculator','/cagr-calculator.html','Calculate compound annual growth rate.','cagr compound annual growth rate return'],
 ['Car Loan EMI','/car-loan-calculator.html','Plan vehicle-loan payments and interest.','car loan auto vehicle emi repayment'],
 ['Personal Loan','/personal-loan-calculator.html','Estimate personal-loan repayment cost.','personal loan emi payment repayment'],
 ['Debt Payoff','/debt-payoff-calculator.html','Plan a faster route out of debt.','debt payoff repayment credit loan'],
 ['Inflation Calculator','/inflation-calculator.html','Understand future purchasing power.','inflation future value purchasing power prices'],
 ['Net Worth','/net-worth-calculator.html','Track assets minus liabilities.','net worth assets liabilities wealth'],
 ['Overtime Pay','/overtime-pay-calculator.html','Estimate overtime earnings.','overtime pay salary wage income'],
 ['Freelance Rate','/freelance-rate-calculator.html','Turn target income into an hourly rate.','freelance rate hourly pricing business income'],
 ['Income Tax Scenario Calculator','/income-tax-scenario-calculator.html','Explore tax scenarios using an effective-rate assumption.','income tax tax scenario effective rate planning']
];
const ALIASES={sip:'systematic investment plan monthly mutual fund',emi:'mortgage home loan monthly payment',fd:'fixed deposit banking',rd:'recurring deposit monthly banking',roi:'return investment profit',cagr:'compound annual growth return',tax:'income tax scenario',salary:'hourly wage income',loan:'mortgage personal car debt',retirement:'pension financial independence',inflation:'purchasing power future prices',lumpsum:'lump sum investment','net worth':'assets liabilities wealth',networth:'assets liabilities wealth','compound interest':'compounding growth','simple interest':'flat interest','profit margin':'business revenue cost margin','car loan':'vehicle loan emi','personal loan':'loan repayment',freelance:'freelance rate hourly pricing',overtime:'overtime pay salary'};
function normalize(v){return String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function escapeHtml(v){return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
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
function installSafeSearch(){
 const input=document.getElementById('tool-search'),box=document.getElementById('tool-search-results');if(!input||!box||input.dataset.waSearchFix==='1')return;input.dataset.waSearchFix='1';
 const shell=input.closest('.tool-search-shell')||input.parentElement; if(shell&&getComputedStyle(shell).position==='static')shell.style.position='relative';
 const render=()=>{
   const q=normalize(input.value);if(!q){box.innerHTML='';box.hidden=true;box.style.display='none';return;}
   const terms=(q+' '+(ALIASES[q]||'')).split(/\s+/).filter(Boolean);
   const hits=CATALOG.map(item=>{const hay=normalize(item.join(' '));let score=hay===q?100:hay.includes(q)?80:0;terms.forEach(t=>{if(t.length>1&&hay.includes(t))score+=t===q?12:3});return {item,score}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,6);
   box.innerHTML=hits.length?hits.map(({item})=>'<a href="'+item[1]+'"><span><strong>'+escapeHtml(item[0])+'</strong><small>'+escapeHtml(item[2])+'</small></span><b>→</b></a>').join(''):'<div class="wa-search-empty">No calculator found. Try SIP, EMI, FD, ROI, tax or retirement.</div>';
   box.hidden=false;box.style.display='block';box.classList.add('wa-search-fallback');
 };
 input.addEventListener('input',render);input.addEventListener('focus',()=>{if(input.value.trim())render()});input.addEventListener('keydown',e=>{if(e.key==='Escape'){input.value='';render();input.blur()}});
 document.addEventListener('click',e=>{if(!shell?.contains(e.target)){box.hidden=true;box.style.display='none'}},true);
 const style=document.createElement('style');style.textContent='.wa-search-empty{padding:14px 15px;color:var(--muted,#667085);font-size:12px;line-height:1.4}.wa-search-fallback a strong{font-size:13px}.wa-search-fallback a b{align-self:center;font-size:16px}';document.head.appendChild(style);
}
function start(){tidy();reframeTaxScenario();addReviewStamp();syncStaticCurrencyExamples();installSafeSearch();setTimeout(()=>{tidy();reframeTaxScenario();syncStaticCurrencyExamples();installSafeSearch()},400);setTimeout(()=>{tidy();reframeTaxScenario();syncStaticCurrencyExamples();installSafeSearch()},1200);window.addEventListener('wa-currency',syncStaticCurrencyExamples)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
