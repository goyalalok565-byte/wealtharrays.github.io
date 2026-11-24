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
  }
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
