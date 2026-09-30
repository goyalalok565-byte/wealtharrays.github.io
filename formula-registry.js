/* Wealth Arrays Formula Registry v1 — metadata only; calculation remains in the deterministic engine. */
(function(root){'use strict';
const registry=Object.freeze({
 sip:{version:'1.0',timing:'monthly contributions at beginning of period',formula:'FV of monthly series',engine:'futureValueSeries'},
 compound:{version:'1.0',timing:'periodic compounding',formula:'P(1+r/n)^(nt)',engine:'compound adapter'},
 inflation:{version:'1.0',timing:'annual inflation compounding',formula:'FV=PV(1+i)^t',engine:'inflation adapter'},
 retirement:{version:'1.0',timing:'planning corpus ratio model',formula:'annual expenses / withdrawal rate',engine:'retirement adapter'}
});
root.WA_FORMULA_REGISTRY=registry;
if(typeof module!=='undefined'&&module.exports)module.exports=registry;
})(typeof window!=='undefined'?window:globalThis);