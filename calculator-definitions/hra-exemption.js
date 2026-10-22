/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "hra-exemption",
    slug: "hra-exemption-calculator",
    title: "HRA Exemption Calculator",
    category: "salary",
    short: "Estimate HRA exemption from salary, rent and city percentage.",
    desc: "Estimate the HRA exemption under the common salary-based method using editable salary, rent and city assumptions.",
    article: {
      formula: "The estimated exemption is the lowest of actual HRA received, rent paid minus 10% of basic salary plus DA, and the basic salary plus DA multiplied by the city percentage you enter (commonly 50% for specified metro cities and 40% elsewhere). Negative values are treated as zero. Tax rules and eligibility can vary.",
      exampleInputs: { basicDA: 50000, hra: 20000, rent: 25000, cityPct: 50 },
      faqs: [
        { q: "Which city percentage should I enter?", a: "The common calculation uses 50% for specified metro cities and 40% for other locations. Check the current tax rules for your circumstances." },
        { q: "Does this decide my final tax liability?", a: "No. It estimates one HRA exemption component and does not calculate your complete tax liability or confirm eligibility for a tax regime." }
      ]
    },
    fields: [
      { id: "basicDA", label: "Monthly basic salary + DA", type: "number", default: 50000, min: 0, max: 100000000, step: 500 },
      { id: "hra", label: "Monthly HRA received", type: "number", default: 20000, min: 0, max: 100000000, step: 500 },
      { id: "rent", label: "Monthly rent paid", type: "number", default: 25000, min: 0, max: 100000000, step: 500 },
      { id: "cityPct", label: "City percentage (50 or 40)", type: "number", default: 50, min: 0, max: 100, step: 10, suffix: "%" }
    ],
    compute(v) {
      const exemption = Math.max(0, Math.min(v.hra, v.rent - 0.1 * v.basicDA, v.basicDA * v.cityPct / 100));
      return [
        { label: "Estimated HRA exemption per month", value: exemption, format: "currency", emphasis: "positive" },
        { label: "Estimated taxable HRA per month", value: Math.max(0, v.hra - exemption), format: "currency", emphasis: "neutral" },
        { label: "Annual estimated exemption", value: exemption * 12, format: "currency" }
      ];
    }
  });
