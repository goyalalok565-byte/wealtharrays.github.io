(function(){'use strict';
var form=document.getElementById('wa-quick-emi-form');
var grid=document.getElementById('wa-home-tool-grid');
var toggle=document.getElementById('wa-toggle-all-tools');
var search=document.getElementById('tool-search');
var homeCurrency=document.getElementById('currency-select');
var countrySelect=document.getElementById('country-select');
var countryOptions=[['IN','India','INR'],['US','United States','USD'],['GB','United Kingdom','GBP'],['AE','United Arab Emirates','AED'],['CA','Canada','CAD'],['AU','Australia','AUD'],['SG','Singapore','SGD']];
var countryCurrency={IN:'INR',US:'USD',GB:'GBP',AE:'AED',CA:'CAD',AU:'AUD',SG:'SGD'};
function browserCountry(){var region=(navigator.language||'en-US').split('-')[1];region=region?region.toUpperCase():'US';return countryOptions.some(function(item){return item[0]===region;})?region:'US';}
function stored(key){try{return localStorage.getItem(key)||'';}catch(e){return '';}}
var activeCountry=stored('waCountry');
if(!countryOptions.some(function(item){return item[0]===activeCountry;}))activeCountry=browserCountry();
if(countrySelect){
 countrySelect.replaceChildren();
 countryOptions.forEach(function(item){var option=document.createElement('option');option.value=item[0];option.textContent=item[1];countrySelect.appendChild(option);});
 countrySelect.value=activeCountry;document.documentElement.setAttribute('data-country',activeCountry);
 try{if(!stored('waCountry'))localStorage.setItem('waCountry',activeCountry);}catch(e){}
 countrySelect.addEventListener('change',function(){activeCountry=countrySelect.value;var nextCurrency=countryCurrency[activeCountry]||'USD';document.documentElement.setAttribute('data-country',activeCountry);try{localStorage.setItem('waCountry',activeCountry);localStorage.setItem('waCurrency',nextCurrency);}catch(e){}if(homeCurrency){homeCurrency.value=nextCurrency;homeCurrency.dispatchEvent(new Event('change',{bubbles:true}));}window.dispatchEvent(new CustomEvent('wa-country',{detail:{country:activeCountry,currency:nextCurrency}}));});
}
if(homeCurrency){
 var homeCurrencies=[['USD','US Dollar','$'],['EUR','Euro','€'],['GBP','British Pound','£'],['INR','Indian Rupee','₹'],['JPY','Japanese Yen','¥'],['CNY','Chinese Yuan','CN¥'],['CAD','Canadian Dollar','C$'],['AUD','Australian Dollar','A$'],['CHF','Swiss Franc','CHF'],['SGD','Singapore Dollar','S$'],['HKD','Hong Kong Dollar','HK$'],['KRW','South Korean Won','₩'],['AED','UAE Dirham','د.إ'],['SAR','Saudi Riyal','﷼'],['NZD','New Zealand Dollar','NZ$'],['MXN','Mexican Peso','MX$'],['BRL','Brazilian Real','R$'],['ZAR','South African Rand','R'],['TRY','Turkish Lira','₺'],['THB','Thai Baht','฿'],['MYR','Malaysian Ringgit','RM'],['IDR','Indonesian Rupiah','Rp'],['PHP','Philippine Peso','₱'],['PLN','Polish Zloty','zł'],['SEK','Swedish Krona','kr']];
 var savedCurrency=stored('waCurrency')||countryCurrency[activeCountry]||'USD';
 if(!homeCurrencies.some(function(item){return item[0]===savedCurrency;}))savedCurrency='USD';
 if(!homeCurrency.options.length||!Array.from(homeCurrency.options).some(function(item){return item.value==='USD';})){homeCurrency.replaceChildren();homeCurrencies.forEach(function(item){var option=document.createElement('option');option.value=item[0];option.textContent=item[1]+' · '+item[2];homeCurrency.appendChild(option);});}
 homeCurrency.value=savedCurrency;document.documentElement.setAttribute('data-currency',savedCurrency);
 try{if(!stored('waCurrency'))localStorage.setItem('waCurrency',savedCurrency);}catch(e){}
 homeCurrency.addEventListener('change',function(){var value=homeCurrency.value||'USD';document.documentElement.setAttribute('data-currency',value);try{localStorage.setItem('waCurrency',value);}catch(e){}window.dispatchEvent(new CustomEvent('wa-currency',{detail:{currency:value}}));});
}
if(grid&&toggle){document.documentElement.classList.add('wa-home-ready');var setExpanded=function(expanded){grid.classList.toggle('is-expanded',expanded);toggle.setAttribute('aria-expanded',String(expanded));toggle.textContent=expanded?'Show fewer calculators':'Show all 55 calculators';toggle.hidden=!!(search&&search.value.trim());};toggle.addEventListener('click',function(){setExpanded(!grid.classList.contains('is-expanded'));});if(search){search.addEventListener('input',function(){if(search.value.trim()){grid.classList.add('is-expanded');toggle.hidden=true;}else{setExpanded(false);}});}}
if(!form)return;
var principal=document.getElementById('wa-emi-principal');
var rate=document.getElementById('wa-emi-rate');
var years=document.getElementById('wa-emi-years');
var emiOut=document.getElementById('wa-emi-output');
var interestOut=document.getElementById('wa-emi-interest');
var totalOut=document.getElementById('wa-emi-total');
var currencySelect=document.getElementById('currency-select');
var currencyLabel=document.getElementById('wa-emi-currency-label');
var currencyCode=currencySelect&&currencySelect.value||'USD';
var money=new Intl.NumberFormat(navigator.language||'en-US',{style:'currency',currency:currencyCode,maximumFractionDigits:0});
function updateCurrency(){currencyCode=currencySelect&&currencySelect.value||'INR';money=new Intl.NumberFormat('en-IN',{style:'currency',currency:currencyCode,maximumFractionDigits:0});if(currencyLabel){var option=currencySelect&&currencySelect.options[currencySelect.selectedIndex];var symbol=option&&option.textContent.split(' · ')[1]||currencyCode;currencyLabel.textContent='Loan amount ('+symbol+')';}calculate();}
function calculate(){if(!String(principal.value).trim()||!String(rate.value).trim()||!String(years.value).trim()){form.removeAttribute('aria-invalid');emiOut.textContent='Enter values';interestOut.textContent='—';totalOut.textContent='—';return;}var p=Number(principal.value),annual=Number(rate.value),y=Number(years.value);if(!Number.isFinite(p)||!Number.isFinite(annual)||!Number.isFinite(y)||p<10000||p>100000000||annual<0||annual>40||y<1||y>40){form.setAttribute('aria-invalid','true');emiOut.textContent='Check your inputs';interestOut.textContent='—';totalOut.textContent='—';return;}form.removeAttribute('aria-invalid');var n=Math.round(y*12),r=annual/1200,emi=r===0?p/n:p*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);if(!Number.isFinite(emi))return;var total=emi*n;emiOut.textContent=money.format(emi);interestOut.textContent=money.format(Math.max(0,total-p));totalOut.textContent=money.format(total);}
form.addEventListener('input',calculate);
form.addEventListener('submit',function(e){e.preventDefault();calculate();});
if(currencySelect)
window.addEventListener('wa-currency',updateCurrency);
updateCurrency();
})();
