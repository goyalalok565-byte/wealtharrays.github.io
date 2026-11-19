/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "rule-of-72",
    slug: "rule-of-72-calculator",
    title: "Rule of 72 Calculator",
    category: "investment",
    short: "Find how many years it takes money to double at a given annual return.",
    desc: "Estimate the doubling time with the Rule of 72, compare it with exact compounding and see the time to reach any growth multiple.",
    article: {
      formula: "Rule of 72: years to double ≈ 72 ÷ annual rate in percent. Exact compounding: years to double = ln(2) ÷ ln(1 + rate). Years to reach a multiple M = ln(M) ÷ ln(1 + rate). The rule is a mental shortcut that is most accurate for rates between roughly 6% and 10%.",
      exampleInputs: { rate: 8, multiple: 3 },
      faqs: [
        { q: "Why 72 and not 70 or 69?", a: "72 divides evenly by many common rates such as 6, 8, 9 and 12, which makes mental arithmetic easy. 69.3 is more exact for continuous compounding, and 70 is often used for low rates." },
        { q: "Is the rule accurate at very high or very low rates?", a: "It drifts. At very low rates the shortcut slightly overstates the doubling time and at very high rates it understates it. The exact figure on this page shows the size of the gap." },
        { q: "Does it work for inflation?", a: "Yes. Dividing 72 by the inflation rate gives the approximate years in which prices double, which is also the time purchasing power halves." }
      ]
    },
    fields: [
      { id: "rate", label: "Annual return or inflation rate", type: "number", default: 8, min: 0, max: 100, step: 0.1, suffix: "%" },
      { id: "multiple", label: "Target growth multiple", type: "number", default: 3, min: 1, max: 1000, step: 0.5, suffix: "x" }
    ],
    compute(v) {
      const rate = Math.max(0, Number(v.rate) || 0);
      const multiple = Math.max(1, Number(v.multiple) || 1);
      const growth = 1 + rate / 100;
      const rule = rate > 0 ? 72 / rate : 0;
      const exact = rate > 0 ? Math.log(2) / Math.log(growth) : 0;
      const target = rate > 0 ? Math.log(multiple) / Math.log(growth) : 0;
      return [
        { label: "Years to double (Rule of 72)", value: rule, format: "years", emphasis: "neutral" },
        { label: "Years to double (exact compounding)", value: exact, format: "years", emphasis: "positive" },
        { label: "Rule of 72 minus exact", value: rule - exact, format: "years" },
        { label: "Years to reach the target multiple", value: target, format: "years", emphasis: "positive" }
      ];
    }
  });
