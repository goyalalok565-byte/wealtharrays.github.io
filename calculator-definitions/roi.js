/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "roi",
    slug: "roi-calculator",
    title: "ROI Calculator",
    category: "investment",
    short: "Measure the return on an investment or purchase.",
    desc: "Compare what you put in against what you got back, as a total and annualised percentage return.",
    article: {
      formula: "Total ROI = (Final value − Cost) / Cost × 100. Annualized ROI = [(Final value / Cost)^(1/years) − 1] × 100 — this spreads the total return evenly across each year, so investments held for different lengths of time can be compared fairly.",
      exampleInputs: { cost: 10000, finalValue: 14500, years: 3 },
      faqs: [
        { q: "What's the difference between ROI and CAGR?", a: "Annualized ROI here is calculated the same way as CAGR (Compound Annual Growth Rate) — both express a multi-year return as an equivalent constant yearly rate." },
        { q: "Does ROI include fees or taxes?", a: "Only if you build them into your cost or final value inputs. The formula itself is agnostic — it just compares two numbers." },
        { q: "What does a negative ROI mean?", a: "It means the final value was lower than what you put in — you lost money on the investment or purchase over that period." },
      ],
    },
    fields: [
      { id: "cost", label: "Amount invested", type: "number", default: 10000, min: 0.01, step: 100 },
      { id: "finalValue", label: "Current / final value", type: "number", default: 14500, min: 0, step: 100 },
      { id: "years", label: "Holding period", type: "number", default: 3, min: 0.1, max: 200, step: 0.1, suffix: "yrs" },
    ],
    compute(v) {
      const gain = v.finalValue - v.cost;
      const roi = v.cost === 0 ? 0 : (gain / v.cost) * 100;
      const annualized = v.cost <= 0 || v.finalValue < 0 || v.years <= 0 ? 0 : (Math.pow(v.finalValue / v.cost, 1 / v.years) - 1) * 100;
      return [
        { label: "Net gain", value: gain, format: "currency", emphasis: gain >= 0 ? "positive" : "negative" },
        { label: "Total ROI", value: roi, format: "percent", emphasis: roi >= 0 ? "positive" : "negative" },
        { label: "Annualized ROI", value: annualized, format: "percent", emphasis: "neutral" },
      ];
    },
  });
