import { chromium } from 'playwright';
import fs from 'node:fs';

const base = (process.env.BASE_URL || 'https://wealtharrays.com').replace(/\/$/, '');
const route = process.env.PROFILE_PATH || '/';
const url = base + route;
const outputDir = process.env.LH_OUTPUT_DIR || '/tmp/wa-lighthouse';
fs.mkdirSync(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
try {
  const page = await browser.newPage({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 2 });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error)));
  await page.addInitScript(() => {
    window.__waLongTasks = [];
    try { new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__waLongTasks.push({ durationMs: +entry.duration.toFixed(2), startTimeMs: +entry.startTime.toFixed(2), name: entry.name }); }).observe({ type: 'longtask', buffered: true }); } catch {}
  });
  const client = await page.context().newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1600 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, connectionType: 'cellular4g' });
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await client.send('Profiler.enable');
  await client.send('Profiler.setSamplingInterval', { interval: 1000 });
  await client.send('Profiler.start');
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(10000);
  const { profile } = await client.send('Profiler.stop');
  const nodeById = new Map(profile.nodes.map(node => [node.id, node]));
  const timeByNode = new Map();
  for (let i = 0; i < (profile.samples || []).length; i++) {
    const id = profile.samples[i], delta = profile.timeDeltas?.[i] || 0;
    timeByNode.set(id, (timeByNode.get(id) || 0) + delta);
  }
  const top = [...timeByNode.entries()].map(([id, micros]) => {
    const frame = nodeById.get(id)?.callFrame || {};
    return { function: frame.functionName || '(anonymous)', url: frame.url || '(native / anonymous)', line: frame.lineNumber == null ? null : frame.lineNumber + 1, column: frame.columnNumber == null ? null : frame.columnNumber + 1, selfTimeMs: +(micros / 1000).toFixed(2), hitCount: nodeById.get(id)?.hitCount || 0 };
  }).sort((a, b) => b.selfTimeMs - a.selfTimeMs).slice(0, 25);
  const diagnostics = await page.evaluate(() => ({ title: document.title, readyState: document.readyState, scriptCount: document.scripts.length, scripts: [...document.scripts].map(script => script.src || '(inline)'), longTasks: window.__waLongTasks || [], totalLongTaskMs: (window.__waLongTasks || []).reduce((sum, item) => sum + item.durationMs, 0) }));
  const report = { route, url, environment: { viewport: '360x800 CSS px, DPR 2', cpuSlowdown: '4x', network: '150ms RTT / 1600 Kbps down / 750 Kbps up', profilingWindowMs: 10000 }, topSelfTimeFunctions: top, diagnostics: { ...diagnostics, pageErrors } };
  const safe = route.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home';
  const path = `${outputDir}/${safe}-cpu-profile.json`;
  fs.writeFileSync(path, JSON.stringify(report, null, 2));
  console.log('CPU_PROFILE_TOP_FUNCTIONS', JSON.stringify(top.slice(0, 15)));
  console.log('CPU_PROFILE_LONG_TASKS', JSON.stringify(diagnostics.longTasks));
  console.log('CPU_PROFILE_REPORT', path);
  if (pageErrors.length) process.exitCode = 1;
} finally { await browser.close(); }
