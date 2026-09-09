import { CALCULATORS } from '../calculators.js';

const cases = [
  ['sip', { monthly: 1000, rate: 0, years: 2, inflation: 0 }, 'You put in', 24000],
  ['compound-interest', { principal: 1000, rate: 12, years: 1, inflation: 0, freq: '12' }, 'Final amount (future money)', 1126.825],
  ['mortgage', { principal: 12000, rate: 0, years: 1 }, 'Monthly payment', 1000],
  ['roi', { cost: 1000, finalValue: 1210, years: 2 }, 'Total ROI', 21],
  ['simple-interest', { principal: 1000, rate: 10, years: 2 }, 'Interest', 200],
  ['freedom-milestone', { expenses: 40000, withdrawal: 4, current: 0 }, 'Target corpus', 1000000],
  ['salary-hourly', { direction: 'toHourly', amount: 52000, hoursPerWeek: 40, weeksPerYear: 52 }, 'Hourly rate', 25],
  ['profit-margin', { revenue: 1000, cogs: 400, expenses: 100 }, 'Net margin', 50],
  ['fixed-deposit', { principal: 1000, rate: 10, years: 1, freq: '1' }, 'Maturity amount', 1100],
  ['recurring-deposit', { monthly: 100, rate: 0, years: 1 }, 'Total contributions', 1200],
  ['lumpsum', { principal: 1000, rate: 10, years: 2 }, 'Future value', 1210],
  ['cagr', { initial: 1000, finalValue: 1210, years: 2 }, 'CAGR', 10],
  ['car-loan', { price: 12000, down: 2000, rate: 0, years: 1 }, 'Monthly payment', 833.3333333333],
  ['personal-loan', { principal: 12000, rate: 0, years: 1 }, 'Monthly payment', 1000],
  ['debt-payoff', { balance: 1200, rate: 0, payment: 100 }, 'Months to payoff', 12],
  ['inflation', { amount: 1000, rate: 10, years: 2 }, 'Future amount needed to buy the same thing', 1210],
  ['net-worth', { cash: 8000, investments: 0, property: 0, debt: 1500 }, 'Net worth', 6500],
  ['overtime', { hourly: 20, regular: 40, overtime: 10, multiplier: 1.5 }, 'Total gross pay', 1100],
  ['freelance-rate', { income: 50000, expenses: 10000, hours: 20, weeks: 50 }, 'Target hourly rate', 60],
  ['income-tax-planner', { income: 100000, deductions: 20000, rate: 20 }, 'Estimated tax', 16000],
];

const byId = new Map(CALCULATORS.map(c => [c.id, c]));
const failures = [];

if (CALCULATORS.length !== 20) failures.push(`Expected 20 calculators, found ${CALCULATORS.length}`);
if (new Set(CALCULATORS.map(c => c.id)).size !== CALCULATORS.length) failures.push('Calculator IDs are not unique');

for (const [id, values, label, expected] of cases) {
  const calc = byId.get(id);
  if (!calc) { failures.push(`${id}: calculator definition missing`); continue; }
  const result = calc.compute(values);
  if (!Array.isArray(result) || !result.length) { failures.push(`${id}: compute() returned no result`); continue; }
  if (result.some(row => !Number.isFinite(Number(row.value)))) failures.push(`${id}: non-finite result`);
  const row = result.find(r => r.label === label);
  if (!row) { failures.push(`${id}: expected result label not found: ${label}`); continue; }
  const tolerance = Math.max(0.01, Math.abs(expected) * 0.00001);
  if (Math.abs(Number(row.value) - expected) > tolerance) failures.push(`${id}: ${label} expected ${expected}, got ${row.value}`);
}

for (const calc of CALCULATORS) {
  if (!Array.isArray(calc.fields) || calc.fields.length === 0) failures.push(`${calc.id}: no input fields`);
  for (const field of calc.fields || []) {
    if (!field.id || !field.label) failures.push(`${calc.id}: malformed field definition`);
    if (field.type === 'number' && field.min != null && field.max != null && field.min > field.max) failures.push(`${calc.id}.${field.id}: min > max`);
  }
}

if (failures.length) {
  console.error(`Phase 10 QA FAILED (${failures.length} issue${failures.length === 1 ? '' : 's'})`);
  failures.forEach(f => console.error(`- ${f}`));
  process.exit(1);
}

console.log(`Phase 10 QA PASS: ${cases.length}/20 deterministic calculator scenarios passed.`);
