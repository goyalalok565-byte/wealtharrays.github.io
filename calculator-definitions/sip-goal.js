/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "sip-goal",
    slug: "sip-goal-calculator",
    title: "SIP Goal Calculator",
    category: "investment",
    short: "Estimate the monthly SIP needed to reach a target corpus.",
    desc: "Work backward from a target amount, current savings, expected return and time horizon.",
    article: {
      formula: "First grow the current corpus at the assumed monthly rate. The remaining target is divided by the future-value factor for equal monthly contributions. This model assumes contributions at the start of each month and a constant return, which real investments will not deliver exactly.",
      exampleInputs: { target: 5000000, current: 500000, rate: 10, years: 15 },
      faqs: [
        { q: "Does this guarantee I will reach the target?", a: "No. The required SIP is a mathematical estimate based on a constant assumed return. Actual returns vary and the target may not be reached." },
        { q: "What if my current savings already grow beyond the target?", a: "The calculator returns zero as the required monthly SIP if the assumed growth of your current corpus already meets or exceeds the target." }
      ]
    },
    fields: [
      { id: "target", label: "Target corpus", type: "number", default: 5000000, min: 0, max: 100000000000, step: 10000 },
      { id: "current", label: "Current investment corpus", type: "number", default: 500000, min: 0, max: 10000000000, step: 10000 },
      { id: "rate", label: "Assumed annual return", type: "number", default: 10, min: 0, max: 100, step: 0.1, suffix: "%" },
      { id: "years", label: "Time to goal", type: "number", default: 15, min: 1, max: 80, step: 1, suffix: "yrs" }
    ],
    compute(v) {
      const n = v.years * 12, monthlyRate = v.rate / 1200;
      const futureCurrent = v.current * Math.pow(1 + monthlyRate, n);
      const gap = Math.max(0, v.target - futureCurrent);
      const factor = monthlyRate === 0 ? n : ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate);
      const required = gap === 0 ? 0 : factor > 0 ? gap / factor : 0;
      return [
        { label: "Required monthly SIP", value: required, format: "currency", emphasis: "positive" },
        { label: "Future value of current corpus", value: futureCurrent, format: "currency" },
        { label: "Target gap after current corpus growth", value: gap, format: "currency", emphasis: "neutral" }
      ];
    }
  });
