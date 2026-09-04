/* Wealth Arrays — calculator definitions
   Each calculator: id, title, short description, input fields, and a compute(values) function
   that returns an array of { label, value (number), format: 'currency'|'percent'|'number'|'years', emphasis: 'positive'|'negative'|'neutral'|null }
   All money formulas are currency-agnostic — the active currency symbol is applied at render time.
*/

const CATEGORY_ICONS = {
  investment: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 24 12 16 17 20 27 8" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 8h7v7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  loan: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 15 16 6l10 9" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 14v11h14V14" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 25v-6h4v6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  banking: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 13 16 6l11 7" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 13h20v3H6z" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 16v9M13 16v9M19 16v9M24 16v9" stroke-linecap="round"/><path d="M5 25h22" stroke-linecap="round"/></svg>',
  retirement: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 4v4M6 22a10 10 0 0 1 20 0" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 22h24" stroke-linecap="round"/><path d="M9 9.5 11.5 12M23 9.5 20.5 12" stroke-linecap="round"/></svg>',
  salary: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="9" width="22" height="16" rx="2"/><path d="M5 13h22" /><circle cx="22" cy="19" r="1.6" fill="currentColor" stroke="none"/></svg>',
  business: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="11" width="22" height="14" rx="2"/><path d="M12 11V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 17h22" /></svg>',
};

/* Signature accent color per category — used for card borders, tags, and icons.
   Distinct hues so categories are visually scannable at a glance. */
