/* Wealth Arrays — shared widget logic, used by every standalone page.
   Requires calculators.js to be loaded first. */

const safeStorage = {
  get(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  },
};

const waState = {
  currency: safeStorage.get("wa-currency") || "USD",
  theme: safeStorage.get("wa-theme") || "light",
};

function waCurrencySymbol() {
  const c = CURRENCIES.find((c) => c.code === waState.currency);
  return c ? c.symbol : "$";
}

function waFormatValue(value, format) {
  if (!isFinite(value)) return "—";
  if (format === "percent") return value.toFixed(2) + "%";
  if (format === "number") return Math.round(value).toLocaleString("en-US");
  const rounded = Math.round(value * 100) / 100;
  const parts = rounded.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return waCurrencySymbol() + parts;
}

function pad2(n) {
  return n < 10 ? "0" + n : String(n);
}

/* ---------- Masthead: currency select + theme toggle ---------- */

function initMasthead(onCurrencyChange) {
  const select = document.getElementById("currency-select");
  const toggle = document.getElementById("theme-toggle");
  const label = document.getElementById("theme-toggle-label");

  if (select) {
    select.innerHTML = CURRENCIES.map((c) => `<option value="${c.code}">${c.code} (${c.symbol})</option>`).join("");
    select.value = waState.currency;
    select.addEventListener("change", () => {
      waState.currency = select.value;
      safeStorage.set("wa-currency", waState.currency);
      if (onCurrencyChange) onCurrencyChange();
    });
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", waState.theme);
    if (label) label.textContent = waState.theme === "dark" ? "Light" : "Dark";
    if (toggle) toggle.setAttribute("aria-pressed", String(waState.theme === "dark"));
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      waState.theme = waState.theme === "dark" ? "light" : "dark";
      safeStorage.set("wa-theme", waState.theme);
      applyTheme();
    });
  }

  applyTheme();
}

/* ---------- Calculator widget mount (used on each standalone tool page) ---------- */

function mountCalculator(calc, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const fieldsHtml = calc.fields.map((f) => {
    if (f.type === "select") {
      const opts = f.options.map((o) => `<option value="${o.value}">${o.label}</option>`).join("");
      return `
        <div class="field">
          <label for="f-${f.id}">${f.label}</label>
          <select id="f-${f.id}" data-field="${f.id}">${opts}</select>
        </div>`;
    }
    return `
      <div class="field">
        <label for="f-${f.id}">${f.label}${f.suffix ? ` <span class="hint">(${f.suffix})</span>` : ""}</label>
        <input id="f-${f.id}" data-field="${f.id}" type="number" value="${f.default}"
          ${f.min !== undefined ? `min="${f.min}"` : ""} ${f.max !== undefined ? `max="${f.max}"` : ""} ${f.step !== undefined ? `step="${f.step}"` : ""} />
      </div>`;
  }).join("");

  container.innerHTML = `
    <div class="calc-grid">${fieldsHtml}</div>
    <div class="calc-result" id="${containerId}-result"></div>
    <p class="calc-note">Estimates only, for planning purposes — not financial, tax, or investment advice.</p>
  `;

  function currentValues() {
    const values = {};
    calc.fields.forEach((f) => {
      const el = document.getElementById(`f-${f.id}`);
      values[f.id] = f.type === "select" ? el.value : parseFloat(el.value);
      if (f.type !== "select" && isNaN(values[f.id])) values[f.id] = 0;
    });
    return values;
  }

  function recompute() {
    const values = currentValues();
    let results;
    try {
      results = calc.compute(values);
    } catch (e) {
      results = [];
    }
    const resultEl = document.getElementById(`${containerId}-result`);
    resultEl.innerHTML = results.map((r) => `
      <div class="calc-result-row">
        <span class="calc-result-label">${r.label}</span>
        <span class="calc-result-value ${r.emphasis || ""}">${waFormatValue(r.value, r.format)}</span>
      </div>
    `).join("");
  }

  calc.fields.forEach((f) => {
    const el = document.getElementById(`f-${f.id}`);
    el.addEventListener("input", recompute);
    el.addEventListener("change", recompute);
  });

  calc.fields.forEach((f) => {
    if (f.type === "select") document.getElementById(`f-${f.id}`).value = f.default;
  });

  initMasthead(recompute);
  recompute();
}

/* ---------- Homepage search (progressive enhancement over real <a> links) ---------- */

function initSearch(inputId, listSelector, headingId, totalLabel) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    const items = document.querySelectorAll(listSelector);
    let visible = 0;
    items.forEach((el) => {
      const match = (el.dataset.search || "").includes(q);
      el.hidden = !match;
      if (match) visible++;
    });
    const heading = document.getElementById(headingId);
    if (heading) {
      heading.textContent = q ? `${visible} RESULT${visible === 1 ? "" : "S"} FOR "${q.toUpperCase()}"` : totalLabel;
    }
  });
}
