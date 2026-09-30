/* Browser-first reproducible report model. Rendering can later target HTML/PDF without changing calculations. */
(function(root){'use strict';
function build(model){return Object.freeze({schemaVersion:'1.0',generatedAt:new Date().toISOString(),model:model.model||'Wealth Arrays deterministic model',modelVersion:model.modelVersion||'1.0',currency:model.currency||'USD',inputs:Object.assign({},model.inputs||{}),assumptions:Object.assign({},model.assumptions||{}),scenarios:(model.scenarios||[]).map(x=>Object.assign({},x)),stressTests:(model.stressTests||[]).map(x=>Object.assign({},x)),sources:(model.sources||[]).map(x=>Object.assign({},x)),limitations:model.limitations||['Educational estimate only; actual outcomes may differ.']})}
function fingerprint(report){const stable=Object.assign({},report);delete stable.generatedAt;let s=JSON.stringify(stable),h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0')}
root.WA_REPORT_ENGINE=Object.freeze({build,fingerprint});
if(typeof module!=='undefined'&&module.exports)module.exports={build,fingerprint};
})(typeof window!=='undefined'?window:globalThis);