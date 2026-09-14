/* Wealth Arrays UX enhancements — install banner + delegated homepage search. */
(function(){'use strict';
const qsa=(s)=>Array.from(document.querySelectorAll(s));
function installed(){return window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true||document.referrer.indexOf('android-app://')===0}
function installBanner(){
  if(installed()||document.getElementById('wa-install-banner'))return;
  let deferred=null, dismissed=false;
  const box=document.createElement('aside'); box.id='wa-install-banner'; box.setAttribute('role','dialog'); box.setAttribute('aria-label','Install Wealth Arrays');
  box.innerHTML='<div class="wa-install-copy"><span class="wa-install-icon">WA</span><span><strong>Install Wealth Arrays</strong><small>Keep your finance tools one tap away.</small></span></div><div class="wa-install-actions"><button type="button" class="wa-install-btn" disabled>Install App</button><button type="button" class="wa-install-close" aria-label="Dismiss install message">×</button></div>';
  const style=document.createElement('style'); style.id='wa-install-css'; style.textContent='#wa-install-banner{position:fixed;z-index:100000;top:12px;left:max(12px,env(safe-area-inset-left));right:max(12px,env(safe-area-inset-right));margin:auto;width:min(620px,calc(100% - 24px));padding:10px 11px;border:1px solid var(--line,#e2e6ed);border-radius:15px;background:var(--surface,#fff);color:var(--text,#10141b);box-shadow:0 14px 42px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:space-between;gap:12px;font:500 13px/1.3 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;transform:translateY(0);opacity:1;transition:transform .28s ease,opacity .22s ease}#wa-install-banner.wa-install-hide{transform:translateY(calc(-100% - 24px));opacity:0;pointer-events:none}.wa-install-copy{display:flex;align-items:center;gap:10px;min-width:0}.wa-install-copy>span:last-child{display:grid;gap:2px}.wa-install-copy strong{font-size:12px}.wa-install-copy small{font-size:10px;color:var(--muted,#667085)}.wa-install-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:9px;background:var(--text,#10141b);color:var(--bg,#fff);font-size:9px;font-weight:900;flex:none}.wa-install-actions{display:flex;align-items:center;gap:6px;flex:none}.wa-install-btn,.wa-install-close{font:750 11px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer}.wa-install-btn{border:1px solid var(--text,#10141b);border-radius:9px;padding:9px 11px;background:var(--text,#10141b);color:var(--bg,#fff)}.wa-install-btn:disabled{opacity:.5;cursor:default}.wa-install-close{width:31px;height:31px;border:1px solid var(--line,#e2e6ed);border-radius:9px;background:transparent;color:var(--muted,#667085);font-size:20px;padding:0}@media(max-width:520px){#wa-install-banner{top:8px;padding:9px}.wa-install-copy small{display:none}.wa-install-btn{padding:9px 10px}}html[data-theme="dark"] .wa-install-btn{background:#fff;color:#080a0f;border-color:#fff}html[data-theme="dark"] .wa-install-icon{background:#fff;color:#080a0f}';
  document.head.appendChild(style);document.body.appendChild(box);
  const btn=box.querySelector('.wa-install-btn');
  const hide=()=>{if(dismissed)return;dismissed=true;box.classList.add('wa-install-hide');setTimeout(()=>{box.remove();style.remove()},320)};
  box.querySelector('.wa-install-close').addEventListener('click',hide);
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;btn.disabled=false},{once:true});
  btn.addEventListener('click',async()=>{if(!deferred)return;const p=deferred;deferred=null;btn.disabled=true;try{await p.prompt();}catch(e){}hide()});
  window.addEventListener('appinstalled',hide,{once:true});
}
function homeSearch(){
  const input=document.getElementById('tool-search'),box=document.getElementById('tool-search-results');
  if(!input||!box||input.dataset.waHomeSearch==='1')return;
  input.dataset.waHomeSearch='1';
  const aliases={sip:'systematic investment plan monthly investment mutual fund',emi:'mortgage home loan monthly payment',fd:'fixed deposit banking deposit',rd:'recurring deposit banking monthly deposit',roi:'return investment profit',cagr:'compound annual growth',tax:'income tax planner',salary:'hourly wage income',loan:'mortgage personal car debt',retirement:'pension financial independence',inflation:'purchasing power prices',lumpsum:'lump sum investment',networth:'assets liabilities wealth'};
  const norm=x=>String(x||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const render=()=>{
    const query=norm(input.value); if(!query){box.innerHTML='';box.hidden=true;box.style.display='none';return}
    const terms=(query+' '+(aliases[query]||'')).split(/\s+/).filter(Boolean);
    const cards=qsa('.home-tool-card,.cat-card,.ledger-row');
    const hits=cards.map(c=>{const text=norm((c.dataset.search||'')+' '+c.textContent);let score=text===query?200:text.includes(query)?100:0;terms.forEach(t=>{if(t.length>1&&text.includes(t))score+=3});return{c,score}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,8);
    box.innerHTML=hits.length?hits.map(({c})=>{const title=c.querySelector('b,h2')?.textContent?.trim()||c.textContent.trim().split('\n')[0];const desc=c.querySelector('p,small')?.textContent?.trim()||'';const href=c.closest('a')?.getAttribute('href')||c.getAttribute('href')||'#';return '<a class="wa-search-suggestion" href="'+href+'"><span><strong>'+title+'</strong><small>'+desc+'</small></span><b>→</b></a>'}).join(''):'<div class="tool-search-empty">No exact match. Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';
    box.hidden=false;box.style.setProperty('display','block','important');box.style.zIndex='2147483647';
  };
  ['input','keyup','search'].forEach(type=>input.addEventListener(type,render,false));
  input.addEventListener('focus',render,false); input.addEventListener('keydown',e=>{if(e.key==='Escape'){box.hidden=true;box.style.display='none'}});
  document.addEventListener('click',e=>{if(!input.contains(e.target)&&!box.contains(e.target)){box.hidden=true;box.style.display='none'}});
  render();
}
function start(){installBanner();homeSearch();setTimeout(homeSearch,250);setTimeout(homeSearch,900)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
