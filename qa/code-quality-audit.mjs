import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const sourceFiles = [
  'calculators.js','widget.js','wa-core.js','calculator-runtime.js','site-runtime.js',
  'final-polish.js','wa-enhancements.js','theme-fix.js','phase2-intelligence.js',
  'phase2-retirement.js','phase3-seo.js','calculator-page-init.js','phase4-premium.js',
  'theme-init.js','404-runtime.js'
];

for (const file of sourceFiles) if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing source: ${file}`);

const js = sourceFiles.map(file => ({ file, text: fs.readFileSync(path.join(root, file), 'utf8') }));
const normalize = text => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '').replace(/\s+/g, ' ').trim();

const hashes = new Map();
for (const { file, text } of js) {
  const hash = crypto.createHash('sha256').update(normalize(text)).digest('hex');
  if (hashes.has(hash)) throw new Error(`Duplicate source module content: ${file} duplicates ${hashes.get(hash)}`);
  hashes.set(hash, file);
}

const bundle = fs.readFileSync('wa-calculator-runtime.js', 'utf8');
for (const { file, text } of js.slice(0, 13)) {
  const hash = crypto.createHash('sha256').update(text.replace(/\r\n/g, '\n').trimEnd()).digest('hex').slice(0, 12);
  if (!bundle.includes(`WA CANONICAL MODULE: ${file} | sha256:${hash}`)) throw new Error(`Canonical bundle provenance missing/stale for ${file}`);
}

// Scope direct-runtime checks to pages that actually declare the canonical calculator runtime.
// This avoids false positives from standalone informational pages that intentionally use other site runtimes.
const pages = fs.readdirSync(root)
  .filter(f => f.endsWith('.html'))
  .filter(f => fs.readFileSync(f, 'utf8').includes('wa-calculator-runtime.js'));
if (pages.length !== 20) throw new Error(`Expected 20 calculator runtime pages, found ${pages.length}`);

const forbidden = sourceFiles.slice(0, 13);
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  for (const file of forbidden) {
    const direct = new RegExp(`<script\\s+src=["'][^"']*${file.replace('.', '\\.')}[^"']*["']`, 'i');
    if (direct.test(html)) throw new Error(`${page}: direct legacy calculator runtime dependency ${file}`);
  }
}

const stat = fs.statSync('wa-calculator-runtime.js');
if (stat.size > 750_000) throw new Error(`Canonical runtime is ${stat.size} bytes; 750 KB budget exceeded`);
if (fs.existsSync('node_modules')) throw new Error('node_modules must not exist in deployable tree');

console.log(`Code-quality audit PASS — ${sourceFiles.length} source modules are unique, canonical provenance is fresh, all 20 calculator runtime pages are isolated from legacy direct dependencies, and deploy-tree hygiene is clean.`);
