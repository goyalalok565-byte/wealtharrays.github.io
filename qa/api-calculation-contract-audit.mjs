import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("functions/v1/_shared.js", "utf8");
const moduleSource = source.replace(/^export /gm, "");
const mod = await import("data:text/javascript;base64," + Buffer.from(
  moduleSource + "\nexport { API_VERSION, MODEL_LIST, calculate };"
).toString("base64"));

const cases = {
  sip: [{ monthly: 1000, annualRate: 12, years: 1 }, [12000, 809.328, 12809.328]],
  "loan-emi": [{ principal: 120000, annualRate: 0, months: 12 }, [10000, 120000, 0]],
  "home-loan-emi": [{ principal: 120000, annualRate: 0, months: 12 }, [10000, 120000, 0]],
  "compound-interest": [{ principal: 10000, annualRate: 12, years: 1, compoundingPerYear: 12 }, [10000, 1268.25, 11268.25]],
  "fixed-deposit": [{ principal: 10000, annualRate: 8, years: 1, compoundingPerYear: 4 }, [10000, 824.32, 10824.32]],
  lumpsum: [{ principal: 10000, annualRate: 10, years: 2, compoundingPerYear: 1 }, [10000, 2100, 12100]],
  gst: [{ amount: 100, rate: 18, mode: "exclusive" }, [100, 18, 118]],
  cagr: [{ startValue: 100, endValue: 121, years: 2 }, [100, 121, 10]],
  inflation: [{ currentCost: 100, annualInflationRate: 10, years: 2 }, [100, 121, 21]],
  "simple-interest": [{ principal: 1000, annualRate: 10, years: 2 }, [1000, 200, 1200]],
  "currency-converter": [{ amount: 100, rate: 0.85, from: "USD", to: "EUR" }, [100, 85]],
  roi: [{ cost: 1000, finalValue: 1500, years: 2 }, [1000, 500, 50]],
  "recurring-deposit": [{ monthly: 1000, annualRate: 0, years: 1 }, [12000, 0, 12000]],
  "net-worth": [{ cash: 1000, investments: 2000, property: 5000, debt: 3000 }, [8000, 3000, 5000]],
  "profit-margin": [{ revenue: 1000, cost: 700 }, [1000, 300, 30]],
  "sip-goal": [{ target: 120000, current: 0, annualRate: 0, years: 10 }, [1000, 0, 120000]],
  "car-loan": [{ price: 120000, down: 20000, annualRate: 0, years: 1 }, [8333.333333333334, 100000, 0]],
  mortgage: [{ principal: 120000, annualRate: 0, years: 1 }, [10000, 120000, 0]],
  "personal-loan": [{ principal: 120000, annualRate: 0, years: 1 }, [10000, 120000, 0]],
  "debt-payoff": [{ balance: 12000, payment: 1000, annualRate: 0 }, [12, 0, 12000]],
  "salary-hourly": [{ amount: 52000, hoursPerWeek: 40, weeksPerYear: 52 }, [25, 2080, 52000]],
  overtime: [{ hourly: 20, regular: 40, overtime: 10, multiplier: 1.5 }, [800, 300, 1100]],
  "freelance-rate": [{ income: 100000, expenses: 20000, hours: 20, weeks: 50 }, [120, 1000, 120000]],
  "freedom-milestone": [{ expenses: 600000, withdrawal: 4, current: 10000000 }, [15000000, 10000000, 5000000]],
  "emergency-fund": [{ expenses: 40000, targetMonths: 6, currentSavings: 100000, monthlySaving: 10000 }, [240000, 140000, 14]],
  "budget-50-30-20": [{ income: 80000, needsPct: 50, wantsPct: 30, actualNeeds: 45000, actualWants: 25000 }, [40000, 24000, 16000, 10000, 6000]],
  "break-even": [{ fixedCosts: 150000, price: 150, variableCost: 60, targetProfit: 50000, days: 30 }, [90, 1667, 250050, 1667 / 30, 2223]],
  "cost-of-delay": [{ monthly: 1000, annualRate: 0, years: 2, delay: 1 }, [24000, 12000, 12000, 2000]],
  "rule-of-72": [{ rate: 8, multiple: 3 }, [9, 9.006468342000588, -0.006468342000587768, 14.274914586003177]],
  "credit-card-payoff": [{ balance: 80000, apr: 36, payment: 8000 }, [13, 16540.373489041325, 96540.37348904133]]
};

