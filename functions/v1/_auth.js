import { error } from "./_shared.js";
export async function authenticate(request, env) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return { response: error("AUTH_REQUIRED", "Sign in to access cloud scenarios or billing.", 401) };
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return { response: error("AUTH_NOT_CONFIGURED", "Account authentication is not configured for this deployment.", 503) };
  try {
    const response = await fetch(env.SUPABASE_URL.replace(/\/$/, "") + "/auth/v1/user", {
      headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: "Bearer " + token, Accept: "application/json" }
    });
    if (!response.ok) return { response: error("INVALID_SESSION", "Your session is invalid or expired. Please sign in again.", 401) };
    const user = await response.json();
    if (!user || typeof user.id !== "string") return { response: error("INVALID_SESSION", "The identity provider did not return a valid user.", 401) };
    return { user: { id: user.id, email: typeof user.email === "string" ? user.email : null } };
  } catch {
    return { response: error("AUTH_PROVIDER_UNAVAILABLE", "Could not verify your account session.", 502) };
  }
}
export async function ensureProfile(env, user) {
  await env.DB.prepare("INSERT INTO user_profiles (id, auth_provider, provider_subject, email) VALUES (?, 'supabase', ?, ?) ON CONFLICT(id) DO UPDATE SET email=excluded.email, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')")
    .bind(user.id, user.id, user.email).run();
}
