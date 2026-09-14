/* Wealth Arrays interaction hotfix v3 — search + reliable PWA installation. */
(function () {
  'use strict';
  if (window.__WA_INTERACTION_HOTFIX_V3__) return;
  window.__WA_INTERACTION_HOTFIX_V3__ = true;
  var installEvent = null;

  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    installEvent = event;
    window.__WA_INSTALL_PROMPT__ = event;
    enableInstallButton();
  }, true);

  function registerPWA() {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function () {});
  }
  function norm(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  var aliases = {
    sip:'sip systematic investment plan mutual fund monthly investment', emi:'emi mortgage home loan monthly payment',
    fd:'fd fixed deposit maturity interest', rd:'rd recurring deposit monthly deposit', roi:'roi return investment profit',
    cagr:'cagr compound annual growth', loan:'loan mortgage personal car debt emi', tax:'tax income tax planner',
    salary:'salary hourly wage income', retirement:'retirement pension corpus financial independence',
    inflation:'inflation purchasing power future prices', lumpsum:'lumpsum lump sum investment', 'lump sum':'lumpsum lump sum investment',
    networth:'net worth assets liabilities wealth', 'net worth':'net worth assets liabilities wealth'
  };
  function renderSearch() {
    var input=document.getElementById('tool-search'), box=document.getElementById('tool-search-results');
    if(!input||!box)return;
    var query=norm(input.value);
    if(!query){box.innerHTML='';box.hidden=true;box.style.display='none';return;}
    var expanded=(query+' '+(aliases[query]||'')).trim(), terms=expanded.split(/\s+/).filter(Boolean);
    var cards=Array.prototype.slice.call(document.querySelectorAll('.home-tool-card,.ledger-row'));
    var hits=cards.map(function(card){var text=norm((card.getAttribute('data-search')||' ')+' '+card.textContent),score=text.indexOf(query)!==-1?100:0;
      terms.forEach(function(term){if(term.length>1&&text.indexOf(term)!==-1)score+=term===query?25:3;});return{card:card,score:score};
    }).filter(function(x){return x.score>0;}).sort(function(a,b){return b.score-a.score;}).slice(0,8);
    box.innerHTML=hits.length?hits.map(function(x){var c=x.card,t=c.querySelector('b'),d=c.querySelector('p')||c.querySelector('small'),h=c.getAttribute('href')||'#';return '<a class="wa-search-suggestion" href="'+h.replace(/"/g,'&quot;')+'"><span><strong>'+(t?t.textContent.trim():'Calculator')+'</strong><small>'+(d?d.textContent.trim():'')+'</small></span><b>→</b></a>';}).join(''):'<div class="tool-search-empty">No calculator found. Try SIP, EMI, FD, RD, ROI, loan, tax or salary.</div>';
    box.hidden=false;box.style.setProperty('display','block','important');
  }
  function bindSearch(){var input=document.getElementById('tool-search');if(!input||input.dataset.waHotfixV3Bound==='1')return;input.dataset.waHotfixV3Bound='1';
    ['input','keyup','search','change','focus'].forEach(function(n){input.addEventListener(n,renderSearch,true);});
    input.addEventListener('keydown',function(e){if(e.key==='Escape'){var b=document.getElementById('tool-search-results');if(b){b.hidden=true;b.style.display='none';}}},true);renderSearch();
  }
  function enableInstallButton(){document.querySelectorAll('.wa-install-btn').forEach(function(b){b.disabled=false;});}
  function bindInstall(){document.querySelectorAll('.wa-install-btn').forEach(function(button){if(button.dataset.waHotfixV3Bound==='1')return;button.dataset.waHotfixV3Bound='1';button.disabled=false;
    button.addEventListener('click',function(){var event=installEvent||window.__WA_INSTALL_PROMPT__;if(!event)return;button.disabled=true;try{var p=event.prompt();if(p&&p.catch)p.catch(function(){});}catch(e){}installEvent=null;window.__WA_INSTALL_PROMPT__=null;},true);
  });}
  function init(){registerPWA();bindSearch();bindInstall();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  setTimeout(init,50);setTimeout(init,300);setTimeout(init,1000);setTimeout(registerPWA,1800);
  if(window.MutationObserver)new MutationObserver(function(){bindSearch();bindInstall();}).observe(document.documentElement,{childList:true,subtree:true});
})();
