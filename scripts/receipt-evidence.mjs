import crypto from 'node:crypto';

const CASES = {
  sip: {
    model_version: '1.0.0',
    input_units: { monthly: 'currency/month', rate: '%/year', years: 'years', inflation: '%/year' }, output_units: ['currency', 'currency', 'currency', 'currency'],
    case_id: 'sip-annuity-due-200-10-15y',
    formula_id: 'sip-annuity-due-monthly-v1',
    assumptions: [{ id: 'contribution_timing', label: 'Contribution timing', value: 'Beginning of each month' }, { id: 'compounding_period', label: 'Return compounding', value: 'Monthly' }],
    inputs: { monthly: 200, rate: 10, years: 15, inflation: 6 },
    reference(v) {
      const i = v.rate / 1200, n = v.years * 12;
      const future = v.monthly * (i === 0 ? n : ((Math.pow(1 + i, n) - 1) / i) * (1 + i));
      const invested = v.monthly * n;
      return [invested, future - invested, future, future / Math.pow(1 + v.inflation / 100, v.years)];
    }
  },
  mortgage: {
    model_version: '1.0.0',
    input_units: { principal: 'currency', rate: '%/year', years: 'years' }, output_units: ['currency/month', 'currency', 'currency'],
    case_id: 'mortgage-standard-amortization-250k-6.5-25y',
    formula_id: 'loan-amortization-monthly-fixed-rate-v1',
    assumptions: [{ id: 'rate_type', label: 'Interest rate', value: 'Fixed for the full loan term' }, { id: 'payment_frequency', label: 'Payment frequency', value: 'Monthly, end-of-period amortization' }],
    inputs: { principal: 250000, rate: 6.5, years: 25 },
    reference(v) {
      const n = v.years * 12, r = v.rate / 1200;
      const payment = r === 0 ? v.principal / n : v.principal * r / (1 - Math.pow(1 + r, -n));
      return [payment, payment * n, payment * n - v.principal];
    }
  },
  'compound-interest': {
    model_version: '1.0.0',
    input_units: { principal: 'currency', rate: '%/year', years: 'years', inflation: '%/year', freq: 'compounding periods/year' }, output_units: ['currency', 'currency', 'currency', 'currency'],
    case_id: 'compound-monthly-5000-6-10y',
    formula_id: 'compound-periodic-v1',
    assumptions: [{ id: 'rate_type', label: 'Rate type', value: 'Nominal annual rate divided by selected compounding periods' }],
    inputs: { principal: 5000, rate: 6, years: 10, inflation: 6, freq: '12' },
    reference(v) {
      const future = v.principal * Math.pow(1 + (v.rate / 100) / Number(v.freq), Number(v.freq) * v.years);
      return [v.principal, future - v.principal, future, future / Math.pow(1 + v.inflation / 100, v.years)];
    }
  },
  swp: {
    model_version: '1.0.0',
    input_units: { corpus: 'currency', withdrawal: 'currency/month', rate: '%/year', years: 'years', stepUp: '%/year' }, output_units: ['currency', 'currency', 'currency', 'years'],
    case_id: 'swp-step-up-withdrawal-exhaustion-5m-8-20y',
    formula_id: 'swp-withdraw-first-monthly-return-v1',
    assumptions: [{ id: 'withdrawal_timing', label: 'Withdrawal timing', value: 'At the start of each month' }, { id: 'return_timing', label: 'Return timing', value: 'Applied monthly after withdrawal' }, { id: 'step_up_timing', label: 'Annual step-up', value: 'Applied once each year after the first month' }],
    inputs: { corpus: 5000000, withdrawal: 30000, rate: 8, years: 20, stepUp: 5 },
    reference(v) {
      let balance = v.corpus, withdrawal = v.withdrawal, total = 0, fullMonths = 0;
      for (let month = 1; month <= v.years * 12; month++) {
        if (month > 1 && (month - 1) % 12 === 0) withdrawal *= 1 + v.stepUp / 100;
        const paid = Math.min(withdrawal, balance);
        balance -= paid; total += paid;
        if (paid + 0.005 < withdrawal) break;
        fullMonths++;
        balance *= 1 + v.rate / 1200;
      }
      return [total, balance, balance + total - v.corpus, fullMonths / 12];
    }
  },
  'rent-vs-buy': {
    model_version: '1.0.0',
    input_units: { price: 'currency', downPct: '%', loanRate: '%/year', loanYears: 'years', appreciation: '%/year', rent: 'currency/month', rentGrowth: '%/year', investReturn: '%/year', maintPct: '%/year', buyCostPct: '%', horizon: 'years' }, output_units: ['currency/month', 'currency', 'currency', 'currency'],
    case_id: 'rent-buy-monthly-amortization-8m-10y',
    formula_id: 'rent-vs-buy-monthly-cashflow-v1',
    assumptions: [{ id: 'loan_rate', label: 'Loan rate', value: 'Fixed for the modeled loan term' }, { id: 'cashflow_timing', label: 'Cash-flow timing', value: 'Monthly' }, { id: 'rent_escalation', label: 'Rent escalation', value: 'Applied annually' }, { id: 'maintenance', label: 'Maintenance', value: 'Calculated as a percentage of initial property price each month' }],
    inputs: { price: 8000000, downPct: 20, loanRate: 8.75, loanYears: 20, appreciation: 5, rent: 25000, rentGrowth: 5, investReturn: 10, maintPct: 1, buyCostPct: 6, horizon: 10 },
    reference(v) {
      const down = v.price * v.downPct / 100, loan = v.price - down;
      const months = v.loanYears * 12, monthlyLoanRate = v.loanRate / 1200;
      const emi = loan * monthlyLoanRate / (1 - Math.pow(1 + monthlyLoanRate, -months));
      const investRate = v.investReturn / 1200, upkeep = v.price * v.maintPct / 1200;
      let balance = loan, rent = v.rent;
      let renter = down + v.price * v.buyCostPct / 100, buyer = 0;
      for (let month = 1; month <= v.horizon * 12; month++) {
        if (month > 1 && (month - 1) % 12 === 0) rent *= 1 + v.rentGrowth / 100;
        let payment = 0;
        if (month <= months) {
          payment = emi;
          balance = Math.max(0, balance - (payment - balance * monthlyLoanRate));
        }
        const cashDifference = payment + upkeep - rent;
        if (cashDifference >= 0) renter += cashDifference; else buyer += -cashDifference;
        renter *= 1 + investRate;
        buyer *= 1 + investRate;
      }
      const homeValue = v.price * Math.pow(1 + v.appreciation / 100, v.horizon);
      const buyWorth = homeValue - balance + buyer;
      return [emi, buyWorth, renter, Math.abs(buyWorth - renter)];
    }
  }
};

