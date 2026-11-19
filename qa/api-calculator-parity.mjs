import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CALCULATOR_MODELS } from '../functions/v1/calculator-models.js';
import { calculate, MODEL_LIST } from '../functions/v1/_shared.js';
import { onRequestPost } from '../functions/v1/calculate.js';
const count=JSON.parse(fs.readFileSync('calculator-definitions/registry.json','utf8')).count;
assert.equal(MODEL_LIST.length,count);
assert.equal(CALCULATOR_MODELS.length,count);
for(const calculator of CALCULATOR_MODELS){
 const inputs={};
 for(const field of calculator.fields){
  if(field.type==='select')inputs[field.id]=String(field.default??field.options?.[0]?.value??'');
  else inputs[field.id]=field.default??(field.id==='rate'?1:1);
 }
 const pageResults=calculator.compute({...inputs});
 const apiResults=calculate(calculator.id,inputs).results;
 assert.deepEqual(apiResults,pageResults,calculator.id+': API and page output differ');
 const response=await onRequestPost({request:new Request('https://example.test/v1/calculate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:calculator.id,inputs})})});
 assert.equal(response.status,200,calculator.id+': HTTP API did not accept valid inputs');
 assert.deepEqual((await response.json()).results,pageResults,calculator.id+': HTTP API result differs from page result');
}
const oversized=await onRequestPost({request:new Request('https://example.test/v1/calculate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'sip',inputs:{monthly:1},padding:'x'.repeat(40000)})})});
assert.equal(oversized.status,413);
const invalidCurrency=await onRequestPost({request:new Request('https://example.test/v1/calculate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'sip',inputs:{monthly:1},currency:'INDIA'})})});
assert.equal(invalidCurrency.status,400);
assert.equal((await invalidCurrency.json()).error.code,'INVALID_CURRENCY');
console.log('API/page parity PASS: '+count+'/'+count+' models return identical results; oversized bodies and invalid currency codes are rejected.');
