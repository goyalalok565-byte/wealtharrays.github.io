/* Wealth Arrays calculator-page runtime — shared behavior only. Theme is owned by wa-core.js. */
(function () {
  'use strict';

  const CURRENCIES = [
    ['USD','$','US Dollar'],['EUR','€','Euro'],['JPY','¥','Japanese Yen'],['GBP','£','British Pound'],['AUD','A$','Australian Dollar'],['CAD','C$','Canadian Dollar'],['CHF','CHF','Swiss Franc'],['CNY','CN¥','Chinese Yuan'],['HKD','HK$','Hong Kong Dollar'],['NZD','NZ$','New Zealand Dollar'],['SEK','kr','Swedish Krona'],['KRW','₩','South Korean Won'],['SGD','S$','Singapore Dollar'],['NOK','kr','Norwegian Krone'],['MXN','MX$','Mexican Peso'],['INR','₹','Indian Rupee'],['ZAR','R','South African Rand'],['BRL','R$','Brazilian Real'],['AED','د.إ','UAE Dirham'],['SAR','﷼','Saudi Riyal'],['TRY','₺','Turkish Lira'],['PLN','zł','Polish Zloty'],['THB','฿','Thai Baht'],['IDR','Rp','Indonesian Rupiah'],['MYR','RM','Malaysian Ringgit'],['PHP','₱','Philippine Peso'],['DKK','kr','Danish Krone'],['ILS','₪','Israeli Shekel'],['CZK','Kč','Czech Koruna'],['HUF','Ft','Hungarian Forint']
  ];

  window.WA = window.WA || {};
  window.WA.currencies = CURRENCIES;

  function storageGet(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch (_) { return fallback; }
  }
  function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  }

  function getCalculators() {
    try { return (typeof CALCULATORS !== 'undefined' && Array.isArray(CALCULATORS)) ? CALCULATORS : null; }
    catch (_) { return null; }
  }

  function normalizeDefinitions() {
    const list = getCalculators();
    if (!list) return false;
    list.forEach(calc => {
      (calc.fields || []).forEach(field => {
        const id = String(field.id || '').toLowerCase();
        const label = String(field.label || '').toLowerCase();
        const isRate = id === 'rate' || id.includes('return') || label.includes('annual return') || label.includes('expected return');
        const isYears = id === 'years' || id.includes('year') || label.includes('period') || label.includes('term') || label.includes('holding');
        if (isRate && typeof field.max === 'number' && field.max < 1000) field.max = 1000;
        if (isYears && typeof field.max === 'number' && field.max < 200) field.max = 200;
      });
    });
    return true;
  }

  function applyCurrency() {
    const select = document.getElementById('currency-select');
    if (!select) return;
    const saved = storageGet('waCurrency', 'INR');
    const current = CURRENCIES.some(x => x[0] === saved) ? saved : 'INR';
    if (select.options.length !== CURRENCIES.length) {
      select.innerHTML = CURRENCIES.map(x => '<option value="' + x[0] + '">' + x[0] + ' · ' + x[1] + ' · ' + x[2] + '</option>').join('');
    }
    if (select.value !== current) select.value = current;
    document.documentElement.dataset.currency = select.value;
    if (!select.dataset.waRuntimeBound) {
      select.dataset.waRuntimeBound = '1';
      select.addEventListener('change', () => {
        storageSet('waCurrency', select.value);
        document.documentElement.dataset.currency = select.value;
        window.dispatchEvent(new CustomEvent('wa-currency', { detail: { currency: select.value } }));
      }, true);
    }
  }

  function removeCapsFromRenderedInputs() {
    document.querySelectorAll('#calc-widget input[type="number"]').forEach(input => {
      const field = input.closest('.field');
      const label = field?.querySelector('label')?.textContent?.toLowerCase() || '';
      const id = (input.id || input.name || '').toLowerCase();
      if (id.includes('rate') || id.includes('return') || label.includes('annual return') || label.includes('expected return')) {
        input.removeAttribute('max');
        input.setAttribute('data-wa-max','1000');
      }
      if (id.includes('year') || label.includes('period') || label.includes('term') || label.includes('holding')) {
        input.removeAttribute('max');
        input.setAttribute('data-wa-max','200');
      }
    });
  }

  function sync() {
    normalizeDefinitions();
    applyCurrency();
    removeCapsFromRenderedInputs();
  }

  function start() {
    sync();
    [0, 25, 100, 250, 500, 1000].forEach(ms => setTimeout(sync, ms));
    const target = document.getElementById('calc-widget') || document.body;
    if (target && !target.dataset.waRuntimeObserver) {
      target.dataset.waRuntimeObserver = '1';
      const observer = new MutationObserver(() => {
        normalizeDefinitions();
        removeCapsFromRenderedInputs();
      });
      observer.observe(target, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
