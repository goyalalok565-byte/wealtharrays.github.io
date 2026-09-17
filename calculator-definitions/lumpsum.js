/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id:"lumpsum",slug:"lumpsum-calculator",title:"Lumpsum Calculator",category:"investment",
    short:"Project a one-time investment over time.",desc:"Estimate how a lump-sum investment could grow at an assumed annual return.",
    fields:[{id:"principal",label:"Investment amount",type:"number",min:0,step:100},{id:"rate",label:"Expected annual return",type:"number",min:0,max:1000,step:.1,suffix:"%"},{id:"years",label:"Investment period",type:"number",min:.1,max:200,step:.1,suffix:"yrs"},{id:"inflation",label:"Expected annual inflation",type:"number",default:6,min:0,max:30,step:.1,suffix:"%"}],
    compute(v){const P=Math.max(v.principal,0),rate=Math.max(v.rate,0),years=Math.max(v.years,0),inflation=Math.max(v.inflation,0),A=P*Math.pow(1+rate/100,years),real=A/Math.pow(1+inflation/100,years);return[{label:"Amount invested",value:P,format:"currency"},{label:"Estimated gain",value:A-P,format:"currency",emphasis:"positive"},{label:"Projected value (future money)",value:A,format:"currency",emphasis:"neutral"},{label:"Value in today's purchasing power",value:real,format:"currency",emphasis:"neutral"}]}
  });
