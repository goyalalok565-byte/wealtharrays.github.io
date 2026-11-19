/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "rent-vs-buy",
    slug: "rent-vs-buy-calculator",
    title: "Rent vs Buy Calculator",
    category: "loan",
    short: "Compare the net worth from buying a home with renting and investing the difference.",
    desc: "Compare buying a home on a loan with renting and investing, using price, loan terms, rent, appreciation and investment return.",
    article: {
      formula: "Buying: down payment plus buying costs are paid upfront, the loan is repaid at a fixed EMI, and a yearly maintenance and property-tax cost is added. The home value grows at the assumed appreciation rate and the outstanding loan is deducted. Renting: the same upfront cash is invested, rent rises every year, and whichever option has the lower monthly outflow invests the difference at the assumed return. The result compares net worth at the end of the chosen period. Selling costs, tax benefits and capital-gains tax are not modelled.",
      exampleInputs: { price: 8000000, downPct: 20, loanRate: 8.75, loanYears: 20, appreciation: 5, rent: 25000, rentGrowth: 5, investReturn: 10, maintPct: 1, buyCostPct: 6, horizon: 10 },
      faqs: [
        { q: "Is buying always better than renting?", a: "No. The answer depends on the price-to-rent ratio, the loan rate, how fast the home appreciates and what the invested money earns. This calculator lets you test those assumptions side by side." },
        { q: "Why is the investment return so important?", a: "Renting only wins if the money you do not spend on a down payment and EMI is actually invested and earns a return. A lower return makes buying look better and a higher return makes renting look better." },
        { q: "Does it include home-loan tax benefits?", a: "No. Tax deductions on interest and principal depend on the regime you choose and change over time, so they are left out. Add them mentally as a small improvement to the buying result." }
      ]
    },
    fields: [
      { id: "price", label: "Home price", type: "number", default: 8000000, min: 0, max: 100000000000, step: 100000 },
      { id: "downPct", label: "Down payment", type: "number", default: 20, min: 0, max: 100, step: 1, suffix: "%" },
      { id: "loanRate", label: "Home-loan interest rate", type: "number", default: 8.75, min: 0, max: 30, step: 0.05, suffix: "%" },
      { id: "loanYears", label: "Loan term", type: "number", default: 20, min: 1, max: 40, step: 1, suffix: "yrs" },
      { id: "appreciation", label: "Expected yearly home appreciation", type: "number", default: 5, min: 0, max: 30, step: 0.5, suffix: "%" },
      { id: "rent", label: "Monthly rent for a similar home", type: "number", default: 25000, min: 0, max: 100000000, step: 500 },
      { id: "rentGrowth", label: "Yearly rent increase", type: "number", default: 5, min: 0, max: 30, step: 0.5, suffix: "%" },
      { id: "investReturn", label: "Expected annual return on invested money", type: "number", default: 10, min: 0, max: 30, step: 0.5, suffix: "%" },
      { id: "maintPct", label: "Yearly maintenance and property tax", type: "number", default: 1, min: 0, max: 10, step: 0.1, suffix: "%" },
      { id: "buyCostPct", label: "Stamp duty, registration and other buying costs", type: "number", default: 6, min: 0, max: 20, step: 0.5, suffix: "%" },
      { id: "horizon", label: "How long you plan to stay", type: "number", default: 10, min: 1, max: 40, step: 1, suffix: "yrs" }
    ],
    compute(v) {
      const price = Math.max(0, Number(v.price) || 0);
      const downPayment = price * Math.min(100, Math.max(0, Number(v.downPct) || 0)) / 100;
      const loan = price - downPayment;
      const loanMonths = Math.max(0, Math.round((Number(v.loanYears) || 0) * 12));
      const loanRate = Math.max(0, Number(v.loanRate) || 0) / 1200;
      let emi = 0;
      if (loanMonths > 0 && loan > 0) {
        emi = loanRate === 0 ? loan / loanMonths : loan * loanRate * Math.pow(1 + loanRate, loanMonths) / (Math.pow(1 + loanRate, loanMonths) - 1);
      }
      const horizonMonths = Math.max(0, Math.round((Number(v.horizon) || 0) * 12));
      const investRate = Math.max(0, Number(v.investReturn) || 0) / 1200;
      const rentGrowth = Math.max(0, Number(v.rentGrowth) || 0) / 100;
      const upkeep = price * Math.max(0, Number(v.maintPct) || 0) / 1200;
      let balance = loan;
      let rentNow = Math.max(0, Number(v.rent) || 0);
      let renterPortfolio = downPayment + price * Math.max(0, Number(v.buyCostPct) || 0) / 100;
      let buyerPortfolio = 0;
      for (let month = 1; month <= horizonMonths; month++) {
        if (month > 1 && (month - 1) % 12 === 0) rentNow *= 1 + rentGrowth;
        let payment = 0;
        if (month <= loanMonths) {
          payment = emi;
          const interest = balance * loanRate;
          balance = Math.max(0, balance - (payment - interest));
        }
        const difference = payment + upkeep - rentNow;
        if (difference >= 0) renterPortfolio += difference; else buyerPortfolio += -difference;
        renterPortfolio *= 1 + investRate;
        buyerPortfolio *= 1 + investRate;
      }
      const homeValue = price * Math.pow(1 + Math.max(0, Number(v.appreciation) || 0) / 100, Number(v.horizon) || 0);
      const buyNetWorth = homeValue - balance + buyerPortfolio;
      const advantage = buyNetWorth - renterPortfolio;
      return [
        { label: "Monthly loan EMI", value: emi, format: "currency" },
        { label: "Net worth if you buy", value: buyNetWorth, format: "currency", emphasis: "neutral" },
        { label: "Net worth if you rent and invest", value: renterPortfolio, format: "currency", emphasis: "neutral" },
        { label: advantage >= 0 ? "Buying comes out ahead by" : "Renting comes out ahead by", value: Math.abs(advantage), format: "currency", emphasis: advantage >= 0 ? "positive" : "negative" }
      ];
    }
  });
