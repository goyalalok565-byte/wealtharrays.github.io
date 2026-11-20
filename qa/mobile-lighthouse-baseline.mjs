import fs from 'node:fs';
import { runLighthouse } from './lighthouse-runner.mjs';
const base=(process.env.BASE_URL||'https://wealtharrays.com').replace(/\/$/,'');
const paths=['/','/tools.html','/sip-calculator/','/swp-calculator/','/fire-calculator/','/rent-vs-buy-calculator/','/articles/compound-interest-guide.html'];
const outputDir=process.env.LH_OUTPUT_DIR||'/tmp/wa-lighthouse';
const RUNS_PER_ROUTE=3;
fs.mkdirSync(outputDir,{recursive:true});
const median=values=>{
  if(values.some(value=>value==null||!Number.isFinite(value)))return null;
  const sorted=[...values].sort((a,b)=>a-b);
  return sorted[Math.floor(sorted.length/2)];
};
const extrema=(values,kind)=>{
  const valid=values.filter(value=>value!=null&&Number.isFinite(value));
  if(!valid.length)return null;
  return kind==='min'?Math.min(...valid):Math.max(...valid);
};
const score=(report,category)=>{
  const value=report.categories?.[category]?.score;
  return value==null?null:Math.round(value*100);
};
const metric=(report,id)=>report.audits?.[id]?.numericValue??null;
const rows=[];
for(const route of paths){
  const safe=route.replace(/[^a-z0-9]+/gi,'_').replace(/^_|_$/g,'')||'home';
  const runs=[];
  const url=base+route;
  console.log('\n=== Lighthouse 3-run series: '+url+' ===');
  for(let run=1;run<=RUNS_PER_ROUTE;run++){
    const reportPath=outputDir+'/'+safe+'-run'+run+'.json';
    const args=[
      url,'--form-factor=mobile','--screenEmulation.mobile=true',
      '--screenEmulation.width=360','--screenEmulation.height=800',
      '--screenEmulation.deviceScaleFactor=2','--throttling-method=simulate',
      '--throttling.rttMs=150','--throttling.throughputKbps=1600',
      '--throttling.cpuSlowdownMultiplier=4',
      '--only-categories=performance,accessibility,best-practices,seo',
      '--output=json','--output-path='+reportPath,
      '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage'
    ];
    if(route==='/')args.push('--save-assets');
    try{
      runLighthouse(args,'Lighthouse '+route+' run '+run+'/3');
      const report=JSON.parse(fs.readFileSync(reportPath,'utf8'));
      const audits=report.audits||{};
      const network=audits['network-requests']?.details?.items||[];
      const bytes=type=>network.filter(item=>item.resourceType===type).reduce((sum,item)=>sum+(Number(item.transferSize)||0),0);
      const longTasks=audits['long-tasks']?.details?.items;
      const row={
        run,performance:score(report,'performance'),accessibility:score(report,'accessibility'),
        bestPractices:score(report,'best-practices'),seo:score(report,'seo'),
        clsValue:metric(report,'cumulative-layout-shift'),tbtMs:metric(report,'total-blocking-time'),
        lcpMs:metric(report,'largest-contentful-paint'),
        fcp:audits['first-contentful-paint']?.displayValue||null,
        lcp:audits['largest-contentful-paint']?.displayValue||null,
        tbt:audits['total-blocking-time']?.displayValue||null,
        cls:audits['cumulative-layout-shift']?.displayValue||null,
        inp:audits['interaction-to-next-paint']?.displayValue||'Not available in this Lighthouse lab report',
        jsTransferBytes:bytes('Script'),cssTransferBytes:bytes('Stylesheet'),
        requestCount:network.length,domNodes:audits['dom-size']?.numericValue??null,
        longTaskCount:Array.isArray(longTasks)?longTasks.length:null,reportPath
      };
      runs.push(row);
      if(route==='/'&&!fs.existsSync(outputDir+'/home.json'))fs.copyFileSync(reportPath,outputDir+'/home.json');
      console.log(JSON.stringify({route,run,...row}));
    }catch(error){
      console.error('Invalid Lighthouse run '+run+' for '+route+': '+error.message);
      runs.push({run,performance:null,accessibility:null,bestPractices:null,seo:null,clsValue:null,tbtMs:null,lcpMs:null,error:error.message,reportPath});
    }
  }
  const keys=['performance','accessibility','bestPractices','seo','clsValue','tbtMs','lcpMs'];
  const medianMetrics=Object.fromEntries(keys.map(key=>[key,median(runs.map(run=>run[key]))]));
  const worstCase={
    minimumScores:{
      performance:extrema(runs.map(run=>run.performance),'min'),
      accessibility:extrema(runs.map(run=>run.accessibility),'min'),
      bestPractices:extrema(runs.map(run=>run.bestPractices),'min'),
      seo:extrema(runs.map(run=>run.seo),'min')
    },
    maximumTimings:{
      clsValue:extrema(runs.map(run=>run.clsValue),'max'),
      tbtMs:extrema(runs.map(run=>run.tbtMs),'max'),
      lcpMs:extrema(runs.map(run=>run.lcpMs),'max')
    }
  };
  rows.push({route,runs,median:medianMetrics,worstCase});
}
const summaryPath=outputDir+'/summary.json';
fs.writeFileSync(summaryPath,JSON.stringify({
  generatedAt:new Date().toISOString(),runsPerRoute:RUNS_PER_ROUTE,
  environment:{
    viewport:'360x800 CSS px, DPR 2 (Moto G Power-sized approximation)',
    network:'simulated slow 4G: 150 ms RTT, 1600 Kbps throughput',
    cpu:'4x slowdown',
    note:'Three independent Lighthouse runs per route. Release thresholds are evaluated against the median; worst-case scores and maximum timings are retained for diagnostics. Emulation is not a physical Moto G Power device; INP is field data and is not fabricated from lab TBT.'
  },
  rows
},null,2));
console.log('\nThree-run median summary written to '+summaryPath);
