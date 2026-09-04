/* Wealth Arrays — fast client-side calculator UI.
   No framework, no tracking dependency, no account required. */

const safeStorage = {
  get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch (e) {} },
};

const waState = {
  currency: safeStorage.get("wa-currency") || "USD",
  theme: safeStorage.get("wa-theme") || (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
  locale: safeStorage.get("wa-locale") || "en",
};

function waCurrencySymbol() {
  const c = CURRENCIES.find((c) => c.code === waState.currency);
  return c ? c.symbol : "$";
}
function waFormatValue(value, format) {
  if (!isFinite(value)) return "—";
  if (format === "percent") return value.toFixed(2) + "%";
  if (format === "number") return Math.round(value).toLocaleString("en-US");
  if (format === "years") return value.toFixed(1) + " yrs";
  const rounded = Math.round(value * 100) / 100;
  return waCurrencySymbol() + rounded.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function waEscape(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
function waPlainValue(value, format) {
  return waFormatValue(value, format);
}

function applyGlobalTheme() {
  document.documentElement.setAttribute("data-theme", waState.theme);
  const label = document.getElementById("theme-toggle-label");
  const toggle = document.getElementById("theme-toggle");
  if (label) label.textContent = waState.theme === "dark" ? "Light" : "Dark";
  if (toggle) toggle.setAttribute("aria-pressed", String(waState.theme === "dark"));
}
function initMasthead(onChange) {
  const select = document.getElementById("currency-select");
  const toggle = document.getElementById("theme-toggle");
  if (select && typeof CURRENCIES !== "undefined") {
    select.innerHTML = CURRENCIES.map(c => `<option value="${c.code}">${c.code} (${c.symbol})</option>`).join("");
    select.value = waState.currency;
    select.addEventListener("change", () => {
      waState.currency = select.value;
      safeStorage.set("wa-currency", waState.currency);
      onChange?.();
    });
  }
  toggle?.addEventListener("click", () => {
    waState.theme = waState.theme === "dark" ? "light" : "dark";
    safeStorage.set("wa-theme", waState.theme);
    applyGlobalTheme();
  });
  applyGlobalTheme();
}

async function waShare(title, text, url) {
  if (navigator.share) {
    try { await navigator.share({ title, text, url }); return true; } catch (e) {}
  }
  try {
    await navigator.clipboard.writeText(url);
    alert("Link copied. You can paste it into any social app.");
    return true;
  } catch (e) {
    return false;
  }
}

function waOpenPrintReport(calc, values, results) {
  const rows = results.map(r => `<tr><td>${waEscape(r.label)}</td><td>${waEscape(waPlainValue(r.value, r.format))}</td></tr>`).join("");
  const inputs = calc.fields.map(f => `<tr><td>${waEscape(f.label)}</td><td>${waEscape(String(values[f.id]))}</td></tr>`).join("");
  const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=900");
  if (!w) { alert("Please allow pop-ups to export the report."); return; }
  w.document.write(`<!doctype html><html><head><title>${waEscape(calc.title)} — Wealth Arrays</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>body{font-family:system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;color:#111}h1{margin-bottom:4px}p{color:#555}table{width:100%;border-collapse:collapse;margin:18px 0}th,td{border-bottom:1px solid #ddd;text-align:left;padding:10px}th{background:#f5f5f5}small{color:#666}</style></head>
  <body><h1>${waEscape(calc.title)}</h1><p>Wealth Arrays • Generated ${new Date().toLocaleString()}</p>
  <h2>Inputs</h2><table><tbody>${inputs}</tbody></table>
  <h2>Calculated output</h2><table><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>${rows}</tbody></table>
  <small>For planning purposes only. Not financial, tax, legal, or investment advice.</small>
  <script>window.onload=()=>window.print();<\/script></body></html>`);
  w.document.close();
}

async function waCopyEmbed(calc) {
  const src = new URL(`widget.html?calc=${encodeURIComponent(calc.id)}`, document.baseURI).href;
  const code = `<iframe title="${waEscape(calc.title)} — Wealth Arrays" src="${src}" width="100%" height="620" loading="lazy" style="border:0;border-radius:16px;max-width:900px"></iframe>`;
  try {
    await navigator.clipboard.writeText(code);
    alert("Embed code copied.");
  } catch (e) {
    prompt("Copy this embed code:", code);
  }
}

function buildComparePanel(containerId, calc, currentValues, currentResults) {
  const panel = document.getElementById(`${containerId}-compare-panel`);
  if (!panel) return;
  const example = calc.article?.exampleInputs;
  if (!example) {
    panel.innerHTML = `<div style="padding:14px;color:var(--text-soft)">This calculator has no reference scenario yet.</div>`;
    return;
  }
  let exampleResults = [];
  try { exampleResults = calc.compute(example) || []; } catch (e) {}
  const mapCurrent = Object.fromEntries(currentResults.map(r => [r.label, r]));
  const mapExample = Object.fromEntries(exampleResults.map(r => [r.label, r]));
  const labels = [...new Set([...Object.keys(mapCurrent), ...Object.keys(mapExample)])];
  const rows = labels.map(label => {
    const a = mapCurrent[label], b = mapExample[label];
    return `<tr><td>${waEscape(label)}</td><td>${a ? waEscape(waPlainValue(a.value,a.format)) : "—"}</td><td>${b ? waEscape(waPlainValue(b.value,b.format)) : "—"}</td></tr>`;
  }).join("");
  const inputText = calc.fields.map(f => `${f.label}: ${currentValues[f.id]}`).join(" • ");
  panel.innerHTML = `<div style="padding:14px 14px 0;color:var(--text-soft);font-size:.8rem">Your inputs are compared with this tool's worked-example assumptions.</div>
    <div style="padding:0 14px 12px;color:var(--text-soft);font-size:.8rem">${waEscape(inputText)}</div>
    <table><thead><tr><th>Metric</th><th>Your scenario</th><th>Example scenario</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function mountCalculator(calc, containerId) {
  const container = document.getElementById(containerId);
  if (!container || !calc) return;

  const fieldsHtml = calc.fields.map(f => {
    if (f.type === "select") {
      const opts = f.options.map(o => `<option value="${waEscape(o.value)}">${waEscape(o.label)}</option>`).join("");
      return `<div class="field"><label for="f-${waEscape(f.id)}">${waEscape(f.label)}</label>
        <select id="f-${waEscape(f.id)}" data-field="${waEscape(f.id)}">${opts}</select></div>`;
    }
    return `<div class="field"><label for="f-${waEscape(f.id)}">${waEscape(f.label)}${f.suffix ? ` <span class="hint">(${waEscape(f.suffix)})</span>` : ""}</label>
      <input id="f-${waEscape(f.id)}" data-field="${waEscape(f.id)}" type="number" inputmode="decimal" value="${waEscape(f.default)}"
      ${f.min !== undefined ? `min="${f.min}"` : ""} ${f.max !== undefined ? `max="${f.max}"` : ""} ${f.step !== undefined ? `step="${f.step}"` : ""} /></div>`;
  }).join("");

  container.innerHTML = `
    <div class="calc-widget-body">
      <div class="calc-grid">${fieldsHtml}</div>
      <div class="calc-result" id="${containerId}-result" aria-live="polite"></div>
      <div class="tool-actions" aria-label="Calculator actions">
        <button type="button" class="tool-action primary" id="${containerId}-share">Share</button>
        <button type="button" class="tool-action" id="${containerId}-export">Export report</button>
        <button type="button" class="tool-action" id="${containerId}-embed">Copy embed</button>
        <button type="button" class="tool-action" id="${containerId}-compare" aria-expanded="false">Compare</button>
      </div>
      <div class="compare-panel" id="${containerId}-compare-panel" hidden></div>
      <p class="calc-note">Estimates only, for planning purposes — not financial, tax, or investment advice.</p>
    </div>
  `;

  function currentValues() {
    const values = {};
    calc.fields.forEach(f => {
      const el = document.getElementById(`f-${f.id}`);
      values[f.id] = f.type === "select" ? el.value : Number.isFinite(parseFloat(el.value)) ? parseFloat(el.value) : 0;
    });
    return values;
  }
  let latest = [];
  let latestValues = {};

  function recompute() {
    latestValues = currentValues();
    try { latest = calc.compute(latestValues) || []; } catch (e) { latest = []; }
    const resultEl = document.getElementById(`${containerId}-result`);
    resultEl.innerHTML = latest.map(r => `
      <div class="calc-result-row">
        <span class="calc-result-label">${waEscape(r.label)}</span>
        <span class="calc-result-value ${waEscape(r.emphasis || "")}">${waEscape(waFormatValue(r.value, r.format))}</span>
      </div>`).join("");
    const sr = document.getElementById(`${containerId}-share`);
    if (sr) sr.dataset.ready = "1";
  }

  calc.fields.forEach(f => {
    const el = document.getElementById(`f-${f.id}`);
    if (f.type === "select") el.value = f.default;
    el.addEventListener("input", recompute, { passive: true });
    el.addEventListener("change", recompute, { passive: true });
  });

  document.getElementById(`${containerId}-share`)?.addEventListener("click", async () => {
    const url = location.href;
    const text = `${calc.title}: ${latest.map(r => `${r.label} ${waFormatValue(r.value,r.format)}`).join(" • ")}`;
    await waShare(calc.title, text, url);
  });
  document.getElementById(`${containerId}-export`)?.addEventListener("click", () => waOpenPrintReport(calc, latestValues, latest));
  document.getElementById(`${containerId}-embed`)?.addEventListener("click", () => waCopyEmbed(calc));
  document.getElementById(`${containerId}-compare`)?.addEventListener("click", (e) => {
    const p = document.getElementById(`${containerId}-compare-panel`);
    p.hidden = !p.hidden;
    e.currentTarget.setAttribute("aria-expanded", String(!p.hidden));
    if (!p.hidden) buildComparePanel(containerId, calc, latestValues, latest);
  });

  initMasthead(recompute);
  recompute();
}

function initSearch(inputId, listSelector, headingId, totalLabel) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    const items = document.querySelectorAll(listSelector);
    let visible = 0;
    items.forEach(el => {
      const match = (el.dataset.search || "").includes(q);
      el.hidden = !match;
      if (match) visible++;
    });
    const heading = document.getElementById(headingId);
    if (heading) heading.textContent = q ? `${visible} RESULT${visible === 1 ? "" : "S"} FOR "${q.toUpperCase()}"` : totalLabel;
    const noResults = document.getElementById("no-results");
    if (noResults) noResults.hidden = visible !== 0;
  });
}
