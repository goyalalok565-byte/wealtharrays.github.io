import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { CALCULATORS } = require('../calculators.js');

const EPS = 1e-8;
const REVIEW_DATE = '2026-09-15';
const expectedIds = [
  'sip','compound-interest','mortgage','roi','simple-interest','freedom-milestone','salary-hourly','profit-margin',
  'fixed-deposit','recurring-deposit','lumpsum','cagr','car-loan','personal-loan','debt-payoff','inflation','net-worth',
  'overtime','freelance-rate','income-tax-planner','home-loan-emi','currency-converter','flat-cost','loan-emi','capital-gain','lumpsum-sip','loan-against-property','home-loan-eligibility','silver-jewelry','advanced-home-loan-eligibility','consumer-durable-loan','gold-jewelry','loan-prepayment-vs-sip','ltv','stamp-duty','property-calculator','loan-interest'
];

function approx(a,b,tol=Math.max(EPS,Math.abs(b)*1e-9)) {
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a-b) <= tol;
}
function out(calc, values) {
  const rows = calc.compute({...values});
  if (!Array.isArray(rows) || !rows.length) throw new Error('empty result');
  for (const r of rows) {
    if (!r || typeof r.label !== 'string' || !Number.isFinite(Number(r.value))) {
      throw new Error(`non-finite/invalid output: ${JSON.stringify(r)}`);
    }
  }
  return Object.fromEntries(rows.map(r => [r.label, Number(r.value)]));
}
function assertValue(actual, expected, label) {
  if (!approx(actual, expected)) throw new Error(`${label}: got ${actual}, expected ${expected}`);
}
function reference(id,v) {
  switch (id) {
    case 'sip': {
      const i=v.rate/100/12,n=v.years*12,P=v.monthly;
      const fv=i===0?P*n:P*((Math.pow(1+i,n)-1)/i)*(1+i);
      const invested=P*n;
      return {'You put in':invested,'Your growth / profit':fv-invested,'You could have in the future':fv,"What that future money is worth in today's money":fv/Math.pow(1+v.inflation/100,v.years)};
    }
    case 'compound-interest': {
      const A=v.principal*Math.pow(1+v.rate/100/Number(v.freq),Number(v.freq)*v.years);
      return {'Principal':v.principal,'Interest earned':A-v.principal,'Final amount (future money)':A,"Value in today's purchasing power":A/Math.pow(1+v.inflation/100,v.years)};
    }
    case 'mortgage': {
      const P=v.principal,r=v.rate/100/12,n=v.years*12;
      const emi=P===0?0:n<=0?0:r===0?P/n:(P*r*Math.pow(1+r,n))/(Math.pow(1+r,n)-1),total=emi*n;
      return {'Monthly payment':emi,'Total repayment':total,'Total interest':total-P};
    }
    case 'roi': {
      const gain=v.finalValue-v.cost,roi=v.cost===0?0:gain/v.cost*100,annualized=v.cost<=0||v.finalValue<0||v.years<=0?0:(Math.pow(v.finalValue/v.cost,1/v.years)-1)*100;
      return {'Net gain':gain,'Total ROI':roi,'Annualized ROI':annualized};
    }
    case 'simple-interest': { const si=v.principal*v.rate*v.years/100; return {'Interest':si,'Total amount':v.principal+si}; }
    case 'freedom-milestone': { const target=v.withdrawal>0?v.expenses/(v.withdrawal/100):0,remaining=Math.max(target-v.current,0),progress=target>0?Math.min(v.current/target*100,100):0; return {'Target corpus':target,'Still needed':remaining,'Progress':progress}; }
    case 'salary-hourly': { const h=v.hoursPerWeek*v.weeksPerYear; return v.direction==='toHourly'?{'Working hours / year':h,'Hourly rate':h===0?0:v.amount/h}:{'Working hours / year':h,'Annual salary':v.amount*h}; }
    case 'profit-margin': { const gp=v.revenue-v.cogs,np=gp-v.expenses;return {'Gross profit':gp,'Gross margin':v.revenue===0?0:gp/v.revenue*100,'Net profit':np,'Net margin':v.revenue===0?0:np/v.revenue*100}; }
    case 'fixed-deposit': { const P=Math.max(v.principal,0),r=Math.max(v.rate,0)/100,n=Math.max(1,Number(v.freq)||1),A=P*Math.pow(1+r/n,n*Math.max(v.years,0)),real=A/Math.pow(1+Math.max(v.inflation,0)/100,Math.max(v.years,0));return {'Deposit':P,'Interest earned':A-P,'Maturity value (future money)':A,"Value in today's purchasing power":real}; }
    case 'recurring-deposit': { const n=Math.max(0,Math.round(v.years*12)),i=v.rate/1200,m=Math.max(v.monthly,0),A=i===0?m*n:m*((Math.pow(1+i,n)-1)/i),real=A/Math.pow(1+v.inflation/100,v.years);return {'Monthly deposits':n,'Total deposits':m*n,'Interest earned':A-m*n,'Estimated maturity (future money)':A,"Value in today's purchasing power":real}; }
    case 'lumpsum': { const P=Math.max(v.principal,0),A=P*Math.pow(1+Math.max(v.rate,0)/100,Math.max(v.years,0)),real=A/Math.pow(1+Math.max(v.inflation,0)/100,Math.max(v.years,0));return {'Amount invested':P,'Estimated gain':A-P,'Projected value (future money)':A,"Value in today's purchasing power":real}; }
    case 'cagr': { const start=Math.max(v.start,0),end=Math.max(v.end,0),years=Math.max(v.years,0);return {'Absolute gain':end-start,'Total growth':start>0?(end/start-1)*100:0,'CAGR':start>0&&years>0?(Math.pow(end/start,1/years)-1)*100:0}; }
    case 'car-loan': { const price=Math.max(v.price,0),down=Math.min(Math.max(v.down,0),price),P=price-down,n=Math.max(1,Math.round(Math.max(v.years,0)*12)),r=Math.max(v.rate,0)/1200,emi=P===0?0:r===0?P/n:P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1),total=emi*n;return {'Loan amount':P,'Monthly payment':emi,'Total repayment':total,'Total interest':total-P,'Total cost including down payment':total+down}; }
    case 'personal-loan': { const n=Math.max(1,Math.round(Math.max(v.years,0)*12)),P=Math.max(v.principal,0),r=Math.max(v.rate,0)/1200,emi=P===0?0:r===0?P/n:P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1),total=emi*n;return {'Loan months':n,'Monthly payment':emi,'Total repayment':total,'Total interest':total-P}; }
    case 'debt-payoff': { const balance=Math.max(v.balance,0),payment=Math.max(v.payment,0),r=Math.max(v.rate,0)/1200;if(balance===0)return {'Months to payoff':0,'Estimated years':0,'Estimated interest':0};if(payment<=balance*r)return null;const exact=r===0?balance/payment:-Math.log(1-r*balance/payment)/Math.log(1+r),months=Math.max(1,Math.ceil(exact));let remaining=balance,total=0;for(let m=1;m<=months;m++){remaining*=1+r;const due=Math.min(payment,remaining);total+=due;remaining=Math.max(remaining-due,0);if(remaining<=1e-8)break;}return {'Months to payoff':months,'Estimated years':months/12,'Estimated interest':Math.max(total-balance,0)}; }
    case 'inflation': { const amount=Math.max(v.amount,0),rate=Math.max(v.rate,0),years=Math.max(v.years,0),factor=Math.pow(1+rate/100,years),future=amount*factor;return {'Future amount needed to buy the same thing':future,'Price increase':future-amount,"Today's amount worth after inflation":amount/factor}; }
    case 'net-worth': { const assets=Math.max(v.cash,0)+Math.max(v.investments,0)+Math.max(v.property,0),debt=Math.max(v.debt,0);return {'Total assets':assets,'Total liabilities':debt,'Net worth':assets-debt}; }
    case 'overtime': { const hourly=Math.max(v.hourly,0),regular=Math.max(v.regular,0),ot=Math.max(v.overtime,0),mult=Math.max(v.multiplier,1),reg=hourly*regular,over=hourly*ot*mult;return {'Regular pay':reg,'Overtime pay':over,'Total gross pay':reg+over}; }
    case 'freelance-rate': { const hours=Math.max(v.hours,0),weeks=Math.max(v.weeks,0),income=Math.max(v.income,0),expenses=Math.max(v.expenses,0),billable=hours*weeks,needed=income+expenses;return {'Annual amount to cover':needed,'Billable hours / year':billable,'Target hourly rate':billable?needed/billable:0}; }
    case 'income-tax-planner': { const income=Math.max(v.income,0),ded=Math.min(Math.max(v.deductions,0),income),taxable=income-ded,tax=taxable*Math.max(v.rate,0)/100;return {'Estimated taxable income':taxable,'Estimated tax':tax,'Effective tax on gross income':income?tax/income*100:0,'Estimated after-tax income':income-tax}; }    case 'home-loan-emi': { const P=Math.max(v.principal,0),n=Math.max(1,Math.round(v.years*12)),r=Math.max(v.rate,0)/1200,emi=P===0?0:r===0?P/n:P*r*(1+r)**n/((1+r)**n-1),total=emi*n;return {'Monthly home-loan EMI':emi,'Total repayment':total,'Total interest':total-P}; }
    case 'currency-converter': { const a=Math.max(v.amount,0),r=Math.max(v.rate,0);return {[v.from+' amount']:a,['Converted amount in '+v.to]:a*r}; }
    case 'flat-cost': { const p=Math.max(v.price,0),st=p*Math.max(v.stamp,0)/100,re=p*Math.max(v.registration,0)/100,f=Math.max(v.furnishing,0),o=Math.max(v.other,0);return {'Stamp duty':st,'Registration / transfer':re,'Other purchase costs':f+o,'Estimated all-in purchase cost':p+st+re+f+o}; }
    case 'loan-emi': { const P=Math.max(v.principal,0),n=Math.max(1,Math.round(v.years*12)),r=Math.max(v.rate,0)/1200,emi=P===0?0:r===0?P/n:P*r*(1+r)**n/((1+r)**n-1),total=emi*n;return {'Monthly EMI':emi,'Total repayment':total,'Total interest':total-P}; }
    case 'capital-gain': { const g=Math.max(v.sale-v.purchase-Math.max(v.buyCosts,0)-Math.max(v.sellCosts,0),0),t=g*Math.max(v.taxRate,0)/100;return {'Estimated capital gain':g,'Assumed tax':t,'Estimated gain after assumed tax':g-t}; }
    case 'lumpsum-sip': { const P=Math.max(v.lumpsum,0),m=Math.max(v.monthly,0),i=Math.max(v.rate,0)/1200,n=Math.max(1,Math.round(v.years*12)),l=P*(1+i)**n,s=i===0?m*n:m*((1+i)**n-1)/i*(1+i),inv=P+m*n,total=l+s;return {'Total invested':inv,'Estimated growth':total-inv,'Projected value':total}; }
    case 'loan-against-property': { const loan=Math.max(v.property,0)*Math.max(v.ltv,0)/100,n=Math.max(1,Math.round(v.years*12)),r=Math.max(v.rate,0)/1200,emi=r===0?loan/n:loan*r*(1+r)**n/((1+r)**n-1),total=emi*n;return {'Indicative loan amount':loan,'Monthly EMI':emi,'Total interest':total-loan}; }
    case 'home-loan-eligibility': { const c=Math.max(v.income,0)*Math.max(v.foir,0)/100-Math.max(v.existing,0),n=Math.max(1,Math.round(v.years*12)),r=Math.max(v.rate,0)/1200,l=c<=0?0:r===0?c*n:c*((1+r)**n-1)/(r*(1+r)**n);return {'Indicative EMI capacity':Math.max(c,0),'Indicative eligible loan':Math.max(l,0)}; }
    case 'silver-jewelry': { const m=Math.max(v.rate,0)*Math.max(v.weight,0)*Math.max(v.purity,0)/100,mc=m*Math.max(v.making,0)/100,t=(m+mc)*Math.max(v.tax,0)/100;return {'Fine-silver value':m,'Making charge':mc,'Tax / GST':t,'Estimated jewellery price':m+mc+t}; }
    case 'advanced-home-loan-eligibility': { const inc=Math.max(v.income,0)+Math.max(v.coIncome,0),c=Math.max(inc*Math.max(v.foir,0)/100-Math.max(v.existing,0),0),n=Math.max(1,Math.round(v.years*12)),r=Math.max(v.rate,0)/1200,l=r===0?c*n:c*((1+r)**n-1)/(r*(1+r)**n);return {'Combined monthly income':inc,'Indicative EMI capacity':c,'Indicative eligible loan':l}; }
    case 'consumer-durable-loan': { const p=Math.max(v.price,0),d=Math.min(Math.max(v.down,0),p),P=p-d,n=Math.max(1,Math.round(v.years*12)),r=Math.max(v.rate,0)/1200,e=P===0?0:r===0?P/n:P*r*(1+r)**n/((1+r)**n-1),fee=P*Math.max(v.fee,0)/100,total=e*n;return {'Financed amount':P,'Monthly EMI':e,'Total interest':total-P,'Estimated all-in cost':total+d+fee}; }
    case 'gold-jewelry': { const m=Math.max(v.rate,0)*Math.max(v.weight,0)*Math.max(v.purity,0)/100,w=m*Math.max(v.wastage,0)/100,mc=(m+w)*Math.max(v.making,0)/100,t=(m+w+mc)*Math.max(v.tax,0)/100;return {'Fine-gold value':m,'Wastage value':w,'Making charge':mc,'Tax / GST':t,'Estimated jewellery price':m+w+mc+t}; }
    case 'loan-prepayment-vs-sip': { const P=Math.max(v.balance,0),x=Math.min(Math.max(v.prepay,0),P),n=Math.max(1,Math.round(v.years*12)),r=Math.max(v.rate,0)/1200,e=r===0?P/n:P*r*(1+r)**n/((1+r)**n-1),base=e*n-P,np=P-x,ne=r===0?np/n:np*r*(1+r)**n/((1+r)**n-1),saved=Math.max(base-(ne*n-np),0),ri=Math.max(v.investmentReturn,0)/1200,iv=ri===0?x:x*(1+ri)**n;return {'Estimated loan interest saved':saved,'Investment value of the same cash':iv,'Loan EMI after prepayment':ne,'Difference (investment value − interest saved)':iv-saved}; }
    case 'ltv': { const p=Math.max(v.property,0),l=Math.max(v.loan,0);return {'LTV':p>0?l/p*100:0,'Equity / value not financed':Math.max(p-l,0),'Loan amount':l}; }
    case 'stamp-duty': { const p=Math.max(v.value,0),st=p*Math.max(v.stamp,0)/100,re=p*Math.max(v.registration,0)/100;return {'Stamp duty':st,'Registration / transfer':re,'Estimated total charges':st+re}; }
    case 'property-calculator': { const p=Math.max(v.price,0),d=Math.min(Math.max(v.down,0),p),P=p-d,n=Math.max(1,Math.round(v.years*12)),r=Math.max(v.rate,0)/1200,e=P===0?0:r===0?P/n:P*r*(1+r)**n/((1+r)**n-1),rep=e*n,st=p*Math.max(v.stamp,0)/100,re=p*Math.max(v.registration,0)/100,up=d+st+re+Math.max(v.other,0);return {'Loan amount':P,'Monthly EMI':e,'Cash needed upfront':up,'Total loan interest':rep-P,'Estimated total cash cost':up+rep}; }
    case 'loan-interest': { const P=Math.max(v.principal,0),n=Math.max(1,Math.round(v.years*12)),r=Math.max(v.rate,0)/1200,e=P===0?0:r===0?P/n:P*r*(1+r)**n/((1+r)**n-1),total=e*n;return {'Monthly EMI':e,'Principal repaid':P,'Total interest':total-P,'Total repayment':total}; }

    default: throw new Error(`No independent reference for ${id}`);
  }
}

