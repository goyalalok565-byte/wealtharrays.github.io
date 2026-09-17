/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id:"car-loan",slug:"car-loan-calculator",title:"Car Loan EMI Calculator",category:"loan",
    short:"Estimate a vehicle loan payment and total cost.",desc:"Calculate equal monthly payments and interest for a car or vehicle loan.",
    fields:[{id:"price",label:"Vehicle price",type:"number",min:0,step:1000},{id:"down",label:"Down payment",type:"number",min:0,step:1000},{id:"rate",label:"Annual interest rate",type:"number",min:0,max:40,step:.05,suffix:"%"},{id:"years",label:"Loan term",type:"number",min:1,max:15,step:1,suffix:"yrs"}],
    compute(v){const price=Math.max(v.price,0),down=Math.min(Math.max(v.down,0),price),P=Math.max(price-down,0),years=Math.max(v.years,0),n=Math.max(1,Math.round(years*12)),r=Math.max(v.rate,0)/1200,emi=P===0?0:(r===0?P/n:P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1)),total=emi*n;return[{label:"Loan amount",value:P,format:"currency"},{label:"Monthly payment",value:emi,format:"currency",emphasis:"neutral"},{label:"Total repayment",value:total,format:"currency"},{label:"Total interest",value:total-P,format:"currency",emphasis:"negative"},{label:"Total cost including down payment",value:total+down,format:"currency"}]}
  });
