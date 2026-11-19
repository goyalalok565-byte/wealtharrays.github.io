const test=require('node:test');const {values,close,safeOutputs}=require('./helpers');
function ref(v){const r=Math.max(0,Number(v.rate)||0),m=Math.max(1,Number(v.multiple)||1);if(r===0)return [0,0,0,0];const exact=Math.log(2)/Math.log(1+r/100),rule=72/r;return [rule,exact,rule-exact,Math.log(m)/Math.log(1+r/100)];}
const cases=[['default',{rate:8,multiple:3}],['zero rate',{rate:0,multiple:2}],['blank',{rate:'',multiple:''}],['maximum',{rate:100,multiple:1000}],['negative',{rate:-5,multiple:-2}]];
for(const [name,v] of cases)test(`Rule of 72 ${name}: independent logarithmic compounding`,()=>{const r=ref(v),a=values('rule-of-72',v);for(let i=0;i<4;i++)close(a[i],r[i],`metric ${i}`);safeOutputs('rule-of-72',v);});
