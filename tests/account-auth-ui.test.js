import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const html = await readFile(new URL("../account.html", import.meta.url), "utf8");
const js = await readFile(new URL("../account.js", import.meta.url), "utf8");

test("account page offers passwordless email and Google entry points", () => {
  assert.match(html, /id="account-email"/);
  assert.match(html, /id="account-send-link"/);
  assert.match(html, /id="account-google"/);
  assert.doesNotMatch(html, /id="account-password"/);
  assert.doesNotMatch(html, /id="account-sign-up"/);
});

test("email authentication sends a one-time link and allows automatic signup", () => {
  assert.match(js, /\/auth\/v1\/otp\?redirect_to=/);
  assert.match(js, /create_user:true/);
  assert.match(js, /secure sign-in link/i);
  assert.doesNotMatch(js, /grant_type=password/);
  assert.doesNotMatch(js, /\/auth\/v1\/signup/);
});

test("Google OAuth callback is exchanged for a verified Supabase user session", () => {
  assert.match(js, /searchParams\.set\("provider","google"\)/);
  assert.match(js, /searchParams\.set\("redirect_to",redirectTo\)/);
  assert.match(js, /params\.get\("access_token"\)/);
  assert.match(js, /\/auth\/v1\/user/);
  assert.match(js, /history\.replaceState/);
});

test("account JavaScript parses successfully", () => {
  const result = spawnSync(process.execPath, ["--check", new URL("../account.js", import.meta.url).pathname], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("isolated TEST account page points only to TEST API and has billing disabled", async () => {
  const testHtml = await readFile(new URL("../account-test.html", import.meta.url), "utf8");
  assert.match(testHtml, /data-wa-test-mode="true"/);
  assert.match(testHtml, /data-wa-api-base="https:\/\/wealtharrays-api-test\.goyalalok565\.workers\.dev"/);
  assert.match(testHtml, /account-test\.html/);
  assert.match(testHtml, /wa-site-runtime\.js/, "TEST account must load the shared Turnstile runtime");
  const headers = await readFile(new URL("../_headers", import.meta.url), "utf8");
  assert.match(headers, /\/account-test\.html[\s\S]*connect-src[^\\n]*wealtharrays-api-test\.goyalalok565\.workers\.dev/);
  assert.match(headers, /\/account-test[\s\S]*connect-src[^\\n]*challenges\.cloudflare\.com[^\\n]*wealtharrays-api-test\.goyalalok565\.workers\.dev/);
  assert.match(js, /waSupabaseTestSession/);
  assert.match(js, /dataset\.waApiBase/);
  assert.match(js, /fetch\(API_BASE\+"\/v1\/billing\/config"/);
  assert.match(js, /\$\("account-upgrade-monthly"\)\.disabled=!billing\.plans\?\.monthly/);
  assert.match(js, /\$\("account-upgrade-yearly"\)\.disabled=!billing\.plans\?\.yearly/);
  assert.match(js, /Isolated TEST account and TEST billing are configured/);
  assert.doesNotMatch(js, /account-subscription-card"\)\.hidden=true/);
});

test("sign-out attempts to revoke the Supabase server session", () => {
  assert.match(js, /auth\/v1\/logout/);
  assert.match(js, /server session revocation could not be confirmed/);
});
