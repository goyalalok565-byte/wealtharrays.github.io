import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const consent = fs.readFileSync(new URL('../consent-loader.js', import.meta.url), 'utf8');
const theme = fs.readFileSync(new URL('../theme-init.js', import.meta.url), 'utf8');

test('Funding Choices is deferred until the first-render window or immediate interaction', () => {
  assert.match(consent, /setTimeout\(function \(\) \{[\s\S]*?\}, 3200\)/);
  assert.match(consent, /requestIdleCallback\(loadFundingChoices, \{ timeout: 1000 \}\)/);
  assert.match(consent, /window\.__waAdsInteractionRequested/);
  assert.match(consent, /wa:load-fundingchoices/);
});

test('ad requests stay paused until Funding Choices is ready and the resume gate is met', () => {
  assert.match(theme, /ads\.pauseAdRequests = 1/);
  assert.match(theme, /if \(window\.__waFundingChoicesExpected && !window\.__waFundingChoicesReady\) return/);
  assert.match(theme, /ads\.pauseAdRequests = 0/);
  assert.match(theme, /DOMContentLoaded/);
  assert.match(theme, /wa:fundingchoices-ready/);
});
