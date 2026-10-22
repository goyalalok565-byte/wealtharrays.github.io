/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "gratuity",
    slug: "gratuity-calculator",
    title: "Gratuity Calculator",
    category: "salary",
    short: "Estimate gratuity using salary and completed service years.",
    desc: "Estimate a gratuity amount using the common 15/26 salary formula, subject to eligibility and applicable rules.",
    article: {
      formula: "For an employee covered by the Payment of Gratuity Act, the common estimate is last-drawn monthly basic salary plus dearness allowance × 15 ÷ 26 × completed years of service. Eligibility and exceptions depend on the applicable law and employment circumstances.",
      exampleInputs: { salary: 50000, years: 10 },
      faqs: [
        { q: "Is five years of service always required?", a: "Five years of continuous service is the general rule for many cases under the Act, but exceptions and legal interpretation can apply, including certain death or disablement cases." },
        { q: "Does this include every component of salary?", a: "No. The common formula uses last-drawn basic salary plus dearness allowance, not necessarily total CTC or every allowance." }
      ]
    },
    fields: [
      { id: "salary", label: "Last-drawn monthly basic + DA", type: "number", default: 50000, min: 0, max: 100000000, step: 500 },
      { id: "years", label: "Completed years of service", type: "number", default: 10, min: 0, max: 60, step: 1, suffix: "yrs" }
    ],
    compute(v) {
      const eligible = v.years >= 5;
      const gratuity = eligible ? v.salary * 15 / 26 * Math.floor(v.years) : 0;
      return [
        { label: "Estimated gratuity (0 if threshold not met)", value: gratuity, format: "currency", emphasis: "positive" },
        { label: "General 5-year threshold met (1 = yes)", value: eligible ? 1 : 0, format: "number" }
      ];
    }
  });
