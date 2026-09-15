import fs from 'node:fs';
import path from 'node:path';

const calculatorPages = [
  'sip-calculator.html','compound-interest-calculator.html','mortgage-emi-calculator.html','roi-calculator.html',
  'simple-interest-calculator.html','retirement-calculator.html','salary-to-hourly-calculator.html','profit-margin-calculator.html',
  'fixed-deposit-calculator.html','recurring-deposit-calculator.html','lumpsum-calculator.html','cagr-calculator.html',
  'car-loan-calculator.html','personal-loan-calculator.html','debt-payoff-calculator.html','inflation-calculator.html',
  'net-worth-calculator.html','overtime-pay-calculator.html','freelance-rate-calculator.html','income-tax-scenario-calculator.html'
];
const fail = msg => { throw new Error(msg); };
const read = file => fs.readFileSync(file, 'utf8');
const allHtml = [
  ...fs.readdirSync('.').filter(f => f.endsWith('.html')),
  ...(fs.existsSync('articles') ? fs.readdirSync('articles').filter(f => f.endsWith('.html')).map(f => `articles/${f}`) : []),
  ...(fs.existsSync('p') ? fs.readdirSync('p').filter(f => f.endsWith('.html')).map(f => `p/${f}`) : []),
];

for (const page of calculatorPages) {
  if (!fs.existsSync(page)) fail(`Missing calculator page: ${page}`);
  const html = read(page);
  const canonicalRuntime = (html.match(/wa-calculator-runtime\.js(?:\?[^"']*)?/g) || []).length;
  if (canonicalRuntime !== 1) fail(`${page}: expected exactly one canonical calculator runtime, found ${canonicalRuntime}`);
  for (const legacy of ['calculator-runtime.js','calculators.js','widget.js','wa-core.js','site-runtime.js','final-polish.js','wa-enhancements.js','theme-fix.js','phase2-intelligence.js','phase2-retirement.js','phase3-seo.js','calculator-page-init.js','phase4-premium.js']) {
    const legacyPattern = legacy === 'calculator-runtime.js' ? '(?<!wa-)calculator-runtime\\.js' : legacy.replaceAll('.', '\\.') ;
    if (new RegExp(`<script[^>]+src=["'][^"']*${legacyPattern}`, 'i').test(html)) fail(`${page}: legacy runtime still page-loaded: ${legacy}`);
  }
}

const indexable = allHtml.filter(file => !/noindex/i.test(read(file).match(/<meta[^>]+name=["']robots["'][^>]*>/i)?.[0] || ''));
const titles = new Map();
for (const file of indexable) {
  const html = read(file);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["'][^"']+["'][^>]*>/i);
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i)?.[1];
  if (!title) fail(`${file}: missing title`);
  if (!description) fail(`${file}: missing meta description`);
  if (!canonical) fail(`${file}: missing canonical`);
  if (titles.has(title)) fail(`Duplicate title: ${title} (${titles.get(title)} and ${file})`);
  titles.set(title, file);
  const scripts = [...html.matchAll(/<script\s+src=["']([^"']+)["'][^>]*><\/script>/gi)].map(m => path.basename(m[1].split('?')[0]));
  if (new Set(scripts).size !== scripts.length) fail(`${file}: duplicate script source`);
  if ((html.match(/rel=["']manifest["']/gi) || []).length !== 1) fail(`${file}: manifest link count is not 1`);
}

if (!fs.existsSync('wa-calculator-runtime.js')) fail('Missing canonical runtime bundle');
const bundleBytes = fs.statSync('wa-calculator-runtime.js').size;
if (bundleBytes > 750_000) fail(`Canonical runtime bundle is unexpectedly large: ${bundleBytes} bytes`);
if (!read('wa-calculator-runtime.js').includes('WA CANONICAL MODULE')) fail('Canonical runtime provenance marker missing');
if (!read('robots.txt').includes('Sitemap: https://wealtharrays.com/sitemap.xml')) fail('robots.txt sitemap contract missing');
if (!read('sitemap.xml').includes('https://wealtharrays.com/')) fail('sitemap root URL missing');
if (!read('ads.txt').includes('google.com, pub-6507600103785450, DIRECT, f08c47fec0942fa0')) fail('AdSense ads.txt contract changed');
if (!read('index.html').includes('ca-pub-6507600103785450')) fail('AdSense publisher contract missing from homepage');
if (!read('_headers').includes('Content-Security-Policy')) fail('CSP header missing');
if (!read('_headers').includes('Referrer-Policy')) fail('Referrer-Policy header missing');
if (fs.existsSync('node_modules')) fail('node_modules must never be present in deployable repository');

console.log(`Phase 4/5 production audit PASS — ${calculatorPages.length}/20 calculators, ${indexable.length} indexable HTML pages, unique titles/scripts, SEO contracts, security headers, bundle-size budget, and monetization contracts verified.`);
