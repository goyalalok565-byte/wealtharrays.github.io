/* Wealth Arrays universal UI runtime — theme, currency, search, footer and card accents. */
(function(){
  'use strict';
  const C=[['USD','$','US Dollar'],['EUR','€','Euro'],['JPY','¥','Japanese Yen'],['GBP','£','British Pound'],['AUD','A$','Australian Dollar'],['CAD','C$','Canadian Dollar'],['CHF','CHF','Swiss Franc'],['CNY','CN¥','Chinese Yuan'],['HKD','HK$','Hong Kong Dollar'],['NZD','NZ$','New Zealand Dollar'],['SEK','kr','Swedish Krona'],['KRW','₩','South Korean Won'],['SGD','S$','Singapore Dollar'],['NOK','kr','Norwegian Krone'],['MXN','MX$','Mexican Peso'],['INR','₹','Indian Rupee'],['ZAR','R','South African Rand'],['BRL','R$','Brazilian Real'],['AED','د.إ','UAE Dirham'],['SAR','﷼','Saudi Riyal'],['TRY','₺','Turkish Lira'],['PLN','zł','Polish Zloty'],['THB','฿','Thai Baht'],['IDR','Rp','Indonesian Rupiah'],['MYR','RM','Malaysian Ringgit'],['PHP','₱','Philippine Peso'],['DKK','kr','Danish Krone'],['ILS','₪','Israeli Shekel'],['CZK','Kč','Czech Koruna'],['HUF','Ft','Hungarian Forint']];
  const CAT={investment:'#0D9488',loan:'#D97706',banking:'#2563EB',retirement:'#7C3AED',salary:'#DB2777',business:'#0891B2'};
  const get=(k,d)=>{try{return localStorage.getItem(k)||d}catch(e){return d}};
  const set=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
  const root=document.documentElement;
  function theme(t){
    t=t==='dark'?'dark':'light'; root.dataset.theme=t; set('waTheme',t);
    const b=document.getElementById('theme-toggle');
    if(b){b.setAttribute('aria-pressed',String(t==='dark'));b.setAttribute('aria-label',t==='dark'?'Switch to light mode':'Switch to dark mode');const l=b.querySelector('[data-theme-label]');if(l)l.textContent=t==='dark'?'Light mode':'Dark mode';}
  }
  function currency(){
    const s=document.getElementById('currency-select'); if(!s)return;
    const saved=get('waCurrency','INR');
    if(s.options.length!==C.length)s.innerHTML=C.map(x=>'<option value="'+x[0]+'">'+x[0]+' · '+x[1]+' · '+x[2]+'</option>').join('');
    s.value=C.some(x=>x[0]===saved)?saved:'INR'; root.dataset.currency=s.value;
  }
  function inferCategory(el){
    const text=((el.dataset.search||'')+' '+el.textContent).toLowerCase();
    if(/loan|mortgage|emi|debt|car loan|personal loan/.test(text))return'loan';
    if(/retirement|freedom|pension/.test(text))return'retirement';
    if(/salary|income|hourly|overtime|wage/.test(text))return'salary';
    if(/business|profit margin|freelance/.test(text))return'business';
    if(/fd|fixed deposit|rd|recurring deposit|interest|banking/.test(text))return'banking';
    return'investment';
  }
  function cardAccents(){
    document.querySelectorAll('.tool-card,.home-tool-card,.ledger-row').forEach(el=>{
      const key=inferCategory(el);el.dataset.waCategory=key;el.style.setProperty('--wa-card-accent',CAT[key]);
    });
    if(!document.getElementById('wa-universal-card-css')){
      const s=document.createElement('style');s.id='wa-universal-card-css';s.textContent='.tool-card.tool-card[data-wa-category],.home-tool-card.home-tool-card[data-wa-category],.ledger-row.ledger-row[data-wa-category]{border:1px solid color-mix(in srgb,var(--wa-card-accent) 44%,var(--line))!important;box-shadow:none!important}.tool-card.tool-card[data-wa-category]:hover,.home-tool-card.home-tool-card[data-wa-category]:hover,.ledger-row.ledger-row[data-wa-category]:hover{border-color:color-mix(in srgb,var(--wa-card-accent) 58%,var(--line))!important}';document.head.appendChild(s);
    }
  }
  function footer(){
    document.querySelectorAll('.footer-mark').forEach(a=>{a.innerHTML='<img src="/favicon-v2.svg" alt="Wealth Arrays" class="wa-footer-logo"><span>Wealth Arrays</span><sup>®</sup>';});
    document.querySelectorAll('.footer-logo').forEach(a=>{a.innerHTML='<img src="/favicon-v2.svg" alt="Wealth Arrays logo" class="wa-footer-logo"><span><b>Wealth Arrays</b><small>Financial tools that make numbers clearer.</small></span>';});
    document.querySelectorAll('.footer-logo img').forEach((img,i)=>{if(i>0)img.remove();});
    if(!document.getElementById('wa-universal-footer-css')){
      const s=document.createElement('style');s.id='wa-universal-footer-css';s.textContent='.footer-mark,.footer-logo{display:inline-flex!important;align-items:center;gap:10px;font-weight:850;line-height:1.1}.footer-mark{font-size:20px;letter-spacing:-.04em}.footer-logo{font-size:20px;letter-spacing:-.04em}.wa-footer-logo{width:30px!important;height:30px!important;display:block!important;flex:0 0 30px;object-fit:contain}.footer-mark sup{font-size:8px;align-self:flex-start;margin-top:1px}.footer-logo span{display:flex;flex-direction:column;gap:2px}.footer-logo span b{font-size:20px}.footer-logo span small{font-size:10px;font-weight:500;letter-spacing:0;color:var(--muted)}@media(max-width:600px){.footer-mark,.footer-logo,.footer-logo span b{font-size:19px}.wa-footer-logo{width:28px!important;height:28px!important;flex-basis:28px}}';document.head.appendChild(s);
    }
  }
  function search(){
    const input=document.getElementById('tool-search'), box=document.getElementById('tool-search-results');
    if(!input||!box||input.dataset.waUniversalSearch)return;
    input.dataset.waUniversalSearch='1';
    const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
    const aliases={sip:'systematic investment plan monthly investment mutual fund',emi:'mortgage home loan monthly payment',fd:'fixed deposit banking deposit',rd:'recurring deposit banking monthly deposit',roi:'return investment profit',cagr:'compound annual growth',tax:'income tax planner',salary:'hourly wage income',loan:'mortgage personal car debt',retirement:'pension financial independence',inflation:'purchasing power prices',lumpsum:'lump sum investment',networth:'net worth assets liabilities wealth'};
    const render=()=>{
      const cards=Array.from(document.querySelectorAll('.home-tool-card,.tool-card,.ledger-row'));
      const q=norm(input.value);
      if(!q){box.innerHTML='';box.hidden=true;return;}
      const expanded=(q+' '+(aliases[q]||'')).split(/\s+/).filter(Boolean);
      const matches=cards.map(card=>{const hay=norm((card.dataset.search||'')+' '+card.textContent);let score=hay===q?120:hay.includes(q)?100:0;expanded.forEach(t=>{if(t&&hay.includes(t))score+=2});return{card,score}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,8);
      box.innerHTML=matches.length?matches.map(({card})=>{const title=card.querySelector('b,h2')?.textContent?.trim()||card.textContent.trim().split('\n')[0];const desc=card.querySelector('p,small')?.textContent?.trim()||'';const href=card.getAttribute('href')||card.querySelector('a')?.getAttribute('href')||'#';return'<a class="wa-search-suggestion" href="'+href+'"><span><strong>'+title+'</strong><small>'+desc+'</small></span><b>→</b></a>'}).join(''):'<div class="tool-search-empty">No exact match. Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';
      box.hidden=false;
    };
    const stopOther=(e)=>{if(e.target===input){e.stopImmediatePropagation();render();}};
    input.addEventListener('input',stopOther,true);input.addEventListener('focus',stopOther,true);input.addEventListener('search',stopOther,true);input.addEventListener('keydown',e=>{if(e.key==='Escape'){box.hidden=true;}},true);
    document.addEventListener('click',e=>{if(!input.contains(e.target)&&!box.contains(e.target))box.hidden=true});
  }
  function bind(){
    theme(get('waTheme','light')); currency(); search(); footer(); cardAccents();
    const b=document.getElementById('theme-toggle');
    if(b&&!b.dataset.waUniversalTheme){b.dataset.waUniversalTheme='1';b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();theme(root.dataset.theme==='dark'?'light':'dark')},true);}
    const s=document.getElementById('currency-select');
    if(s&&!s.dataset.waUniversalCurrency){s.dataset.waUniversalCurrency='1';s.addEventListener('change',()=>{set('waCurrency',s.value);root.dataset.currency=s.value;window.dispatchEvent(new CustomEvent('wa-currency',{detail:{currency:s.value}}))},true);}
  }
  function start(){bind();[0,50,150,300,700].forEach(ms=>setTimeout(bind,ms));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
