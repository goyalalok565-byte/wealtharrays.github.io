import { CALCULATOR_MODELS } from './calculator-models.js';

export const API_VERSION = '1.0.0';
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin'
};
export const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff', ...CORS_HEADERS, ...extra }
});
export const error = (code, message, status = 400, details = undefined) => json({ error: { code, message, ...(details ? { details } : {}) } }, status, { 'Cache-Control': 'no-store' });

export const MODEL_LIST = CALCULATOR_MODELS.map(calculator => ({
  id: calculator.id, version: API_VERSION, title: calculator.title,
  inputs: calculator.fields.map(field => field.id),
  assumptions: calculator.article?.formula || calculator.short || 'See the calculator page for formula and limitations.'
}));

const LEGACY_INPUT_ALIASES = {
  sip: { rate: 'annualRate' },
  'loan-emi': { rate: 'annualRate', yearsFromMonths: 'months' },
  'home-loan-emi': { rate: 'annualRate', yearsFromMonths: 'months' },
  mortgage: { rate: 'annualRate', yearsFromMonths: 'months' },
  'compound-interest': { rate: 'annualRate', freq: 'compoundingPerYear' },
  'fixed-deposit': { rate: 'annualRate', freq: 'compoundingPerYear' },
  lumpsum: { rate: 'annualRate', freq: 'compoundingPerYear' },
  cagr: { start: 'startValue', end: 'endValue' },
  inflation: { amount: 'currentCost', rate: 'annualInflationRate' },
  'simple-interest': { rate: 'annualRate' }
};
function normalizedInputs(calculator, input) {
  const values = {}, aliases = LEGACY_INPUT_ALIASES[calculator.id] || {}, allowed = new Set(calculator.fields.map(field => field.id));
  for (const [target, alias] of Object.entries(aliases)) {
    if (target === 'yearsFromMonths') continue;
    if (input[target] === undefined && input[alias] !== undefined) input = { ...input, [target]: input[alias] };
  }
  if (calculator.fields.some(field => field.id === 'years') && input.years === undefined && aliases.yearsFromMonths && input[aliases.yearsFromMonths] !== undefined) {
    const months = input[aliases.yearsFromMonths];
    if (typeof months !== 'number' || !Number.isFinite(months) || months <= 0) throw Object.assign(new Error('months must be a positive finite number.'), { field: 'months' });
    input = { ...input, years: months / 12 };
  }
  const ignoredLegacy = new Set(['annualRate','months','compoundingPerYear','startValue','endValue','currentCost','annualInflationRate']);
  for (const key of Object.keys(input)) {
    if (!allowed.has(key) && !ignoredLegacy.has(key) && !['model','assumptions','country','currency'].includes(key)) throw Object.assign(new Error('Unknown input field: '+key+'.'), { field: key });
  }
  for (const field of calculator.fields) {
    let value = input[field.id];
    if (value === undefined || value === null || value === '') value = field.default;
    if (field.type === 'select') {
      value = value === undefined || value === null ? '' : String(value);
      const options = (field.options || []).map(option => String(option.value));
      if (!options.includes(value)) throw Object.assign(new Error(field.id+' must be one of: '+options.join(', ')+'.'), { field: field.id });
      values[field.id] = value; continue;
    }
    if (typeof value !== 'number' || !Number.isFinite(value)) throw Object.assign(new Error(field.id+' must be a finite number.'), { field: field.id });
    if (field.min !== undefined && value < field.min) throw Object.assign(new Error(field.id+' must be at least '+field.min+'.'), { field: field.id });
    if (field.max !== undefined && value > field.max) throw Object.assign(new Error(field.id+' must be no more than '+field.max+'.'), { field: field.id });
    values[field.id] = value;
  }
  return values;
}
export function calculate(model, input) {
  const calculator = CALCULATOR_MODELS.find(item => item.id === model);
  if (!calculator) throw Object.assign(new Error('Unsupported model. Use GET /v1/models to list supported models.'), { unsupported: true });
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('inputs must be a JSON object.');
  const values = normalizedInputs(calculator, input), results = calculator.compute(values);
  if (!Array.isArray(results) || !results.length || results.some(row => !row || typeof row.label !== 'string' || !Number.isFinite(Number(row.value)))) throw new Error('The calculator model returned an invalid or non-finite result.');
  return { results, assumptions: calculator.article?.formula || calculator.short || 'See the calculator page for methodology and limitations.', normalized_inputs: values };
}
