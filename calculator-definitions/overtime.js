/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id:"overtime",slug:"overtime-pay-calculator",title:"Overtime Pay Calculator",category:"salary",
    short:"Estimate overtime earnings and gross pay.",desc:"Calculate additional pay from an hourly rate, overtime hours and overtime multiplier.",
    fields:[{id:"hourly",label:"Base hourly rate",type:"number",min:0,step:.01},{id:"regular",label:"Regular hours",type:"number",min:0,max:744,step:.5},{id:"overtime",label:"Overtime hours",type:"number",min:0,max:744,step:.5},{id:"multiplier",label:"Overtime multiplier",type:"number",min:1,max:5,step:.1,suffix:"×"}],
    compute(v){const hourly=Math.max(v.hourly,0),regular=Math.max(v.regular,0),overtime=Math.max(v.overtime,0),multiplier=Math.max(v.multiplier,1),reg=hourly*regular,ot=hourly*overtime*multiplier;return[{label:"Regular pay",value:reg,format:"currency"},{label:"Overtime pay",value:ot,format:"currency",emphasis:"positive"},{label:"Total gross pay",value:reg+ot,format:"currency",emphasis:"neutral"}]}
  });
