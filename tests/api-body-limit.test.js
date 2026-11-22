import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost } from '../functions/v1/calculate.js';

const encoder = new TextEncoder();
const valid = JSON.stringify({ model: 'simple-interest', inputs: { principal: 1000, annualRate: 5, years: 2 } });

function makeRequest(bytes, headers = {}) {
  return {
    headers: new Headers(headers),
    body: new ReadableStream({
      start(controller) {
        for (let i = 0; i < bytes.length; i += 1024) controller.enqueue(bytes.slice(i, i + 1024));
        controller.close();
      }
    })
  };
}
const bytes = value => encoder.encode(value);
function paddedPayload(targetBytes) {
  const prefix = valid.slice(0, -1) + ',"padding":"';
  const paddingLength = targetBytes - bytes(prefix).byteLength - 2;
  if (paddingLength < 0) throw new Error('Target size is too small');
  return bytes(prefix + 'x'.repeat(paddingLength) + '"}');
}
const call = async (payload, headers) => onRequestPost({ request: makeRequest(payload, headers) });

test('rejects oversized body when Content-Length is absent', async () => {
  assert.equal((await call(bytes(valid + ' '.repeat(32769)), {})).status, 413);
});
test('rejects body larger than a misleading smaller Content-Length', async () => {
  assert.equal((await call(bytes(valid + ' '.repeat(32769)), { 'content-length': String(valid.length) })).status, 413);
});
test('accepts an exactly 32768-byte valid JSON request', async () => {
  const payload = paddedPayload(32768);
  assert.equal(payload.byteLength, 32768);
  assert.equal((await call(payload, {})).status, 200);
});
test('rejects 32769 bytes', async () => {
  assert.equal((await call(paddedPayload(32769), {})).status, 413);
});
test('valid request passes', async () => {
  assert.equal((await call(bytes(valid), {})).status, 200);
});
test('malformed JSON returns 400', async () => {
  const response = await call(bytes('{not-json'), {});
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, 'INVALID_JSON');
});
test('invalid UTF-8 returns 400', async () => {
  const response = await call(new Uint8Array([0xff, 0xfe]), {});
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, 'INVALID_JSON');
});
