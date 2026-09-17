/* Tiny synchronous theme + ad-request bootstrap. Kept external so CSP does not need inline-script exceptions. */
(function(){
  try{var t=localStorage.getItem('waTheme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t;}catch(e){}
  try{var a=window.adsbygoogle=window.adsbygoogle||[];a.pauseAdRequests=1;var resume=function(){a.pauseAdRequests=0;window.removeEventListener('pointerdown',resume);window.removeEventListener('keydown',resume);window.removeEventListener('scroll',resume);};window.addEventListener('pointerdown',resume,{once:true,passive:true});window.addEventListener('keydown',resume,{once:true,passive:true});window.addEventListener('scroll',resume,{once:true,passive:true});window.setTimeout(resume,6000);}catch(e){}
  try{var s=document.createElement('script');s.src='/production-hotfix.js?v=20260918';s.defer=true;s.dataset.waProductionHotfix='1';document.head.appendChild(s);}catch(e){}
})();
