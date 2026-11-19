import { API_VERSION, calculate, error, json, MODEL_LIST } from './_shared.js';
const MAX_BODY_BYTES = 32 * 1024;
export async function onRequestOptions() {
  return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,Authorization','Access-Control-Max-Age':'86400',Vary:'Origin'}});
}
async function readLimitedBody(request) {
  const declared=Number(request.headers.get('content-length')||0);
  if(declared>MAX_BODY_BYTES)return null;
  if(!request.body)return '';
  const reader=request.body.getReader(),chunks=[];let total=0;
  while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>MAX_BODY_BYTES){await reader.cancel();return null;}chunks.push(value);}
  const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  return new TextDecoder().decode(bytes);
}
export async function onRequestPost({request}) {
  let raw;try{raw=await readLimitedBody(request);}catch{return error('INVALID_BODY','Request body could not be read.',400);}
  if(raw===null)return error('PAYLOAD_TOO_LARGE','Request body must be 32 KB or smaller.',413);
  let body;try{body=JSON.parse(raw);}catch{return error('INVALID_JSON','Request body must be valid JSON.',400);}
  if(!body||typeof body!=='object'||Array.isArray(body)||typeof body.model!=='string'||!body.inputs||typeof body.inputs!=='object'||Array.isArray(body.inputs))return error('INVALID_REQUEST','Provide a model string and an inputs object.',400);
  const model=body.model.toLowerCase(),registered=MODEL_LIST.find(item=>item.id===model);
  if(!registered)return error('UNSUPPORTED_MODEL','This model is not available in API version 1.0.0.',422,{supported_models:MODEL_LIST.map(item=>item.id)});
  if(body.model_version&&body.model_version!==API_VERSION)return error('UNSUPPORTED_VERSION','Requested model_version is not supported.',422,{supported_version:API_VERSION});
  if(body.country!==undefined&&(typeof body.country!=='string'||!/^[A-Za-z]{2}$/.test(body.country)))return error('INVALID_COUNTRY','country must be a two-letter ISO country code.',400);
  if(body.currency!==undefined&&(typeof body.currency!=='string'||!/^[A-Za-z]{3}$/.test(body.currency)))return error('INVALID_CURRENCY','currency must be a three-letter ISO 4217 code.',400);
  if(body.assumptions!==undefined&&(!body.assumptions||typeof body.assumptions!=='object'||Array.isArray(body.assumptions)))return error('INVALID_ASSUMPTIONS','assumptions must be a JSON object.',400);
  try {
    const output=calculate(model,body.inputs);
    return json({model,model_version:API_VERSION,inputs:output.normalized_inputs,assumptions:{description:output.assumptions,supplied:body.assumptions||{}},results:output.results,metadata:{engine:'wealth-arrays-api',calculated_at:new Date().toISOString(),country:body.country?body.country.toUpperCase():null,country_defaulted:!body.country,currency:body.currency?body.currency.toUpperCase():null,jurisdictional_rules_applied:false,jurisdiction_notice:'Country and currency are metadata only; this generic model does not apply country-specific tax or legal rules.',deterministic:true}},200,{'Cache-Control':'no-store'});
  } catch(e) {
    if(e.unsupported)return error('UNSUPPORTED_MODEL',e.message,422);
    return error('INVALID_INPUT',e.message||'Inputs could not be calculated.',400,e.field?{field:e.field}:undefined);
  }
}
