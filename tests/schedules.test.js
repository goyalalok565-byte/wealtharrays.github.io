const test=require('node:test');
const assert=require('node:assert/strict');
const {calculator}=require('./helpers');
const schedules=require('../calculator-schedules.js');
const examples={
 swp:{corpus:5000000,withdrawal:30000,rate:8,years:20,stepUp:5},
 fire:{annualExpenses:600000,currentSavings:500000,monthlySavings:40000,stepUp:5,returnRate:10,inflation:6,withdrawalRate:3.5},
 ssy:{yearlyDeposit:100000,depositYears:15,rate:8.2},
 'cost-of-delay':{monthly:10000,rate:12,years:25,delay:5},
 'rent-vs-buy':{price:8000000,downPct:20,loanRate:8.75,loanYears:20,appreciation:5,rent:25000,rentGrowth:5,investReturn:10,maintPct:1,buyCostPct:6,horizon:10}
};
for(const [id,input] of Object.entries(examples))test(`${id} has finite year-by-year schedule rows`,()=>{const c=calculator(id);assert.ok(c);assert.equal(typeof schedules[id],'function');const rows=schedules[id](input);assert.ok(rows.length>0);assert.ok(rows.every(row=>Object.values(row).every(value=>typeof value!=='number'||Number.isFinite(value))));assert.equal(rows[0].period.startsWith('Year '),true);});
