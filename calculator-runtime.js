/* Wealth Arrays calculator-page runtime guard.
   This file is deliberately independent from the homepage runtime.
   It owns only calculator-page controls, safe input ranges, and cache-resistant wiring. */
(function () {
  'use strict';

  const CURRENCIES = [
    ['USD','$','US Dollar'],['EUR','€','Euro'],['JPY','¥','Japanese Yen'],['GBP','£','British Pound'],['AUD','A$','Australian Dollar'],['CAD','C$','Canadian Dollar'],['CHF','CHF','Swiss Franc'],['CNY','CN¥','Chinese Yuan'],['HKD','HK$','Hong Kong Dollar'],['NZD','NZ$','New Zealand Dollar'],['SEK','kr','Swedish Krona'],['KRW','₩','South Korean Won'],['SGD','S$','Singapore Dollar'],['NOK','kr','Norwegian Krone'],['MXN','MX$','Mexican Peso'],['INR','₹','Indian Rupee'],['ZAR','R','South African Rand'],['BRL','R$','Brazilian Real'],['AED','د.إ','UAE Dirham'],['SAR','﷼','Saudi Riyal'],['TRY','₺','Turkish Lira'],['PLN','zł','Polish Zloty'],['THB','฿','Thai Baht'],['IDR','Rp','Indonesian Rupiah'],['MYR','RM','Malaysian Ringgit'],['PHP','₱','Philippine Peso'],['DKK','kr','Danish Krone'],['ILS','₪','Israeli Shekel'],['CZK','Kč','Czech Koruna'],['HUF','Ft','Hungarian Forint']
  ];

  function applyTheme() {
    const root = document.documentElement;
    const button = document.getElementById('theme-toggle');
    const saved = localStorage.getItem('waTheme') === 'dark' ? 'dark' : 'light';
    const apply = (theme) => {
      root.dataset.theme = theme;
      localStorage.setItem('waTheme', theme);
      if (button) {
        button.setAttribute('aria-pressed', String(theme === 'dark'));
        button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        const label = button.querySelector('[data-theme-label]') || document.getElementById('theme-toggle-label');
        if (label) label.textContent = theme === 'dark' ? 'Light' : 'Dark';
      }
    };
    apply(saved);
    if (button) {
      button.onclick = function (event) {
        event.preventDefault();
        apply(root.dataset.theme === 'dark' ? 'light' : 'dark');
      };
    }
  }

  function applyCurrency() {
    const select = document.getElementById('currency-select');
    if (!select) return;
    select.innerHTML = CURRENCIES.map(x => '<option value="' + x[0] + '">' + x[0] + ' · ' + x[1] + ' · ' + x[2] + '</option>').join('');
    const saved = localStorage.getItem('waCurrency') || 'INR';
    select.value = CURRENCIES.some(x => x[0] === saved) ? saved : 'INR';
    document.documentElement.dataset.currency = select.value;
    select.onchange = function () {
      localStorage.setItem('waCurrency', select.value);
      document.documentElement.dataset.currency = select.value;
      window.dispatchEvent(new CustomEvent('wa-currency', { detail: { currency: select.value } }));
    };
  }

  function removeArtificialCaps() {
    // Keep calculator definitions and the rendered controls aligned. This fixes the
    // old 50% / 60-year validation even if a stale calculator definition is cached.
    if (Array.isArray(window.CALCULATORS)) {
      window.CALCULATORS.forEach(calc => {
        (calc.fields || []).forEach(field => {
          const id = String(field.id || '').toLowerCase();
          const label = String(field.label || '').toLowerCase();
          if (id === 'rate' || id.includes('return') || label.includes('annual return') || label.includes('expected return')) {
            if (typeof field.max === 'number' && field.max < 1000) field.max = 1000;
          }
          if (id === 'years' || id.includes('year') || label.includes('period') || label.includes('term') || label.includes('holding')) {
            if (typeof field.max === 'number' && field.max < 200) field.max = 200;
          }
        });
      });
    }
    document.querySelectorAll('#calc-widget input[type="number"]').forEach(input => {
      const label = input.closest('.field')?.querySelector('label')?.textContent?.toLowerCase() || '';
      const id = (input.id || input.name || '').toLowerCase();
      if (id.includes('rate') || id.includes('return') || label.includes('annual return') || label.includes('expected return')) input.max = '1000';
      if (id.includes('year') || label.includes('period') || label.includes('term') || label.includes('holding')) input.max = '200';
    });
  }

  function init() {
    applyCurrency();
    applyTheme();
    removeArtificialCaps();
    // The calculator widget can mount after this runtime. Re-apply caps after mount too.
    setTimeout(removeArtificialCaps, 50);
    setTimeout(removeArtificialCaps, 300);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
