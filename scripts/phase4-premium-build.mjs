import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { CALCULATORS } = require('../calculators.js');
const calculatorsByRoute = new Map(CALCULATORS.map(calc => [calc.slug + '/index.html', calc]));
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => { switch (ch) { case '&': return '&amp;'; case '<': return '&lt;'; case '>': return '&gt;'; case '"': return '&quot;'; default: return '&#39;'; } });
function renderStaticShell(calc) {
  const fields = calc.fields.map(field => {
    const id = `wa-static-${calc.id}-${field.id}`;
    const label = escapeHtml(field.label);
    if (field.type === 'select') {
      const options = (field.options || []).map(option => `<option value=\"${escapeHtml(option.value)}\">${escapeHtml(option.label)}</option>`).join('');
      return `<div class=\"field\"><label for=\"${id}\">${label}</label><select id=\"${id}\"><option value=\"\">Choose ${label}</option>${options}</select></div>`;
    }
    const attrs = [typeof field.min === 'number' ? `min=\"${field.min}\"` : '', typeof field.max === 'number' ? `max=\"${field.max}\"` : '', typeof field.step === 'number' ? `step=\"${field.step}\"` : ''].filter(Boolean).join(' ');
    return `<div class=\"field\"><label for=\"${id}\">${label}${field.suffix ? ` <span class=\"hint\">(${escapeHtml(field.suffix)})</span>` : ''}</label><input id=\"${id}\" type=\"number\" inputmode=\"decimal\" placeholder=\"Enter ${label.toLowerCase()}\" ${attrs}></div>`;
  }).join('');
  return `<!-- WA-STATIC-CALC-SHELL-START --><div class=\"calc-widget-shell\" data-wa-static-shell=\"true\" aria-label=\"${escapeHtml(calc.title)} calculator static form\" style=\"min-height:520px\"><p class=\"wa-static-shell-note\">Calculator fields are shown below. Enable JavaScript to calculate results.</p><div class=\"calc-grid\">${fields}</div><button type=\"button\" disabled aria-disabled=\"true\">Calculate result</button><div class=\"calc-result\" aria-live=\"polite\">Results appear here when the calculator is available.</div><div class=\"wa-portfolio-card\" data-wa-chart-placeholder=\"true\" aria-label=\"Chart placeholder\" style=\"min-height:220px;display:grid;place-items:center\">Chart preview</div></div><!-- WA-STATIC-CALC-SHELL-END -->`;
}

const root = process.cwd();
const htmlFiles = [];
function walk(dir){
  for(const name of fs.readdirSync(dir)){
    if(name.startsWith('.') || name === 'node_modules' || name === 'dist') continue;
    const full=path.join(dir,name), st=fs.statSync(full);
    if(st.isDirectory()) walk(full);
    else if(name.endsWith('.html')) htmlFiles.push(full);
  }
}
walk(root);

const phase4Css='<link rel="stylesheet" href="/phase4-premium.css?v=20260915-1">';
const themeJs='<script src="/theme-init.js?v=20260915-1"></script>';
const redirectJs='<script src="/404-runtime.js?v=20260915-1" defer></script>';
const adsenseJs='<script src="/wa-ad-loader.js" defer></script>';
const consentJs='<script data-cfasync="false" src="/consent-loader.js" defer></script>';
const calcIds={
 'sip-calculator/index.html':'sip', 'compound-interest-calculator/index.html':'compound-interest', 'mortgage-emi-calculator/index.html':'mortgage', 'roi-calculator/index.html':'roi', 'simple-interest-calculator/index.html':'simple-interest', 'retirement-calculator/index.html':'freedom-milestone', 'salary-to-hourly-calculator/index.html':'salary-hourly', 'profit-margin-calculator/index.html':'profit-margin', 'fixed-deposit-calculator/index.html':'fixed-deposit', 'recurring-deposit-calculator/index.html':'recurring-deposit', 'lumpsum-calculator/index.html':'lumpsum', 'cagr-calculator/index.html':'cagr', 'car-loan-calculator/index.html':'car-loan', 'personal-loan-calculator/index.html':'personal-loan', 'debt-payoff-calculator/index.html':'debt-payoff', 'inflation-calculator/index.html':'inflation', 'net-worth-calculator/index.html':'net-worth', 'overtime-pay-calculator/index.html':'overtime', 'freelance-rate-calculator/index.html':'freelance-rate', 'income-tax-scenario-calculator/index.html':'income-tax-planner'
 };
