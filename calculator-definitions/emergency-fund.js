/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "emergency-fund",
    slug: "emergency-fund-calculator",
    title: "Emergency Fund Calculator",
    category: "retirement",
    short: "Set an emergency savings target based on monthly expenses.",
    desc: "Estimate a cash reserve target, your current shortfall and how long it may take to reach the goal.",
    article: {
      formula: "Target emergency fund = essential monthly expenses × target months. Savings gap = max(0, target fund − current savings). Estimated months to goal = savings gap ÷ monthly contribution, assuming the contribution remains constant and no money is withdrawn.",
      exampleInputs: { expenses: 40000, targetMonths: 6, currentSavings: 100000, monthlySaving: 10000 },
      faqs: [
        { q: "How many months of expenses should I save?", a: "The right buffer depends on income stability, dependants, insurance, debt and likely unexpected costs. Six months is a common planning starting point, not a universal rule." },
        { q: "Does the estimate include interest or inflation?", a: "No. It assumes a fixed monthly savings contribution and does not add interest, taxes or changes in expenses." }
      ]
    },
    fields: [
      { id: "expenses", label: "Essential monthly expenses", type: "number", default: 40000, min: 0, max: 100000000, step: 500 },
      { id: "targetMonths", label: "Months of expenses to cover", type: "number", default: 6, min: 1, max: 36, step: 1, suffix: "months" },
      { id: "currentSavings", label: "Existing emergency savings", type: "number", default: 100000, min: 0, max: 1000000000, step: 1000 },
      { id: "monthlySaving", label: "Monthly amount you can add", type: "number", default: 10000, min: 0, max: 100000000, step: 500 }
    ],
    compute(v) {
      const target = v.expenses * v.targetMonths;
      const gap = Math.max(0, target - v.currentSavings);
      const months = gap === 0 ? 0 : v.monthlySaving > 0 ? Math.ceil(gap / v.monthlySaving) : 0;
      return [
        { label: "Emergency fund target", value: target, format: "currency", emphasis: "neutral" },
        { label: "Additional savings needed", value: gap, format: "currency", emphasis: gap > 0 ? "negative" : "positive" },
        { label: "Months to target (0 = already funded or no monthly saving)", value: months, format: "number" }
      ];
    }
  });
