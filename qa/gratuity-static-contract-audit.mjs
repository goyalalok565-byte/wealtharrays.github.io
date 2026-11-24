import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pagePaths = [
  path.join(root, 'gratuity-calculator', 'index.html'),
  path.join(root, 'dist', 'gratuity-calculator', 'index.html')
];
for (const file of pagePaths) {
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('<p class="calc-desc">Estimate an illustrative gratuity amount using a common 15/26 wage formula and general five-year threshold; fixed-term and statutory exceptions are not assessed.</p>')) {
    throw new Error(path.relative(root, file) + ': visible calculator description is not aligned');
  }
  for (const required of [
    'Estimate an illustrative gratuity amount using a common 15/26 wage formula',
    'Code on Social Security, 2020 took effect on 21 November 2025',
    'Monthly eligible wage base (illustrative)',
    'Illustrative gratuity amount (general 5-year rule; exceptions not assessed)',
    'General 5-year threshold met (not a legal eligibility decision)',
    'Does this calculator determine gratuity eligibility?',
    'What wage figure should I enter?',
    'For illustration only, if the applicable monthly wage base were ₹50,000',
    'Use the correct wage base',
    'Check eligibility and transition rules'
  ]) {
    if (!html.includes(required)) throw new Error(path.relative(root, file) + ': missing current gratuity copy: ' + required);
  }
  for (const obsolete of [
    'Payment of Gratuity Act',
    'Last-drawn monthly basic + DA',
    'Estimated gratuity (0 if threshold not met)',
    'General 5-year threshold met (1 = yes)',
    'Is five years of service always required?',
    'Does this include every component of salary?'
  ]) {
    if (html.includes(obsolete)) throw new Error(path.relative(root, file) + ': obsolete gratuity copy remains: ' + obsolete);
  }
}
const definition = fs.readFileSync(path.join(root, 'dist', 'calculator-definitions', 'gratuity.js'), 'utf8');
for (const required of [
  'Does this calculator determine gratuity eligibility?',
  'Monthly eligible wage base (illustrative)',
  'not a legal eligibility decision',
  'Code on Social Security, 2020 took effect on 21 November 2025'
]) {
  if (!definition.includes(required)) throw new Error('Generated gratuity definition is missing: ' + required);
}
if (definition.includes('Payment of Gratuity Act')) throw new Error('Generated gratuity definition still cites the superseded Act as current law');
console.log('Gratuity static/runtime contract audit PASS: static page and generated calculator definition use current Social Security Code wording.');
