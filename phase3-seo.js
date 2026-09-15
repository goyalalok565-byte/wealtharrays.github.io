/* Wealth Arrays Phase 3 — SEO, topic-cluster and internal-linking runtime. */
(() => {
  'use strict';
  if (window.__WA_PHASE3_SEO__) return;
  window.__WA_PHASE3_SEO__ = true;

  const C = 'https://wealtharrays.com';
  const calculators = {
    sip: ['SIP Calculator', '/sip-calculator.html'], 'compound-interest': ['Compound Interest Calculator', '/compound-interest-calculator.html'],
    mortgage: ['Mortgage / Loan EMI Calculator', '/mortgage-emi-calculator.html'], roi: ['ROI Calculator', '/roi-calculator.html'],
    'simple-interest': ['Simple Interest Calculator', '/simple-interest-calculator.html'], 'freedom-milestone': ['Retirement Calculator', '/retirement-calculator.html'],
    'salary-conversion': ['Salary to Hourly Calculator', '/salary-to-hourly-calculator.html'], 'profit-margin': ['Profit Margin Calculator', '/profit-margin-calculator.html'],
    'fixed-deposit': ['Fixed Deposit Calculator', '/fixed-deposit-calculator.html'], 'recurring-deposit': ['Recurring Deposit Calculator', '/recurring-deposit-calculator.html'],
    lumpsum: ['Lumpsum Calculator', '/lumpsum-calculator.html'], cagr: ['CAGR Calculator', '/cagr-calculator.html'],
    'car-loan': ['Car Loan Calculator', '/car-loan-calculator.html'], 'personal-loan': ['Personal Loan Calculator', '/personal-loan-calculator.html'],
    'debt-payoff': ['Debt Payoff Calculator', '/debt-payoff-calculator.html'], inflation: ['Inflation Calculator', '/inflation-calculator.html'],
    'net-worth': ['Net Worth Calculator', '/net-worth-calculator.html'], overtime: ['Overtime Pay Calculator', '/overtime-pay-calculator.html'],
    'freelance-rate': ['Freelance Rate Calculator', '/freelance-rate-calculator.html'], 'income-tax-scenario': ['Income Tax Scenario Calculator', '/income-tax-scenario-calculator.html']
  };
  const guides = {
    sip: ['SIP Calculator Guide', '/articles/sip-calculator-guide.html'], compound: ['Compound Interest Guide', '/articles/compound-interest-guide.html'],
    loan: ['EMI & Loan Payments Guide', '/articles/loan-emi-guide.html'], roi: ['ROI vs Annualized Return Guide', '/articles/roi-guide.html'],
    debt: ['How to Use a Debt Payoff Calculator', '/articles/how-to-use-a-debt-payoff-calculator.html'], retirement: ['How to Stress-Test a Retirement Goal', '/articles/how-to-stress-test-a-retirement-goal.html'],
    inflation: ['How to Use an Inflation Calculator', '/articles/how-to-use-an-inflation-calculator.html'], networth: ['How to Use a Net Worth Calculator', '/articles/how-to-use-a-net-worth-calculator.html'],
    salary: ['How to Use a Salary-to-Hourly Calculator', '/articles/how-to-use-a-salary-to-hourly-calculator.html'], cagr: ['When CAGR Can Mislead You', '/articles/when-cagr-can-mislead-you.html'],
    scenario: ['How to Compare SIP Scenarios Properly', '/articles/how-to-compare-sip-scenarios-properly.html'], calculator: ['How to Use a Financial Calculator Without Fooling Yourself', '/articles/how-to-use-financial-calculators.html']
  };
  const clusters = {
    sip: [calculators.lumpsum, calculators['compound-interest'], guides.sip, guides.scenario],
    'compound-interest': [calculators.sip, calculators.lumpsum, calculators['fixed-deposit'], guides.compound],
    mortgage: [calculators['car-loan'], calculators['personal-loan'], calculators['debt-payoff'], guides.loan],
    'car-loan': [calculators.mortgage, calculators['personal-loan'], calculators['debt-payoff'], guides.loan],
    'personal-loan': [calculators.mortgage, calculators['debt-payoff'], calculators['car-loan'], guides.loan],
    roi: [calculators.cagr, calculators.sip, calculators.lumpsum, guides.roi],
    cagr: [calculators.roi, calculators['compound-interest'], calculators.sip, guides.cagr],
    'debt-payoff': [calculators.mortgage, calculators['personal-loan'], calculators['car-loan'], guides.debt],
    inflation: [calculators.sip, calculators['compound-interest'], calculators['freedom-milestone'], guides.inflation],
    'freedom-milestone': [calculators.sip, calculators['net-worth'], calculators.inflation, guides.retirement],
    'net-worth': [calculators['debt-payoff'], calculators['freedom-milestone'], calculators.roi, guides.networth],
    'salary-conversion': [calculators.overtime, calculators['freelance-rate'], guides.salary],
    'freelance-rate': [calculators['salary-conversion'], calculators['profit-margin'], calculators.roi],
    'profit-margin': [calculators.roi, calculators['freelance-rate']], 'fixed-deposit': [calculators['recurring-deposit'], calculators['compound-interest'], calculators.sip],
    'recurring-deposit': [calculators['fixed-deposit'], calculators.sip, calculators['compound-interest']], lumpsum: [calculators.sip, calculators['compound-interest'], calculators.roi],
    'simple-interest': [calculators['compound-interest'], calculators['fixed-deposit']], overtime: [calculators['salary-conversion'], calculators['freelance-rate']],
    'income-tax-scenario': [calculators['salary-conversion'], calculators['freelance-rate']]
  };

  const path = location.pathname.replace(/\/+$/, '') || '/';
  const file = path.split('/').pop() || 'index.html';
  const id = Object.keys(calculators).find(k => file === calculators[k][1].slice(1));
  const root = document.querySelector('main');
  if (!root) return;

  function abs(href) { return href.startsWith('/') ? C + href : new URL(href, location.href).href; }
  function addMeta(name, content, property = false) {
    if (!content) return;
    const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
    if (!document.head.querySelector(selector)) {
      const m = document.createElement('meta');
      if (property) m.setAttribute('property', name); else m.setAttribute('name', name);
      m.content = content; document.head.appendChild(m);
    }
  }
  function schemaOnce(type, data) {
    const existing = [...document.querySelectorAll('script[type="application/ld+json"]')].some(s => {
      try { return JSON.parse(s.textContent || '{}')['@type'] === type; } catch { return false; }
    });
    if (existing) return;
    const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(data); document.head.appendChild(s);
  }
  function uniqueLinks(items) {
    const seen = new Set([location.pathname]);
    return items.filter(x => x && x[1] && !seen.has(x[1]) && !seen.add(x[1])).slice(0, 5);
  }
  function renderCluster(title, items) {
    const clean = uniqueLinks(items);
    if (!clean.length || root.querySelector('[data-wa-phase3-cluster]')) return;
    const section = document.createElement('section');
    section.dataset.waPhase3Cluster = 'true'; section.className = 'wa-phase3-cluster'; section.setAttribute('aria-labelledby', 'wa-phase3-cluster-title');
    section.innerHTML = `<div class="wa-phase3-kicker">NEXT STEPS</div><h2 id="wa-phase3-cluster-title">${title}</h2><p>Continue with a closely related calculator or guide so you can test the assumptions behind the result.</p><div class="wa-phase3-links"></div>`;
    const box = section.querySelector('.wa-phase3-links');
    clean.forEach(([label, href]) => { const a = document.createElement('a'); a.href = href; a.className = 'wa-phase3-link'; a.textContent = label; box.appendChild(a); });
    root.appendChild(section);
  }

  addMeta('robots', 'index,follow'); addMeta('author', 'Wealth Arrays'); addMeta('publisher', 'Wealth Arrays');
  addMeta('og:site_name', 'Wealth Arrays', true); addMeta('og:type', path.startsWith('/articles/') ? 'article' : 'website', true);
  addMeta('og:title', document.title, true); addMeta('og:description', document.querySelector('meta[name="description"]')?.content || '', true);
  addMeta('og:url', location.href.split('#')[0], true); addMeta('og:image', `${C}/og-image.png`, true);
  addMeta('twitter:card', 'summary_large_image'); addMeta('twitter:title', document.title); addMeta('twitter:description', document.querySelector('meta[name="description"]')?.content || ''); addMeta('twitter:image', `${C}/og-image.png`);

  if (id) {
    renderCluster('Related calculators and guides', clusters[id] || []);
    schemaOnce('WebApplication', { '@context':'https://schema.org', '@type':'WebApplication', name:document.title.replace(/\s*\|.*$/,''), applicationCategory:'FinanceApplication', operatingSystem:'Web', url:abs(path), publisher:{'@type':'Organization',name:'Wealth Arrays',url:C+'/' } });
  } else if (path.startsWith('/articles/')) {
    const article = document.querySelector('article') || root.querySelector('article');
    const h1 = article?.querySelector('h1')?.textContent?.trim() || document.title.replace(/\s*\|.*$/,'');
    const description = document.querySelector('meta[name="description"]')?.content || '';
    schemaOnce('Article', { '@context':'https://schema.org','@type':'Article',headline:h1,description,author:{'@type':'Organization',name:'Wealth Arrays',url:C+'/about.html'},publisher:{'@type':'Organization',name:'Wealth Arrays',url:C+'/'},mainEntityOfPage:location.href.split('#')[0],dateModified:'2026-09-15' });
    renderCluster('Related tools and reading', [guides.calculator, calculators.sip, calculators['compound-interest'], calculators.mortgage, calculators.inflation]);
  } else if (path.startsWith('/category-')) {
    renderCluster('Explore related calculators and guides', [guides.calculator, calculators.sip, calculators.mortgage, calculators['net-worth'], calculators['compound-interest']]);
  }
})();
