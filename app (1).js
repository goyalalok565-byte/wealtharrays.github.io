/* Wealth Arrays — app shell: routing, rendering, currency + theme state */

const APP = document.getElementById("app");
const CURRENCY_SELECT = document.getElementById("currency-select");
const THEME_TOGGLE = document.getElementById("theme-toggle");
const THEME_LABEL = document.getElementById("theme-toggle-label");

function pad2(n) {
  return n < 10 ? "0" + n : String(n);
}

/* Safe storage wrapper — some browsers (private mode, disabled cookies) throw
   or expose a null localStorage. Falls back to in-memory state instead of crashing. */
const safeStorage = {
  get(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  },
};

let state = {
  currency: safeStorage.get("wa-currency") || "USD",
  theme: safeStorage.get("wa-theme") || "light",
};

/* ---------- Currency + number formatting ---------- */

function currencySymbol() {
  const c = CURRENCIES.find((c) => c.code === state.currency);
  return c ? c.symbol : "$";
}

function formatValue(value, format) {
  if (!isFinite(value)) return "—";
  if (format === "percent") {
    return value.toFixed(2) + "%";
  }
  if (format === "number") {
    return Math.round(value).toLocaleString("en-US");
  }
  // currency
  const rounded = Math.round(value * 100) / 100;
  const parts = rounded.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currencySymbol() + parts;
}

/* ---------- Theme ---------- */

function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  THEME_LABEL.textContent = state.theme === "dark" ? "Light" : "Dark";
  THEME_TOGGLE.setAttribute("aria-pressed", String(state.theme === "dark"));
}

THEME_TOGGLE.addEventListener("click", () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  safeStorage.set("wa-theme", state.theme);
  applyTheme();
});

/* ---------- Currency select ---------- */

function buildCurrencySelect() {
  CURRENCY_SELECT.innerHTML = CURRENCIES.map(
    (c) => `<option value="${c.code}">${c.code} (${c.symbol})</option>`
  ).join("");
  CURRENCY_SELECT.value = state.currency;
}

CURRENCY_SELECT.addEventListener("change", () => {
  state.currency = CURRENCY_SELECT.value;
  safeStorage.set("wa-currency", state.currency);
  // re-render current view so displayed values pick up the new symbol
  route();
});

/* ---------- Home / ledger index ---------- */

function renderHome() {
  const rows = CALCULATORS.map((calc, idx) => `
    <a class="ledger-row" href="#/tool/${calc.id}" data-search="${(calc.title + " " + calc.short).toLowerCase()}">
      <span class="ledger-row-num">${pad2(idx + 1)}</span>
      <span class="ledger-row-text">
        <span class="ledger-row-title">${calc.title}</span>
        <span class="ledger-row-desc">${calc.short}</span>
      </span>
      <span class="ledger-row-arrow">open →</span>
    </a>
  `).join("");

  const categoryCards = CATEGORIES.map((cat) => {
    const count = CALCULATORS.filter((c) => c.category === cat.id).length;
    if (!count) return "";
    return `
      <a class="cat-card" href="#/category/${cat.id}">
        <span class="cat-card-icon">${CATEGORY_ICONS[cat.id] || ""}</span>
        <span class="cat-card-title">${cat.label}</span>
        <span class="cat-card-desc">${cat.desc}</span>
        <span class="cat-card-count">${count} tool${count === 1 ? "" : "s"} →</span>
      </a>`;
  }).join("");

  APP.innerHTML = `
    <section class="ledger-hero">
      <h1>Financial calculators, kept honest.</h1>
      <p>No advisor referrals, no lead-selling, no signup wall — every tool works instantly, no account needed. Results are computed in your browser, in the currency you choose.</p>
      <div class="search-bar">
        <input type="search" id="tool-search" placeholder="Search calculators — e.g. mortgage, SIP, margin" aria-label="Search calculators">
      </div>
    </section>
    <section class="cat-grid-section">
      <div class="ledger-index-heading">BROWSE BY CATEGORY</div>
      <div class="cat-grid">${categoryCards}</div>
    </section>
    <section class="ledger-index">
      <div class="ledger-index-heading" id="index-heading">FULL INDEX — ${CALCULATORS.length} CALCULATORS</div>
      <div id="index-list">${rows}</div>
      <p class="no-results" id="no-results" hidden>No calculators match that search yet — try a different term.</p>
    </section>
    <section class="how-it-works">
      <div class="how-step">
        <span class="how-num">1</span>
        <h3>Choose a tool</h3>
        <p>Search, or browse by category.</p>
      </div>
      <div class="how-step">
        <span class="how-num">2</span>
        <h3>Enter your numbers</h3>
        <p>Adjust the fields — results update as you type.</p>
      </div>
      <div class="how-step">
        <span class="how-num">3</span>
        <h3>Read the result</h3>
        <p>Every figure is computed locally, in your chosen currency.</p>
      </div>
    </section>
  `;

  const searchInput = document.getElementById("tool-search");
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    const items = document.querySelectorAll("#index-list .ledger-row");
    let visible = 0;
    items.forEach((el) => {
      const match = el.dataset.search.includes(q);
      el.hidden = !match;
      if (match) visible++;
    });
    document.getElementById("no-results").hidden = visible !== 0;
    document.getElementById("index-heading").textContent = q
      ? `${visible} RESULT${visible === 1 ? "" : "S"} FOR "${q.toUpperCase()}"`
      : `INDEX — ${CALCULATORS.length} CALCULATORS`;
  });
}

