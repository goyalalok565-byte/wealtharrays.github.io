import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const descriptions={
'lumpsum-calculator/index.html':'Estimate the future value of a one-time investment with this lumpsum calculator. Adjust your assumed return and investment period to compare possible outcomes.',
'car-loan-calculator/index.html':'Calculate your car loan EMI, total interest and repayment cost. Compare loan amounts, annual interest rates and tenures before choosing a vehicle loan.',
'debt-payoff-calculator/index.html':'Estimate how long it may take to repay debt using a fixed monthly payment and interest rate. Compare repayment scenarios and the total interest cost.',
'net-worth-calculator/index.html':'Calculate your net worth by adding assets such as cash, investments and property, then subtracting loans and other liabilities for a clearer financial snapshot.'
};
const examples={
'gst-calculator/index.html':'For a taxable amount of ₹1,00,000 at 18% GST, GST is ₹18,000 and the total including GST is ₹1,18,000.',
'gratuity-calculator/index.html':'For eligible monthly salary of ₹50,000 and 10 completed years, the common 15/26 estimate is ₹2,88,462 (₹50,000 × 15 ÷ 26 × 10), subject to eligibility and applicable rules.',
'ppf-calculator/index.html':'At ₹1,50,000 contributed at each year-end for 15 years and a constant assumed 7.1% annual rate, estimated maturity is about ₹40.68 lakh. Actual notified rates can change.',
'epf-calculator/index.html':'With ₹30,000 monthly basic pay, 12% employee contribution, 3.67% employer EPF share and an assumed constant 8.25% annual rate for 25 years, the balance depends on wage limits, EPS allocation and contribution timing; treat it as an estimate, not an official EPFO balance.',
'nps-calculator/index.html':'A ₹5,000 monthly contribution for 25 years at an assumed 9% annual return grows to roughly ₹56 lakh before charges and taxes. A 40% annuity allocation is about ₹22.4 lakh; actual returns and annuity rates vary.',
'hra-exemption-calculator/index.html':'With ₹50,000 monthly basic salary, ₹20,000 HRA and ₹25,000 rent in a qualifying metro, the common limits are ₹20,000 HRA, ₹20,000 rent less 10% of basic, and ₹25,000 (50% of basic); illustrative exemption is ₹20,000 monthly, subject to tax rules.',
'step-up-sip-calculator/index.html':'Starting at ₹5,000 monthly, increasing SIP by 10% yearly for 15 years at an assumed 12% return is a projection only; market returns are not guaranteed.',
'sip-goal-calculator/index.html':'For a ₹50 lakh target, ₹5 lakh current corpus, 10% assumed return and 15 years, the required monthly SIP is approximately ₹8,000; exact results depend on contribution timing and compounding.',
'credit-card-payoff-calculator/index.html':'For an ₹80,000 balance at 36% APR and a fixed ₹8,000 monthly payment, total repayment exceeds the original balance because of interest; use the schedule for exact payoff month and interest.',
'emergency-fund-calculator/index.html':'At ₹40,000 essential monthly expenses, a six-month reserve target is ₹2,40,000. With ₹1,00,000 saved, the gap is ₹1,40,000; adding ₹10,000 monthly fills it in 14 months before interest.',
'income-tax-scenario-calculator/index.html':'Compare the calculator’s tax estimate across scenarios; tax payable depends on the financial year, regime, deductions, rebates and rules applicable to your income.',
'profit-margin-calculator/index.html':'If revenue is ₹1,00,000 and costs are ₹70,000, profit is ₹30,000 and profit margin is 30% of revenue.',
'compound-interest-calculator/index.html':'For ₹1,00,000 invested for 10 years at an assumed 8% annual return compounded annually, future value is about ₹2,15,892 before taxes, fees and inflation.',
'salary-to-hourly-calculator/index.html':'For an annual salary of ₹6,24,000 and 2,080 work hours yearly (40 hours × 52 weeks), the equivalent gross hourly rate is ₹300.',
'retirement-calculator/index.html':'Treat retirement projections as scenarios: test the estimated corpus against inflation, future expenses, retirement age and multiple return assumptions rather than treating one output as guaranteed.',
'sip-calculator/index.html':'For a ₹5,000 monthly SIP over 15 years at an assumed 12% annual return, invested principal is ₹9 lakh and projected corpus is approximately ₹25.2 lakh; market returns are not guaranteed.'
};
let changed=0;
for(const [file,desc] of Object.entries(descriptions)){
 const p=path.join(root,file); if(!fs.existsSync(p)) throw Error('Missing '+file);
 let h=fs.readFileSync(p,'utf8'); if(desc.length<80||desc.length>160) throw Error('Bad description length '+file);
 h=h.replace(/(<meta\s+name=["']description["']\s+content=["'])[^"']*(["'][^>]*>)/i,'$1'+desc+'$2');
 fs.writeFileSync(p,h); changed++;
}
for(const [file,result] of Object.entries(examples)){
 const p=path.join(root,file); if(!fs.existsSync(p)) continue;
 let h=fs.readFileSync(p,'utf8');
 const block='<p class="worked-example-result"><strong>Worked result:</strong> '+result+'</p>';
 if(/<h2[^>]*>\s*Example inputs\s*<\/h2>/i.test(h)) h=h.replace(/(<h2[^>]*>\s*Example inputs\s*<\/h2>)/i,'$1'+block);
 else if(/<section[^>]*class=["'][^"']*calculator-specific-guidance[^"']*["'][^>]*>/i.test(h)) h=h.replace(/(<section[^>]*class=["'][^"']*calculator-specific-guidance[^"']*["'][^>]*>)/i,'$1'+block);
 else if(h.includes('</article>')) h=h.replace('</article>',block+'</article>');\n else h=h.replace('</main>',block+'</main>');
 fs.writeFileSync(p,h); changed++;
}
for(const file of ['loan-interest-calculator/index.html','loan-emi-calculator/index.html']){
 const p=path.join(root,file); if(!fs.existsSync(p)) continue;
 let h=fs.readFileSync(p,'utf8');
 h=h.replace(/<meta\s+name=["']robots["'][^>]*>/i,'');
 const c='<link rel="canonical" href="https://wealtharrays.com/mortgage-emi-calculator/">';
 if(/<link\s+rel=["']canonical["'][^>]*>/i.test(h)) h=h.replace(/<link\s+rel=["']canonical["'][^>]*>/i,c);
 h=h.replace(/<script\b[^>]*src=["'][^"']*(?:adsbygoogle|pagead2\.googlesyndication|adsense)[^"']*["'][^>]*>\s*<\/script>/gi,'').replace(/<ins\b[^>]*class=["'][^"']*adsbygoogle[^"']*["'][\s\S]*?<\/ins>/gi,'');
 fs.writeFileSync(p,h); changed++;
}
console.log('Final SEO/content fixes applied to '+changed+' HTML files.');
