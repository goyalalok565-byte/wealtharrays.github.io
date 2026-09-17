/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "simple-interest",
    slug: "simple-interest-calculator",
    title: "Simple Interest",
    category: "banking",
    short: "Flat, non-compounding interest on a loan or deposit.",
    desc: "Calculate interest that accrues at a fixed rate on the original principal only — used for short-term loans and basic credit.",
    article: {
      formula: "SI = (P × R × T) / 100, where P is the principal, R is the annual interest rate as a percentage, and T is the time in years.",
      exampleInputs: { principal: 5000, rate: 8, years: 2 },
      faqs: [
        { q: "Where is simple interest actually used?", a: "It's common for short-term loans, some certificates of deposit, and basic consumer credit agreements — anywhere interest is calculated once on the original amount rather than recalculated on a growing balance." },
        { q: "Do credit cards use simple interest?", a: "Most credit cards actually compound daily, which behaves more like the compound interest calculator on this site — check your card's terms rather than assuming." },
        { q: "Which is better for a saver — simple or compound?", a: "Compound interest earns more over time for a saver, since interest is added to the balance and itself earns interest. Simple interest earns more for a borrower, since the interest owed doesn't grow on itself." },
      ],
    },
    fields: [
      { id: "principal", label: "Principal amount", type: "number", default: 5000, min: 0, step: 100 },
      { id: "rate", label: "Annual interest rate", type: "number", default: 8, min: 0, max: 1000, step: 0.1, suffix: "%" },
      { id: "years", label: "Time period", type: "number", default: 2, min: 0.1, max: 40, step: 0.1, suffix: "yrs" },
    ],
    compute(v) {
      const si = (v.principal * v.rate * v.years) / 100;
      return [
        { label: "Interest", value: si, format: "currency", emphasis: "positive" },
        { label: "Total amount", value: v.principal + si, format: "currency", emphasis: "neutral" },
      ];
    },
  });
