/* Wealth Arrays homepage runtime — intentionally isolated from design/layout */
(function(){
'use strict';

const CURRENCIES=[
['USD','$','US Dollar'],['EUR','€','Euro'],['JPY','¥','Japanese Yen'],['GBP','£','British Pound'],['AUD','A$','Australian Dollar'],['CAD','C$','Canadian Dollar'],['CHF','CHF','Swiss Franc'],['CNY','CN¥','Chinese Yuan'],['HKD','HK$','Hong Kong Dollar'],['NZD','NZ$','New Zealand Dollar'],['SEK','kr','Swedish Krona'],['KRW','₩','South Korean Won'],['SGD','S$','Singapore Dollar'],['NOK','kr','Norwegian Krone'],['MXN','MX$','Mexican Peso'],['INR','₹','Indian Rupee'],['ZAR','R','South African Rand'],['BRL','R$','Brazilian Real'],['AED','د.إ','UAE Dirham'],['SAR','﷼','Saudi Riyal'],['TRY','₺','Turkish Lira'],['PLN','zł','Polish Zloty'],['THB','฿','Thai Baht'],['IDR','Rp','Indonesian Rupiah'],['MYR','RM','Malaysian Ringgit'],['PHP','₱','Philippine Peso'],['DKK','kr','Danish Krone'],['ILS','₪','Israeli Shekel'],['CZK','Kč','Czech Koruna'],['HUF','Ft','Hungarian Forint']
];

function init(){
 const root=document.documentElement;

 /* 30-currency selector */
 const currency=document.getElementById('currency-select');
 if(currency){
   const saved=localStorage.getItem('waCurrency')||'INR';
   currency.innerHTML=CURRENCIES.map(([code,symbol,name])=>'<option value="'+code+'">'+code+' · '+symbol+' · '+name+'</option>').join('');
   currency.value=CURRENCIES.some(x=>x[0]===saved)?saved:'INR';
   root.dataset.currency=currency.value;
   currency.onchange=function(){
     localStorage.setItem('waCurrency',currency.value);
     root.dataset.currency=currency.value;
     window.dispatchEvent(new CustomEvent('wa-currency',{detail:{currency:currency.value}}));
   };
 }

 /* theme toggle */
 const toggle=document.getElementById('theme-toggle');
 if(toggle){
   const apply=function(theme){
     root.dataset.theme=theme;
     localStorage.setItem('waTheme',theme);
     const label=toggle.querySelector('[data-theme-label]');
     if(label)label.textContent=theme==='dark'?'Light mode':'Dark mode';
     toggle.setAttribute('aria-pressed',String(theme==='dark'));
   };
   apply(localStorage.getItem('waTheme')==='dark'?'dark':'light');
   toggle.onclick=function(){
     apply(root.dataset.theme==='dark'?'light':'dark');
   };
 }

 /* calculator search suggestions */
 const input=document.getElementById('tool-search');
 const box=document.getElementById('tool-search-results');
 if(input&&box){
   const cards=Array.from(document.querySelectorAll('#home-calculators .home-tool-card'));
   const norm=s=>String(s||'').toLowerCase().trim();
   const aliases={sip:'systematic investment plan monthly investment mutual fund',emi:'mortgage home loan monthly payment',fd:'fixed deposit',rd:'recurring deposit',roi:'return investment profit',cagr:'compound annual growth',tax:'income tax',salary:'hourly wage income',loan:'mortgage personal car debt'};
   const render=function(){
     const q=norm(input.value);
     if(!q){box.innerHTML='';box.hidden=true;return;}
     const terms=q.split(/\s+/);
     const expanded=(q+' '+(aliases[q]||'')).split(/\s+/).filter(Boolean);
     const matches=cards.map(card=>{
       const hay=norm((card.dataset.search||'')+' '+card.textContent);
       let score=0;
       if(hay.includes(q))score+=100;
       terms.forEach(t=>{if(hay.includes(t))score+=10;});
       expanded.forEach(t=>{if(hay.includes(t))score+=1;});
       return {card,score};
     }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,8);
     box.innerHTML=matches.length?matches.map(({card})=>{
       const title=card.querySelector('b')?card.querySelector('b').textContent:'Calculator';
       const desc=card.querySelector('p')?card.querySelector('p').textContent:'';
       return '<a href="'+card.getAttribute('href')+'"><span><strong>'+title+'</strong><small>'+desc+'</small></span><b>→</b></a>';
     }).join(''):'<div class="tool-search-empty">Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';
     box.hidden=false;
   };
   input.addEventListener('input',render);
   input.addEventListener('focus',render);
   document.addEventListener('pointerdown',e=>{if(!input.contains(e.target)&&!box.contains(e.target))box.hidden=true;});
 }

 /* analytics consent: always offer on each new page load until this page is answered */
 if(!document.getElementById('wa-consent')){
   const consent=document.createElement('div');
   consent.id='wa-consent';
   consent.setAttribute('role','dialog');
   consent.innerHTML='<div><strong>Help us improve Wealth Arrays</strong><p>Allow anonymous analytics so we can understand which tools people find useful.</p></div><div class="wa-consent-actions"><button type="button" data-choice="denied">Reject</button><button type="button" data-choice="granted">Accept analytics</button></div>';
   consent.querySelectorAll('[data-choice]').forEach(btn=>btn.addEventListener('click',function(){
     const choice=this.dataset.choice;
     localStorage.setItem('waAnalyticsConsent',choice);
     if(typeof window.gtag==='function')window.gtag('consent','update',{analytics_storage:choice==='granted'?'granted':'denied'});
     consent.remove();
   }));
   document.body.appendChild(consent);
 }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();