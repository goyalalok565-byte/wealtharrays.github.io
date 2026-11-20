import { API_VERSION, CORS_HEADERS, json } from "./_shared.js";

export async function onRequestGet({ env }) {
  let database = "not_configured";
  if (env.DB) {
    try {
      const result = await env.DB.prepare("SELECT 1 AS ok").first();
      database = Number(result?.ok) === 1 ? "ok" : "unavailable";
    } catch {
      database = "unavailable";
    }
  }

  const auth = Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
  const billing = Boolean(
    env.RAZORPAY_KEY_ID &&
    env.RAZORPAY_KEY_SECRET &&
    env.RAZORPAY_PLAN_MONTHLY &&
    env.RAZORPAY_PLAN_YEARLY &&
    env.RAZORPAY_WEBHOOK_SECRET
  );
  const rateLimiter = Boolean(env.PUBLIC_API_LIMITER && typeof env.PUBLIC_API_LIMITER.limit === "function");
  const degraded = database === "unavailable";
  const readyForSaas = database === "ok" && auth && billing && rateLimiter;

  return json({
    status: degraded ? "degraded" : "ok",
    service: "wealth-arrays-api",
    version: API_VERSION,
    ready_for_saas: readyForSaas,
    checked_at: new Date().toISOString(),
    dependencies: {
      calculation_engine: "ok",
      d1_database: database,
      supabase_auth: auth ? "configured" : "not_configured",
      razorpay_billing: billing ? "configured" : "not_configured",
      public_api_rate_limiter: rateLimiter ? "configured" : "not_configured"
    }
  }, degraded ? 503 : 200, { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
