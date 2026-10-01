/* Wealth Arrays privacy-first analytics. Never send raw financial input values. */
(function(root){'use strict';
const KEY='wa_analytics_consent';
const ALLOWED=new Set(['calculator_open','calculator_calculate','calculator_error','pdf_export','embed_copy','scenario_run','goal_run','workspace_save','workspace_load','workspace_delete','research_open','report_export','language_change','currency_change','theme_change']);
function consent(){try{return localStorage.getItem(KEY)==='granted'}catch(e){return false}}
function sanitize(meta){
  const out={};
  Object.keys(meta||{}).forEach(k=>{
    if(/amount|income|salary|balance|principal|payment|rate|return|inflation|tax|debt|expense|contribution|asset|property|investment|currencyValue|input/i.test(k))return;
    const v=meta[k];
    if(['string','number','boolean'].includes(typeof v))out[k]=v;
  });
  return out;
}
function event(name,meta){
  const safe=String(name||'').replace(/[^a-z0-9_]/gi,'_').toLowerCase();
  if(!ALLOWED.has(safe)||!consent()||!root.dataLayer)return;
  root.dataLayer.push({event:'wa_'+safe,wa_meta:sanitize(meta)});
}
root.WA_ANALYTICS=Object.freeze({consent,event,allowedEvents:Object.freeze([...ALLOWED])});
})(window);
