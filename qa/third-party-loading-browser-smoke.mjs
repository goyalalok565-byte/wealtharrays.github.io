import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const base=(process.env.BASE_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
let analyticsRequests=0,adRequests=0,fundingChoicesRequests=0;
const paintProbe=()=>{
  window.__waFirstPaintAt=null;
  new PerformanceObserver(list=>{
    for(const entry of list.getEntries()){
      if(entry.name==='first-contentful-paint')window.__waFirstPaintAt=entry.startTime;
    }
  }).observe({type:'paint',buffered:true});
};
const noSlot=await browser.newPage({viewport:{width:360,height:800}});
await noSlot.addInitScript(paintProbe);
await noSlot.route('https://www.googletagmanager.com/**',async route=>{
  analyticsRequests++;
  await route.fulfill({status:200,contentType:'application/javascript',body:'window.dataLayer=window.dataLayer||[];'});
});
await noSlot.route('https://pagead2.googlesyndication.com/**',async route=>{
  adRequests++;
  await route.fulfill({status:200,contentType:'application/javascript',body:''});
});
await noSlot.route('https://fundingchoicesmessages.google.com/**',async route=>{
  fundingChoicesRequests++;
  await route.fulfill({status:200,contentType:'application/javascript',body:''});
});
await noSlot.goto(base+'/tools.html',{waitUntil:'load'});
await noSlot.waitForSelector('#wa-consent');
await noSlot.waitForFunction(()=>window.__waFirstPaintAt!==null);
await noSlot.waitForTimeout(500);
assert.equal(analyticsRequests,0,'GA4 must not load before analytics consent');
assert.equal(adRequests,0,'AdSense must not load on a page without ad slots');
assert.equal(fundingChoicesRequests,0,'Funding Choices must not load on a page without ad slots');
await noSlot.locator('#wa-consent [data-wa-consent="accept"]').click();
await noSlot.waitForFunction(()=>Boolean(document.querySelector('script[data-wa-gtag]')));
await noSlot.waitForTimeout(100);
assert.equal(analyticsRequests,1,'GA4 must load after explicit analytics consent');
assert.equal(adRequests,0,'Accepting analytics must not enable AdSense');
await noSlot.close();
function mockFundingChoices(allow){
  window.googlefc=window.googlefc||{};
  window.googlefc.callbackQueue=window.googlefc.callbackQueue||[];
  window.googlefc.ConsentModePurposeStatusEnum={
    CONSENT_MODE_PURPOSE_STATUS_UNKNOWN:0,
    CONSENT_MODE_PURPOSE_STATUS_GRANTED:1,
    CONSENT_MODE_PURPOSE_STATUS_DENIED:2,
    CONSENT_MODE_PURPOSE_STATUS_NOT_APPLICABLE:3,
    CONSENT_MODE_PURPOSE_STATUS_NOT_CONFIGURED:4
  };
  window.googlefc.getGoogleConsentModeValues=function(){
    var value=allow?1:2;
    return {adStoragePurposeConsentStatus:value,adUserDataPurposeConsentStatus:value,adPersonalizationPurposeConsentStatus:value,analyticsStoragePurposeConsentStatus:value};
  };
  window.__waResolveTestConsent=function(){
    var queue=window.googlefc.callbackQueue.splice(0);
    queue.forEach(function(item){if(item&&typeof item.CONSENT_MODE_DATA_READY==='function')item.CONSENT_MODE_DATA_READY();});
  };
  window.__testFundingChoicesLoaded=true;
}
async function runAdConsentCase(allow){
  const page=await browser.newPage({viewport:{width:360,height:800}});
  await page.addInitScript(paintProbe);
  await page.route('https://fundingchoicesmessages.google.com/**',async route=>{
    fundingChoicesRequests++;
    const fcp=await page.evaluate(()=>window.__waFirstPaintAt).catch(()=>null);
    assert.ok(Number.isFinite(fcp),'Funding Choices request must occur after first contentful paint');
    await route.fulfill({status:200,contentType:'application/javascript',body:'('+mockFundingChoices.toString()+')('+JSON.stringify(allow)+');'});
  });
  let pageAdRequests=0;
  await page.route('https://pagead2.googlesyndication.com/**',async route=>{
    pageAdRequests++;adRequests++;
    await route.fulfill({status:200,contentType:'application/javascript',body:''});
  });
  await page.goto(base+'/sip-calculator/',{waitUntil:'load'});
  await page.waitForFunction(()=>window.__waFirstPaintAt!==null);
  await page.evaluate(()=>{
    var slot=document.createElement('ins');
    slot.className='adsbygoogle';
    slot.setAttribute('data-ad-slot','test-slot');
    slot.style.display='block';
    document.body.appendChild(slot);
  });
  await page.waitForFunction(()=>window.__testFundingChoicesLoaded===true);
  await page.waitForFunction(()=>Boolean(document.querySelector('script[data-wa-ad-loader],script[src*="/wa-ad-loader.js"]')));
  await page.waitForTimeout(200);
  assert.equal(pageAdRequests,0,'AdSense must not load before consent data is ready');
  await page.evaluate(()=>window.__waResolveTestConsent());
  if(allow){
    await page.waitForFunction(()=>document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')!==null);
    assert.equal(pageAdRequests,1,'AdSense must load after required consent is granted');
  }else{
    await page.waitForTimeout(300);
    assert.equal(pageAdRequests,0,'AdSense must remain blocked after consent is denied');
  }
  assert.ok(await page.locator('iframe[name="googlefcPresent"]').count(),'Google FC presence iframe must be signalled');
  await page.close();
}
await runAdConsentCase(true);
await runAdConsentCase(false);
await browser.close();
console.log('Third-party loading browser smoke PASS — Google tags wait until after first paint; analytics requires explicit consent; Funding Choices is slot-aware; AdSense loads only after the CMP reports granted or not-applicable ad purposes.');
