import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const descriptions = {
  'lumpsum-calculator.html': 'Estimate the future value of a one-time investment using an assumed annual return, time period and inflation rate.',
  'cagr-calculator.html': 'Calculate compound annual growth rate (CAGR) from an initial value, final value and holding period.',
  'car-loan-calculator.html': 'Estimate monthly car-loan payments, total repayment and total interest for a fixed-rate loan term.',
  'personal-loan-calculator.html': 'Estimate personal-loan monthly payments, total repayment and total interest from the amount, rate and term.',
  'debt-payoff-calculator.html': 'Estimate how long debt may take to repay and how much interest you may pay under a fixed monthly payment.',
  'inflation-calculator.html': 'Estimate how inflation changes the future purchasing power of an amount over a selected number of years.',
  'net-worth-calculator.html': 'Calculate net worth by comparing assets and liabilities, then use the result as a financial snapshot.',
  'overtime-pay-calculator.html': 'Estimate overtime earnings from regular pay, overtime hours and the overtime multiplier you choose.'
};

let changed = 0;
for (const [file, description] of Object.entries(descriptions)) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  const html = fs.readFileSync(full, 'utf8');
  const escaped = description.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const re = /<meta[^>]+name=["']description["'][^>]*>/i;
  if (!re.test(html)) continue;
  const replacement = `<meta name="description" content="${escaped}">`;
  const updated = html.replace(re, replacement);
  if (updated !== html) { fs.writeFileSync(full, updated); changed++; }
}
console.log(`Phase 3 description hardening changed ${changed} file(s).`);
