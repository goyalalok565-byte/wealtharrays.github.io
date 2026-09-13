/* Wealth Arrays universal UI runtime — one owner for theme, currency and homepage search. */
(function(){
  'use strict';
  const C=[['USD','$','US Dollar'],['EUR','€','Euro'],['JPY','¥','Japanese Yen'],['GBP','£','British Pound'],['AUD','A$','Australian Dollar'],['CAD','C$','Canadian Dollar'],['CHF','CHF','Swiss Franc'],['CNY','CN¥','Chinese Yuan'],['HKD','HK$','Hong Kong Dollar'],['NZD','NZ$','New Zealand Dollar'],['SEK','kr','Swedish Krona'],['KRW','₩','South Korean Won'],['SGD','S$','Singapore Dollar'],['NOK','kr','Norwegian Krone'],['MXN','MX$','Mexican Peso'],['INR','₹','Indian Rupee'],['ZAR','R','South African Rand'],['BRL','R$','Brazilian Real'],['AED','د.إ','UAE Dirham'],['SAR','﷼','Saudi Riyal'],['TRY','₺','Turkish Lira'],['PLN','zł','Polish Zloty'],['THB','฿','Thai Baht'],['IDR','Rp','Indonesian Rupiah'],['MYR','RM','Malaysian Ringgit'],['PHP','₱','Philippine Peso'],['DKK','kr','Danish Krone'],['ILS','₪','Israeli Shekel'],['CZK','Kč','Czech Koruna'],['HUF','Ft','Hungarian Forint']];
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
  function search(){
    const input=document.getElementById('tool-search'), box=document.getElementById('tool-search-results');
    if(!input||!box||input.dataset.waUniversalSearch)return;
    input.dataset.waUniversalSearch='1';
    const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
    const aliases={sip:'systematic investment plan monthly investment mutual fund',emi:'mortgage home loan monthly payment',fd:'fixed deposit banking deposit',rd:'recurring deposit banking monthly deposit',roi:'return investment profit',cagr:'compound annual growth',tax:'income tax planner',salary:'hourly wage income',loan:'mortgage personal car debt',retirement:'pension financial independence',inflation:'purchasing power prices',lumpsum:'lump sum investment'};
    const cards=Array.from(document.querySelectorAll('#home-calculators .home-tool-card'));
    const render=()=>{
      const q=norm(input.value); if(!q){box.innerHTML='';box.hidden=true;return;}
      const terms=(q+' '+(aliases[q]||'')).split(/\s+/).filter(Boolean);
      const matches=cards.map(card=>{const hay=norm((card.dataset.search||'')+' '+card.textContent);let score=hay.includes(q)?100:0;terms.forEach(t=>{if(hay.includes(t))score+=2});return{card,score}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,8);
      box.innerHTML=matches.length?matches.map(({card})=>'<a class="wa-search-suggestion" href="'+card.getAttribute('href')+'"><span><strong>'+card.querySelector('b').textContent+'</strong><small>'+card.querySelector('p').textContent+'</small></span><b>→</b></a>').join(''):'<div class="tool-search-empty">No exact match. Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';
      box.hidden=false;
    };
    input.addEventListener('input',render);input.addEventListener('focus',render);input.addEventListener('search',render);
    document.addEventListener('click',e=>{if(!input.contains(e.target)&&!box.contains(e.target))box.hidden=true});
  }
  function bind(){
    theme(get('waTheme','light')); currency(); search();
    const b=document.getElementById('theme-toggle');
    if(b&&!b.dataset.waUniversalTheme){
      b.dataset.waUniversalTheme='1';
      b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();theme(root.dataset.theme==='dark'?'light':'dark')},true);
    }
    const s=document.getElementById('currency-select');
    if(s&&!s.dataset.waUniversalCurrency){
      s.dataset.waUniversalCurrency='1';
      s.addEventListener('change',()=>{set('waCurrency',s.value);root.dataset.currency=s.value;window.dispatchEvent(new CustomEvent('wa-currency',{detail:{currency:s.value}}))},true);
    }
  }
  function start(){bind();[0,50,150,300,700].forEach(ms=>setTimeout(bind,ms));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
