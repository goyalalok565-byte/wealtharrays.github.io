/* Small calculator-page currency formatter. Kept separate from the large hub-only polish bundle. */
(function(){
  'use strict';
  const symbols={USD:'$',EUR:'€',GBP:'£',INR:'₹',JPY:'¥',CNY:'CN¥',CAD:'C$',AUD:'A$',CHF:'CHF',SGD:'S$',HKD:'HK$',KRW:'₩',AED:'د.إ',SAR:'﷼',NZD:'NZ$',MXN:'MX$',BRL:'R$',ZAR:'R',TRY:'₺',THB:'฿',MYR:'RM',IDR:'Rp',PHP:'₱',PLN:'zł',SEK:'kr'};
  function sync(){
    const article=document.querySelector('.tool-article');
    if(!article)return;
    const code=document.documentElement.dataset.currency||'USD';
    const symbol=symbols[code]||'$';
    article.querySelectorAll('p').forEach(paragraph=>{
      if(!paragraph.dataset.waCurrencyOriginal)paragraph.dataset.waCurrencyOriginal=paragraph.innerHTML;
      paragraph.innerHTML=paragraph.dataset.waCurrencyOriginal.replace(/(?:₹|\$)(?=\s*[0-9])/g,symbol);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync();
  window.addEventListener('wa-currency',sync);
  window.addEventListener('storage',event=>{if(event.key==='waCurrency')sync();});
})();
