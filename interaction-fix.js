/* Wealth Arrays interaction hotfix v4 — deterministic calculator search + PWA install. */
(function () {
  'use strict';
  if (window.__WA_INTERACTION_HOTFIX_V4__) return;
  window.__WA_INTERACTION_HOTFIX_V4__ = true;
  var installEvent = null;

  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    installEvent = event;
    window.__WA_INSTALL_PROMPT__ = event;
    enableInstallButton();
  }, true);

  function registerPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(function () {
        enableInstallButton();
      }).catch(function () {});
    }
  }

  var catalog = [
    ['SIP Calculator','sip systematic investment plan monthly mutual fund investing','sip-calculator.html'],
    ['Compound Interest','compound interest savings growth investing','compound-interest-calculator.html'],
    ['Mortgage / EMI','mortgage emi home loan payment','mortgage-emi-calculator.html'],
    ['ROI Calculator','roi return investment profit','roi-calculator.html'],
    ['Simple Interest','simple interest banking loan','simple-interest-calculator.html'],
    ['Retirement Calculator','retirement fire pension financial independence','retirement-calculator.html'],
    ['Salary ↔ Hourly','salary hourly wage income','salary-to-hourly-calculator.html'],
    ['Profit Margin','profit margin business revenue cost','profit-margin-calculator.html'],
    ['Fixed Deposit','fd fixed deposit banking maturity interest','fixed-deposit-calculator.html'],
    ['Recurring Deposit','rd recurring deposit monthly banking','recurring-deposit-calculator.html'],
    ['Lumpsum Calculator','lumpsum lump sum investment','lumpsum-calculator.html'],
    ['CAGR Calculator','cagr annual growth return','cagr-calculator.html'],
    ['Car Loan EMI','car auto vehicle loan emi','car-loan-calculator.html'],
    ['Personal Loan','personal loan emi payment','personal-loan-calculator.html'],
    ['Debt Payoff','debt payoff repayment credit','debt-payoff-calculator.html'],
    ['Inflation Calculator','inflation future value purchasing power','inflation-calculator.html'],
    ['Net Worth','net worth assets liabilities wealth','net-worth-calculator.html'],
    ['Overtime Pay','overtime pay salary wage','overtime-pay-calculator.html'],
    ['Freelance Rate','freelance rate hourly pricing business','freelance-rate-calculator.html'],
    ['Income Tax Planner','income tax planner effective rate','income-tax-planner.html']
  ];
  var aliases = {
    sip:'sip systematic investment plan mutual fund monthly investment', emi:'emi mortgage home loan monthly payment',
    fd:'fd fixed deposit maturity interest', rd:'rd recurring deposit monthly deposit', roi:'roi return investment profit',
    cagr:'cagr compound annual growth', loan:'loan mortgage personal car debt emi', tax:'tax income tax planner',
    salary:'salary hourly wage income', retirement:'retirement pension corpus financial independence',
    inflation:'inflation purchasing power future prices', lumpsum:'lumpsum lump sum investment', 'lump sum':'lumpsum lump sum investment',
    networth:'net worth assets liabilities wealth', 'net worth':'net worth assets liabilities wealth'
  };
  function norm(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }

  function renderSearch() {
    var input = document.getElementById('tool-search');
    var box = document.getElementById('tool-search-results');
    if (!input || !box) return;
    var query = norm(input.value);
    if (!query) { box.innerHTML=''; box.hidden=true; box.style.display='none'; return; }
    var expanded = (query + ' ' + (aliases[query] || '')).trim();
    var terms = expanded.split(/\s+/).filter(Boolean);
    var cards = Array.prototype.slice.call(document.querySelectorAll('.home-tool-card,.tool-card,.ledger-row'));
    var pool = cards.length ? cards.map(function(card){
      var title = (card.querySelector('b,h2') || {}).textContent || '';
      var desc = (card.querySelector('p,small') || {}).textContent || '';
      var href = card.getAttribute('href') || '#';
      return {title:title.trim(), text:norm(title+' '+desc+' '+(card.getAttribute('data-search')||'')), href:href};
    }) : catalog.map(function(x){return {title:x[0],text:norm(x[0]+' '+x[1]),href:x[2]};});
    var hits = pool.map(function(item){
      var score = item.text.indexOf(query) >= 0 ? 100 : 0;
      terms.forEach(function(term){ if(term.length > 1 && item.text.indexOf(term) >= 0) score += (term === query ? 20 : 4); });
      return {item:item,score:score};
    }).filter(function(x){return x.score > 0;}).sort(function(a,b){return b.score-a.score;}).slice(0,8);
    box.innerHTML = hits.length ? hits.map(function(x){
      var i=x.item;
      return '<a class="wa-search-suggestion" href="'+i.href.replace(/"/g,'&quot;')+'"><span><strong>'+i.title+'</strong><small>Open calculator</small></span><b>→</b></a>';
    }).join('') : '<div class="tool-search-empty">No calculator found. Try SIP, EMI, FD, RD, ROI, loan, tax or salary.</div>';
    box.hidden=false; box.style.setProperty('display','block','important');
  }

  function bindSearch() {
    var input=document.getElementById('tool-search');
    if(!input || input.dataset.waHotfixV4Bound==='1') return;
    input.dataset.waHotfixV4Bound='1';
    ['input','keyup','search','change','focus'].forEach(function(n){input.addEventListener(n,renderSearch,true);});
    input.addEventListener('keydown',function(e){if(e.key==='Escape'){var b=document.getElementById('tool-search-results');if(b){b.hidden=true;b.style.display='none';}}},true);
    renderSearch();
  }
  function enableInstallButton(){document.querySelectorAll('.wa-install-btn').forEach(function(b){b.disabled=false;});}
  function bindInstall(){document.querySelectorAll('.wa-install-btn').forEach(function(button){
    if(button.dataset.waHotfixV4Bound==='1')return;
    button.dataset.waHotfixV4Bound='1'; button.disabled=false;
    button.addEventListener('click',function(){
      var event=installEvent||window.__WA_INSTALL_PROMPT__;
      if(!event){ return; }
      button.disabled=true;
      try { var p=event.prompt(); if(p&&p.catch)p.catch(function(){}); } catch(e) {}
      installEvent=null; window.__WA_INSTALL_PROMPT__=null;
    },true);
  });}
  function init(){registerPWA();bindSearch();bindInstall();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
  setTimeout(init,100); setTimeout(init,500); setTimeout(init,1500); setTimeout(registerPWA,3000);
  if(window.MutationObserver) new MutationObserver(function(){bindSearch();bindInstall();}).observe(document.documentElement,{childList:true,subtree:true});
})();
