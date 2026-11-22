import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectExpectedNotFoundRedirect } from '../qa/expected-not-found-redirect.mjs';

const html404 = '<!doctype html><html><head><meta name="robots" content="noindex,follow"><title>Page moved</title></head><body>Not found</body></html>';
const response = (status, headers = {}, body = '') => new Response(body, { status, headers });

test('accepts a same-origin 302 → 307 → explicit noindex not-found page', async () => {
  const sequence = [
    response(307, { location: '/404.html/' }),
    response(200, { 'content-type': 'text/html; charset=utf-8' }, html404)
  ];
  const result = await inspectExpectedNotFoundRedirect(
    response(302, { location: '/404.html' }),
    'https://wealtharrays.com',
    async () => sequence.shift()
  );
  assert.equal(result.accepted, true);
  assert.equal(result.terminalStatus, 200);
  assert.equal(result.hops, 2);
});

test('accepts a same-origin terminal 404 response', async () => {
  const result = await inspectExpectedNotFoundRedirect(
    response(302, { location: '/404.html' }),
    'https://wealtharrays.com',
    async () => response(404)
  );
  assert.equal(result.accepted, true);
});

test('rejects redirects that leave the production origin', async () => {
  const result = await inspectExpectedNotFoundRedirect(
    response(302, { location: '/404.html' }),
    'https://wealtharrays.com',
    async () => response(307, { location: 'https://example.com/not-found' })
  );
  assert.equal(result.accepted, false);
  assert.match(result.finalUrl, /^https:\/\/example\.com\//);
});

test('rejects an indexable 200 page as a not-found response', async () => {
  const result = await inspectExpectedNotFoundRedirect(
    response(302, { location: '/404.html' }),
    'https://wealtharrays.com',
    async () => response(200, { 'content-type': 'text/html' }, '<title>Home</title>')
  );
  assert.equal(result.accepted, false);
});

test('rejects a redirect chain longer than five hops', async () => {
  const result = await inspectExpectedNotFoundRedirect(
    response(302, { location: '/404.html' }),
    'https://wealtharrays.com',
    async () => response(307, { location: '/404.html' })
  );
  assert.equal(result.accepted, false);
  assert.equal(result.hops, 5);
});
