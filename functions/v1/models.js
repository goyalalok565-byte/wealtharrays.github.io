import { API_VERSION, CORS_HEADERS, MODEL_LIST, json } from "./_shared.js";
export async function onRequestOptions() { return new Response(null, { status: 204, headers: CORS_HEADERS }); }
export async function onRequestGet() {
  return json({ api_version: API_VERSION, models: MODEL_LIST }, 200, { "Cache-Control": "public, max-age=300" });
}
