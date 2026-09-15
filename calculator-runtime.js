/* Wealth Arrays calculator-page runtime — shared behavior only. Theme is owned by wa-core.js. */
(function () {
  'use strict';

  const CURRENCIES = [
    ['USD','$','US Dollar'],['EUR','€','Euro'],['JPY','¥','Japanese Yen'],['GBP','£','British Pound'],['AUD','A$','Australian Dollar'],['CAD','C$','Canadian Dollar'],['CHF','CHF','Swiss Franc'],['CNY','CN¥','Chinese Yuan'],['HKD','HK$','Hong Kong Dollar'],['NZD','NZ$','New Zealand Dollar'],['SEK','kr','Swedish Krona'],['KRW','₩','South Korean Won'],['SGD','S$','Singapore Dollar'],['NOK','kr','Norwegian Krone'],['MXN','MX$','Mexican Peso'],['INR','₹','Indian Rupee'],['ZAR','R','South African Rand'],['BRL','R$','Brazilian Real'],['AED','د.إ','UAE Dirham'],['SAR','﷼','Saudi Riyal'],['TRY','₺','Turkish Lira'],['PLN','zł','Polish Zloty'],['THB','฿','Thai Baht'],['IDR','Rp','Indonesian Rupiah'],['MYR','RM','Malaysian Ringgit'],['PHP','₱','Philippine Peso'],['DKK','kr','Danish Krone'],['ILS','₪','Israeli Shekel'],['CZK','Kč','Czech Koruna'],['HUF','Ft','Hungarian Forint']
  ];

  const REVIEWED_ON = '2026-09-15';
  const REVIEW_PROFILES = {
    sip: {
      basis: 'Monthly annuity-due compounding: contributions are assumed at the beginning of each month.',
      assumptions: 'Expected return and inflation are planning assumptions, not forecasts or guarantees. Fees and taxes are not modeled.',
      source: 'Standard future-value formula for an annuity due; methodology and formula are published on Wealth Arrays.'
    },
    'compound-interest': {
      basis: 'Standard compound-growth formula A = P(1 + r/n)^(nt).',
      assumptions: 'The entered rate and compounding frequency are held constant for the full term. Inflation is modeled separately.',
      source: 'Standard compound-interest mathematics; methodology and formula are published on Wealth Arrays.'
    },
    mortgage: {
      basis: 'Fixed-rate amortizing loan with equal monthly payments; the zero-rate case is handled separately.',
      assumptions: 'Rate is assumed fixed for the full term. Fees, insurance, taxes and variable-rate changes are excluded.',
      source: 'Standard loan-amortization / EMI formula; methodology and formula are published on Wealth Arrays.'
    },
    roi: {
      basis: 'Total ROI plus annualized ROI (CAGR-style) from the entered cost, final value and holding period.',
      assumptions: 'Cash flows, fees, taxes and interim contributions are not modeled unless reflected in the inputs.',
      source: 'Standard ROI and annualized-growth mathematics; methodology and formula are published on Wealth Arrays.'
    },
    'simple-interest': {
      basis: 'Simple interest is calculated only on the original principal.',
      assumptions: 'The annual rate remains constant and interest does not compound.',
      source: 'Standard simple-interest formula; methodology and formula are published on Wealth Arrays.'
    },
    'freedom-milestone': {
      basis: 'Target corpus = annual spending ÷ chosen withdrawal rate.',
      assumptions: 'The withdrawal rate is a planning heuristic, not a guarantee of portfolio survival. The default 4% rule is historical research, not a promise.',
      source: 'Historical withdrawal-rate research and the commonly cited 4% rule; Wealth Arrays presents it as a planning estimate only.'
    },
    'salary-hourly': {
      basis: 'Annual salary and hourly pay are converted using hours worked per week and working weeks per year.',
      assumptions: 'Amounts are gross/pre-tax. Working weeks and hours are user assumptions; benefits, overtime and taxes are excluded.',
      source: 'Direct unit-conversion mathematics; methodology and assumptions are published on Wealth Arrays.'
    },
    'profit-margin': {
      basis: 'Gross and net margin are calculated as profit divided by revenue.',
      assumptions: 'Negative margins are valid when costs exceed revenue. No industry benchmark is implied by the calculation.',
      source: 'Standard accounting margin formulas; methodology and assumptions are published on Wealth Arrays.'
    },
    'fixed-deposit': {
      basis: 'One-time deposit compounded at the selected annual rate and frequency.',
      assumptions: 'This is a planning estimate, not a bank maturity quote. Taxes, TDS, fees, payout conventions and institution-specific rules are excluded.',
      source: 'Standard compound-growth mathematics; bank-specific terms must be checked with the institution.'
    },
    'recurring-deposit': {
      basis: 'Equal monthly deposits compounded monthly, with deposits modeled at the end of each month.',
      assumptions: 'The selected term is converted to a whole number of monthly deposits. Actual bank RD conventions can differ.',
      source: 'Standard future-value formula for recurring end-of-month deposits; bank-specific terms are not modeled.'
    },
    lumpsum: {
      basis: 'One-time investment compounded annually at the entered expected return.',
      assumptions: 'Return and inflation are constant planning assumptions. Taxes, fees and cash-flow timing are excluded.',
      source: 'Standard compound-growth mathematics; methodology and assumptions are published on Wealth Arrays.'
    },
    cagr: {
      basis: 'CAGR annualizes the change between a starting value and ending value over the entered period.',
      assumptions: 'CAGR is a mathematical annualized rate; it does not describe the path taken between the start and end values.',
      source: 'Standard CAGR formula; methodology and assumptions are published on Wealth Arrays.'
    },
    'car-loan': {
      basis: 'Fixed-rate monthly loan amortization after subtracting the down payment.',
      assumptions: 'The rate is held constant. Taxes, registration, insurance, fees and lender-specific charges are excluded unless included in price.',
      source: 'Standard loan-amortization / EMI mathematics.'
    },
    'personal-loan': {
      basis: 'Fixed-rate monthly loan amortization over the entered repayment term.',
      assumptions: 'The rate is held constant and the payment schedule is monthly. Fees and penalties are excluded.',
      source: 'Standard loan-amortization / EMI mathematics.'
    },
    'debt-payoff': {
      basis: 'Monthly balance evolution using the entered interest rate and fixed payment; payoff months are rounded up to a whole month.',
      assumptions: 'The payment must exceed monthly interest for the balance to decline. New borrowing, fees and payment changes are excluded.',
      source: 'Standard amortization and debt-payoff mathematics.'
    },
    inflation: {
      basis: 'Future cost = current cost × (1 + inflation rate)^years.',
      assumptions: 'Inflation is held constant for planning. This is not an inflation forecast.',
      source: 'Standard purchasing-power / compound-inflation mathematics.'
    },
    'net-worth': {
      basis: 'Net worth = total assets − total liabilities.',
      assumptions: 'Only the categories entered are included. Valuation, taxes on sale and hidden liabilities are not independently verified.',
      source: 'Standard balance-sheet identity.'
    },
    overtime: {
      basis: 'Regular pay plus hourly rate × overtime hours × overtime multiplier.',
      assumptions: 'This is gross pay. Labor-law rules, taxes, premiums and employer-specific overtime policies are not inferred.',
      source: 'Direct pay-rate arithmetic; local employment rules may differ.'
    },
    'freelance-rate': {
      basis: 'Required annual income plus expenses divided by annual billable hours.',
      assumptions: 'Only billable hours are used as the denominator. Taxes, benefits, bad debt, payment fees and business volatility are not modeled unless included in expenses.',
      source: 'Direct annual-income and billable-hours arithmetic.'
    },
    'income-tax-planner': {
      basis: 'Estimated tax = (gross income − deductions) × user-entered effective tax rate.',
      assumptions: 'This is deliberately jurisdiction-neutral. It uses no country tax brackets, tax-year tables, credits or filing rules and must not be used as a tax filing calculation.',
      source: 'User-supplied planning assumption only; verify actual liability with the relevant tax authority or qualified tax professional.'
    }
  };

  window.WA = window.WA || {};
  window.WA.currencies = CURRENCIES;
  window.WA.phase1ReviewedOn = REVIEWED_ON;
  window.WA.phase1ReviewProfiles = REVIEW_PROFILES;

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

  function injectReviewStyles() {
    if (document.getElementById('wa-phase1-review-css')) return;
    const style = document.createElement('style');
    style.id = 'wa-phase1-review-css';
    style.textContent = '.wa-phase1-review{margin-top:16px;border:1px solid var(--line);border-radius:16px;background:var(--surface2);padding:16px}.wa-phase1-review .eyebrow{font-size:9px;letter-spacing:.14em;font-weight:850;color:var(--accent);margin-bottom:5px}.wa-phase1-review h3{margin:0 0 6px;font-size:15px}.wa-phase1-review p{margin:7px 0;color:var(--muted);font-size:11px;line-height:1.55}.wa-phase1-review strong{color:var(--text)}.wa-phase1-review .review-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px}.wa-phase1-review .review-item{border-top:1px solid var(--line);padding-top:9px}.wa-phase1-review .review-item b{display:block;font-size:10px;margin-bottom:2px;color:var(--text)}@media(max-width:650px){.wa-phase1-review .review-grid{grid-template-columns:1fr}}';
    document.head.appendChild(style);
  }

  function currentCalculator() {
    const list = getCalculators();
    if (!list) return null;
    const file = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
    return list.find(c => c.slug === file) || null;
  }

  function injectReviewPanel() {
    const calc = currentCalculator();
    const education = document.getElementById('calc-widget')?.querySelector('.wa-education');
    if (!calc || !education || education.querySelector('.wa-phase1-review')) return;
    const profile = REVIEW_PROFILES[calc.id] || {
      basis: 'The calculator uses an explicit mathematical relationship between the values entered.',
      assumptions: 'Results are estimates and depend on the assumptions entered.',
      source: 'Formula and limitations are described in the Wealth Arrays methodology.'
    };
    const panel = document.createElement('section');
    panel.className = 'wa-phase1-review';
    panel.setAttribute('aria-label', 'Calculator review and assumptions');
    panel.innerHTML = '<div class="eyebrow">CALCULATOR REVIEW</div>'
      + '<h3>Formula & assumptions checked</h3>'
      + '<p><strong>Last reviewed:</strong> ' + REVIEWED_ON + ' · <strong>Publisher:</strong> Wealth Arrays</p>'
      + '<div class="review-grid">'
      + '<div class="review-item"><b>Calculation basis</b><span>' + escapeHtml(profile.basis) + '</span></div>'
      + '<div class="review-item"><b>Important assumptions</b><span>' + escapeHtml(profile.assumptions) + '</span></div>'
      + '</div>'
      + '<p><strong>Source / review note:</strong> ' + escapeHtml(profile.source) + ' See the <a href="methodology.html">methodology</a> and <a href="editorial-policy.html">editorial standards</a>. Corrections can be reported via <a href="contact.html">Contact</a>.</p>';
    education.appendChild(panel);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function sync() {
    normalizeDefinitions();
    applyCurrency();
    removeCapsFromRenderedInputs();
    injectReviewStyles();
    injectReviewPanel();
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
        injectReviewPanel();
      });
      observer.observe(target, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