const CATEGORY_COLORS = {
  investment: "#0D9488",
  loan: "#D97706",
  banking: "#2563EB",
  retirement: "#7C3AED",
  salary: "#DB2777",
  business: "#0891B2",
};

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
    slug: "sip-calculator",
    title: "SIP Calculator",
    category: "investment",
    short: "Project the future value of monthly investments.",
    desc: "Estimate what a fixed monthly investment could grow to, given an expected annual return and a time horizon.",
    article: {
      formula: "SIP (Systematic Investment Plan) math is the future value of a series of equal monthly payments, compounded monthly: FV = P × [((1+i)^n − 1) / i] × (1+i), where P is the monthly amount, i is the monthly rate (annual rate ÷ 12), and n is the number of months.",
      exampleInputs: { monthly: 200, rate: 10, years: 15 },
      faqs: [
        { q: "What is a SIP?", a: "A SIP is simply investing a fixed amount at regular intervals — usually monthly — rather than a single lump sum. It's commonly used with mutual funds, but the math applies to any recurring investment." },
        { q: "Is a 10% annual return realistic?", a: "It depends entirely on what you invest in. Equity markets have historically returned around that range over long periods in some markets, but returns are never guaranteed and vary by year — treat any rate you enter as an assumption, not a promise." },
        { q: "Does this account for fees or taxes?", a: "No — this is a gross growth projection. Fund fees, taxes on gains, and inflation will all reduce the real amount you end up with." },
      ],
    },
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
    slug: "compound-interest-calculator",
    title: "Compound Interest",
    category: "banking",
    short: "See how a lump sum grows with compounding.",
    desc: "Calculate the future value of a one-time deposit compounded over time, at a chosen compounding frequency.",
    article: {
      formula: "A = P(1 + r/n)^(nt), where P is the principal, r is the annual interest rate, n is how many times per year interest compounds, and t is time in years.",
      exampleInputs: { principal: 5000, rate: 6, years: 10, freq: "12" },
      faqs: [
        { q: "How is this different from simple interest?", a: "Simple interest is calculated only on the original principal. Compound interest is calculated on the principal plus any interest already earned, so it grows faster the longer it runs." },
        { q: "Does compounding frequency matter much?", a: "It matters more at higher rates and longer time periods. Moving from annual to monthly compounding usually makes a modest difference; the effect compounds itself over decades." },
        { q: "Does this show real (inflation-adjusted) growth?", a: "No — this is nominal growth. If you want to compare against inflation, subtract your expected inflation rate from the interest rate before entering it." },
      ],
    },
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
    slug: "roi-calculator",
    title: "ROI Calculator",
    category: "investment",
    short: "Measure the return on an investment or purchase.",
    desc: "Compare what you put in against what you got back, as a total and annualised percentage return.",
    article: {
      formula: "Total ROI = (Final value − Cost) / Cost × 100. Annualized ROI = [(Final value / Cost)^(1/years) − 1] × 100 — this spreads the total return evenly across each year, so investments held for different lengths of time can be compared fairly.",
      exampleInputs: { cost: 10000, finalValue: 14500, years: 3 },
      faqs: [
        { q: "What's the difference between ROI and CAGR?", a: "Annualized ROI here is calculated the same way as CAGR (Compound Annual Growth Rate) — both express a multi-year return as an equivalent constant yearly rate." },
        { q: "Does ROI include fees or taxes?", a: "Only if you build them into your cost or final value inputs. The formula itself is agnostic — it just compares two numbers." },
        { q: "What does a negative ROI mean?", a: "It means the final value was lower than what you put in — you lost money on the investment or purchase over that period." },
      ],
    },
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
    slug: "simple-interest-calculator",
    title: "Simple Interest",
    category: "banking",
    short: "Flat, non-compounding interest on a loan or deposit.",
    desc: "Calculate interest that accrues at a fixed rate on the original principal only — used for short-term loans and basic credit.",
    article: {
      formula: "SI = (P × R × T) / 100, where P is the principal, R is the annual interest rate as a percentage, and T is the time in years.",
      exampleInputs: { principal: 5000, rate: 8, years: 2 },
      faqs: [
        { q: "Where is simple interest actually used?", a: "It's common for short-term loans, some certificates of deposit, and basic consumer credit agreements — anywhere interest is calculated once on the original amount rather than recalculated on a growing balance." },
        { q: "Do credit cards use simple interest?", a: "Most credit cards actually compound daily, which behaves more like the compound interest calculator on this site — check your card's terms rather than assuming." },
        { q: "Which is better for a saver — simple or compound?", a: "Compound interest earns more over time for a saver, since interest is added to the balance and itself earns interest. Simple interest earns more for a borrower, since the interest owed doesn't grow on itself." },
      ],
    },
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
    slug: "retirement-calculator",
    title: "Freedom Milestone",
    category: "retirement",
    short: "Estimate the nest egg needed to cover your expenses indefinitely.",
    desc: "Uses the safe-withdrawal-rate method to estimate the portfolio size needed to sustain your current annual spending.",
    article: {
      formula: "Target corpus = Annual expenses ÷ Safe withdrawal rate. This comes from the widely-cited \"4% rule\": if you withdraw 4% of a portfolio per year, historical simulations suggest it has a reasonable chance of lasting 30+ years — dividing by 4% is the same as multiplying expenses by 25.",
      exampleInputs: { expenses: 30000, withdrawal: 4, current: 20000 },
      faqs: [
        { q: "Where does the 4% figure come from?", a: "It's based on historical U.S. market studies (the \"Trinity study\" and similar research) looking at how often a portfolio survived 30-year withdrawal periods. It's a rule of thumb, not a guarantee — markets, retirement length, and spending patterns all affect the real safe rate." },
        { q: "Does this account for inflation?", a: "The 4% rule as commonly cited already assumes you increase withdrawals with inflation each year. This calculator doesn't separately model inflation on the target itself — treat the result as being in today's money." },
        { q: "Is this the same as a pension projection?", a: "No — this estimates a self-funded portfolio target. It doesn't include any pension, social security, or annuity income you might also have." },
      ],
    },
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
    slug: "salary-to-hourly-calculator",
    title: "Salary ↔ Hourly",
    category: "salary",
    short: "Convert between an annual salary and an hourly rate.",
    desc: "Switch either direction — see what an annual salary works out to per hour, or what an hourly rate adds up to per year.",
    article: {
      formula: "Hourly rate = Annual salary ÷ (Hours per week × Working weeks per year). To go the other way: Annual salary = Hourly rate × Hours per week × Working weeks per year.",
      exampleInputs: { direction: "toHourly", amount: 60000, hoursPerWeek: 40, weeksPerYear: 48 },
      faqs: [
        { q: "Why 48 weeks and not 52?", a: "52 weeks minus a typical 2–4 weeks of unpaid time off (holidays, sick days not covered by salary) gives a more realistic working-weeks figure. Adjust it to match your actual situation — salaried roles with full paid leave might use 52." },
        { q: "Does this include overtime?", a: "No — this is a straight-line conversion based on regular hours. If you regularly work overtime, your effective hourly rate for salaried work will be lower than shown here." },
        { q: "Are taxes included?", a: "No, both figures are gross (pre-tax) amounts." },
      ],
    },
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
    slug: "profit-margin-calculator",
    title: "Profit Margin",
    category: "business",
    short: "Find gross and net margin from revenue and costs.",
    desc: "Calculate gross margin (revenue minus cost of goods) and net margin (after all expenses) as percentages of revenue.",
    article: {
      formula: "Gross margin = (Revenue − Cost of goods sold) ÷ Revenue × 100. Net margin = (Revenue − Cost of goods sold − Other expenses) ÷ Revenue × 100.",
      exampleInputs: { revenue: 50000, cogs: 28000, expenses: 9000 },
      faqs: [
        { q: "What's the difference between gross and net margin?", a: "Gross margin only subtracts the direct cost of producing what you sold. Net margin also subtracts everything else — rent, salaries, marketing, and other operating expenses — giving a fuller picture of profitability." },
        { q: "What's a 'good' profit margin?", a: "It varies enormously by industry — grocery retail often runs on margins under 5%, while software businesses can see 70%+ gross margins. Compare against others in your specific industry rather than a universal benchmark." },
        { q: "How can I improve my margin?", a: "Broadly: raise prices, reduce the cost of goods sold, or cut operating expenses — each has trade-offs specific to your business that this calculator can't account for." },
      ],
    },
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

/* Node-only export, used by the build script that generates static pages.
   Browsers ignore this block (typeof module is undefined there). */
if (typeof module !== "undefined") {
  module.exports = { CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS, CALCULATORS, CURRENCIES };
}
