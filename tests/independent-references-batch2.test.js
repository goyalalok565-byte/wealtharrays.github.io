import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { calculator, values, close } = require('./helpers.js');

const annuityPayment = (principal, annualRate, months) => {
  const p = Math.max(principal, 0), n = Math.max(1, months), r = Math.max(annualRate, 0) / 1200;
  return p === 0 ? 0 : r === 0 ? p / n : p * r / (1 - Math.pow(1 + r, -n));
};

function reference(id, v) {
  switch (id) {
    case 'simple-interest': {
      const interest = v.principal * v.rate * v.years / 100;
      return [interest, v.principal + interest];
    }
    case 'cagr': {
      const s = Math.max(v.start, 0), e = Math.max(v.end, 0), y = Math.max(v.years, 0);
      return [e - s, s > 0 ? (e / s - 1) * 100 : 0,
        s > 0 && y > 0 ? (Math.pow(e / s, 1 / y) - 1) * 100 : 0];
    }
    case 'fixed-deposit': {
      const p = Math.max(v.principal, 0), r = Math.max(v.rate, 0) / 100;
      const y = Math.max(v.years, 0), f = Math.max(1, Number(v.freq) || 1);
      const a = p * Math.pow(1 + r / f, f * y);
      return [p, a - p, a, a / Math.pow(1 + Math.max(v.inflation, 0) / 100, y)];
    }
    case 'recurring-deposit': {
      const n = Math.max(0, Math.round(v.years * 12)), p = Math.max(v.monthly, 0), r = v.rate / 1200;
      const a = r === 0 ? p * n : p * (Math.pow(1 + r, n) - 1) / r;
      return [n, p * n, a - p * n, a, a / Math.pow(1 + v.inflation / 100, v.years)];
    }
    case 'car-loan': {
      const price = Math.max(v.price, 0), down = Math.min(Math.max(v.down, 0), price);
      const p = price - down, n = Math.max(1, Math.round(Math.max(v.years, 0) * 12));
      const emi = annuityPayment(p, v.rate, n), total = emi * n;
      return [p, emi, total, total - p, total + down];
    }
    case 'personal-loan': {
      const n = Math.max(1, Math.round(Math.max(v.years, 0) * 12)), p = Math.max(v.principal, 0);
      const emi = annuityPayment(p, v.rate, n), total = emi * n;
      return [n, emi, total, total - p];
    }
    case 'home-loan-emi': {
      const p = Math.max(v.principal, 0), n = Math.max(1, Math.round(v.years * 12));
      const emi = annuityPayment(p, v.rate, n), total = emi * n;
      return [emi, total, total - p];
    }
    case 'loan-interest': {
      const p = Math.max(v.principal, 0), n = Math.max(1, Math.round(v.years * 12));
      const emi = annuityPayment(p, v.rate, n), total = emi * n;
      return [emi, p, total - p, total];
    }
    case 'step-up-sip': {
      let balance = 0, invested = 0;
      const r = v.rate / 1200;
      for (let year = 0; year < v.years; year++) {
        const payment = v.monthly * Math.pow(1 + v.stepUp / 100, year);
        for (let month = 0; month < 12; month++) {
          balance = (balance + payment) * (1 + r);
          invested += payment;
        }
      }
      return [balance, invested, balance - invested];
    }
    case 'sip-goal': {
      const n = v.years * 12, r = v.rate / 1200;
      const current = v.current * Math.pow(1 + r, n), gap = Math.max(0, v.target - current);
      const factor = r === 0 ? n : (Math.pow(1 + r, n) - 1) / r * (1 + r);
      return [gap === 0 ? 0 : gap / factor, current, gap];
    }
    case 'lumpsum-sip': {
      const p = Math.max(v.lumpsum, 0), m = Math.max(v.monthly, 0), r = Math.max(v.rate, 0) / 1200;
      const n = Math.max(1, Math.round(v.years * 12));
      const lump = p * Math.pow(1 + r, n);
      const sip = r === 0 ? m * n : m * (Math.pow(1 + r, n) - 1) / r * (1 + r);
      const invested = p + m * n, total = lump + sip;
      return [invested, total - invested, total];
    }
    case 'ltv': {
      const p = Math.max(v.property, 0), loan = Math.max(v.loan, 0);
      return [p > 0 ? loan / p * 100 : 0, Math.max(p - loan, 0), loan];
    }
    case 'emergency-fund': {
      const target = v.expenses * v.targetMonths, gap = Math.max(0, target - v.currentSavings);
      return [target, gap, gap === 0 ? 0 : v.monthlySaving > 0 ? Math.ceil(gap / v.monthlySaving) : 0];
    }
    case 'net-worth': {
      const assets = Math.max(v.cash, 0) + Math.max(v.investments, 0) + Math.max(v.property, 0);
      const debt = Math.max(v.debt, 0);
      return [assets, debt, assets - debt];
    }
    case 'salary-hourly': {
      const hours = v.hoursPerWeek * v.weeksPerYear;
      return v.direction === 'toHourly' ? [hours, hours === 0 ? 0 : v.amount / hours] : [hours, v.amount * hours];
    }
    case 'overtime': {
      const regular = Math.max(v.hourly, 0) * Math.max(v.regular, 0);
      const extra = Math.max(v.hourly, 0) * Math.max(v.overtime, 0) * Math.max(v.multiplier, 1);
      return [regular, extra, regular + extra];
    }
    case 'freelance-rate': {
      const hours = Math.max(v.hours, 0) * Math.max(v.weeks, 0);
      const needed = Math.max(v.income, 0) + Math.max(v.expenses, 0);
      return [needed, hours, hours ? needed / hours : 0];
    }
    case 'debt-payoff': {
      const balance = Math.max(v.balance, 0), payment = Math.max(v.payment, 0), r = Math.max(v.rate, 0) / 1200;
      if (balance === 0) return [0, 0, 0];
      if (payment <= balance * r) return [balance * r, payment, Math.max(balance * r - payment, 0)];
      const exact = r === 0 ? balance / payment : -Math.log(1 - r * balance / payment) / Math.log(1 + r);
      const months = Math.max(1, Math.ceil(exact));
      let remaining = balance, paid = 0;
      for (let m = 0; m < Math.min(months, 1200); m++) {
        remaining *= 1 + r;
        const due = Math.min(payment, remaining);
        paid += due;
        remaining = Math.max(remaining - due, 0);
        if (remaining <= 1e-8) break;
      }
      if (remaining > 1e-8 || months > 1200) {
        return [1200, remaining, Math.max(paid - (balance - remaining), 0)];
      }
      return [months, months / 12, Math.max(paid - balance, 0)];
    }
    case 'inflation': {
      const amount = Math.max(v.amount, 0), rate = Math.max(v.rate, 0), years = Math.max(v.years, 0);
      const factor = Math.pow(1 + rate / 100, years), future = amount * factor;
      return [future, future - amount, amount / factor];
    }
    case 'flat-cost': {
      const p = Math.max(v.price, 0), stamp = p * Math.max(v.stamp, 0) / 100;
      const registration = p * Math.max(v.registration, 0) / 100;
      const other = Math.max(v.furnishing, 0) + Math.max(v.other, 0);
      return [stamp, registration, other, p + stamp + registration + other];
    }
    default: throw new Error('No independent reference implemented for ' + id);
  }
}

