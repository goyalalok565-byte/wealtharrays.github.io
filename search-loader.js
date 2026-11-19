/* Lazy-load the page's search catalog only when its search field receives focus. */
(function(){
  'use strict';
  var input=document.getElementById('tool-search');
  if(!input)return;
  var path=location.pathname;
  var toolsPage=path==='/tools'||path==='/tools/'||path.endsWith('/tools.html');
  var source=toolsPage?'/calculator-search.js':'/homepage-search.js';
  var loading=false,loaded=false;
  window.__WA_SEARCH_LAZY__=true;
  function load(){
    if(loading||loaded)return;
    loading=true;
    var script=document.createElement('script');
    script.src=source;
    script.async=true;
    script.onload=function(){loaded=true;loading=false;};
    script.onerror=function(){loading=false;script.remove();};
    document.head.appendChild(script);
  }
  input.addEventListener('focus',load);
  input.addEventListener('pointerdown',load,{passive:true});
})();