function baseValues(calc) {
  const defaults = {
    sip:{monthly:200,rate:10,years:15,inflation:6}, 'compound-interest':{principal:5000,rate:6,years:10,inflation:6,freq:'12'}, mortgage:{principal:250000,rate:6.5,years:25},
    roi:{cost:10000,finalValue:14500,years:3}, 'simple-interest':{principal:5000,rate:8,years:2}, 'freedom-milestone':{expenses:30000,withdrawal:4,current:20000},
    'salary-hourly':{direction:'toHourly',amount:60000,hoursPerWeek:40,weeksPerYear:48}, 'profit-margin':{revenue:50000,cogs:28000,expenses:9000},
    'fixed-deposit':{principal:5000,rate:6,years:5,inflation:6,freq:'4'}, 'recurring-deposit':{monthly:1000,rate:7,years:5,inflation:6},
    lumpsum:{principal:10000,rate:8,years:10,inflation:6}, cagr:{start:10000,end:15000,years:5}, 'car-loan':{price:30000,down:5000,rate:7,years:5},
    'personal-loan':{principal:20000,rate:12,years:3}, 'debt-payoff':{balance:10000,rate:18,payment:400}, inflation:{amount:100000,rate:6,years:20},
    'net-worth':{cash:10000,investments:50000,property:200000,debt:80000}, overtime:{hourly:25,regular:160,overtime:20,multiplier:1.5},
    'freelance-rate':{income:80000,expenses:15000,hours:25,weeks:46}, 'income-tax-planner':{income:100000,deductions:15000,rate:22}
  };
  const v={...(defaults[calc.id]||{})};
  for(const f of calc.fields||[]) if(v[f.id]===undefined) v[f.id]=f.type==='select'?(f.options?.[0]?.value??f.default??'1'):((f.default!==undefined)?f.default:((typeof f.min==='number'&&f.min>0)?f.min:1));
  return v;
}

