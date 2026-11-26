import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("functions/v1/billing/webhook.js", "utf8")
  .replace(/^import \{ error, json \} from "\.\.\/\_shared\.js";\n/, [
    'const json = (data, status = 200, extra = {}) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...extra } });',
    'const error = (code, message, status = 400) => json({ error: { code, message } }, status, { "Cache-Control": "no-store" });'
  ].join("\n"))
  .replace("export async function onRequestPost", "async function onRequestPost")
  + "\nexport { onRequestPost };";
const webhook = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
const events = new Map();
const subscriptions = new Map([["sub_1", { id: "row_1", status: "active", cancel_at_period_end: 0, last_provider_event_at: null }]]);
const db = {
  prepare(sql) {
    return { bind(...values) {
      return {
        async run() {
          if (sql.startsWith("INSERT OR IGNORE INTO billing_events")) {
            const [, id, type, payload] = values;
            if (events.has(id)) return { meta: { changes: 0 } };
            events.set(id, { event_type: type, payload_json: payload, processed_at: null });
            return { meta: { changes: 1 } };
          }
          if (sql.includes("SET status = 'refunded'")) {
            const id = values[3];
            const row = subscriptions.get(id);
            if (!row || row.status === "refunded") return { meta: { changes: 0 } };
            row.status = "refunded";
            row.cancel_at_period_end = 0;
            return { meta: { changes: 1 } };
          }
          if (sql.startsWith("UPDATE billing_events SET processed_at")) {
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
const secret = "refund-policy-test-secret";
const env = { DB: db, RAZORPAY_WEBHOOK_SECRET: secret };
const toHex = bytes => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, "0")).join("");
async function deliver(amount, amountRefunded, eventId) {
  const raw = JSON.stringify({
    created_at: 1800000000,
    event: "payment.refunded",
    payload: { payment: { entity: {
      id: "pay_" + eventId, subscription_id: "sub_1", status: "refunded",
      amount, amount_refunded: amountRefunded, currency: "INR"
    } } }
  });
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw)));
  return webhook.onRequestPost({ request: new Request("https://example.test/v1/billing/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-razorpay-signature": signature, "x-razorpay-event-id": eventId },
    body: raw
  }), env });
}

let response = await deliver(10000, 2500, "evt_partial");
assert.equal(response.status, 200);
assert.equal(subscriptions.get("sub_1").status, "active", "partial refund must preserve Pro entitlement");
assert.equal(JSON.parse(events.get("evt_partial").payload_json).payment_refund_is_full, false);

response = await deliver(10000, 10000, "evt_full");
assert.equal(response.status, 200);
assert.equal(subscriptions.get("sub_1").status, "refunded", "full refund must revoke Pro entitlement");
assert.equal(subscriptions.get("sub_1").cancel_at_period_end, 0);
assert.equal(JSON.parse(events.get("evt_full").payload_json).payment_refund_is_full, true);

response = await deliver(10000, 10000, "evt_full");
assert.equal(response.status, 200);
assert.equal((await response.json()).duplicate, true, "duplicate full refund must be idempotent");

console.log("Razorpay refund policy audit PASS: partial refund preserves access; full refund revokes access; duplicate event is idempotent.");
