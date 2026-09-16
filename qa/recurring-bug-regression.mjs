import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const forbiddenRuntime = 'calculator-runtime.js';
const siteSources = [
  'wa-core.js', 'site-runtime.js', 'final-polish.js', 'wa-enhancements.js',
  'theme-fix.js', 'phase2-intelligence.js', 'phase2-retirement.js', 'phase3-seo.js', 'phase4-premium.js',
];
const sourceFiles = [];
for (const dir of ['.', 'articles', 'p', '.github/workflows']) {
  const fullDir = path.join(root, dir);
  if (!fs.existsSync(fullDir)) continue;
  const walk = current => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(html|css|js|yml|yaml)$/i.test(entry.name)) sourceFiles.push(full);
    }
  };
  walk(fullDir);
}

const contents = sourceFiles.map(file => ({ file: path.relative(root, file), text: fs.readFileSync(file, 'utf8') }));

const clippingPattern = /\.ledger-hero\s*\{[^}]*overflow\s*:\s*hidden\b/i;
for (const { file, text } of contents) {
  if (clippingPattern.test(text)) throw new Error(`Recurring search clipping rule detected in ${file}`);
}

const core = fs.readFileSync(path.join(root, 'wa-core.js'), 'utf8');
if (!/window\.__WA_SEARCH_OWNER__\s*=\s*['"]wa-core['"]/.test(core)) {
  throw new Error('wa-core.js is missing the canonical search-owner marker');
}
if (!/document\.querySelectorAll\('\.ledger-hero,\.hero-copy,\.search-bar'\)/.test(core)) {
  throw new Error('wa-core.js is missing the search-container overflow protection');
}
const finalPolishPath = path.join(root, 'final-polish.js');
if (fs.existsSync(finalPolishPath)) {
  const finalPolish = fs.readFileSync(finalPolishPath, 'utf8');
  if (!/if\(window\.__WEALTH_ARRAYS_CORE_LOADED__&&!document\.querySelector\('\.calc-page'\)\)return;/.test(finalPolish)) {
    throw new Error('final-polish.js is missing its calculator-only guard');
  }
}

const retiredRuntimePattern = /(?:^|[\/'"])calculator-runtime\.js(?:[?#'"$])/i;
if (fs.existsSync(path.join(root, forbiddenRuntime))) throw new Error(`Retired ${forbiddenRuntime} was recreated`);
for (const { file, text } of contents) {
  if (retiredRuntimePattern.test(text)) throw new Error(`Retired runtime reference detected in ${file}`);
}

const calculatorPages = [
  'sip-calculator.html', 'compound-interest-calculator.html', 'mortgage-emi-calculator.html',
  'roi-calculator.html', 'simple-interest-calculator.html', 'retirement-calculator.html',
  'salary-to-hourly-calculator.html', 'profit-margin-calculator.html', 'fixed-deposit-calculator.html',
  'recurring-deposit-calculator.html', 'lumpsum-calculator.html', 'cagr-calculator.html',
  'car-loan-calculator.html', 'personal-loan-calculator.html', 'debt-payoff-calculator.html',
  'inflation-calculator.html', 'net-worth-calculator.html', 'overtime-pay-calculator.html',
  'freelance-rate-calculator.html', 'income-tax-scenario-calculator.html',
];
for (const page of calculatorPages) {
  const text = fs.readFileSync(path.join(root, page), 'utf8');
  const matches = text.match(/<script\s+src=["'][^"']*wa-calculator-runtime\.js[^"']*["'][^>]*><\/script>/gi) || [];
  if (matches.length !== 1) throw new Error(`${page}: expected exactly one canonical calculator runtime, found ${matches.length}`);
}

// Shared site pages must follow the same consolidation rule as calculators:
// one canonical runtime, no direct loading of its component patch files.
if (!fs.existsSync(path.join(root, 'wa-site-runtime.js'))) {
  throw new Error('Canonical wa-site-runtime.js bundle is missing');
}
const htmlFiles = [];
const walkHtml = dir => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['.git', 'node_modules'].includes(entry.name)) walkHtml(full);
    } else if (/\.html$/i.test(entry.name)) htmlFiles.push(full);
  }
};
walkHtml(root);
for (const full of htmlFiles) {
  const rel = path.relative(root, full).replaceAll(path.sep, '/');
  if (calculatorPages.includes(rel)) continue;
  const text = fs.readFileSync(full, 'utf8');
  const hasSharedSource = siteSources.some(base => new RegExp(`<script\\s+src=["'][^"']*${base.replace('.', '\\.')}(?:[?#][^"']*)?["'][^>]*><\\/script>`, 'i').test(text));
  const bundleMatches = text.match(/<script\s+src=["'][^"']*wa-site-runtime\.js[^"']*["'][^>]*><\/script>/gi) || [];
  if (hasSharedSource || bundleMatches.length) {
    if (bundleMatches.length !== 1) throw new Error(`${rel}: expected exactly one canonical site runtime, found ${bundleMatches.length}`);
    for (const base of siteSources) {
      const direct = new RegExp(`<script\\s+src=["'][^"']*${base.replace('.', '\\.')}(?:[?#][^"']*)?["'][^>]*><\\/script>`, 'i');
      if (direct.test(text)) throw new Error(`${rel}: direct shared module ${base} bypasses wa-site-runtime.js`);
    }
  }
}

const build = fs.readFileSync(path.join(root, 'scripts/phase-stabilization-build.mjs'), 'utf8');
if (build.includes("'calculator-runtime.js'")) throw new Error('Stabilization build still revives the retired runtime');
if (!build.includes("'wa-site-runtime.js'")) throw new Error('Stabilization build does not own the shared site runtime');

console.log('Recurring bug regression suite: PASS — clipping, search ownership, retired runtime, calculator runtime, and shared site runtime consolidation are locked.');
