import { chromium } from 'playwright';
import fs from 'node:fs';

const base = (process.env.BASE_URL || 'https://wealtharrays.com').replace(/\/$/, '');
const url = base + '/swp-calculator/';
const outputDir = process.env.LH_OUTPUT_DIR || '/tmp/wa-lighthouse';
fs.mkdirSync(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });

try {
  // Clean CPU profile: no instrumentation wrappers, so function timings are less perturbed.
  const page = await browser.newPage({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 2 });
  page.on('pageerror', error => console.error('PAGE_ERROR', String(error)));
  const client = await page.context().newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1600 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, connectionType: 'cellular4g' });
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.locator('#calc-widget input[data-field]').first().waitFor({ state: 'visible', timeout: 20000 });
  await client.send('Profiler.enable');
  await client.send('Profiler.setSamplingInterval', { interval: 1000 });
  await client.send('Profiler.start');
  const inputs = page.locator('#calc-widget input[data-field]');
  const count = await inputs.count();
  for (let i = 0; i < Math.min(count, 4); i++) {
    const field = inputs.nth(i);
    const type = await field.getAttribute('type');
    const value = type === 'number' ? String(10000 + i * 1000) : '10';
    await field.fill(value);
    await page.waitForTimeout(180);
  }
  for (let i = 0; i < 4; i++) {
    await page.evaluate(toBottom => window.scrollTo(0, toBottom ? document.body.scrollHeight : 0), i % 2 === 0);
    await page.waitForTimeout(160);
  }
  await page.waitForTimeout(500);
  const stopped = await client.send('Profiler.stop');
  const profile = stopped.profile;
  const nodeById = new Map(profile.nodes.map(n => [n.id, n]));
  const timeByNode = new Map();
  for (let i = 0; i < (profile.samples || []).length; i++) {
    const id = profile.samples[i];
    const delta = profile.timeDeltas?.[i] || 0;
    timeByNode.set(id, (timeByNode.get(id) || 0) + delta);
  }
  const top = [...timeByNode.entries()].map(([id, micros]) => {
    const n = nodeById.get(id) || {};
    const frame = n.callFrame || {};
    return {
      function: frame.functionName || '(anonymous)',
      url: frame.url || '(native / anonymous)',
      line: frame.lineNumber == null ? null : frame.lineNumber + 1,
      selfTimeMs: +(micros / 1000).toFixed(2),
      hitCount: n.hitCount || 0
    };
  }).sort((a, b) => b.selfTimeMs - a.selfTimeMs).slice(0, 10);
  console.log('SWP_CPU_PROFILE_TOP_10', JSON.stringify(top));
  fs.writeFileSync(outputDir + '/swp-cpu-profile-top10.json', JSON.stringify({ environment: { viewport: '360x800 DPR 2', cpuSlowdown: '4x', network: '150ms RTT / 1600 Kbps down / 750 Kbps up' }, top10: top }, null, 2));
  await page.close();

  // Separate instrumented run: observer callback and selector activity per input change.
  const probe = await browser.newPage({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 2 });
  const probeClient = await probe.context().newCDPSession(probe);
  await probeClient.send('Network.enable');
  await probeClient.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1600 * 1024 / 8, uploadThroughput: 750 * 1024 / 8, connectionType: 'cellular4g' });
  await probeClient.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await probe.addInitScript(() => {
    const stats = window.__waPerfProbe = { observers: 0, bodyObservers: 0, callbacks: 0, records: 0, callbackMs: 0, qsaCalls: 0, longTasks: [] };
    try { new PerformanceObserver(list => { for (const entry of list.getEntries()) stats.longTasks.push({ durationMs: +entry.duration.toFixed(2), startTimeMs: +entry.startTime.toFixed(2), name: entry.name }); }).observe({ type: 'longtask', buffered: true }); } catch {}
    const NativeObserver = window.MutationObserver;
    window.MutationObserver = new Proxy(NativeObserver, {
      construct(Target, args) {
        stats.observers++;
        const callback = args[0];
        args[0] = function(records, observer) {
          const start = performance.now();
          stats.callbacks++;
          stats.records += records.length;
          try { return callback(records, observer); }
          finally { stats.callbackMs += performance.now() - start; }
        };
        return Reflect.construct(Target, args);
      }
    });
    const observe = NativeObserver.prototype.observe;
    NativeObserver.prototype.observe = function(target, options) {
      if (target === document.body) stats.bodyObservers++;
      return observe.call(this, target, options);
    };
    const dqs = Document.prototype.querySelectorAll;
    Document.prototype.querySelectorAll = function(...args) { stats.qsaCalls++; return dqs.apply(this, args); };
    const eqs = Element.prototype.querySelectorAll;
    Element.prototype.querySelectorAll = function(...args) { stats.qsaCalls++; return eqs.apply(this, args); };
  });
  await probe.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await probe.locator('#calc-widget input[data-field]').first().waitFor({ state: 'visible', timeout: 20000 });
  const observations = [];
  const fields = probe.locator('#calc-widget input[data-field]');
  for (let i = 0; i < Math.min(await fields.count(), 4); i++) {
    const before = await probe.evaluate(() => ({ ...window.__waPerfProbe }));
    await fields.nth(i).fill(String(15000 + i * 5000));
    await probe.waitForTimeout(220);
    const after = await probe.evaluate(() => ({ ...window.__waPerfProbe }));
    observations.push({
      inputIndex: i + 1,
      mutationObserverInstances: after.observers,
      bodyObservers: after.bodyObservers,
      callbackDelta: after.callbacks - before.callbacks,
      mutationRecordDelta: after.records - before.records,
      callbackTimeMsDelta: +(after.callbackMs - before.callbackMs).toFixed(3),
      querySelectorAllCallsDelta: after.qsaCalls - before.qsaCalls
    });
  }
  const totals = await probe.evaluate(() => ({ ...window.__waPerfProbe }));
  console.log('SWP_OBSERVER_PROBE', JSON.stringify({ totals, perInput: observations }));
  fs.writeFileSync(outputDir + '/swp-observer-probe.json', JSON.stringify({ environment: { viewport: '360x800 DPR 2', cpuSlowdown: '4x', network: '150ms RTT / 1600 Kbps down / 750 Kbps up' }, totals, perInput: observations, longTasks: totals.longTasks }, null, 2));
  await probe.close();
} finally {
  await browser.close();
}
