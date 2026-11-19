const test=require('node:test');const {values,close,safeOutputs}=require('./helpers');
function factor(i,n){return n<=0?0:i===0?n:((Math.pow(1+i,n)-1)/i)*(1+i)}
function ref(v){const p=Math.max(0,Number(v.monthly)||0),n=Math.max(0,Math.round((Number(v.years)||0)*12)),d=Math.min(n,Math.max(0,Math.round((Number(v.delay)||0)*12))),i=Math.max(0,Number(v.rate)||0)/1200;const now=p*factor(i,n),later=p*factor(i,n-d),f=factor(i,n-d);return [now,later,now-later,f>0?now/f:0];}
const cases=[['default',{monthly:10000,rate:12,years:25,delay:5}],['zero rate',{monthly:1000,rate:0,years:10,delay:2}],['blank',{monthly:'',rate:'',years:'',delay:''}],['maximum',{monthly:1000000000,rate:50,years:60,delay:59}],['negative',{monthly:-1,rate:-1,years:-1,delay:-1}]];
for(const [name,v] of cases)test(`Cost of Delay ${name}: independent annuity-due reference`,()=>{const r=ref(v),a=values('cost-of-delay',v);for(let i=0;i<4;i++)close(a[i],r[i],`metric ${i}`);safeOutputs('cost-of-delay',v);});
