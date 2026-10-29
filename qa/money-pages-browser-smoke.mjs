import { chromium } from 'playwright';

const baseUrl = (process.env.BASE_URL || 'https://wealtharrays.com').replace(/\/$/, '');
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 375, height: 844 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [];
const failedResponses = [];
const expectedCspWarning = text => /^\[Report Only\]/i.test(text) || /Refused to execute inline script because it violates the following Content Security Policy directive/i.test(text);
page.on('pageerror', error => errors.push(String(error)));
page.on('console', message => {
  if (message.type() === 'error' && !expectedCspWarning(message.text()) && !/googlesyndication|doubleclick|fonts\.(googleapis|gstatic)|fundingchoices|ERR_BLOCKED_BY_CLIENT/i.test(message.text())) errors.push(message.text());
});
page.on('response', response => {
  if (response.status() >= 400 && new URL(response.url()).origin === new URL(baseUrl).origin) failedResponses.push(response.status() + ' ' + response.url());
});

async function openPage(path, label, width) {
  errors.length = 0;
  failedResponses.length = 0;
  await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
  await page.goto(baseUrl + '/' + path, { waitUntil: 'networkidle' });
  if ((await page.locator('h1').count()) !== 1) throw new Error(label + ' must have exactly one H1 at ' + width + 'px');
  const layout = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    hasResponsiveCss: !!document.querySelector('link[rel="stylesheet"][href*="money-pages-responsive.css"]')
  }));
  if (!layout.hasResponsiveCss) throw new Error(label + ' did not load the responsive stylesheet');
  if (layout.document > layout.viewport + 2) throw new Error(label + ' overflows horizontally at ' + width + 'px (' + layout.document + 'px document)');
}
async function assertChanges(label, input, output, value, button) {
  const initial = (await page.locator(output).innerText()).trim();
  if (initial && !/^—$/.test(initial) && !/click .*calculate|enter your numbers/i.test(initial)) {
    throw new Error(label + ' showed a result before Calculate was clicked: ' + initial);
  }
  await page.locator(input).fill(String(value));
  const whileEditing = (await page.locator(output).innerText()).trim();
  if (whileEditing !== initial) throw new Error(label + ' recalculated automatically while editing inputs');
  await page.locator(button).click();
  const after = (await page.locator(output).innerText()).trim();
  if (!after || /NaN|Infinity|undefined|^—$/.test(after) || after === initial) {
    throw new Error(label + ' did not return a finite result after Calculate (before: ' + initial + ', after: ' + after + ')');
  }
}
function assertClean(label, width) {
  if (errors.length) throw new Error(label + ' browser errors at ' + width + 'px: ' + errors.join(' | '));
  if (failedResponses.length) throw new Error(label + ' failed requests at ' + width + 'px: ' + failedResponses.join(' | '));
}

try {
  for (const width of [375, 768, 1280]) {
    await openPage('financial-workspace', 'My Money Plan', width);
    await assertChanges('My Money Plan', '#fw-start', '#fw-future', width < 600 ? 50000 : 75000, '#fw-form button[type="submit"]');
    assertClean('My Money Plan', width);

    await openPage('scenario-lab', 'Compare Options', width);
    await assertChanges('Compare Options', '#sl-contribution', '#sl-base-today', width < 600 ? 1500 : 2200, '#scenario-form button[type="submit"]');
    assertClean('Compare Options', width);

    await openPage('goal-planner', 'Savings Goal Planner', width);
    await assertChanges('Savings Goal Planner', '#gp-monthly', '#gp-result', width < 600 ? 2500 : 3500, '#goal-form button[type="submit"]');
    assertClean('Savings Goal Planner', width);

    await openPage('advanced-finance-tools/', 'Everyday Money Tools', width);
    const cases = [
      ['GST calculator', '#ga', '#go', 250000, '[data-result="go"]'],
      ['Loan comparison', '#lp', '#lo', 2000000, '[data-result="lo"]'],
      ['Loan affordability', '#ae', '#ao', 25000, '[data-result="ao"]'],
      ['Rent comparison', '#rm', '#ro', 40000, '[data-result="ro"]'],
      ['Gold jewellery estimate', '#goldr', '#goldo', 12000, '[data-result="goldo"]'],
      ['Monthly budget', '#bi', '#bo', 150000, '[data-result="bo"]'],
      ['Savings contribution', '#st', '#so', 900000, '[data-result="so"]'],
      ['Exchange-rate conversion', '#fa', '#fo', 200000, '[data-result="fo"]']
    ];
    for (const [label, input, output, value, button] of cases) {
      await assertChanges(label, input, output, value, button);
    }
    assertClean('Everyday Money Tools', width);
    console.log('Money pages passed at ' + width + 'px.');
  }
  console.log('Production money-page browser smoke PASS: all four pages fit mobile, tablet and desktop widths; all 11 tested calculations stayed blank while editing and updated only after clicking Calculate.');
} finally {
  await browser.close();
}
