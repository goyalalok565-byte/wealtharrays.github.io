/* Wealth Arrays — calculator definitions
   Each calculator: id, title, short description, input fields, and a compute(values) function
   that returns an array of { label, value (number), format: 'currency'|'percent'|'number'|'years', emphasis: 'positive'|'negative'|'neutral'|null }
   All money formulas are currency-agnostic — the active currency symbol is applied at render time.
*/

const CATEGORIES = [
  { id: "investment", label: "Investment Calculators", desc: "Grow your money — projections for recurring and lump-sum investing." },
  { id: "loan", label: "Loan Calculators", desc: "Mortgages, personal loans, and what they really cost." },
  { id: "banking", label: "Banking Calculators", desc: "Interest on savings and deposits, simple and compound." },
  { id: "retirement", label: "Retirement Calculators", desc: "How much you need, and how close you are." },
  { id: "salary", label: "Salary & Income", desc: "Convert and compare how you're paid." },
  { id: "business", label: "Business Calculators", desc: "Margins, returns, and the health of a small business." },
];

const CALCULATORS = [
  {
    id: "sip",
    title: "SIP Calculator",
    category: "investment",
    short: "Project the future value of monthly investments.",
    desc: "Estimate what a fixed monthly investment could grow to, given an expected annual return and a time horizon.",
    fields: [
      { id: "monthly", label: "Monthly investment", type: "number", default: 200, min: 0, step: 10 },
      { id: "rate", label: "Expected annual return", type: "number", default: 10, min: 0, max: 50, step: 0.1, suffix: "%" },
      { id: "years", label: "Investment period", type: "number", default: 15, min: 1, max: 60, step: 1, suffix: "yrs" },
    ],
    compute(v) {
      const P = v.monthly, i = v.rate / 100 / 12, n = v.years * 12;
      const fv = i === 0 ? P * n : P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      const invested = P * n;
      const gains = fv - invested;
      return [
        { label: "Total invested", value: invested, format: "currency" },
        { label: "Wealth gained", value: gains, format: "currency", emphasis: "positive" },
        { label: "Projected value", value: fv, format: "currency", emphasis: "neutral" },
      ];
    },
  },
  {
    id: "compound-interest",
    title: "Compound Interest",
    category: "banking",
    short: "See how a lump sum grows with compounding.",
    desc: "Calculate the future value of a one-time deposit compounded over time, at a chosen compounding frequency.",
    fields: [
      { id: "principal", label: "Initial amount", type: "number", default: 5000, min: 0, step: 100 },
      { id: "rate", label: "Annual interest rate", type: "number", default: 6, min: 0, max: 50, step: 0.1, suffix: "%" },
      { id: "years", label: "Time period", type: "number", default: 10, min: 1, max: 60, step: 1, suffix: "yrs" },
      {
        id: "freq", label: "Compounding frequency", type: "select", default: "12",
        options: [
          { value: "1", label: "Annually" },
          { value: "4", label: "Quarterly" },
          { value: "12", label: "Monthly" },
          { value: "365", label: "Daily" },
        ],
      },
    ],
    compute(v) {
      const P = v.principal, r = v.rate / 100, t = v.years, n = Number(v.freq);
      const A = P * Math.pow(1 + r / n, n * t);
      return [
        { label: "Principal", value: P, format: "currency" },
        { label: "Interest earned", value: A - P, format: "currency", emphasis: "positive" },
        { label: "Final amount", value: A, format: "currency", emphasis: "neutral" },
      ];
    },
  },
  {
    id: "mortgage",
    title: "Mortgage / Loan EMI",
    category: "loan",
    short: "Work out fixed monthly payments on any loan.",
    desc: "Calculate the equal monthly instalment for a mortgage, car loan, or personal loan, and the total interest paid over its term.",
    fields: [
      { id: "principal", label: "Loan amount", type: "number", default: 250000, min: 0, step: 1000 },
      { id: "rate", label: "Annual interest rate", type: "number", default: 6.5, min: 0, max: 30, step: 0.05, suffix: "%" },
      { id: "years", label: "Loan term", type: "number", default: 25, min: 1, max: 40, step: 1, suffix: "yrs" },
    ],
    compute(v) {
      const P = v.principal, r = v.rate / 100 / 12, n = v.years * 12;
      const emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const total = emi * n;
      return [
        { label: "Monthly payment", value: emi, format: "currency", emphasis: "neutral" },
        { label: "Total repayment", value: total, format: "currency" },
        { label: "Total interest", value: total - P, format: "currency", emphasis: "negative" },
      ];
    },
  },
  {
    id: "roi",
    title: "ROI Calculator",
    category: "investment",
    short: "Measure the return on an investment or purchase.",
    desc: "Compare what you put in against what you got back, as a total and annualised percentage return.",
    fields: [
      { id: "cost", label: "Amount invested", type: "number", default: 10000, min: 0, step: 100 },
      { id: "finalValue", label: "Current / final value", type: "number", default: 14500, min: 0, step: 100 },
      { id: "years", label: "Holding period", type: "number", default: 3, min: 0.1, max: 60, step: 0.1, suffix: "yrs" },
    ],
    compute(v) {
      const gain = v.finalValue - v.cost;
      const roi = v.cost === 0 ? 0 : (gain / v.cost) * 100;
      const annualized = v.cost === 0 || v.finalValue <= 0 ? 0 : (Math.pow(v.finalValue / v.cost, 1 / v.years) - 1) * 100;
      return [
        { label: "Net gain", value: gain, format: "currency", emphasis: gain >= 0 ? "positive" : "negative" },
        { label: "Total ROI", value: roi, format: "percent", emphasis: roi >= 0 ? "positive" : "negative" },
        { label: "Annualized ROI", value: annualized, format: "percent", emphasis: "neutral" },
      ];
    },
  },
  {
    id: "simple-interest",
    title: "Simple Interest",
    category: "banking",
    short: "Flat, non-compounding interest on a loan or deposit.",
    desc: "Calculate interest that accrues at a fixed rate on the original principal only — used for short-term loans and basic credit.",
    fields: [
      { id: "principal", label: "Principal amount", type: "number", default: 5000, min: 0, step: 100 },
      { id: "rate", label: "Annual interest rate", type: "number", default: 8, min: 0, max: 50, step: 0.1, suffix: "%" },
      { id: "years", label: "Time period", type: "number", default: 2, min: 0.1, max: 40, step: 0.1, suffix: "yrs" },
    ],
    compute(v) {
      const si = (v.principal * v.rate * v.years) / 100;
      return [
        { label: "Interest", value: si, format: "currency", emphasis: "positive" },
        { label: "Total payable", value: v.principal + si, format: "currency", emphasis: "neutral" },
      ];
    },
  },
  {
    id: "freedom-milestone",
    title: "Freedom Milestone",
    category: "retirement",
    short: "Estimate the nest egg needed to cover your expenses indefinitely.",
    desc: "Uses the safe-withdrawal-rate method to estimate the portfolio size needed to sustain your current annual spending.",
    fields: [
      { id: "expenses", label: "Annual expenses", type: "number", default: 30000, min: 0, step: 500 },
      { id: "withdrawal", label: "Safe withdrawal rate", type: "number", default: 4, min: 1, max: 10, step: 0.1, suffix: "%" },
      { id: "current", label: "Current savings", type: "number", default: 20000, min: 0, step: 500 },
    ],
    compute(v) {
      const target = v.expenses / (v.withdrawal / 100);
      const remaining = Math.max(target - v.current, 0);
      const progress = target === 0 ? 0 : Math.min((v.current / target) * 100, 100);
      return [
        { label: "Target corpus", value: target, format: "currency", emphasis: "neutral" },
        { label: "Still needed", value: remaining, format: "currency", emphasis: remaining > 0 ? "negative" : "positive" },
        { label: "Progress", value: progress, format: "percent", emphasis: "positive" },
      ];
    },
  },
  {
    id: "salary-hourly",
    title: "Salary ↔ Hourly",
    category: "salary",
    short: "Convert between an annual salary and an hourly rate.",
    desc: "Switch either direction — see what an annual salary works out to per hour, or what an hourly rate adds up to per year.",
    fields: [
      {
        id: "direction", label: "Convert", type: "select", default: "toHourly",
        options: [
          { value: "toHourly", label: "Salary → Hourly" },
          { value: "toSalary", label: "Hourly → Salary" },
        ],
      },
      { id: "amount", label: "Amount", type: "number", default: 60000, min: 0, step: 100 },
      { id: "hoursPerWeek", label: "Hours per week", type: "number", default: 40, min: 1, max: 100, step: 1 },
      { id: "weeksPerYear", label: "Working weeks per year", type: "number", default: 48, min: 1, max: 52, step: 1 },
    ],
    compute(v) {
      const totalHours = v.hoursPerWeek * v.weeksPerYear;
      if (v.direction === "toHourly") {
        const hourly = totalHours === 0 ? 0 : v.amount / totalHours;
        return [
          { label: "Working hours / year", value: totalHours, format: "number" },
          { label: "Hourly rate", value: hourly, format: "currency", emphasis: "neutral" },
        ];
      } else {
        const annual = v.amount * totalHours;
        return [
          { label: "Working hours / year", value: totalHours, format: "number" },
          { label: "Annual salary", value: annual, format: "currency", emphasis: "neutral" },
        ];
      }
    },
  },
  {
    id: "profit-margin",
    title: "Profit Margin",
    category: "business",
    short: "Find gross and net margin from revenue and costs.",
    desc: "Calculate gross margin (revenue minus cost of goods) and net margin (after all expenses) as percentages of revenue.",
    fields: [
      { id: "revenue", label: "Revenue", type: "number", default: 50000, min: 0, step: 100 },
      { id: "cogs", label: "Cost of goods sold", type: "number", default: 28000, min: 0, step: 100 },
      { id: "expenses", label: "Other operating expenses", type: "number", default: 9000, min: 0, step: 100 },
    ],
    compute(v) {
      const grossProfit = v.revenue - v.cogs;
      const netProfit = grossProfit - v.expenses;
      const grossMargin = v.revenue === 0 ? 0 : (grossProfit / v.revenue) * 100;
      const netMargin = v.revenue === 0 ? 0 : (netProfit / v.revenue) * 100;
      return [
        { label: "Gross profit", value: grossProfit, format: "currency" },
        { label: "Gross margin", value: grossMargin, format: "percent", emphasis: "neutral" },
        { label: "Net profit", value: netProfit, format: "currency", emphasis: netProfit >= 0 ? "positive" : "negative" },
        { label: "Net margin", value: netMargin, format: "percent", emphasis: netProfit >= 0 ? "positive" : "negative" },
      ];
    },
  },
];

const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "INR", symbol: "₹" },
  { code: "JPY", symbol: "¥" },
  { code: "AUD", symbol: "A$" },
  { code: "CAD", symbol: "C$" },
  { code: "CHF", symbol: "Fr" },
  { code: "CNY", symbol: "¥" },
  { code: "AED", symbol: "د.إ" },
];
