/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id:"personal-loan",slug:"personal-loan-calculator",title:"Personal Loan Calculator",category:"loan",
    short:"Estimate monthly payments and the cost of a personal loan.",desc:"Calculate an estimated monthly payment from the loan amount, annual rate and repayment term.",
    fields:[{id:"principal",label:"Loan amount",type:"number",min:0,step:1000},{id:"rate",label:"Annual interest rate",type:"number",min:0,max:60,step:.05,suffix:"%"},{id:"years",label:"Repayment term",type:"number",min:0.0833333333,max:20,step:0.0833333333,suffix:"yrs"}],
    compute(v){const n=Math.max(1,Math.round(Math.max(v.years,0)*12)),P=Math.max(v.principal,0),r=Math.max(v.rate,0)/1200,emi=P===0?0:(r===0?P/n:P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1)),total=emi*n;return[{label:"Loan months",value:n,format:"number"},{label:"Monthly payment",value:emi,format:"currency",emphasis:"neutral"},{label:"Total repayment",value:total,format:"currency"},{label:"Total interest",value:total-P,format:"currency",emphasis:"negative"}]}
  });
