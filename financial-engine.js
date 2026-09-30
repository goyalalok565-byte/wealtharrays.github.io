/* Wealth Arrays deterministic scenario engine. */
(function(root){
'use strict';
function num(x){return Number(x)||0;}
function months(y){return Math.max(1,Math.round(num(y)*12));}
function monthlyRate(r){return num(r)/100/12;}
function futureValueSeries(monthly,rate,years,timing){const n=months(years),r=monthlyRate(rate);let balance=0,c=num(monthly),beginning=timing==='beginning';for(let m=1;m<=n;m++){if(beginning)balance+=c;balance*=1+r;if(!beginning)balance+=c;}return balance;}
function futureValue(start,monthly,rate,years,step){
 const n=months(years), r=monthlyRate(rate); let balance=num(start), c=num(monthly);
 for(let m=1;m<=n;m++){ if(m>1&&(m-1)%12===0)c*=1+num(step)/100; balance*=1+r; balance+=c; }
 return balance;
}
function contributions(monthly,years,step){const n=months(years);let c=num(monthly),t=0;for(let m=1;m<=n;m++){if(m>1&&(m-1)%12===0)c*=1+num(step)/100;t+=c;}return t;}
function inflationAdjusted(amount,inflation,years){return num(amount)/Math.pow(1+num(inflation)/100,num(years));}
function realReturn(rate,inflation){return ((1+num(rate)/100)/(1+num(inflation)/100)-1)*100;}
function project(x){const total=futureValue(x.startingAmount,x.monthlyContribution,x.annualReturn,x.years,x.annualStepUp);const paid=num(x.startingAmount)+contributions(x.monthlyContribution,x.years,x.annualStepUp);return {futureValue:total,totalContributions:paid,growth:total-paid,todayValue:total/Math.pow(1+num(x.inflation)/100,num(x.years)),realReturn:realReturn(x.annualReturn,x.inflation)};}
function scenarios(x){return [{id:'conservative',label:'Conservative',inputs:Object.assign({},x,{annualReturn:num(x.annualReturn)-2,inflation:num(x.inflation)+1})},{id:'base',label:'Base',inputs:Object.assign({},x)},{id:'higher',label:'Higher-return',inputs:Object.assign({},x,{annualReturn:num(x.annualReturn)+2,inflation:Math.max(-99,num(x.inflation)-1)})}].map(s=>Object.assign(s,{result:project(s.inputs)}));}
function sensitivity(x,rates){return rates.map(r=>({rate:r,result:project(Object.assign({},x,{annualReturn:r}))}));}
function projectWithPause(x,pauseStartMonths,pauseMonths){const n=months(x.years),r=monthlyRate(x.annualReturn);let balance=num(x.startingAmount),c=num(x.monthlyContribution),paid=num(x.startingAmount);for(let m=1;m<=n;m++){if(m>1&&(m-1)%12===0)c*=1+num(x.annualStepUp)/100;balance*=1+r;if(m<=n&&!(m>pauseStartMonths&&m<=pauseStartMonths+pauseMonths)){balance+=c;paid+=c;}}return {futureValue:balance,totalContributions:paid,growth:balance-paid,todayValue:inflationAdjusted(balance,x.inflation,x.years),realReturn:realReturn(x.annualReturn,x.inflation)};}
function stressTests(x){const base=Object.assign({},x),pause=Math.min(12,Math.max(1,months(base.years)-1)),start=Math.max(1,Math.floor(months(base.years)/2));return [{id:'lower-return',label:'Return -3%',result:project(Object.assign({},base,{annualReturn:num(base.annualReturn)-3}))},{id:'higher-inflation',label:'Inflation +2%',result:project(Object.assign({},base,{inflation:num(base.inflation)+2}))},{id:'contribution-break',label:'12-month contribution break',result:projectWithPause(base,start,pause)},{id:'earlier-goal',label:'Goal 2 years earlier',result:project(Object.assign({},base,{years:Math.max(.25,num(base.years)-2)}))}];}
function requiredMonthlyContribution(target,start,rate,years,step){let low=0,high=Math.max(1,num(target));for(let i=0;i<80;i++){const mid=(low+high)/2;if(futureValue(start,mid,rate,years,step)>=num(target))high=mid;else low=mid;}return high;}
const api={futureValue,futureValueSeries,contributions,inflationAdjusted,realReturn,project,projectWithPause,scenarios,sensitivity,stressTests,requiredMonthlyContribution};root.WA_FINANCIAL_ENGINE=Object.freeze(api);if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
