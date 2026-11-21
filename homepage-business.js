(function(){
'use strict';
function initGrid(){
  var grid=document.getElementById('wa-home-tool-grid');
  var toggle=document.getElementById('wa-toggle-all-tools');
  var search=document.getElementById('tool-search');
  if(!grid||!toggle)return;
  document.documentElement.classList.add('wa-home-ready');
  var setExpanded=function(expanded){
    grid.classList.toggle('is-expanded',expanded);
    toggle.setAttribute('aria-expanded',String(expanded));
    toggle.textContent=expanded?'Show fewer calculators':'Show all 55 calculators';
    toggle.hidden=!!(search&&search.value.trim());
  };
  toggle.addEventListener('click',function(){setExpanded(!grid.classList.contains('is-expanded'));});
  if(search)search.addEventListener('input',function(){
    if(search.value.trim()){grid.classList.add('is-expanded');toggle.hidden=true;}
    else setExpanded(false);
  });
}
function initCurrency(){
  var homeCurrency=document.getElementById('currency-select');
  if(!homeCurrency)return;
  var homeCurrencies=[["USD","US Dollar","$"],["EUR","Euro","€"],["GBP","British Pound","£"],["INR","Indian Rupee","₹"],["JPY","Japanese Yen","¥"],["CNY","Chinese Yuan","CN¥"],["CAD","Canadian Dollar","C$"],["AUD","Australian Dollar","A$"],["CHF","Swiss Franc","CHF"],["SGD","Singapore Dollar","S$"],["HKD","Hong Kong Dollar","HK$"],["KRW","South Korean Won","₩"],["AED","UAE Dirham","د.إ"],["SAR","Saudi Riyal","﷼"],["NZD","New Zealand Dollar","NZ$"],["MXN","Mexican Peso","MX$"],["BRL","Brazilian Real","R$"],["ZAR","South African Rand","R"],["TRY","Turkish Lira","₺"],["THB","Thai Baht","฿"],["MYR","Malaysian Ringgit","RM"],["IDR","Indonesian Rupiah","Rp"],["PHP","Philippine Peso","₱"],["PLN","Polish Zloty","zł"],["SEK","Swedish Krona","kr"]];
  var savedCurrency='';
  try{savedCurrency=localStorage.getItem('waCurrency')||'';}catch(_error){}
  savedCurrency=savedCurrency||document.documentElement.getAttribute('data-currency')||'INR';
  if(!homeCurrencies.some(function(c){return c[0]===savedCurrency;}))savedCurrency='INR';
  if(!homeCurrency.options.length||!Array.from(homeCurrency.options).some(function(o){return o.value==='INR';})){
    var fragment=document.createDocumentFragment();
    homeCurrencies.forEach(function(c){
      var option=document.createElement('option');
      option.value=c[0];
      option.textContent=c[1]+' · '+c[2];
      fragment.appendChild(option);
    });
    homeCurrency.replaceChildren(fragment);
  }
  homeCurrency.value=savedCurrency;
  document.documentElement.setAttribute('data-currency',savedCurrency);
  homeCurrency.addEventListener('change',function(){
    var currency=homeCurrency.value||'INR';
    document.documentElement.setAttribute('data-currency',currency);
    try{localStorage.setItem('waCurrency',currency);}catch(_error){}
    window.dispatchEvent(new CustomEvent('wa-currency',{detail:{currency:currency}}));
  });
}
function initQuickEmi(){
  var form=document.getElementById('wa-quick-emi-form');
  if(!form)return;
  var principal=document.getElementById('wa-emi-principal');
  var rate=document.getElementById('wa-emi-rate');
  var years=document.getElementById('wa-emi-years');
  var emiOut=document.getElementById('wa-emi-output');
  var interestOut=document.getElementById('wa-emi-interest');
  var totalOut=document.getElementById('wa-emi-total');
  var currencySelect=document.getElementById('currency-select');
  var currencyLabel=document.getElementById('wa-emi-currency-label');
  var currencyCode=currencySelect&&currencySelect.value||'INR';
  var money=new Intl.NumberFormat('en-IN',{style:'currency',currency:currencyCode,maximumFractionDigits:0});
  function updateCurrency(){
    currencyCode=currencySelect&&currencySelect.value||'INR';
    money=new Intl.NumberFormat('en-IN',{style:'currency',currency:currencyCode,maximumFractionDigits:0});
    if(currencyLabel){
      var option=currencySelect&&currencySelect.options[currencySelect.selectedIndex];
      var symbol=option&&option.textContent.split(' · ')[1]||currencyCode;
      currencyLabel.textContent='Loan amount ('+symbol+')';
    }
    calculate();
  }
  function calculate(){
    if(!String(principal.value).trim()||!String(rate.value).trim()||!String(years.value).trim()){
      form.removeAttribute('aria-invalid');emiOut.textContent='Enter values';interestOut.textContent='—';totalOut.textContent='—';return;
    }
    var p=Number(principal.value),annual=Number(rate.value),y=Number(years.value);
    if(!Number.isFinite(p)||!Number.isFinite(annual)||!Number.isFinite(y)||p<10000||p>100000000||annual<0||annual>40||y<1||y>40){
      form.setAttribute('aria-invalid','true');emiOut.textContent='Check your inputs';interestOut.textContent='—';totalOut.textContent='—';return;
    }
    form.removeAttribute('aria-invalid');
    var n=Math.round(y*12),r=annual/1200;
    var emi=r===0?p/n:p*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
    if(!Number.isFinite(emi))return;
    var total=emi*n;
    emiOut.textContent=money.format(emi);
    interestOut.textContent=money.format(Math.max(0,total-p));
    totalOut.textContent=money.format(total);
  }
  form.addEventListener('input',calculate);
  form.addEventListener('submit',function(e){e.preventDefault();calculate();});
  if(currencySelect)currencySelect.addEventListener('change',updateCurrency);
  window.addEventListener('wa-currency',updateCurrency);
  updateCurrency();
}
var tasks={grid:initGrid,currency:initCurrency,emi:initQuickEmi};
var completed={grid:false,currency:false,emi:false};
var order=['grid','currency','emi'];
var pending=false,running=false;
function runTask(name){
  if(completed[name])return;
  completed[name]=true;
  try{tasks[name]();}catch(error){window.setTimeout(function(){throw error;},0);}
}
function hasRemaining(){return order.some(function(name){return !completed[name];});}
function runNext(){
  if(running||!hasRemaining())return;
  running=true;
  var next=order.find(function(name){return !completed[name];});
  runTask(next);
  running=false;
  if(!hasRemaining())return;
  var resume=function(){runNext();};
  if(window.scheduler&&typeof window.scheduler.yield==='function'){
    window.scheduler.yield().then(resume,function(){window.setTimeout(resume,0);});
  }else window.setTimeout(resume,0);
}
function scheduleIdle(){
  if(pending||!hasRemaining())return;
  pending=true;
  var kick=function(){pending=false;runNext();};
  var afterPaint=function(){
    if(typeof window.requestIdleCallback==='function')window.requestIdleCallback(kick,{timeout:2000});
    else window.setTimeout(kick,3500);
  };
  if(typeof window.requestAnimationFrame==='function')window.requestAnimationFrame(function(){window.requestAnimationFrame(afterPaint);});
  else window.setTimeout(afterPaint,100);
}
function onInteraction(event){
  var target=event&&event.target;
  if(target&&typeof target.closest==='function'){
    if(target.closest('#wa-quick-emi-form')||target.closest('#currency-select')){
      runTask('currency');
      runTask('emi');
    }else if(target.closest('#wa-home-tool-grid')||target.closest('#wa-toggle-all-tools')||target.closest('#tool-search')){
      runTask('grid');
    }
  }
  scheduleIdle();
}
window.addEventListener('load',scheduleIdle,{once:true});
['pointerdown','keydown','input','change','click'].forEach(function(type){
  document.addEventListener(type,onInteraction,{once:true,capture:true,passive:type==='pointerdown'});
});
if(document.readyState==='complete')scheduleIdle();
})();