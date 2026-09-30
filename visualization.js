/* Shared deterministic visualization helpers. Values are supplied by the same engine results used in tables. */
(function(root){'use strict';
function bars(items,max){max=max||Math.max(...items.map(x=>Number(x.value)||0),1);return items.map(x=>'<div><span>'+String(x.label)+'</span><i style="width:'+Math.max(0,Math.min(100,(Number(x.value)||0)/max*100))+'%"></i><b>'+String(x.display??x.value)+'</b></div>').join('')}
root.WA_VISUALIZATION=Object.freeze({bars});
})(window);