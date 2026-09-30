/* Wealth Arrays Decision Adapters v1. These wrap the new engine without replacing legacy calculators. */
(function(root){
'use strict';
var E=root.WA_FINANCIAL_ENGINE;
if(!E)return;
function sip(v){
 var monthly=Number(v.monthly)||0,rate=Number(v.rate)||0,years=Number(v.years)||0,inflation=Number(v.inflation)||0;
 var fv=E.futureValueSeries(monthly,rate,years,'beginning'),invested=monthly*Math.round(years*12);
 return {futureValue:fv,invested:invested,growth:fv-invested,todayValue:E.inflationAdjusted(fv,inflation,years)};
}
function compound(v){
 var principal=Math.max(Number(v.principal)||0,0),rate=Number(v.rate)||0,years=Math.max(Number(v.years)||0,0),freq=Math.max(1,Number(v.freq)||1),inflation=Number(v.inflation)||0;
 var amount=principal*Math.pow(1+rate/100/freq,freq*years);
 return {principal:principal,interest:amount-principal,futureValue:amount,todayValue:E.inflationAdjusted(amount,inflation,years)};
}
function inflation(v){
 var amount=Math.max(Number(v.amount)||0,0),rate=Math.max(Number(v.rate)||0,0),years=Math.max(Number(v.years)||0,0);
 var factor=Math.pow(1+rate/100,years),futureAmount=amount*factor;
 return {futureAmount:futureAmount,priceIncrease:futureAmount-amount,purchasingPower:amount/factor};
}
function retirement(v){
 var expenses=Math.max(Number(v.expenses)||0,0),withdrawal=Math.max(Number(v.withdrawal)||0,0),current=Math.max(Number(v.current)||0,0);
 var target=withdrawal>0?expenses/(withdrawal/100):0,remaining=Math.max(target-current,0),progress=target>0?Math.min(current/target*100,100):0;
 return {targetCorpus:target,remaining:remaining,progress:progress};
}
root.WA_DECISION_ADAPTERS=Object.freeze({sip:sip,compound:compound,inflation:inflation,retirement:retirement});
})(window);
