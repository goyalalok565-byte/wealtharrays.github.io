/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "epf-growth",
    slug: "epf-calculator",
    title: "EPF Calculator",
    category: "retirement",
    short: "Project EPF savings from monthly contributions and salary growth.",
    desc: "Estimate a future EPF balance using salary, contribution percentages, an assumed interest rate and years remaining.",
    article: {
      formula: "Each month, this estimate adds the employee contribution plus the employer EPF contribution you enter, then applies the monthly equivalent of the assumed annual rate. Basic pay is increased once per year by the assumed salary growth rate. Employer EPS allocation, statutory ceilings, withdrawals and tax rules are not modelled.",
      exampleInputs: { monthlyBasic: 30000, employeePct: 12, employerPct: 3.67, salaryGrowth: 5, rate: 8.25, years: 25 },
      faqs: [
        { q: "Is this an official EPF statement?", a: "No. It is a projection based on the rates and contributions you enter, not a statement from EPFO." },
        { q: "Does it model EPS and contribution ceilings?", a: "No. Enter only the employer contribution you expect to reach EPF. EPS allocation, wage ceilings, withdrawals and tax treatment need separate checking." }
      ]
    },
    fields: [
      { id: "monthlyBasic", label: "Monthly basic pay", type: "number", default: 30000, min: 0, max: 10000000, step: 500 },
      { id: "employeePct", label: "Employee contribution", type: "number", default: 12, min: 0, max: 100, step: 0.1, suffix: "%" },
      { id: "employerPct", label: "Employer EPF contribution", type: "number", default: 3.67, min: 0, max: 100, step: 0.1, suffix: "%" },
      { id: "salaryGrowth", label: "Annual basic-pay growth", type: "number", default: 5, min: 0, max: 50, step: 0.5, suffix: "%" },
      { id: "rate", label: "Assumed annual EPF interest", type: "number", default: 8.25, min: 0, max: 30, step: 0.05, suffix: "%" },
      { id: "years", label: "Years until withdrawal", type: "number", default: 25, min: 1, max: 45, step: 1, suffix: "yrs" }
    ],
    compute(v) {
      let balance = 0, contributed = 0, salary = v.monthlyBasic;
      const monthlyRate = v.rate / 1200;
      for (let month = 1; month <= v.years * 12; month++) {
        if (month > 1 && (month - 1) % 12 === 0) salary *= 1 + v.salaryGrowth / 100;
        const contribution = salary * (v.employeePct + v.employerPct) / 100;
        contributed += contribution;
        balance = (balance + contribution) * (1 + monthlyRate);
      }
      return [
        { label: "Projected EPF balance", value: balance, format: "currency", emphasis: "positive" },
        { label: "Total contributions", value: contributed, format: "currency" },
        { label: "Estimated interest", value: balance - contributed, format: "currency", emphasis: "neutral" }
      ];
    }
  });
