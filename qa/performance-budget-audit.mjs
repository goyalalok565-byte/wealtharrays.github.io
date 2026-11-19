import fs from 'node:fs';
import path from 'node:path';

const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['node_modules', 'dist', 'qa', 'scripts'].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(js|css)$/i.test(entry.name)) files.push(file);
  }
}
walk('.');

const budgets = { js: 140000, css: 100000 };
const assetBudgets = { 'wa-calculator-runtime.js': 118000 };
const required = ['wa-calculator-runtime.js', 'wa-site-runtime.js', 'styles.css'];
const failures = [];
if (files.length < 10) failures.push('Asset discovery returned only ' + files.length + ' JS/CSS assets; expected at least 10.');
for (const name of required) {
  if (!files.some(file => path.basename(file) === name)) failures.push('Required production asset was not checked: ' + name);
}
for (const file of files) {
  const ext = path.extname(file).slice(1).toLowerCase();
  const size = fs.statSync(file).size;
  if (size > budgets[ext]) failures.push(file + ': ' + size + ' bytes > ' + budgets[ext] + ' byte ' + ext.toUpperCase() + ' budget');
  const specific = assetBudgets[path.basename(file)];
  if (specific && size > specific) failures.push(file + ': ' + size + ' bytes > ' + specific + ' byte route-runtime budget');
}

// Calculator pages do not render the site-wide calculator search UI.
const calcRuntimePath = path.join(process.cwd(), 'wa-calculator-runtime.js');
if (fs.existsSync(calcRuntimePath)) {
  const runtime = fs.readFileSync(calcRuntimePath, 'utf8');
  if (runtime.includes('WA CANONICAL MODULE | calculator | calculator-search.js |')) {
    failures.push('wa-calculator-runtime.js includes calculator-search.js, unused on calculator routes.');
  }
}

// Keep third-party advertising bootstrap singular on every generated page.
function auditHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['node_modules', 'dist', 'qa', 'scripts'].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) auditHtml(file);
    else if (entry.name.endsWith('.html')) {
      const html = fs.readFileSync(file, 'utf8');
      const loaders = html.match(/<script\b(?=[^>]*src=["']\/wa-ad-loader\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>/gi) || [];
      const directAds = html.match(/<script\b(?=[^>]*src=["']https:\/\/pagead\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js)[^>]*>/gi) || [];
      if (loaders.length > 1) failures.push(file + ': duplicate wa-ad-loader.js tags (' + loaders.length + ').');
      if (directAds.length) failures.push(file + ': direct AdSense script bypasses the single consent/subscription-aware loader.');
    }
  }
}
auditHtml(process.cwd());

// Canonical runtime URLs carry content hashes, so long-lived immutable caching
// is safe and avoids revalidating the shared bundles on repeat visits.
const headersPath = path.join(process.cwd(), '_headers');
if (fs.existsSync(headersPath)) {
  const headerText = fs.readFileSync(headersPath, 'utf8');
  for (const asset of ['wa-site-runtime.js', 'wa-home-runtime.js', 'wa-calculator-runtime.js']) {
    const start = headerText.indexOf('/' + asset + '\\n');
    const end = start >= 0 ? headerText.indexOf('\\n/', start + 1) : -1;
    const block = start >= 0 ? headerText.slice(start, end >= 0 ? end : undefined) : '';
    if (!block.includes('max-age=31536000') || !block.includes('immutable')) {
      failures.push('_headers: ' + asset + ' must use one-year immutable caching because its URL is content-hashed.');
    }
  }
}
if (failures.length) {
  console.error('Performance budget audit FAIL:\n' + failures.join('\n'));
  process.exit(1);
}
console.log('Performance budget audit PASS:', files.length, 'JS/CSS assets checked. Budgets:', JSON.stringify(budgets));
