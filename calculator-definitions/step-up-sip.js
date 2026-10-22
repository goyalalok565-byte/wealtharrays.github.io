/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "step-up-sip",
    slug: "step-up-sip-calculator",
    title: "Step-Up SIP Calculator",
    category: "investment",
    short: "Project monthly investments that rise each year.",
    desc: "Estimate how an annual increase in monthly SIP contributions may change the projected corpus.",
    article: {
      formula: "The monthly contribution increases by the step-up percentage at the start of each investment year. Each contribution is added at the start of a month and the balance grows at the monthly equivalent of the assumed annual return. Actual investment returns vary and are not guaranteed.",
      exampleInputs: { monthly: 5000, stepUp: 10, rate: 12, years: 15 },
      faqs: [
        { q: "What is a step-up SIP?", a: "It is a recurring investment plan where the monthly contribution increases periodically, often once a year, as income or savings capacity grows." },
        { q: "Are the projected returns guaranteed?", a: "No. The return rate is an assumption. Market-linked investments can lose value and actual returns vary over time." }
      ]
    },
    fields: [
      { id: "monthly", label: "Starting monthly investment", type: "number", default: 5000, min: 0, max: 100000000, step: 100 },
      { id: "stepUp", label: "Annual SIP increase", type: "number", default: 10, min: 0, max: 100, step: 0.5, suffix: "%" },
      { id: "rate", label: "Assumed annual return", type: "number", default: 12, min: 0, max: 100, step: 0.1, suffix: "%" },
      { id: "years", label: "Investment period", type: "number", default: 15, min: 1, max: 60, step: 1, suffix: "yrs" }
    ],
    compute(v) {
      let balance = 0, invested = 0;
      const monthlyRate = v.rate / 1200;
      for (let year = 0; year < v.years; year++) {
        const contribution = v.monthly * Math.pow(1 + v.stepUp / 100, year);
        for (let month = 0; month < 12; month++) {
          balance = (balance + contribution) * (1 + monthlyRate);
          invested += contribution;
        }
      }
      return [
        { label: "Projected investment value", value: balance, format: "currency", emphasis: "positive" },
        { label: "Total contributions", value: invested, format: "currency" },
        { label: "Estimated growth", value: balance - invested, format: "currency", emphasis: "neutral" }
      ];
    }
  });
