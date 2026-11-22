import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../phase4-premium.js', import.meta.url), 'utf8');

test('shared-control observer watches only the masthead subtree', () => {
  assert.match(source, /var mastheadControls\s*=\s*document\.querySelector\('\.masthead-controls'\)/);
  assert.match(source, /\.observe\(mastheadControls,\s*\{childList:true,subtree:true\}\)/);
  assert.doesNotMatch(source, /\.observe\(document\.body,\s*\{childList:true,subtree:true\}\)/);
  assert.match(source, /controls\.querySelectorAll\('#'\+id\)/);
  assert.doesNotMatch(source, /document\.querySelectorAll\('#'\+id\)/);
});
