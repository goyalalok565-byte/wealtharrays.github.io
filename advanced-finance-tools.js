(function(){
'use strict';
const $=id=>document.getElementById(id);
const n=(id,fallback=0)=>{const el=$(id),v=el?Number(el.value):fallback;return Number.isFinite(v)?v:fallback;};
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const M=v=>{try{return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number.isFinite(v)?v:0)}catch(e){return '₹'+Math.round(v||0).toLocaleString('en-IN')}};
let activeResult=null;const out=(id,html)=>{if(activeResult&&id!==activeResult)return;const el=$(id);if(el)el.innerHTML=html;};
function emi(p,rate,years){p=Math.max(0,p);rate=clamp(rate,0,100);const months=clamp(Math.round(years*12),1,1200),r=rate/1200;return r===0?p/months:p*r*Math.pow(1+r,months)/(Math.pow(1+r,months)-1);}
function run(target){
 activeResult=target||null;
 try{
  const amount=clamp(n('ga'),0,1e12),tax=clamp(n('gr'),0,100);
  out('go','Tax added <b>'+M(amount*tax/100)+'</b><br>Final price <b>'+M(amount*(1+tax/100))+'</b>');
  const principal=clamp(n('lp'),0,1e12),years=clamp(n('ly',10),.25,100),rateA=clamp(n('la'),0,100),rateB=clamp(n('lb'),0,100),months=Math.max(1,Math.round(years*12));
  const a=emi(principal,rateA,years),b=emi(principal,rateB,years);
  out('lo','Offer A monthly payment <b>'+M(a)+'</b><br>Offer B monthly payment <b>'+M(b)+'</b><br>Total interest A <b>'+M(Math.max(0,a*months-principal))+'</b><br>Total interest B <b>'+M(Math.max(0,b*months-principal))+'</b>');
  const payment=clamp(n('ae'),0,1e10),ar=clamp(n('ar'),0,100)/1200,am=clamp(Math.round(n('ay',20)*12),1,1200),capacity=ar===0?payment*am:payment*(1-Math.pow(1+ar,-am))/ar;
  out('ao','Estimated loan amount <b>'+M(capacity)+'</b> at the monthly payment you entered.');
  const rent=clamp(n('rm'),0,1e9),home=clamp(n('hp'),0,1e12),ry=Math.round(clamp(n('ry',10),1,100)),growth=clamp(n('rg'),-99,100)/100;
  const rentTotal=Math.abs(growth)<1e-9?rent*12*ry:rent*12*(Math.pow(1+growth,ry)-1)/growth;
  out('ro','Estimated rent paid over '+ry+' years <b>'+M(rentTotal)+'</b><br>Home purchase price (not full ownership cost) <b>'+M(home)+'</b>');
  const goldRate=clamp(n('goldr'),0,1e12),weight=clamp(n('goldw'),0,1e7),purity=clamp(n('goldp',100),0,100)/100,makingRate=clamp(n('goldm'),0,100)/100;
  const gold=goldRate*weight/10*purity,making=gold*makingRate,gst=(gold+making)*.03;
  out('goldo','Estimated gold value <b>'+M(gold)+'</b><br>Making charges <b>'+M(making)+'</b><br>Estimated GST (3%) <b>'+M(gst)+'</b><br><b>Estimated total '+M(gold+making+gst)+'</b>');
  const income=clamp(n('bi'),0,1e12),goalPct=clamp(n('bs',20),0,100),needs=income*.5,wants=income*.3,goals=income*goalPct/100;
  out('bo','Needs (50%) <b>'+M(needs)+'</b><br>Wants (30%) <b>'+M(wants)+'</b><br>Your savings goal ('+goalPct+'%) <b>'+M(goals)+'</b><br>Unallocated <b>'+M(income-needs-wants-goals)+'</b>');
  const target=clamp(n('st'),0,1e12),current=clamp(n('sc'),0,1e12),saveRate=clamp(n('sr'),-99,100)/1200,saveMonths=clamp(Math.round(n('sy',10)*12),1,1200),currentAtGoal=current*Math.pow(1+saveRate,saveMonths),gap=Math.max(0,target-currentAtGoal);
  const monthly=gap===0?0:saveRate===0?gap/saveMonths:gap*saveRate/(Math.pow(1+saveRate,saveMonths)-1);
  out('so','Amount still needed <b>'+M(gap)+'</b><br>Estimated monthly saving (no annual step-up) <b>'+M(monthly)+'</b>');
  const converted=n('fa')*n('fr');
  out('fo','Converted amount <b>'+ (Number.isFinite(converted)?converted.toLocaleString('en-IN',{maximumFractionDigits:2}):'Check the amount and exchange rate') +'</b>');
 }catch(err){console.error('Everyday Money Tools calculation error',err);}
}
function refresh(){/* Results are updated only by the matching Calculate button. */}
const limits={ga:[0,1e12],gr:[0,100],lp:[0,1e12],ly:[.25,100],la:[0,100],lb:[0,100],ae:[0,1e10],ar:[0,100],ay:[.25,100],rm:[0,1e9],hp:[0,1e12],ry:[1,100],rg:[-99,100],goldr:[0,1e12],goldw:[0,1e7],goldp:[0,100],goldm:[0,100],bi:[0,1e12],bs:[0,100],st:[0,1e12],sc:[0,1e12],sr:[-99,100],sy:[.25,100],fa:[-1e12,1e12],fr:[-1e6,1e6]};
document.querySelectorAll('.advanced-card input').forEach(el=>{el.addEventListener('change',()=>{const range=limits[el.id];if(range&&el.value.trim()!==''){const value=Number(el.value);if(Number.isFinite(value))el.value=String(clamp(value,range[0],range[1]));}});});
document.querySelectorAll('.calc-result-btn').forEach(btn=>btn.addEventListener('click',()=>{run(btn.dataset.result);const result=$(btn.dataset.result);if(result){result.scrollIntoView({behavior:'smooth',block:'center'});result.setAttribute('tabindex','-1');result.focus({preventScroll:true});}}));
document.querySelectorAll('.mini').forEach(el=>{el.textContent='Enter your numbers, then click Calculate my result to see the estimate.';});
})();
