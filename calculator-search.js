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
    sip:'systematic investment plan monthly mutual fund', emi:'mortgage home loan monthly payment', fd:'fixed deposit banking', rd:'recurring deposit monthly banking', roi:'return investment profit',
    cagr:'compound annual growth return', tax:'income tax scenario', salary:'hourly wage income', loan:'mortgage personal car debt', retirement:'pension financial independence', inflation:'purchasing power future prices',
    lumpsum:'lump sum investment one time', networth:'assets liabilities wealth', 'net worth':'assets liabilities wealth', 'compound interest':'compounding growth', 'simple interest':'flat interest',
    'profit margin':'business revenue cost margin', 'car loan':'vehicle loan emi', 'personal loan':'loan repayment', freelance:'freelance rate hourly pricing', overtime:'overtime pay salary'
  };
  const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  function install() {
    if (!document.querySelector('.calc-page')) return;
    let input = document.getElementById('tool-search');
    let box = document.getElementById('tool-search-results');
    if (!input || !box) {
      const host = document.querySelector('.calc-page');
      const title = host && host.querySelector('.calc-title');
      if (!host) return;
      const shell = document.createElement('div');
      shell.className = 'tool-search-shell wa-calculator-search';
      shell.innerHTML = '<label class="sr-only" for="tool-search">Search calculators</label><input id="tool-search" type="search" autocomplete="off" placeholder="Search any calculator: SIP, EMI, FD, ROI…" aria-label="Search calculators"><div id="tool-search-results" class="tool-search-results" hidden></div>';
      if (title) title.insertAdjacentElement('afterend', shell); else host.insertBefore(shell, host.firstChild);
      input = shell.querySelector('#tool-search');
      box = shell.querySelector('#tool-search-results');
    }
    if (!input || !box || input.dataset.waSearchOwner === 'calculator-search') return;
    input.dataset.waSearchOwner = 'calculator-search';

    const render = () => {
      const query = normalize(input.value);
      if (!query) { box.innerHTML = ''; box.hidden = true; box.style.display = 'none'; return; }
      const expanded = `${query} ${ALIASES[query] || ''}`.trim();
      const terms = expanded.split(/\s+/).filter(Boolean);
      const results = CATALOG.map(item => {
        const hay = normalize(item[0] + ' ' + item[2] + ' ' + item[3]);
        let score = hay.includes(query) ? 100 : 0;
        for (const term of terms) if (term.length > 1 && hay.includes(term)) score += term === query ? 20 : 4;
        return { item, score };
      }).filter(x => x.score > 0).sort((a,b) => b.score - a.score).slice(0, 8);
      box.innerHTML = results.length ? results.map(({item}) => `<a class="wa-search-suggestion" href="${item[1]}"><span><strong>${escapeHtml(item[0])}</strong><small>${escapeHtml(item[2])}</small></span><b aria-hidden="true">→</b></a>`).join('') : '<div class="tool-search-empty">No calculator found. Try SIP, EMI, FD, RD, loan, tax, salary or ROI.</div>';
      box.hidden = false;
      box.style.setProperty('display', 'block', 'important');
    };
    ['input','search','focus'].forEach(type => input.addEventListener(type, render));
    input.addEventListener('keydown', event => { if (event.key === 'Escape') { box.hidden = true; box.style.display = 'none'; input.blur(); } });
    document.addEventListener('click', event => { if (!input.contains(event.target) && !box.contains(event.target)) { box.hidden = true; box.style.display = 'none'; } });
    render();
    window.__WA_SEARCH_READY__ = true;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true }); else install();
})();
