/* Tiny synchronous theme + ad-request bootstrap. Kept external so CSP does not need inline-script exceptions. */
(function(){
  try{var t=localStorage.getItem('waTheme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t;}catch(e){}
  try{var a=window.adsbygoogle=window.adsbygoogle||[];a.pauseAdRequests=1;var resume=function(){a.pauseAdRequests=0;window.removeEventListener('pointerdown',resume);window.removeEventListener('keydown',resume);window.removeEventListener('scroll',resume);};window.addEventListener('pointerdown',resume,{once:true,passive:true});window.addEventListener('keydown',resume,{once:true,passive:true});window.addEventListener('scroll',resume,{once:true,passive:true});window.setTimeout(resume,6000);}catch(e){}
  try{
    var hotfixLoaded=false;
    var loadHotfix=function(){
      if(hotfixLoaded)return;
      hotfixLoaded=true;
      if(document.querySelector('script[data-wa-production-hotfix]'))return;
      var s=document.createElement('script');
      s.src='/production-hotfix.js?v=20260918';
      s.async=true;
      s.dataset.waProductionHotfix='1';
      document.head.appendChild(s);
      window.removeEventListener('pointerdown',loadHotfix);
      window.removeEventListener('keydown',loadHotfix);
      window.removeEventListener('focusin',loadHotfix);
    };
    window.addEventListener('pointerdown',loadHotfix,{once:true,passive:true});
    window.addEventListener('keydown',loadHotfix,{once:true});
    window.addEventListener('focusin',loadHotfix,{once:true});
    window.setTimeout(loadHotfix,5000);
  }catch(e){}
})();
