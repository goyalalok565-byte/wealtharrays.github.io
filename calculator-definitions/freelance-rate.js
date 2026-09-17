/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id:"freelance-rate",slug:"freelance-rate-calculator",title:"Freelance Rate Calculator",category:"business",
    short:"Turn a target income into an hourly freelance rate.",desc:"Estimate the billable hourly rate needed to cover income goals, expenses and non-billable time.",
    fields:[{id:"income",label:"Target annual income",type:"number",min:0,step:1000},{id:"expenses",label:"Annual business expenses",type:"number",min:0,step:100},{id:"hours",label:"Billable hours per week",type:"number",min:.1,max:100,step:.5},{id:"weeks",label:"Working weeks per year",type:"number",min:1,max:52,step:1}],
    compute(v){const hours=Math.max(v.hours,0),weeks=Math.max(v.weeks,0),income=Math.max(v.income,0),expenses=Math.max(v.expenses,0),billable=hours*weeks,needed=income+expenses,rate=billable?needed/billable:0;return[{label:"Annual amount to cover",value:needed,format:"currency"},{label:"Billable hours / year",value:billable,format:"number"},{label:"Target hourly rate",value:rate,format:"currency",emphasis:"neutral"}]}
  });
