/* Wealth Arrays canonical home runtime. Generated 20261119054746. */
(function(){const k='__WA_CANONICAL_HOME_RUNTIME__';if(window[k])return;window[k]=true;})();
/* ===== WA CANONICAL MODULE | home | final-polish.js | sha256:52ec999406af ===== */
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

/* ===== WA CANONICAL MODULE | home | theme-fix.js | sha256:237818d51e88 ===== */
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

/* ===== WA CANONICAL MODULE | home | phase3-seo.js | sha256:6fbe3402d666 ===== */
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

/* ===== WA CANONICAL MODULE | home | phase4-premium.js | sha256:269419f67ba9 ===== */
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
