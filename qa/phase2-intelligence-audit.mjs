import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const root = new URL('../', import.meta.url).pathname;
const calculators = [
  'mortgage-emi-calculator.html','sip-calculator.html','compound-interest-calculator.html','fixed-deposit-calculator.html',
  'personal-loan-calculator.html','car-loan-calculator.html','retirement-calculator.html','inflation-calculator.html',
  'roi-calculator.html','lumpsum-calculator.html','recurring-deposit-calculator.html','cagr-calculator.html',
  'debt-payoff-calculator.html','simple-interest-calculator.html','net-worth-calculator.html','salary-to-hourly-calculator.html',
  'overtime-pay-calculator.html','freelance-rate-calculator.html','profit-margin-calculator.html','income-tax-scenario-calculator.html'
];
const required = [
  'DECISION RANGE','SENSITIVITY','YOUR RESULT','Continue the decision','waPhase2Loaded','wa2-scenario-grid','wa2-table'
];
const phase2 = readFileSync(`${root}/phase2-intelligence.js`, 'utf8');
for (const token of required) if (!phase2.includes(token)) throw new Error(`Phase 2 runtime missing required feature: ${token}`);
for (const file of ['phase2-intelligence.js','phase2-retirement.js','wa-enhancements.js']) {
  const result = spawnSync(process.execPath, ['--check', `${root}/${file}`], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${file} syntax check failed: ${result.stderr || result.stdout}`);
}
for (const file of calculators) {
  const html = readFileSync(`${root}/${file}`, 'utf8');
  if (!html.includes('phase2-intelligence.js')) throw new Error(`${file} is missing Phase 2 runtime injection`);
}
const allHtml = readdirSync(root).filter(x => x.endsWith('.html'));
for (const file of allHtml) {
  const html = readFileSync(`${root}/${file}`, 'utf8');
  for (const retired of ['step-up-sip-calculator.html','emergency-fund-calculator.html','real-return-calculator.html']) {
    if (html.includes(retired)) throw new Error(`${file} still references retired calculator ${retired}`);
  }
}
console.log(`Phase 2 audit passed: ${calculators.length}/20 calculator pages contain the decision-intelligence runtime; required scenario/sensitivity/meaning/journey features and JS syntax checks are healthy; retired calculator references are absent.`);
