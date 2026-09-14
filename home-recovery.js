/* Wealth Arrays homepage recovery — analytics consent only. */
(function(){'use strict';
function consent(){
  if(document.getElementById('wa-consent')) return;
  let saved=null; try{saved=localStorage.getItem('waAnalyticsConsent')}catch(e){}
  if(saved) return;
  const box=document.createElement('div'); box.id='wa-consent'; box.setAttribute('role','dialog'); box.setAttribute('aria-label','Privacy choices');
  box.innerHTML='<div class="wa-consent-copy"><strong>Privacy choices</strong><p>We use analytics to understand which pages and tools are useful. Calculator numbers stay in your browser.</p></div><div class="wa-consent-actions"><button type="button" data-choice="denied">Reject</button><button type="button" data-choice="granted">Accept</button></div>';
  const style=document.createElement('style');
  style.textContent='#wa-consent{position:fixed;z-index:99999;left:max(14px,env(safe-area-inset-left));right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));margin:auto;max-width:760px;padding:16px 18px;border:1px solid var(--line,#e2e6ed);border-radius:18px;background:var(--surface,#fff);color:var(--text,#10141b);box-shadow:0 18px 55px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:space-between;gap:18px;font:500 14px/1.45 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}#wa-consent strong{font-size:15px}#wa-consent p{margin:4px 0 0;color:var(--muted,#667085);font-size:12px}.wa-consent-actions{display:flex;gap:8px;flex:none}.wa-consent-actions button{min-width:92px;border:1px solid var(--text,#10141b);border-radius:10px;padding:10px 15px;background:var(--text,#10141b);color:var(--bg,#fff);font:750 12px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer}.wa-consent-actions button[data-choice="denied"]{background:transparent;color:var(--text,#10141b)}html[data-theme="dark"] #wa-consent{box-shadow:0 18px 55px rgba(0,0,0,.45)}html[data-theme="dark"] .wa-consent-actions button{background:#fff;color:#080a0f;border-color:#fff}html[data-theme="dark"] .wa-consent-actions button[data-choice="denied"]{background:transparent;color:#fff}@media(max-width:620px){#wa-consent{display:block}.wa-consent-actions{margin-top:12px}.wa-consent-actions button{flex:1}}';
  document.head.appendChild(style); document.body.appendChild(box);
  box.querySelectorAll('[data-choice]').forEach(btn=>btn.onclick=function(){try{localStorage.setItem('waAnalyticsConsent',this.dataset.choice)}catch(e){} if(typeof window.gtag==='function')window.gtag('consent','update',{analytics_storage:this.dataset.choice==='granted'?'granted':'denied'}); box.remove(); style.remove()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',consent,{once:true});else consent();
})();
