import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl=(process.env.BASE_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});
await context.addInitScript(()=>{
  localStorage.setItem('waSupabaseSession',JSON.stringify({
    access_token:'cloud-sync-browser-test-token',
    refresh_token:'cloud-sync-browser-test-refresh',
    expires_at:Math.floor(Date.now()/1000)+3600
  }));
  localStorage.setItem('waAnalyticsConsent','denied');
});
const page=await context.newPage();
const errors=[];
page.on('pageerror',error=>errors.push(String(error)));

async function dismissConsent(){
  const dialog=page.locator('#wa-consent, [role="dialog"][aria-label*="Privacy" i]').first();
  if(await dialog.count()&&await dialog.isVisible().catch(()=>false)){
    const reject=dialog.getByRole('button',{name:/reject(?: all)?|reject optional|essential only|necessary only|decline all|continue without accepting/i}).first();
    if(await reject.count())await reject.click();
    await dialog.waitFor({state:'hidden',timeout:5000}).catch(()=>{});
  }
}

const cases=[
  {path:'/scenario-lab.html',kind:'scenario-lab',save:'#sl-cloud-save',load:'#sl-cloud-load',status:'#sl-status',field:'#sl-start'},
  {path:'/goal-planner.html',kind:'goal-planner',save:'#gp-cloud-save',load:'#gp-cloud-load',status:'#gp-status',field:'#gp-goal'},
  {path:'/financial-workspace.html',kind:'financial-workspace',save:'#fw-cloud-save',load:'#fw-cloud-load',status:'#fw-status',field:'#fw-start'}
];

try{
  for(const item of cases){
    let stored=null;
    let writes=0;
    await page.unrouteAll({behavior:'wait'});
    await page.route('**/v1/security-config',route=>route.fulfill({
      status:200,contentType:'application/json',body:JSON.stringify({configured:true,site_key:'browser-test-site-key'})
    }));
    await page.route('**/turnstile/v0/api.js*',route=>route.fulfill({
      status:200,contentType:'application/javascript',
      body:`window.turnstile={render:function(container,options){window.__waTurnstileOptions=options;return 'browser-test-widget';},reset:function(){},execute:function(){Promise.resolve().then(function(){window.__waTurnstileOptions.callback('browser-test-turnstile-token');});}};`
    }));
    await page.route('**/v1/scenarios',async route=>{
      const request=route.request();
      const headers=request.headers();
      assert.equal(headers.authorization,'Bearer cloud-sync-browser-test-token','cloud request must use the signed-in session token');
      if(request.method()==='POST'){
        assert.equal(headers['cf-turnstile-response'],'browser-test-turnstile-token','cloud writes must carry a verified one-time Turnstile token');
        const body=request.postDataJSON();
        assert.equal(body.calculator_id,item.kind,'cloud save must use the correct workspace id');
        assert.ok(body.inputs&&typeof body.inputs==='object','cloud save must include plan inputs');
        assert.equal(body.results,null,'planning workspaces should store inputs and recalculate after loading');
        writes++;
        stored={id:'browser-test-'+item.kind,calculator_id:body.calculator_id,name:body.name,inputs:body.inputs,created_at:new Date().toISOString()};
        await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({saved:true,scenario:stored,entitlement:{tier:'free',used:1,limit:3}})});
      }else{
        await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({scenarios:stored?[stored]:[],entitlement:{tier:'free',used:stored?1:0,limit:3}})});
      }
    });
    // Do not wait for networkidle: third-party analytics/ads or persistent requests
    // can keep a static page busy even after the app is fully usable.
    await page.goto(baseUrl+item.path,{waitUntil:'domcontentloaded'});
    await page.locator(item.save).waitFor({state:'visible',timeout:15000});
    await dismissConsent();
    const original=await page.locator(item.field).inputValue();
    await page.locator(item.save).click();
    await page.waitForFunction(selector=>document.querySelector(selector)?.textContent.toLowerCase().includes('synced'),item.status,{timeout:15000});
    assert.equal(writes,1,item.kind+' must issue exactly one cloud save');
    assert.ok(stored,'cloud save should persist a plan snapshot');
    await page.locator(item.field).fill('999999');
    await page.locator(item.load).click();
    await page.waitForFunction(selector=>document.querySelector(selector)?.textContent.toLowerCase().includes('loaded'),item.status,{timeout:15000});
    assert.equal(await page.locator(item.field).inputValue(),original,item.kind+' must restore saved inputs');
  }
  assert.deepEqual(errors,[],'cloud sync pages must not throw browser errors');
  console.log('Cloud workspace sync browser smoke PASS — authenticated save/load verified for Scenario Lab, Goal Planner and Financial Workspace.');
}finally{
  await context.close();
  await browser.close();
}
