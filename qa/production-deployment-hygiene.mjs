import fs from 'node:fs';

const base = (process.env.BASE_URL || 'https://wealtharrays.com').replace(/\/$/, '');
const manifestUrl = base + '/.well-known/wa-public-manifest.json';
const response = await fetch(manifestUrl, { cache: 'no-store', signal: AbortSignal.timeout(20000) });
if (!response.ok) throw new Error('Production public-file manifest is unavailable: HTTP ' + response.status);
const manifest = await response.json();
if (manifest.schema_version !== 1 || !Array.isArray(manifest.public_files) || !Array.isArray(manifest.deployment_files)) {
  throw new Error('Production public-file manifest has an invalid schema.');
}
const forbidden = /(^|\/)(?:qa|scripts|docs|tests|test|__tests__|\.github|\.wrangler|backups?|archives?|artifacts|coverage|country-modules|api)(\/|$)|\.(?:md|zip|7z|rar|tar|gz|bak|backup|old|orig|tmp|log|map)$/i;
const unique = new Set(manifest.public_files);
if (unique.size !== manifest.public_files.length) throw new Error('Production manifest contains duplicate public paths.');
for (const file of manifest.public_files) {
  if (forbidden.test(file) || file.startsWith('/') || file.split('/').includes('..')) {
    throw new Error('Forbidden or unsafe path in production manifest: ' + file);
  }
}
const required = ['index.html','robots.txt','sitemap.xml','widget.html','widget/index.html','wa-site-runtime.js','wa-home-runtime.js','wa-calculator-runtime.js','.well-known/wa-public-manifest.json'];
for (const file of required) if (!unique.has(file)) throw new Error('Production manifest is missing required public file: ' + file);

async function mapLimit(items, limit, task) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await task(items[index]);
    }
  });
  await Promise.all(workers);
}
const missing = [];
await mapLimit(manifest.public_files, 12, async file => {
  const url = base + '/' + file.split('/').map(encodeURIComponent).join('/');
  try {
    const result = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(20000) });
    if (!result.ok) missing.push(file + ' (HTTP ' + result.status + ')');
  } catch (error) {
    missing.push(file + ' (' + error.message + ')');
  }
});
if (missing.length) throw new Error('Production deployment is missing ' + missing.length + ' manifest files:\n' + missing.slice(0, 30).join('\n'));

const forbiddenProbes = [
  '/qa/calculator-registry-audit.mjs',
  '/scripts/build-dist.mjs',
  '/docs/PROJECT_STATE.md',
  '/tests/lighthouse-quality-gate.test.js',
  '/.github/workflows/platform-gates.yml',
  '/ARCHITECTURE.md',
  '/QA_TESTS.md',
  '/package.json',
  '/wrangler.toml',
  '/content-sources.json',
  '/private-backup.zip'
];
const leaked = [];
for (const route of forbiddenProbes) {
  const result = await fetch(base + route, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(15000) });
  if (![403, 404, 410].includes(result.status)) leaked.push(route + ' (HTTP ' + result.status + ')');
}
if (leaked.length) throw new Error('Internal repository paths are publicly reachable: ' + leaked.join(', '));
console.log('Production deployment hygiene PASS — ' + manifest.public_files.length + ' manifest files are reachable; ' + forbiddenProbes.length + ' internal path probes are blocked; manifest commit is deployed.');
