import fs from 'node:fs';
import path from 'node:path';

const calculators = [
  'sip-calculator.html','compound-interest-calculator.html','mortgage-emi-calculator.html','roi-calculator.html','simple-interest-calculator.html','retirement-calculator.html','salary-to-hourly-calculator.html','profit-margin-calculator.html','fixed-deposit-calculator.html','recurring-deposit-calculator.html','lumpsum-calculator.html','cagr-calculator.html','car-loan-calculator.html','personal-loan-calculator.html','debt-payoff-calculator.html','inflation-calculator.html','net-worth-calculator.html','overtime-pay-calculator.html','freelance-rate-calculator.html','income-tax-scenario-calculator.html'
];
const legacy = ['wa-core.js','calculator-runtime.js','site-runtime.js','final-polish.js','wa-enhancements.js','theme-fix.js','phase2-intelligence.js','phase2-retirement.js','phase3-seo.js','calculator-page-init.js','phase4-premium.js','calculators.js','widget.js'];
for (const file of legacy) if (!fs.existsSync(file)) throw new Error(`Missing runtime source: ${file}`);
if (!fs.existsSync('wa-calculator-runtime.js')) throw new Error('Missing canonical bundle');
const bundle = fs.readFileSync('wa-calculator-runtime.js','utf8');
if (!bundle.includes('WA CANONICAL MODULE')) throw new Error('Bundle provenance markers missing');
for (const file of calculators) {
  if (!fs.existsSync(file)) throw new Error(`Missing calculator page: ${file}`);
  const html = fs.readFileSync(file,'utf8');
  const tags = [...html.matchAll(/<script\s+src=["']([^"']+)["'][^>]*><\/script>/gi)].map(m=>path.basename(m[1].split('?')[0]));
  if (tags.filter(x=>x==='wa-calculator-runtime.js').length !== 1) throw new Error(`${file}: canonical bundle count is not 1`);
  for (const name of legacy) if (tags.includes(name)) throw new Error(`${file}: legacy runtime ${name} still loaded`);
  if (!html.includes('ca-pub-6507600103785450')) throw new Error(`${file}: AdSense publisher id missing`);
  if (!html.includes('rel="canonical"')) throw new Error(`${file}: canonical tag missing`);
}
if (!fs.existsSync('ads.txt') || !fs.readFileSync('ads.txt','utf8').includes('google.com, pub-6507600103785450, DIRECT')) throw new Error('ads.txt authorization missing');
if (fs.existsSync('node_modules')) throw new Error('node_modules must not be present in deploy tree');
console.log(`Stabilization audit PASS — ${calculators.length} calculators use exactly one canonical runtime bundle; legacy runtime scripts are not page-loaded; AdSense and ads.txt contracts preserved.`);
