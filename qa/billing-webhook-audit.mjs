import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("functions/v1/billing/webhook.js", "utf8")
  .replace(/^import \{ error, json \} from "\.\.\/_shared\.js";\n/, [
    'const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...extra } });',
    'const error = (code, message, status = 400) => json({ error: { code, message } }, status, { "Cache-Control": "no-store" });'
  ].join("\n"))
  .replace("export async function onRequestPost", "async function onRequestPost")
  + "\nexport { onRequestPost };";
const webhookModule = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
const events = new Map();
const subscriptions = new Map([["sub_1", { id: "row_1", status: "created", current_period_end: null, last_provider_event_at: null }]]);
const db = {
  prepare(sql) {
    return { bind(...values) {
      return {
        async run() {
          if (sql.startsWith("INSERT OR IGNORE INTO billing_events")) {
            const [, eventId, eventType, payload] = values;
            if (events.has(eventId)) return { meta: { changes: 0 } };
            events.set(eventId, { event_type: eventType, payload_json: payload, processed_at: null });
            return { meta: { changes: 1 } };
          }
          if (sql.startsWith("UPDATE subscriptions")) {
            const [status, currentEnd, eventAt, eventAtForSet, subscriptionId, whereAt, whereAt2] = values;
            const row = subscriptions.get(subscriptionId);
            if (!row) return { meta: { changes: 0 } };
            const canApply = whereAt !== null ? row.last_provider_event_at === null || row.last_provider_event_at <= whereAt2 : row.last_provider_event_at === null;
            if (!canApply) return { meta: { changes: 0 } };
            row.status = status;
            row.current_period_end = currentEnd ?? row.current_period_end;
            row.last_provider_event_at = eventAtForSet ?? row.last_provider_event_at;
            return { meta: { changes: 1 } };
          }
          if (sql.startsWith("UPDATE billing_events")) {
            const row = events.get(values[0]);
            if (row) row.processed_at = "processed";
            return { meta: { changes: row ? 1 : 0 } };
          }
          throw new Error("Unexpected D1 run query: " + sql);
        },
        async first() {
          if (sql.startsWith("SELECT processed_at FROM billing_events")) return events.get(values[0]) || null;
          if (sql.startsWith("SELECT id FROM subscriptions")) {
            const row = subscriptions.get(values[0]);
            return row ? { id: row.id } : null;
          }
          throw new Error("Unexpected D1 first query: " + sql);
        }
      };
    }};
  }
};
const secret = "webhook-test-secret";
const env = { DB: db, RAZORPAY_WEBHOOK_SECRET: secret };
const toHex = bytes => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
async function deliver(event, eventId, badSignature = false) {
  const raw = JSON.stringify(event);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw)));
  return webhookModule.onRequestPost({ request: new Request("https://example.test/v1/billing/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-razorpay-signature": badSignature ? "invalid" : signature, "x-razorpay-event-id": eventId },
    body: raw
  }), env });
}
let response = await deliver({ created_at: 1000, event: "subscription.activated", payload: { subscription: { entity: { id: "sub_1", status: "active", current_end: 2000 } } } }, "evt_1");
assert.equal(response.status, 200);
assert.equal(subscriptions.get("sub_1").status, "active");
assert.equal(subscriptions.get("sub_1").last_provider_event_at, 1000);
assert.equal(events.get("evt_1").processed_at, "processed");
response = await deliver({ created_at: 1000, event: "subscription.halted", payload: { subscription: { entity: { id: "sub_1", status: "halted" } } } }, "evt_1");
assert.equal(response.status, 200);
assert.equal((await response.json()).duplicate, true);
assert.equal(subscriptions.get("sub_1").status, "active");
response = await deliver({ created_at: 900, event: "subscription.halted", payload: { subscription: { entity: { id: "sub_1", status: "halted" } } } }, "evt_old");
assert.equal(response.status, 200);
assert.equal(subscriptions.get("sub_1").status, "active");
response = await deliver({ created_at: 1100, event: "subscription.halted", payload: { subscription: { entity: { id: "sub_1", status: "halted" } } } }, "evt_new");
assert.equal(response.status, 200);
assert.equal(subscriptions.get("sub_1").status, "halted");
response = await deliver({ created_at: 1200, event: "payment.failed", payload: { payment: { entity: { id: "pay_1", subscription_id: "sub_1", status: "failed", amount: 50000, currency: "INR" } } } }, "evt_payment_failed");
assert.equal(response.status, 200);
assert.equal(subscriptions.get("sub_1").status, "halted");
assert.match(events.get("evt_payment_failed").payload_json, /pay_1/);
response = await deliver({ created_at: 1300, event: "payment.refunded", payload: { payment: { entity: { id: "pay_1", subscription_id: "sub_1", status: "refunded", amount: 50000, amount_refunded: 50000, currency: "INR" } } } }, "evt_payment_refunded");
assert.equal(response.status, 200);
assert.match(events.get("evt_payment_refunded").payload_json, /50000/);
response = await deliver({ created_at: 1400, event: "subscription.activated", payload: { subscription: { entity: { id: "sub_not_linked", status: "active" } } } }, "evt_unlinked");
assert.equal(response.status, 503);
assert.equal(events.get("evt_unlinked").processed_at, null);
response = await deliver({ created_at: 1500, event: "subscription.activated", payload: { subscription: { entity: { id: "sub_1", status: "active" } } } }, "evt_bad_signature", true);
assert.equal(response.status, 401);
console.log("Razorpay webhook audit PASS: signature, header idempotency, event ordering, retryable unlinked events, payment failure and refund recording.");
