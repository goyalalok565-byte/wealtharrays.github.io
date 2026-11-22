import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSummary,THRESHOLDS,REQUIRED_ROUTES } from '../qa/lighthouse-quality-gate.mjs';
const goodRun=()=>({performance:94,accessibility:97,bestPractices:90,seo:96,clsValue:0.01,tbtMs:120,lcpMs:1800});
const makeSummary=mutate=>{
  const summary={runsPerRoute:3,rows:REQUIRED_ROUTES.map(route=>({route,runs:[goodRun(),goodRun(),goodRun()]}))};
  if(mutate)mutate(summary);
  return summary;
};
test('release thresholds remain unchanged',()=>assert.deepEqual(THRESHOLDS,{performance:90,clsValue:0.10,tbtMs:200,lcpMs:2500,accessibility:95,bestPractices:80,seo:90}));
test('accepts seven routes with three valid runs when each median passes',()=>assert.deepEqual(evaluateSummary(makeSummary()),[]));
test('uses median for the gate while retaining outlier runs for reporting',()=>{
  const summary=makeSummary(value=>{value.rows[0].runs[0].tbtMs=900;value.rows[0].runs[0].performance=70;});
  assert.deepEqual(evaluateSummary(summary),[]);
  assert.equal(summary.rows[0].runs.length,3);
});
test('fails when a route has fewer than three runs',()=>{
  const summary=makeSummary(value=>{value.rows[0].runs.pop();});
  assert.ok(evaluateSummary(summary).some(message=>message.includes('exactly three valid Lighthouse runs')));
});
test('fails when any run is missing a required metric',()=>{
  const summary=makeSummary(value=>{value.rows[1].runs[2].tbtMs=null;});
  assert.ok(evaluateSummary(summary).some(message=>message.includes('missing or invalid tbtMs')));
});
test('fails when the median misses a strict score or timing threshold',()=>{
  const summary=makeSummary(value=>{
    value.rows[0].runs[0].performance=80;value.rows[0].runs[1].performance=85;value.rows[0].runs[2].performance=90;
    value.rows[1].runs.forEach(run=>{run.lcpMs=3000;});
  });
  const failures=evaluateSummary(summary);
  assert.ok(failures.some(message=>message.includes('median performance')));
  assert.ok(failures.some(message=>message.includes('median lcpMs')));
});
test('fails for missing, duplicate, unexpected routes and a non-three-run declaration',()=>{
  const summary=makeSummary(value=>{
    value.runsPerRoute=2;value.rows[1].route=value.rows[0].route;value.rows.pop();
    value.rows.push({route:'/unexpected/',runs:[goodRun(),goodRun(),goodRun()]});
  });
  const failures=evaluateSummary(summary);
  assert.ok(failures.some(message=>message.includes('exactly three Lighthouse runs')));
  assert.ok(failures.some(message=>message.includes('duplicate route')));
  assert.ok(failures.some(message=>message.includes('unexpected Lighthouse route')));
  assert.ok(failures.some(message=>message.includes('required Lighthouse route is missing')));
});
