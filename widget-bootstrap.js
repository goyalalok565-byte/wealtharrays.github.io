(function(){
'use strict';
function boot(){
  var host=document.getElementById('calc-widget');
  if(window.parent!==window) document.documentElement.dataset.waEmbed='1';
  if(!host||host.dataset.waBooted==='1'||host.children.length)return false;
  if(typeof mountCalculator!=='function'||typeof CALCULATORS==='undefined')return false;
  var id=new URLSearchParams(location.search).get('calc')||'sip';
  var calc=CALCULATORS.find(function(x){return x.id===id||x.slug===id;})||CALCULATORS.find(function(x){return x.id==='sip';})||CALCULATORS[0];
  if(calc){host.dataset.waBooted='1';try{mountCalculator(calc,'calc-widget');return true}catch(e){host.dataset.waBooted='';console.error(e)}}
  return false;
}
if(!boot()){
  var tries=0;
  var timer=setInterval(function(){if(boot()||++tries>=100)clearInterval(timer)},50);
}
window.addEventListener('wa:calculator-runtime-ready',boot);
window.addEventListener('load',boot,{once:true});
})();