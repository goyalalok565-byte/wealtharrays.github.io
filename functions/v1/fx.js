import { CORS_HEADERS, error, json } from "./_shared.js";
const CURRENCIES = new Set("AED AUD BGN BRL CAD CHF CNY CZK DKK EUR GBP HKD HUF IDR ILS INR ISK JPY KRW MXN MYR NOK NZD PHP PLN RON RUB SAR SEK SGD THB TRY TWD USD ZAR".split(" "));
export async function onRequestOptions() { return new Response(null, { status: 204, headers: CORS_HEADERS }); }
export async function onRequestGet({ request }) {
  const url = new URL(request.url), base = (url.searchParams.get("base") || "INR").toUpperCase();
  if (!/^[A-Z]{3}$/.test(base) || !CURRENCIES.has(base)) return error("INVALID_CURRENCY", "Use a supported three-letter currency code.", 400);
  try {
    const upstream = await fetch("https://open.er-api.com/v6/latest/" + base, { headers: { "Accept": "application/json" }, cf: { cacheTtl: 900, cacheEverything: true } });
    if (!upstream.ok) return error("FX_PROVIDER_UNAVAILABLE", "The exchange-rate provider is temporarily unavailable.", 502);
    const payload = await upstream.json();
    if (payload.result !== "success" || !payload.rates || !Number.isFinite(Number(payload.time_last_update_unix))) return error("FX_PROVIDER_INVALID", "The exchange-rate provider returned an invalid response.", 502);
    const requested = (url.searchParams.get("symbols") || "").split(",").map(x => x.trim().toUpperCase()).filter(Boolean);
    const codes = requested.length ? requested : [...CURRENCIES];
    const rates = {};
    for (const code of codes) if (CURRENCIES.has(code) && Number.isFinite(Number(payload.rates[code]))) rates[code] = Number(payload.rates[code]);
    return json({ base, rates, provider: "open.er-api.com", last_updated_unix: payload.time_last_update_unix, last_updated_utc: payload.time_last_update_utc, time_next_update_utc: payload.time_next_update_utc, live: true, disclaimer: "Indicative exchange rates only; not a trading quote. Provider fees and spreads are excluded." }, 200, { "Cache-Control": "public, max-age=900, s-maxage=900" });
  } catch {
    return error("FX_PROVIDER_UNAVAILABLE", "Could not retrieve exchange rates. Try again later.", 502);
  }
}