function renderCategory(cat) {
  const tools = CALCULATORS.filter((c) => c.category === cat.id);
  const rows = tools.map((calc, idx) => `
    <a class="ledger-row" href="#/tool/${calc.id}">
      <span class="ledger-row-num">${pad2(idx + 1)}</span>
      <span class="ledger-row-text">
        <span class="ledger-row-title">${calc.title}</span>
        <span class="ledger-row-desc">${calc.short}</span>
      </span>
      <span class="ledger-row-arrow">open →</span>
    </a>
  `).join("");

  APP.innerHTML = `
    <div class="calc-page category-page">
      <a class="calc-back" href="#/">← All categories</a>
      <h1 class="calc-title">${cat.label}</h1>
      <p class="calc-desc">${cat.desc}</p>
    </div>
    <section class="ledger-index">
      <div class="ledger-index-heading">${tools.length} TOOL${tools.length === 1 ? "" : "S"} IN THIS CATEGORY</div>
      ${rows || '<p class="no-results">No tools here yet.</p>'}
    </section>
  `;
}

/* ---------- Calculator page ---------- */

function renderCalculator(calc) {
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

  const category = CATEGORIES.find((c) => c.id === calc.category);
  const related = CALCULATORS.filter((c) => c.category === calc.category && c.id !== calc.id).slice(0, 4);
  const relatedHtml = related.length ? `
    <div class="related-tools">
      <div class="related-heading">Related tools</div>
      ${related.map((r) => `<a class="related-link" href="#/tool/${r.id}">${r.title}</a>`).join("")}
    </div>` : "";

  const infoHtml = category ? `
    <div class="tool-info">
      <div class="related-heading">Tool info</div>
      <div class="tool-info-row"><span>Category</span><a href="#/category/${category.id}">${category.label}</a></div>
      <div class="tool-info-row"><span>Access</span><span>Free — no sign-up</span></div>
      <div class="tool-info-row"><span>Runs</span><span>In your browser</span></div>
    </div>` : "";

  APP.innerHTML = `
    <div class="calc-page">
      <a class="calc-back" href="#/">← Index</a>
      ${category ? `<a class="calc-category-tag" href="#/category/${category.id}">${category.label}</a>` : ""}
      <h1 class="calc-title">${calc.title}</h1>
      <p class="calc-desc">${calc.desc}</p>
      <div class="calc-body">
        <div class="calc-main">
          <div class="calc-grid">${fieldsHtml}</div>
          <div class="calc-result" id="calc-result"></div>
          <p class="calc-note">Estimates only, for planning purposes — not financial, tax, or investment advice.</p>
        </div>
        <aside class="calc-sidebar">
          ${infoHtml}
          ${relatedHtml}
        </aside>
      </div>
    </div>
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
    const resultEl = document.getElementById("calc-result");
    resultEl.innerHTML = results.map((r) => `
      <div class="calc-result-row">
        <span class="calc-result-label">${r.label}</span>
        <span class="calc-result-value ${r.emphasis || ""}">${formatValue(r.value, r.format)}</span>
      </div>
    `).join("");
  }

  calc.fields.forEach((f) => {
    const el = document.getElementById(`f-${f.id}`);
    el.addEventListener("input", recompute);
    el.addEventListener("change", recompute);
  });

  // set select defaults
  calc.fields.forEach((f) => {
    if (f.type === "select") document.getElementById(`f-${f.id}`).value = f.default;
  });

  recompute();
}

/* ---------- Router ---------- */

function route() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const parts = hash.split("/").filter(Boolean);

  if (parts.length === 0) {
    renderHome();
    document.title = "Wealth Arrays — Financial Calculators";
    window.scrollTo(0, 0);
    return;
  }

  if (parts[0] === "tool" && parts[1]) {
    const calc = CALCULATORS.find((c) => c.id === parts[1]);
    if (calc) {
      renderCalculator(calc);
      document.title = `${calc.title} — Wealth Arrays`;
      window.scrollTo(0, 0);
      return;
    }
  }

  if (parts[0] === "category" && parts[1]) {
    const cat = CATEGORIES.find((c) => c.id === parts[1]);
    if (cat) {
      renderCategory(cat);
      document.title = `${cat.label} — Wealth Arrays`;
      window.scrollTo(0, 0);
      return;
    }
  }

  // legacy / unknown — fall back to home
  renderHome();
  document.title = "Wealth Arrays — Financial Calculators";
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", route);

/* ---------- Init ---------- */

buildCurrencySelect();
applyTheme();
route();