function stressValues(calc) {
  const v=baseValues(calc);
  for(const f of calc.fields||[]) {
    if(f.type==='select') continue;
    const min=typeof f.min==='number'?f.min:0;
    const max=typeof f.max==='number'?f.max:null;
    let x=max===null?Math.max(min,1):Math.min(max, Math.max(min, (min + max) / 2));
    // Keep exponential calculations inside a realistic finite test domain.
    if(['rate'].includes(f.id) && ['sip','compound-interest','fixed-deposit','lumpsum'].includes(calc.id)) x=Math.min(x,25);
    if(['years'].includes(f.id) && ['sip','compound-interest','fixed-deposit','lumpsum'].includes(calc.id)) x=Math.min(x,200);
    if(calc.id==='salary-hourly' && f.id==='direction') continue;
    v[f.id]=x;
  }
  if(calc.id==='salary-hourly') v.direction='toSalary';
  if(calc.id==='debt-payoff') v.payment=Math.max(v.payment, v.balance*(v.rate/1200)+1);
  if(calc.id==='roi') v.finalValue=Math.max(v.finalValue,1);
  return v;
}

let failures=0;
if(CALCULATORS.length!==37) { console.error(`FAIL: expected 37 calculators, found ${CALCULATORS.length}`); failures++; }
for(const id of expectedIds) if(!CALCULATORS.some(c=>c.id===id)) { console.error(`FAIL: missing calculator ${id}`); failures++; }

