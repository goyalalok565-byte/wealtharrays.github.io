/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "fire",
    slug: "fire-calculator",
    title: "FIRE Calculator",
    category: "retirement",
    short: "Estimate the years left until your savings can cover your spending.",
    desc: "Estimate how many years until financial independence, using spending, savings, inflation, return and a withdrawal rate.",
    article: {
      formula: "Each year the required corpus is annual spending (grown by inflation) ÷ withdrawal rate. The portfolio grows by the assumed return with monthly contributions, and the monthly contribution rises once a year by the step-up percentage. The first year in which the portfolio reaches the required corpus is the estimated time to financial independence, capped at 60 years. Taxes, healthcare shocks and return volatility are not modelled.",
      exampleInputs: { annualExpenses: 600000, currentSavings: 500000, monthlySavings: 40000, stepUp: 5, returnRate: 10, inflation: 6, withdrawalRate: 3.5 },
      faqs: [
        { q: "What withdrawal rate should I use?", a: "The popular 4% guideline comes from long US market history. Because inflation is higher and horizons are longer in many cases, a lower assumption such as 3% to 3.5% is more cautious. Try both." },
        { q: "Why does the target corpus keep growing?", a: "Spending rises with inflation every year, so the corpus needed in the future is larger in rupee terms. The calculator also shows the corpus in today's money so the two are easy to compare." },
        { q: "Is this a retirement date I can rely on?", a: "No. It is a planning estimate based on steady returns. Real markets are uneven, so treat the result as a range and review it every year." }
      ]
    },
    fields: [
      { id: "annualExpenses", label: "Annual spending in today's money", type: "number", default: 600000, min: 0, max: 1000000000, step: 10000 },
      { id: "currentSavings", label: "Current investable savings", type: "number", default: 500000, min: 0, max: 100000000000, step: 10000 },
      { id: "monthlySavings", label: "Monthly savings", type: "number", default: 40000, min: 0, max: 1000000000, step: 1000 },
      { id: "stepUp", label: "Yearly increase in savings", type: "number", default: 5, min: 0, max: 50, step: 0.5, suffix: "%" },
      { id: "returnRate", label: "Expected annual return", type: "number", default: 10, min: 0, max: 30, step: 0.1, suffix: "%" },
      { id: "inflation", label: "Expected annual inflation", type: "number", default: 6, min: 0, max: 30, step: 0.1, suffix: "%" },
      { id: "withdrawalRate", label: "Safe withdrawal rate", type: "number", default: 3.5, min: 0.5, max: 10, step: 0.1, suffix: "%" }
    ],
    compute(v) {
      const spending = Math.max(0, Number(v.annualExpenses) || 0);
      let portfolio = Math.max(0, Number(v.currentSavings) || 0);
      let saving = Math.max(0, Number(v.monthlySavings) || 0);
      const stepUp = Math.max(0, Number(v.stepUp) || 0) / 100;
      const monthlyRate = Math.max(0, Number(v.returnRate) || 0) / 1200;
      const inflation = Math.max(0, Number(v.inflation) || 0) / 100;
      const withdrawal = Math.max(0.1, Number(v.withdrawalRate) || 0) / 100;
      let reachedYear = -1, target = 0, spendThen = 0, portfolioThen = 0;
      for (let year = 0; year <= 60; year++) {
        spendThen = spending * Math.pow(1 + inflation, year);
        target = spendThen / withdrawal;
        portfolioThen = portfolio;
        if (portfolio >= target) { reachedYear = year; break; }
        if (year === 60) break;
        for (let month = 0; month < 12; month++) portfolio = (portfolio + saving) * (1 + monthlyRate);
        saving *= 1 + stepUp;
      }
      const reached = reachedYear >= 0;
      const years = reached ? reachedYear : 60;
      return [
        { label: reached ? "Years to financial independence" : "Not reached within 60 years", value: years, format: "years", emphasis: reached ? "positive" : "negative" },
        { label: "Corpus needed at that point", value: target, format: "currency" },
        { label: "Same corpus in today's money", value: target / Math.pow(1 + inflation, years), format: "currency", emphasis: "neutral" },
        { label: "Projected portfolio at that point", value: portfolioThen, format: "currency", emphasis: "positive" },
        { label: "Annual spending at that point", value: spendThen, format: "currency" }
      ];
    }
  });