function close(actual, expected) {
  return Number.isFinite(actual) && Number.isFinite(expected) &&
    Math.abs(actual - expected) <= Math.max(1e-7, Math.abs(expected) * 1e-10);
}

export function buildReceiptEvidence(calculators, buildId) {
  const byId = new Map(calculators.map(calc => [calc.id, calc]));
  const models = {};
  for (const [id, spec] of Object.entries(CASES)) {
    const calc = byId.get(id);
    if (!calc) throw new Error('Receipt model is missing from calculator registry: ' + id);
    const expected = spec.reference({ ...spec.inputs });
    const actual = calc.compute({ ...spec.inputs });
    if (!Array.isArray(actual) || actual.length !== expected.length ||
        actual.some((row, index) => !close(Number(row?.value), expected[index]))) {
      throw new Error('Independent receipt vector failed for ' + id + '/' + spec.case_id);
    }
    models[id] = {
      model_version: spec.model_version,
      passed: true,
      independent_case_count: 1,
      case_ids: [spec.case_id],
      formula_id: spec.formula_id,
      assumptions: spec.assumptions,
      input_units: spec.input_units,
      output_units: spec.output_units
    };
  }
  return { schema_version: 1, build_id: buildId, models };
}

export function canonicalReceiptPayload(value) {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'number' && !Number.isFinite(value)) throw new TypeError('Receipt numbers must be finite');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return '[' + value.map(canonicalReceiptPayload).join(',') + ']';
  return '{' + Object.keys(value).sort().map(key =>
    JSON.stringify(key) + ':' + canonicalReceiptPayload(value[key])
  ).join(',') + '}';
}

export function receiptDigest(payload) {
  return crypto.createHash('sha256').update(canonicalReceiptPayload(payload), 'utf8').digest('hex');
}

export const RECEIPT_CASE_IDS = Object.freeze(Object.fromEntries(
  Object.entries(CASES).map(([id, spec]) => [id, spec.case_id])
));
