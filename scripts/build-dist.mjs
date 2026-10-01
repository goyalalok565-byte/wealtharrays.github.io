import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist');

const PUBLIC_ROOT_EXTS = new Set([
  '.html','.css','.js','.png','.jpg','.jpeg','.gif','.webp','.avif','.svg',
  '.ico','.woff','.woff2','.ttf','.eot','.xml','.txt','.webmanifest','.json'
]);
const PUBLIC_ROOT_EXACT = new Set([
  '_headers','_redirects','ads.txt','robots.txt','sitemap.xml','sw.js','manifest.webmanifest'
]);
const PUBLIC_DIRS = new Set(['articles','research']);
const EXCLUDE_DIRS = new Set([
  '.git','.github','node_modules','qa','scripts','calculator-definitions',
  'country-modules','api','p','privacy','reports','dist'
]);
const EXCLUDE_ROOT = new Set([
  'ARCHITECTURE.md','PHASE10_AUDIT.md','PHASE3_FINAL.md','QA_TESTS.md',
  'README-RELEASE.md','STABILIZATION-PLAN.md','GLOBAL-PLATFORM-SPEC.md',
  'GLOBAL-PRODUCT-ROADMAP.md','content-sources.json','CNAME'
]);

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

function copyFile(src, rel) {
  const dest = path.join(out, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}
function walkPublicDir(srcDir, relDir) {
  for (const e of fs.readdirSync(srcDir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || EXCLUDE_DIRS.has(e.name) || e.name.toLowerCase().endsWith('.md')) continue;
    const src = path.join(srcDir, e.name);
    const rel = path.join(relDir, e.name);
    if (e.isDirectory()) walkPublicDir(src, rel);
    else if (PUBLIC_ROOT_EXTS.has(path.extname(e.name).toLowerCase()) || PUBLIC_ROOT_EXACT.has(e.name)) copyFile(src, rel);
  }
}

// Root public files.
for (const e of fs.readdirSync(root, { withFileTypes: true })) {
  if (e.name.startsWith('.') || EXCLUDE_DIRS.has(e.name) || EXCLUDE_ROOT.has(e.name)) continue;
  if (e.isDirectory()) continue;
  if (PUBLIC_ROOT_EXACT.has(e.name) || PUBLIC_ROOT_EXTS.has(path.extname(e.name).toLowerCase())) {
    // JSON is intentionally limited to known browser-facing files.
    if (path.extname(e.name).toLowerCase() === '.json' && !['ai-contract.json','global-seo-config.json','calculator-value-content.json'].includes(e.name)) continue;
    copyFile(path.join(root, e.name), e.name);
  }
}

// Public content directories.
for (const dir of PUBLIC_DIRS) {
  const src = path.join(root, dir);
  if (fs.existsSync(src)) walkPublicDir(src, dir);
}

// Copy every route directory that contains an index.html, but nothing else from source-only directories.
function copyRouteDirs(base, relBase='') {
  for (const e of fs.readdirSync(base, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name.startsWith('.') || EXCLUDE_DIRS.has(e.name) || PUBLIC_DIRS.has(e.name)) continue;
    const src = path.join(base, e.name);
    const rel = path.join(relBase, e.name);
    const index = path.join(src, 'index.html');
    if (fs.existsSync(index)) {
      copyFile(index, path.join(rel, 'index.html'));
      // Preserve route-local public assets if present.
      for (const child of fs.readdirSync(src, { withFileTypes: true })) {
        if (child.name === 'index.html' || child.name.startsWith('.')) continue;
        const childSrc = path.join(src, child.name);
        if (child.isFile() && PUBLIC_ROOT_EXTS.has(path.extname(child.name).toLowerCase())) {
          copyFile(childSrc, path.join(rel, child.name));
        }
      }
    }
  }
}
copyRouteDirs(root);

fs.mkdirSync(path.join(out, '.well-known'), { recursive: true });
const security = path.join(root, '.well-known', 'security.txt');
if (fs.existsSync(security)) copyFile(security, '.well-known/security.txt');

const forbidden = [];
function auditTree(dir, rel='') {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const r = path.join(rel, e.name);
    if (e.isDirectory()) auditTree(path.join(dir,e.name), r);
    else forbidden.push(r);
  }
}
auditTree(out);
const forbiddenHits = forbidden.filter(p =>
  /^(qa|scripts|calculator-definitions|country-modules|api|p|privacy|reports)(\/|$)/.test(p) ||
  /\.(md)$/i.test(p) ||
  p === 'content-sources.json' ||
  p.startsWith('.github/')
);
if (forbiddenHits.length) {
  throw new Error('Forbidden internal files leaked into dist:\n' + forbiddenHits.join('\n'));
}
for (const required of ['index.html','robots.txt','sitemap.xml','ads.txt','_headers','_redirects','sw.js','manifest.webmanifest','widget.html','widget.js','wa-calculator-runtime.js']) {
  if (!fs.existsSync(path.join(out, required))) throw new Error('Missing required public output: ' + required);
}
console.log('Cloudflare public build PASS:', forbidden.length, 'public files emitted to dist/.');
