import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const base = (process.env.BASE_URL || 'https://wealtharrays.com').replace(/\/$/, '');
const firstPartyHost = new URL(base).host;
const paths = [
  '/', '/tools.html', '/sip-calculator/', '/swp-calculator/',
  '/fire-calculator/', '/rent-vs-buy-calculator/',
  '/articles/compound-interest-guide.html'
];
const outputDir = process.env.LH_OUTPUT_DIR || '/tmp/wa-lighthouse';
fs.mkdirSync(outputDir, { recursive: true });

const rows = [];
for (const route of paths) {
  const safe = route.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home';
  const reportPath = `${outputDir}/${safe}.json`;
  const url = base + route;
  console.log(`\n=== Lighthouse: ${url} ===`);
  execFileSync('npx', [
    'lighthouse', url,
    '--form-factor=mobile',
    '--screenEmulation.mobile=true',
    '--screenEmulation.width=360',
    '--screenEmulation.height=800',
    '--screenEmulation.deviceScaleFactor=2',
    '--throttling-method=simulate',
    '--throttling.rttMs=150',
    '--throttling.throughputKbps=1600',
    '--throttling.cpuSlowdownMultiplier=4',
    '--only-categories=performance,accessibility,best-practices,seo',
    '--output=json',
    `--output-path=${reportPath}`,
    '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage'
  ], { stdio: 'inherit' });

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const audits = report.audits || {};
  const network = audits['network-requests']?.details?.items || [];
  const bytes = (items) => items.reduce((sum, x) => sum + (Number(x.transferSize) || 0), 0);
  const scripts = network.filter(x => x.resourceType === 'Script');
  const stylesheets = network.filter(x => x.resourceType === 'Stylesheet');
  const isFirstParty = item => { try { return new URL(item.url).host === firstPartyHost; } catch { return false; } };
  const thirdPartyHosts = new Map();
  for (const item of scripts.filter(item => !isFirstParty(item))) {
    try { const host = new URL(item.url).host; thirdPartyHosts.set(host, (thirdPartyHosts.get(host) || 0) + (Number(item.transferSize) || 0)); } catch {}
  }
  const domAudit = audits['dom-size-insight'] || audits['dom-size'];
  const inpAudit = audits['interaction-to-next-paint'];
  const longTasks = audits['long-tasks']?.details?.items;
  const mainThreadItems = audits['mainthread-work-breakdown']?.details?.items || [];
  const mainThread = Object.fromEntries(mainThreadItems.map(item => [item.group, Math.round(item.duration)]));
  const bootupItems = audits['bootup-time']?.details?.items || [];
  const row = {
    route,
    performance: Math.round((report.categories?.performance?.score || 0) * 100),
    accessibility: Math.round((report.categories?.accessibility?.score || 0) * 100),
    bestPractices: Math.round((report.categories?.['best-practices']?.score || 0) * 100),
    seo: Math.round((report.categories?.seo?.score || 0) * 100),
    fcp: audits['first-contentful-paint']?.displayValue || null,
    lcp: audits['largest-contentful-paint']?.displayValue || null,
    tbt: audits['total-blocking-time']?.displayValue || null,
    cls: audits['cumulative-layout-shift']?.displayValue || null,
    inp: inpAudit?.displayValue || 'Not available in this Lighthouse lab report',
    jsTransferBytes: bytes(scripts),
    firstPartyJsTransferBytes: bytes(scripts.filter(isFirstParty)),
    thirdPartyJsTransferBytes: bytes(scripts.filter(item => !isFirstParty(item))),
    cssTransferBytes: bytes(stylesheets),
    firstPartyCssTransferBytes: bytes(stylesheets.filter(isFirstParty)),
    thirdPartyCssTransferBytes: bytes(stylesheets.filter(item => !isFirstParty(item))),
    topThirdPartyScriptHosts: [...thirdPartyHosts.entries()].map(([host, transferBytes]) => ({ host, transferBytes })).sort((a, b) => b.transferBytes - a.transferBytes).slice(0, 10),
    requestCount: network.length,
    domNodes: domAudit?.numericValue ?? null,
    domDepth: domAudit?.details?.debugData?.maxDepth ?? null,
    domMaxChildren: domAudit?.details?.debugData?.maxChildren ?? null,
    mainThreadMs: audits['mainthread-work-breakdown']?.numericValue ?? null,
    mainThreadBreakdownMs: mainThread,
    topBootupScripts: bootupItems.slice(0, 10).map(item => ({ url: item.url, totalMs: Math.round(item.total), scriptingMs: Math.round(item.scripting) })),
    longTaskCount: Array.isArray(longTasks) ? longTasks.length : 'Not exposed by this Lighthouse version',
    topLongTasks: Array.isArray(longTasks) ? longTasks.slice(0, 10).map(item => ({ url: item.url, durationMs: Math.round(item.duration), startTimeMs: Math.round(item.startTime) })) : [],
    reportPath
  };
  rows.push(row);
  console.log(JSON.stringify(row));
}
const summaryPath = `${outputDir}/summary.json`;
fs.writeFileSync(summaryPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  environment: {
    viewport: '360x800 CSS px, DPR 2 (Moto G Power-sized approximation)',
    network: 'simulated slow 4G: 150 ms RTT, 1600 Kbps throughput',
    cpu: '4x slowdown',
    note: 'Emulation is not a physical Moto G Power device; INP is field data and is not fabricated from lab TBT.'
  },
  rows
}, null, 2));
console.log(`\nSummary written to ${summaryPath}`);
