import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const BUILD = fs.readFileSync('scripts/phase-stabilization-build.mjs', 'utf8');
const BUNDLE = fs.readFileSync('wa-calculator-runtime.js', 'utf8');
const calculatorPages = [
  'sip-calculator.html','compound-interest-calculator.html','mortgage-emi-calculator.html','roi-calculator.html',
  'simple-interest-calculator.html','retirement-calculator.html','salary-to-hourly-calculator.html','profit-margin-calculator.html',
  'fixed-deposit-calculator.html','recurring-deposit-calculator.html','lumpsum-calculator.html','cagr-calculator.html',
  'car-loan-calculator.html','personal-loan-calculator.html','debt-payoff-calculator.html','inflation-calculator.html',
  'net-worth-calculator.html','overtime-pay-calculator.html','freelance-rate-calculator.html','income-tax-scenario-calculator.html'
];

const match = BUILD.match(/const canonicalSources = \[([\s\S]*?)\n\];/);
if (!match) throw new Error('Cannot locate canonicalSources in stabilization build');
const sources = [...match[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
if (sources.length !== 13) throw new Error(`Expected 13 canonical source modules, found ${sources.length}`);

for (const file of sources) {
  if (!fs.existsSync(file)) throw new Error(`Missing canonical source: ${file}`);
  const content = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n').trimEnd();
  const hash = crypto.createHash('sha256').update(content).digest('hex').slice(0, 12);
  const marker = `WA CANONICAL MODULE: ${file} | sha256:${hash}`;
  if (!BUNDLE.includes(marker)) throw new Error(`Bundle is stale or provenance is broken for ${file}`);
}

const markerCount = (BUNDLE.match(/WA CANONICAL MODULE:/g) || []).length;
if (markerCount !== sources.length) throw new Error(`Expected ${sources.length} bundle provenance markers, found ${markerCount}`);

execFileSync(process.execPath, ['--check', 'wa-calculator-runtime.js'], { stdio: 'inherit' });

for (const page of calculatorPages) {
  const html = fs.readFileSync(page, 'utf8');
  if ((html.match(/wa-calculator-runtime\.js(?:\?[^"']*)?/g) || []).length !== 1) {
    throw new Error(`${page}: canonical runtime ownership violation`);
  }
  for (const file of sources) {
    if (new RegExp(`<script[^>]+src=["'][^"']*${file.replaceAll('.', '\\.')}`, 'i').test(html)) {
      throw new Error(`${page}: source module must not be directly page-loaded: ${file}`);
    }
  }
}

if (fs.statSync('wa-calculator-runtime.js').size > 750_000) throw new Error('Canonical runtime exceeded 750 KB budget');
if (fs.existsSync('node_modules')) throw new Error('node_modules must never be present in the deployable tree');

console.log(`Architecture audit PASS — ${sources.length} versioned source modules, fresh hash-provenance bundle, syntax-valid canonical runtime, and ${calculatorPages.length}/20 pages with single runtime ownership.`);
