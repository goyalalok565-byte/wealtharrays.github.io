import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require=createRequire(import.meta.url);
const {messages,t,supportedLanguages}=require('../i18n.js');
const languageNames=Object.keys(messages).sort();
assert.deepEqual([...supportedLanguages].sort(),languageNames,'supportedLanguages must match languages with actual message dictionaries');
const baseKeys=Object.keys(messages.en).sort();
assert.ok(baseKeys.length>0,'English fallback dictionary must not be empty');
for(const language of supportedLanguages){
  assert.deepEqual(Object.keys(messages[language]).sort(),baseKeys,language+' must provide every English message key');
  for(const key of baseKeys)assert.equal(typeof messages[language][key],'string',language+'.'+key+' must be a string');
}
for(const key of baseKeys)assert.equal(t(key,'unsupported-language'),messages.en[key],'unknown languages must safely fall back to English');
console.log('Localization dictionary audit PASS — '+supportedLanguages.join(', ')+' have complete dictionaries; unsupported languages are not advertised.');