for(const calc of CALCULATORS) {
  try {
    const cases=[baseValues(calc),stressValues(calc)];
    if(calc.id==='salary-hourly') cases.push({...baseValues(calc),direction:'toSalary'});
    if(calc.id==='roi') cases.push({...baseValues(calc),finalValue:0});
    if(calc.id==='mortgage'||calc.id==='car-loan'||calc.id==='personal-loan') cases.push({...baseValues(calc),rate:0});
    if(calc.id==='compound-interest'||calc.id==='fixed-deposit'||calc.id==='lumpsum') cases.push({...baseValues(calc),rate:0});
    if(calc.id==='sip'||calc.id==='recurring-deposit') cases.push({...baseValues(calc),rate:0});
    if(calc.id==='debt-payoff') cases.push({...baseValues(calc),rate:0});
    if(calc.id==='inflation') cases.push({...baseValues(calc),rate:0});
    if(calc.id==='freedom-milestone') cases.push({...baseValues(calc),withdrawal:0});
    for(const values of cases) {
      const actual=out(calc,values);
      const expected=reference(calc.id,values);
      if(expected===null) continue; // documented non-payoff state is intentionally handled by the UI input guard/result layer.
      for(const [label,val] of Object.entries(expected)) assertValue(actual[label],val,`${calc.id} / ${label}`);
    }
    console.log(`PASS ${calc.id}`);
  } catch (err) {
    failures++;
    console.error(`FAIL ${calc.id}: ${err.message}`);
  }
}

console.log(`Phase 1 calculator audit reviewed ${CALCULATORS.length} calculators on ${REVIEW_DATE}.`);
if(failures) { console.error(`Phase 1 audit failed with ${failures} issue(s).`); process.exit(1); }
console.log('Phase 1 audit PASS: independent formula checks, zero-rate checks, stress cases and finite-output checks passed.');
