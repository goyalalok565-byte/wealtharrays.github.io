/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id:"net-worth",slug:"net-worth-calculator",title:"Net Worth Calculator",category:"retirement",
    short:"Calculate assets minus liabilities.",desc:"Add what you own and subtract what you owe to estimate your personal net worth.",
    fields:[{id:"cash",label:"Cash & savings",type:"number",min:0,step:100},{id:"investments",label:"Investments",type:"number",min:0,step:100},{id:"property",label:"Property value",type:"number",min:0,step:1000},{id:"debt",label:"Total liabilities",type:"number",min:0,step:100}],
    compute(v){const cash=Math.max(v.cash,0),investments=Math.max(v.investments,0),property=Math.max(v.property,0),debt=Math.max(v.debt,0),assets=cash+investments+property,net=assets-debt;return[{label:"Total assets",value:assets,format:"currency",emphasis:"positive"},{label:"Total liabilities",value:debt,format:"currency",emphasis:"negative"},{label:"Net worth",value:net,format:"currency",emphasis:net>=0?"positive":"negative"}]}
  });
