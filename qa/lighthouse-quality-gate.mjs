import fs from 'node:fs';
export const THRESHOLDS=Object.freeze({
  performance:90,clsValue:0.10,tbtMs:200,lcpMs:2500,
  accessibility:95,bestPractices:80,seo:90
});
export const REQUIRED_ROUTES=Object.freeze([
  '/','/tools.html','/sip-calculator/','/swp-calculator/','/fire-calculator/','/rent-vs-buy-calculator/','/articles/compound-interest-guide.html'
]);
const SCORE_METRICS=['performance','accessibility','bestPractices','seo'];
const TIMING_METRICS=['clsValue','tbtMs','lcpMs'];
const median=values=>{
  const sorted=[...values].sort((a,b)=>a-b);
  return sorted[Math.floor(sorted.length/2)];
};
export function evaluateSummary(summary){
  const rows=summary?.rows||[],failures=[],seen=new Set();
  if(summary?.runsPerRoute!==3)failures.push('Expected exactly three Lighthouse runs per route.');
  if(rows.length!==REQUIRED_ROUTES.length)failures.push('Expected seven Lighthouse routes, found '+rows.length+'.');
  for(const row of rows){
    const route=row?.route||'(unknown route)';
    if(!REQUIRED_ROUTES.includes(route))failures.push(route+': unexpected Lighthouse route.');
    if(seen.has(route))failures.push(route+': duplicate route result.');
    seen.add(route);
    if(!Array.isArray(row?.runs)||row.runs.length!==3){
      failures.push(route+': expected exactly three valid Lighthouse runs; found '+(row?.runs?.length??0)+'.');
      continue;
    }
    const medians={};
    for(const metric of [...SCORE_METRICS,...TIMING_METRICS]){
      const values=row.runs.map(run=>run?.[metric]);
      if(values.some(value=>value==null||!Number.isFinite(value))){
        failures.push(route+': missing or invalid '+metric+' in one or more of the three runs.');
        continue;
      }
      medians[metric]=median(values);
    }
    for(const metric of SCORE_METRICS){
      if(medians[metric]!=null&&medians[metric]<THRESHOLDS[metric])failures.push(route+': median '+metric+' '+medians[metric]+' is below minimum '+THRESHOLDS[metric]+'.');
    }
    for(const metric of TIMING_METRICS){
      if(medians[metric]!=null&&medians[metric]>THRESHOLDS[metric])failures.push(route+': median '+metric+' '+medians[metric]+' exceeds maximum '+THRESHOLDS[metric]+'.');
    }
  }
  for(const route of REQUIRED_ROUTES)if(!seen.has(route))failures.push(route+': required Lighthouse route is missing.');
  return failures;
}
if(process.argv[1]&&process.argv[1].endsWith('lighthouse-quality-gate.mjs')){
  const file=process.argv[2]||'/tmp/wa-lighthouse/summary.json';
  const summary=JSON.parse(fs.readFileSync(file,'utf8'));
  const failures=evaluateSummary(summary);
  console.log('Three-run median release thresholds: Performance ≥90, CLS ≤0.10, TBT ≤200ms, LCP ≤2500ms; accessibility ≥95, best practices ≥80, SEO ≥90.');
  if(failures.length){console.error('MOBILE RELEASE GATE FAILED ('+failures.length+' issues)');console.error(failures.join('\n'));process.exit(1);}
  console.log('MOBILE RELEASE GATE PASS — all seven routes have three valid runs and every median meets every release threshold.');
}
