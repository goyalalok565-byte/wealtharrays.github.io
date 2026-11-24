import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { calculator, values, close } = require('./helpers.js');
const pmt = (p, annual, n) => {
  const r = Math.max(annual, 0) / 1200;
  return p === 0 ? 0 : r === 0 ? p / n : p * r / (1 - Math.pow(1 + r, -n));
};
const fvAnnuityDue = (m, r, n) => n <= 0 ? 0 : r === 0 ? m * n : m * (Math.pow(1 + r, n) - 1) / r * (1 + r);

function reference(id, v) {
  switch (id) {
    case 'freedom-milestone': {
      const target = v.withdrawal > 0 ? v.expenses / (v.withdrawal / 100) : 0;
      return [target, Math.max(target - v.current, 0), target > 0 ? Math.min(v.current / target * 100, 100) : 0];
    }
    case 'budget-50-30-20': {
      const needsPct = Math.min(100, Math.max(0, v.needsPct));
      const wantsPct = Math.min(100 - needsPct, Math.max(0, v.wantsPct));
      const needs = v.income * needsPct / 100, wants = v.income * wantsPct / 100;
      const savings = v.income - needs - wants;
      const actual = v.income - v.actualNeeds - v.actualWants, gap = actual - savings;
      return [needs, wants, savings, actual, Math.abs(gap)];
    }
    case 'break-even': {
      const contribution = v.price - v.variableCost, viable = contribution > 0;
      const units = viable ? Math.ceil(v.fixedCosts / contribution) : 0;
      const targetUnits = viable ? Math.ceil((v.fixedCosts + v.targetProfit) / contribution) : 0;
      return [contribution, units, units * v.price, units / v.days, targetUnits];
    }
    case 'cost-of-delay': {
      const n = v.years * 12, d = Math.min(n, v.delay * 12), r = v.rate / 1200;
      const factor = count => r === 0 ? count : (Math.pow(1 + r, count) - 1) / r * (1 + r);
      const now = v.monthly * factor(n), laterFactor = factor(n - d), later = v.monthly * laterFactor;
      return [now, later, now - later, laterFactor > 0 ? now / laterFactor : 0];
    }
    case 'advanced-home-loan-eligibility': {
      const income = v.income + v.coIncome;
      const capacity = Math.max(income * v.foir / 100 - v.existing, 0), n = Math.round(v.years * 12), r = v.rate / 1200;
      const loan = r === 0 ? capacity * n : capacity * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
      return [income, capacity, loan];
    }
    case 'currency-converter': return [v.amount, v.amount * v.rate];
    case 'loan-emi': {
      const n = Math.round(v.years * 12), emi = pmt(v.principal, v.rate, n), total = emi * n;
      return [emi, total, total - v.principal];
    }
    case 'capital-gain': {
      const gain = v.sale - v.purchase - v.buyCosts - v.sellCosts;
      const tax = Math.max(gain, 0) * v.taxRate / 100;
      return [gain, tax, gain - tax];
    }
    case 'loan-against-property': {
      const loan = v.property * v.ltv / 100, n = Math.round(v.years * 12), emi = pmt(loan, v.rate, n);
      return [loan, emi, emi * n - loan];
    }
    case 'home-loan-eligibility': {
      const capacity = v.income * v.foir / 100 - v.existing, n = Math.round(v.years * 12), r = v.rate / 1200;
      const loan = capacity <= 0 ? 0 : r === 0 ? capacity * n : capacity * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
      return [Math.max(capacity, 0), Math.max(loan, 0)];
    }
    case 'consumer-durable-loan': {
      const financed = v.price - Math.min(v.down, v.price), n = Math.round(v.years * 12);
      const emi = pmt(financed, v.rate, n), fee = financed * v.fee / 100, total = emi * n;
      return [financed, emi, total - financed, total + v.down + fee];
    }
    case 'loan-prepayment-vs-sip': {
      const principal = Math.max(v.balance, 0), cash = Math.max(v.prepay, 0);
      const periods = Math.max(1, Math.round(Math.max(v.years, 0) * 12));
      const monthlyLoanRate = Math.max(v.rate, 0) / 1200, monthlyReturn = Math.max(v.investmentReturn, 0) / 1200;
      const tolerance = Math.max(1e-7, principal * Number.EPSILON * 16), scheduledPayment = pmt(principal, v.rate, periods);
      let regularBalance = principal, regularInterest = 0;
      for (let month = 1; month <= periods && regularBalance > tolerance; month++) {
        const charge = regularBalance * monthlyLoanRate; regularInterest += charge;
        const due = regularBalance + charge;
        regularBalance = month === periods || due <= scheduledPayment + tolerance ? 0 : Math.max(0, due - scheduledPayment);
      }
      let prepaidBalance = principal - Math.min(cash, principal), prepaidInterest = 0;
      let payoffMonth = prepaidBalance <= tolerance ? 0 : periods, redirectedPortfolio = Math.max(cash - principal, 0);
      for (let month = 1; month <= periods; month++) {
        redirectedPortfolio *= 1 + monthlyReturn;
        if (prepaidBalance > tolerance) {
          const charge = prepaidBalance * monthlyLoanRate; prepaidInterest += charge;
          const due = prepaidBalance + charge;
          if (month === periods || due <= scheduledPayment + tolerance) {
            redirectedPortfolio += month === periods ? 0 : Math.max(0, scheduledPayment - due);
            prepaidBalance = 0; payoffMonth = month;
          } else prepaidBalance = Math.max(0, due - scheduledPayment);
        } else redirectedPortfolio += scheduledPayment;
      }
      const investCashPortfolio = cash * Math.pow(1 + monthlyReturn, periods);
      return [Math.max(0, regularInterest - prepaidInterest), investCashPortfolio, redirectedPortfolio, scheduledPayment, payoffMonth, redirectedPortfolio - investCashPortfolio];
    }
    case 'property-calculator': {
      const down = Math.min(v.down, v.price), principal = v.price - down, n = Math.round(v.years * 12);
      const emi = pmt(principal, v.rate, n), repayment = emi * n;
      const stamp = v.price * v.stamp / 100, registration = v.price * v.registration / 100;
      const upfront = down + stamp + registration + v.other;
      return [principal, emi, upfront, repayment - principal, upfront + repayment];
    }
    case 'ppf-growth': {
      let balance = v.initialBalance, contributed = v.initialBalance;
      for (let year = 0; year < v.years; year++) {
        balance = (balance + v.yearlyContribution) * (1 + v.rate / 100);
        contributed += v.yearlyContribution;
      }
      return [balance, contributed, balance - contributed];
    }
    case 'epf-growth': {
      let balance = 0, contributed = 0, salary = v.monthlyBasic;
      for (let month = 1; month <= v.years * 12; month++) {
        if (month > 1 && (month - 1) % 12 === 0) salary *= 1 + v.salaryGrowth / 100;
        const contribution = salary * (v.employeePct + v.employerPct) / 100;
        contributed += contribution;
        balance = (balance + contribution) * (1 + v.rate / 1200);
      }
      return [balance, contributed, balance - contributed];
    }
    case 'gratuity': {
      const eligible = v.years >= 5, amount = eligible ? v.salary * 15 / 26 * Math.floor(v.years) : 0;
      return [amount, eligible ? 1 : 0];
    }
    case 'nps': {
      const n = Math.round(v.years * 12), invested = v.monthly * n, r = v.rate / 1200;
      const corpus = r === 0 ? invested : v.monthly * (Math.pow(1 + r, n) - 1) / r;
      const annuity = corpus * v.annuityShare / 100;
      return [invested, corpus - invested, corpus, corpus - annuity, annuity, annuity * v.annuityRate / 1200];
    }
    case 'hra-exemption': {
      const exempt = Math.max(0, Math.min(v.hra, v.rent - 0.1 * v.basicDA, v.basicDA * v.cityPct / 100));
      return [exempt, Math.max(0, v.hra - exempt), exempt * 12];
    }
    case 'stamp-duty': {
      const stamp = v.value * v.stamp / 100, registration = v.value * v.registration / 100;
      return [stamp, registration, stamp + registration];
    }
    case 'rule-of-72': {
      const rule = v.rate > 0 ? 72 / v.rate : 0, exact = v.rate > 0 ? Math.log(2) / Math.log(1 + v.rate / 100) : 0;
      const target = v.rate > 0 ? Math.log(v.multiple) / Math.log(1 + v.rate / 100) : 0;
      return [rule, exact, rule - exact, target];
    }
    default: throw new Error(`No reference for ${id}`);
  }
}

