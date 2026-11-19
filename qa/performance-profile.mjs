import { chromium } from 'playwright';
import fs from 'node:fs';

const base = (process.env.BASE_URL || 'https://wealtharrays.com').replace(/\/$/, '');
const host = new URL(base).host;
const url = base + '/swp-calculator/';
const outputDir = process.env.LH_OUTPUT_DIR || '/tmp/wa-lighthouse';
const environment = {
  viewport: '360x800 DPR 2',
  cpuSlowdown: '4x',
  network: '150ms RTT / 1600 Kbps down / 750 Kbps up'
};
fs.mkdirSync(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });

function throttle(client) {
  return Promise.all([
    client.send('Network.enable'),
    client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: 1600 * 1024 / 8,
      uploadThroughput: 750 * 1024 / 8,
      connectionType: 'cellular4g'
    }),
    client.send('Emulation.setCPUThrottlingRate', { rate: 4 })
  ]);
}

try {
  // Clean CPU profile: no MutationObserver/querySelectorAll wrappers in this pass.
  const page = await browser.newPage({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 2 });
  page.on('pageerror', error => console.error('PAGE_ERROR', String(error)));
  const client = await page.context().newCDPSession(page);
  const scriptUrls = new Map();
  client.on('Debugger.scriptParsed', event => scriptUrls.set(String(event.scriptId), event.url || ''));
  await client.send('Debugger.enable');
  await throttle(client);
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
    await field.fill(type === 'number' ? String(10000 + i * 1000) : '10');
    await page.waitForTimeout(180);
  }
  for (let i = 0; i < 4; i++) {
    await page.evaluate(toBottom => window.scrollTo(0, toBottom ? document.body.scrollHeight : 0), i % 2 === 0);
    await page.waitForTimeout(160);
  }
  await page.waitForTimeout(500);

  const profile = (await client.send('Profiler.stop')).profile;
  const nodeById = new Map(profile.nodes.map(node => [node.id, node]));
  const parentById = new Map();
  for (const node of profile.nodes) for (const childId of node.children || []) parentById.set(childId, node.id);

  function resolveUrl(node) {
    let current = node;
    while (current) {
      const frame = current.callFrame || {};
      const urlFromFrame = frame.url || scriptUrls.get(String(frame.scriptId)) || '';
      if (urlFromFrame) return urlFromFrame;
      const parentId = parentById.get(current.id);
      current = parentId === undefined ? null : nodeById.get(parentId);
    }
    return '(native / unattributed)';
  }

  const selfTime = new Map();
  const scriptTime = new Map();
  for (let i = 0; i < (profile.samples || []).length; i++) {
    const nodeId = profile.samples[i];
    const delta = profile.timeDeltas?.[i] || 0;
    const node = nodeById.get(nodeId) || {};
    const frame = node.callFrame || {};
    const functionName = frame.functionName || '(anonymous)';
    if (functionName === '(idle)') continue;
    const resolvedUrl = resolveUrl(node);
    const line = frame.lineNumber == null ? null : frame.lineNumber + 1;
    const key = [resolvedUrl, functionName, line].join('|');
    const item = selfTime.get(key) || { function: functionName, url: resolvedUrl, line, micros: 0, samples: 0 };
    item.micros += delta;
    item.samples++;
    selfTime.set(key, item);
    scriptTime.set(resolvedUrl, (scriptTime.get(resolvedUrl) || 0) + delta);
  }

  const ranked = [...selfTime.values()].map(item => ({
    function: item.function,
    url: item.url,
    line: item.line,
    selfTimeMs: +(item.micros / 1000).toFixed(2),
    samples: item.samples
  })).sort((a, b) => b.selfTimeMs - a.selfTimeMs);
  const top10 = ranked.slice(0, 10);
  const topFirstParty = ranked.filter(item => {
    try { return new URL(item.url).host === host; } catch { return false; }
  }).slice(0, 10);
  const topThirdParty = ranked.filter(item => {
    try { return new URL(item.url).host !== host; } catch { return false; }
  }).slice(0, 10);
  const topScripts = [...scriptTime.entries()].map(([scriptUrl, micros]) => ({
    url: scriptUrl,
    selfTimeMs: +(micros / 1000).toFixed(2)
  })).sort((a, b) => b.selfTimeMs - a.selfTimeMs).slice(0, 15);

  const profileOutput = { environment, top10, top10FirstParty: topFirstParty, top10ThirdParty: topThirdParty, topScripts };
  console.log('SWP_CPU_PROFILE_TOP_10', JSON.stringify(profileOutput));
  fs.writeFileSync(outputDir + '/swp-cpu-profile-top10.json', JSON.stringify(profileOutput, null, 2));
  fs.writeFileSync(outputDir + '/swp-cpu-profile-raw.json', JSON.stringify({ profile, scriptUrls: [...scriptUrls.entries()] }));
  await page.close();

  // Separate instrumented pass: observer/querySelectorAll callbacks, long tasks and layout shifts.
  const probe = await browser.newPage({ viewport: { width: 360, height: 800 }, deviceScaleFactor: 2 });
  const probeClient = await probe.context().newCDPSession(probe);
  await throttle(probeClient);
  await probe.addInitScript(() => {
    const stats = window.__waPerfProbe = {
      observers: 0, bodyObservers: 0, callbacks: 0, records: 0,
      callbackMs: 0, qsaCalls: 0, longTasks: [], layoutShifts: [], observerTargets: []
    };
    const observerStacks = new WeakMap();
    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          stats.longTasks.push({
            durationMs: +entry.duration.toFixed(2),
            startTimeMs: +entry.startTime.toFixed(2),
            name: entry.name,
            attribution: (entry.attribution || []).map(item => ({
              containerType: item.containerType,
              containerName: item.containerName,
              containerId: item.containerId,
              containerSrc: item.containerSrc
            }))
          });
        }
      }).observe({ type: 'longtask', buffered: true });
    } catch {}
    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          stats.layoutShifts.push({
            value: +entry.value.toFixed(4),
            startTimeMs: +entry.startTime.toFixed(2),
            hadRecentInput: entry.hadRecentInput,
            sources: (entry.sources || []).map(source => {
              const node = source.node;
              const tag = node?.tagName?.toLowerCase() || '';
              const cls = typeof node?.className === 'string' ? node.className : node?.className?.baseVal || '';
              const selector = node ? tag + (node.id ? '#' + node.id : '') + (cls ? '.' + cls.trim().split(/\s+/).filter(Boolean).join('.') : '') : null;
              const rect = value => value ? { x: +value.x.toFixed(1), y: +value.y.toFixed(1), width: +value.width.toFixed(1), height: +value.height.toFixed(1) } : null;
              return { selector, previousRect: rect(source.previousRect), currentRect: rect(source.currentRect) };
            })
          });
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch {}

    const NativeObserver = window.MutationObserver;
    window.MutationObserver = new Proxy(NativeObserver, {
      construct(Target, args) {
        stats.observers++;
        const callback = args[0];
        const stack = new Error('MutationObserver created').stack;
        args[0] = function(records, observer) {
          const start = performance.now();
          stats.callbacks++;
          stats.records += records.length;
          try { return callback(records, observer); }
          finally { stats.callbackMs += performance.now() - start; }
        };
        const observer = Reflect.construct(Target, args);
        observerStacks.set(observer, stack);
        return observer;
      }
    });
    const observe = NativeObserver.prototype.observe;
    NativeObserver.prototype.observe = function(target, options) {
      if (target === document.body) stats.bodyObservers++;
      const tag = target === document.body ? 'document.body' : target === document.documentElement ? 'document.documentElement' : (target?.tagName?.toLowerCase() || target?.nodeName || 'unknown') + (target?.id ? '#'+target.id : '');
      stats.observerTargets.push({ target: tag, options: options || {}, stack: observerStacks.get(this) || '' });
      return observe.call(this, target, options);
    };
    const documentQuery = Document.prototype.querySelectorAll;
    Document.prototype.querySelectorAll = function(...args) { stats.qsaCalls++; return documentQuery.apply(this, args); };
    const elementQuery = Element.prototype.querySelectorAll;
    Element.prototype.querySelectorAll = function(...args) { stats.qsaCalls++; return elementQuery.apply(this, args); };
  });

  await probe.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await probe.locator('#calc-widget input[data-field]').first().waitFor({ state: 'visible', timeout: 20000 });
  const observations = [];
  const fields = probe.locator('#calc-widget input[data-field]');
  for (let i = 0; i < Math.min(await fields.count(), 4); i++) {
    const before = await probe.evaluate(() => ({
      ...window.__waPerfProbe,
      longTaskCount: window.__waPerfProbe.longTasks.length,
      layoutShiftCount: window.__waPerfProbe.layoutShifts.length
    }));
    await fields.nth(i).fill(String(15000 + i * 5000));
    await probe.waitForTimeout(220);
    const after = await probe.evaluate(() => ({
      ...window.__waPerfProbe,
      longTaskCount: window.__waPerfProbe.longTasks.length,
      layoutShiftCount: window.__waPerfProbe.layoutShifts.length
    }));
    observations.push({
      inputIndex: i + 1,
      mutationObserverInstances: after.observers,
      bodyObservers: after.bodyObservers,
      callbackDelta: after.callbacks - before.callbacks,
      mutationRecordDelta: after.records - before.records,
      callbackTimeMsDelta: +(after.callbackMs - before.callbackMs).toFixed(3),
      querySelectorAllCallsDelta: after.qsaCalls - before.qsaCalls,
      longTaskDelta: after.longTaskCount - before.longTaskCount,
      layoutShiftDelta: after.layoutShiftCount - before.layoutShiftCount
    });
  }
  const totals = await probe.evaluate(() => ({ ...window.__waPerfProbe }));
  const observerOutput = { environment, totals, perInput: observations, longTasks: totals.longTasks, layoutShifts: totals.layoutShifts };
  console.log('SWP_OBSERVER_PROBE', JSON.stringify(observerOutput));
  fs.writeFileSync(outputDir + '/swp-observer-probe.json', JSON.stringify(observerOutput, null, 2));
  await probe.close();
} finally {
  await browser.close();
}
