/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id:"income-tax-planner",slug:"income-tax-planner",title:"Income Tax Planner",category:"business",
    short:"Estimate an effective tax rate from a planning assumption.",desc:"A simple jurisdiction-neutral planning tool; it is not a country-specific tax filing calculator.",
    fields:[{id:"income",label:"Annual gross income",type:"number",min:0,step:1000},{id:"deductions",label:"Estimated deductions",type:"number",min:0,step:100},{id:"rate",label:"Estimated effective tax rate",type:"number",min:0,max:100,step:.1,suffix:"%"}],
    compute(v){const income=Math.max(v.income,0),deductions=Math.min(Math.max(v.deductions,0),income),taxable=Math.max(income-deductions,0),rate=Math.max(v.rate,0),tax=taxable*rate/100,effective=income>0?tax/income*100:0;return[{label:"Estimated taxable income",value:taxable,format:"currency"},{label:"Estimated tax",value:tax,format:"currency",emphasis:"negative"},{label:"Effective tax on gross income",value:effective,format:"percent"},{label:"Estimated after-tax income",value:income-tax,format:"currency",emphasis:"neutral"}]}
  });
