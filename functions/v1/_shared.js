export const API_VERSION = "1.2.0";
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin"
};
export const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", "X-Content-Type-Options": "nosniff", ...CORS_HEADERS, ...extra }
});
export const error = (code, message, status = 400, details = undefined) => json({ error: { code, message, ...(details ? { details } : {}) } }, status, { "Cache-Control": "no-store" });
export const MODEL_LIST = [
  { id: "sip", version: API_VERSION, title: "SIP future value", inputs: ["monthly", "annualRate", "years"], assumptions: "Monthly contributions at the beginning of each month; annual nominal rate divided by 12." },
  { id: "loan-emi", version: API_VERSION, title: "Loan EMI", inputs: ["principal", "annualRate", "months"], assumptions: "Fixed monthly payment; constant annual rate divided by 12; excludes fees and insurance." },
  { id: "home-loan-emi", version: API_VERSION, title: "Home loan EMI", inputs: ["principal", "annualRate", "months"], assumptions: "Same amortization formula as loan EMI; excludes fees and insurance." },
  { id: "compound-interest", version: API_VERSION, title: "Compound interest", inputs: ["principal", "annualRate", "years", "compoundingPerYear"], assumptions: "Fixed nominal annual rate compounded at the selected frequency." },
  { id: "fixed-deposit", version: API_VERSION, title: "Fixed deposit maturity", inputs: ["principal", "annualRate", "years", "compoundingPerYear"], assumptions: "Fixed rate and periodic compounding; bank-specific tax and terms excluded." },
  { id: "lumpsum", version: API_VERSION, title: "Lump-sum growth", inputs: ["principal", "annualRate", "years", "compoundingPerYear"], assumptions: "Fixed nominal annual rate compounded at the selected frequency." },
  { id: "gst", version: API_VERSION, title: "GST estimate", inputs: ["amount", "rate", "mode"], assumptions: "Single user-supplied GST rate; no exemptions, cess or jurisdictional edge cases." },
  { id: "cagr", version: API_VERSION, title: "CAGR", inputs: ["startValue", "endValue", "years"], assumptions: "Positive starting and ending values over a positive duration." },
  { id: "inflation", version: API_VERSION, title: "Inflation projection", inputs: ["currentCost", "annualInflationRate", "years"], assumptions: "Constant annual inflation compounded yearly." },
  { id: "simple-interest", version: API_VERSION, title: "Simple interest", inputs: ["principal", "annualRate", "years"], assumptions: "Simple, non-compounding interest." },
  { id: "currency-converter", version: API_VERSION, title: "Currency conversion", inputs: ["amount", "rate", "from", "to"], assumptions: "Uses the exchange rate supplied in the request; live rates are available separately at /v1/fx." },
  { id: "roi", version: API_VERSION, title: "Return on investment", inputs: ["cost", "finalValue", "years"], assumptions: "Simple endpoint return; excludes interim cash flows, taxes, fees and timing effects." },
  { id: "recurring-deposit", version: API_VERSION, title: "Recurring deposit maturity", inputs: ["monthly", "annualRate", "years"], assumptions: "Equal deposits at the end of each month; monthly compounding; constant assumed rate." },
  { id: "net-worth", version: API_VERSION, title: "Net worth", inputs: ["cash", "investments", "property", "debt"], assumptions: "User-entered asset values less user-entered debt; excludes unlisted assets and liabilities." },
  { id: "profit-margin", version: API_VERSION, title: "Profit margin", inputs: ["revenue", "cost"], assumptions: "Single-period revenue less cost; excludes tax and non-operating items." },
  { id: "sip-goal", version: API_VERSION, title: "SIP goal planner", inputs: ["target", "current", "annualRate", "years"], assumptions: "Current corpus grows monthly; required contributions occur at the beginning of each month at a constant assumed rate." },
  { id: "car-loan", version: API_VERSION, title: "Car loan EMI", inputs: ["price", "down", "annualRate", "years"], assumptions: "Loan principal is vehicle price less down payment; fixed monthly amortization; excludes fees and insurance." },
  { id: "mortgage", version: API_VERSION, title: "Mortgage payment", inputs: ["principal", "annualRate", "years"], assumptions: "Fixed monthly amortization at a constant rate; excludes property tax, insurance, fees and variable-rate changes." },
  { id: "personal-loan", version: API_VERSION, title: "Personal loan EMI", inputs: ["principal", "annualRate", "years"], assumptions: "Fixed monthly amortization at a constant rate; excludes fees and insurance." },
  { id: "debt-payoff", version: API_VERSION, title: "Fixed-payment debt payoff", inputs: ["balance", "payment", "annualRate"], assumptions: "Payment is applied monthly after interest; payment must exceed monthly interest; final payment may be smaller." },
  { id: "salary-hourly", version: API_VERSION, title: "Salary to hourly pay", inputs: ["amount", "hoursPerWeek", "weeksPerYear"], assumptions: "Annual salary divided by scheduled hours per year; excludes unpaid leave, overtime and benefits." },
  { id: "overtime", version: API_VERSION, title: "Overtime pay", inputs: ["hourly", "regular", "overtime", "multiplier"], assumptions: "User-supplied overtime multiplier; excludes jurisdiction-specific labor rules, taxes and deductions." },
  { id: "freelance-rate", version: API_VERSION, title: "Freelance hourly rate", inputs: ["income", "expenses", "hours", "weeks"], assumptions: "Annual income target plus annual business expenses divided by annual billable hours; excludes tax and non-billable time beyond the inputs." },
  { id: "freedom-milestone", version: API_VERSION, title: "Financial independence target", inputs: ["expenses", "withdrawal", "current"], assumptions: "Annual expenses divided by user-supplied withdrawal rate; a planning heuristic, not a safe-withdrawal guarantee." },
  { id: "emergency-fund", version: API_VERSION, title: "Emergency fund target", inputs: ["expenses", "targetMonths", "currentSavings", "monthlySaving"], assumptions: "Target equals essential monthly expenses times target months; excludes interest, inflation and withdrawals." },
  { id: "budget-50-30-20", version: API_VERSION, title: "50/30/20 budget", inputs: ["income", "needsPct", "wantsPct", "actualNeeds", "actualWants"], assumptions: "Uses take-home income; wants percentage is capped so needs plus wants never exceed 100%; no tax or expense classification is inferred." },
  { id: "break-even", version: API_VERSION, title: "Business break-even", inputs: ["fixedCosts", "price", "variableCost", "targetProfit", "days"], assumptions: "Contribution is selling price less variable cost; unit counts are rounded up; if contribution is not positive, no break-even is possible." },
  { id: "cost-of-delay", version: API_VERSION, title: "SIP cost of delay", inputs: ["monthly", "annualRate", "years", "delay"], assumptions: "Beginning-of-month contributions; constant assumed nominal rate; delayed contributions finish on the same goal date." },
  { id: "rule-of-72", version: API_VERSION, title: "Rule of 72", inputs: ["rate", "multiple"], assumptions: "Rule of 72 is an approximation; exact doubling and target-multiple periods use discrete annual compounding." },
  { id: "credit-card-payoff", version: API_VERSION, title: "Fixed-payment credit card payoff", inputs: ["balance", "apr", "payment"], assumptions: "Monthly interest is added before a fixed payment; excludes new purchases, fees, rate changes and issuer-specific rules; capped at 1,200 months." }
];
const numeric = (v, name, { min = 0, max = 1e15, optional = false, fallback } = {}) => {
  if (optional && (v === undefined || v === null || v === "")) v = fallback;
  if (typeof v !== "number" || !Number.isFinite(v)) throw Object.assign(new Error(name + " must be a finite number."), { field: name });
  if (v < min || v > max) throw Object.assign(new Error(name + " must be between " + min + " and " + max + "."), { field: name });
  return v;
};
export function calculate(model, input) {
  const v = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const n = (key, options) => numeric(v[key], key, options);
  const rate = (key = "annualRate") => n(key, { min: 0, max: 1000 });
  const years = (key = "years") => n(key, { min: 0, max: 100 });
  const money = (label, value, emphasis = "") => ({ label, value, format: "currency", ...(emphasis ? { emphasis } : {}) });
  const number = (label, value) => ({ label, value, format: "number" });
  const percent = (label, value) => ({ label, value, format: "percent" });
  let results, assumptions;
  switch (model) {
    case "sip": {
      const monthly = n("monthly"), annualRate = rate(), duration = years(), months = Math.round(duration * 12), monthlyRate = annualRate / 1200;
      const invested = monthly * months, future = monthlyRate === 0 ? invested : monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      results = [money("Total contributions", invested), money("Estimated growth", future - invested), money("Estimated future value", future, "positive")];
      assumptions = "Beginning-of-month contributions; monthly compounding; constant assumed annual rate.";
      break;
    }
    case "loan-emi":
    case "home-loan-emi": {
      const principal = n("principal"), annualRate = rate(), months = n("months", { min: 1, max: 1200 }), r = annualRate / 1200;
      const emi = r === 0 ? principal / months : principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
      const total = emi * months;
      results = [money("Monthly EMI", emi, "positive"), money("Total repayment", total), money("Total interest", total - principal)];
      assumptions = "Fixed monthly payment and constant interest rate; fees, insurance and prepayments excluded.";
      break;
    }
    case "compound-interest":
    case "fixed-deposit":
    case "lumpsum": {
      const principal = n("principal"), annualRate = rate(), duration = years(), frequency = n("compoundingPerYear", { min: 1, max: 365, optional: true, fallback: model === "fixed-deposit" ? 4 : model === "lumpsum" ? 1 : 12 });
      const finalValue = principal * Math.pow(1 + annualRate / 100 / frequency, frequency * duration);
      results = [money("Principal", principal), money("Estimated interest / growth", finalValue - principal), money("Estimated final value", finalValue, "positive")];
      assumptions = "Fixed nominal annual rate compounded at the selected frequency; tax and fees excluded.";
      break;
    }
    case "gst": {
      const amount = n("amount"), taxRate = rate("rate"), mode = v.mode === undefined ? "exclusive" : v.mode;
      if (!["exclusive", "inclusive"].includes(mode)) throw Object.assign(new Error("mode must be 'inclusive' or 'exclusive'."), { field: "mode" });
      const base = mode === "inclusive" ? amount / (1 + taxRate / 100) : amount;
      const tax = mode === "inclusive" ? amount - base : amount * taxRate / 100;
      results = [money("Taxable amount", base), money("GST amount", tax), money("Total including GST", base + tax, "positive")];
      assumptions = "Single user-supplied rate; excludes cess, exemptions and jurisdiction-specific treatment.";
      break;
    }
    case "cagr": {
      const start = n("startValue", { min: Number.MIN_VALUE }), end = n("endValue", { min: Number.MIN_VALUE }), duration = years();
      if (duration === 0) throw Object.assign(new Error("years must be greater than zero for CAGR."), { field: "years" });
      const cagr = (Math.pow(end / start, 1 / duration) - 1) * 100;
      results = [money("Starting value", start), money("Ending value", end), percent("CAGR", cagr)];
      assumptions = "Annualized compound growth between two positive values; ignores interim cash flows.";
      break;
    }
    case "inflation": {
      const cost = n("currentCost"), annualInflationRate = rate("annualInflationRate"), duration = years(), future = cost * Math.pow(1 + annualInflationRate / 100, duration);
      results = [money("Current cost", cost), money("Estimated future cost", future, "positive"), money("Estimated increase", future - cost)];
      assumptions = "Constant annual inflation compounded yearly.";
      break;
    }
    case "simple-interest": {
      const principal = n("principal"), annualRate = rate(), duration = years(), interest = principal * annualRate / 100 * duration;
      results = [money("Principal", principal), money("Simple interest", interest), money("Total amount", principal + interest, "positive")];
      assumptions = "Interest does not compound.";
      break;
    }
    case "currency-converter": {
      const amount = n("amount"), fxRate = n("rate", { min: 0, max: 1e9 });
      const from = String(v.from || "").toUpperCase(), to = String(v.to || "").toUpperCase();
      if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to)) throw Object.assign(new Error("from and to must be three-letter currency codes."), { field: "from/to" });
      results = [number(from + " amount", amount), number("Converted amount (" + to + ")", amount * fxRate)];
      assumptions = "User-supplied exchange rate; provider spreads and fees excluded.";
      break;
    }
    case "roi": {
      const cost = n("cost", { min: Number.MIN_VALUE }), finalValue = n("finalValue"), duration = years();
      const profit = finalValue - cost;
      results = [money("Initial cost", cost), money("Net gain / loss", profit), percent("Return on investment", profit / cost * 100)];
      assumptions = "Simple endpoint return; excludes interim cash flows, taxes, fees and timing effects; years is contextual only.";
      break;
    }
    case "recurring-deposit": {
      const monthly = n("monthly"), annualRate = rate(), duration = years(), months = Math.round(duration * 12), monthlyRate = annualRate / 1200;
      const invested = monthly * months;
      const maturity = monthlyRate === 0 ? invested : monthly * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
      results = [money("Total deposits", invested), money("Estimated interest", maturity - invested), money("Estimated maturity value", maturity, "positive")];
      assumptions = "Equal deposits at the end of each month; monthly compounding; constant assumed annual rate.";
      break;
    }
    case "net-worth": {
      const cash = n("cash"), investments = n("investments"), property = n("property"), debt = n("debt");
      const assets = cash + investments + property, netWorth = assets - debt;
      results = [money("Total listed assets", assets), money("Total listed liabilities", debt), money("Estimated net worth", netWorth, netWorth >= 0 ? "positive" : "negative")];
      assumptions = "User-entered asset values less user-entered debt; excludes unlisted assets and liabilities.";
      break;
    }
    case "profit-margin": {
      const revenue = n("revenue", { min: Number.MIN_VALUE }), cost = n("cost");
      const profit = revenue - cost;
      results = [money("Revenue", revenue), money("Profit / loss", profit), percent("Profit margin", profit / revenue * 100)];
      assumptions = "Single-period revenue less cost; excludes tax and non-operating items.";
      break;
    }
    case "sip-goal": {
      const target = n("target"), current = n("current"), annualRate = rate(), duration = n("years", { min: Number.MIN_VALUE, max: 80 });
      const months = Math.round(duration * 12), monthlyRate = annualRate / 1200;
      const futureCurrent = current * Math.pow(1 + monthlyRate, months);
      const gap = Math.max(0, target - futureCurrent);
      const factor = monthlyRate === 0 ? months : ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      const required = gap === 0 ? 0 : gap / factor;
      results = [money("Required monthly SIP", required, "positive"), money("Future value of current corpus", futureCurrent), money("Remaining target gap", gap)];
      assumptions = "Current corpus compounds monthly; contributions are at the beginning of each month; constant assumed return.";
      break;
    }
    case "car-loan":
    case "mortgage":
    case "personal-loan": {
      const annualRate = rate(), duration = n("years", { min: Number.MIN_VALUE, max: 100 });
      const principal = model === "car-loan" ? (() => {
        const price = n("price"), down = n("down");
        if (down > price) throw Object.assign(new Error("down payment cannot exceed vehicle price."), { field: "down" });
        return price - down;
      })() : n("principal");
      const months = Math.round(duration * 12), r = annualRate / 1200;
      const emi = r === 0 ? principal / months : principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
      const total = emi * months;
      results = [money("Monthly payment", emi, "positive"), money("Total repayment", total), money("Total interest", total - principal)];
      assumptions = model === "car-loan" ? "Vehicle price less down payment; fixed monthly amortization; fees and insurance excluded." : "Fixed monthly amortization at a constant rate; fees and insurance excluded.";
      break;
    }
    case "debt-payoff": {
      let balance = n("balance", { min: Number.MIN_VALUE }), payment = n("payment", { min: Number.MIN_VALUE });
      const monthlyRate = rate() / 1200;
      if (payment <= balance * monthlyRate) throw Object.assign(new Error("payment must exceed the first month's interest."), { field: "payment" });
      let months = 0, totalPaid = 0, totalInterest = 0;
      while (balance > 1e-8 && months < 1200) {
        const interest = balance * monthlyRate;
        const due = balance + interest;
        const paid = Math.min(payment, due);
        totalInterest += interest;
        totalPaid += paid;
        balance = Math.max(0, due - paid);
        months++;
      }
      if (balance > 1e-8) throw new Error("Debt payoff exceeds the supported 1200-month horizon.");
      results = [number("Months to payoff", months), money("Total interest", totalInterest), money("Total paid", totalPaid)];
      assumptions = "Fixed payment applied monthly after interest; final payment is capped at the remaining balance plus interest.";
      break;
    }
    case "salary-hourly": {
      const salary = n("amount"), hours = n("hoursPerWeek", { min: Number.MIN_VALUE, max: 168 }), weeks = n("weeksPerYear", { min: Number.MIN_VALUE, max: 52 });
      const annualHours = hours * weeks, hourly = salary / annualHours;
      results = [money("Equivalent hourly pay", hourly, "positive"), number("Scheduled annual hours", annualHours), money("Annual salary", salary)];
      assumptions = "Annual salary divided by scheduled hours per year; excludes unpaid leave, overtime and benefits.";
      break;
    }
    case "overtime": {
      const hourly = n("hourly"), regular = n("regular", { max: 168 }), overtime = n("overtime", { max: 168 }), multiplier = n("multiplier", { min: 1, max: 10 });
      const regularPay = hourly * regular, overtimePay = hourly * overtime * multiplier;
      results = [money("Regular pay", regularPay), money("Overtime pay", overtimePay), money("Total gross pay", regularPay + overtimePay, "positive")];
      assumptions = "User-supplied overtime multiplier; excludes jurisdiction-specific labor rules, taxes and deductions.";
      break;
    }
    case "freelance-rate": {
      const income = n("income"), expenses = n("expenses"), hours = n("hours", { min: Number.MIN_VALUE, max: 168 }), weeks = n("weeks", { min: Number.MIN_VALUE, max: 52 });
      const billableHours = hours * weeks, target = income + expenses;
      results = [money("Required hourly rate", target / billableHours, "positive"), number("Annual billable hours", billableHours), money("Annual revenue target", target)];
      assumptions = "Annual income target plus annual business expenses divided by annual billable hours; excludes taxes and non-billable time beyond the inputs.";
      break;
    }
    case "freedom-milestone": {
      const expenses = n("expenses"), withdrawal = n("withdrawal", { min: Number.MIN_VALUE, max: 100 }), current = n("current");
      const target = expenses / (withdrawal / 100), gap = Math.max(0, target - current);
      results = [money("Indicative independence target", target, "positive"), money("Current investments", current), money("Remaining target gap", gap)];
      assumptions = "Annual expenses divided by user-supplied withdrawal rate; a planning heuristic, not a safe-withdrawal guarantee.";
      break;
    }
    case "emergency-fund": {
      const expenses = n("expenses"), targetMonths = n("targetMonths", { min: 1, max: 36 }), currentSavings = n("currentSavings"), monthlySaving = n("monthlySaving");
      const target = expenses * targetMonths, gap = Math.max(0, target - currentSavings);
      const months = gap === 0 ? 0 : monthlySaving > 0 ? Math.ceil(gap / monthlySaving) : 0;
      results = [money("Emergency fund target", target), money("Additional savings needed", gap), number("Months to target (0 = already funded or no monthly saving)", months)];
      assumptions = "Target equals essential monthly expenses times target months; excludes interest, inflation and withdrawals.";
      break;
    }
    case "budget-50-30-20": {
      const income = n("income"), needsPct = n("needsPct", { max: 100 }), wantsPct = Math.min(100 - needsPct, n("wantsPct", { max: 100 }));
      const actualNeeds = n("actualNeeds"), actualWants = n("actualWants");
      const needs = income * needsPct / 100, wants = income * wantsPct / 100, savings = income - needs - wants;
      const actualSavings = income - actualNeeds - actualWants, gap = actualSavings - savings;
      results = [money("Target for needs", needs), money("Target for wants", wants), money("Target for savings and debt repayment", savings), money("Your actual monthly savings", actualSavings), money(gap >= 0 ? "Ahead of the savings target by" : "Short of the savings target by", Math.abs(gap))];
      assumptions = "Uses take-home income; wants percentage is capped so needs plus wants never exceed 100%; no tax or expense classification is inferred.";
      break;
    }
    case "break-even": {
      const fixedCosts = n("fixedCosts"), price = n("price"), variableCost = n("variableCost"), targetProfit = n("targetProfit"), days = n("days", { min: 1, max: 31 });
      const contribution = price - variableCost, viable = contribution > 0;
      const units = viable ? Math.ceil(fixedCosts / contribution) : 0, targetUnits = viable ? Math.ceil((fixedCosts + targetProfit) / contribution) : 0;
      results = [money("Contribution per unit", contribution), number(viable ? "Break-even units per month" : "No break-even: price does not cover variable cost", units), money("Break-even sales per month", units * price), number("Break-even units per day", units / days), number("Units per month for the profit target", targetUnits)];
      assumptions = "Contribution is selling price less variable cost; unit counts are rounded up; if contribution is not positive, no break-even is possible.";
      break;
    }
    case "cost-of-delay": {
      const monthly = n("monthly"), annualRate = rate(), duration = n("years", { min: 1, max: 60 }), delay = n("delay", { max: 59 });
      if (delay > duration) throw Object.assign(new Error("delay must not exceed years."), { field: "delay" });
      const months = Math.round(duration * 12), delayMonths = Math.min(months, Math.round(delay * 12)), monthlyRate = annualRate / 1200;
      const factor = count => monthlyRate === 0 ? count : ((Math.pow(1 + monthlyRate, count) - 1) / monthlyRate) * (1 + monthlyRate);
      const startNow = monthly * factor(months), delayedFactor = factor(months - delayMonths), startLater = monthly * delayedFactor;
      const catchUp = delayedFactor > 0 ? startNow / delayedFactor : 0;
      results = [money("Value if you start now", startNow), money("Value if you start later", startLater), money("Cost of the delay", startNow - startLater), money("Monthly SIP needed to catch up after the delay", catchUp)];
      assumptions = "Beginning-of-month contributions; constant assumed nominal rate; delayed contributions finish on the same goal date.";
      break;
    }
    case "rule-of-72": {
      const annualRate = n("rate", { max: 100 }), multiple = n("multiple", { min: 1, max: 1000 }), growth = 1 + annualRate / 100;
      const rule = annualRate > 0 ? 72 / annualRate : 0, exact = annualRate > 0 ? Math.log(2) / Math.log(growth) : 0;
      const target = annualRate > 0 ? Math.log(multiple) / Math.log(growth) : 0;
      results = [number("Years to double (Rule of 72)", rule), number("Years to double (exact compounding)", exact), number("Rule of 72 minus exact", rule - exact), number("Years to reach the target multiple", target)];
      assumptions = "Rule of 72 is an approximation; exact doubling and target-multiple periods use discrete annual compounding.";
      break;
    }
    case "credit-card-payoff": {
      let balance = n("balance"), interestPaid = 0, totalPaid = 0, months = 0;
      const apr = n("apr", { max: 300 }), payment = n("payment"), monthlyRate = apr / 1200, maxMonths = 1200;
      if (payment <= balance * monthlyRate && balance > 0) {
        results = [number("Months to clear (0 = payment too low)", 0), money("Monthly interest at current balance", balance * monthlyRate), money("Payment needed to start reducing balance", balance * monthlyRate + 1)];
        assumptions = "Payment does not exceed first-month interest; balance will not decline. Excludes fees, new purchases and issuer-specific rules.";
        break;
      }
      while (balance > 0.005 && months < maxMonths) {
        const interest = balance * monthlyRate;
        interestPaid += interest;
        const paid = Math.min(balance + interest, payment);
        totalPaid += paid;
        balance = Math.max(0, balance + interest - paid);
        months++;
      }
      if (balance > 0.005) {
        results = [number("Payoff not reached within 1,200 months", maxMonths), money("Remaining balance after 1,200 months", balance), money("Interest paid within 1,200 months", interestPaid)];
        assumptions = "Fixed monthly payment with monthly interest added first; payoff capped at 1,200 months; excludes fees, new purchases and issuer-specific rules.";
      } else {
        results = [number("Months to pay off", months), money("Total interest paid", interestPaid), money("Total payments", totalPaid)];
        assumptions = "Fixed monthly payment with monthly interest added first; excludes fees, new purchases, rate changes and issuer-specific rules.";
      }
      break;
    }
    default: throw Object.assign(new Error("Unsupported model. Use GET /v1/models to list supported models."), { unsupported: true });
  }
  if (results.some(r => !Number.isFinite(r.value))) throw new Error("Calculation exceeded the supported numeric range.");
  return { results, assumptions };
}
