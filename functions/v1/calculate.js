import { API_VERSION, calculate, error, json, MODEL_LIST } from "./_shared.js";
export async function onRequestOptions() { return new Response(null, { status: 204, headers: { ...({ "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,Authorization", "Access-Control-Max-Age": "86400", Vary: "Origin" }) } }); }
export async function onRequestPost({ request }) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 32768) return error("PAYLOAD_TOO_LARGE", "Request body must be 32 KB or smaller.", 413);
  let body;
  try { body = await request.json(); } catch { return error("INVALID_JSON", "Request body must be valid JSON.", 400); }
  if (!body || typeof body !== "object" || Array.isArray(body) || typeof body.model !== "string" || !body.inputs || typeof body.inputs !== "object" || Array.isArray(body.inputs)) return error("INVALID_REQUEST", "Provide a model string and an inputs object.", 400);
  const model = body.model.toLowerCase();
  const registered = MODEL_LIST.find(item => item.id === model);
  if (!registered) return error("UNSUPPORTED_MODEL", "This model is not available in API version 1.0.0.", 422, { supported_models: MODEL_LIST.map(item => item.id) });
  if (body.model_version && body.model_version !== API_VERSION) return error("UNSUPPORTED_VERSION", "Requested model_version is not supported.", 422, { supported_version: API_VERSION });
  if (body.country && !/^[A-Za-z]{2}$/.test(body.country)) return error("INVALID_COUNTRY", "country must be a two-letter ISO country code.", 400);
  try {
    const output = calculate(model, body.inputs);
    return json({
      model, model_version: API_VERSION, inputs: body.inputs,
      assumptions: { description: output.assumptions, supplied: body.assumptions || {} },
      results: output.results,
      metadata: { engine: "wealth-arrays-api", calculated_at: new Date().toISOString(), country: (body.country || "IN").toUpperCase(), deterministic: true }
    }, 200, { "Cache-Control": "no-store" });
  } catch (e) {
    if (e.unsupported) return error("UNSUPPORTED_MODEL", e.message, 422);
    return error("INVALID_INPUT", e.message || "Inputs could not be calculated.", 400, e.field ? { field: e.field } : undefined);
  }
}
