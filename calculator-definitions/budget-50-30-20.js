/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "budget-50-30-20",
    slug: "budget-calculator",
    title: "50/30/20 Budget Calculator",
    category: "salary",
    short: "Split take-home pay into needs, wants and savings and compare with what you spend.",
    desc: "Split monthly take-home pay into needs, wants and savings with the 50/30/20 rule and see how your actual spending compares.",
    article: {
      formula: "Target needs = take-home pay × needs percentage. Target wants = take-home pay × wants percentage. Target savings and debt repayment = take-home pay minus the needs and wants targets. Actual savings = take-home pay − actual needs − actual wants. The gap is actual savings minus the target savings amount.",
      exampleInputs: { income: 80000, needsPct: 50, wantsPct: 30, actualNeeds: 45000, actualWants: 25000 },
      faqs: [
        { q: "What counts as a need?", a: "Rent or home-loan EMI, utilities, groceries, transport to work, insurance premiums and minimum debt payments are usually needs. Subscriptions, dining out and travel are usually wants." },
        { q: "Is 50/30/20 right for every income?", a: "It is a starting template, not a rule. In expensive cities needs can take far more than 50%, and some people save well above 20%. Change the percentages to match your situation." },
        { q: "Should I use gross or take-home pay?", a: "Use take-home pay, the amount that actually reaches your bank account after tax and deductions such as provident fund." }
      ]
    },
    fields: [
      { id: "income", label: "Monthly take-home pay", type: "number", default: 80000, min: 0, max: 1000000000, step: 1000 },
      { id: "needsPct", label: "Target share for needs", type: "number", default: 50, min: 0, max: 100, step: 1, suffix: "%" },
      { id: "wantsPct", label: "Target share for wants", type: "number", default: 30, min: 0, max: 100, step: 1, suffix: "%" },
      { id: "actualNeeds", label: "Actual monthly spending on needs", type: "number", default: 45000, min: 0, max: 1000000000, step: 500 },
      { id: "actualWants", label: "Actual monthly spending on wants", type: "number", default: 25000, min: 0, max: 1000000000, step: 500 }
    ],
    compute(v) {
      const income = Math.max(0, Number(v.income) || 0);
      const needsPct = Math.min(100, Math.max(0, Number(v.needsPct) || 0));
      const wantsPct = Math.min(100 - needsPct, Math.max(0, Number(v.wantsPct) || 0));
      const needs = income * needsPct / 100;
      const wants = income * wantsPct / 100;
      const savings = income - needs - wants;
      const actualSavings = income - Math.max(0, Number(v.actualNeeds) || 0) - Math.max(0, Number(v.actualWants) || 0);
      const gap = actualSavings - savings;
      return [
        { label: "Target for needs", value: needs, format: "currency" },
        { label: "Target for wants", value: wants, format: "currency" },
        { label: "Target for savings and debt repayment", value: savings, format: "currency", emphasis: "positive" },
        { label: "Your actual monthly savings", value: actualSavings, format: "currency", emphasis: actualSavings >= 0 ? "neutral" : "negative" },
        { label: gap >= 0 ? "Ahead of the savings target by" : "Short of the savings target by", value: Math.abs(gap), format: "currency", emphasis: gap >= 0 ? "positive" : "negative" }
      ];
    }
  });
