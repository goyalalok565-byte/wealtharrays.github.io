import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const content = JSON.parse(fs.readFileSync(path.join(root, 'calculator-value-content.json'), 'utf8'));
const cases = [
  {
    id: 'sip-calculator',
    route: 'sip-calculator',
    required: [
      'AMFI: Systematic Investment Plan (SIP)',
      'SEBI Investor: Understanding Mutual Funds',
      'SEBI Investor: Riskometer',
      'do not remove market risk'
    ]
  },
  {
    id: 'fixed-deposit-calculator',
    route: 'fixed-deposit-calculator',
    required: [
      'Reserve Bank of India: Master Directions on Interest Rate on Deposits',
      'DICGC: Frequently Asked Questions on Deposit Insurance',
      '₹5 lakh limit per depositor per bank'
    ]
  },
  {
    id: 'recurring-deposit-calculator',
    route: 'recurring-deposit-calculator',
    required: [
      'Reserve Bank of India: Master Directions on Interest Rate on Deposits',
      'DICGC: Frequently Asked Questions on Deposit Insurance',
      '₹5 lakh limit per depositor per bank'
    ]
  },
  {
    id: 'ppf-calculator',
    route: 'ppf-calculator',
    required: ['National Savings Institute: Public Provident Fund Scheme', 'government-notified PPF scheme rules']
  },
  {
    id: 'ssy-calculator',
    route: 'ssy-calculator',
    required: ['National Savings Institute: Sukanya Samriddhi Account Scheme', 'interest rate is notified separately']
  },
  {
    id: 'gst-calculator',
    route: 'gst-calculator',
    required: ['CBIC: GST Rates for Goods and Services', 'CBIC: GST Rates FAQs', 'only performs arithmetic on the rate entered']
  },
  {
    id: 'income-tax-planner',
    route: 'income-tax-planner',
    required: ['Income Tax Department: Income Tax Calculator User Manual', 'does not reproduce slab-wise tax']
  },
  {
    id: 'gratuity-calculator',
    route: 'gratuity-calculator',
    required: ['Ministry of Labour and Employment: Labour Codes and current rules', 'Ministry of Labour and Employment: Additional FAQs on Labour Codes (November 2026)', 'Code on Social Security, 2020 took effect on 21 November 2025', 'not a legal entitlement decision']
  },
  {
    id: 'hra-exemption-calculator',
    route: 'hra-exemption-calculator',
    required: ['Income Tax Department: New Tax Regime vs Old Tax Regime FAQs', 'does not decide regime eligibility']
  },
  {
    id: 'nps-calculator',
    route: 'nps-calculator',
    required: ['PFRDA: NPS All Citizen Model FAQs', 'no assured benefit']
  },
  {
    id: 'epf-calculator',
    route: 'epf-calculator',
    required: ['EPFO: Handbook of EPF Scheme, EPS and EDLI', 'reconcile estimates with payslips']
  },
];

for (const item of cases) {
  const entry = content[item.id];
  if (!entry || !Array.isArray(entry.references) || !entry.references.length) {
    throw new Error('Missing official references for ' + item.id);
  }
  for (const ref of entry.references) {
    if (!ref.title || !ref.note || !ref.url || new URL(ref.url).protocol !== 'https:') {
      throw new Error('Invalid HTTPS source reference for ' + item.id);
    }
  }
  for (const rootName of ['.', 'dist']) {
    const file = path.join(root, rootName, item.route, 'index.html');
    const html = fs.readFileSync(file, 'utf8');
    for (const required of item.required) {
      if (!html.toLowerCase().includes(required.toLowerCase())) {
        throw new Error(item.id + ' (' + rootName + ') missing source guidance: ' + required);
      }
    }
    for (const ref of entry.references) {
      if (!html.includes(ref.url) || !html.includes(ref.title) || !html.includes(ref.note)) {
        throw new Error(item.id + ' (' + rootName + ') did not render complete source: ' + ref.title);
      }
    }
    if (!html.includes('Sources and further reading')) {
      throw new Error(item.id + ' (' + rootName + ') missing source section');
    }
  }
}

console.log('Official source reference audit PASS: official references render across SIP, deposit, tax, savings, GST, gratuity, HRA, NPS and EPF pages in source and production dist.');
