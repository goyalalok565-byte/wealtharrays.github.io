/* Wealth Arrays visual runtime — cards and scale-safe chart fallback only. */
(function () {
  'use strict';
  function resultRows() {
    return Array.from(document.querySelectorAll('.calc-result-row')).map(function (row) {
      const text = row.querySelector('.calc-result-value')?.textContent || '';
      return { label: row.querySelector('.calc-result-label')?.textContent?.trim() || '', text: text.trim(), value: Number(text.replace(/[^0-9.eE+-]/g, '')) };
    }).filter(function (row) { return row.label && Number.isFinite(row.value) && row.value >= 0; });
  }
  function safePie(host) {
    if (host.dataset.waSafePie === '1') return;
    const rows = resultRows();
    const find = function (regex) { return rows.find(function (row) { return regex.test(row.label); }); };
    let principal = find(/money invested|invested amount|principal|original investment|loan amount|original amount/i);
    let gain = find(/growth|returns|profit|interest earned|total interest/i);
    if (!principal || !gain) {
      const total = find(/future value|maturity value|total amount|final value|total repayment|estimated corpus/i);
      const interest = find(/interest earned|growth|returns|total interest|profit/i);
      if (total && interest && total.value >= interest.value) { gain = interest; principal = { label: 'Original amount', text: String(total.value - interest.value), value: total.value - interest.value }; }
    }
    if (!principal || !gain || principal.value + gain.value <= 0) return;
    const parts = [principal, gain];
    const total = parts[0].value + parts[1].value;
    let angle = -90, arcs = '', legend = '';
    const colors = ['#0F766E', '#2563EB'];
    const point = function (degrees, radius) { const radians = degrees * Math.PI / 180; return [50 + radius * Math.cos(radians), 50 + radius * Math.sin(radians)]; };
    const path = function (start, end) { const p1 = point(start, 42), p2 = point(end, 42), large = end - start > 180 ? 1 : 0; return 'M 50 50 L ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2) + ' A 42 42 0 ' + large + ' 1 ' + p2[0].toFixed(2) + ' ' + p2[1].toFixed(2) + ' Z'; };
    parts.forEach(function (part, index) {
      const percent = part.value / total * 100, end = angle + percent * 3.6, mid = (angle + end) / 2, lp = point(mid, 25);
      arcs += '<path d="' + path(angle, end) + '" fill="' + colors[index] + '"></path>';
      if (percent >= 7) arcs += '<text x="' + lp[0].toFixed(2) + '" y="' + (lp[1] + 2).toFixed(2) + '" text-anchor="middle" fill="#fff" font-size="7" font-weight="800">' + (percent < 10 ? percent.toFixed(1) : percent.toFixed(0)) + '%</text>';
      legend += '<div class="wa-pie-row"><i style="background:' + colors[index] + '"></i><span>' + part.label + '</span><b>' + part.text + ' · ' + (percent < 10 ? percent.toFixed(1) : percent.toFixed(0)) + '%</b></div>';
      angle = end;
    });
    host.innerHTML = '<div class="wa-scale-safe"><div class="wa-scale-safe-head"><span>RESULT BREAKDOWN</span><h3>Scale-safe visual</h3><p>Large values are normalised before drawing the chart.</p></div><div class="wa-pie-wrap"><svg viewBox="0 0 100 100" role="img" aria-label="Result breakdown">' + arcs + '<circle cx="50" cy="50" r="14" fill="var(--surface,#fff)"></circle><text x="50" y="51" text-anchor="middle" font-size="9" font-weight="900" fill="currentColor">100%</text></svg><div>' + legend + '</div></div></div>';
    host.dataset.waSafePie = '1';
  }
  function graphGuard() {
    const signature = resultRows().map(function (row) { return row.label + '=' + row.value; }).join('|');
    document.querySelectorAll('[id$="-graph"]').forEach(function (host) {
      if (host.dataset.waGraphSig !== signature) { host.dataset.waGraphSig = signature; delete host.dataset.waSafePie; }
      if (host.dataset.waSafePie === '1') return;
      const svg = host.querySelector('svg');
      if (svg) { const rect = svg.getBoundingClientRect(); if (rect.width >= 20 && rect.height >= 20 && !/NaN|Infinity|-Infinity/.test(svg.outerHTML)) return; }
      safePie(host);
    });
  }
  function styles() {
    if (document.getElementById('wa-visual-runtime-css')) return;
    const style = document.createElement('style');
    style.id = 'wa-visual-runtime-css';
    style.textContent = '.tool-card[data-wa-category],.home-tool-card[data-wa-category],.ledger-row[data-wa-category]{position:relative!important;box-sizing:border-box!important;background:var(--surface)!important;border:1px solid var(--line)!important;border-top:4px solid var(--wa-card-accent)!important;border-radius:18px!important;box-shadow:0 6px 20px rgba(16,24,40,.06)!important;overflow:hidden}.wa-scale-safe{margin-top:14px;border:1px solid var(--line);border-radius:15px;padding:16px;background:var(--surface2)}.wa-scale-safe-head span{font-size:9px;letter-spacing:.14em;color:var(--accent);font-weight:850}.wa-scale-safe-head h3{margin:3px 0;font-size:15px}.wa-scale-safe-head p{margin:0 0 12px;color:var(--muted);font-size:10px}.wa-pie-wrap{display:grid;grid-template-columns:160px 1fr;gap:18px;align-items:center}.wa-pie-wrap svg{width:160px;height:160px;display:block}.wa-pie-row{display:grid;grid-template-columns:10px 1fr auto;gap:7px;align-items:center;padding:8px 0;border-top:1px solid var(--line);font-size:10px}.wa-pie-row i{width:9px;height:9px;border-radius:50%;display:block}@media(max-width:600px){.wa-pie-wrap{grid-template-columns:1fr}.wa-pie-wrap svg{margin:auto}}';
    document.head.appendChild(style);
  }
  function init() { styles(); graphGuard(); setInterval(graphGuard, 800); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
