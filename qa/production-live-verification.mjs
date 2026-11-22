const base = (process.env.BASE_URL || 'https://wealtharrays.com').replace(/\/$/, '');
const expectedSha = process.env.EXPECTED_SHA || '';
if (!/^[0-9a-f]{40}$/i.test(expectedSha)) throw new Error('EXPECTED_SHA must be the full 40-character merge SHA.');

const routes = [
  { path: '/', shell: false },
  { path: '/sip-calculator/', shell: true },
  { path: '/swp-calculator/', shell: true },
  { path: '/fire-calculator/', shell: true },
  { path: '/tools.html', shell: false },
  { path: '/articles/compound-interest-guide.html', shell: false }
];
const rows = [];
const failures = [];
for (const route of routes) {
  const url = base + route.path;
  let status = 'ERR';
  let provenance = 'missing';
  let shell = route.shell ? 'FAIL' : 'n/a';
  let encoding = 'missing';
  let cacheControl = 'missing';
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: { 'Accept-Encoding': 'br', 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
      signal: AbortSignal.timeout(30000)
    });
    status = String(response.status);
    encoding = response.headers.get('content-encoding') || 'missing';
    cacheControl = response.headers.get('cache-control') || 'missing';
    const html = await response.text();
    const match = html.match(/<meta\s+name=["']wa-build-sha["']\s+content=["']([0-9a-f]{40})["']/i);
    provenance = match?.[1] || 'missing';
    if (response.status !== 200) failures.push(route.path + ': expected HTTP 200, received ' + response.status);
    if (provenance !== expectedSha) failures.push(route.path + ': provenance mismatch (expected ' + expectedSha + ', received ' + provenance + ')');
    if (route.shell) {
      const host = html.match(/<[^>]+\bid=["']calc-widget["'][^>]*>/i)?.[0] || '';
      const hasShell = /data-wa-static-shell(?:=["'][^"']*["'])?/i.test(html);
      const hasWidgetClass = /\bclass=["'][^"']*\bcalc-widget\b[^"']*["']/i.test(host);
      shell = hasShell && hasWidgetClass ? 'PASS' : 'FAIL';
      if (!hasShell) failures.push(route.path + ': missing data-wa-static-shell');
      if (!hasWidgetClass) failures.push(route.path + ': calculator host missing calc-widget class');
    }
    if (encoding.toLowerCase() !== 'br') failures.push(route.path + ': expected content-encoding br, received ' + encoding);
  } catch (error) {
    failures.push(route.path + ': ' + error.message);
  }
  rows.push({ path: route.path, status, provenance, shell, encoding, cacheControl });
}
const lines = [
  '## Live production verification',
  '',
  'Expected merge SHA: `' + expectedSha + '`',
  '',
  '| URL | HTTP | Provenance | Static shell / host | content-encoding | cache-control |',
  '|---|---:|---|---|---|---|',
  ...rows.map(row => '| `' + row.path + '` | ' + row.status + ' | ' + (row.provenance === expectedSha ? 'MATCH' : row.provenance) + ' | ' + row.shell + ' | ' + row.encoding + ' | ' + row.cacheControl + ' |'),
  '',
  failures.length ? '**FAIL** — ' + failures.length + ' verification issue(s):' : '**PASS** — all live route checks passed.',
  ...failures.map(failure => '- ' + failure)
];
const fs = await import('node:fs');
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
console.log(lines.join('\n'));
if (failures.length) process.exitCode = 1;
