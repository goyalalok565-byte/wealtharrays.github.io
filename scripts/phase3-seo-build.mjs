import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const calculatorDescriptions = {
  'lumpsum-calculator.html': 'Estimate the future value of a one-time investment using an assumed annual return, time period and inflation rate.',
  'cagr-calculator.html': 'Calculate compound annual growth rate (CAGR) from an initial value, final value and holding period.',
  'car-loan-calculator.html': 'Estimate monthly car-loan payments, total repayment and total interest for a fixed-rate loan term.',
  'personal-loan-calculator.html': 'Estimate personal-loan monthly payments, total repayment and total interest from the amount, rate and term.',
  'debt-payoff-calculator.html': 'Estimate how long debt may take to repay and how much interest you may pay under a fixed monthly payment.',
  'inflation-calculator.html': 'Estimate how inflation changes the future purchasing power of an amount over a selected number of years.',
  'net-worth-calculator.html': 'Calculate net worth by comparing assets and liabilities, then use the result as a financial snapshot.',
  'overtime-pay-calculator.html': 'Estimate overtime earnings from regular pay, overtime hours and the overtime multiplier you choose.'
};

function injectMeta(html, name, content) {
  const escaped = content.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const re = new RegExp(`<meta[^>]+name=["']${name}["'][^>]*>`, 'i');
  if (re.test(html)) return html;
  return html.replace(/<\/head>/i, `<meta name="${name}" content="${escaped}"></head>`);
}
function injectProperty(html, property, content) {
  const escaped = content.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const re = new RegExp(`<meta[^>]+property=["']${property}["'][^>]*>`, 'i');
  if (re.test(html)) return html;
  return html.replace(/<\/head>/i, `<meta property="${property}" content="${escaped}"></head>`);
}
function injectBreadcrumb(html, canonical, label, parentName, parentUrl) {
  if (/BreadcrumbList/i.test(html)) return html;
  const data = { '@context':'https://schema.org', '@type':'BreadcrumbList', itemListElement:[
    {'@type':'ListItem',position:1,name:'Wealth Arrays',item:'https://wealtharrays.com/'},
    {'@type':'ListItem',position:2,name:parentName,item:parentUrl},
    {'@type':'ListItem',position:3,name:label,item:canonical}
  ]};
  return html.replace(/<\/head>/i, `<script type="application/ld+json">${JSON.stringify(data)}</script></head>`);
}

const changed = [];
for (const [file, description] of Object.entries(calculatorDescriptions)) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  const original = fs.readFileSync(full, 'utf8');
  let html = original;
  html = injectMeta(html, 'description', description);
  html = injectProperty(html, 'og:description', description);
  html = injectMeta(html, 'twitter:description', description);
  if (html !== original) { fs.writeFileSync(full, html); changed.push(file); }
}

const articlesDir = path.join(root, 'articles');
if (fs.existsSync(articlesDir)) {
  for (const file of fs.readdirSync(articlesDir).filter(f => f.endsWith('.html'))) {
    const full = path.join(articlesDir, file);
    const original = fs.readFileSync(full, 'utf8');
    const canonicalMatch = original.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
    const h1Match = original.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (!canonicalMatch || !h1Match) continue;
    const canonical = canonicalMatch[1];
    const label = h1Match[1].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    let html = injectBreadcrumb(original, canonical, label, 'Guides', 'https://wealtharrays.com/articles.html');
    if (html !== original) { fs.writeFileSync(full, html); changed.push(`articles/${file}`); }
  }
}

console.log(`Phase 3 SEO build changed ${changed.length} file(s).`);
for (const f of changed) console.log(f);
