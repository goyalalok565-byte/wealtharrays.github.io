/* Synchronous theme bootstrap only; non-critical site enhancements run after load. */
(function(){
  try{
    var theme=localStorage.getItem('waTheme');
    if(theme==='dark'||theme==='light')document.documentElement.dataset.theme=theme;
  }catch(_error){}
  function loadProductionHotfix(){
    if(document.querySelector('script[data-wa-production-hotfix]'))return;
    var script=document.createElement('script');
    script.src='/production-hotfix.js?v=20260918';
    script.async=true;
    script.dataset.waProductionHotfix='1';
    document.head.appendChild(script);
  }
  function scheduleHotfix(){
    if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(loadProductionHotfix,{timeout:2500});
    else window.setTimeout(loadProductionHotfix,3500);
  }
  if(document.readyState==='complete')scheduleHotfix();
  else window.addEventListener('load',scheduleHotfix,{once:true});
})();