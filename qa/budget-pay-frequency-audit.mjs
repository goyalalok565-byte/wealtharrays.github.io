import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = fs.readFileSync(path.join(root, 'budget-calculator/index.html'), 'utf8');
const built = fs.readFileSync(path.join(root, 'dist/budget-calculator/index.html'), 'utf8');
const required = [
  'Use weekly, biweekly or monthly take-home pay',
  'weekly take-home pay × 52 ÷ 12',
  'biweekly take-home pay × 26 ÷ 12',
  'semimonthly take-home pay × 24 ÷ 12',
  'do not simply multiply weekly pay by four or biweekly pay by two',
  'Can I use weekly or biweekly pay?'
];
for (const [name, html] of [['source', source], ['dist', built]]) {
  for (const text of required) {
    if (!html.toLowerCase().includes(text.toLowerCase())) {
      throw new Error('Budget pay-frequency audit failed in ' + name + ': missing "' + text + '"');
    }
  }
}
console.log('Budget pay-frequency audit PASS: weekly, biweekly and twice-monthly conversions are explained consistently in source and dist.');
