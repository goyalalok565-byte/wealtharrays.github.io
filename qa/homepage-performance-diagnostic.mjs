import fs from 'node:fs';
import { runLighthouse } from './lighthouse-runner.mjs';
const base=(process.env.BASE_URL||'https://wealtharrays.com').replace(/\/$/,'');
const outputDir=process.env.LH_OUTPUT_DIR||'/tmp/wa-lighthouse';
fs.mkdirSync(outputDir,{recursive:true});
const baselinePath=outputDir+'/home.json';
const diagnosticPath=outputDir+'/homepage-without-fundingchoices.json';
const resultPath=outputDir+'/homepage-performance-diagnostic.json';
const readMetrics=report=>({
  performance:report.categories?.performance?.score==null?null:Math.round(report.categories.performance.score*100),
  tbt:report.audits?.['total-blocking-time']?.numericValue??null,
  lcp:report.audits?.['largest-contentful-paint']?.numericValue??null,
  longTasks:report.audits?.['long-tasks']?.details?.items||[]
});
if(!fs.existsSync(baselinePath)){
  const skipped={status:'skipped',reason:'No normal homepage Lighthouse report exists; a missing baseline cannot support a controlled comparison.'};
  fs.writeFileSync(resultPath,JSON.stringify(skipped,null,2));console.warn(skipped.reason);process.exit(0);
}
const baseline=JSON.parse(fs.readFileSync(baselinePath,'utf8'));
const requests=baseline.audits?.['network-requests']?.details?.items||[];
const fundingChoicesRequests=requests.filter(item=>String(item.url||'').includes('fundingchoicesmessages.google.com'));
if(!fundingChoicesRequests.length){
  const skipped={
    status:'not-applicable',
    experiment:'Block Google Funding Choices only when the normal baseline actually requests it.',
    reason:'The normal homepage run made no Funding Choices network request. A blocked-vs-normal TBT difference would not establish Funding Choices as the cause.',
    baseline:readMetrics(baseline),fundingChoicesRequests:0,tbtImprovementMs:null
  };
  fs.writeFileSync(resultPath,JSON.stringify(skipped,null,2));console.log(JSON.stringify(skipped,null,2));process.exit(0);
}
runLighthouse([
  base+'/','--form-factor=mobile','--screenEmulation.mobile=true',
  '--screenEmulation.width=360','--screenEmulation.height=800',
  '--screenEmulation.deviceScaleFactor=2','--throttling-method=simulate',
  '--throttling.rttMs=150','--throttling.throughputKbps=1600',
  '--throttling.cpuSlowdownMultiplier=4','--only-categories=performance',
  '--blocked-url-patterns=https://fundingchoicesmessages.google.com/*',
  '--output=json','--save-assets','--output-path='+diagnosticPath,
  '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage'
],'Lighthouse homepage Funding Choices diagnostic');
const blocked=JSON.parse(fs.readFileSync(diagnosticPath,'utf8'));
const normalMetrics=readMetrics(baseline),blockedMetrics=readMetrics(blocked);
const delta=normalMetrics.tbt!=null&&blockedMetrics.tbt!=null?Math.round(normalMetrics.tbt-blockedMetrics.tbt):null;
const summary={
  status:'completed',
  experiment:'Block Google Funding Choices only; normal baseline contained a Funding Choices request.',
  baseline:normalMetrics,withoutFundingChoices:blockedMetrics,tbtImprovementMs:delta,
  interpretation:'This is a diagnostic comparison, not a release gate. Confirm with a normal homepage trace and repeatable runs before attributing causality.'
};
fs.writeFileSync(resultPath,JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2));
