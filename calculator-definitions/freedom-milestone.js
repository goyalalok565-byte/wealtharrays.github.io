/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "freedom-milestone",
    slug: "retirement-calculator",
    title: "Freedom Milestone",
    category: "retirement",
    short: "Estimate the nest egg needed to cover your expenses indefinitely.",
    desc: "Uses the safe-withdrawal-rate method to estimate the portfolio size needed to sustain your current annual spending.",
    article: {
      formula: "Target corpus = Annual expenses ÷ Safe withdrawal rate. This comes from the widely-cited \"4% rule\": if you withdraw 4% of a portfolio per year, historical simulations suggest it has a reasonable chance of lasting 30+ years — dividing by 4% is the same as multiplying expenses by 25.",
      exampleInputs: { expenses: 30000, withdrawal: 4, current: 20000 },
      faqs: [
        { q: "Where does the 4% figure come from?", a: "It's based on historical U.S. market studies (the \"Trinity study\" and similar research) looking at how often a portfolio survived 30-year withdrawal periods. It's a rule of thumb, not a guarantee — markets, retirement length, and spending patterns all affect the real safe rate." },
        { q: "Does this account for inflation?", a: "The 4% rule as commonly cited already assumes you increase withdrawals with inflation each year. This calculator doesn't separately model inflation on the target itself — treat the result as being in today's money." },
        { q: "Is this the same as a pension projection?", a: "No — this estimates a self-funded portfolio target. It doesn't include any pension, social security, or annuity income you might also have." },
      ],
    },
    fields: [
      { id: "expenses", label: "Annual expenses", type: "number", default: 30000, min: 0, step: 500 },
      { id: "withdrawal", label: "Safe withdrawal rate", type: "number", default: 4, min: 1, max: 10, step: 0.1, suffix: "%" },
      { id: "current", label: "Current savings", type: "number", default: 20000, min: 0, step: 500 },
    ],
    compute(v) {
      const expenses = Math.max(Number(v.expenses) || 0, 0);
      const withdrawal = Math.max(Number(v.withdrawal) || 0, 0);
      const current = Math.max(Number(v.current) || 0, 0);
      const target = withdrawal > 0 ? expenses / (withdrawal / 100) : 0;
      const remaining = Math.max(target - current, 0);
      const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
      return [
        { label: "Target corpus", value: target, format: "currency", emphasis: "neutral" },
        { label: "Still needed", value: remaining, format: "currency", emphasis: remaining > 0 ? "negative" : "positive" },
        { label: "Progress", value: progress, format: "percent", emphasis: "positive" },
      ];
    },
  });
