import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const forbiddenRuntime = 'calculator-runtime.js';
const sourceFiles = [];
for (const dir of ['.', 'articles', 'p', 'scripts', 'qa', '.github/workflows']) {
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

const scanFiles = sourceFiles.filter(file => path.relative(root, file) !== 'qa/recurring-bug-regression.mjs');
const contents = scanFiles.map(file => ({ file: path.relative(root, file), text: fs.readFileSync(file, 'utf8') }));

// Regression #1: the homepage search dropdown must never be clipped by ledger-hero.
const clippingPattern = /\.ledger-hero\s*\{[^}]*overflow\s*:\s*hidden\b/i;
for (const { file, text } of contents) {
  if (clippingPattern.test(text)) throw new Error(`Recurring search clipping rule detected in ${file}`);
}

// Regression #2: hub search has exactly one canonical owner and the legacy layer
// must be unable to execute on hub pages even if script load order changes.
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

// Regression #3: retired calculator-runtime.js must not return. Match only a
// standalone filename so the valid wa-calculator-runtime.js bundle is allowed.
const retiredRuntimePattern = /(?:^|[\/'"])calculator-runtime\.js(?:[?#'"$])/i;
if (fs.existsSync(path.join(root, forbiddenRuntime))) throw new Error(`Retired ${forbiddenRuntime} was recreated`);
for (const { file, text } of contents) {
  if (retiredRuntimePattern.test(text)) {
    throw new Error(`Retired runtime reference detected in ${file}`);
  }
}

// The canonical calculator bundle is the only runtime loaded by calculator pages.
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

// Stabilization source list must not contain retired modules.
const build = fs.readFileSync(path.join(root, 'scripts/phase-stabilization-build.mjs'), 'utf8');
if (build.includes("'calculator-runtime.js'")) throw new Error('Stabilization build still revives the retired runtime');

console.log('Recurring bug regression suite: PASS — clipping, search ownership, retired runtime revival, and calculator runtime duplication are locked.');
