import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { CALCULATORS } = require('../calculators.js');
const root = process.cwd();
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[ch]));
const slugify = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

let created = 0;
for (const calc of CALCULATORS) {
  if (!calc?.id || !calc?.slug || !calc?.title) continue;
  const dir = path.join(root, calc.slug);
  const file = path.join(dir, 'index.html');
  if (fs.existsSync(file)) continue;

  const title = escapeHtml(calc.title);
  const desc = escapeHtml(calc.desc || calc.short || `Estimate results with the free ${calc.title}.`);
  const url = `https://wealtharrays.com/${calc.slug}/`;
  const formula = escapeHtml(calc.article?.formula || calc.desc || calc.short || 'Enter your assumptions to estimate the result.');
  const example = calc.article?.exampleInputs || {};
  const exampleText = Object.entries(example).map(([key, value]) => {
    const field = (calc.fields || []).find(item => item.id === key);
    return `${escapeHtml(field?.label || key)}: ${escapeHtml(value)}`;
  }).join('; ');
  const faqs = (calc.article?.faqs || []).map(item =>
    `<details class="faq-item"><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`
  ).join('');
  const category = escapeHtml(calc.category || 'finance');
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: calc.title,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    isAccessibleForFree: true,
    description: calc.desc || calc.short || '',
    url
  }).replace(/</g, '\\u003c');
  const html = `<!doctype html>
<html data-wa-calculator="${escapeHtml(calc.id)}" lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#f7f8fb">
<meta name="robots" content="index,follow">
<title>${title} — Free Online Calculator | Wealth Arrays</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title} — Wealth Arrays">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${title} — Wealth Arrays">
<meta name="twitter:description" content="${desc}">
<script type="application/ld+json">${jsonLd}</script>
<link rel="preload" as="style" href="/styles.css">
<link rel="stylesheet" href="/styles.css">
<link rel="stylesheet" href="/phase3-seo.css?v=20260915-1">
<link rel="stylesheet" href="/cls-fixes.css?v=20260917">
<link rel="stylesheet" href="/phase4-premium.css?v=20260915-1">
<script src="/theme-init.js?v=20260915-1"></script>
</head>
<body>
<a class="wa-skip-link" href="#main-content">Skip to main content</a>
<header class="masthead"><div class="masthead-inner">
<a href="/" class="wordmark" aria-label="Wealth Arrays">Wealth Arrays</a>
<nav class="site-nav" aria-label="Primary"><a href="/">Home</a><a href="/tools">Calculators</a><a href="/advanced-finance-tools/">Advanced tools</a><a href="/articles">Guides</a><a href="/faq">FAQ</a><a href="/about">About</a></nav>
<div class="masthead-controls"><label class="control"><span>Currency</span><select id="currency-select" aria-label="Currency"></select></label><button id="theme-toggle" class="theme-toggle" type="button"><span data-theme-label>Dark mode</span> ◐</button></div>
</div></header>
<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true"> / </span><a href="/tools">Calculators</a><span aria-hidden="true"> / </span><span>${title}</span></nav>
<main id="main-content"><div class="calc-page">
<a class="calc-back" href="/tools">← All calculators</a>
<span class="calc-category-tag">${categoryLabel} calculator</span>
<h1 class="calc-title">${title}</h1>
<p class="calc-desc">${desc}</p>
<div class="calc-body"><div class="calc-main"><div id="calc-widget"></div></div>
<aside class="calc-sidebar"><div class="tool-info"><div class="related-heading">Tool info</div><div class="tool-info-row"><span>Category</span><span>${categoryLabel}</span></div><div class="tool-info-row"><span>Access</span><span>Free — no sign-up</span></div><div class="tool-info-row"><span>Runs</span><span>In your browser</span></div></div><div class="related-tools"><div class="related-heading">Explore more</div><a class="related-link" href="/tools">All calculators</a><a class="related-link" href="/methodology">Calculator methodology</a></div></aside></div>
<article class="tool-article">
<h2>What this calculator does</h2><p>${desc} Change the assumptions to compare outcomes. The result is an estimate based on the inputs you provide, not a promise or personalised financial recommendation.</p>
<h2>How the calculation works</h2><p>${formula}</p>
${exampleText ? `<h2>Example inputs</h2><p>One illustrative set of inputs is: ${exampleText}. Use your own figures for a more relevant estimate.</p>` : ''}
${faqs ? `<h2>Frequently asked questions</h2>${faqs}` : ''}
<h2>Important assumptions and limitations</h2><p>This tool models the formula and assumptions described above. Actual outcomes can differ because of fees, taxes, eligibility rules, contribution timing, rate changes and individual circumstances. Check current official guidance or your provider's terms before making a financial decision.</p>
<p class="muted-note">For more context, read our <a href="/methodology">calculator methodology</a> and <a href="/articles">money guides</a>. Results are educational estimates, not financial, tax, legal or investment advice.</p>
</article></div></main>
<footer class="site-footer premium-footer"><div class="site-footer-inner"><div class="footer-brand-row"><a class="footer-logo" href="/" aria-label="Wealth Arrays"><img src="/favicon-v2.svg" alt="" width="44" height="44"><span><b>Wealth Arrays</b><small>Financial tools that make numbers clearer.</small></span></a><p class="footer-brand-copy">Free calculators with clear assumptions. Results are educational estimates and not financial, tax, legal or investment advice.</p></div><nav class="footer-nav-box" aria-label="Company and legal pages"><a class="footer-link" href="/privacy">Privacy Policy</a><a class="footer-link" href="/terms">Terms</a><a class="footer-link" href="/disclaimer">Disclaimer</a><a class="footer-link" href="/contact">Contact</a><a class="footer-link" href="/methodology">Methodology</a><a class="footer-link" href="/faq">FAQ</a></nav><div class="footer-bottom"><span>© 2026 Wealth Arrays</span><span>Questions or corrections: <a href="mailto:goyalalok565@gmail.com">goyalalok565@gmail.com</a></span></div></div></footer>
</body></html>`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, html, 'utf8');
  created++;
}
console.log(`Calculator page generation PASS: ${created} missing route pages created; existing pages preserved.`);
