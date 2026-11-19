/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "cost-of-delay",
    slug: "cost-of-delay-sip-calculator",
    title: "Cost of Delay SIP Calculator",
    category: "investment",
    short: "See how much waiting a few years to start a SIP can cost at the end.",
    desc: "Compare starting a monthly SIP now with starting later for the same end date, and see the extra monthly amount needed to catch up.",
    article: {
      formula: "SIP future value = monthly amount × [((1 + i)^n − 1) ÷ i] × (1 + i), where i is the annual rate ÷ 12 and n is the number of monthly instalments. Starting now uses all the months to the goal date. Starting later uses fewer months, ending on the same date. The monthly amount needed to catch up equals the start-now value divided by the delayed future-value factor.",
      exampleInputs: { monthly: 10000, rate: 12, years: 25, delay: 5 },
      faqs: [
        { q: "Why is the cost of delay larger than the contributions missed?", a: "The early instalments have the longest time to compound. Missing the first years removes the money that would have grown the most, so the loss is much larger than the amount you skipped." },
        { q: "Can a larger SIP make up for starting late?", a: "Yes, but it takes a higher monthly amount. The calculator shows the extra monthly investment that would reach the same end value from the delayed start." },
        { q: "Are the returns guaranteed?", a: "No. The rate is an assumption used to show the effect of time. Market-linked returns vary year to year and can be negative." }
      ]
    },
    fields: [
      { id: "monthly", label: "Monthly SIP amount", type: "number", default: 10000, min: 0, max: 1000000000, step: 500 },
      { id: "rate", label: "Expected annual return", type: "number", default: 12, min: 0, max: 50, step: 0.1, suffix: "%" },
      { id: "years", label: "Years until the goal", type: "number", default: 25, min: 1, max: 60, step: 1, suffix: "yrs" },
      { id: "delay", label: "Years you delay the start", type: "number", default: 5, min: 0, max: 59, step: 1, suffix: "yrs" }
    ],
    compute(v) {
      const monthly = Math.max(0, Number(v.monthly) || 0);
      const months = Math.max(0, Math.round((Number(v.years) || 0) * 12));
      const delayMonths = Math.min(months, Math.max(0, Math.round((Number(v.delay) || 0) * 12)));
      const i = Math.max(0, Number(v.rate) || 0) / 1200;
      const factor = count => i === 0 ? count : ((Math.pow(1 + i, count) - 1) / i) * (1 + i);
      const startNow = monthly * factor(months);
      const delayedFactor = factor(months - delayMonths);
      const startLater = monthly * delayedFactor;
      const catchUp = delayedFactor > 0 ? startNow / delayedFactor : 0;
      return [
        { label: "Value if you start now", value: startNow, format: "currency", emphasis: "positive" },
        { label: "Value if you start later", value: startLater, format: "currency", emphasis: "neutral" },
        { label: "Cost of the delay", value: startNow - startLater, format: "currency", emphasis: "negative" },
        { label: "Monthly SIP needed to catch up after the delay", value: catchUp, format: "currency" }
      ];
    }
  });