assert.equal(mod.API_VERSION, "1.2.0");
assert.equal(mod.MODEL_LIST.length, Object.keys(cases).length, "Every published API model must have a contract vector");
assert.deepEqual(mod.MODEL_LIST.map(model => model.id).sort(), Object.keys(cases).sort(), "Published model catalogue and contract vectors must match");

for (const model of mod.MODEL_LIST) {
  const [inputs, expected] = cases[model.id];
  const output = mod.calculate(model.id, inputs);
  assert.ok(output.assumptions && output.assumptions.length > 0, model.id + ": assumptions must be explicit");
  assert.equal(output.results.length, expected.length, model.id + ": result count changed");
  output.results.forEach((row, index) => {
    assert.equal(typeof row.value, "number", model.id + "/" + row.label + ": value must be numeric");
    assert.ok(Number.isFinite(row.value), model.id + "/" + row.label + ": value must be finite");
    assert.ok(Math.abs(row.value - expected[index]) <= Math.max(0.02, Math.abs(expected[index]) * 1e-6),
      model.id + "/" + row.label + ": expected " + expected[index] + ", got " + row.value);
  });
}

assert.throws(() => mod.calculate("not-a-model", {}), error => error.unsupported === true);
assert.throws(() => mod.calculate("roi", { cost: 0, finalValue: 10, years: 1 }), /cost must be between/);
assert.throws(() => mod.calculate("profit-margin", { revenue: 0, cost: 10 }), /revenue must be between/);
assert.throws(() => mod.calculate("sip-goal", { target: 100000, current: 0, annualRate: 5, years: 0 }), /years must be between/);
assert.throws(() => mod.calculate("car-loan", { price: 1000, down: 1200, annualRate: 5, years: 1 }), /down payment cannot exceed/);
assert.throws(() => mod.calculate("debt-payoff", { balance: 10000, payment: 10, annualRate: 12 }), /payment must exceed/);
assert.throws(() => mod.calculate("salary-hourly", { amount: 50000, hoursPerWeek: 0, weeksPerYear: 52 }), /hoursPerWeek must be between/);
assert.throws(() => mod.calculate("loan-emi", { principal: -1, annualRate: 5, months: 12 }), /principal must be between/);
assert.throws(() => mod.calculate("loan-emi", { principal: 1000, annualRate: 5, months: 0 }), /months must be between/);
assert.throws(() => mod.calculate("cost-of-delay", { monthly: 1000, annualRate: 5, years: 2, delay: 3 }), /delay must not exceed years/);
assert.equal(mod.calculate("break-even", { fixedCosts: 1000, price: 10, variableCost: 10, targetProfit: 100, days: 30 }).results[1].value, 0, "No positive contribution means no break-even volume.");
assert.throws(() => mod.calculate("cagr", { startValue: 100, endValue: 120, years: 0 }), /greater than zero/);
assert.throws(() => mod.calculate("gst", { amount: 100, rate: 18, mode: "unknown" }), /mode must be/);
assert.throws(() => mod.calculate("currency-converter", { amount: 100, rate: 1, from: "US", to: "EUR" }), /three-letter currency codes/);
assert.throws(() => mod.calculate("compound-interest", { principal: 1e15, annualRate: 1000, years: 100, compoundingPerYear: 365 }), /supported numeric range/);

console.log("API calculation contract audit PASS — all " + mod.MODEL_LIST.length + " published models, golden outputs, invalid-input rejection and numeric-overflow guard.");
