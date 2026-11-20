export const API_VERSION = "1.1.0";
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
  { id: "sip-goal", version: API_VERSION, title: "SIP goal planner", inputs: ["target", "current", "annualRate", "years"], assumptions: "Current corpus grows monthly; required contributions occur at the beginning of each month at a constant assumed rate." }
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
    default: throw Object.assign(new Error("Unsupported model. Use GET /v1/models to list supported models."), { unsupported: true });
  }
  if (results.some(r => !Number.isFinite(r.value))) throw new Error("Calculation exceeded the supported numeric range.");
  return { results, assumptions };
}
