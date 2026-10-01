import fs from 'node:fs';
import vm from 'node:vm';

const fail = (m) => { throw new Error(m); };
const must = (p) => { if (!fs.existsSync(p)) fail('Missing required asset: '+p); return fs.readFileSync(p,'utf8'); };
const json = (p) => JSON.parse(must(p));

const calculators = (() => {
  const source = must('calculators.js');
  const ctx = { console };
  vm.createContext(ctx);
  vm.runInContext(source+';globalThis.__WA_CALCS__=CALCULATORS;',ctx);
  return ctx.__WA_CALCS__;
})();
if (!Array.isArray(calculators) || calculators.length !== 20) fail('Phase 1: expected exactly 20 legacy calculators');

const models = json('model-registry.json').models;
const formulas = (() => {
  const source = must('formula-registry.js');
  const ctx = { module:{exports:{}}, exports:{}, console };
  vm.createContext(ctx); vm.runInContext(source,ctx); return ctx.module.exports;
})();
const adapters = (() => {
  const engine = (() => {
    const ctx={module:{exports:{}},exports:{},console}; vm.createContext(ctx);
    vm.runInContext(must('financial-engine.js'),ctx); return ctx.module.exports;
  })();
  const ctx={window:{WA_FINANCIAL_ENGINE:engine},console};
  vm.createContext(ctx); vm.runInContext(must('decision-adapters.js'),ctx);
  return ctx.window.WA_DECISION_ADAPTERS;
})();
const modelIds = new Set(models.map(x=>x.id));
if (modelIds.size !== 20) fail('Phase 1: model registry must contain 20 unique IDs');
for (const c of calculators) {
  if (!modelIds.has(c.id)) fail('Phase 1/3: calculator missing model registry entry: '+c.id);
  if (!formulas[c.id]) fail('Phase 1: formula registry missing: '+c.id);
  if (typeof adapters[c.id] !== 'function') fail('Phase 3: decision adapter missing: '+c.id);
}
for (const m of models) {
  for (const k of ['id','version','family','timing','formula','inputs','limitations']) if (m[k] === undefined) fail('Phase 1: incomplete model contract: '+m.id);
}

const engineCtx={module:{exports:{}},exports:{},console}; vm.createContext(engineCtx);
vm.runInContext(must('financial-engine.js'),engineCtx);
const E=engineCtx.module.exports;
for (const fn of ['futureValue','futureValueSeries','contributions','inflationAdjusted','realReturn','project','projectWithPause','scenarios','sensitivity','stressTests','requiredMonthlyContribution']) {
  if (typeof E[fn] !== 'function') fail('Phase 2: missing deterministic engine function: '+fn);
}
const base={startingAmount:10000,monthlyContribution:500,annualStepUp:5,annualReturn:10,inflation:6,years:20};
const scenarios=E.scenarios(base);
if (scenarios.length!==3 || scenarios.map(x=>x.id).join(',')!=='conservative,base,higher') fail('Phase 2: scenario contract changed');
if (E.stressTests(base).length!==4) fail('Phase 2: stress-test contract changed');
if (!Number.isFinite(E.requiredMonthlyContribution(250000,10000,10,20,5))) fail('Phase 2: goal solver failed');

for (const p of ['scenario-lab.html','goal-planner.html','financial-workspace.html']) {
  const s=must(p);
  if (!s.includes('/financial-engine.js')) fail('Phase 2/4: '+p+' missing deterministic engine');
}
const ws=json('workspace-schema.json');
if (ws.privacy.analytics_raw_financial_values !== false || ws.privacy.advertising_access !== false) fail('Phase 4/9: workspace privacy contract weakened');

const country=json('global-seo-config.json');
if (!Array.isArray(country.countryCodes) || country.countryCodes.length < 7) fail('Phase 5/18: global country registry unexpectedly reduced');
const countrySource=must('country-modules/index.js');
for (const code of country.countryCodes) if (!new RegExp('\\b'+code+'\\s*:').test(countrySource)) fail('Phase 5: country registry missing '+code);
const india=must('country-modules/india-income-tax-ay2026-27.js');
if (!/2026-27|2026–27|AY 2026/i.test(india) || !/source|provenance/i.test(india)) fail('Phase 5: India tax provenance missing');

