/* India personal income-tax module — AY 2026-27, new regime only.
   Source: Income Tax Department official AY 2026-27 guidance.
   This is a planning model, not tax filing software. */
(function(root){'use strict';
const meta=Object.freeze({country:'IN',jurisdiction:'India',assessmentYear:'2026-27',regime:'new',effectiveFrom:'2025-04-01',source:'https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1',verifiedOn:'2026-09-30'});
const slabs=Object.freeze([{upto:400000,rate:0},{upto:800000,rate:5},{upto:1200000,rate:10},{upto:1600000,rate:15},{upto:2000000,rate:20},{upto:2400000,rate:25},{upto:Infinity,rate:30}]);
function baseTax(income){let left=Math.max(Number(income)||0,0),prev=0,tax=0;for(const s of slabs){const band=Math.max(0,Math.min(left,s.upto-prev));tax+=band*s.rate/100;left-=band;prev=s.upto;if(left<=0)break}return tax}
function surchargeRate(income){income=Number(income)||0;return income>20000000?.25:income>10000000?.15:income>5000000?.10:0}
function calculate(v){const taxable=Math.max(Number(v.taxableIncome)||0,0),before=baseTax(taxable),rebate=taxable<=1200000?Math.min(before,60000):0,after=Math.max(before-rebate,0),sr=surchargeRate(taxable),surcharge=after*sr,cess=(after+surcharge)*.04,total=after+surcharge+cess;return Object.freeze({taxableIncome:taxable,baseTax:before,rebate87A:rebate,taxAfterRebate:after,surchargeRate:sr*100,surcharge,cess,totalTax:total,regime:'new',assessmentYear:'2026-27',source:meta.source})}
root.WA_COUNTRY_TAX_IN={meta,slabs,calculate};if(typeof module!=='undefined'&&module.exports)module.exports={meta,slabs,calculate};
})(typeof window!=='undefined'?window:globalThis);