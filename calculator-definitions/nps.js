/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "nps",
    slug: "nps-calculator",
    title: "NPS Calculator",
    category: "retirement",
    short: "Estimate how regular NPS contributions could grow toward retirement.",
    desc: "Estimate a National Pension System corpus from a monthly contribution, an assumed annual return and a retirement horizon. Adjust the annuity allocation and annuity return to explore an illustrative retirement-income scenario.",
    article: {
      formula: "For end-of-month contributions, estimated corpus = monthly contribution × (((1 + monthly rate)^number of months − 1) / monthly rate). The monthly rate is the assumed annual return divided by 12. If the rate is zero, corpus equals total contributions. Annuity allocation and monthly income are scenario estimates, not a guarantee or a statement of current NPS withdrawal rules.",
      exampleInputs: { monthly: 5000, rate: 9, years: 25, annuityShare: 40, annuityRate: 6 },
      faqs: [
        { q: "Does this predict my actual NPS return?", a: "No. NPS returns depend on the investment choices and market performance. Entered returns are assumptions, not guaranteed rates." },
        { q: "Does this calculator apply current NPS exit and tax rules?", a: "It models the annuity allocation you enter and does not determine legal eligibility, withdrawal limits or tax treatment. Check current PFRDA and tax guidance before making a decision." },
        { q: "How is the monthly annuity estimate calculated?", a: "It divides the estimated annuity allocation by 12 and multiplies it by the assumed annual annuity rate. Actual annuity products, rates, payout options and taxes may differ." }
      ]
    },
    fields: [
      { id: "monthly", label: "Monthly NPS contribution", type: "number", default: 5000, min: 0, max: 100000000, step: 500, suffix: "₹" },
      { id: "rate", label: "Assumed annual return", type: "number", default: 9, min: 0, max: 100, step: 0.1, suffix: "%" },
      { id: "years", label: "Years until retirement", type: "number", default: 25, min: 1, max: 60, step: 1, suffix: "yrs" },
      { id: "annuityShare", label: "Corpus allocated to annuity", type: "number", default: 40, min: 0, max: 100, step: 1, suffix: "%" },
      { id: "annuityRate", label: "Assumed annual annuity rate", type: "number", default: 6, min: 0, max: 100, step: 0.1, suffix: "%" }
    ],
    compute(v) {
      const monthly = Math.max(0, Number(v.monthly) || 0);
      const annualRate = Math.max(0, Number(v.rate) || 0);
      const years = Math.max(0, Number(v.years) || 0);
      const months = Math.round(years * 12);
      const monthlyRate = annualRate / 1200;
      const invested = monthly * months;
      const corpus = monthlyRate === 0 ? invested : monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      const share = Math.min(100, Math.max(0, Number(v.annuityShare) || 0)) / 100;
      const annuityCorpus = corpus * share;
      const lumpSum = corpus - annuityCorpus;
      const annuityRate = Math.max(0, Number(v.annuityRate) || 0) / 100;
      const monthlyPension = annuityCorpus * annuityRate / 12;
      return [
        { label: "Total contributions", value: invested, format: "currency" },
        { label: "Estimated investment growth", value: corpus - invested, format: "currency", emphasis: "positive" },
        { label: "Estimated retirement corpus", value: corpus, format: "currency", emphasis: "neutral" },
        { label: "Illustrative lump-sum allocation", value: lumpSum, format: "currency" },
        { label: "Illustrative annuity allocation", value: annuityCorpus, format: "currency" },
        { label: "Illustrative monthly annuity income before tax", value: monthlyPension, format: "currency" }
      ];
    }
  });
