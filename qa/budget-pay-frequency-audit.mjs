import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = fs.readFileSync(path.join(root, 'budget-calculator/index.html'), 'utf8');
const built = fs.readFileSync(path.join(root, 'dist/budget-calculator/index.html'), 'utf8');
const expectedDescription = 'Use weekly, biweekly or monthly take-home pay: convert it to a monthly amount, then compare 50/30/20 needs, wants and savings targets with actual spending.';
const required = [
  'Use weekly, biweekly or monthly take-home pay',
  'weekly take-home pay × 52 ÷ 12',
  'biweekly take-home pay × 26 ÷ 12',
  'semimonthly take-home pay × 24 ÷ 12',
  'do not simply multiply weekly pay by four or biweekly pay by two',
  'Can I use weekly or biweekly pay?',
  'Build a monthly budget from real spending',
  'Plan for irregular and annual expenses',
  'Adjust the percentages without losing the comparison',
  'not a grade',
  'Sources and further reading',
  'RBI Financial Awareness Messages (FAME)',
  'does not prescribe the 50/30/20 percentages'
];
for (const [name, html] of [['source', source], ['dist', built]]) {
  for (const text of required) {
    if (!html.toLowerCase().includes(text.toLowerCase())) {
      throw new Error('Budget pay-frequency audit failed in ' + name + ': missing "' + text + '"');
    }
  }
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1] || '';
  const ogDescription = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)?.[1] || '';
  const twitterDescription = html.match(/<meta\s+name=["']twitter:description["']\s+content=["']([^"']+)["']/i)?.[1] || '';
  for (const [label, actual] of [['description', description], ['og:description', ogDescription], ['twitter:description', twitterDescription]]) {
    if (actual !== expectedDescription) {
      throw new Error('Budget pay-frequency audit failed in ' + name + ': ' + label + ' did not match the weekly/biweekly guidance description');
    }
  }
}
console.log('Budget pay-frequency audit PASS: weekly, biweekly and twice-monthly conversions are explained consistently in source and dist.');
