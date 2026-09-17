/* Wealth Arrays calculator search — one owner for calculator-page suggestions. */
(function () {
  'use strict';
  if (window.__WA_CALCULATOR_SEARCH_LOADED__) return;
  window.__WA_CALCULATOR_SEARCH_LOADED__ = true;

  const CATALOG = [
    ['SIP Calculator','/sip-calculator/','Monthly investing and projected wealth.','sip systematic investment plan monthly mutual fund investing'],
    ['Compound Interest','/compound-interest-calculator/','See how compounding changes growth over time.','compound interest compounding savings growth investing'],
    ['Mortgage / EMI','/mortgage-emi-calculator/','Estimate monthly payment and total interest.','mortgage emi home loan loan payment interest'],
    ['ROI Calculator','/roi-calculator/','Measure total and annualized investment return.','roi return investment profit annualized'],
    ['Simple Interest','/simple-interest-calculator/','Calculate flat interest on principal.','simple interest banking loan deposit'],
    ['Retirement Calculator','/retirement-calculator/','Estimate a financial-independence target.','retirement fire pension financial independence goal'],
    ['Salary to Hourly','/salary-to-hourly-calculator/','Convert annual salary and hourly pay.','salary hourly wage income pay'],
    ['Profit Margin','/profit-margin-calculator/','Calculate revenue, cost and margin.','profit margin business revenue cost'],
    ['Fixed Deposit','/fixed-deposit-calculator/','Project deposit growth and maturity value.','fixed deposit fd banking maturity interest'],
    ['Recurring Deposit','/recurring-deposit-calculator/','Plan monthly deposits and maturity value.','recurring deposit rd monthly banking maturity'],
    ['Lumpsum Calculator','/lumpsum-calculator/','Project a one-time investment.','lumpsum lump sum investment one time'],
    ['CAGR Calculator','/cagr-calculator/','Calculate compound annual growth rate.','cagr compound annual growth rate return'],
    ['Car Loan EMI','/car-loan-calculator/','Plan vehicle-loan payments and interest.','car loan auto vehicle emi repayment'],
    ['Personal Loan','/personal-loan-calculator/','Estimate personal-loan repayment cost.','personal loan emi payment repayment'],
    ['Debt Payoff','/debt-payoff-calculator/','Plan a faster route out of debt.','debt payoff repayment credit loan'],
    ['Inflation Calculator','/inflation-calculator/','Understand future purchasing power.','inflation future value purchasing power prices'],
    ['Net Worth','/net-worth-calculator/','Track assets minus liabilities.','net worth assets liabilities wealth'],
    ['Overtime Pay','/overtime-pay-calculator/','Estimate overtime earnings.','overtime pay salary wage income'],
    ['Freelance Rate','/freelance-rate-calculator/','Turn target income into an hourly rate.','freelance rate hourly pricing business income'],
    ['Income Tax Scenario Calculator','/income-tax-scenario-calculator/','Explore tax scenarios using an effective-rate assumption.','income tax tax scenario effective rate planning']
  ];

  const ALIASES = {
    sip:'systematic investment plan monthly mutual fund', emi:'mortgage home loan monthly payment', fd:'fixed deposit banking', rd:'recurring deposit monthly banking', roi:'return investment profit', cagr:'compound annual growth return', tax:'income tax scenario', salary:'hourly wage income', loan:'mortgage personal car debt', retirement:'pension financial independence', inflation:'purchasing power future prices', lumpsum:'lump sum investment one time', networth:'assets liabilities wealth', 'net worth':'assets liabilities wealth', 'compound interest':'compounding growth', 'simple interest':'flat interest', 'profit margin':'business revenue cost margin', 'car loan':'vehicle loan emi', 'personal loan':'loan repayment', freelance:'freelance rate hourly pricing', overtime:'overtime pay salary'
  };

  const normalize = value => String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  function scoreCalculator(calc, query) {
    const title = normalize(calc[0]);
    const slug = normalize(calc[1]);
    const keywords = normalize(calc[3]);
    const description = normalize(calc[2]);
    const aliasText = normalize(ALIASES[query] || '');
    if (!query) return 0;
    let score = 0;
    if (title === query) score += 500;
    if (title.includes(query)) score += 250;
    if (slug.includes(query)) score += 180;
    if (keywords.includes(query)) score += 160;
    if (description.includes(query)) score += 60;
    for (const term of normalize(`${query} ${aliasText}`).split(' ').filter(Boolean)) {
      if (term.length > 1 && (title.includes(term) || keywords.includes(term) || slug.includes(term))) score += term === query ? 35 : 8;
    }
    return score;
  }

  function install() {
    if (!document.querySelector('.calc-page')) return;
    let input = document.getElementById('tool-search');
    let box = document.getElementById('tool-search-results');
    if (!input || !box) return;

    const replacement = input.cloneNode(true);
    const replacementBox = box.cloneNode(false);
    replacement.id = 'tool-search';
    replacementBox.id = 'tool-search-results';
    replacementBox.className = 'tool-search-results';
    replacementBox.hidden = true;
    input.replaceWith(replacement);
    box.replaceWith(replacementBox);
    input = replacement;
    box = replacementBox;
    input.dataset.waSearchOwner = 'calculator-search';

    const shell = input.closest('.tool-search-shell,.search-bar,.calc-page');
    if (shell) {
      shell.style.position = 'relative';
      shell.style.zIndex = '1000';
      shell.style.overflow = 'visible';
    }
    box.style.position = 'absolute';
    box.style.top = 'calc(100% + 8px)';
    box.style.left = '0';
    box.style.right = '0';
    box.style.width = '100%';
    box.style.zIndex = '9999';
    box.style.maxHeight = '350px';
    box.style.overflowY = 'auto';
    box.style.overflowX = 'hidden';
    box.style.background = 'var(--surface,#fff)';
    box.style.border = '1px solid var(--line,#e2e6ed)';
    box.style.borderRadius = '14px';
    box.style.boxShadow = '0 10px 25px rgba(0,0,0,.15)';

    const render = () => {
      const query = input.value.toLowerCase().trim();
      const normalizedQuery = normalize(query);
      if (!normalizedQuery) {
        box.innerHTML = '';
        box.hidden = true;
        box.style.display = 'none';
        return;
      }

      const results = CATALOG
        .map(calc => ({ calc, score: scoreCalculator(calc, normalizedQuery) }))
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);

      box.innerHTML = results.length
        ? results.map(({ calc }) => `<a class="wa-search-suggestion" href="${escapeHtml(calc[1])}"><span><strong>${escapeHtml(calc[0])}</strong><small>${escapeHtml(calc[2])}</small></span><b aria-hidden="true">→</b></a>`).join('')
        : '<div class="tool-search-empty">No calculator found. Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';

      box.hidden = false;
      box.style.setProperty('display', 'block', 'important');
    };

    ['input', 'search'].forEach(type => input.addEventListener(type, render));
    input.addEventListener('keyup', render);
    input.addEventListener('focus', render);
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        box.hidden = true;
        box.style.display = 'none';
        input.blur();
      }
    });
    document.addEventListener('click', event => {
      if (!input.contains(event.target) && !box.contains(event.target)) {
        box.hidden = true;
        box.style.display = 'none';
      }
    });

    window.WA_CALCULATOR_SEARCH_CATALOG = CATALOG;
    window.__WA_SEARCH_READY__ = true;
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
