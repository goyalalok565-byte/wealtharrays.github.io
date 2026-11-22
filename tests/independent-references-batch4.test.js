import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { CALCULATORS } = require('../calculators.js');
const byId = new Map(CALCULATORS.map(item => [item.id, item]));
const actual = (id, input) => byId.get(id).compute(input).map(row => row.value);
const close = (received, expected, label) => {
  if (expected === null) {
    assert.equal(received, null, label + ': expected an explicitly undefined ratio');
    return;
  }
  const tolerance = Math.max(1e-7, Math.abs(expected) * 1e-10);
  assert.ok(Number.isFinite(received) && Math.abs(received - expected) <= tolerance,
    label + ': expected ' + expected + ', received ' + received + ', tolerance ' + tolerance);
};

test('ROI — independent return equations and zero-cost denominator', () => {
  for (const v of [
    { cost: 10000, finalValue: 14500, years: 3 },
    { cost: 0, finalValue: 14500, years: 3 },
    { cost: 10000, finalValue: 0, years: 2 },
    { cost: 25000, finalValue: 18000, years: 1.5 }
  ]) {
    const gain = v.finalValue - v.cost;
    const roi = v.cost === 0 ? null : gain / v.cost * 100;
    const annualized = v.cost === 0 ? null : (Math.pow(v.finalValue / v.cost, 1 / v.years) - 1) * 100;
    actual('roi', v).forEach((value, i) => close(value, [gain, roi, annualized][i], 'ROI vector ' + JSON.stringify(v) + ' output ' + i));
  }
});

test('Profit margin — independent gross/net equations and zero-revenue denominator', () => {
  for (const v of [
    { revenue: 50000, cogs: 28000, expenses: 9000 },
    { revenue: 0, cogs: 28000, expenses: 9000 },
    { revenue: 100000, cogs: 100000, expenses: 0 },
    { revenue: 100000, cogs: 125000, expenses: 10000 }
  ]) {
    const gross = v.revenue - v.cogs;
    const net = gross - v.expenses;
    const grossMargin = v.revenue === 0 ? null : gross / v.revenue * 100;
    const netMargin = v.revenue === 0 ? null : net / v.revenue * 100;
    actual('profit-margin', v).forEach((value, i) => close(value, [gross, grossMargin, net, netMargin][i], 'Profit-margin vector ' + JSON.stringify(v) + ' output ' + i));
  }
});

test('Silver jewellery — independent fine-metal, making-charge and tax calculation', () => {
  for (const v of [
    { rate: 100, weight: 50, purity: 92.5, making: 10, tax: 3 },
    { rate: 0, weight: 50, purity: 92.5, making: 10, tax: 3 },
    { rate: 100, weight: 0, purity: 99.9, making: 0, tax: 0 }
  ]) {
    const metal = v.rate * v.weight * v.purity / 100;
    const making = metal * v.making / 100;
    const tax = (metal + making) * v.tax / 100;
    actual('silver-jewelry', v).forEach((value, i) => close(value, [metal, making, tax, metal + making + tax][i], 'Silver vector ' + JSON.stringify(v) + ' output ' + i));
  }
});

test('Gold jewellery — independent purity, wastage, making and tax calculation', () => {
  for (const v of [
    { rate: 7500, weight: 10, purity: 91.6, wastage: 5, making: 10, tax: 3 },
    { rate: 0, weight: 10, purity: 91.6, wastage: 5, making: 10, tax: 3 },
    { rate: 7500, weight: 0, purity: 99.9, wastage: 0, making: 0, tax: 0 }
  ]) {
    const metal = v.rate * v.weight * v.purity / 100;
    const waste = metal * v.wastage / 100;
    const making = (metal + waste) * v.making / 100;
    const tax = (metal + waste + making) * v.tax / 100;
    actual('gold-jewelry', v).forEach((value, i) => close(value, [metal, waste, making, tax, metal + waste + making + tax][i], 'Gold vector ' + JSON.stringify(v) + ' output ' + i));
  }
});

test('Credit-card payoff — independent monthly amortization, no-payoff and zero-balance cases', () => {
  for (const v of [
    { balance: 80000, apr: 36, payment: 8000 },
    { balance: 80000, apr: 0, payment: 8000 },
    { balance: 80000, apr: 36, payment: 2400 },
    { balance: 0, apr: 36, payment: 8000 }
  ]) {
    let balance = Math.max(v.balance, 0), interestPaid = 0, totalPaid = 0, months = 0;
    const monthlyRate = Math.max(v.apr, 0) / 1200;
    let expected;
    if (v.payment <= balance * monthlyRate && balance > 0) {
      expected = [0, balance * monthlyRate, balance * monthlyRate + 1];
    } else {
      while (balance > 0.005 && months < 1200) {
        const interest = balance * monthlyRate;
        interestPaid += interest;
        const paid = Math.min(balance + interest, Math.max(v.payment, 0));
        totalPaid += paid;
        balance = Math.max(0, balance + interest - paid);
        months++;
      }
      expected = balance > 0.005
        ? [1200, balance, interestPaid]
        : [months, interestPaid, totalPaid];
    }
    actual('credit-card-payoff', v).forEach((value, i) => close(value, expected[i], 'Credit-card vector ' + JSON.stringify(v) + ' output ' + i));
  }
});
