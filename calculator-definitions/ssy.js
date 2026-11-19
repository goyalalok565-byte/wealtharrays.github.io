/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "ssy",
    slug: "ssy-calculator",
    title: "Sukanya Samriddhi (SSY) Calculator",
    category: "banking",
    short: "Project the Sukanya Samriddhi Yojana balance at the 21-year maturity.",
    desc: "Estimate the maturity value of a Sukanya Samriddhi account from the yearly deposit, deposit period and the interest rate in force.",
    article: {
      formula: "This estimate adds the yearly deposit at the start of each year for the chosen number of deposit years (at most 15) and then applies the annual interest rate to the running balance, compounding once a year until the account reaches 21 years from opening. Real accounts credit interest on the lowest monthly balance and the rate is reset every quarter, so the actual maturity value can differ from this simplified projection.",
      exampleInputs: { yearlyDeposit: 100000, depositYears: 15, rate: 8.2 },
      faqs: [
        { q: "Is the 8.2% rate fixed for the whole period?", a: "No. The government notifies the rate for small-savings schemes every quarter, so it can rise or fall. The rate field is an assumption; update it to the latest notified figure." },
        { q: "How long do deposits continue?", a: "Deposits are made for 15 years from opening, while the account itself matures 21 years after opening. In the last six years the balance keeps earning interest without new deposits." },
        { q: "What are the deposit limits?", a: "The scheme allows a minimum of ₹250 and a maximum of ₹1.5 lakh in a financial year. Confirm current limits, eligibility and tax treatment with your bank or post office." }
      ]
    },
    fields: [
      { id: "yearlyDeposit", label: "Yearly deposit", type: "number", default: 100000, min: 0, max: 150000, step: 1000 },
      { id: "depositYears", label: "Years of deposits", type: "number", default: 15, min: 1, max: 15, step: 1, suffix: "yrs" },
      { id: "rate", label: "Assumed annual interest rate", type: "number", default: 8.2, min: 0, max: 20, step: 0.05, suffix: "%" }
    ],
    compute(v) {
      const deposit = Math.max(0, Number(v.yearlyDeposit) || 0);
      const depositYears = Math.min(15, Math.max(0, Math.round(Number(v.depositYears) || 0)));
      const rate = Math.max(0, Number(v.rate) || 0) / 100;
      let balance = 0, deposited = 0, afterDeposits = 0;
      for (let year = 1; year <= 21; year++) {
        if (year <= depositYears) { balance += deposit; deposited += deposit; }
        balance *= 1 + rate;
        if (year === depositYears) afterDeposits = balance;
      }
      return [
        { label: "Total deposited", value: deposited, format: "currency" },
        { label: "Interest earned", value: balance - deposited, format: "currency", emphasis: "positive" },
        { label: "Estimated maturity value at 21 years", value: balance, format: "currency", emphasis: "neutral" },
        { label: "Balance when deposits end", value: afterDeposits, format: "currency" }
      ];
    }
  });