let changed=0;
for(const file of htmlFiles){
  let s=fs.readFileSync(file,'utf8');
  const before=s;
  // The calculator host must carry the class used by its layout, styling and CLS reservation
  // before the deferred calculator runtime mounts. Adding it only after mount creates a large
  // layout shift and leaves the calculator surface unstyled during initial rendering.
  s=s.replace(/<div\b[^>]*\bid=["']calc-widget["'][^>]*>/gi, (tag) => {
    const classAttr = tag.match(/\bclass=(["'])(.*?)\1/i);
    if (classAttr) {
      if (/(?:^|\s)calc-widget(?:\s|$)/.test(classAttr[2])) return tag;
      return tag.replace(classAttr[0], `class=${classAttr[1]}${classAttr[2]} calc-widget${classAttr[1]}`);
    }
    return tag.replace(/>$/, ' class="calc-widget">');
  });
  s=s.replace(/<script>[^<]*(?:document\.documentElement\.dataset\.theme|localStorage\.(?:waTheme|getItem\(['"]waTheme['"]\)))[^<]*<\/script>/gi, '');
  if(!s.includes('/theme-init.js')) s=s.replace('</head>',`${themeJs}</head>`);
  // Replace every inline calculator bootstrap, including legacy formatting variants.
  const mountId=(s.match(/mountCalculator\(\s*CALCULATORS\.find\(\s*c\s*=>\s*c\.id\s*===\s*['"]([^'"]+)['"]/i)||[])[1];
  if(mountId) s=s.replace(/<script>[^<]*mountCalculator\([^<]*<\/script>/gi,'');
  const base=path.basename(file);
  const rel=path.relative(root,file).replaceAll(path.sep,'/');
  const routeName=rel==='widget/index.html'?'widget/index.html':rel;
  const calc = calculatorsByRoute.get(rel);
  const canonicalId=calc?.id || calcIds[rel] || calcIds[base];
  const id=canonicalId||mountId;
  if(canonicalId && base!=='widget.html'){
    s=s.replace(/<html\s+data-wa-calculator="[^"]*"/i,'<html');
    s=s.replace(/<html\s+/,`<html data-wa-calculator="${id}" `);
  }
  if(base==='404.html'){
    s=s.replace(/<script>\(function\(\)\{var p=location\.pathname[\s\S]*?<\/script>/,'');
    if(!s.includes('/404-runtime.js')) s=s.replace('</head>',`${redirectJs}</head>`);
  }
  s=s.replace(/<link rel="stylesheet" href="\/phase4-premium\.css[^>]*>/g,'');
  s=s.replace(/<script src="\/phase4-premium\.js[^>]*><\/script>/g,'');
  if(!s.includes('/phase4-premium.css')) s=s.replace('</head>',`${phase4Css}</head>`);
  if(!s.includes('name="referrer"')) s=s.replace('</head>',`<meta name="referrer" content="strict-origin-when-cross-origin"></head>`);
  // AdSense is intentionally excluded from 404.html and widget.html.
  // 404 is an error/low-value page; widget.html may be embedded on third-party domains.
  const noindex=/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(s);
  // Load AdSense only when this page contains a real publisher ad unit. A
  // site-wide loader on pages with no <ins class="adsbygoogle" data-ad-slot>
  // wastes mobile CPU/network and can request ads where no placement exists.
  const hasAdSlot=/<ins\b(?=[^>]*\bclass=["'][^"']*\badsbygoogle\b)(?=[^>]*\bdata-ad-slot=["'][^"']+["'])[^>]*>/i.test(s);
  const adsenseExcluded=['index.html','404.html','widget.html','widget/index.html','privacy.html','privacy-policy.html','terms.html','disclaimer.html','advertising-policy.html','contact.html','about.html','research.html','category-investment.html','category-loan.html','category-banking.html','category-retirement.html','category-salary.html','category-business.html','financial-workspace.html','goal-planner.html','scenario-lab.html','home-loan-emi-calculator/index.html','loan-emi-calculator/index.html','loan-interest-calculator/index.html'].includes(routeName) || noindex || !hasAdSlot;
  const consentExcluded=['404.html','widget.html','widget/index.html','privacy.html','privacy-policy.html','terms.html','disclaimer.html','advertising-policy.html','contact.html','about.html'].includes(routeName) || noindex;
  if(consentExcluded){
    s=s.replace(/<script[^>]+src=["']\/consent-loader\.js[^>]*><\/script>/gi,'');
  }else if(!s.includes('/consent-loader.js')) s=s.replace('</head>',consentJs+'</head>');

  const staticAdScript=/<script\b(?=[^>]*src=["']https:\/\/pagead2?\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js)[^>]*>[\s\S]*?<\/script>/gi;
  const adLoaderScript=/<script\b(?=[^>]*src=["']\/wa-ad-loader\.js(?:\?[^"']*)?["'])[^>]*>\s*<\/script>/gi;
  s=s.replace(/<script>[^]*?waSubscriptionCache[^]*?<\/script>/gi,'');
  // Normalize every page to zero or one publisher loader. A static AdSense tag
  // plus wa-ad-loader.js caused the same third-party library to be injected twice.
  // Keep the publisher verification snippet on the homepage. It is not a
  // manual ad placement: pages without an eligible <ins> slot still do not
  // receive the runtime ad loader. Other pages are normalized as before.
  if (routeName !== 'index.html') s=s.replace(staticAdScript,'');
  s=s.replace(adLoaderScript,'');
  if(!hasAdSlot) {
    // Do not preconnect to ad networks on pages that have no ad placement.
    s=s.replace(/<link\b(?=[^>]*\brel=["']preconnect["'])(?=[^>]*\bhref=["']https:\/\/(?:pagead2\.googlesyndication\.com|googleads\.g\.doubleclick\.net)(?:\/|["']))[^>]*>/gi,'');
  }
  if(!adsenseExcluded) s=s.replace('</head>',adsenseJs+'</head>');
  if(calc && s.includes('id="calc-widget"')) {
    const shell = renderStaticShell(calc);
    if (s.includes('<!-- WA-STATIC-CALC-SHELL-START -->')) {
      s = s.replace(/<!-- WA-STATIC-CALC-SHELL-START -->[\s\S]*?<!-- WA-STATIC-CALC-SHELL-END -->/g, shell);
    } else {
      s = s.replace(/(<div\b(?=[^>]*\bid=["']calc-widget["'])[^>]*>)(\s*)<\/div>/i, `$1${shell}</div>`);
    }
    // Hide the no-JS shell only during the synchronous runtime replacement. This keeps
    // its accessible fallback intact when JavaScript is disabled and avoids visible
    // child-to-child shifts while mountCalculator swaps the markup.
    const mobileReserveHeights = { sip: 2100, swp: 2370, fire: 2540, 'rent-vs-buy': 3080 };
    const mobileReserveHeight = mobileReserveHeights[calc.id];
    const reserveRule = mobileReserveHeight ? `@media (max-width: 760px) { html[data-wa-calculator="${calc.id}"] #calc-widget.calc-widget { min-height: ${mobileReserveHeight}px; } }` : '';
    const mountStabilityStyle = `<style id="wa-calculator-mount-stability">.wa-calculator-mounting #calc-widget [data-wa-static-shell="true"] { visibility: hidden; } ${reserveRule}</style>`;
    if (!s.includes('id="wa-calculator-mount-stability"')) s = s.replace('</head>', `${mountStabilityStyle}</head>`);
  }
  // Reuse the preloaded root stylesheet URL on nested article routes; otherwise the
  // same 94 KB stylesheet is downloaded twice under versioned and unversioned URLs.
  const stylesPreload = s.match(/<link\b(?=[^>]*\brel=["']preload["'])(?=[^>]*\bas=["']style["'])[^>]*\bhref=["']([^"']*styles\.css[^"']*)["'][^>]*>/i);
  if (stylesPreload) s = s.replace(/href=["'](?:\.\.\/)+styles\.css["']/gi, `href="${stylesPreload[1]}"`);
  if(id && s.includes('id="calc-widget"') && base!=='widget.html'){
    if(!s.includes('/wa-calculator-runtime.js')) s=s.replace('</body>','<script src="/wa-calculator-runtime.js" defer></script></body>');
  }
  if(s!==before){fs.writeFileSync(file,s);changed++;}
}
for(const [file] of Object.entries(calcIds)){
  if(!fs.existsSync(path.join(root,file))) continue;
  let s=fs.readFileSync(path.join(root,file),'utf8');
  if(!s.includes('/wa-calculator-runtime.js')){
    s=s.replace('</body>','<script src="/wa-calculator-runtime.js" defer></script></body>');
    fs.writeFileSync(path.join(root,file),s,'utf8');
    changed++;
  }
}

console.log(`Phase 4 premium build updated ${changed} HTML files (${htmlFiles.length} public HTML files scanned).`);
