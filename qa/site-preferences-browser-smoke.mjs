import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base=(process.env.BASE_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:375,height:844}});
const errors=[];
page.on('pageerror',error=>errors.push(String(error)));

async function waitForHomeControls(){
  await page.waitForFunction(()=>(
    document.querySelector('#currency-select')?.options.length>=20 &&
    document.querySelector('#wa-emi-principal') &&
    document.querySelector('#wa-emi-rate') &&
    document.querySelector('#wa-emi-years') &&
    document.querySelector('#wa-emi-output')
  ),null,{timeout:12000});
}
async function dismissConsent(){
  const dialog=page.locator('#wa-consent, [role="dialog"][aria-label*="Privacy" i]').first();
  if(await dialog.count()&&await dialog.isVisible().catch(()=>false)){
    const reject=dialog.getByRole('button',{name:/reject(?: all)?|reject optional|essential only|necessary only|decline all|continue without accepting/i}).first();
    if(await reject.count())await reject.click();
    await dialog.waitFor({state:'hidden',timeout:5000}).catch(()=>{});
  }
}
async function fillQuickEmi(){
  await page.locator('#wa-emi-principal').fill('500000');
  await page.locator('#wa-emi-rate').fill('8');
  await page.locator('#wa-emi-years').fill('20');
}
try{
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  await page.locator('#theme-toggle').waitFor({state:'visible',timeout:10000});
  await waitForHomeControls();
  await dismissConsent();

  const initialTheme=await page.evaluate(()=>localStorage.getItem('waTheme')||document.documentElement.dataset.theme||'light');
  const nextTheme=initialTheme==='dark'?'light':'dark';
  await page.locator('#theme-toggle').click();
  await page.waitForFunction(value=>document.documentElement.dataset.theme===value,nextTheme);
  const themeState=await page.evaluate(()=>({
    theme:document.documentElement.dataset.theme,
    stored:localStorage.getItem('waTheme'),
    pressed:document.querySelector('#theme-toggle')?.getAttribute('aria-pressed'),
    label:document.querySelector('[data-theme-label]')?.textContent
  }));
  assert.equal(themeState.theme,nextTheme,'theme button must change the active theme');
  assert.equal(themeState.stored,nextTheme,'theme selection must persist in localStorage');
  assert.equal(themeState.pressed,String(nextTheme==='dark'),'theme button must expose its pressed state');
  assert.ok(themeState.label,'theme button must retain a visible mode label');

  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#theme-toggle').waitFor({state:'visible',timeout:10000});
  await page.waitForFunction(value=>document.documentElement.dataset.theme===value,nextTheme);
  await waitForHomeControls();
  await dismissConsent();
  assert.equal(await page.locator('#currency-select').inputValue(),'INR','fresh browser context should start with default INR currency');

  await fillQuickEmi();
  await page.locator('#currency-select').selectOption('USD');
  await page.waitForFunction(()=>document.querySelector('#wa-emi-output')?.textContent.includes('$'));
  assert.equal(await page.evaluate(()=>localStorage.getItem('waCurrency')),null,'homepage currency choice must not be persisted');
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.currency),'USD','homepage currency choice must update the root currency');

  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#theme-toggle').waitFor({state:'visible',timeout:10000});
  await waitForHomeControls();
  await dismissConsent();
  assert.equal(await page.locator('#currency-select').inputValue(),'INR','homepage currency should return to default after reload');
  await fillQuickEmi();
  await page.waitForFunction(()=>document.querySelector('#wa-emi-output')?.textContent.includes('₹'));

  await page.locator('#currency-select').selectOption('INR');
  await page.waitForFunction(()=>document.querySelector('#wa-emi-output')?.textContent.includes('₹'));
  assert.equal(await page.evaluate(()=>localStorage.getItem('waCurrency')),null,'returning to INR must not create a stored currency preference');

  await page.goto(base+'/tools.html',{waitUntil:'domcontentloaded'});
  await page.locator('#theme-toggle').waitFor({state:'visible',timeout:10000});
  const toolsTheme=await page.evaluate(()=>document.documentElement.dataset.theme||'light');
  const toolsNext=toolsTheme==='dark'?'light':'dark';
  await page.locator('#theme-toggle').click();
  await page.waitForFunction(value=>document.documentElement.dataset.theme===value,toolsNext);
  assert.equal(await page.evaluate(()=>localStorage.getItem('waTheme')),toolsNext,'theme toggle must work on tools page too');

  assert.deepEqual(errors,[],'preference pages must not throw browser errors');
  console.log('Site preferences browser smoke PASS — theme toggles and persists on home/tools; currency changes update Quick EMI without persistence.');
}finally{
  await page.close();
  await browser.close();
}