const vectors = {
  'simple-interest': [
    { name: 'default', input: { principal: 5000, rate: 8, years: 2 } },
    { name: 'boundary-zero', input: { principal: 0, rate: 0, years: 0 } },
    { name: 'large', input: { principal: 1e12, rate: 1000, years: 40 } }
  ],
  cagr: [
    { name: 'default', input: { start: 100000, end: 161051, years: 5 } },
    { name: 'boundary-zero-start', input: { start: 0, end: 0, years: 1 } },
    { name: 'large', input: { start: 0.01, end: 1e12, years: 200 } }
  ],
  'fixed-deposit': [
    { name: 'default', input: { principal: 100000, rate: 7, years: 5, inflation: 6, freq: '4' } },
    { name: 'boundary-zero', input: { principal: 0, rate: 0, years: 0, inflation: 0, freq: '4' } },
    { name: 'large', input: { principal: 1e12, rate: 100, years: 100, inflation: 0, freq: '12' } }
  ],
  'recurring-deposit': [
    { name: 'default', input: { monthly: 5000, rate: 7, years: 5, inflation: 6 } },
    { name: 'boundary-zero', input: { monthly: 0, rate: 0, years: 0, inflation: 0 } },
    { name: 'large', input: { monthly: 1e8, rate: 100, years: 100, inflation: 0 } }
  ],
  'car-loan': [
    { name: 'default', input: { price: 1000000, down: 200000, rate: 9, years: 5 } },
    { name: 'boundary-zero', input: { price: 0, down: 0, rate: 0, years: 1 } },
    { name: 'large', input: { price: 1e12, down: 0, rate: 40, years: 15 } }
  ],
  'personal-loan': [
    { name: 'default', input: { principal: 500000, rate: 12, years: 5 } },
    { name: 'boundary-zero', input: { principal: 0, rate: 0, years: 1 / 12 } },
    { name: 'large', input: { principal: 1e12, rate: 60, years: 20 } }
  ],
  'home-loan-emi': [
    { name: 'default', input: { principal: 5000000, rate: 8.5, years: 20 } },
    { name: 'boundary-zero', input: { principal: 0, rate: 0, years: 1 } },
    { name: 'large', input: { principal: 1e12, rate: 100, years: 100 } }
  ],
  'loan-interest': [
    { name: 'default', input: { principal: 1000000, rate: 10, years: 10 } },
    { name: 'boundary-zero', input: { principal: 0, rate: 0, years: 1 } },
    { name: 'large', input: { principal: 1e12, rate: 100, years: 100 } }
  ],
  'step-up-sip': [
    { name: 'default', input: { monthly: 5000, stepUp: 10, rate: 12, years: 15 } },
    { name: 'boundary-zero', input: { monthly: 0, stepUp: 0, rate: 0, years: 1 } },
    { name: 'large', input: { monthly: 1e8, stepUp: 100, rate: 100, years: 60 } }
  ],
  'sip-goal': [
    { name: 'default', input: { target: 5000000, current: 500000, rate: 10, years: 15 } },
    { name: 'boundary-zero', input: { target: 0, current: 0, rate: 0, years: 1 } },
    { name: 'large', input: { target: 1e12, current: 0, rate: 100, years: 80 } }
  ],
  'lumpsum-sip': [
    { name: 'default', input: { lumpsum: 500000, monthly: 10000, rate: 10, years: 10 } },
    { name: 'boundary-zero', input: { lumpsum: 0, monthly: 0, rate: 0, years: 1 } },
    { name: 'large', input: { lumpsum: 1e12, monthly: 1e8, rate: 100, years: 100 } }
  ],
  ltv: [
    { name: 'default', input: { property: 8000000, loan: 4800000 } },
    { name: 'boundary-zero-property', input: { property: 0, loan: 0 } },
    { name: 'large', input: { property: 1e12, loan: 1e12 } }
  ],
  'emergency-fund': [
    { name: 'default', input: { expenses: 40000, targetMonths: 6, currentSavings: 100000, monthlySaving: 10000 } },
    { name: 'boundary-zero', input: { expenses: 0, targetMonths: 1, currentSavings: 0, monthlySaving: 0 } },
    { name: 'large', input: { expenses: 1e8, targetMonths: 36, currentSavings: 0, monthlySaving: 1e8 } }
  ],
  'net-worth': [
    { name: 'default', input: { cash: 200000, investments: 500000, property: 3000000, debt: 1500000 } },
    { name: 'boundary-zero', input: { cash: 0, investments: 0, property: 0, debt: 0 } },
    { name: 'large', input: { cash: 1e12, investments: 1e12, property: 1e12, debt: 1e12 } }
  ],
  'salary-hourly': [
    { name: 'default', input: { direction: 'toHourly', amount: 60000, hoursPerWeek: 40, weeksPerYear: 48 } },
    { name: 'boundary-zero', input: { direction: 'toHourly', amount: 0, hoursPerWeek: 1, weeksPerYear: 1 } },
    { name: 'large', input: { direction: 'toSalary', amount: 1e12, hoursPerWeek: 100, weeksPerYear: 52 } }
  ],
  overtime: [
    { name: 'default', input: { hourly: 500, regular: 160, overtime: 20, multiplier: 1.5 } },
    { name: 'boundary-zero', input: { hourly: 0, regular: 0, overtime: 0, multiplier: 1 } },
    { name: 'large', input: { hourly: 1e9, regular: 744, overtime: 744, multiplier: 5 } }
  ],
  'freelance-rate': [
    { name: 'default', input: { income: 1200000, expenses: 200000, hours: 25, weeks: 48 } },
    { name: 'boundary-zero', input: { income: 0, expenses: 0, hours: 0.1, weeks: 1 } },
    { name: 'large', input: { income: 1e12, expenses: 1e12, hours: 0.1, weeks: 1 } }
  ],
  'debt-payoff': [
    { name: 'default', input: { balance: 100000, rate: 18, payment: 3000 } },
    { name: 'boundary-zero-balance', input: { balance: 0, rate: 0, payment: 0.01 } },
    { name: 'large', input: { balance: 1e12, rate: 100, payment: 1e11 } }
  ],
  inflation: [
    { name: 'default', input: { amount: 100000, rate: 6, years: 20 } },
    { name: 'boundary-zero', input: { amount: 0, rate: 0, years: 0 } },
    { name: 'large', input: { amount: 1e12, rate: 1000, years: 200 } }
  ],
  'flat-cost': [
    { name: 'default', input: { price: 6000000, stamp: 5, registration: 1, furnishing: 300000, other: 100000 } },
    { name: 'boundary-zero', input: { price: 0, stamp: 0, registration: 0, furnishing: 0, other: 0 } },
    { name: 'large', input: { price: 1e12, stamp: 100, registration: 100, furnishing: 1e12, other: 1e12 } }
  ]
};

for (const [id, scenarios] of Object.entries(vectors)) {
  test(`independent reference: ${id}`, async t => {
    assert.ok(calculator(id), `definition exists: ${id}`);
    for (const scenario of scenarios) {
      await t.test(scenario.name, () => {
        const expected = reference(id, scenario.input);
        const actual = values(id, scenario.input);
        assert.equal(actual.length, expected.length, `${id}/${scenario.name}: output count`);
        expected.forEach((value, index) => close(actual[index], value, `${id}/${scenario.name}/output-${index}`));
      });
    }
  });
}
