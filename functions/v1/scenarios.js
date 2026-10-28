import { authenticate, ensureProfile } from "./_auth.js";
import { error, json, CORS_HEADERS } from "./_shared.js";
export async function onRequestOptions() { return new Response(null, { status: 204, headers: CORS_HEADERS }); }
export async function onRequestGet({ request, env }) {
  const auth = await authenticate(request, env); if (auth.response) return auth.response;
  if (!env.DB) return error("DATABASE_NOT_CONFIGURED", "Cloud scenario storage is not configured for this deployment.", 503);
  try {
    await ensureProfile(env, auth.user);
    const rows = await env.DB.prepare("SELECT id, calculator_id, name, model_version, inputs_json, results_json, created_at, updated_at FROM saved_scenarios WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100").bind(auth.user.id).all();
    const subscription = await env.DB.prepare("SELECT plan_id, status, current_period_end, cancel_at_period_end FROM subscriptions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1").bind(auth.user.id).first();
    return json({ scenarios: (rows.results || []).map(row => ({ ...row, inputs: parseJson(row.inputs_json), results: parseJson(row.results_json) })), subscription: subscription || null }, 200, { "Cache-Control": "no-store" });
  } catch { return error("DATABASE_ERROR", "Could not load your saved scenarios.", 500); }
}
export async function onRequestPost({ request, env }) {
  const auth = await authenticate(request, env); if (auth.response) return auth.response;
  if (!env.DB) return error("DATABASE_NOT_CONFIGURED", "Cloud scenario storage is not configured for this deployment.", 503);
  let raw, body;
  try { raw = await request.text(); } catch { return error("INVALID_BODY", "Could not read request body.", 400); }
  if (raw.length > 16384) return error("PAYLOAD_TOO_LARGE", "Scenario payload must be 16 KB or smaller.", 413);
  try { body = JSON.parse(raw); } catch { return error("INVALID_JSON", "Request body must be valid JSON.", 400); }
  if (!body || typeof body.calculator_id !== "string" || !/^[a-z0-9-]{1,80}$/.test(body.calculator_id) || !body.inputs || typeof body.inputs !== "object" || Array.isArray(body.inputs)) return error("INVALID_SCENARIO", "Provide calculator_id and an inputs object.", 400);
  const name = String(body.name || "Saved scenario").trim().slice(0, 120);
  const modelVersion = String(body.model_version || "client-v1").slice(0, 80);
  const id = crypto.randomUUID(), inputs = JSON.stringify(body.inputs), results = body.results && typeof body.results === "object" ? JSON.stringify(body.results) : null;
  try {
    await ensureProfile(env, auth.user);
    await env.DB.prepare("INSERT INTO saved_scenarios (id, user_id, calculator_id, name, model_version, inputs_json, results_json) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(id, auth.user.id, body.calculator_id, name, modelVersion, inputs, results).run();
    return json({ saved: true, id, name, calculator_id: body.calculator_id }, 201, { "Cache-Control": "no-store" });
  } catch { return error("DATABASE_ERROR", "Could not save this scenario.", 500); }
}
export async function onRequestDelete({ request, env }) {
  const auth = await authenticate(request, env); if (auth.response) return auth.response;
  if (!env.DB) return error("DATABASE_NOT_CONFIGURED", "Cloud scenario storage is not configured for this deployment.", 503);
  const id = new URL(request.url).searchParams.get("id");
  if (!id || id.length > 80) return error("INVALID_ID", "Provide a valid scenario id.", 400);
  try {
    const result = await env.DB.prepare("DELETE FROM saved_scenarios WHERE id = ? AND user_id = ?").bind(id, auth.user.id).run();
    if (!result.meta?.changes) return error("NOT_FOUND", "Scenario not found.", 404);
    return json({ deleted: true, id }, 200, { "Cache-Control": "no-store" });
  } catch { return error("DATABASE_ERROR", "Could not delete this scenario.", 500); }
}
function parseJson(value) { if (!value) return null; try { return JSON.parse(value); } catch { return null; } }
