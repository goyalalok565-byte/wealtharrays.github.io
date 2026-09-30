/* Wealth Arrays Formula Registry v2 — model identity/provenance metadata. */
(function(root){'use strict';
const registry=Object.freeze({
 sip:{version:'1.0',timing:'monthly contributions at beginning of period',formula:'FV of monthly series',engine:'futureValueSeries'},
 compound:{version:'1.0',timing:'periodic compounding',formula:'P(1+r/n)^(nt)',engine:'compound adapter'},
 inflation:{version:'1.0',timing:'annual inflation compounding',formula:'PV(1+i)^t',engine:'inflation adapter'},
 retirement:{version:'1.0',timing:'annual spending / withdrawal rate',formula:'expenses / withdrawal rate',engine:'retirement adapter'},
 'freedom-milestone':{version:'1.0',timing:'annual spending / withdrawal rate',formula:'expenses / withdrawal rate',engine:'retirement adapter'},
 cagr:{version:'1.0',timing:'annualized endpoints',formula:'(end/start)^(1/years)-1',engine:'cagr adapter'},
 roi:{version:'1.0',timing:'endpoint comparison',formula:'(final-cost)/cost',engine:'roi adapter'},
 lumpsum:{version:'1.0',timing:'annual compounding',formula:'P(1+r)^t',engine:'lumpsum adapter'},
 'fixed-deposit':{version:'1.0',timing:'periodic compounding',formula:'P(1+r/n)^(nt)',engine:'fixedDeposit adapter'},
 'recurring-deposit':{version:'1.0',timing:'monthly end-of-period deposits',formula:'P[((1+i)^n-1)/i]',engine:'recurringDeposit adapter'},
 'simple-interest':{version:'1.0',timing:'linear annual interest',formula:'P*r*t',engine:'simpleInterest adapter'},
 'car-loan':{version:'1.0',timing:'monthly amortization',formula:'EMI amortization',engine:'carLoan adapter'},
 mortgage:{version:'1.0',timing:'monthly amortization',formula:'EMI amortization',engine:'emi adapter'},
 'personal-loan':{version:'1.0',timing:'monthly amortization',formula:'EMI amortization',engine:'emi adapter'},
 'debt-payoff':{version:'1.0',timing:'monthly amortization',formula:'fixed payment payoff',engine:'debtPayoff adapter'},
 'net-worth':{version:'1.0',timing:'point-in-time balance sheet',formula:'assets-liabilities',engine:'netWorth adapter'},
 'salary-hourly':{version:'1.0',timing:'annual work-hours conversion',formula:'salary/(hours*weeks)',engine:'salaryHourly adapter'},
 overtime:{version:'1.0',timing:'hourly pay periods',formula:'regular + overtime*multiplier',engine:'overtime adapter'},
 'freelance-rate':{version:'1.0',timing:'annual billable capacity',formula:'(income+expenses)/(hours*weeks)',engine:'freelance adapter'},
 'profit-margin':{version:'1.0',timing:'period revenue accounting',formula:'profit/revenue',engine:'profitMargin adapter'},
 'income-tax-planner':{version:'1.0',timing:'planning-rate model',formula:'(income-deductions)*rate',engine:'incomeTaxPlanner adapter'}
});
root.WA_FORMULA_REGISTRY=registry;if(typeof module!=='undefined'&&module.exports)module.exports=registry;
})(typeof window!=='undefined'?window:globalThis);