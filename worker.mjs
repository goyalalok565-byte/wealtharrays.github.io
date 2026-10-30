import * as models from "./functions/v1/models.js";
import * as calculate from "./functions/v1/calculate.js";
import * as fx from "./functions/v1/fx.js";
import * as indiaTax from "./functions/v1/india-tax.js";
import * as authConfig from "./functions/v1/auth-config.js";
import * as scenarios from "./functions/v1/scenarios.js";
import * as checkout from "./functions/v1/billing/checkout.js";
import * as billingStatus from "./functions/v1/billing/status.js";
import * as cancelSubscription from "./functions/v1/billing/cancel.js";
import * as billingWebhook from "./functions/v1/billing/webhook.js";

const ROUTES = new Map([
  ["/v1/models", models],
  ["/v1/calculate", calculate],
  ["/v1/fx", fx],
  ["/v1/india-tax", indiaTax],
  ["/v1/auth-config", authConfig],
  ["/v1/scenarios", scenarios],
  ["/v1/billing/checkout", checkout],
  ["/v1/billing/status", billingStatus],
  ["/v1/billing/cancel", cancelSubscription],
  ["/v1/billing/webhook", billingWebhook]
]);
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Razorpay-Signature",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin"
};
function jsonError(code, message, status = 404) {
  return new Response(JSON.stringify({ error: { code, message } }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...CORS }
  });
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
    if (!url.pathname.startsWith("/v1/")) return env.ASSETS.fetch(request);
    const route = ROUTES.get(url.pathname.replace(/\/$/, ""));
    if (!route) return jsonError("NOT_FOUND", "No API endpoint matches this path.", 404);
    const handler = methodHandler(route, request.method.toUpperCase());
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
