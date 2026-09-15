/* Wealth Arrays UX enhancements — live calculation/PDF hardening + growth discovery. */
(function () {
  'use strict';
  function liveCalculator() {
    let timer = 0;
    const isControl = function (target) { return target && target.matches && target.matches('#calc-widget input,#calc-widget select,#calc-widget textarea'); };
    const trigger = function () {
      const root = document.getElementById('calc-widget');
      if (!root) return;
      const button = Array.from(root.querySelectorAll('button')).find(function (item) { return /^(calculate|recalculate|update|compute|show result|calculate now)/i.test((item.textContent || '').trim()) || item.dataset.action === 'calculate'; });
      if (button && !button.disabled) button.click();
    };
    const schedule = function () { clearTimeout(timer); timer = setTimeout(trigger, 40); };
    document.addEventListener('input', function (event) { if (isControl(event.target)) schedule(); }, true);
    document.addEventListener('change', function (event) { if (isControl(event.target)) schedule(); }, true);
    [250,700,1400].forEach(function (delay) { setTimeout(trigger, delay); });
  }
  function patchPdfLogo() {
    if (window.waPdfLogoPatched || typeof window.waOpenPrintReport !== 'function') return;
    window.waPdfLogoPatched = true;
    const original = window.waOpenPrintReport;
    const logo = 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgcng9IjMwIiBmaWxsPSIjMEIxMjIwIi8+PHBhdGggZD0iTTIxIDY2IDQ2IDQ3IDY4IDU0IDEwMyAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjBBNUZBIiBzdHJva2Utd2lkdGg9IjkiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yNSA5MlY3ME01MiA5MlY1NU03OSA5MlYzOSIgc3Ryb2tlPSIjRUFGMkZGIiBzdHJva2Utd2lkdGg9IjEwIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=';
    window.waOpenPrintReport = function (calc, values, results) {
      const oldOpen = window.open;
      window.open = function () {
        const win = oldOpen.apply(window, arguments);
        if (win && win.document) {
          const oldWrite = win.document.write.bind(win.document);
          win.document.write = function (html) {
            const brand = '<div class="pdf-brand"><img alt="Wealth Arrays logo" src="data:image/svg+xml;base64,' + logo + '"><span>WEALTH ARRAYS</span></div>';
            html = String(html).replace('<div class="brand">WEALTH ARRAYS · CALCULATION REPORT</div>', brand);
            html = html.replace('</style>', '.pdf-brand{display:flex;align-items:center;gap:10px;margin-bottom:14px;font-weight:800;letter-spacing:.08em;color:#475467}.pdf-brand img{width:42px;height:42px;display:block}</style>');
            oldWrite(html);
          };
        }
        return win;
      };
      try { return original(calc, values, results); } finally { setTimeout(function () { window.open = oldOpen; }, 0); }
    };
  }
  function enhanceToolLibrary() {
    if (!document.querySelector('.tools-grid') || document.querySelector('[data-wa-growth-tools]')) return;
    const grid = document.querySelector('.tools-grid');
    const tools = [
      ['21 / INVEST', 'Step-Up SIP Calculator', 'Increase your monthly investment each year.', '/step-up-sip-calculator.html', 'step up sip annual increase investment recurring'],
      ['22 / PLANNING', 'Emergency Fund Calculator', 'Set a cash-reserve target from essential expenses.', '/emergency-fund-calculator.html', 'emergency fund cash reserve savings months'],
      ['23 / INVEST', 'Real Return Calculator', 'See investment returns after inflation.', '/real-return-calculator.html', 'real return inflation purchasing power investment']
    ];
    tools.forEach(function (tool) {
      const a = document.createElement('a');
      a.className = 'tool-card'; a.href = tool[3]; a.dataset.search = tool[4]; a.dataset.waGrowthTools = 'true';
      a.innerHTML = '<div class="tool-num" aria-hidden="true">' + tool[0] + '</div><h2>' + tool[1] + '</h2><p>' + tool[2] + '</p><span>Open →</span>';
      grid.appendChild(a);
    });
    const heading = document.querySelector('.tools-head h1');
    if (heading) heading.innerHTML = '23 calculators for<br><span class="gradient-text">real money decisions.</span>';
    const note = document.querySelector('.hub-note');
    if (note) note.innerHTML = '<strong>Build status:</strong> 23 calculators are live, including new Step-Up SIP, Emergency Fund and Real Return tools. Every tool is designed around transparent assumptions, browser-first calculation and practical cross-links.';
  }
  function start() { liveCalculator(); patchPdfLogo(); enhanceToolLibrary(); setTimeout(patchPdfLogo, 300); setTimeout(patchPdfLogo, 900); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();