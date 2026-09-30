/* Country layer registry. Rules are metadata-first and versioned; universal arithmetic stays in financial-engine.js. */
(function(root){'use strict';
const countries=Object.freeze({
 IN:{name:'India',currency:'INR',locale:'en-IN',status:'metadata',ruleVersion:'0.1',effectiveFrom:null,sources:[]},
 US:{name:'United States',currency:'USD',locale:'en-US',status:'metadata',ruleVersion:'0.1',effectiveFrom:null,sources:[]},
 GB:{name:'United Kingdom',currency:'GBP',locale:'en-GB',status:'metadata',ruleVersion:'0.1',effectiveFrom:null,sources:[]},
 AE:{name:'United Arab Emirates',currency:'AED',locale:'en-AE',status:'metadata',ruleVersion:'0.1',effectiveFrom:null,sources:[]},
 CA:{name:'Canada',currency:'CAD',locale:'en-CA',status:'metadata',ruleVersion:'0.1',effectiveFrom:null,sources:[]},
 AU:{name:'Australia',currency:'AUD',locale:'en-AU',status:'metadata',ruleVersion:'0.1',effectiveFrom:null,sources:[]},
 SG:{name:'Singapore',currency:'SGD',locale:'en-SG',status:'metadata',ruleVersion:'0.1',effectiveFrom:null,sources:[]}
});
function get(code){return countries[String(code||'').toUpperCase()]||null}
root.WA_COUNTRY_MODULES=Object.freeze({countries,get});
if(typeof module!=='undefined'&&module.exports)module.exports={countries,get};
})(typeof window!=='undefined'?window:globalThis);