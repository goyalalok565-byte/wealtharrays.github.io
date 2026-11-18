import { json } from "../_shared.js";

/** Exposes readiness only; never returns provider credentials or plan identifiers. */
export async function onRequestGet({ env }) {
  const monthly = Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && env.RAZORPAY_PLAN_MONTHLY);
  const yearly = Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && env.RAZORPAY_PLAN_YEARLY);
  return json({ configured: monthly && yearly, plans: { monthly, yearly } }, 200, { "Cache-Control": "no-store" });
}
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,OPTIONS", "Access-Control-Allow-Headers": "Content-Type,Authorization" } });
}
