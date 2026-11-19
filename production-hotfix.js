/* Small page bootstrap for features that are not part of the core calculator path. */
(function(){
  'use strict';
  if(window.__WA_PRODUCTION_HOTFIX__)return;
  window.__WA_PRODUCTION_HOTFIX__=true;
  var path=location.pathname;
  var isTools=path==='/tools'||path==='/tools/'||path.endsWith('/tools.html');
  if(isTools&&!document.querySelector('script[data-wa-hotfix="calculator-search"]')){
    var script=document.createElement('script');
    script.src='/calculator-search.js?v=20261119';
    script.dataset.waHotfix='calculator-search';
    script.defer=true;
    document.head.appendChild(script);
  }
})();
