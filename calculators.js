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
      { id: "rate", label: "Expected annual return", type: "number", default: 10, min: 0, max: 1000, step: 0.1, suffix: "%" },
      { id: "years", label: "Investment period", type: "number", default: 15, min: 1, max: 200, step: 1, suffix: "yrs" },
      { id: "inflation", label: "Expected annual inflation", type: "number", default: 6, min: 0, max: 30, step: 0.1, suffix: "%" },
    ],
    compute(v) {
      const P = v.monthly, i = v.rate / 100 / 12, n = v.years * 12;
      const fv = i === 0 ? P * n : P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      const invested = P * n;
      const gains = fv - invested;
      const realValue = fv / Math.pow(1 + v.inflation / 100, v.years);
      return [
        { label: "You put in", value: invested, format: "currency" },
        { label: "Your growth / profit", value: gains, format: "currency", emphasis: "positive" },
        { label: "You could have in the future", value: fv, format: "currency", emphasis: "neutral" },
        { label: "What that future money is worth in today's money", value: realValue, format: "currency", emphasis: "neutral" },
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
      { id: "rate", label: "Annual interest rate", type: "number", default: 6, min: 0, max: 1000, step: 0.1, suffix: "%" },
      { id: "years", label: "Time period", type: "number", default: 10, min: 1, max: 200, step: 1, suffix: "yrs" },
      { id: "inflation", label: "Expected annual inflation", type: "number", default: 6, min: 0, max: 30, step: 0.1, suffix: "%" },
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
      const realValue = A / Math.pow(1 + v.inflation / 100, t);
      return [
        { label: "Principal", value: P, format: "currency" },
        { label: "Interest earned", value: A - P, format: "currency", emphasis: "positive" },
        { label: "Final amount (future money)", value: A, format: "currency", emphasis: "neutral" },
        { label: "Value in today's purchasing power", value: realValue, format: "currency", emphasis: "neutral" },
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
      const emi = P === 0 ? 0 : n <= 0 ? 0 : r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
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
      { id: "cost", label: "Amount invested", type: "number", default: 10000, min: 0.01, step: 100 },
      { id: "finalValue", label: "Current / final value", type: "number", default: 14500, min: 0, step: 100 },
      { id: "years", label: "Holding period", type: "number", default: 3, min: 0.1, max: 200, step: 0.1, suffix: "yrs" },
    ],
    compute(v) {
      const gain = v.finalValue - v.cost;
      const roi = v.cost === 0 ? 0 : (gain / v.cost) * 100;
      const annualized = v.cost <= 0 || v.finalValue < 0 || v.years <= 0 ? 0 : (Math.pow(v.finalValue / v.cost, 1 / v.years) - 1) * 100;
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
      { id: "rate", label: "Annual interest rate", type: "number", default: 8, min: 0, max: 1000, step: 0.1, suffix: "%" },
      { id: "years", label: "Time period", type: "number", default: 2, min: 0.1, max: 40, step: 0.1, suffix: "yrs" },
    ],
    compute(v) {
      const si = (v.principal * v.rate * v.years) / 100;
      return [
        { label: "Interest", value: si, format: "currency", emphasis: "positive" },
        { label: "Total amount", value: v.principal + si, format: "currency", emphasis: "neutral" },
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
      const expenses = Math.max(Number(v.expenses) || 0, 0);
      const withdrawal = Math.max(Number(v.withdrawal) || 0, 0);
      const current = Math.max(Number(v.current) || 0, 0);
      const target = withdrawal > 0 ? expenses / (withdrawal / 100) : 0;
      const remaining = Math.max(target - current, 0);
      const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
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
  {
    id:"fixed-deposit",slug:"fixed-deposit-calculator",title:"Fixed Deposit Calculator",category:"banking",
    short:"Estimate fixed-deposit maturity and interest.",desc:"Project a one-time deposit using an annual rate, term and compounding frequency.",
    article:{formula:"A fixed-deposit projection compounds a one-time deposit at the selected annual rate and frequency: A = P × (1 + r/n)^(n×t). The inflation-adjusted figure divides the future amount by (1 + inflation)^t so you can compare it with today’s purchasing power.",exampleInputs:{principal:100000,rate:7,years:5,inflation:6,freq:"4"},faqs:[{q:"What does the FD maturity amount mean?",a:"It is the modeled value after the chosen term, rate and compounding schedule. Actual bank maturity can differ because product terms and rates vary."},{q:"How does TDS affect an FD?",a:"This is a gross projection. TDS and your applicable tax rules can reduce what you keep, so check current rules for your situation."},{q:"What happens if I close an FD early?",a:"The bank may apply a lower applicable rate and an early-closure penalty or other conditions. Recalculate using the revised terms rather than the original maturity value."},{q:"Cumulative or regular interest payout?",a:"Cumulative deposits reinvest interest toward maturity, while payout deposits distribute interest during the term. Compare cash-flow needs, rate and tax treatment."}]},
    fields:[{id:"principal",label:"Deposit amount",type:"number", default:100000,min:0,step:100},{id:"rate",label:"Annual interest rate",type:"number", default:7,min:0,max:1000,step:.1,suffix:"%"},{id:"years",label:"Term",type:"number", default:5,min:.1,max:200,step:.1,suffix:"yrs"},{id:"inflation",label:"Expected annual inflation",type:"number",default:6,min:0,max:30,step:.1,suffix:"%"},{id:"freq",label:"Compounding",type:"select",default:"4",options:[{value:"1",label:"Annually"},{value:"4",label:"Quarterly"},{value:"12",label:"Monthly"}]}],
    compute(v){const P=Math.max(v.principal,0),rate=Math.max(v.rate,0),years=Math.max(v.years,0),inflation=Math.max(v.inflation,0),n=Math.max(1,Number(v.freq)||1),A=P*Math.pow(1+rate/100/n,n*years),real=A/Math.pow(1+inflation/100,years);return[{label:"Deposit",value:P,format:"currency"},{label:"Interest earned",value:A-P,format:"currency",emphasis:"positive"},{label:"Maturity value (future money)",value:A,format:"currency",emphasis:"neutral"},{label:"Value in today's purchasing power",value:real,format:"currency",emphasis:"neutral"}]}
  },
  {
    id:"recurring-deposit",slug:"recurring-deposit-calculator",title:"Recurring Deposit Calculator",category:"banking",
    short:"Project monthly deposits and their maturity value.",desc:"Estimate the future value of equal monthly deposits using monthly compounding and end-of-month deposits.",
    article:{formula:"Future value = P × [((1 + i)^n − 1) ÷ i], where P is the monthly deposit, i is the monthly rate and n is the whole number of monthly deposits. This model assumes each deposit is made at the end of the month and compounds monthly.",exampleInputs:{monthly:1000,rate:7,years:5},faqs:[{q:"What does the inflation result mean?",a:"It estimates how much money may be needed in the future to have the same purchasing power as today's amount under the constant inflation rate entered."},{q:"Is a constant inflation rate realistic?",a:"It is a simplifying assumption. Actual inflation changes, so use several rates to understand a range rather than treating one projection as a forecast."},{q:"How does inflation affect retirement planning?",a:"Higher inflation increases the future cost of today's lifestyle and can raise the savings target. Pair the result with spending and investment-return scenarios."},{q:"Does this predict a specific item's price?",a:"No. It is a broad mathematical model. Individual goods and services can rise faster or slower than the general inflation assumption."}]},
    fields:[{id:"monthly",label:"Monthly deposit",type:"number", default:5000,min:0,step:100},{id:"rate",label:"Annual interest rate",type:"number", default:7,min:0,max:1000,step:.1,suffix:"%"},{id:"years",label:"Deposit term",type:"number", default:5,min:1,max:200,step:0.0833333333,suffix:"yrs"},{id:"inflation",label:"Expected annual inflation",type:"number",default:6,min:0,max:30,step:.1,suffix:"%"}],
    compute(v){const n=Math.max(0,Math.round(v.years*12)),i=v.rate/1200,m=Math.max(v.monthly,0),A=i===0?m*n:m*((Math.pow(1+i,n)-1)/i),real=A/Math.pow(1+v.inflation/100,v.years);return[{label:"Monthly deposits",value:n,format:"number"},{label:"Total deposits",value:m*n,format:"currency"},{label:"Interest earned",value:A-m*n,format:"currency",emphasis:"positive"},{label:"Estimated maturity (future money)",value:A,format:"currency",emphasis:"neutral"},{label:"Value in today's purchasing power",value:real,format:"currency",emphasis:"neutral"}]}
  },
  {
    id:"lumpsum",slug:"lumpsum-calculator",title:"Lumpsum Calculator",category:"investment",
    short:"Project a one-time investment over time.",desc:"Estimate how a lump-sum investment could grow at an assumed annual return.",
    article:{formula:"A lumpsum projection compounds one initial investment over the selected period: A = P × (1 + r)^t. The calculator also shows the gain over the original investment and estimated purchasing power after inflation.",exampleInputs:{principal:100000,rate:10,years:10,inflation:6},faqs:[{q:"What does a lump-sum projection assume?",a:"It assumes one starting amount remains invested for the full period at the annual rate entered. It is a mathematical scenario, not a promise of that yearly return."},{q:"How sensitive is the result to the return rate?",a:"Very sensitive over long periods. Compare lower, middle and higher assumptions to see how much the final value depends on the assumed rate."},{q:"Does the result include inflation?",a:"The growth result is nominal unless an inflation input is explicitly used. A larger future balance can still have lower purchasing power."},{q:"What about taxes and investment fees?",a:"They are not automatically deducted from a generic projection. Include product-specific costs and taxes separately when comparing actual outcomes."}]},
    fields:[{id:"principal",label:"Investment amount",type:"number", default:100000,min:0,step:100},{id:"rate",label:"Expected annual return",type:"number", default:10,min:0,max:1000,step:.1,suffix:"%"},{id:"years",label:"Investment period",type:"number", default:10,min:.1,max:200,step:.1,suffix:"yrs"},{id:"inflation",label:"Expected annual inflation",type:"number",default:6,min:0,max:30,step:.1,suffix:"%"}],
    compute(v){const P=Math.max(v.principal,0),rate=Math.max(v.rate,0),years=Math.max(v.years,0),inflation=Math.max(v.inflation,0),A=P*Math.pow(1+rate/100,years),real=A/Math.pow(1+inflation/100,years);return[{label:"Amount invested",value:P,format:"currency"},{label:"Estimated gain",value:A-P,format:"currency",emphasis:"positive"},{label:"Projected value (future money)",value:A,format:"currency",emphasis:"neutral"},{label:"Value in today's purchasing power",value:real,format:"currency",emphasis:"neutral"}]}
  },
  {
    id:"cagr",slug:"cagr-calculator",title:"CAGR Calculator",category:"investment",
    short:"Find the compound annual growth rate.",desc:"Calculate the annualized growth rate between a starting value and an ending value.",
    article:{formula:"CAGR annualizes the change between a starting value and an ending value: CAGR = (Ending ÷ Starting)^(1/years) − 1. It summarizes growth as one constant annual rate.",exampleInputs:{start:100000,end:161051,years:5},faqs:[{q:"What does CAGR measure?",a:"CAGR converts the change between starting and ending values into an equivalent constant annual growth rate. It smooths the path and does not describe each year's actual return."},{q:"Can CAGR handle deposits or withdrawals?",a:"Not reliably by itself. Interim cash flows change the calculation because timing matters. Use a cash-flow-aware return measure when there are significant additions or withdrawals."},{q:"Can a high CAGR hide volatility?",a:"Yes. Two investments can have the same CAGR while experiencing very different ups and downs. Review the underlying periodic returns when risk matters."},{q:"Does CAGR include dividends or fees?",a:"Only if the values you enter already reflect them. The calculator cannot know omitted distributions, taxes, fees or cash flows."}]},
    fields:[{id:"start",label:"Starting value",type:"number", default:100000,min:0.01,step:100},{id:"end",label:"Ending value",type:"number", default:161051,min:0,step:100},{id:"years",label:"Years",type:"number", default:5,min:.01,max:200,step:.1,suffix:"yrs"}],
    compute(v){const start=Math.max(v.start,0),end=Math.max(v.end,0),years=Math.max(v.years,0),gain=end-start,totalGrowth=start>0?(end/start-1)*100:0,cagr=start>0&&end>=0&&years>0?(Math.pow(end/start,1/years)-1)*100:0;return[{label:"Absolute gain",value:gain,format:"currency",emphasis:gain>=0?"positive":"negative"},{label:"Total growth",value:totalGrowth,format:"percent"},{label:"CAGR",value:cagr,format:"percent",emphasis:"neutral"}]}
  },
  {
    id:"car-loan",slug:"car-loan-calculator",title:"Car Loan EMI Calculator",category:"loan",
    short:"Estimate a vehicle loan payment and total cost.",desc:"Calculate equal monthly payments and interest for a car or vehicle loan.",
    article:{formula:"The car-loan EMI uses the standard amortizing-loan formula on the amount financed after the down payment. It estimates monthly payment, total repayment, interest and total cost including the down payment.",exampleInputs:{price:1000000,down:200000,rate:9,years:5},faqs:[{q:"Why compare total repayment instead of only EMI?",a:"A longer term can make the monthly EMI easier while increasing total interest. Compare EMI, total repayment, down payment and mandatory charges together."},{q:"What costs are missing from a basic car-loan calculation?",a:"The real cost can include processing fees, insurance, registration, taxes and dealer or lender charges. Check the written cost schedule."},{q:"Does a larger down payment always make sense?",a:"It reduces the amount borrowed and usually reduces interest, but it also uses cash that may be needed for emergencies or other priorities. Compare both effects."},{q:"Can the actual car-loan rate change?",a:"This model assumes a constant rate. If your loan has a variable or promotional rate, rerun the calculation when the applicable rate changes."}]},
    fields:[{id:"price",label:"Vehicle price",type:"number", default:1000000,min:0,step:1000},{id:"down",label:"Down payment",type:"number", default:200000,min:0,step:1000},{id:"rate",label:"Annual interest rate",type:"number", default:9,min:0,max:40,step:.05,suffix:"%"},{id:"years",label:"Loan term",type:"number", default:5,min:1,max:15,step:1,suffix:"yrs"}],
    compute(v){const price=Math.max(v.price,0),down=Math.min(Math.max(v.down,0),price),P=Math.max(price-down,0),years=Math.max(v.years,0),n=Math.max(1,Math.round(years*12)),r=Math.max(v.rate,0)/1200,emi=P===0?0:(r===0?P/n:P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1)),total=emi*n;return[{label:"Loan amount",value:P,format:"currency"},{label:"Monthly payment",value:emi,format:"currency",emphasis:"neutral"},{label:"Total repayment",value:total,format:"currency"},{label:"Total interest",value:total-P,format:"currency",emphasis:"negative"},{label:"Total cost including down payment",value:total+down,format:"currency"}]}
  },
  {
    id:"personal-loan",slug:"personal-loan-calculator",title:"Personal Loan Calculator",category:"loan",
    short:"Estimate monthly payments and the cost of a personal loan.",desc:"Calculate an estimated monthly payment from the loan amount, annual rate and repayment term.",
    article:{formula:"For a fixed-rate amortizing personal loan, EMI is calculated from the principal, monthly interest rate and number of monthly payments. The calculator separates total repayment from the original principal to show estimated interest.",exampleInputs:{principal:500000,rate:12,years:5},faqs:[{q:"How much does the interest rate affect a personal loan?",a:"A higher rate increases EMI and total interest for the same principal and term. Compare several rates rather than judging an offer from EMI alone."},{q:"What fees should I check?",a:"Look for processing charges, insurance or bundled products, late-payment charges and prepayment or foreclosure conditions. Some costs sit outside the headline rate."},{q:"Is a longer term cheaper?",a:"The EMI is usually lower, but total interest can be higher because you pay for longer. Compare total repayment as well as monthly affordability."},{q:"Does this model prepayment?",a:"No. It models the stated principal, rate and term. If you plan extra payments, use the lender's amortization schedule or a model that explicitly includes them."}]},
    fields:[{id:"principal",label:"Loan amount",type:"number", default:500000,min:0,step:1000},{id:"rate",label:"Annual interest rate",type:"number", default:12,min:0,max:60,step:.05,suffix:"%"},{id:"years",label:"Repayment term",type:"number", default:5,min:0.0833333333,max:20,step:0.0833333333,suffix:"yrs"}],
    compute(v){const n=Math.max(1,Math.round(Math.max(v.years,0)*12)),P=Math.max(v.principal,0),r=Math.max(v.rate,0)/1200,emi=P===0?0:(r===0?P/n:P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1)),total=emi*n;return[{label:"Loan months",value:n,format:"number"},{label:"Monthly payment",value:emi,format:"currency",emphasis:"neutral"},{label:"Total repayment",value:total,format:"currency"},{label:"Total interest",value:total-P,format:"currency",emphasis:"negative"}]}
  },
  {
    id:"debt-payoff",slug:"debt-payoff-calculator",title:"Debt Payoff Calculator",category:"loan",
    short:"Estimate how long a fixed payment takes to clear debt.",desc:"Model a single debt balance with a fixed monthly payment and interest rate.",
    article:{formula:"Debt payoff is modeled month by month from the current balance, annual interest rate and fixed monthly payment. The calculator estimates payoff time and interest and flags payments that do not cover monthly interest.",exampleInputs:{balance:100000,rate:18,payment:3000},faqs:[{q:"Why does the first payment include so much interest?",a:"Interest is calculated on the outstanding balance. With a high rate, a meaningful part of the first payment can go to interest before the rest reduces principal."},{q:"What if my payment is less than monthly interest?",a:"The balance may not fall and can grow under some debt terms. If payment does not cover required interest and charges, contact the creditor."},{q:"How much can a higher payment change payoff time?",a:"Even a moderate increase can reduce months and future interest because principal falls faster. Compare the current payment with a realistic higher payment."},{q:"Should I trust the payoff date?",a:"Use it as a planning estimate. Lender-specific fees, daily interest, payment timing and rate changes can alter the actual payoff."}]},
    fields:[{id:"balance",label:"Current balance",type:"number", default:100000,min:0,step:100},{id:"rate",label:"Annual interest rate",type:"number", default:18,min:0,max:100,step:.1,suffix:"%"},{id:"payment",label:"Monthly payment",type:"number", default:3000,min:.01,step:10}],
    compute(v){const balance=Math.max(v.balance,0),payment=Math.max(v.payment,0),r=Math.max(v.rate,0)/1200;if(balance===0)return[{label:"Months to payoff",value:0,format:"number",emphasis:"positive"},{label:"Estimated years",value:0,format:"years"},{label:"Estimated interest",value:0,format:"currency",emphasis:"positive"}];if(payment<=balance*r)return[{label:"Monthly interest at current balance",value:balance*r,format:"currency",emphasis:"negative"},{label:"Current monthly payment",value:payment,format:"currency",emphasis:"negative"},{label:"Payment gap to stop negative amortization",value:Math.max(balance*r-payment,0),format:"currency",emphasis:"negative"}];const exactMonths=r===0?balance/payment:-Math.log(1-r*balance/payment)/Math.log(1+r);const months=Math.max(1,Math.ceil(exactMonths));let remaining=balance,total=0;for(let m=1;m<=months;m++){remaining*=1+r;const due=Math.min(payment,remaining);total+=due;remaining=Math.max(remaining-due,0);if(remaining<=1e-8)break}return[{label:"Months to payoff",value:months,format:"number",emphasis:"neutral"},{label:"Estimated years",value:months/12,format:"years"},{label:"Estimated interest",value:Math.max(total-balance,0),format:"currency",emphasis:"negative"}]}
  },
  {
    id:"inflation",slug:"inflation-calculator",title:"Inflation Calculator",category:"retirement",
    short:"Estimate future prices, purchasing power and what you may need later.",desc:"See how an assumed annual inflation rate changes future costs, real purchasing power and the nominal amount you may need later to buy something that costs a certain amount today.",
    article:{formula:"Future cost = today's cost × (1 + inflation rate)^years.",exampleInputs:{amount:100000,rate:6,years:20},faqs:[{q:"How much money may I need in the future?",a:"Enter what something costs today, an assumed inflation rate and the number of years. The calculator estimates the nominal amount you may need later to buy the same thing."},{q:"Does this predict actual inflation?",a:"No. The inflation rate is an assumption for planning, not a forecast or guarantee."},{q:"How does inflation affect a retirement target?",a:"Higher inflation can raise the future cost of the lifestyle you want to maintain. Test several rates instead of relying on one long-term assumption."},{q:"Does every expense rise at the same rate?",a:"No. Food, housing, healthcare and other categories can move differently. Treat this result as a broad planning estimate rather than a price forecast for one item."}]},
    fields:[{id:"amount",label:"Today's amount / current cost",type:"number", default:100000,min:0,step:100},{id:"rate",label:"Annual inflation rate",type:"number", default:6,min:0,max:1000,step:.1,suffix:"%"},{id:"years",label:"Years from now",type:"number", default:20,min:0,max:200,step:.1,suffix:"yrs"}],
    compute(v){const amount=Math.max(v.amount,0),rate=Math.max(v.rate,0),years=Math.max(v.years,0),factor=Math.pow(1+rate/100,years),future=amount*factor,purchasingPower=amount/factor;return[{label:"Future amount needed to buy the same thing",value:future,format:"currency",emphasis:"negative"},{label:"Price increase",value:future-amount,format:"currency"},{label:"Today's amount worth after inflation",value:purchasingPower,format:"currency",emphasis:"negative"}]}
  },
  {
    id:"net-worth",slug:"net-worth-calculator",title:"Net Worth Calculator",category:"retirement",
    short:"Calculate assets minus liabilities.",desc:"Add what you own and subtract what you owe to estimate your personal net worth.",
    article:{formula:"Net worth is the value of what you own minus what you owe: net worth = total assets − total liabilities. This calculator groups cash, investments and property as assets and compares them with total debt.",exampleInputs:{cash:200000,investments:500000,property:3000000,debt:1500000},faqs:[{q:"What should I include in net worth?",a:"List assets such as cash, investments and property, then subtract debts and other liabilities. Use consistent categories and avoid double counting."},{q:"How should I value my home?",a:"Use a reasonable current value if the purpose is present net worth, and record the method consistently. Market value does not mean the asset is immediately liquid."},{q:"Why is net worth different from available cash?",a:"Net worth includes assets that may be difficult or costly to sell. Someone can have high net worth but limited liquid cash."},{q:"How often should I track net worth?",a:"Monthly or quarterly tracking can reveal trends without excessive daily noise. Use the same valuation method each time so changes are comparable."}]},
    fields:[{id:"cash",label:"Cash & savings",type:"number", default:200000,min:0,step:100},{id:"investments",label:"Investments",type:"number", default:500000,min:0,step:100},{id:"property",label:"Property value",type:"number", default:3000000,min:0,step:1000},{id:"debt",label:"Total liabilities",type:"number", default:1500000,min:0,step:100}],
    compute(v){const cash=Math.max(v.cash,0),investments=Math.max(v.investments,0),property=Math.max(v.property,0),debt=Math.max(v.debt,0),assets=cash+investments+property,net=assets-debt;return[{label:"Total assets",value:assets,format:"currency",emphasis:"positive"},{label:"Total liabilities",value:debt,format:"currency",emphasis:"negative"},{label:"Net worth",value:net,format:"currency",emphasis:net>=0?"positive":"negative"}]}
  },
  {
    id:"overtime",slug:"overtime-pay-calculator",title:"Overtime Pay Calculator",category:"salary",
    short:"Estimate overtime earnings and gross pay.",desc:"Calculate additional pay from an hourly rate, overtime hours and overtime multiplier.",
    article:{formula:"Overtime pay is calculated as base hourly rate × overtime hours × the multiplier you choose. Regular pay is calculated separately and added to overtime pay.",exampleInputs:{hourly:500,regular:160,overtime:20,multiplier:1.5},faqs:[{q:"How is overtime pay calculated here?",a:"The model multiplies the regular hourly rate by overtime hours and the multiplier entered. Actual payroll rules depend on jurisdiction, employment status and employer policy."},{q:"Does every worker qualify for overtime?",a:"Not necessarily. Eligibility and required multipliers vary by local law, employment classification and contract. Check the rules that apply to your job."},{q:"What is the difference between 1.5x and 2x?",a:"A 1.5x multiplier pays one and a half times the regular hourly rate; 2x pays twice the rate. Use the multiplier required by your applicable terms."},{q:"Does this include taxes or deductions?",a:"No. It estimates gross pay. Payroll taxes, benefits, withholding and other deductions can reduce take-home pay."}]},
    fields:[{id:"hourly",label:"Base hourly rate",type:"number", default:500,min:0,step:.01},{id:"regular",label:"Regular hours",type:"number", default:160,min:0,max:744,step:.5},{id:"overtime",label:"Overtime hours",type:"number", default:20,min:0,max:744,step:.5},{id:"multiplier",label:"Overtime multiplier",type:"number", default:1.5,min:1,max:5,step:.1,suffix:"×"}],
    compute(v){const hourly=Math.max(v.hourly,0),regular=Math.max(v.regular,0),overtime=Math.max(v.overtime,0),multiplier=Math.max(v.multiplier,1),reg=hourly*regular,ot=hourly*overtime*multiplier;return[{label:"Regular pay",value:reg,format:"currency"},{label:"Overtime pay",value:ot,format:"currency",emphasis:"positive"},{label:"Total gross pay",value:reg+ot,format:"currency",emphasis:"neutral"}]}
  },
  {
    id:"freelance-rate",slug:"freelance-rate-calculator",title:"Freelance Rate Calculator",category:"business",
    short:"Turn a target income into an hourly freelance rate.",desc:"Estimate the billable hourly rate needed to cover income goals, expenses and non-billable time.",
    article:{formula:"A target freelance hourly rate starts with the annual income you want to earn, adds annual business expenses, and divides by realistic billable hours: hourly rate = (target income + expenses) ÷ billable hours.",exampleInputs:{income:1200000,expenses:200000,hours:25,weeks:48},faqs:[{q:"Why calculate a billable hourly rate?",a:"Not every working hour is billable. Sales, proposals, admin, revisions, learning, holidays and project gaps consume time, so a rate based on all hours can underprice your services."},{q:"What billable utilization should I assume?",a:"There is no universal percentage. Start with actual billable hours, then test a lower-utilization case to create a buffer for slow periods and non-client work."},{q:"Should the rate include taxes and business costs?",a:"Account for business expenses and a realistic tax buffer if your goal is a specific take-home amount. Adjust the inputs to match what your target income means to you."},{q:"Why can a higher rate still produce lower annual income?",a:"If billable hours fall sharply, a higher rate may not compensate for low utilization. Compare rate and realistic billable capacity together."}]},
    fields:[{id:"income",label:"Target annual income",type:"number", default:1200000,min:0,step:1000},{id:"expenses",label:"Annual business expenses",type:"number", default:200000,min:0,step:100},{id:"hours",label:"Billable hours per week",type:"number", default:25,min:.1,max:100,step:.5},{id:"weeks",label:"Working weeks per year",type:"number", default:48,min:1,max:52,step:1}],
    compute(v){const hours=Math.max(v.hours,0),weeks=Math.max(v.weeks,0),income=Math.max(v.income,0),expenses=Math.max(v.expenses,0),billable=hours*weeks,needed=income+expenses,rate=billable?needed/billable:0;return[{label:"Annual amount to cover",value:needed,format:"currency"},{label:"Billable hours / year",value:billable,format:"number"},{label:"Target hourly rate",value:rate,format:"currency",emphasis:"neutral"}]}
  },
  {
    id:"income-tax-planner",slug:"income-tax-planner",title:"Income Tax Planner",category:"business",
    short:"Estimate a simplified tax outcome from income, deductions and an effective rate assumption.",desc:"Compare a simplified income-tax scenario using transparent assumptions. This is a planning model, not jurisdiction-specific tax filing software.",
    article:{formula:"Estimated tax = (gross income − deductions) × assumed effective tax rate. The result is a simplified planning estimate and does not model tax brackets, credits, filing status or jurisdiction-specific rules.",exampleInputs:{income:1200000,deductions:150000,rate:15},faqs:[{q:"Is this an official income-tax calculator?",a:"No. It is a jurisdiction-neutral planning model that applies the effective tax rate you enter to income after deductions."},{q:"Why can my actual tax differ?",a:"Actual tax can depend on tax brackets, credits, allowances, filing status, income type, residency and the rules for the relevant tax year."},{q:"What does the deductions field represent?",a:"Use it for the amount you want to remove from gross income in this simplified model. Do not assume every real-world deduction is treated this way under your local tax rules."},{q:"Can I use this for tax filing?",a:"No. Use current official tax guidance or tax-filing software for compliance. This tool is intended for scenario comparison and education."}]},
    fields:[{id:"income",label:"Annual gross income",type:"number",default:1200000,min:0,step:1000},{id:"deductions",label:"Estimated deductions",type:"number",default:150000,min:0,step:100},{id:"rate",label:"Estimated effective tax rate",type:"number",default:15,min:0,max:100,step:.1,suffix:"%"}],
    compute(v){const income=Math.max(v.income,0),deductions=Math.min(Math.max(v.deductions,0),income),taxable=Math.max(income-deductions,0),rate=Math.max(v.rate,0),tax=taxable*rate/100,effective=income>0?tax/income*100:0;return[{label:"Estimated taxable income",value:taxable,format:"currency"},{label:"Estimated tax",value:tax,format:"currency",emphasis:"negative"},{label:"Effective tax on gross income",value:effective,format:"percent"},{label:"Estimated after-tax income",value:income-tax,format:"currency",emphasis:"neutral"}]}
  },
  {id:"home-loan-emi",slug:"home-loan-emi-calculator",title:"Home Loan EMI Calculator",category:"loan",short:"Calculate a home-loan EMI, total interest and total repayment.",desc:"Estimate the monthly payment and long-run cost of a home loan using a fixed interest rate and repayment term.",article:{formula:"EMI = [P × r × (1+r)^n] ÷ [(1+r)^n − 1].",exampleInputs:{},faqs:[{q:"Does this include property taxes and insurance?",a:"No. It models the loan itself; recurring housing costs should be considered separately."},{q:"Why is total interest high on a long loan?",a:"A longer term leaves the balance outstanding for more months, so interest accumulates for longer."},{q:"Can I use a variable-rate loan?",a:"The model assumes the entered rate stays constant; recalculate when the applicable rate changes."}]},fields:[{id:"principal",label:"Home loan amount",type:"number",default:5000000,min:0,max:1000000000000,step:1},{id:"rate",label:"Annual interest rate",type:"number",default:8.5,min:0,max:100,step:0.1},{id:"years",label:"Loan term",type:"number",default:20,min:1,max:100,step:0.1}],compute(v){const P=Math.max(v.principal,0),n=Math.max(1,Math.round(v.years*12)),r=Math.max(v.rate,0)/1200,emi=P===0?0:r===0?P/n:P*r*(1+r)**n/((1+r)**n-1),total=emi*n;return[{label:'Monthly home-loan EMI',value:emi,format:'currency',emphasis:'neutral'},{label:'Total repayment',value:total,format:'currency'},{label:'Total interest',value:total-P,format:'currency',emphasis:'negative'}];}},
  {id:"currency-converter",slug:"currency-converter",title:"Currency Converter",category:"banking",short:"Convert an amount using an exchange rate you provide.",desc:"Convert between major currencies with a transparent user-entered exchange rate. It does not claim to provide live FX rates.",article:{formula:"Converted amount = source amount × exchange rate.",exampleInputs:{},faqs:[{q:"Are exchange rates live?",a:"No. The rate is supplied by you so the calculation remains transparent."},{q:"Where should I get the rate?",a:"Use a current rate from your bank, broker or another reputable FX source for material transactions."},{q:"Does this include conversion fees?",a:"No. Provider spreads and fees should be considered separately."}]},fields:[{id:"from",label:"From currency",type:"select",default:"USD",options:[{value:"USD",label:"USD — US Dollar"},{value:"EUR",label:"EUR — Euro"},{value:"GBP",label:"GBP — Pound"},{value:"INR",label:"INR — Indian Rupee"},{value:"JPY",label:"JPY — Yen"},{value:"AUD",label:"AUD — Australian Dollar"},{value:"CAD",label:"CAD — Canadian Dollar"},{value:"CHF",label:"CHF — Swiss Franc"},{value:"CNY",label:"CNY — Yuan"},{value:"AED",label:"AED — Dirham"}]},{id:"to",label:"To currency",type:"select",default:"INR",options:[{value:"USD",label:"USD — US Dollar"},{value:"EUR",label:"EUR — Euro"},{value:"GBP",label:"GBP — Pound"},{value:"INR",label:"INR — Indian Rupee"},{value:"JPY",label:"JPY — Yen"},{value:"AUD",label:"AUD — Australian Dollar"},{value:"CAD",label:"CAD — Canadian Dollar"},{value:"CHF",label:"CHF — Swiss Franc"},{value:"CNY",label:"CNY — Yuan"},{value:"AED",label:"AED — Dirham"}]},{id:"amount",label:"Amount",type:"number",default:100,min:0,max:1000000000000,step:1},{id:"rate",label:"Exchange rate (1 from = target)",type:"number",default:83,min:0,max:1000000,step:0.0001}],compute(v){const amount=Math.max(v.amount,0),rate=Math.max(v.rate,0);return[{label:`${v.from} amount`,value:amount,format:'number'},{label:`Converted amount in ${v.to}`,value:amount*rate,format:'number',emphasis:'neutral'}];}},
  {id:"flat-cost",slug:"flat-cost-calculator",title:"Flat Cost Calculator",category:"loan",short:"Estimate the all-in purchase cost of a flat or apartment.",desc:"Combine property price, registration, stamp duty, furnishing and other one-time costs to estimate the cash required to buy a home.",article:{formula:"All-in purchase cost = property price + stamp duty + registration + furnishing + other one-time costs.",exampleInputs:{},faqs:[{q:"Are stamp-duty rates universal?",a:"No. Rates vary by jurisdiction, property type and transaction details."},{q:"Does this include the home loan?",a:"It estimates purchase costs; financing costs such as loan interest are separate."},{q:"Why include furnishing?",a:"A purchase can require substantial cash after handover, so include realistic setup costs."}]},fields:[{id:"price",label:"Flat / apartment price",type:"number",default:6000000,min:0,max:1000000000000,step:1},{id:"stamp",label:"Stamp duty",type:"number",default:5,min:0,max:100,step:0.1},{id:"registration",label:"Registration / transfer",type:"number",default:1,min:0,max:100,step:0.1},{id:"furnishing",label:"Furnishing and setup",type:"number",default:300000,min:0,max:1000000000000,step:1},{id:"other",label:"Other one-time costs",type:"number",default:100000,min:0,max:1000000000000,step:1}],compute(v){const p=Math.max(v.price,0),stamp=p*Math.max(v.stamp,0)/100,reg=p*Math.max(v.registration,0)/100,f=Math.max(v.furnishing,0),o=Math.max(v.other,0);return[{label:'Stamp duty',value:stamp,format:'currency'},{label:'Registration / transfer',value:reg,format:'currency'},{label:'Other purchase costs',value:f+o,format:'currency'},{label:'Estimated all-in purchase cost',value:p+stamp+reg+f+o,format:'currency',emphasis:'neutral'}];}},
  {id:"loan-emi",slug:"loan-emi-calculator",title:"Loan EMI Calculator",category:"loan",short:"Calculate EMI and total interest for a standard loan.",desc:"A generic EMI calculator for personal, education, consumer or other fixed-rate amortizing loans.",article:{formula:"EMI = [P × r × (1+r)^n] ÷ [(1+r)^n − 1].",exampleInputs:{},faqs:[{q:"What loans can this model?",a:"It models standard fixed-rate amortizing loans; product-specific fees and changing rates are excluded."},{q:"Why compare total interest?",a:"Two loans with similar EMIs can have very different total costs because of rate and term."},{q:"Does this include processing fees?",a:"No. Add one-time fees separately."}]},fields:[{id:"principal",label:"Loan amount",type:"number",default:500000,min:0,max:1000000000000,step:1},{id:"rate",label:"Annual interest rate",type:"number",default:12,min:0,max:100,step:0.1},{id:"years",label:"Repayment term",type:"number",default:5,min:1,max:100,step:0.1}],compute(v){const P=Math.max(v.principal,0),n=Math.max(1,Math.round(v.years*12)),r=Math.max(v.rate,0)/1200,emi=P===0?0:r===0?P/n:P*r*(1+r)**n/((1+r)**n-1),total=emi*n;return[{label:'Monthly EMI',value:emi,format:'currency',emphasis:'neutral'},{label:'Total repayment',value:total,format:'currency'},{label:'Total interest',value:total-P,format:'currency',emphasis:'negative'}];}},
  {id:"capital-gain",slug:"capital-gain-calculator",title:"Capital Gain Calculator",category:"investment",short:"Estimate gain, taxable gain and tax using your assumptions.",desc:"Estimate a simple capital gain from purchase and sale values after eligible expenses, using a tax rate you enter.",article:{formula:"Capital gain = sale proceeds − purchase cost − eligible expenses.",exampleInputs:{},faqs:[{q:"Is this an official tax calculator?",a:"No. Actual treatment depends on asset, holding period, exemptions and local tax rules."},{q:"Can I subtract every expense?",a:"Only costs allowed by the applicable tax rules should be deducted."},{q:"Does it handle indexation?",a:"No. Use current official rules separately if indexation applies."}]},fields:[{id:"purchase",label:"Purchase price / cost basis",type:"number",default:1000000,min:0,max:1000000000000,step:1},{id:"sale",label:"Sale proceeds",type:"number",default:1600000,min:0,max:1000000000000,step:1},{id:"buyCosts",label:"Purchase-related eligible costs",type:"number",default:50000,min:0,max:1000000000000,step:1},{id:"sellCosts",label:"Selling costs",type:"number",default:30000,min:0,max:1000000000000,step:1},{id:"taxRate",label:"Assumed tax rate",type:"number",default:10,min:0,max:100,step:0.1}],compute(v){const gain=Math.max(v.sale-v.purchase-Math.max(v.buyCosts,0)-Math.max(v.sellCosts,0),0),tax=gain*Math.max(v.taxRate,0)/100;return[{label:'Estimated capital gain',value:gain,format:'currency',emphasis:gain>0?'positive':'neutral'},{label:'Assumed tax',value:tax,format:'currency',emphasis:'negative'},{label:'Estimated gain after assumed tax',value:gain-tax,format:'currency',emphasis:'neutral'}];}},
  {id:"lumpsum-sip",slug:"lumpsum-sip-calculator",title:"Lumpsum + SIP Calculator",category:"investment",short:"Combine an initial investment with a monthly SIP.",desc:"Project wealth when you invest a starting lump sum and continue with monthly contributions under the same return assumption.",article:{formula:"Combined future value = lump-sum future value + SIP future value.",exampleInputs:{},faqs:[{q:"Why combine lumpsum and SIP?",a:"Many investors make an initial investment and then add money monthly."},{q:"Does this guarantee the return?",a:"No. The return is an assumption and real returns vary."},{q:"Does it include taxes and fees?",a:"No. Product-specific costs should be considered separately."}]},fields:[{id:"lumpsum",label:"Initial lump sum",type:"number",default:500000,min:0,max:1000000000000,step:1},{id:"monthly",label:"Monthly SIP",type:"number",default:10000,min:0,max:1000000000000,step:1},{id:"rate",label:"Expected annual return",type:"number",default:10,min:0,max:100,step:0.1},{id:"years",label:"Investment period",type:"number",default:10,min:1,max:100,step:0.1}],compute(v){const P=Math.max(v.lumpsum,0),m=Math.max(v.monthly,0),i=Math.max(v.rate,0)/1200,n=Math.max(1,Math.round(v.years*12)),l=P*(1+i)**n,s=i===0?m*n:m*((1+i)**n-1)/i*(1+i),invested=P+m*n,total=l+s;return[{label:'Total invested',value:invested,format:'currency'},{label:'Estimated growth',value:total-invested,format:'currency',emphasis:'positive'},{label:'Projected value',value:total,format:'currency',emphasis:'neutral'}];}},
  {id:"loan-against-property",slug:"loan-against-property-calculator",title:"Loan Against Property Calculator",category:"loan",short:"Estimate borrowing capacity against a property.",desc:"Estimate an indicative loan amount from property value and LTV, then calculate EMI and interest.",article:{formula:"Indicative loan amount = property value × LTV.",exampleInputs:{},faqs:[{q:"What is LTV?",a:"Loan-to-value is the loan amount as a percentage of property value."},{q:"Is maximum loan guaranteed?",a:"No. Income, credit profile, valuation and lender policy also matter."},{q:"What is missing?",a:"Fees, insurance, legal and valuation charges are excluded."}]},fields:[{id:"property",label:"Property value",type:"number",default:8000000,min:0,max:1000000000000,step:1},{id:"ltv",label:"Loan-to-value",type:"number",default:60,min:1,max:100,step:0.1},{id:"rate",label:"Annual interest rate",type:"number",default:10,min:0,max:100,step:0.1},{id:"years",label:"Loan term",type:"number",default:15,min:1,max:100,step:0.1}],compute(v){const loan=Math.max(v.property,0)*Math.max(v.ltv,0)/100,n=Math.max(1,Math.round(v.years*12)),r=Math.max(v.rate,0)/1200,emi=r===0?loan/n:loan*r*(1+r)**n/((1+r)**n-1),total=emi*n;return[{label:'Indicative loan amount',value:loan,format:'currency'},{label:'Monthly EMI',value:emi,format:'currency',emphasis:'neutral'},{label:'Total interest',value:total-loan,format:'currency',emphasis:'negative'}];}},
  {id:"home-loan-eligibility",slug:"home-loan-eligibility-calculator",title:"Home Loan Eligibility Calculator",category:"loan",short:"Estimate a home-loan amount from income and EMI capacity.",desc:"Use an assumed FOIR, existing EMIs, rate and tenure to estimate indicative eligibility.",article:{formula:"Eligible EMI = monthly income × FOIR − existing EMIs.",exampleInputs:{},faqs:[{q:"What is FOIR?",a:"It is a lender-style affordability ratio; actual thresholds differ by lender."},{q:"Is this an approval?",a:"No. Credit, age, employment, property valuation and lender policy can change eligibility."},{q:"Why subtract existing EMIs?",a:"Existing obligations reduce monthly capacity for a new loan."}]},fields:[{id:"income",label:"Monthly income",type:"number",default:150000,min:0,max:1000000000000,step:1},{id:"foir",label:"Assumed FOIR",type:"number",default:50,min:10,max:100,step:0.1},{id:"existing",label:"Existing monthly EMIs",type:"number",default:15000,min:0,max:1000000000000,step:1},{id:"rate",label:"Annual interest rate",type:"number",default:8.5,min:0,max:100,step:0.1},{id:"years",label:"Loan term",type:"number",default:20,min:1,max:100,step:0.1}],compute(v){const capacity=Math.max(v.income,0)*Math.max(v.foir,0)/100-Math.max(v.existing,0),n=Math.max(1,Math.round(v.years*12)),r=Math.max(v.rate,0)/1200,loan=capacity<=0?0:r===0?capacity*n:capacity*((1+r)**n-1)/(r*(1+r)**n);return[{label:'Indicative EMI capacity',value:Math.max(capacity,0),format:'currency'},{label:'Indicative eligible loan',value:Math.max(loan,0),format:'currency',emphasis:'neutral'}];}},
  {id:"silver-jewelry",slug:"silver-jewelry-calculator",title:"Silver Jewelry Calculator",category:"banking",short:"Estimate silver jewellery value with purity and making charges.",desc:"Estimate silver value and add making charges and GST using your own current silver rate.",article:{formula:"Silver value = rate per gram × weight × purity.",exampleInputs:{},faqs:[{q:"Does this use a live silver price?",a:"No. Enter a current rate from a reputable source or jeweller."},{q:"Why does purity matter?",a:"Lower purity means less fine silver for the same gross weight."},{q:"Is the shop price exact?",a:"Not necessarily; labour, wastage, margins and taxes can change it."}]},fields:[{id:"rate",label:"Silver rate per gram",type:"number",default:100,min:0,max:1000000000,step:0.01},{id:"weight",label:"Jewellery weight",type:"number",default:50,min:0,max:1000000,step:0.01},{id:"purity",label:"Purity",type:"number",default:92.5,min:1,max:100,step:0.1},{id:"making",label:"Making charge",type:"number",default:10,min:0,max:100,step:0.1},{id:"tax",label:"Tax / GST",type:"number",default:3,min:0,max:100,step:0.1}],compute(v){const metal=Math.max(v.rate,0)*Math.max(v.weight,0)*Math.max(v.purity,0)/100,making=metal*Math.max(v.making,0)/100,tax=(metal+making)*Math.max(v.tax,0)/100;return[{label:'Fine-silver value',value:metal,format:'currency'},{label:'Making charge',value:making,format:'currency'},{label:'Tax / GST',value:tax,format:'currency'},{label:'Estimated jewellery price',value:metal+making+tax,format:'currency',emphasis:'neutral'}];}},
  {id:"advanced-home-loan-eligibility",slug:"advanced-home-loan-eligibility-calculator",title:"Advanced Home Loan Eligibility Calculator",category:"loan",short:"Model eligibility with co-applicant income and obligations.",desc:"Use primary income, co-applicant income, existing obligations, FOIR, rate and tenure for a more detailed estimate.",article:{formula:"Eligible EMI = combined monthly income × FOIR − existing obligations.",exampleInputs:{},faqs:[{q:"Why add co-applicant income?",a:"Some lenders consider eligible co-applicant income, but policies differ."},{q:"Can I include bonuses?",a:"Use only income that is realistically documentable and lender-eligible."},{q:"Does higher FOIR always mean more eligibility?",a:"Mathematically yes, but lender risk limits are separate."}]},fields:[{id:"income",label:"Primary monthly income",type:"number",default:150000,min:0,max:1000000000000,step:1},{id:"coIncome",label:"Co-applicant monthly income",type:"number",default:75000,min:0,max:1000000000000,step:1},{id:"foir",label:"Assumed FOIR",type:"number",default:50,min:10,max:100,step:0.1},{id:"existing",label:"Existing monthly obligations",type:"number",default:20000,min:0,max:1000000000000,step:1},{id:"rate",label:"Annual interest rate",type:"number",default:8.5,min:0,max:100,step:0.1},{id:"years",label:"Loan term",type:"number",default:20,min:1,max:100,step:0.1}],compute(v){const income=Math.max(v.income,0)+Math.max(v.coIncome,0),capacity=Math.max(income*Math.max(v.foir,0)/100-Math.max(v.existing,0),0),n=Math.max(1,Math.round(v.years*12)),r=Math.max(v.rate,0)/1200,loan=r===0?capacity*n:capacity*((1+r)**n-1)/(r*(1+r)**n);return[{label:'Combined monthly income',value:income,format:'currency'},{label:'Indicative EMI capacity',value:capacity,format:'currency'},{label:'Indicative eligible loan',value:loan,format:'currency',emphasis:'neutral'}];}},
  {id:"consumer-durable-loan",slug:"consumer-durable-loan-calculator",title:"Consumer Durable Loan Calculator",category:"loan",short:"Estimate EMI for a phone, appliance or other financed purchase.",desc:"Calculate financed amount, monthly EMI, interest and total cost for consumer-durable financing.",article:{formula:"Financed amount = purchase price − down payment.",exampleInputs:{},faqs:[{q:"Is zero-interest financing really free?",a:"Not necessarily; fees, bundled products or lost discounts can change the effective cost."},{q:"Why include processing fee?",a:"Short loans can have a meaningful all-in cost from one-time fees."},{q:"Does this include late charges?",a:"No."}]},fields:[{id:"price",label:"Purchase price",type:"number",default:60000,min:0,max:1000000000000,step:1},{id:"down",label:"Down payment",type:"number",default:10000,min:0,max:1000000000000,step:1},{id:"rate",label:"Annual interest rate",type:"number",default:12,min:0,max:100,step:0.1},{id:"years",label:"Loan term",type:"number",default:2,min:0.0833333333,max:100,step:0.1},{id:"fee",label:"Processing fee",type:"number",default:2,min:0,max:100,step:0.1}],compute(v){const price=Math.max(v.price,0),down=Math.min(Math.max(v.down,0),price),P=price-down,n=Math.max(1,Math.round(v.years*12)),r=Math.max(v.rate,0)/1200,emi=P===0?0:r===0?P/n:P*r*(1+r)**n/((1+r)**n-1),fee=P*Math.max(v.fee,0)/100,total=emi*n;return[{label:'Financed amount',value:P,format:'currency'},{label:'Monthly EMI',value:emi,format:'currency',emphasis:'neutral'},{label:'Total interest',value:total-P,format:'currency',emphasis:'negative'},{label:'Estimated all-in cost',value:total+down+fee,format:'currency'}];}},
  {id:"gold-jewelry",slug:"gold-jewelry-calculator",title:"Gold Jewelry Calculator",category:"banking",short:"Estimate gold jewellery price from rate, weight, purity and charges.",desc:"Estimate fine-gold value, making charges, wastage and GST using a current gold rate you enter.",article:{formula:"Fine-gold value = rate per gram × weight × purity.",exampleInputs:{},faqs:[{q:"Is the gold rate live?",a:"No. Enter the current rate quoted for the relevant purity."},{q:"What is wastage?",a:"A seller may apply a percentage for manufacturing loss or pricing policy; treatment varies."},{q:"Why can jewellers quote differently?",a:"Making, wastage, taxes, stones, discounts and margins can differ."}]},fields:[{id:"rate",label:"Gold rate per gram",type:"number",default:7500,min:0,max:1000000000,step:0.01},{id:"weight",label:"Jewellery weight",type:"number",default:10,min:0,max:1000000,step:0.01},{id:"purity",label:"Purity",type:"number",default:91.6,min:1,max:100,step:0.1},{id:"wastage",label:"Wastage",type:"number",default:5,min:0,max:100,step:0.1},{id:"making",label:"Making charge",type:"number",default:10,min:0,max:100,step:0.1},{id:"tax",label:"Tax / GST",type:"number",default:3,min:0,max:100,step:0.1}],compute(v){const metal=Math.max(v.rate,0)*Math.max(v.weight,0)*Math.max(v.purity,0)/100,waste=metal*Math.max(v.wastage,0)/100,making=(metal+waste)*Math.max(v.making,0)/100,tax=(metal+waste+making)*Math.max(v.tax,0)/100;return[{label:'Fine-gold value',value:metal,format:'currency'},{label:'Wastage value',value:waste,format:'currency'},{label:'Making charge',value:making,format:'currency'},{label:'Tax / GST',value:tax,format:'currency'},{label:'Estimated jewellery price',value:metal+waste+making+tax,format:'currency',emphasis:'neutral'}];}},
  {id:"loan-prepayment-vs-sip",slug:"loan-prepayment-vs-sip-calculator",title:"Loan Prepayment vs SIP Calculator",category:"investment",short:"Compare loan-interest savings with investing the same extra cash.",desc:"Compare a loan prepayment with investing the same cash for the remaining loan period under an assumed return.",article:{formula:"Compare the interest avoided by reducing principal with the future value of the alternative investment.",exampleInputs:{},faqs:[{q:"Is prepaying a guaranteed return?",a:"Interest avoided is more predictable than an investment return, but lender terms matter."},{q:"Does this prove SIP is better?",a:"No. The result is sensitive to the assumed investment return, taxes and fees."},{q:"Should I keep an emergency fund first?",a:"Do not use cash for prepayment if it leaves essential liquidity uncovered."}]},fields:[{id:"balance",label:"Outstanding loan balance",type:"number",default:3000000,min:0,max:1000000000000,step:1},{id:"rate",label:"Loan interest rate",type:"number",default:9,min:0,max:100,step:0.1},{id:"years",label:"Remaining term",type:"number",default:10,min:1,max:100,step:0.1},{id:"prepay",label:"Amount available now",type:"number",default:500000,min:0,max:1000000000000,step:1},{id:"investmentReturn",label:"Assumed investment return",type:"number",default:10,min:0,max:100,step:0.1}],compute(v){const P=Math.max(v.balance,0),x=Math.min(Math.max(v.prepay,0),P),n=Math.max(1,Math.round(v.years*12)),r=Math.max(v.rate,0)/1200,emi=r===0?P/n:P*r*(1+r)**n/((1+r)**n-1),base=emi*n-P,newP=P-x,newEmi=r===0?newP/n:newP*r*(1+r)**n/((1+r)**n-1),saved=Math.max(base-(newEmi*n-newP),0),ri=Math.max(v.investmentReturn,0)/1200,invested=ri===0?x:x*(1+ri)**n;return[{label:'Estimated loan interest saved',value:saved,format:'currency',emphasis:'positive'},{label:'Investment value of the same cash',value:invested,format:'currency',emphasis:'neutral'},{label:'Loan EMI after prepayment',value:newEmi,format:'currency'},{label:'Difference (investment value − interest saved)',value:invested-saved,format:'currency',emphasis:invested>=saved?'positive':'negative'}];}},
  {id:"ltv",slug:"loan-to-value-ltv-calculator",title:"Loan-to-Value (LTV) Calculator",category:"loan",short:"Calculate LTV and the loan supported by a property value.",desc:"Calculate loan-to-value from property value and loan amount.",article:{formula:"LTV = loan amount ÷ property value × 100.",exampleInputs:{},faqs:[{q:"Why does LTV matter?",a:"It is one measure of collateral risk and can affect lending terms."},{q:"Does higher LTV mean higher EMI?",a:"For the same rate and term, borrowing more produces a higher EMI."},{q:"Does property value always equal purchase price?",a:"A lender may use its own valuation or permitted value."}]},fields:[{id:"property",label:"Property value",type:"number",default:8000000,min:0.01,max:1000000000000,step:1},{id:"loan",label:"Loan amount",type:"number",default:4800000,min:0,max:1000000000000,step:1}],compute(v){const p=Math.max(v.property,0),l=Math.max(v.loan,0),ltv=p>0?l/p*100:0;return[{label:'LTV',value:ltv,format:'percent',emphasis:'neutral'},{label:'Equity / value not financed',value:Math.max(p-l,0),format:'currency'},{label:'Loan amount',value:l,format:'currency'}];}},
  {id:"stamp-duty",slug:"stamp-duty-calculator",title:"Stamp Duty Calculator",category:"loan",short:"Estimate stamp duty and registration costs on a property purchase.",desc:"Apply your local stamp-duty and registration assumptions to an entered property value.",article:{formula:"Stamp duty = property value × stamp-duty rate; registration = property value × registration rate.",exampleInputs:{},faqs:[{q:"Are stamp-duty rates universal?",a:"No. Verify the current official rate for your location and transaction."},{q:"Is registration always a percentage?",a:"Not everywhere; some jurisdictions use slabs or fixed charges."},{q:"Does this include brokerage?",a:"No. Add brokerage, legal and inspection costs separately."}]},fields:[{id:"value",label:"Property value",type:"number",default:6000000,min:0,max:1000000000000,step:1},{id:"stamp",label:"Stamp duty rate",type:"number",default:5,min:0,max:100,step:0.1},{id:"registration",label:"Registration rate",type:"number",default:1,min:0,max:100,step:0.1}],compute(v){const p=Math.max(v.value,0),stamp=p*Math.max(v.stamp,0)/100,reg=p*Math.max(v.registration,0)/100;return[{label:'Stamp duty',value:stamp,format:'currency'},{label:'Registration / transfer',value:reg,format:'currency'},{label:'Estimated total charges',value:stamp+reg,format:'currency',emphasis:'negative'}];}},
  {id:"property-calculator",slug:"property-calculator",title:"Property Calculator",category:"loan",short:"Estimate upfront cash, EMI and total home-buying cost.",desc:"Combine price, down payment, loan rate, term and transaction costs to understand the full cost of a property purchase.",article:{formula:"Upfront cash = down payment + stamp duty + registration + other upfront costs.",exampleInputs:{},faqs:[{q:"Why is EMI not the full cost?",a:"A purchase also needs a down payment, transaction charges and potentially maintenance, insurance and taxes."},{q:"Does this include appreciation?",a:"No. Property appreciation is uncertain."},{q:"Can I compare renting with this?",a:"Yes, but a fair comparison also needs rent growth, investment returns, maintenance, taxes and opportunity cost."}]},fields:[{id:"price",label:"Property price",type:"number",default:6000000,min:0,max:1000000000000,step:1},{id:"down",label:"Down payment",type:"number",default:1200000,min:0,max:1000000000000,step:1},{id:"stamp",label:"Stamp duty",type:"number",default:5,min:0,max:100,step:0.1},{id:"registration",label:"Registration",type:"number",default:1,min:0,max:100,step:0.1},{id:"rate",label:"Loan interest rate",type:"number",default:8.5,min:0,max:100,step:0.1},{id:"years",label:"Loan term",type:"number",default:20,min:1,max:100,step:0.1},{id:"other",label:"Other upfront costs",type:"number",default:100000,min:0,max:1000000000000,step:1}],compute(v){const price=Math.max(v.price,0),down=Math.min(Math.max(v.down,0),price),P=price-down,n=Math.max(1,Math.round(v.years*12)),r=Math.max(v.rate,0)/1200,emi=P===0?0:r===0?P/n:P*r*(1+r)**n/((1+r)**n-1),repay=emi*n,stamp=price*Math.max(v.stamp,0)/100,reg=price*Math.max(v.registration,0)/100,upfront=down+stamp+reg+Math.max(v.other,0);return[{label:'Loan amount',value:P,format:'currency'},{label:'Monthly EMI',value:emi,format:'currency',emphasis:'neutral'},{label:'Cash needed upfront',value:upfront,format:'currency'},{label:'Total loan interest',value:repay-P,format:'currency',emphasis:'negative'},{label:'Estimated total cash cost',value:upfront+repay,format:'currency'}];}},
  {id:"loan-interest",slug:"loan-interest-calculator",title:"Loan Interest Calculator",category:"loan",short:"Calculate interest and total repayment on an amortizing loan.",desc:"See how much of a standard fixed-rate loan's total repayment is interest rather than principal.",article:{formula:"Total interest = scheduled repayments − original principal.",exampleInputs:{},faqs:[{q:"Why can total interest be so high?",a:"Long terms create many interest-bearing months, especially at higher rates."},{q:"Does this match every lender?",a:"It assumes standard monthly amortization with a constant rate."},{q:"How can I reduce interest?",a:"A lower rate, shorter term or extra principal payments can reduce it, subject to lender rules."}]},fields:[{id:"principal",label:"Loan principal",type:"number",default:1000000,min:0,max:1000000000000,step:1},{id:"rate",label:"Annual interest rate",type:"number",default:10,min:0,max:100,step:0.1},{id:"years",label:"Loan term",type:"number",default:10,min:1,max:100,step:0.1}],compute(v){const P=Math.max(v.principal,0),n=Math.max(1,Math.round(v.years*12)),r=Math.max(v.rate,0)/1200,emi=P===0?0:r===0?P/n:P*r*(1+r)**n/((1+r)**n-1),total=emi*n;return[{label:'Monthly EMI',value:emi,format:'currency'},{label:'Principal repaid',value:P,format:'currency'},{label:'Total interest',value:total-P,format:'currency',emphasis:'negative'},{label:'Total repayment',value:total,format:'currency',emphasis:'neutral'}];}}
  ,
  {
    id: "ppf-growth",
    slug: "ppf-calculator",
    title: "PPF Calculator",
    category: "banking",
    short: "Estimate Public Provident Fund growth from annual contributions.",
    desc: "Project a PPF balance from an annual contribution, an assumed interest rate and a chosen period.",
    article: {
      formula: "This estimate adds the annual contribution at the start of each year and then applies the assumed annual rate: balance = (previous balance + annual contribution) × (1 + rate). Actual PPF rules, contribution limits and notified rates can change.",
      exampleInputs: { yearlyContribution: 150000, rate: 7.1, years: 15, initialBalance: 0 },
      faqs: [
        { q: "Is the interest rate guaranteed for the full period?", a: "No. PPF rates are notified periodically and can change. Treat the rate entered here as an assumption and check current official rules." },
        { q: "Does this calculate tax benefits?", a: "No. This tool estimates account growth only; it does not determine eligibility for deductions or tax treatment." }
      ]
    },
    fields: [
      { id: "yearlyContribution", label: "Annual contribution", type: "number", default: 150000, min: 0, max: 100000000, step: 1000 },
      { id: "rate", label: "Assumed annual interest rate", type: "number", default: 7.1, min: 0, max: 30, step: 0.05, suffix: "%" },
      { id: "years", label: "Investment period", type: "number", default: 15, min: 1, max: 50, step: 1, suffix: "yrs" },
      { id: "initialBalance", label: "Existing balance", type: "number", default: 0, min: 0, max: 1000000000, step: 1000 }
    ],
    compute(v) {
      let balance = v.initialBalance, contributed = v.initialBalance;
      for (let year = 0; year < v.years; year++) {
        balance = (balance + v.yearlyContribution) * (1 + v.rate / 100);
        contributed += v.yearlyContribution;
      }
      return [
        { label: "Projected balance", value: balance, format: "currency", emphasis: "positive" },
        { label: "Total contributions incl. opening balance", value: contributed, format: "currency" },
        { label: "Estimated growth", value: balance - contributed, format: "currency", emphasis: "neutral" }
      ];
    }
  },
  {
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
  },
  {
    id: "gst",
    slug: "gst-calculator",
    title: "GST Calculator",
    category: "business",
    short: "Calculate GST and the invoice total from a pre-tax amount.",
    desc: "Add a GST rate to a taxable amount to estimate the tax component and total invoice value.",
    article: {
      formula: "GST amount = taxable amount × GST rate ÷ 100. Total invoice value = taxable amount + GST amount. This calculator adds tax to a pre-tax amount; it does not extract GST from a tax-inclusive price or decide which rate legally applies.",
      exampleInputs: { amount: 100000, rate: 18 },
      faqs: [
        { q: "Which GST rate should I use?", a: "Enter the rate that applies to your specific goods or services. Rates and classifications depend on the transaction and current rules." },
        { q: "Does this split CGST and SGST?", a: "No. It calculates the combined GST amount. Whether CGST/SGST or IGST applies depends on the transaction." }
      ]
    },
    fields: [
      { id: "amount", label: "Taxable amount (before GST)", type: "number", default: 100000, min: 0, max: 100000000000, step: 100 },
      { id: "rate", label: "GST rate", type: "number", default: 18, min: 0, max: 100, step: 0.1, suffix: "%" }
    ],
    compute(v) {
      const tax = v.amount * v.rate / 100;
      return [
        { label: "GST amount", value: tax, format: "currency", emphasis: "neutral" },
        { label: "Total including GST", value: v.amount + tax, format: "currency", emphasis: "positive" },
        { label: "Pre-tax amount", value: v.amount, format: "currency" }
      ];
    }
  },
  {
    id: "emergency-fund",
    slug: "emergency-fund-calculator",
    title: "Emergency Fund Calculator",
    category: "retirement",
    short: "Set an emergency savings target based on monthly expenses.",
    desc: "Estimate a cash reserve target, your current shortfall and how long it may take to reach the goal.",
    article: {
      formula: "Target emergency fund = essential monthly expenses × target months. Savings gap = max(0, target fund − current savings). Estimated months to goal = savings gap ÷ monthly contribution, assuming the contribution remains constant and no money is withdrawn.",
      exampleInputs: { expenses: 40000, targetMonths: 6, currentSavings: 100000, monthlySaving: 10000 },
      faqs: [
        { q: "How many months of expenses should I save?", a: "The right buffer depends on income stability, dependants, insurance, debt and likely unexpected costs. Six months is a common planning starting point, not a universal rule." },
        { q: "Does the estimate include interest or inflation?", a: "No. It assumes a fixed monthly savings contribution and does not add interest, taxes or changes in expenses." }
      ]
    },
    fields: [
      { id: "expenses", label: "Essential monthly expenses", type: "number", default: 40000, min: 0, max: 100000000, step: 500 },
      { id: "targetMonths", label: "Months of expenses to cover", type: "number", default: 6, min: 1, max: 36, step: 1, suffix: "months" },
      { id: "currentSavings", label: "Existing emergency savings", type: "number", default: 100000, min: 0, max: 1000000000, step: 1000 },
      { id: "monthlySaving", label: "Monthly amount you can add", type: "number", default: 10000, min: 0, max: 100000000, step: 500 }
    ],
    compute(v) {
      const target = v.expenses * v.targetMonths;
      const gap = Math.max(0, target - v.currentSavings);
      const months = gap === 0 ? 0 : v.monthlySaving > 0 ? Math.ceil(gap / v.monthlySaving) : 0;
      return [
        { label: "Emergency fund target", value: target, format: "currency", emphasis: "neutral" },
        { label: "Additional savings needed", value: gap, format: "currency", emphasis: gap > 0 ? "negative" : "positive" },
        { label: "Months to target (0 = already funded or no monthly saving)", value: months, format: "number" }
      ];
    }
  },
  {
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
  },
  {
    id: "step-up-sip",
    slug: "step-up-sip-calculator",
    title: "Step-Up SIP Calculator",
    category: "investment",
    short: "Project monthly investments that rise each year.",
    desc: "Estimate how an annual increase in monthly SIP contributions may change the projected corpus.",
    article: {
      formula: "The monthly contribution increases by the step-up percentage at the start of each investment year. Each contribution is added at the start of a month and the balance grows at the monthly equivalent of the assumed annual return. Actual investment returns vary and are not guaranteed.",
      exampleInputs: { monthly: 5000, stepUp: 10, rate: 12, years: 15 },
      faqs: [
        { q: "What is a step-up SIP?", a: "It is a recurring investment plan where the monthly contribution increases periodically, often once a year, as income or savings capacity grows." },
        { q: "Are the projected returns guaranteed?", a: "No. The return rate is an assumption. Market-linked investments can lose value and actual returns vary over time." }
      ]
    },
    fields: [
      { id: "monthly", label: "Starting monthly investment", type: "number", default: 5000, min: 0, max: 100000000, step: 100 },
      { id: "stepUp", label: "Annual SIP increase", type: "number", default: 10, min: 0, max: 100, step: 0.5, suffix: "%" },
      { id: "rate", label: "Assumed annual return", type: "number", default: 12, min: 0, max: 100, step: 0.1, suffix: "%" },
      { id: "years", label: "Investment period", type: "number", default: 15, min: 1, max: 60, step: 1, suffix: "yrs" }
    ],
    compute(v) {
      let balance = 0, invested = 0;
      const monthlyRate = v.rate / 1200;
      for (let year = 0; year < v.years; year++) {
        const contribution = v.monthly * Math.pow(1 + v.stepUp / 100, year);
        for (let month = 0; month < 12; month++) {
          balance = (balance + contribution) * (1 + monthlyRate);
          invested += contribution;
        }
      }
      return [
        { label: "Projected investment value", value: balance, format: "currency", emphasis: "positive" },
        { label: "Total contributions", value: invested, format: "currency" },
        { label: "Estimated growth", value: balance - invested, format: "currency", emphasis: "neutral" }
      ];
    }
  },
  {
    id: "sip-goal",
    slug: "sip-goal-calculator",
    title: "SIP Goal Calculator",
    category: "investment",
    short: "Estimate the monthly SIP needed to reach a target corpus.",
    desc: "Work backward from a target amount, current savings, expected return and time horizon.",
    article: {
      formula: "First grow the current corpus at the assumed monthly rate. The remaining target is divided by the future-value factor for equal monthly contributions. This model assumes contributions at the start of each month and a constant return, which real investments will not deliver exactly.",
      exampleInputs: { target: 5000000, current: 500000, rate: 10, years: 15 },
      faqs: [
        { q: "Does this guarantee I will reach the target?", a: "No. The required SIP is a mathematical estimate based on a constant assumed return. Actual returns vary and the target may not be reached." },
        { q: "What if my current savings already grow beyond the target?", a: "The calculator returns zero as the required monthly SIP if the assumed growth of your current corpus already meets or exceeds the target." }
      ]
    },
    fields: [
      { id: "target", label: "Target corpus", type: "number", default: 5000000, min: 0, max: 100000000000, step: 10000 },
      { id: "current", label: "Current investment corpus", type: "number", default: 500000, min: 0, max: 10000000000, step: 10000 },
      { id: "rate", label: "Assumed annual return", type: "number", default: 10, min: 0, max: 100, step: 0.1, suffix: "%" },
      { id: "years", label: "Time to goal", type: "number", default: 15, min: 1, max: 80, step: 1, suffix: "yrs" }
    ],
    compute(v) {
      const n = v.years * 12, monthlyRate = v.rate / 1200;
      const futureCurrent = v.current * Math.pow(1 + monthlyRate, n);
      const gap = Math.max(0, v.target - futureCurrent);
      const factor = monthlyRate === 0 ? n : ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate);
      const required = gap === 0 ? 0 : factor > 0 ? gap / factor : 0;
      return [
        { label: "Required monthly SIP", value: required, format: "currency", emphasis: "positive" },
        { label: "Future value of current corpus", value: futureCurrent, format: "currency" },
        { label: "Target gap after current corpus growth", value: gap, format: "currency", emphasis: "neutral" }
      ];
    }
  },
  {
    id: "gratuity",
    slug: "gratuity-calculator",
    title: "Gratuity Calculator",
    category: "salary",
    short: "Estimate gratuity using salary and completed service years.",
    desc: "Estimate a gratuity amount using the common 15/26 salary formula, subject to eligibility and applicable rules.",
    article: {
      formula: "For an employee covered by the Payment of Gratuity Act, the common estimate is last-drawn monthly basic salary plus dearness allowance × 15 ÷ 26 × completed years of service. Eligibility and exceptions depend on the applicable law and employment circumstances.",
      exampleInputs: { salary: 50000, years: 10 },
      faqs: [
        { q: "Is five years of service always required?", a: "Five years of continuous service is the general rule for many cases under the Act, but exceptions and legal interpretation can apply, including certain death or disablement cases." },
        { q: "Does this include every component of salary?", a: "No. The common formula uses last-drawn basic salary plus dearness allowance, not necessarily total CTC or every allowance." }
      ]
    },
    fields: [
      { id: "salary", label: "Last-drawn monthly basic + DA", type: "number", default: 50000, min: 0, max: 100000000, step: 500 },
      { id: "years", label: "Completed years of service", type: "number", default: 10, min: 0, max: 60, step: 1, suffix: "yrs" }
    ],
    compute(v) {
      const eligible = v.years >= 5;
      const gratuity = eligible ? v.salary * 15 / 26 * Math.floor(v.years) : 0;
      return [
        { label: "Estimated gratuity (0 if threshold not met)", value: gratuity, format: "currency", emphasis: "positive" },
        { label: "General 5-year threshold met (1 = yes)", value: eligible ? 1 : 0, format: "number" }
      ];
    }
  },
  {
    id: "hra-exemption",
    slug: "hra-exemption-calculator",
    title: "HRA Exemption Calculator",
    category: "salary",
    short: "Estimate HRA exemption from salary, rent and city percentage.",
    desc: "Estimate the HRA exemption under the common salary-based method using editable salary, rent and city assumptions.",
    article: {
      formula: "The estimated exemption is the lowest of actual HRA received, rent paid minus 10% of basic salary plus DA, and the basic salary plus DA multiplied by the city percentage you enter (commonly 50% for specified metro cities and 40% elsewhere). Negative values are treated as zero. Tax rules and eligibility can vary.",
      exampleInputs: { basicDA: 50000, hra: 20000, rent: 25000, cityPct: 50 },
      faqs: [
        { q: "Which city percentage should I enter?", a: "The common calculation uses 50% for specified metro cities and 40% for other locations. Check the current tax rules for your circumstances." },
        { q: "Does this decide my final tax liability?", a: "No. It estimates one HRA exemption component and does not calculate your complete tax liability or confirm eligibility for a tax regime." }
      ]
    },
    fields: [
      { id: "basicDA", label: "Monthly basic salary + DA", type: "number", default: 50000, min: 0, max: 100000000, step: 500 },
      { id: "hra", label: "Monthly HRA received", type: "number", default: 20000, min: 0, max: 100000000, step: 500 },
      { id: "rent", label: "Monthly rent paid", type: "number", default: 25000, min: 0, max: 100000000, step: 500 },
      { id: "cityPct", label: "City percentage (50 or 40)", type: "number", default: 50, min: 0, max: 100, step: 10, suffix: "%" }
    ],
    compute(v) {
      const exemption = Math.max(0, Math.min(v.hra, v.rent - 0.1 * v.basicDA, v.basicDA * v.cityPct / 100));
      return [
        { label: "Estimated HRA exemption per month", value: exemption, format: "currency", emphasis: "positive" },
        { label: "Estimated taxable HRA per month", value: Math.max(0, v.hra - exemption), format: "currency", emphasis: "neutral" },
        { label: "Annual estimated exemption", value: exemption * 12, format: "currency" }
      ];
    }
  },

  {
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
  { code: "AED", symbol: "د.إ" }
];

/* Node-only export, used by the build script that generates static pages.
   Browsers ignore this block (typeof module is undefined there). */
if (typeof module !== "undefined") {
  module.exports = { CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS, CALCULATORS, CURRENCIES };
}
