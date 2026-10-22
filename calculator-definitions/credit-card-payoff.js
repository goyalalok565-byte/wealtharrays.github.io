/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "credit-card-payoff",
    slug: "credit-card-payoff-calculator",
    title: "Credit Card Payoff Calculator",
    category: "loan",
    short: "Estimate payoff time and interest for a fixed monthly payment.",
    desc: "Model how a credit-card balance changes when you pay a fixed amount each month at an assumed APR.",
    article: {
      formula: "Each month, interest is added using the monthly rate (APR ÷ 12), then the fixed payment is deducted. The estimate excludes fees, new purchases, changing APRs and minimum-payment rules. If the payment does not exceed the first month's interest, the balance will not decline.",
      exampleInputs: { balance: 80000, apr: 36, payment: 8000 },
      faqs: [
        { q: "Why can a card balance take so long to clear?", a: "Interest is charged on the outstanding balance. If your payment is only slightly above the interest charged, little money reduces the principal." },
        { q: "Does this include new spending or card fees?", a: "No. Stop adding new purchases for this estimate to be meaningful; fees, rate changes and issuer rules can alter the actual payoff schedule." }
      ]
    },
    fields: [
      { id: "balance", label: "Current card balance", type: "number", default: 80000, min: 0, max: 1000000000, step: 500 },
      { id: "apr", label: "Annual percentage rate (APR)", type: "number", default: 36, min: 0, max: 300, step: 0.1, suffix: "%" },
      { id: "payment", label: "Fixed monthly payment", type: "number", default: 8000, min: 0, max: 100000000, step: 100 }
    ],
    compute(v) {
      let balance = v.balance, interestPaid = 0, totalPaid = 0, months = 0;
      const monthlyRate = v.apr / 1200;
      if (v.payment <= balance * monthlyRate && balance > 0) {
        return [
          { label: "Months to clear (0 = payment too low)", value: 0, format: "number" },
          { label: "Monthly interest at current balance", value: balance * monthlyRate, format: "currency", emphasis: "negative" },
          { label: "Payment needed to start reducing balance", value: balance * monthlyRate + 1, format: "currency", emphasis: "neutral" }
        ];
      }
      while (balance > 0.005 && months < 1200) {
        const interest = balance * monthlyRate;
        interestPaid += interest;
        const paid = Math.min(balance + interest, v.payment);
        totalPaid += paid;
        balance = Math.max(0, balance + interest - paid);
        months++;
      }
      return [
        { label: "Months to pay off", value: months, format: "number" },
        { label: "Total interest paid", value: interestPaid, format: "currency", emphasis: "negative" },
        { label: "Total payments", value: totalPaid, format: "currency" }
      ];
    }
  });
