/* Shared deterministic visualization helpers. Values are supplied by the same engine results used in tables. */
(function(root){'use strict';
function esc(value){return String(value??'').replace(/[&<>"']/g,function(c){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
function bars(items,max){items=Array.isArray(items)?items:[];max=max||Math.max(...items.map(x=>Number(x.value)||0),1);return items.map(function(x){var value=Number(x.value)||0;return '<div><span>'+esc(x.label)+'</span><i style="width:'+Math.max(0,Math.min(100,value/max*100))+'%"></i><b>'+esc(x.display??value)+'</b></div>'}).join('')}
root.WA_VISUALIZATION=Object.freeze({bars,escapeHtml:esc});
})(window);
