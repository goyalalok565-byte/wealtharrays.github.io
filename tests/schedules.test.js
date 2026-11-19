const test=require('node:test');
const assert=require('node:assert/strict');
const {calculator}=require('./helpers');
const ids=['swp','fire','ssy','cost-of-delay','break-even','rule-of-72','rent-vs-buy','budget-50-30-20'];
for(const id of ids)test(`${id} definition has valid unique fields and finite defaults`,()=>{const c=calculator(id);assert.ok(Array.isArray(c.fields)&&c.fields.length>0);const names=c.fields.map(f=>f.id);assert.equal(new Set(names).size,names.length);for(const f of c.fields){assert.ok(f.label);assert.ok(Number.isFinite(Number(f.default)));if(Number.isFinite(f.min))assert.ok(f.default>=f.min);if(Number.isFinite(f.max))assert.ok(f.default<=f.max);}const out=c.compute(Object.fromEntries(c.fields.map(f=>[f.id,f.default])));assert.ok(out.length>0);assert.ok(out.every(x=>Number.isFinite(Number(x.value))));});
