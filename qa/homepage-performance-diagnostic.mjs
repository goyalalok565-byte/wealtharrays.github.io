import fs from 'node:fs';
import { runLighthouse } from './lighthouse-runner.mjs';

const base = (process.env.BASE_URL || 'https://wealtharrays.com').replace(/\/$/, '');
const outputDir = process.env.LH_OUTPUT_DIR || '/tmp/wa-lighthouse';
fs.mkdirSync(outputDir, { recursive: true });

const baselinePath = `${outputDir}/home.json`;
const diagnosticPath = `${outputDir}/homepage-without-fundingchoices.json`;
if (!fs.existsSync(baselinePath)) throw new Error(`Missing baseline Lighthouse report: ${baselinePath}`);

runLighthouse([
  base + '/',
  '--form-factor=mobile',
  '--screenEmulation.mobile=true',
  '--screenEmulation.width=360',
  '--screenEmulation.height=800',
  '--screenEmulation.deviceScaleFactor=2',
  '--throttling-method=simulate',
  '--throttling.rttMs=150',
  '--throttling.throughputKbps=1600',
  '--throttling.cpuSlowdownMultiplier=4',
  '--only-categories=performance',
  '--blocked-url-patterns=https://fundingchoicesmessages.google.com/*',
  '--output=json',
  '--save-assets',
  `--output-path=${diagnosticPath}`,
  '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage'

], 'Lighthouse homepage diagnostic');

const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
const withoutFundingChoices = JSON.parse(fs.readFileSync(diagnosticPath, 'utf8'));
const read = report => ({
  performance: Math.round((report.categories?.performance?.score || 0) * 100),
  tbt: report.audits?.['total-blocking-time']?.numericValue ?? null,
  lcp: report.audits?.['largest-contentful-paint']?.numericValue ?? null,
  longTasks: report.audits?.['long-tasks']?.details?.items || []
});
const normal = read(baseline);
const blocked = read(withoutFundingChoices);
const delta = normal.tbt !== null && blocked.tbt !== null ? Math.round(normal.tbt - blocked.tbt) : null;
console.log(JSON.stringify({
  experiment: 'Block Google Funding Choices only; all other homepage code and Lighthouse settings unchanged',
  baseline: normal,
  withoutFundingChoices: blocked,
  tbtImprovementMs: delta,
  interpretation: delta !== null && delta >= 500
    ? 'Funding Choices is a likely major contributor; confirm with a controlled consent-safe implementation test.'
    : 'Blocking Funding Choices did not materially reduce TBT; inspect first-party homepage work and unattributable long tasks next.'
}, null, 2));
