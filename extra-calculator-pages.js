/* Wealth Arrays — isolated runtime for calculators 21–23. */
(function(){
  'use strict';
  var file=(location.pathname.split('/').pop()||'').toLowerCase();
  var key=file==='step-up-sip-calculator.html'?'step-up-sip':file==='emergency-fund-calculator.html'?'emergency-fund':file==='real-return-calculator.html'?'real-return':null;
  if(!key)return;
  var configs={
    'step-up-sip':{title:'Step-Up SIP Calculator',fields:[
      ['monthly','Starting monthly investment',5000,0,'',''],['stepUp','Annual increase',10,0,100,'%'],['rate','Expected annual return',10,0,100,'%'],['years','Investment period',15,1,60,'yrs'],['inflation','Expected annual inflation',6,0,30,'%']
    ]},
    'emergency-fund':{title:'Emergency Fund Calculator',fields:[
      ['expenses','Essential monthly expenses',50000,0,'',''],['months','Months of coverage',6,1,36,'mos'],['current','Current emergency savings',100000,0,'','']
    ]},
    'real-return':{title:'Real Return Calculator',fields:[
      ['nominal','Nominal annual return',10,-99,1000,'%'],['inflation','Annual inflation',6,-99,100,'%'],['amount','Starting amount',100000,0,'',''],['years','Time period',10,1,100,'yrs']
    ]}
  };
  var cfg=configs[key];
  function esc(s){return String(s==null?'':s).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}
  function symbol(){var s=document.getElementById('currency-select');var m={USD:'$',EUR:'€',GBP:'£',INR:'₹'};return m[s&&s.value]||'₹'}
  function money(n){return symbol()+Number(n).toLocaleString('en-IN',{maximumFractionDigits:2})}
  function render(){
    var host=document.getElementById('calc-widget');if(!host)return;
    if(host.dataset.waIsolated===key&&host.querySelector('input[type="number"]'))return;
    host.dataset.waIsolated=key;
    var id='wa-isolated-'+key, h='<section id="'+id+'" class="wa-isolated-card" aria-label="'+esc(cfg.title)+'"><div class="wa-isolated-grid">';
    cfg.fields.forEach(function(f){h+='<div class="wa-isolated-field"><label for="'+id+'-'+f[0]+'">'+esc(f[1])+'</label><div class="wa-isolated-input"><input id="'+id+'-'+f[0]+'" type="number" inputmode="decimal" value="'+f[2]+'" min="'+(f[3]=== ''?'':f[3])+'" '+(f[4]!==''?'max="'+f[4]+'"':'')+' step="any"><span>'+esc(f[5])+'</span></div></div>'});
    h+='</div><div id="'+id+'-error" class="wa-isolated-error" aria-live="polite"></div><div id="'+id+'-results" class="wa-isolated-results" aria-live="polite"></div><button type="button" id="'+id+'-reset" class="wa-isolated-reset">Reset to defaults</button></section>';
    host.innerHTML=h;
    var results=document.getElementById(id+'-results'),error=document.getElementById(id+'-error');
    function v(name){var n=Number(document.getElementById(id+'-'+name).value);return isFinite(n)?n:NaN}
    function calc(){
      var rows=[];
      try{
        if(key==='step-up-sip'){
          var monthly=v('monthly'),step=v('stepUp'),rate=v('rate'),years=v('years'),infl=v('inflation');
          if([monthly,step,rate,years,infl].some(function(n){return !isFinite(n)||years<1}))throw 0;
          var r=rate/1200,future=0,invested=0,c=monthly,months=Math.round(years*12);
          for(var m=1;m<=months;m++){future=(future+c)*(1+r);invested+=c;if(m%12===0)c*=1+step/100}
          rows=[['Total invested',money(invested)],['Growth / profit',money(future-invested)],['Projected future value',money(future)],["Future value in today's money",money(future/Math.pow(1+infl/100,years))]];
        }else if(key==='emergency-fund'){
          var e=v('expenses'),months2=v('months'),current=v('current');if([e,months2,current].some(function(n){return !isFinite(n)}))throw 0;
          var target=e*months2,gap=Math.max(0,target-current),coverage=e>0?current/e:0;
          rows=[['Emergency-fund target',money(target)],['Already saved',money(current)],['Remaining gap',money(gap)],['Current coverage',coverage.toFixed(1)+' mos']];
        }else{
          var nominal=v('nominal')/100,inflation=v('inflation')/100,amount=v('amount'),yrs=v('years');if([nominal,inflation,amount,yrs].some(function(n){return !isFinite(n)} )||1+inflation<=0||1+nominal<0)throw 0;
          var real=((1+nominal)/(1+inflation)-1)*100,fv=amount*Math.pow(1+nominal,yrs),pv=fv/Math.pow(1+inflation,yrs);
          rows=[['Real annual return',real.toFixed(2)+'%'],['Nominal future value',money(fv)],["Future value in today's purchasing power",money(pv)]];
        }
        error.textContent='';results.innerHTML=rows.map(function(r){return '<div class="wa-isolated-result"><span>'+esc(r[0])+'</span><strong>'+esc(r[1])+'</strong></div>'}).join('');
      }catch(e){error.textContent='Please enter valid values.';results.innerHTML=''}
    }
    cfg.fields.forEach(function(f){var el=document.getElementById(id+'-'+f[0]);el.addEventListener('input',calc);el.addEventListener('change',calc)});
    document.getElementById(id+'-reset').addEventListener('click',function(){cfg.fields.forEach(function(f){document.getElementById(id+'-'+f[0]).value=f[2]});calc()});
    calc();
  }
  function boot(){
    if(!document.getElementById('wa-isolated-styles')){var s=document.createElement('style');s.id='wa-isolated-styles';s.textContent='.wa-isolated-card{display:block!important;visibility:visible!important;opacity:1!important;border:1px solid var(--border,#e5e7eb);border-radius:18px;padding:22px;background:var(--surface,#fff);box-shadow:0 10px 30px rgba(15,23,42,.06)}.wa-isolated-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}.wa-isolated-field{display:flex;flex-direction:column;gap:7px}.wa-isolated-field label{font-size:13px;font-weight:700}.wa-isolated-input{display:flex;align-items:center;border:1px solid var(--border,#d1d5db);border-radius:12px;min-height:48px;background:var(--surface,#fff);overflow:hidden}.wa-isolated-input input{width:100%;border:0;outline:0;background:transparent;color:inherit;padding:12px;font:inherit;font-size:16px}.wa-isolated-input span{padding:0 12px;color:var(--muted,#667085);font-size:13px;font-weight:700}.wa-isolated-results{display:grid;gap:9px;margin-top:20px}.wa-isolated-result{display:flex;justify-content:space-between;gap:14px;padding:13px 14px;border-radius:12px;background:var(--surface-2,#f8fafc)}.wa-isolated-result span{font-size:13px;color:var(--muted,#667085)}.wa-isolated-result strong{font-size:17px}.wa-isolated-reset{margin-top:16px;border:1px solid var(--border,#d1d5db);background:transparent;color:inherit;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer}.wa-isolated-error{min-height:18px;margin-top:10px;color:#b42318;font-size:13px;font-weight:650}@media(max-width:680px){.wa-isolated-grid{grid-template-columns:1fr}.wa-isolated-card{padding:16px}.wa-isolated-result{flex-direction:column;gap:4px}}';document.head.appendChild(s)}
    render();
    setTimeout(render,250);setTimeout(render,800);setTimeout(render,1800);
    var host=document.getElementById('calc-widget');if(host&&window.MutationObserver){new MutationObserver(function(){if(!host.querySelector('input[type="number"]'))render()}).observe(host,{childList:true})}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();