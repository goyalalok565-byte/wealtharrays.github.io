/* Wealth Arrays final polish — non-destructive UX, content consistency and trust signals. */
(function(){'use strict';
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
function start(){tidy();reframeTaxScenario();addReviewStamp();syncStaticCurrencyExamples();moveHomepageSearchUp();mobileSearchFallback();mobileSearchLayerFix();expansionCalculatorRescue();directExpansionRender();setTimeout(()=>{tidy();reframeTaxScenario();syncStaticCurrencyExamples();moveHomepageSearchUp();mobileSearchFallback();mobileSearchLayerFix();expansionCalculatorRescue();directExpansionRender()},400);setTimeout(()=>{tidy();reframeTaxScenario();syncStaticCurrencyExamples();moveHomepageSearchUp();mobileSearchFallback();mobileSearchLayerFix();expansionCalculatorRescue();directExpansionRender()},1200);window.addEventListener('wa-currency',syncStaticCurrencyExamples);window.addEventListener('resize',moveHomepageSearchUp,{passive:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();