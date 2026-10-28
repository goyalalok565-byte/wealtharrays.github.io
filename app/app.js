(function () {
  "use strict";

  const STORAGE_KEY = "waFinancialPlanV1";
  const CLOUD_CALCULATOR_ID = "wealth-dashboard";
  const DEFAULT_PLAN = {
    name: "My financial goal",
    target: 250000,
    current: 10000,
    monthly: 500,
    years: 15,
    annualReturn: 7,
    inflation: 3,
    currency: "USD"
  };

  const ids = {
    form: "plan-form",
    name: "plan-name",
    target: "plan-target",
    current: "plan-current",
    monthly: "plan-monthly",
    years: "plan-years",
    annualReturn: "plan-return",
    inflation: "plan-inflation",
    currency: "app-currency"
  };
  const byId = id => document.getElementById(id);
  const inputs = Object.fromEntries(Object.entries(ids).map(([key, id]) => [key, byId(id)]));
  const formStatus = byId("form-status");
  const saveStatus = byId("save-status");
  const cloudPlans = byId("cloud-plans");
  let lastResult = null;
  let remotePlans = [];

  function setStatus(element, message, kind = "") {
    element.textContent = message;
    element.dataset.kind = kind;
  }

  function currencyFormat(value, currency) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "—";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: Math.abs(amount) >= 100 ? 0 : 2
      }).format(amount);
    } catch {
      return Math.round(amount).toLocaleString() + " " + currency;
    }
  }

  function numberInput(key, { min, max }) {
    const field = inputs[key];
    const value = Number(field.value);
    const valid = field.value.trim() !== "" && Number.isFinite(value) && value >= min && value <= max;
    field.setAttribute("aria-invalid", String(!valid));
    if (!valid) throw new Error(field.labels?.[0]?.textContent?.trim() || "Enter a valid value.");
    return value;
  }

  function readPlan() {
    const plan = {
      name: inputs.name.value.trim().slice(0, 80) || DEFAULT_PLAN.name,
      target: numberInput("target", { min: 0, max: 1e12 }),
      current: numberInput("current", { min: 0, max: 1e12 }),
      monthly: numberInput("monthly", { min: 0, max: 1e10 }),
      years: numberInput("years", { min: 0.25, max: 100 }),
      annualReturn: numberInput("annualReturn", { min: -99, max: 100 }),
      inflation: numberInput("inflation", { min: -99, max: 100 }),
      currency: inputs.currency.value
    };
    return plan;
  }

  function futureValue(current, monthly, months, annualReturn) {
    const rate = annualReturn / 1200;
    if (Math.abs(rate) < 1e-12) return current + monthly * months;
    const growth = Math.pow(1 + rate, months);
    return current * growth + monthly * ((growth - 1) / rate);
  }

  function requiredMonthly(target, current, months, annualReturn) {
    if (target <= 0 || target <= current) return 0;
    const rate = annualReturn / 1200;
    if (Math.abs(rate) < 1e-12) return Math.max(0, (target - current) / months);
    const growth = Math.pow(1 + rate, months);
    const futureFromCurrent = current * growth;
    const annuityFactor = (growth - 1) / rate;
    return Math.max(0, (target - futureFromCurrent) / annuityFactor);
  }

  function evaluate(plan) {
    const months = Math.round(plan.years * 12);
    const projected = futureValue(plan.current, plan.monthly, months, plan.annualReturn);
    const inflationFactor = Math.pow(1 + plan.inflation / 100, plan.years);
    const todaysValue = inflationFactor > 0 ? projected / inflationFactor : projected;
    const contributionNeeded = requiredMonthly(plan.target, plan.current, months, plan.annualReturn);
    const contributed = plan.current + plan.monthly * months;
    return {
      plan,
      months,
      projected,
      todaysValue,
      contributionNeeded,
      contributed,
      targetGap: projected - plan.target,
      targetReached: projected >= plan.target
    };
  }

  function scenario(name, returnDelta, plan) {
    const annualReturn = Math.max(-99, Math.min(100, plan.annualReturn + returnDelta));
    const result = evaluate({ ...plan, annualReturn });
    return { name, annualReturn, result };
  }

  function addCell(row, value, tag = "td") {
    const cell = document.createElement(tag);
    cell.textContent = value;
    row.append(cell);
  }

  function renderTrajectory(result) {
    const body = byId("trajectory-body");
    body.replaceChildren();
    const years = Math.ceil(result.plan.years);
    for (let year = 1; year <= years; year += 1) {
      const months = Math.min(result.months, year * 12);
      const fraction = months / 12;
      const projected = futureValue(result.plan.current, result.plan.monthly, months, result.plan.annualReturn);
      const contributed = result.plan.current + result.plan.monthly * months;
      const inflationFactor = Math.pow(1 + result.plan.inflation / 100, fraction);
      const row = document.createElement("tr");
      addCell(row, months === result.months ? (result.plan.years % 1 ? result.plan.years.toFixed(2) : String(year)) : String(year), "th");
      addCell(row, currencyFormat(contributed, result.plan.currency));
      addCell(row, currencyFormat(projected, result.plan.currency));
      addCell(row, currencyFormat(inflationFactor > 0 ? projected / inflationFactor : projected, result.plan.currency));
      body.append(row);
    }
  }

  function renderScenarios(plan) {
    const host = byId("scenario-cards");
    host.replaceChildren();
    [
      scenario("Cautious case", -3, plan),
      scenario("Base case", 0, plan),
      scenario("Higher-return case", 3, plan)
    ].forEach(item => {
      const card = document.createElement("article");
      card.className = "app-scenario";
      const label = document.createElement("span");
      label.textContent = item.name;
      const value = document.createElement("strong");
      value.textContent = currencyFormat(item.result.projected, plan.currency);
      const detail = document.createElement("small");
      detail.textContent = item.annualReturn.toFixed(1) + "% annual return assumption · " +
        (item.result.targetReached ? "reaches the target" : currencyFormat(Math.abs(item.result.targetGap), plan.currency) + " below target");
      card.append(label, value, detail);
      host.append(card);
    });
  }

  function render(result) {
    const { plan } = result;
    byId("projected-value").textContent = currencyFormat(result.projected, plan.currency);
    byId("target-gap").textContent = result.targetReached
      ? "Ahead by " + currencyFormat(result.targetGap, plan.currency)
      : "Behind by " + currencyFormat(Math.abs(result.targetGap), plan.currency);
    byId("required-monthly").textContent = currencyFormat(result.contributionNeeded, plan.currency);
    byId("today-value").textContent = currencyFormat(result.todaysValue, plan.currency);
    byId("projected-detail").textContent = "After " + plan.years + " years · " + currencyFormat(result.contributed, plan.currency) + " contributed";
    byId("gap-detail").textContent = result.targetReached ? "Your projection exceeds the target" : "Your projection falls short of the target";
    byId("required-detail").textContent = result.contributionNeeded <= plan.monthly
      ? "Your current contribution is sufficient under this model"
      : currencyFormat(result.contributionNeeded - plan.monthly, plan.currency) + " more than your current monthly amount";
    byId("scenario-label").textContent = plan.annualReturn.toFixed(1) + "% base return";
    renderTrajectory(result);
    renderScenarios(plan);
  }

  function calculate(event) {
    if (event) event.preventDefault();
    try {
      const result = evaluate(readPlan());
      lastResult = result;
      render(result);
      setStatus(formStatus, "Plan updated. Change an assumption to compare a different future.", "success");
      return result;
    } catch (error) {
      setStatus(formStatus, error.message, "error");
      return null;
    }
  }

  function applyPlan(plan) {
    const next = { ...DEFAULT_PLAN, ...plan };
    inputs.name.value = next.name;
    inputs.target.value = next.target;
    inputs.current.value = next.current;
    inputs.monthly.value = next.monthly;
    inputs.years.value = next.years;
    inputs.annualReturn.value = next.annualReturn;
    inputs.inflation.value = next.inflation;
    inputs.currency.value = next.currency;
    Object.values(inputs).forEach(field => field?.setAttribute?.("aria-invalid", "false"));
    calculate();
  }

  function saveLocal() {
    const result = calculate();
    if (!result) return;
    const payload = { version: 1, plan: result.plan, savedAt: new Date().toISOString() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setStatus(saveStatus, "Saved privately in this browser.", "success");
    } catch {
      setStatus(saveStatus, "This browser could not save the plan locally.", "error");
    }
  }

  function exportPlan() {
    const result = calculate();
    if (!result) return;
    const payload = {
      product: "Wealth Arrays App",
      version: 1,
      generatedAt: new Date().toISOString(),
      model: "monthly-contribution-compounding-v1",
      plan: result.plan,
      results: {
        projectedValue: result.projected,
        targetGap: result.targetGap,
        requiredMonthlyContribution: result.contributionNeeded,
        todaysMoneyValue: result.todaysValue,
        contributedAmount: result.contributed
      },
      limitations: [
        "Educational estimate only.",
        "The calculation assumes a constant monthly contribution, annual return and inflation rate.",
        "Actual returns, inflation, taxes, fees and cash flows can differ materially."
      ]
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wealth-arrays-plan.json";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(saveStatus, "Plan exported as a reusable JSON report.", "success");
  }

  function sessionToken() {
    try {
      const session = JSON.parse(localStorage.getItem("waSupabaseSession") || "null");
      if (!session?.access_token) return null;
      if (session.expires_at && Date.now() / 1000 > session.expires_at - 30) return null;
      return session.access_token;
    } catch {
      return null;
    }
  }

  async function api(path, options = {}) {
    const token = sessionToken();
    if (!token) throw new Error("Sign in on the Account page before using cloud sync.");
    const response = await fetch(path, {
      ...options,
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + token,
        ...options.headers
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error?.message || "The account service could not complete this request.");
    return data;
  }

  async function syncPlan() {
    const result = calculate();
    if (!result) return;
    setStatus(saveStatus, "Syncing your plan to the account…");
    try {
      await api("/v1/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calculator_id: CLOUD_CALCULATOR_ID,
          name: result.plan.name,
          model_version: "financial-plan-v1",
          inputs: result.plan,
          results: {
            projected_value: result.projected,
            target_gap: result.targetGap,
            required_monthly: result.contributionNeeded,
            todays_value: result.todaysValue
          }
        })
      });
      setStatus(saveStatus, "Plan synced to your account.", "success");
    } catch (error) {
      setStatus(saveStatus, error.message, "error");
    }
  }

  function renderCloudPlans() {
    cloudPlans.replaceChildren();
    if (!remotePlans.length) {
      const empty = document.createElement("p");
      empty.className = "app-status";
      empty.textContent = "No cloud plans yet.";
      cloudPlans.append(empty);
    } else {
      remotePlans.forEach(item => {
        const row = document.createElement("div");
        row.className = "app-cloud-plan";
        const content = document.createElement("div");
        const title = document.createElement("b");
        title.textContent = item.name || "Saved plan";
        const detail = document.createElement("span");
        detail.textContent = "Saved " + (item.updated_at || item.created_at || "recently");
        content.append(title, detail);
        const load = document.createElement("button");
        load.type = "button";
        load.className = "app-secondary-button";
        load.textContent = "Load";
        load.addEventListener("click", () => {
          if (!item.inputs || typeof item.inputs !== "object") {
            setStatus(saveStatus, "This saved plan does not contain usable inputs.", "error");
            return;
          }
          applyPlan(item.inputs);
          setStatus(saveStatus, "Cloud plan loaded. It has not changed until you save or sync again.", "success");
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
        row.append(content, load);
        cloudPlans.append(row);
      });
    }
    cloudPlans.hidden = false;
  }

  async function loadCloudPlans() {
    setStatus(saveStatus, "Loading cloud plans…");
    try {
      const data = await api("/v1/scenarios");
      remotePlans = (data.scenarios || []).filter(item => item.calculator_id === CLOUD_CALCULATOR_ID);
      renderCloudPlans();
      setStatus(saveStatus, remotePlans.length ? "Cloud plans loaded." : "No cloud plans have been saved yet.", "success");
    } catch (error) {
      setStatus(saveStatus, error.message, "error");
    }
  }

  function restoreLocal() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved?.plan && typeof saved.plan === "object") {
        applyPlan(saved.plan);
        setStatus(formStatus, "Your locally saved plan was restored.", "success");
        return;
      }
    } catch {
      // Start with the default plan if stored data is malformed or unavailable.
    }
    applyPlan(DEFAULT_PLAN);
  }

  inputs.form.addEventListener("submit", calculate);
  byId("reset-plan").addEventListener("click", () => {
    applyPlan(DEFAULT_PLAN);
    setStatus(formStatus, "The starter plan has been restored.");
  });
  byId("save-local").addEventListener("click", saveLocal);
  byId("export-plan").addEventListener("click", exportPlan);
  byId("sync-plan").addEventListener("click", syncPlan);
  byId("load-cloud").addEventListener("click", loadCloudPlans);
  inputs.currency.addEventListener("change", calculate);

  restoreLocal();
})();