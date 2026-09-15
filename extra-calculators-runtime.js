/* Wealth Arrays — isolated runtime for expansion calculators.
   These calculators own their UI. They deliberately do not use widget.js,
   because widget.js expects a calculator registry entry and can leave an
   expansion page blank when no registry entry exists. */
(function () {
  'use strict';

  const STYLE_ID = 'wa-extra-calculator-styles';
  const currencySymbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹' };

  function symbol() {
    const select = document.getElementById('currency-select');
    return currencySymbols[select && select.value] || '₹';
  }

  function format(value, formatType) {
    const n = Number(value);
    if (!Number.isFinite(n)) return '—';
    if (formatType === 'percent') return n.toFixed(2) + '%';
    if (formatType === 'years') return n.toFixed(1) + ' yrs';
    if (formatType === 'number') return Math.round(n).toLocaleString('en-IN');
    return symbol() + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .wa-extra-card{border:1px solid var(--border,#e5e7eb);background:var(--surface,#fff);border-radius:22px;padding:24px;box-shadow:0 14px 40px rgba(15,23,42,.07)}
      .wa-extra-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
      .wa-extra-field{display:flex;flex-direction:column;gap:7px}
      .wa-extra-field label{font-size:13px;font-weight:750;color:var(--text,#111827)}
      .wa-extra-input{display:flex;align-items:center;border:1px solid var(--border,#d1d5db);border-radius:12px;background:var(--surface,#fff);overflow:hidden;min-height:48px}
      .wa-extra-input input{width:100%;border:0;outline:0;background:transparent;color:inherit;padding:12px 13px;font:inherit;font-size:16px;min-width:0;box-sizing:border-box}
      .wa-extra-suffix{padding:0 12px;color:var(--muted,#667085);font-size:13px;font-weight:700;white-space:nowrap}
      .wa-extra-actions{display:flex;gap:10px;align-items:center;margin-top:18px;flex-wrap:wrap}
      .wa-extra-reset{border:1px solid var(--border,#d1d5db);background:transparent;color:inherit;border-radius:11px;padding:10px 15px;font-weight:700;cursor:pointer}
      .wa-extra-results{margin-top:22px;border-top:1px solid var(--border,#e5e7eb);padding-top:20px;display:grid;gap:10px}
      .wa-extra-result{display:flex;justify-content:space-between;gap:18px;align-items:center;padding:14px 15px;border-radius:13px;background:var(--surface-2,#f8fafc)}
      .wa-extra-result span{font-size:13px;color:var(--muted,#667085)}
      .wa-extra-result strong{font-size:18px;letter-spacing:-.02em;text-align:right}
      .wa-extra-result.primary{background:color-mix(in srgb,var(--accent,#0d9488) 9%,transparent);border:1px solid color-mix(in srgb,var(--accent,#0d9488) 20%,transparent)}
      .wa-extra-result.positive strong{color:#087443}
      .wa-extra-result.negative strong{color:#b42318}
      .wa-extra-error{margin-top:10px;color:#b42318;font-size:13px;font-weight:650;min-height:18px}
      @media(max-width:680px){.wa-extra-card{padding:17px;border-radius:17px}.wa-extra-grid{grid-template-columns:1fr}.wa-extra-result{align-items:flex-start;flex-direction:column;gap:5px}.wa-extra-result strong{text-align:left}}
    `;
    document.head.appendChild(style);
  }

  function renderField(field) {
    const suffix = field.suffix ? '<span class="wa-extra-suffix">' + esc(field.suffix) + '</span>' : '';
    return '<div class="wa-extra-field"><label for="wa-extra-' + esc(field.id) + '">' + esc(field.label) + '</label>' +
      '<div class="wa-extra-input"><input id="wa-extra-' + esc(field.id) + '" type="number" inputmode="decimal" value="' + esc(field.default) + '" min="' + esc(field.min ?? '') + '" max="' + esc(field.max ?? '') + '" step="' + esc(field.step ?? 'any') + '" autocomplete="off">' + suffix + '</div></div>';
  }

  function mount(calc, id) {
    const host = document.getElementById(id);
    if (!host || !calc || !Array.isArray(calc.fields)) return false;
    injectStyles();
    host.innerHTML = '<section class="wa-extra-card" aria-label="' + esc(calc.title) + '">' +
      '<div class="wa-extra-grid">' + calc.fields.map(renderField).join('') + '</div>' +
      '<div class="wa-extra-error" id="' + esc(id) + '-error" aria-live="polite"></div>' +
      '<div class="wa-extra-actions"><button class="wa-extra-reset" type="button" id="' + esc(id) + '-reset">Reset to defaults</button></div>' +
      '<div class="wa-extra-results" id="' + esc(id) + '-results" aria-live="polite"></div>' +
      '</section>';

    const inputs = calc.fields.map(function (field) { return document.getElementById('wa-extra-' + field.id); });
    const error = document.getElementById(id + '-error');
    const results = document.getElementById(id + '-results');

    function readValues() {
      const values = {};
      calc.fields.forEach(function (field) {
        values[field.id] = Number(document.getElementById('wa-extra-' + field.id).value);
      });
      return values;
    }

    function calculate() {
      error.textContent = '';
      const values = readValues();
      if (Object.values(values).some(function (v) { return !Number.isFinite(v); })) {
        error.textContent = 'Please enter a valid number in every field.';
        results.innerHTML = '';
        return;
      }
      try {
        const rows = calc.compute(values) || [];
        results.innerHTML = rows.map(function (row, index) {
          const emphasis = row.emphasis === 'positive' ? ' positive' : row.emphasis === 'negative' ? ' negative' : index === 0 ? ' primary' : '';
          return '<div class="wa-extra-result' + emphasis + '"><span>' + esc(row.label) + '</span><strong>' + esc(format(row.value, row.format)) + '</strong></div>';
        }).join('');
      } catch (e) {
        error.textContent = 'We could not calculate that scenario. Please check your inputs.';
        results.innerHTML = '';
        console.error('Wealth Arrays expansion calculator error', e);
      }
    }

    inputs.forEach(function (input) {
      if (input) {
        input.addEventListener('input', calculate);
        input.addEventListener('change', calculate);
      }
    });
    const reset = document.getElementById(id + '-reset');
    if (reset) reset.addEventListener('click', function () {
      calc.fields.forEach(function (field) { document.getElementById('wa-extra-' + field.id).value = field.default; });
      calculate();
    });
    window.addEventListener('wa-currency', calculate);
    calculate();
    return true;
  }

  window.mountExtraCalculator = mount;

  function autoMount() {
    const host = document.getElementById('calc-widget');
    const catalog = window.WA_EXTRA_CALCULATORS || {};
    if (!host) return;

    let key = host.getAttribute('data-wa-extra-calculator');
    if (!key) {
      const path = window.location.pathname;
      if (path.endsWith('/step-up-sip-calculator.html')) key = 'step-up-sip';
      else if (path.endsWith('/emergency-fund-calculator.html')) key = 'emergency-fund';
      else if (path.endsWith('/real-return-calculator.html')) key = 'real-return';
    }
    if (key && catalog[key]) mount(catalog[key], 'calc-widget');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoMount, { once: true });
  } else {
    autoMount();
  }
})();