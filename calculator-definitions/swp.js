/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "swp",
    slug: "swp-calculator",
    title: "SWP Calculator",
    category: "investment",
    short: "See how long a corpus lasts when you withdraw a fixed amount every month.",
    desc: "Estimate the remaining balance, total withdrawn and how long a corpus can fund a monthly withdrawal at an assumed return.",
    article: {
      formula: "Each month the planned withdrawal is taken from the balance at the start of the month, and the remaining balance then earns the monthly equivalent of the assumed annual return (annual rate ÷ 12). The withdrawal is increased once a year by the step-up percentage. If the balance cannot cover a full withdrawal, the corpus is treated as exhausted. Taxes, exit loads, fund expenses and return volatility are not modelled.",
      exampleInputs: { corpus: 5000000, withdrawal: 30000, rate: 8, years: 20, stepUp: 5 },
      faqs: [
        { q: "What is a systematic withdrawal plan?", a: "A systematic withdrawal plan, or SWP, is a standing instruction to redeem a fixed amount from an investment every month. The remaining money stays invested and keeps earning the assumed return." },
        { q: "Why does the corpus run out even though the return is positive?", a: "Because each withdrawal is larger than the growth on the remaining balance in the later years, especially when the withdrawal steps up every year. The balance falls slowly at first and then faster." },
        { q: "Does this include tax on withdrawals?", a: "No. Part of every withdrawal from a market-linked fund can be a taxable gain. Check the current capital-gains rules for your fund type before relying on the post-tax amount." }
      ]
    },
    fields: [
      { id: "corpus", label: "Starting corpus", type: "number", default: 5000000, min: 0, max: 100000000000, step: 10000 },
      { id: "withdrawal", label: "Monthly withdrawal", type: "number", default: 30000, min: 0, max: 1000000000, step: 1000 },
      { id: "rate", label: "Assumed annual return", type: "number", default: 8, min: 0, max: 50, step: 0.1, suffix: "%" },
      { id: "years", label: "Planned withdrawal period", type: "number", default: 20, min: 1, max: 60, step: 1, suffix: "yrs" },
      { id: "stepUp", label: "Annual increase in withdrawal", type: "number", default: 5, min: 0, max: 50, step: 0.5, suffix: "%" }
    ],
    compute(v) {
      const months = Math.max(0, Math.round((Number(v.years) || 0) * 12));
      const monthlyRate = Math.max(0, Number(v.rate) || 0) / 1200;
      let balance = Math.max(0, Number(v.corpus) || 0);
      const corpus = balance;
      let planned = Math.max(0, Number(v.withdrawal) || 0);
      const stepUp = Math.max(0, Number(v.stepUp) || 0) / 100;
      let withdrawn = 0, fundedMonths = 0, exhausted = false;
      for (let month = 1; month <= months; month++) {
        if (month > 1 && (month - 1) % 12 === 0) planned *= 1 + stepUp;
        const taken = Math.min(planned, balance);
        balance -= taken;
        withdrawn += taken;
        if (taken + 0.005 < planned) { exhausted = true; break; }
        fundedMonths += 1;
        balance *= 1 + monthlyRate;
      }
      const growth = balance + withdrawn - corpus;
      return [
        { label: "Total amount withdrawn", value: withdrawn, format: "currency" },
        { label: exhausted ? "Balance left (corpus exhausted)" : "Balance left after the period", value: balance, format: "currency", emphasis: exhausted ? "negative" : "positive" },
        { label: "Investment growth earned", value: growth, format: "currency", emphasis: "neutral" },
        { label: exhausted ? "Years the corpus pays the full withdrawal" : "Years of full withdrawals funded", value: fundedMonths / 12, format: "years", emphasis: exhausted ? "negative" : "positive" }
      ];
    }
  });
