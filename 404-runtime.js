/* CSP-friendly legacy URL redirect map. */
(function(){
  'use strict';
  var p=location.pathname.toLowerCase().replace(/^\/+|\/+$/g,'');
  var b=p.split('/').pop().replace(/\.html$/,'');
  var map={"privacy-policy":"privacy.html","privacy":"privacy.html","terms":"terms.html","disclaimer":"disclaimer.html","contact":"contact.html","about-us":"about.html","sip":"sip-calculator.html","sip-calculator":"sip-calculator.html","emi":"mortgage-emi-calculator.html","emi-calculator":"mortgage-emi-calculator.html","mortgage":"mortgage-emi-calculator.html","roi":"roi-calculator.html","cagr":"cagr-calculator.html","compound":"compound-interest-calculator.html","compound-interest":"compound-interest-calculator.html","fd":"fixed-deposit-calculator.html","rd":"recurring-deposit-calculator.html","lumpsum":"lumpsum-calculator.html","lump-sum":"lumpsum-calculator.html","inflation":"inflation-calculator.html","retirement":"retirement-calculator.html","car-loan":"car-loan-calculator.html","personal-loan":"personal-loan-calculator.html","debt-payoff":"debt-payoff-calculator.html","simple-interest":"simple-interest-calculator.html","profit-margin":"profit-margin-calculator.html","net-worth":"net-worth-calculator.html","salary-to-hourly":"salary-to-hourly-calculator.html","overtime-pay":"overtime-pay-calculator.html","freelance-rate":"freelance-rate-calculator.html","income-tax":"income-tax-scenario-calculator.html","step-up-sip-calculator":"tools.html","emergency-fund-calculator":"tools.html","real-return-calculator":"tools.html","decoding-auto-financing-how-car-loan":"articles/loan-emi-guide.html"};
  var target=map[b];
  if(!target&&b&&b.indexOf('calculator')>-1) target=b+'.html';
  location.replace('/'+(target||'index.html'));
})();
