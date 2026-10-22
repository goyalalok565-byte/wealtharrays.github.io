/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "ppf-growth",
    slug: "ppf-calculator",
    title: "PPF Calculator",
    category: "banking",
    short: "Estimate Public Provident Fund growth from annual contributions.",
    desc: "Project a PPF balance from an annual contribution, an assumed interest rate and a chosen period.",
    article: {
      formula: "This estimate adds the annual contribution at the start of each year and then applies the assumed annual rate: balance = (previous balance + annual contribution) × (1 + rate). Actual PPF rules, contribution limits and notified rates can change.",
      exampleInputs: { yearlyContribution: 150000, rate: 7.1, years: 15, initialBalance: 0 },
      faqs: [
        { q: "Is the interest rate guaranteed for the full period?", a: "No. PPF rates are notified periodically and can change. Treat the rate entered here as an assumption and check current official rules." },
        { q: "Does this calculate tax benefits?", a: "No. This tool estimates account growth only; it does not determine eligibility for deductions or tax treatment." }
      ]
    },
    fields: [
      { id: "yearlyContribution", label: "Annual contribution", type: "number", default: 150000, min: 0, max: 100000000, step: 1000 },
      { id: "rate", label: "Assumed annual interest rate", type: "number", default: 7.1, min: 0, max: 30, step: 0.05, suffix: "%" },
      { id: "years", label: "Investment period", type: "number", default: 15, min: 1, max: 50, step: 1, suffix: "yrs" },
      { id: "initialBalance", label: "Existing balance", type: "number", default: 0, min: 0, max: 1000000000, step: 1000 }
    ],
    compute(v) {
      let balance = v.initialBalance, contributed = v.initialBalance;
      for (let year = 0; year < v.years; year++) {
        balance = (balance + v.yearlyContribution) * (1 + v.rate / 100);
        contributed += v.yearlyContribution;
      }
      return [
        { label: "Projected balance", value: balance, format: "currency", emphasis: "positive" },
        { label: "Total contributions incl. opening balance", value: contributed, format: "currency" },
        { label: "Estimated growth", value: balance - contributed, format: "currency", emphasis: "neutral" }
      ];
    }
  });
