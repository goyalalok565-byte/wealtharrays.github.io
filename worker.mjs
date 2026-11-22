import * as models from "./functions/v1/models.js";
import * as health from "./functions/v1/health.js";
import * as calculate from "./functions/v1/calculate.js";
import * as fx from "./functions/v1/fx.js";
import * as indiaTax from "./functions/v1/india-tax.js";
import * as authConfig from "./functions/v1/auth-config.js";
import * as securityConfig from "./functions/v1/security-config.js";
import * as scenarios from "./functions/v1/scenarios.js";
import * as checkout from "./functions/v1/billing/checkout.js";
import * as billingStatus from "./functions/v1/billing/status.js";
import * as billingConfig from "./functions/v1/billing/config.js";
import * as cancelSubscription from "./functions/v1/billing/cancel.js";
import * as billingWebhook from "./functions/v1/billing/webhook.js";

const ROUTES = new Map([
  ["/v1/health", health],
  ["/v1/models", models],
  ["/v1/calculate", calculate],
  ["/v1/fx", fx],
  ["/v1/india-tax", indiaTax],
  ["/v1/auth-config", authConfig],
  ["/v1/security-config", securityConfig],
  ["/v1/scenarios", scenarios],
  ["/v1/billing/checkout", checkout],
  ["/v1/billing/status", billingStatus],
  ["/v1/billing/config", billingConfig],
  ["/v1/billing/cancel", cancelSubscription],
  ["/v1/billing/webhook", billingWebhook]
]);
const ALLOWED_ORIGINS = new Set(["https://wealtharrays.com", "https://www.wealtharrays.com"]);
const PUBLIC_RATE_LIMIT_PATHS = new Set(["/v1/calculate", "/v1/india-tax", "/v1/fx"]);
const WRITE_PATHS = new Set(["/v1/scenarios", "/v1/billing/checkout", "/v1/billing/cancel"]);
const CORS_METHODS = "GET,POST,DELETE,OPTIONS";
const CORS_HEADERS = "Content-Type,Authorization,X-Razorpay-Signature,cf-turnstile-response";
function jsonError(code, message, status = 404) {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}
function withCors(response, request) {
  const headers = new Headers(response.headers);
  headers.delete("Access-Control-Allow-Origin");
  const origin = request.headers.get("Origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", CORS_METHODS);
  headers.set("Access-Control-Allow-Headers", CORS_HEADERS);
  headers.set("Access-Control-Max-Age", "86400");
  headers.set("Vary", "Origin");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
function methodHandler(route, method) {
  if (method === "OPTIONS") return route.onRequestOptions;
  if (method === "GET") return route.onRequestGet;
  if (method === "POST") return route.onRequestPost;
  if (method === "DELETE") return route.onRequestDelete;
  return null;
}
async function verifyTurnstile(request, env) {
  if (!env.TURNSTILE_SECRET_KEY) return jsonError("TURNSTILE_NOT_CONFIGURED", "Request verification is not configured for this deployment.", 503);
  let token = request.headers.get("cf-turnstile-response") || "";
  if (!token && request.method !== "DELETE") {
    try {
      const body = await request.clone().json();
      token = typeof body?.turnstile_token === "string" ? body.turnstile_token : "";
    } catch {}
  }
  if (!token || token.length > 2048) return jsonError("TURNSTILE_REQUIRED", "Complete the request verification and try again.", 403);
  try {
    const form = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
    const ip = request.headers.get("cf-connecting-ip");
    if (ip) form.set("remoteip", ip);
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success !== true) return jsonError("TURNSTILE_FAILED", "Request verification failed. Please try again.", 403);
    return null;
  } catch {
    return jsonError("TURNSTILE_UNAVAILABLE", "Request verification is temporarily unavailable.", 503);
  }
}
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/v1/")) return env.ASSETS.fetch(request);
    const path = url.pathname.replace(/\/$/, "");
    const route = ROUTES.get(path);
    if (!route) return withCors(jsonError("NOT_FOUND", "No API endpoint matches this path.", 404), request);
    const method = request.method.toUpperCase();
    const handler = methodHandler(route, method);
    if (!handler) {
      if (method === "OPTIONS") return withCors(new Response(null, { status: 204 }), request);
      const response = new Response(JSON.stringify({ error: { code: "METHOD_NOT_ALLOWED", message: "This method is not supported for the requested endpoint." } }), {
        status: 405,
        headers: { "Content-Type": "application/json; charset=utf-8", Allow: ["GET", "POST", "DELETE", "OPTIONS"].filter(allowed => methodHandler(route, allowed)).join(", ") }
      });
      return withCors(response, request);
    }
    const isWrite = WRITE_PATHS.has(path) && (method === "POST" || method === "DELETE");
    const isWebhook = path === "/v1/billing/webhook" && method === "POST";
    const shouldRateLimit = (PUBLIC_RATE_LIMIT_PATHS.has(path) && method !== "OPTIONS") || isWrite || isWebhook;
    if (shouldRateLimit) {
      const limiter = isWrite ? env.WRITE_API_LIMITER : env.PUBLIC_API_LIMITER;
      if (!limiter || typeof limiter.limit !== "function") {
        return withCors(jsonError("RATE_LIMITER_NOT_CONFIGURED", "The API rate limiter is not configured.", 503), request);
      }
      try {
        const ip = request.headers.get("cf-connecting-ip") || "local";
        const decision = await limiter.limit({ key: path + ":" + ip });
        if (!decision?.success) {
          const response = new Response(JSON.stringify({ error: { code: "RATE_LIMITED", message: "Too many requests. Please wait before trying again." } }), {
            status: 429,
            headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Retry-After": "60" }
          });
          return withCors(response, request);
        }
      } catch {
        return withCors(jsonError("RATE_LIMITER_UNAVAILABLE", "The API is temporarily unavailable.", 503), request);
      }
    }
    if (isWrite) {
      const verificationFailure = await verifyTurnstile(request, env);
      if (verificationFailure) return withCors(verificationFailure, request);
    }
    try {
      return withCors(await handler({ request, env, ctx, params: {} }), request);
    } catch {
      return withCors(jsonError("INTERNAL_ERROR", "The API request could not be completed.", 500), request);
    }
  }
};
