const fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{},console};vm.createContext(ctx);
for(const f of ['financial-engine.js','decision-adapters.js','formula-registry.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
const A=ctx.window.WA_DECISION_ADAPTERS,R=ctx.window.WA_DECISION_REGISTRY,F=ctx.window.WA_FORMULA_REGISTRY,E=ctx.window.WA_FINANCIAL_ENGINE;
const ids=['sip','compound','inflation','freedom-milestone','cagr','roi','lumpsum','fixed-deposit','recurring-deposit','simple-interest','car-loan','mortgage','personal-loan','debt-payoff','net-worth','salary-hourly','overtime','freelance-rate','profit-margin','income-tax-planner'];
for(const id of ids){if(!A[id]||!R[id]||!F[id])throw new Error('Missing certified model '+id)}
const close=(a,b,e=1e-8)=>Math.abs(a-b)<=Math.max(e,Math.abs(b)*1e-8);
const cases={
 sip:[{monthly:1000,rate:10,years:10,inflation:6},x=>E.futureValueSeries(1000,10,10,'beginning')],
 compound:[{principal:5000,rate:6,years:10,freq:12,inflation:6},x=>5000*Math.pow(1+.06/12,120)],
 inflation:[{amount:100000,rate:6,years:20},x=>100000*Math.pow(1.06,20)],
 'freedom-milestone':[{expenses:30000,withdrawal:4,current:20000},x=>750000],
 cagr:[{start:10000,end:20000,years:5},x=>(2**(.2)-1)*100],
 roi:[{cost:10000,finalValue:14500,years:3},x=>45],
 lumpsum:[{principal:10000,rate:8,years:5,inflation:6},x=>10000*1.08**5],
 'fixed-deposit':[{principal:10000,rate:8,years:5,inflation:6,freq:4},x=>10000*(1+.08/4)**20],
 'recurring-deposit':[{monthly:1000,rate:7,years:5,inflation:6},x=>1000*((1+7/1200)**60-1)/(7/1200)],
 'simple-interest':[{principal:5000,rate:8,years:2},x=>800],
 'car-loan':[{price:30000,down:5000,rate:6,years:5},x=>A['car-loan']({price:30000,down:5000,rate:6,years:5}).payment],
 mortgage:[{principal:250000,rate:6.5,years:25},x=>A.mortgage({principal:250000,rate:6.5,years:25}).payment],
 'personal-loan':[{principal:10000,rate:10,years:3},x=>A['personal-loan']({principal:10000,rate:10,years:3}).payment],
 'debt-payoff':[{balance:10000,rate:10,payment:400},x=>A['debt-payoff']({balance:10000,rate:10,payment:400}).months],
 'net-worth':[{cash:10000,investments:20000,property:100000,debt:50000},x=>80000],
 'salary-hourly':[{direction:'toHourly',amount:60000,hoursPerWeek:40,weeksPerYear:48},x=>31.25],
 overtime:[{hourly:20,regular:160,overtime:20,multiplier:1.5},x=>3800],
 'freelance-rate':[{income:60000,expenses:12000,hours:20,weeks:48},x=>72],
 'profit-margin':[{revenue:50000,cogs:28000,expenses:9000},x=>44],
 'income-tax-planner':[{income:100000,deductions:10000,rate:20},x=>18000]
};
for(const [id,[input,expected]] of Object.entries(cases)){const out=A[id](input), keys=Object.keys(out);if(!keys.length)throw new Error('No output '+id);const val=id==='compound'?out.futureValue:id==='sip'?out.futureValue:id==='inflation'?out.futureAmount:id==='freedom-milestone'?out.targetCorpus:id==='cagr'?out.cagr:id==='roi'?out.roi:id==='lumpsum'?out.futureValue:id==='fixed-deposit'?out.maturity:id==='recurring-deposit'?out.maturity:id==='simple-interest'?out.interest:id==='car-loan'?out.payment:id==='mortgage'?out.payment:id==='personal-loan'?out.payment:id==='debt-payoff'?out.months:id==='net-worth'?out.netWorth:id==='salary-hourly'?out.hourly:id==='overtime'?out.total:id==='freelance-rate'?out.hourlyRate:id==='profit-margin'?out.netMargin:out.tax;if(!close(val,expected(input)))throw new Error('Golden vector failed '+id+': '+val+' vs '+expected(input))}
const paused=E.projectWithPause({startingAmount:0,monthlyContribution:1000,annualStepUp:0,annualReturn:0,inflation:0,years:10},60,12);if(paused.totalContributions!==108000)throw new Error('Pause vector failed');
console.log('Certified model golden vectors PASS: '+ids.length+' models; stress pause PASS.');