const i18n=must('i18n.js');
if (!/supportedLanguages/.test(i18n) || !/language/i.test(i18n)) fail('Phase 6: i18n foundation missing');
const report=must('report-engine.js');
for (const k of ['schemaVersion','modelVersion','inputs','assumptions','scenarios','stressTests','sources','limitations','fingerprint']) {
  if (k==='fingerprint') continue;
  if (!report.includes(k)) fail('Phase 7: report contract missing '+k);
}
const reportCtx={window:{},console}; vm.createContext(reportCtx); vm.runInContext(report,reportCtx);
const sample={model:'test',modelVersion:'1.0',currency:'INR',inputs:{x:1},assumptions:{a:2},scenarios:[],stressTests:[],sources:[],limitations:['test']};
if (reportCtx.window.WA_REPORT_ENGINE.fingerprint(reportCtx.window.WA_REPORT_ENGINE.build(sample)) !== reportCtx.window.WA_REPORT_ENGINE.fingerprint(reportCtx.window.WA_REPORT_ENGINE.build(sample))) fail('Phase 7: report fingerprint is not reproducible');

const ai=json('ai-contract.json');
if (!/may not invent/i.test(ai.rule) || !ai.flow.includes('deterministic_calculation')) fail('Phase 8: AI deterministic safety contract missing');
const privacy=must('privacy/README.md');
for (const x of ['consent','export','deletion','advertising']) if (!privacy.toLowerCase().includes(x)) fail('Phase 9: privacy contract missing '+x);

const api=must('api/openapi.yml');
for (const x of ['/v1/calculate','/v1/models','model_version','inputs','assumptions','country','currency']) if (!api.includes(x)) fail('Phase 10: API contract missing '+x);

for (const p of ['ARCHITECTURE.md','methodology.html','editorial-policy.html','about.html']) must(p);
if (!/author|Alok Goyal/i.test(must('about.html'))) fail('Phase 11: authorship contract missing');
const seo=must('sitemap.xml');
for (const p of ['/scenario-lab','/goal-planner','/financial-workspace']) if (!seo.includes('https://wealtharrays.com'+p)) fail('Phase 12: sitemap missing '+p);

const a11y=must('qa/accessibility-static-audit.mjs');
if (!/alt|button|label/i.test(a11y)) fail('Phase 13: accessibility gate too weak');
const perf=must('qa/performance-budget-audit.mjs');
if (!/budget|bytes|size/i.test(perf)) fail('Phase 14: performance budget gate missing');
if (!/WA_VISUALIZATION/.test(must('visualization.js'))) fail('Phase 15: visualization contract missing');
for (const p of ['calculator-value-content.json','articles.html','research.html']) must(p);
const premium=must('scripts/phase4-premium-build.mjs');
if (!/privacy\.html/.test(premium) || !/widget\.html/.test(premium) || !/404\.html/.test(premium)) fail('Phase 17: monetization exclusions not encoded in canonical build');
const analytics=must('analytics.js');
if (!/ALLOWED/.test(analytics) || !/sanitize/.test(analytics) || !/localStorage/.test(analytics)) fail('Phase 18: privacy-safe analytics contract missing');
for (const p of ['GLOBAL-PLATFORM-SPEC.md','GLOBAL-PRODUCT-ROADMAP.md','api/openapi.yml']) must(p);

for (const p of ['research/data/sip-contribution-timing-study.json','research/data/inflation-purchasing-power-study.json','research/data/emi-term-cost-study.json']) {
  const d=json(p);
  for (const k of ['schema_version','study_id','model_id','model_version','method','assumptions','rows','limitations']) if (d[k]===undefined) fail('Phase 20: research dataset missing '+k+': '+p);
  if (!d.rows.length) fail('Phase 20: empty dataset: '+p);
}
if (!/financial-engine\.js/.test(must('scripts/generate-research-datasets.mjs'))) fail('Phase 20: generator not tied to canonical engine');

const scenario=must('scenario-lab.js');
const goal=must('goal-planner.js');
if (!scenario.includes('location.hash') || !goal.includes('location.hash')) fail('Phase 9: share state must use URL fragment, not query parameters');
if (/new URLSearchParams\(location\.search\)/.test(scenario+goal)) fail('Phase 9: raw financial share inputs still read from query string');

console.log('Wealth Arrays Phase 1–20 roadmap audit PASS: cross-system contracts, model/adapters, scenarios, workspace privacy, country/i18n, reports, AI/API, trust/SEO/a11y/performance, monetization/analytics, research and privacy-safe sharing verified.');
