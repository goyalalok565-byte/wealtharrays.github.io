/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id:"cagr",slug:"cagr-calculator",title:"CAGR Calculator",category:"investment",
    short:"Find the compound annual growth rate.",desc:"Calculate the annualized growth rate between a starting value and an ending value.",
    fields:[{id:"start",label:"Starting value",type:"number",min:0.01,step:100},{id:"end",label:"Ending value",type:"number",min:0,step:100},{id:"years",label:"Years",type:"number",min:.01,max:200,step:.1,suffix:"yrs"}],
    compute(v){const start=Math.max(v.start,0),end=Math.max(v.end,0),years=Math.max(v.years,0),gain=end-start,totalGrowth=start>0?(end/start-1)*100:0,cagr=start>0&&end>=0&&years>0?(Math.pow(end/start,1/years)-1)*100:0;return[{label:"Absolute gain",value:gain,format:"currency",emphasis:gain>=0?"positive":"negative"},{label:"Total growth",value:totalGrowth,format:"percent"},{label:"CAGR",value:cagr,format:"percent",emphasis:"neutral"}]}
  });
