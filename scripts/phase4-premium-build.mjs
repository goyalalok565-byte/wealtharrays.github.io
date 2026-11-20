import fs from 'node:fs';
import path from 'node:path';

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
  const canonicalId=calcIds[rel] || calcIds[base];
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
  const hasAdSlot=/<ins\\b(?=[^>]*\\bclass=["'][^"']*\\badsbygoogle\\b)(?=[^>]*\\bdata-ad-slot=["'][^"']+["'])[^>]*>/i.test(s);
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
  s=s.replace(staticAdScript,'');
  s=s.replace(adLoaderScript,'');
  if(!hasAdSlot) {
    // Do not preconnect to ad networks on pages that have no ad placement.
    s=s.replace(/<link\\b(?=[^>]*\\brel=["']preconnect["'])(?=[^>]*\\bhref=["']https:\\/\\/(?:pagead2\\.googlesyndication\\.com|googleads\\.g\\.doubleclick\\.net)(?:\\/|["']))[^>]*>/gi,'');
  }
  if(!adsenseExcluded) s=s.replace('</head>',adsenseJs+'</head>');
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
