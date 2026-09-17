/* Wealth Arrays homepage search — canonical owner for the hero calculator search. */
(function(){
  'use strict';
  if(window.__WA_HOMEPAGE_SEARCH_LOADED__)return;
  window.__WA_HOMEPAGE_SEARCH_LOADED__=true;
  const norm=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const aliases={sip:'systematic investment plan monthly mutual fund',emi:'mortgage home loan monthly payment',fd:'fixed deposit banking',rd:'recurring deposit monthly banking',roi:'return investment profit',tax:'income tax scenario',loan:'mortgage personal car debt',salary:'hourly wage income',retirement:'pension financial independence',cagr:'compound annual growth return',inflation:'purchasing power future prices',lumpsum:'lump sum investment',networth:'assets liabilities wealth'};
  function install(){
    if(!document.querySelector('.ledger-hero'))return;
    const oldInput=document.getElementById('tool-search'),oldBox=document.getElementById('tool-search-results');
    if(!oldInput||!oldBox)return;
    /* Replace the core-owned nodes so stale listeners cannot hide/overwrite our suggestions. */
    const input=oldInput.cloneNode(true),box=oldBox.cloneNode(false);input.id='tool-search';box.id='tool-search-results';box.className='tool-search-results';box.hidden=true;
    oldInput.replaceWith(input);oldBox.replaceWith(box);input.dataset.waSearchOwner='homepage-search';
    const shell=input.closest('.tool-search-shell,.search-bar,.hero-copy');
    if(shell){shell.style.position='relative';shell.style.zIndex='30';shell.style.overflow='visible'}
    box.style.position='absolute';box.style.left='0';box.style.right='0';box.style.top='calc(100% + 8px)';box.style.zIndex='2147483000';box.style.maxHeight='min(55vh,440px)';box.style.overflowY='auto';box.style.background='var(--surface,#fff)';box.style.border='1px solid var(--line,#e2e6ed)';box.style.borderRadius='14px';box.style.boxShadow='0 18px 45px rgba(16,20,27,.18)';
    const render=()=>{const q=norm(input.value);if(!q){box.innerHTML='';box.hidden=true;box.style.display='none';return}const terms=(q+' '+(aliases[q]||'')).split(/\s+/).filter(Boolean);const hits=[...document.querySelectorAll('.home-tool-card')].map(card=>{const hay=norm((card.dataset.search||'')+' '+card.textContent);let score=hay.includes(q)?100:0;terms.forEach(t=>{if(t.length>1&&hay.includes(t))score+=t===q?20:3});return{card,score}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,8);box.innerHTML=hits.length?hits.map(({card})=>{const title=(card.querySelector('b')?.textContent||'Calculator').trim(),desc=(card.querySelector('p')?.textContent||'').trim(),href=card.getAttribute('href')||'#';return '<a class="wa-search-suggestion" href="'+esc(href)+'"><span><strong>'+esc(title)+'</strong><small>'+esc(desc)+'</small></span><b aria-hidden="true">→</b></a>'}).join(''):'<div class="tool-search-empty">No calculator found. Try SIP, EMI, FD, RD, loan, tax or ROI.</div>';box.hidden=false;box.style.setProperty('display','block','important');};
    ['input','search','focus'].forEach(e=>input.addEventListener(e,render));input.addEventListener('keydown',e=>{if(e.key==='Escape'){box.hidden=true;box.style.display='none';input.blur()}});document.addEventListener('click',e=>{if(!input.contains(e.target)&&!box.contains(e.target)){box.hidden=true;box.style.display='none'}});window.addEventListener('resize',()=>{if(window.innerWidth<=760&&shell){shell.style.width='100%';shell.style.maxWidth='620px';shell.style.margin='0 0 24px'}});if(window.innerWidth<=760&&shell){shell.style.order='-1';shell.style.width='100%';shell.style.maxWidth='620px';shell.style.margin='0 0 24px'}window.__WA_HOME_SEARCH_READY__=true;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
