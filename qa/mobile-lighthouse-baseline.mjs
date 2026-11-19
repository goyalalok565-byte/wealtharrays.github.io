import { PERFORMANCE_BUDGET, evaluatePerformanceRow } from './performance-thresholds.mjs';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const base = (process.env.BASE_URL || 'https://wealtharrays.com').replace(/\/$/, '');
const paths = ['/', '/tools.html', '/sip-calculator/', '/swp-calculator/', '/fire-calculator/', '/rent-vs-buy-calculator/'];
const outputDir = process.env.LH_OUTPUT_DIR || '/tmp/wa-lighthouse';
fs.mkdirSync(outputDir, { recursive: true });
const rows = [];
for (const route of paths) {
  const safe = route.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home';
  const reportPath = `${outputDir}/${safe}.json`;
  const url = base + route;
  console.log(`\n=== Lighthouse: ${url} ===`);
  const lighthouseArgs = ['lighthouse', url, '--form-factor=mobile', '--screenEmulation.mobile=true', '--screenEmulation.width=360', '--screenEmulation.height=800', '--screenEmulation.deviceScaleFactor=2', '--throttling-method=simulate', '--throttling.rttMs=150', '--throttling.throughputKbps=1600', '--throttling.cpuSlowdownMultiplier=4', '--only-categories=performance,accessibility,best-practices,seo', '--output=json', '--output-path=' + reportPath, '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage'];
  let measured = false, report;
  for (let attempt = 1; attempt <= 3 && !measured; attempt++) {
    try {
      const result = execFileSync('npx', lighthouseArgs, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      if (result) process.stdout.write(result);
      report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      const traceError = Object.values(report.audits || {}).some(audit =>
        /NO_NAVSTART|recording the trace over your page load|Chrome did not respond/i.test(String(audit.errorMessage || ''))
      );
      if (traceError) throw new Error('Lighthouse produced an invalid trace report (NO_NAVSTART or equivalent).');
      measured = true;
    } catch (error) {
      const stdout = String(error.stdout || ''), stderr = String(error.stderr || '');
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      const diagnostic = stdout + '\n' + stderr + '\n' + String(error.message || '');
      const transientTraceFailure = /NO_NAVSTART|invalid trace report|recording the trace over your page load|Chrome did not respond/i.test(diagnostic);
      if (!transientTraceFailure || attempt === 3) throw error;
      console.warn('Transient Lighthouse trace failure on ' + route + '; retry ' + (attempt + 1) + '/3.');
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  if (!measured || !report) throw new Error('Lighthouse did not produce a valid report for ' + route + ' after three attempts.');
  const audits = report.audits || {};
  const network = audits['network-requests']?.details?.items || [];
  const bytes = type => network.filter(x => x.resourceType === type).reduce((sum, x) => sum + (Number(x.transferSize) || 0), 0);
  const row = {
    route,
    performance: Math.round((report.categories?.performance?.score ?? 0) * 100),
    accessibility: Math.round((report.categories?.accessibility?.score ?? 0) * 100),
    bestPractices: Math.round((report.categories?.['best-practices']?.score ?? 0) * 100),
    seo: Math.round((report.categories?.seo?.score ?? 0) * 100),
    fcp: audits['first-contentful-paint']?.numericValue ?? null,
    lcp: audits['largest-contentful-paint']?.numericValue ?? null,
    tbt: audits['total-blocking-time']?.numericValue ?? null,
    cls: audits['cumulative-layout-shift']?.numericValue ?? null,
    jsTransferBytes: bytes('Script'), cssTransferBytes: bytes('Stylesheet'),
    requestCount: network.length, domNodes: audits['dom-size']?.numericValue ?? null, reportPath
  };
  const gate = evaluatePerformanceRow(row);
  row.gate = gate.gate;
  row.violations = gate.violations;
  rows.push(row);
  console.log(JSON.stringify(row));
}
const summaryPath = `${outputDir}/summary.json`;
fs.writeFileSync(summaryPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  environment: { viewport: '360x800 CSS px, DPR 2', network: 'simulated slow 4G: 150 ms RTT, 1600 Kbps', cpu: '4x slowdown', note: 'Lab emulation, not a physical handset. INP is not fabricated from TBT.' },
  thresholds: PERFORMANCE_BUDGET,
  rows,
  failedPages: rows.filter(row => row.gate === 'FAIL').map(row => ({ route: row.route, violations: row.violations }))
}, null, 2));
console.log(`\nSummary written to ${summaryPath}`);
const failed = rows.filter(row => row.gate === 'FAIL');
if (failed.length) {
  console.error(`\nLIGHTHOUSE QUALITY GATE FAILED: ${failed.length}/${rows.length} pages breached the budget.`);
  for (const row of failed) console.error(`FAIL ${row.route}: ${row.violations.join('; ')}`);
  process.exitCode = 1;
} else console.log(`\nLIGHTHOUSE QUALITY GATE PASSED: ${rows.length}/${rows.length} pages meet all four budgets.`);
