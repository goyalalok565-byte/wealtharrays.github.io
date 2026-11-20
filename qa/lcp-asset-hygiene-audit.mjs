import fs from 'node:fs';
const file = 'articles/compound-interest-guide.html';
const html = fs.readFileSync(file, 'utf8');
const preload = html.match(/<link\\b(?=[^>]*\\brel=["']preload["'])(?=[^>]*\\bas=["']style["'])[^>]*\\bhref=["']([^"']*styles\\.css[^"']*)["'][^>]*>/i);
const stylesheet = [...html.matchAll(/<link\\b(?=[^>]*\\brel=["']stylesheet["'])[^>]*\\bhref=["']([^"']*styles\\.css[^"']*)["'][^>]*>/gi)].map(match => match[1]);
if (!preload) throw new Error('Compound-interest article must preload its root stylesheet.');
if (!stylesheet.length) throw new Error('Compound-interest article must include a stylesheet link.');
if (stylesheet.some(href => href !== preload[1])) throw new Error('Compound-interest article stylesheet URL must reuse the exact preloaded URL to avoid duplicate transfer.');
console.log('LCP asset hygiene PASS: compound-interest article reuses the exact preloaded stylesheet URL.');
