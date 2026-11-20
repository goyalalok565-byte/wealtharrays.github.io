import { authenticate, ensureProfile } from "./_auth.js";
import { error, json, CORS_HEADERS } from "./_shared.js";
import { getEntitlement } from "./_entitlements.js";

const reportCors = { ...CORS_HEADERS, "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS" };
export async function onRequestOptions() { return new Response(null, { status: 204, headers: reportCors }); }

export async function onRequestGet({ request, env }) {
  const auth = await authenticate(request, env);
  if (auth.response) return auth.response;
  if (!env.DB) return error("DATABASE_NOT_CONFIGURED", "Report archive storage is not configured.", 503);
  try {
    await ensureProfile(env, auth.user);
    const id = new URL(request.url).searchParams.get("id");
    if (id) {
      if (id.length > 80) return error("INVALID_ID", "Provide a valid report id.", 400);
      const row = await env.DB.prepare("SELECT report_json FROM saved_reports WHERE id = ? AND user_id = ?").bind(id, auth.user.id).first();
      if (!row) return error("NOT_FOUND", "Report not found.", 404);
      let report;
      try { report = JSON.parse(row.report_json); } catch { return error("REPORT_CORRUPT", "This saved report could not be read.", 500); }
      return json({ report }, 200, { "Cache-Control": "no-store" });
    }
    const [rows, count, entitlement] = await Promise.all([
      env.DB.prepare("SELECT id, name, model, model_version, currency, fingerprint, created_at FROM saved_reports WHERE user_id = ? ORDER BY created_at DESC LIMIT 100").bind(auth.user.id).all(),
      env.DB.prepare("SELECT COUNT(*) AS total FROM saved_reports WHERE user_id = ?").bind(auth.user.id).first(),
      getEntitlement(env, auth.user.id)
    ]);
    return json({
      reports: rows.results || [],
      entitlement: { tier: entitlement.tier, used: Number(count?.total || 0), cloud_report_limit: entitlement.cloud_report_limit }
    }, 200, { "Cache-Control": "no-store" });
  } catch { return error("DATABASE_ERROR", "Could not load your saved reports.", 500); }
}

export async function onRequestPost({ request, env }) {
  const auth = await authenticate(request, env);
  if (auth.response) return auth.response;
  if (!env.DB) return error("DATABASE_NOT_CONFIGURED", "Report archive storage is not configured.", 503);
  let raw, body;
  try { raw = await request.text(); } catch { return error("INVALID_BODY", "Could not read request body.", 400); }
  if (raw.length > 65536) return error("PAYLOAD_TOO_LARGE", "A saved report must be 64 KB or smaller.", 413);
  try { body = JSON.parse(raw); } catch { return error("INVALID_JSON", "Request body must be valid JSON.", 400); }
  const report = body?.report;
  const object = value => value && typeof value === "object" && !Array.isArray(value);
  if (!object(report) || typeof report.model !== "string" || !report.model.trim() || report.model.length > 120 ||
      typeof report.modelVersion !== "string" || !report.modelVersion.trim() || report.modelVersion.length > 80 ||
      typeof report.currency !== "string" || !/^[A-Z]{3}$/.test(report.currency) ||
      !object(report.inputs) || !object(report.assumptions) ||
      !Array.isArray(report.scenarios) || !Array.isArray(report.stressTests) ||
      !Array.isArray(report.sources) || !Array.isArray(report.limitations) ||
      typeof body.fingerprint !== "string" || !/^[a-f0-9]{8}$/i.test(body.fingerprint)) {
    return error("INVALID_REPORT", "Provide a reproducible report with model/version, ISO currency, inputs, assumptions, scenarios, stress tests, sources, limitations and an 8-character fingerprint.", 400);
  }
  const name = String(body.name || report.model).trim().slice(0, 120);
  if (!name) return error("INVALID_NAME", "Report name cannot be empty.", 400);
  const reportJson = JSON.stringify(report);
  if (reportJson.length > 60000) return error("PAYLOAD_TOO_LARGE", "The report content must be 60 KB or smaller.", 413);
  try {
    await ensureProfile(env, auth.user);
    const entitlement = await getEntitlement(env, auth.user.id);
    const count = await env.DB.prepare("SELECT COUNT(*) AS total FROM saved_reports WHERE user_id = ?").bind(auth.user.id).first();
    const used = Number(count?.total || 0);
    if (used >= entitlement.cloud_report_limit) {
      const isFree = entitlement.tier === "free";
      return error(isFree ? "FREE_REPORT_LIMIT_REACHED" : "REPORT_LIMIT_REACHED",
        isFree ? "The Free plan includes 1 saved report. Upgrade to Pro to keep up to 100 reports in your account." : "Your Pro report archive is full. Delete an older report to continue.",
        403, { tier: entitlement.tier, used, limit: entitlement.cloud_report_limit, upgrade_url: "/account" });
    }
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(reportJson));
    const contentHash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
    const id = crypto.randomUUID();
    const inserted = await env.DB.prepare(
      "INSERT INTO saved_reports (id, user_id, name, model, model_version, currency, fingerprint, content_sha256, report_json) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM saved_reports WHERE user_id = ?) < ?"
    ).bind(id, auth.user.id, name, report.model, report.modelVersion, report.currency, body.fingerprint, contentHash, reportJson, auth.user.id, entitlement.cloud_report_limit).run();
    if (!inserted.meta?.changes) return error(entitlement.tier === "free" ? "FREE_REPORT_LIMIT_REACHED" : "REPORT_LIMIT_REACHED", "Your report archive limit has been reached. Delete an older report or review Pro access.", 403, { used, limit: entitlement.cloud_report_limit, upgrade_url: "/account" });
    return json({ saved: true, id, fingerprint: body.fingerprint, entitlement: { tier: entitlement.tier, used: used + 1, cloud_report_limit: entitlement.cloud_report_limit } }, 201, { "Cache-Control": "no-store" });
  } catch { return error("DATABASE_ERROR", "Could not save this report.", 500); }
}

export async function onRequestDelete({ request, env }) {
  const auth = await authenticate(request, env);
  if (auth.response) return auth.response;
  if (!env.DB) return error("DATABASE_NOT_CONFIGURED", "Report archive storage is not configured.", 503);
  const id = new URL(request.url).searchParams.get("id");
  if (!id || id.length > 80) return error("INVALID_ID", "Provide a valid report id.", 400);
  try {
    const result = await env.DB.prepare("DELETE FROM saved_reports WHERE id = ? AND user_id = ?").bind(id, auth.user.id).run();
    if (!result.meta?.changes) return error("NOT_FOUND", "Report not found.", 404);
    return json({ deleted: true, id }, 200, { "Cache-Control": "no-store" });
  } catch { return error("DATABASE_ERROR", "Could not delete this report.", 500); }
}
