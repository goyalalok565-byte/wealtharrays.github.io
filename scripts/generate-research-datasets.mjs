import fs from 'node:fs';
import path from 'node:path';
import Engine from '../financial-engine.js';
import Adapters from '../decision-adapters.js';
const out=path.join(process.cwd(),'research','data'); fs.mkdirSync(out,{recursive:true});
const write=(name,payload)=>fs.writeFileSync(path.join(out,name),JSON.stringify(payload,null,2)+'\n','utf8');
const sipRows=[]; for(const timing of ['beginning','end']) for(const years of [5,10,20]) { const futureValue=Engine.futureValueSeries(1000,10,years,timing); sipRows.push({timing,monthly:1000,annualRate:10,years,futureValue:Number(futureValue.toFixed(8)),totalContributions:1000*years*12}); }
write('sip-contribution-timing-study.json',{schema_version:'1.0',study_id:'sip-contribution-timing',model_id:'sip',model_version:'1.0',title:'SIP contribution timing mechanics',method:'Deterministic monthly compounding with identical contribution, rate and horizon; only contribution timing changes.',assumptions:{monthlyContribution:1000,annualRate:10,compounding:'monthly'},rows:sipRows,limitations:['Mathematical timing study, not an investment-return forecast.']});
const inflationRows=[1,5,10,20,30].map(years=>({years,presentAmount:100000,futureCost:Number((100000*Math.pow(1.06,years)).toFixed(8)),futurePurchasingPower:Number((100000/Math.pow(1.06,years)).toFixed(8))}));
write('inflation-purchasing-power-study.json',{schema_version:'1.0',study_id:'inflation-purchasing-power',model_id:'inflation',model_version:'1.0',title:'Inflation and future purchasing power',method:'Constant annual inflation applied to a fixed present amount.',assumptions:{presentAmount:100000,annualInflation:6},rows:inflationRows,limitations:['Constant inflation is a simplifying assumption.']});
const emiRows=[5,10,15,20,25].map(years=>{const r=Adapters.adapters.mortgage({principal:1000000,rate:9,years});return {years,principal:r.principal,monthlyPayment:Number(r.payment.toFixed(8)),totalPaid:Number(r.total.toFixed(8)),interest:Number(r.interest.toFixed(8))};});
write('emi-term-cost-study.json',{schema_version:'1.0',study_id:'emi-term-cost',model_id:'mortgage',model_version:'1.0',title:'Loan term versus total borrowing cost',method:'Standard fixed-rate monthly amortization with identical principal and rate.',assumptions:{principal:1000000,annualRate:9,currency:'INR'},rows:emiRows,limitations:['Excludes taxes, fees, insurance and lender-specific charges.']});
const cagrRows=[
  {path:'steady',start:100,end:121,years:2,cagr:Number((Math.pow(121/100,1/2)-1).toFixed(8))},
  {path:'volatile',start:100,end:121,years:2,cagr:Number((Math.pow(121/100,1/2)-1).toFixed(8))}
];
write('cagr-endpoint-study.json',{schema_version:'1.0',study_id:'cagr-endpoint-limitation',model_id:'cagr',model_version:'1.0',title:'Why CAGR can hide the path',method:'Two deterministic investment paths share the same start, end and horizon; CAGR is identical because it uses endpoints only.',assumptions:{start:100,end:121,years:2},rows:cagrRows,limitations:['CAGR does not describe interim volatility, drawdowns or cash-flow timing.']});
const realRows=[];
for(const nominal of [4,6,8,10]) for(const inflation of [2,4,6,8]) realRows.push({nominalRate:nominal,inflationRate:inflation,realRate:Number(Engine.realReturn(nominal,inflation).toFixed(8))});
write('real-return-rate-study.json',{schema_version:'1.0',study_id:'real-return-rate',model_id:'inflation',model_version:'1.0',title:'Nominal return versus real return',method:'Fisher-style exact real return from explicit nominal return and inflation assumptions.',assumptions:{nominalRates:[4,6,8,10],inflationRates:[2,4,6,8]},rows:realRows,limitations:['Real return is a mathematical relationship and does not predict future market returns.']});
write('README.json',{schema_version:'1.0',generated_by:'scripts/generate-research-datasets.mjs',reproducibility:'Run the generator after the canonical engine is built.',studies:['sip-contribution-timing-study.json','inflation-purchasing-power-study.json','emi-term-cost-study.json','cagr-endpoint-study.json','real-return-rate-study.json']});
console.log('Research datasets generated.');