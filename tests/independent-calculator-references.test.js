import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { CALCULATORS } = require('../calculators.js');
const byId = new Map(CALCULATORS.map(item => [item.id, item]));
const close = (actual, expected, label) => {
  const tolerance = Math.max(1e-7, Math.abs(expected) * 1e-10);
  assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance,
    `${label}: expected ${expected}, received ${actual}, tolerance ${tolerance}`);
};
const outputs = (id, inputs) => byId.get(id).compute(inputs).map(row => row.value);

// These reference calculations are deliberately implemented separately from
// calculators.js. Inputs are explicit and outputs are derived from the equations
// below rather than copied from the calculator implementation.

test('independent reference vectors — top 10 financial calculators', () => {
  // SIP: annuity-due FV; monthly contributions are invested at the start of month.
  {
    const v = { monthly: 200, rate: 10, years: 15, inflation: 6 };
    const i = v.rate / 1200, n = v.years * 12;
    const fv = v.monthly * (i === 0 ? n : ((Math.pow(1 + i, n) - 1) / i) * (1 + i));
    const paid = v.monthly * n;
    const actual = outputs('sip', v);
    [paid, fv - paid, fv, fv / Math.pow(1 + v.inflation / 100, v.years)]
      .forEach((expected, i) => close(actual[i], expected, `SIP output ${i}`));
  }

  // SWP: withdrawal occurs first, then the remaining balance earns monthly return.
  {
    const v = { corpus: 5000000, withdrawal: 30000, rate: 8, years: 20, stepUp: 5 };
    let balance = v.corpus, withdrawal = v.withdrawal, total = 0, fullMonths = 0;
    let exhausted = false;
    for (let month = 1; month <= v.years * 12; month++) {
      if (month > 1 && (month - 1) % 12 === 0) withdrawal *= 1 + v.stepUp / 100;
      const paid = Math.min(withdrawal, balance);
      balance -= paid; total += paid;
      if (paid + 0.005 < withdrawal) { exhausted = true; break; }
      fullMonths++;
      balance *= 1 + v.rate / 1200;
    }
    const actual = outputs('swp', v);
    [total, balance, balance + total - v.corpus, fullMonths / 12]
      .forEach((expected, i) => close(actual[i], expected, `SWP output ${i}`));
    assert.equal(exhausted, true);
  }

  // FIRE: annual target is inflation-adjusted expenses divided by withdrawal rate.
  {
    const v = { annualExpenses: 600000, currentSavings: 500000, monthlySavings: 40000, stepUp: 5, returnRate: 10, inflation: 6, withdrawalRate: 3.5 };
    let portfolio = v.currentSavings, saving = v.monthlySavings;
    let yearReached = -1, target = 0, spend = 0, portfolioAtTarget = 0;
    for (let year = 0; year <= 60; year++) {
      spend = v.annualExpenses * Math.pow(1 + v.inflation / 100, year);
      target = spend / (v.withdrawalRate / 100);
      portfolioAtTarget = portfolio;
      if (portfolio >= target) { yearReached = year; break; }
      if (year === 60) break;
      for (let month = 0; month < 12; month++) portfolio = (portfolio + saving) * (1 + v.returnRate / 1200);
      saving *= 1 + v.stepUp / 100;
    }
    const actual = outputs('fire', v);
    [yearReached < 0 ? 60 : yearReached, target, target / Math.pow(1 + v.inflation / 100, yearReached < 0 ? 60 : yearReached), portfolioAtTarget, spend]
      .forEach((expected, i) => close(actual[i], expected, `FIRE output ${i}`));
  }

  // EMI: standard amortizing-loan annuity formula.
  {
    const v = { principal: 250000, rate: 6.5, years: 25 };
    const n = v.years * 12, r = v.rate / 1200;
    const payment = v.principal * r / (1 - Math.pow(1 + r, -n));
    const actual = outputs('mortgage', v);
    [payment, payment * n, payment * n - v.principal]
      .forEach((expected, i) => close(actual[i], expected, `EMI output ${i}`));
  }

  // Lumpsum: annual compounding and purchasing-power adjustment.
  {
    const v = { principal: 100000, rate: 10, years: 10, inflation: 6 };
    const future = v.principal * Math.pow(1 + v.rate / 100, v.years);
    const actual = outputs('lumpsum', v);
    [v.principal, future - v.principal, future, future / Math.pow(1 + v.inflation / 100, v.years)]
      .forEach((expected, i) => close(actual[i], expected, `Lumpsum output ${i}`));
  }

  // Compound interest: nominal compounding m times per year.
  {
    const v = { principal: 5000, rate: 6, years: 10, inflation: 6, freq: '12' };
    const future = v.principal * Math.pow(1 + (v.rate / 100) / Number(v.freq), Number(v.freq) * v.years);
    const actual = outputs('compound-interest', v);
    [v.principal, future - v.principal, future, future / Math.pow(1 + v.inflation / 100, v.years)]
      .forEach((expected, i) => close(actual[i], expected, `Compound-interest output ${i}`));
  }

  // Rent vs buy: month-by-month amortization, rent escalation and portfolio compounding.
  {
    const v = { price: 8000000, downPct: 20, loanRate: 8.75, loanYears: 20, appreciation: 5, rent: 25000, rentGrowth: 5, investReturn: 10, maintPct: 1, buyCostPct: 6, horizon: 10 };
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
    const actual = outputs('rent-vs-buy', v);
    [emi, buyWorth, renter, Math.abs(buyWorth - renter)]
      .forEach((expected, i) => close(actual[i], expected, `Rent-vs-buy output ${i}`));
  }

  // SSY reference model: yearly deposit at year start, annual compounding to year end.
  {
    const v = { yearlyDeposit: 100000, depositYears: 15, rate: 8.2 };
    let balance = 0, deposited = 0, endOfDepositBalance = 0;
    for (let year = 1; year <= 21; year++) {
      if (year <= v.depositYears) { balance += v.yearlyDeposit; deposited += v.yearlyDeposit; }
      balance *= 1 + v.rate / 100;
      if (year === v.depositYears) endOfDepositBalance = balance;
    }
    const actual = outputs('ssy', v);
    [deposited, balance - deposited, balance, endOfDepositBalance]
      .forEach((expected, i) => close(actual[i], expected, `SSY output ${i}`));
  }

  // Income-tax planner is explicitly a flat effective-rate estimator, not a tax slab engine.
  {
    const v = { income: 1200000, deductions: 150000, rate: 15 };
    const taxable = Math.max(0, v.income - Math.min(v.income, v.deductions));
    const tax = taxable * v.rate / 100;
    const actual = outputs('income-tax-planner', v);
    [taxable, tax, tax / v.income * 100, v.income - tax]
      .forEach((expected, i) => close(actual[i], expected, `Income-tax estimator output ${i}`));
  }

  // GST-exclusive price: tax is taxable amount × rate; total is base plus tax.
  {
    const v = { amount: 100000, rate: 18 };
    const tax = v.amount * v.rate / 100;
    const actual = outputs('gst', v);
    [tax, v.amount + tax, v.amount]
      .forEach((expected, i) => close(actual[i], expected, `GST output ${i}`));
  }
});
