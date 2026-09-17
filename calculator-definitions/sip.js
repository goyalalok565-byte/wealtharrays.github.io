/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "sip",
    slug: "sip-calculator",
    title: "SIP Calculator",
    category: "investment",
    short: "Project the future value of monthly investments.",
    desc: "Estimate what a fixed monthly investment could grow to, given an expected annual return and a time horizon.",
    article: {
      formula: "SIP (Systematic Investment Plan) math is the future value of a series of equal monthly payments, compounded monthly: FV = P × [((1+i)^n − 1) / i] × (1+i), where P is the monthly amount, i is the monthly rate (annual rate ÷ 12), and n is the number of months.",
      exampleInputs: { monthly: 200, rate: 10, years: 15 },
      faqs: [
        { q: "What is a SIP?", a: "A SIP is simply investing a fixed amount at regular intervals — usually monthly — rather than a single lump sum. It's commonly used with mutual funds, but the math applies to any recurring investment." },
        { q: "Is a 10% annual return realistic?", a: "It depends entirely on what you invest in. Equity markets have historically returned around that range over long periods in some markets, but returns are never guaranteed and vary by year — treat any rate you enter as an assumption, not a promise." },
        { q: "Does this account for fees or taxes?", a: "No — this is a gross growth projection. Fund fees, taxes on gains, and inflation will all reduce the real amount you end up with." },
      ],
    },
    fields: [
      { id: "monthly", label: "Monthly investment", type: "number", default: 200, min: 0, step: 10 },
      { id: "rate", label: "Expected annual return", type: "number", default: 10, min: 0, max: 1000, step: 0.1, suffix: "%" },
      { id: "years", label: "Investment period", type: "number", default: 15, min: 1, max: 200, step: 1, suffix: "yrs" },
      { id: "inflation", label: "Expected annual inflation", type: "number", default: 6, min: 0, max: 30, step: 0.1, suffix: "%" },
    ],
    compute(v) {
      const P = v.monthly, i = v.rate / 100 / 12, n = v.years * 12;
      const fv = i === 0 ? P * n : P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      const invested = P * n;
      const gains = fv - invested;
      const realValue = fv / Math.pow(1 + v.inflation / 100, v.years);
      return [
        { label: "You put in", value: invested, format: "currency" },
        { label: "Your growth / profit", value: gains, format: "currency", emphasis: "positive" },
        { label: "You could have in the future", value: fv, format: "currency", emphasis: "neutral" },
        { label: "What that future money is worth in today's money", value: realValue, format: "currency", emphasis: "neutral" },
      ];
    },
  });
