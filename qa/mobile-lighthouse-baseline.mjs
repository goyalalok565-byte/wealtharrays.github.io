import fs from 'node:fs';
import { runLighthouse } from './lighthouse-runner.mjs';
const base=(process.env.BASE_URL||'https://wealtharrays.com').replace(/\/$/,'');
const paths=['/','/tools.html','/sip-calculator/','/swp-calculator/','/fire-calculator/','/rent-vs-buy-calculator/','/articles/compound-interest-guide.html'];
const outputDir=process.env.LH_OUTPUT_DIR||'/tmp/wa-lighthouse';
fs.mkdirSync(outputDir,{recursive:true});
const rows=[];
for(const route of paths){
 const safe=route.replace(/[^a-z0-9]+/gi,'_').replace(/^_|_$/g,'')||'home';
 const reportPath=`${outputDir}/${safe}.json`;
 const url=base+route;
 console.log(`\\n=== Lighthouse: ${url} ===`);
 runLighthouse([url,'--form-factor=mobile','--screenEmulation.mobile=true','--screenEmulation.width=360','--screenEmulation.height=800','--screenEmulation.deviceScaleFactor=2','--throttling-method=simulate','--throttling.rttMs=150','--throttling.throughputKbps=1600','--throttling.cpuSlowdownMultiplier=4','--only-categories=performance,accessibility,best-practices,seo','--output=json','--save-assets',`--output-path=${reportPath}`,'--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage'],'Lighthouse route');
 const report=JSON.parse(fs.readFileSync(reportPath,'utf8'));
 const audits=report.audits||{};
 const network=audits['network-requests']?.details?.items||[];
 const bytes=type=>network.filter(x=>x.resourceType===type).reduce((sum,x)=>sum+(Number(x.transferSize)||0),0);
 const longTasks=audits['long-tasks']?.details?.items;
 const row={
  route,performance:Math.round((report.categories?.performance?.score??0)*100),
  accessibility:Math.round((report.categories?.accessibility?.score??0)*100),
  bestPractices:Math.round((report.categories?.['best-practices']?.score??0)*100),
  seo:Math.round((report.categories?.seo?.score??0)*100),
  fcpMs:audits['first-contentful-paint']?.numericValue??null,
  lcpMs:audits['largest-contentful-paint']?.numericValue??null,
  tbtMs:audits['total-blocking-time']?.numericValue??null,
  clsValue:audits['cumulative-layout-shift']?.numericValue??null,
  fcp:audits['first-contentful-paint']?.displayValue||null,
  lcp:audits['largest-contentful-paint']?.displayValue||null,
  tbt:audits['total-blocking-time']?.displayValue||null,
  cls:audits['cumulative-layout-shift']?.displayValue||null,
  layoutShiftElements:(audits['layout-shift-elements']?.details?.items||[]).slice(0,5).map(item=>({score:item.score??null,selector:item.node?.selector??null,snippet:item.node?.snippet??null,path:item.node?.path??null})),
  inp:audits['interaction-to-next-paint']?.displayValue||'Not available in this Lighthouse lab report',
  jsTransferBytes:bytes('Script'),cssTransferBytes:bytes('Stylesheet'),requestCount:network.length,
  domNodes:audits['dom-size']?.numericValue??null,longTaskCount:Array.isArray(longTasks)?longTasks.length:'Not exposed by this Lighthouse version',reportPath
 };
 rows.push(row);console.log(JSON.stringify(row));
}
const summaryPath=`${outputDir}/summary.json`;
fs.writeFileSync(summaryPath,JSON.stringify({generatedAt:new Date().toISOString(),environment:{viewport:'360x800 CSS px, DPR 2 (Moto G Power-sized approximation)',network:'simulated slow 4G: 150 ms RTT, 1600 Kbps throughput',cpu:'4x slowdown',note:'Emulation is not a physical Moto G Power device; INP is field data and is not fabricated from lab TBT.'},rows},null,2));
console.log(`\\nSummary written to ${summaryPath}`);
