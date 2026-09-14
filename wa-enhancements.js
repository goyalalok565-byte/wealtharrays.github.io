/* Wealth Arrays UX enhancements — install banner + live calculation/PDF hardening. */
(function () {
  'use strict';
  function installed() { return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true || document.referrer.indexOf('android-app://') === 0; }
  function installBanner() {
    if (installed() || document.getElementById('wa-install-banner')) return;
    let deferred = null;
    const box = document.createElement('aside');
    box.id = 'wa-install-banner';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Install Wealth Arrays');
    box.innerHTML = '<div class="wa-install-copy"><span class="wa-install-icon">WA</span><span><strong>Install Wealth Arrays</strong><small>Keep your finance tools one tap away.</small></span></div><div class="wa-install-actions"><button type="button" class="wa-install-btn" disabled>Install App</button><button type="button" class="wa-install-close" aria-label="Dismiss install message">×</button></div>';
    const style = document.createElement('style');
    style.id = 'wa-install-css';
    style.textContent = '#wa-install-banner{position:fixed;z-index:100000;top:12px;left:max(12px,env(safe-area-inset-left));right:max(12px,env(safe-area-inset-right));margin:auto;width:min(620px,calc(100% - 24px));padding:10px 11px;border:1px solid var(--line,#e2e6ed);border-radius:15px;background:var(--surface,#fff);color:var(--text,#10141b);box-shadow:0 14px 42px rgba(0,0,0,.18);display:flex;align-items:center;justify-content:space-between;gap:12px;font:500 13px/1.3 system-ui,sans-serif}.wa-install-copy{display:flex;align-items:center;gap:10px;min-width:0}.wa-install-copy>span:last-child{display:grid;gap:2px}.wa-install-copy strong{font-size:12px}.wa-install-copy small{font-size:10px;color:var(--muted,#667085)}.wa-install-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:9px;background:var(--text,#10141b);color:var(--bg,#fff);font-size:9px;font-weight:900;flex:none}.wa-install-actions{display:flex;align-items:center;gap:6px;flex:none}.wa-install-btn,.wa-install-close{font:750 11px/1 system-ui,sans-serif;cursor:pointer}.wa-install-btn{border:1px solid var(--text,#10141b);border-radius:9px;padding:9px 11px;background:var(--text,#10141b);color:var(--bg,#fff)}.wa-install-btn:disabled{opacity:.5;cursor:default}.wa-install-close{width:31px;height:31px;border:1px solid var(--line,#e2e6ed);border-radius:9px;background:transparent;color:var(--muted,#667085);font-size:20px;padding:0}#wa-install-banner.wa-install-hide{transform:translateY(calc(-100% - 24px));opacity:0;pointer-events:none;transition:transform .28s ease,opacity .22s ease}html[data-theme="dark"] .wa-install-btn{background:#fff;color:#080a0f;border-color:#fff}html[data-theme="dark"] .wa-install-icon{background:#fff;color:#080a0f}@media(max-width:520px){#wa-install-banner{top:8px;padding:9px}.wa-install-copy small{display:none}.wa-install-btn{padding:9px 10px}}';
    document.head.appendChild(style);
    document.body.appendChild(box);
    const button = box.querySelector('.wa-install-btn');
    const hide = function () { box.classList.add('wa-install-hide'); setTimeout(function () { box.remove(); style.remove(); }, 320); };
    box.querySelector('.wa-install-close').addEventListener('click', hide);
    window.addEventListener('beforeinstallprompt', function (event) { event.preventDefault(); deferred = event; button.disabled = false; }, { once: true });
    button.addEventListener('click', async function () { if (!deferred) return; const promptEvent = deferred; deferred = null; button.disabled = true; try { await promptEvent.prompt(); } catch (e) {} hide(); });
    window.addEventListener('appinstalled', hide, { once: true });
  }
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
  function start() { installBanner(); liveCalculator(); patchPdfLogo(); setTimeout(patchPdfLogo, 300); setTimeout(patchPdfLogo, 900); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
