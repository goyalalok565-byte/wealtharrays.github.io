/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "mortgage",
    slug: "mortgage-emi-calculator",
    title: "Mortgage / Loan EMI",
    category: "loan",
    short: "Work out fixed monthly payments on any loan.",
    desc: "Calculate the equal monthly instalment for a mortgage, car loan, or personal loan, and the total interest paid over its term.",
    article: {
      formula: "EMI = [P × r × (1+r)^n] / [(1+r)^n − 1], where P is the loan amount, r is the monthly interest rate (annual rate ÷ 12), and n is the number of monthly payments.",
      exampleInputs: { principal: 250000, rate: 6.5, years: 25 },
      faqs: [
        { q: "Why is so much of my early payment interest?", a: "Loans amortize: early payments are weighted toward interest because the outstanding balance is highest at the start. As the balance shrinks, more of each payment goes toward principal." },
        { q: "Does paying extra toward principal help?", a: "Yes — extra payments reduce the outstanding balance, which reduces future interest and can shorten the loan term. This calculator doesn't model extra payments directly; recompute with a shorter term to approximate the effect." },
        { q: "Fixed-rate or adjustable-rate — does this handle both?", a: "This calculator assumes a fixed rate for the full term. For an adjustable-rate loan, rerun the calculation with the new rate once it changes." },
      ],
    },
    fields: [
      { id: "principal", label: "Loan amount", type: "number", default: 250000, min: 0, step: 1000 },
      { id: "rate", label: "Annual interest rate", type: "number", default: 6.5, min: 0, max: 30, step: 0.05, suffix: "%" },
      { id: "years", label: "Loan term", type: "number", default: 25, min: 1, max: 40, step: 1, suffix: "yrs" },
    ],
    compute(v) {
      const P = v.principal, r = v.rate / 100 / 12, n = v.years * 12;
      const emi = P === 0 ? 0 : n <= 0 ? 0 : r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const total = emi * n;
      return [
        { label: "Monthly payment", value: emi, format: "currency", emphasis: "neutral" },
        { label: "Total repayment", value: total, format: "currency" },
        { label: "Total interest", value: total - P, format: "currency", emphasis: "negative" },
      ];
    },
  });
