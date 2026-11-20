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
  "currency-converter": [{ amount: 100, rate: 0.85, from: "USD", to: "EUR" }, [100, 85]]
};

assert.equal(mod.API_VERSION, "1.0.0");
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
assert.throws(() => mod.calculate("loan-emi", { principal: -1, annualRate: 5, months: 12 }), /principal must be between/);
assert.throws(() => mod.calculate("loan-emi", { principal: 1000, annualRate: 5, months: 0 }), /months must be between/);
assert.throws(() => mod.calculate("cagr", { startValue: 100, endValue: 120, years: 0 }), /greater than zero/);
assert.throws(() => mod.calculate("gst", { amount: 100, rate: 18, mode: "unknown" }), /mode must be/);
assert.throws(() => mod.calculate("currency-converter", { amount: 100, rate: 1, from: "US", to: "EUR" }), /three-letter currency codes/);
assert.throws(() => mod.calculate("compound-interest", { principal: 1e15, annualRate: 1000, years: 100, compoundingPerYear: 365 }), /supported numeric range/);

console.log("API calculation contract audit PASS — all " + mod.MODEL_LIST.length + " published models, golden outputs, invalid-input rejection and numeric-overflow guard.");
