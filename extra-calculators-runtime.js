/* Wealth Arrays — hardened standalone runtime for expansion calculators.
   This file is intentionally self-sufficient: the three expansion tools can render
   even if the normal calculator registry or widget runtime fails. */
(function () {
  'use strict';

  var STYLE_ID = 'wa-extra-calculator-styles';
  var currencySymbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };

  var fallback = {
    'step-up-sip': {
      id: 'step-up-sip', title: 'Step-Up SIP Calculator',
      fields: [
        { id: 'monthly', label: 'Starting monthly investment', default: 5000, min: 0, step: 100 },
        { id: 'stepUp', label: 'Annual increase', default: 10, min: 0, max: 100, step: 0.5, suffix: '%' },
        { id: 'rate', label: 'Expected annual return', default: 10, min: 0, max: 100, step: 0.1, suffix: '%' },
        { id: 'years', label: 'Investment period', default: 15, min: 1, max: 60, step: 1, suffix: 'yrs' },
        { id: 'inflation', label: 'Expected annual inflation', default: 6, min: 0, max: 30, step: 0.1, suffix: '%' }
      ],
      compute: function (v) {
        var months = Math.max(0, Math.round(v.years * 12));
        var monthlyRate = v.rate / 100 / 12;
        var annualStep = 1 + v.stepUp / 100;
        var contribution = v.monthly, future = 0, invested = 0;
        for (var m = 1; m <= months; m++) {
          future = (future + contribution) * (1 + monthlyRate);
          invested += contribution;
          if (m % 12 === 0) contribution *= annualStep;
        }
        return [
          { label: 'Total invested', value: invested, format: 'currency' },
          { label: 'Growth / profit', value: future - invested, format: 'currency', emphasis: 'positive' },
          { label: 'Projected future value', value: future, format: 'currency' },
          { label: "Future value in today's money", value: future / Math.pow(1 + v.inflation / 100, v.years), format: 'currency' }
        ];
      }
    },
    'emergency-fund': {
      id: 'emergency-fund', title: 'Emergency Fund Calculator',
      fields: [
        { id: 'expenses', label: 'Essential monthly expenses', default: 50000, min: 0, step: 1000 },
        { id: 'months', label: 'Months of coverage', default: 6, min: 1, max: 36, step: 1, suffix: 'mos' },
        { id: 'current', label: 'Current emergency savings', default: 100000, min: 0, step: 1000 }
      ],
      compute: function (v) {
        var target = v.expenses * v.months;
        var gap = Math.max(0, target - v.current);
        var coverage = v.expenses > 0 ? v.current / v.expenses : 0;
        return [
          { label: 'Emergency-fund target', value: target, format: 'currency' },
          { label: 'Already saved', value: v.current, format: 'currency' },
          { label: 'Remaining gap', value: gap, format: 'currency', emphasis: gap > 0 ? 'negative' : 'positive' },
          { label: 'Current coverage', value: coverage, format: 'years' }
        ];
      }
    },
    'real-return': {
      id: 'real-return', title: 'Real Return Calculator',
      fields: [
        { id: 'nominal', label: 'Nominal annual return', default: 10, min: -99, max: 1000, step: 0.1, suffix: '%' },
        { id: 'inflation', label: 'Annual inflation', default: 6, min: -99, max: 100, step: 0.1, suffix: '%' },
        { id: 'amount', label: 'Starting amount', default: 100000, min: 0, step: 1000 },
        { id: 'years', label: 'Time period', default: 10, min: 1, max: 100, step: 1, suffix: 'yrs' }
      ],
      compute: function (v) {
        var nominal = v.nominal / 100, inflation = v.inflation / 100;
        var real = ((1 + nominal) / (1 + inflation) - 1) * 100;
        var futureNominal = v.amount * Math.pow(1 + nominal, v.years);
        return [
          { label: 'Real annual return', value: real, format: 'percent', emphasis: real >= 0 ? 'positive' : 'negative' },
          { label: 'Nominal future value', value: futureNominal, format: 'currency' },
          { label: "Future value in today's purchasing power", value: futureNominal / Math.pow(1 + inflation, v.years), format: 'currency' }
        ];
      }
    }
  };

  function getCatalog() {
    var external = window.WA_EXTRA_CALCULATORS || {};
    var catalog = {};
    Object.keys(fallback).forEach(function (key) { catalog[key] = external[key] || fallback[key]; });
    return catalog;
  }

  function getKey() {
    var path = window.location.pathname;
    if (path.indexOf('step-up-sip-calculator.html') !== -1) return 'step-up-sip';
    if (path.indexOf('emergency-fund-calculator.html') !== -1) return 'emergency-fund';
    if (path.indexOf('real-return-calculator.html') !== -1) return 'real-return';
    var host = document.getElementById('calc-widget');
    return host && host.getAttribute('data-wa-extra-calculator');
  }

  function symbol() {
    var select = document.getElementById('currency-select');
    return currencySymbols[select && select.value] || '₹';
  }

  function format(value, type) {
    var n = Number(value);
    if (!isFinite(n)) return '—';
    if (type === 'percent') return n.toFixed(2) + '%';
    if (type === 'years') return n.toFixed(1) + ' yrs';
    return symbol() + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c];
    });
  }

  function styles() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style'); s.id = STYLE_ID;
    s.textContent = '.wa-extra-card{border:1px solid var(--border,#e5e7eb);background:var(--surface,#fff);border-radius:20px;padding:22px;box-shadow:0 10px 30px rgba(15,23,42,.06)}.wa-extra-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}.wa-extra-field{display:flex;flex-direction:column;gap:7px}.wa-extra-field label{font-size:13px;font-weight:700}.wa-extra-input{display:flex;align-items:center;border:1px solid var(--border,#d1d5db);border-radius:12px;background:var(--surface,#fff);overflow:hidden;min-height:48px}.wa-extra-input input{width:100%;border:0;outline:0;background:transparent;color:inherit;padding:12px;font:inherit;font-size:16px;box-sizing:border-box}.wa-extra-suffix{padding:0 12px;color:var(--muted,#667085);font-size:13px;font-weight:700}.wa-extra-actions{margin-top:16px}.wa-extra-reset{border:1px solid var(--border,#d1d5db);background:transparent;color:inherit;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer}.wa-extra-results{margin-top:20px;border-top:1px solid var(--border,#e5e7eb);padding-top:16px;display:grid;gap:9px}.wa-extra-result{display:flex;justify-content:space-between;gap:16px;padding:13px 14px;border-radius:12px;background:var(--surface-2,#f8fafc)}.wa-extra-result span{font-size:13px;color:var(--muted,#667085)}.wa-extra-result strong{font-size:17px}.wa-extra-result.positive strong{color:#087443}.wa-extra-result.negative strong{color:#b42318}.wa-extra-error{min-height:18px;margin-top:9px;color:#b42318;font-size:13px;font-weight:650}@media(max-width:680px){.wa-extra-grid{grid-template-columns:1fr}.wa-extra-card{padding:16px}.wa-extra-result{flex-direction:column;gap:4px}}';
    document.head.appendChild(s);
  }

  function mount(calc) {
    var host = document.getElementById('calc-widget');
    if (!host || !calc || !calc.fields) return false;
    if (host.getAttribute('data-wa-extra-mounted') === calc.id && host.querySelector('input[type="number"]')) return true;
    styles();
    host.setAttribute('data-wa-extra-mounted', calc.id);
    var html = '<section class="wa-extra-card" aria-label="'+esc(calc.title)+'"><div class="wa-extra-grid">';
    calc.fields.forEach(function(f){ html += '<div class="wa-extra-field"><label for="wa-extra-'+esc(f.id)+'">'+esc(f.label)+'</label><div class="wa-extra-input"><input id="wa-extra-'+esc(f.id)+'" type="number" inputmode="decimal" value="'+esc(f.default)+'" min="'+esc(f.min == null ? '' : f.min)+'" max="'+esc(f.max == null ? '' : f.max)+'" step="'+esc(f.step == null ? 'any' : f.step)+'"><span class="wa-extra-suffix">'+esc(f.suffix || '')+'</span></div></div>'; });
    html += '</div><div class="wa-extra-error" id="wa-extra-error" aria-live="polite"></div><div class="wa-extra-actions"><button type="button" class="wa-extra-reset" id="wa-extra-reset">Reset to defaults</button></div><div class="wa-extra-results" id="wa-extra-results" aria-live="polite"></div></section>';
    host.innerHTML = html;

    var error = document.getElementById('wa-extra-error'), results = document.getElementById('wa-extra-results');
    function calculate(){
      var values = {};
      calc.fields.forEach(function(f){ values[f.id] = Number(document.getElementById('wa-extra-'+f.id).value); });
      if (Object.keys(values).some(function(k){return !isFinite(values[k]);})) { error.textContent='Please enter a valid number in every field.'; results.innerHTML=''; return; }
      try {
        var rows = calc.compute(values) || [];
        error.textContent='';
        results.innerHTML=rows.map(function(r,i){var cls=r.emphasis==='positive'?' positive':r.emphasis==='negative'?' negative':(i===0?' primary':'');return '<div class="wa-extra-result'+cls+'"><span>'+esc(r.label)+'</span><strong>'+esc(format(r.value,r.format))+'</strong></div>';}).join('');
      } catch(e) { error.textContent='Calculation error. Please check the values.'; results.innerHTML=''; }
    }
    calc.fields.forEach(function(f){ var el=document.getElementById('wa-extra-'+f.id); el.addEventListener('input',calculate); el.addEventListener('change',calculate); });
    document.getElementById('wa-extra-reset').addEventListener('click',function(){calc.fields.forEach(function(f){document.getElementById('wa-extra-'+f.id).value=f.default;});calculate();});
    calculate();
    return true;
  }

  window.mountExtraCalculator = function(calc){ return mount(calc); };

  function boot(){
    var key=getKey(), calc=getCatalog()[key];
    if (!calc) return;
    var attempts=0;
    function ensure(){
      var host=document.getElementById('calc-widget');
      if (!host) { if(attempts++<40) setTimeout(ensure,100); return; }
      if (!host.querySelector('input[type="number"]')) mount(calc);
    }
    ensure();
    setTimeout(ensure,250);
    setTimeout(ensure,750);
    setTimeout(ensure,1500);
    if (window.MutationObserver) {
      var host=document.getElementById('calc-widget');
      if(host){ new MutationObserver(function(){ if(!host.querySelector('input[type="number"]')) mount(calc); }).observe(host,{childList:true}); }
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();