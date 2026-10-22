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
}
if (failures.length) {
  console.error('Performance budget audit FAIL:\n' + failures.join('\n'));
  process.exit(1);
}
console.log('Performance budget audit PASS:', files.length, 'JS/CSS assets checked. Budgets:', JSON.stringify(budgets));
