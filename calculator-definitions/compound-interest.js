/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "compound-interest",
    slug: "compound-interest-calculator",
    title: "Compound Interest",
    category: "banking",
    short: "See how a lump sum grows with compounding.",
    desc: "Calculate the future value of a one-time deposit compounded over time, at a chosen compounding frequency.",
    article: {
      formula: "A = P(1 + r/n)^(nt), where P is the principal, r is the annual interest rate, n is how many times per year interest compounds, and t is time in years.",
      exampleInputs: { principal: 5000, rate: 6, years: 10, freq: "12" },
      faqs: [
        { q: "How is this different from simple interest?", a: "Simple interest is calculated only on the original principal. Compound interest is calculated on the principal plus any interest already earned, so it grows faster the longer it runs." },
        { q: "Does compounding frequency matter much?", a: "It matters more at higher rates and longer time periods. Moving from annual to monthly compounding usually makes a modest difference; the effect compounds itself over decades." },
        { q: "Does this show real (inflation-adjusted) growth?", a: "No — this is nominal growth. If you want to compare against inflation, subtract your expected inflation rate from the interest rate before entering it." },
      ],
    },
    fields: [
      { id: "principal", label: "Initial amount", type: "number", default: 5000, min: 0, step: 100 },
      { id: "rate", label: "Annual interest rate", type: "number", default: 6, min: 0, max: 1000, step: 0.1, suffix: "%" },
      { id: "years", label: "Time period", type: "number", default: 10, min: 1, max: 200, step: 1, suffix: "yrs" },
      { id: "inflation", label: "Expected annual inflation", type: "number", default: 6, min: 0, max: 30, step: 0.1, suffix: "%" },
      {
        id: "freq", label: "Compounding frequency", type: "select", default: "12",
        options: [
          { value: "1", label: "Annually" },
          { value: "4", label: "Quarterly" },
          { value: "12", label: "Monthly" },
          { value: "365", label: "Daily" },
        ],
      },
    ],
    compute(v) {
      const P = v.principal, r = v.rate / 100, t = v.years, n = Number(v.freq);
      const A = P * Math.pow(1 + r / n, n * t);
      const realValue = A / Math.pow(1 + v.inflation / 100, t);
      return [
        { label: "Principal", value: P, format: "currency" },
        { label: "Interest earned", value: A - P, format: "currency", emphasis: "positive" },
        { label: "Final amount (future money)", value: A, format: "currency", emphasis: "neutral" },
        { label: "Value in today's purchasing power", value: realValue, format: "currency", emphasis: "neutral" },
      ];
    },
  });
