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
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Razorpay-Signature,cf-turnstile-response",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin"
};
function jsonError(code, message, status = 404) {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...CORS }
  });
}
async function verifyTurnstile(request, env) {
  if (!env.TURNSTILE_SECRET_KEY) return jsonError("TURNSTILE_NOT_CONFIGURED", "Request verification is not configured for this deployment.", 503);
  const token = request.headers.get("cf-turnstile-response") || "";
  if (!token || token.length > 2048) return jsonError("TURNSTILE_REQUIRED", "Complete request verification and try again.", 403);
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
function methodHandler(route, method) {
  if (method === "OPTIONS") return route.onRequestOptions;
  if (method === "GET") return route.onRequestGet;
  if (method === "POST") return route.onRequestPost;
  if (method === "DELETE") return route.onRequestDelete;
  return null;
}
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname === "www.wealtharrays.com") {
      url.hostname = "wealtharrays.com";
      return Response.redirect(url.toString(), 308);
    }
    if (!url.pathname.startsWith("/v1/")) return env.ASSETS.fetch(request);
    const route = ROUTES.get(url.pathname.replace(/\/$/, ""));
    if (!route) return jsonError("NOT_FOUND", "No API endpoint matches this path.", 404);
    const handler = methodHandler(route, request.method.toUpperCase());
    const routePath = url.pathname.replace(/\/$/, "");
    const writeRateLimitedPaths = new Set(["/v1/scenarios", "/v1/billing/checkout", "/v1/billing/cancel"]);
    const isWriteRequest = request.method === "POST" || (routePath === "/v1/scenarios" && request.method === "DELETE");
    if (handler && isWriteRequest && writeRateLimitedPaths.has(routePath)) {
      const limiter = env.WRITE_API_LIMITER;
      if (!limiter || typeof limiter.limit !== "function") {
        return jsonError("WRITE_RATE_LIMITER_NOT_CONFIGURED", "The write API is temporarily unavailable.", 503);
      }
      try {
        const ip = request.headers.get("cf-connecting-ip") || "local";
        const decision = await limiter.limit({ key: routePath + ":" + request.method + ":" + ip });
        if (!decision?.success) {
          return new Response(JSON.stringify({ error: { code: "RATE_LIMITED", message: "Too many requests. Please wait before trying again." } }), {
            status: 429,
            headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Retry-After": "60", ...CORS }
          });
        }
      } catch {
        return jsonError("WRITE_API_RATE_LIMITER_UNAVAILABLE", "The write API is temporarily unavailable.", 503);
      }
    }
    if (handler && isWriteRequest && writeRateLimitedPaths.has(routePath)) {
      const verificationFailure = await verifyTurnstile(request, env);
      if (verificationFailure) return verificationFailure;
    }
    const rateLimitedPaths = new Set(["/v1/calculate", "/v1/india-tax", "/v1/fx"]);
    if (handler && request.method !== "OPTIONS" && rateLimitedPaths.has(url.pathname.replace(/\/$/, ""))) {
      const limiter = env.PUBLIC_API_LIMITER;
      if (!limiter || typeof limiter.limit !== "function") {
        return jsonError("RATE_LIMITER_NOT_CONFIGURED", "The public API rate limiter is not configured.", 503);
      }
      try {
        const ip = request.headers.get("cf-connecting-ip") || "local";
        const decision = await limiter.limit({ key: url.pathname.replace(/\/$/, "") + ":" + ip });
        if (!decision?.success) {
          return new Response(JSON.stringify({ error: { code: "RATE_LIMITED", message: "Too many requests. Please wait before trying again." } }), {
            status: 429,
            headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Retry-After": "60", ...CORS }
          });
        }
      } catch {
        return jsonError("RATE_LIMITER_UNAVAILABLE", "The public API is temporarily unavailable.", 503);
      }
    }
    if (!handler) {
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
      return new Response(JSON.stringify({ error: { code: "METHOD_NOT_ALLOWED", message: "This method is not supported for the requested endpoint." } }), {
        status: 405,
        headers: { "Content-Type": "application/json; charset=utf-8", Allow: ["GET", "POST", "DELETE", "OPTIONS"].filter(method => methodHandler(route, method)).join(", "), ...CORS }
      });
    }
    try {
      return await handler({ request, env, ctx, params: {} });
    } catch {
      return jsonError("INTERNAL_ERROR", "The API request could not be completed.", 500);
    }
  }
};