const cases = {
  'freedom-milestone': [
    { name: 'default', v: { expenses: 30000, withdrawal: 4, current: 20000 } },
    { name: 'boundary-zero', v: { expenses: 0, withdrawal: 4, current: 0 } },
    { name: 'large', v: { expenses: 1e9, withdrawal: 1, current: 1e8 } }
  ],
  'budget-50-30-20': [
    { name: 'default', v: { income: 80000, needsPct: 50, wantsPct: 30, actualNeeds: 45000, actualWants: 25000 } },
    { name: 'boundary-zero', v: { income: 0, needsPct: 0, wantsPct: 0, actualNeeds: 0, actualWants: 0 } },
    { name: 'large', v: { income: 1e9, needsPct: 80, wantsPct: 80, actualNeeds: 1e8, actualWants: 1e8 } }
  ],
  'break-even': [
    { name: 'default', v: { fixedCosts: 150000, price: 150, variableCost: 60, targetProfit: 50000, days: 30 } },
    { name: 'boundary-zero', v: { fixedCosts: 0, price: 0, variableCost: 0, targetProfit: 0, days: 1 } },
    { name: 'large', v: { fixedCosts: 1e11, price: 1e9, variableCost: 1, targetProfit: 1e11, days: 31 } }
  ],
  'cost-of-delay': [
    { name: 'default', v: { monthly: 10000, rate: 12, years: 25, delay: 5 } },
    { name: 'boundary-zero-rate', v: { monthly: 1000, rate: 0, years: 1, delay: 0 } },
    { name: 'large', v: { monthly: 1e9, rate: 50, years: 60, delay: 59 } }
  ],
  'advanced-home-loan-eligibility': [
    { name: 'default', v: { income: 150000, coIncome: 75000, foir: 50, existing: 20000, rate: 8.5, years: 20 } },
    { name: 'boundary-zero', v: { income: 0, coIncome: 0, foir: 50, existing: 0, rate: 0, years: 1 } },
    { name: 'large', v: { income: 1e12, coIncome: 1e12, foir: 100, existing: 0, rate: 0, years: 100 } }
  ],
  'currency-converter': [
    { name: 'default', v: { from: 'USD', to: 'INR', amount: 100, rate: 83.5 } },
    { name: 'boundary-zero', v: { from: 'USD', to: 'INR', amount: 0, rate: 0 } },
    { name: 'large', v: { from: 'EUR', to: 'JPY', amount: 1e12, rate: 200 } }
  ],
  'loan-emi': [
    { name: 'default', v: { principal: 500000, rate: 12, years: 5 } },
    { name: 'boundary-zero-rate', v: { principal: 12000, rate: 0, years: 1 } },
    { name: 'large', v: { principal: 1e12, rate: 100, years: 100 } }
  ],
  'capital-gain': [
    { name: 'default', v: { purchase: 1000000, sale: 1600000, buyCosts: 50000, sellCosts: 30000, taxRate: 10 } },
    { name: 'boundary-loss', v: { purchase: 1000, sale: 500, buyCosts: 0, sellCosts: 0, taxRate: 20 } },
    { name: 'large', v: { purchase: 1, sale: 1e12, buyCosts: 0, sellCosts: 0, taxRate: 100 } }
  ],
  'loan-against-property': [
    { name: 'default', v: { property: 8000000, ltv: 60, rate: 10, years: 15 } },
    { name: 'boundary-zero', v: { property: 0, ltv: 60, rate: 0, years: 1 } },
    { name: 'large', v: { property: 1e12, ltv: 100, rate: 100, years: 100 } }
  ],
  'home-loan-eligibility': [
    { name: 'default', v: { income: 150000, foir: 50, existing: 15000, rate: 8.5, years: 20 } },
    { name: 'boundary-zero', v: { income: 0, foir: 50, existing: 0, rate: 0, years: 1 } },
    { name: 'large', v: { income: 1e12, foir: 100, existing: 0, rate: 0, years: 100 } }
  ],
  'consumer-durable-loan': [
    { name: 'default', v: { price: 60000, down: 10000, rate: 12, years: 2, fee: 2 } },
    { name: 'boundary-zero', v: { price: 0, down: 0, rate: 0, years: 1, fee: 0 } },
    { name: 'large', v: { price: 1e12, down: 0, rate: 100, years: 100, fee: 100 } }
  ],
  'loan-prepayment-vs-sip': [
    { name: 'default', v: { balance: 3000000, rate: 9, years: 10, prepay: 500000, investmentReturn: 10 } },
    { name: 'boundary-zero', v: { balance: 0, rate: 0, years: 1, prepay: 0, investmentReturn: 0 } },
    { name: 'large', v: { balance: 1e12, rate: 100, years: 100, prepay: 1e12, investmentReturn: 100 } },
    { name: 'no-prepayment', v: { balance: 1000000, rate: 8, years: 5, prepay: 0, investmentReturn: 12 } },
    { name: 'zero-rate-full-prepayment', v: { balance: 120000, rate: 0, years: 1, prepay: 120000, investmentReturn: 0 } },
    { name: 'cash-exceeds-balance', v: { balance: 100000, rate: 12, years: 2, prepay: 150000, investmentReturn: 8 } }
  ],
  'property-calculator': [
    { name: 'default', v: { price: 6000000, down: 1200000, stamp: 5, registration: 1, rate: 8.5, years: 20, other: 100000 } },
    { name: 'boundary-zero', v: { price: 0, down: 0, stamp: 0, registration: 0, rate: 0, years: 1, other: 0 } },
    { name: 'large', v: { price: 1e12, down: 1e12, stamp: 100, registration: 100, rate: 100, years: 100, other: 1e12 } }
  ],
  'ppf-growth': [
    { name: 'default', v: { yearlyContribution: 150000, rate: 7.1, years: 15, initialBalance: 0 } },
    { name: 'boundary-zero-rate', v: { yearlyContribution: 10000, rate: 0, years: 1, initialBalance: 0 } },
    { name: 'large', v: { yearlyContribution: 1e8, rate: 30, years: 50, initialBalance: 1e9 } }
  ],
  'epf-growth': [
    { name: 'default', v: { monthlyBasic: 30000, employeePct: 12, employerPct: 3.67, salaryGrowth: 5, rate: 8.25, years: 25 } },
    { name: 'boundary-zero-rate', v: { monthlyBasic: 10000, employeePct: 0, employerPct: 0, salaryGrowth: 0, rate: 0, years: 1 } },
    { name: 'large', v: { monthlyBasic: 1e7, employeePct: 100, employerPct: 100, salaryGrowth: 50, rate: 30, years: 45 } }
  ],
  'gratuity': [
    { name: 'default', v: { salary: 50000, years: 10 } },
    { name: 'boundary-five-years', v: { salary: 50000, years: 4 } },
    { name: 'large', v: { salary: 1e8, years: 60 } }
  ],
  nps: [
    { name: 'default', v: { monthly: 5000, rate: 9, years: 25, annuityShare: 40, annuityRate: 6 } },
    { name: 'boundary-zero-rate', v: { monthly: 1000, rate: 0, years: 1, annuityShare: 40, annuityRate: 0 } },
    { name: 'large', v: { monthly: 1e8, rate: 100, years: 60, annuityShare: 100, annuityRate: 100 } }
  ],
  'hra-exemption': [
    { name: 'default', v: { basicDA: 50000, hra: 20000, rent: 25000, cityPct: 50 } },
    { name: 'boundary-zero', v: { basicDA: 0, hra: 0, rent: 0, cityPct: 0 } },
    { name: 'large', v: { basicDA: 1e8, hra: 1e8, rent: 1e8, cityPct: 100 } }
  ],
  'stamp-duty': [
    { name: 'default', v: { value: 6000000, stamp: 5, registration: 1 } },
    { name: 'boundary-zero', v: { value: 0, stamp: 0, registration: 0 } },
    { name: 'large', v: { value: 1e12, stamp: 100, registration: 100 } }
  ],
  'rule-of-72': [
    { name: 'default', v: { rate: 8, multiple: 3 } },
    { name: 'boundary-zero-rate', v: { rate: 0, multiple: 1 } },
    { name: 'large', v: { rate: 100, multiple: 1000 } }
  ]
};

test('prepayment comparison keeps the upfront cash and monthly EMI budget equivalent', () => {
  const noPrepayment = values('loan-prepayment-vs-sip', { balance: 1000000, rate: 8, years: 5, prepay: 0, investmentReturn: 12 });
  close(noPrepayment[5], 0, 'no-prepayment paths must converge');
  const fullPrepaymentAtSameRate = values('loan-prepayment-vs-sip', { balance: 120000, rate: 12, years: 2, prepay: 120000, investmentReturn: 12 });
  close(fullPrepaymentAtSameRate[5], 0, 'full prepayment and upfront investing converge when return equals loan rate');
});

for (const [id, scenarios] of Object.entries(cases)) {
  test(`independent reference: ${id}`, async t => {
    assert.ok(calculator(id), `definition exists: ${id}`);
    for (const scenario of scenarios) {
      await t.test(scenario.name, () => {
        const expected = reference(id, scenario.v);
        const actual = values(id, scenario.v);
        assert.equal(actual.length, expected.length, `${id}/${scenario.name}: output count`);
        expected.forEach((value, index) => close(actual[index], value, `${id}/${scenario.name}/output-${index}`));
      });
    }
  });
}
