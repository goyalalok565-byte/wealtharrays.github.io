# Wealth Arrays SaaS launch readiness tracker

Last reviewed: 2026-11-22  
Release owner: Wealth Arrays owner  
Engineering release branch: `saas/l2-backend-hardening`  
Commercial go-live authority: owner written approval only.

## Phase status

| Phase | Scope | Evidence / status |
|---|---|---|
| L0 | Production baseline | Main SHA `619bacb6b2ac2c77804061f78e61bf61757f9c40`; PR #120 merge SHA `91ddc7ccaf4545b79e874b3dfdb69abec2897af4`; L1 live verification run 45048289287 passed; seven-route Lighthouse run 45048289283 passed. Latest main verification after PR #146 is running separately. |
| L1 | Analytics, RUM, uptime and alerts | PR #144 merged. Consent-aware GA4 events, allow-listed event parameters, consent-gated web-vitals and health alert workflow are deployed. PR #146 adds browser verification; its post-merge production run is pending. GA4 DebugView receipt needs owner confirmation. |
| L2 | Auth, D1, billing and security activation | Draft PR #145. Worker security and test coverage are prepared; production Worker deploy is blocked because Cloudflare/D1/Supabase/Razorpay secrets are absent. Owner must configure services and run TEST-mode E2E. No D1 migration is included in this PR. |
| L3 | Free / Pro / Ultra MVP | BLOCKED pending L2 activation. Ultra public checkout must remain disabled; waitlist only. |
| L4 | Content and calculator coverage | PENDING. PR #103 has 12 drafts; remaining 43 calculator pages and two calculator batches are not verified complete. |
| L5 | Legal and trust pack | PENDING. Drafts must be published with a visible lawyer-review notice; no legal compliance claim before CA/lawyer sign-off. |
| L6 | Invite-only beta | PENDING. Beta must be limited to 20–50 users after the Beta Gate passes and owner approves invitations. |

## Beta Gate

- [x] Phase 0 production live verification passed on merge SHA `bc33ed7c5d8b98f3344e621392002bd89793aab2`.
- [x] Seven-route mobile Lighthouse artifact exists; three runs per route.
- [ ] Production consent/RUM browser smoke passes on the latest deployed SHA.
- [ ] Owner confirms GA4 property and sees expected events in DebugView.
- [ ] Uptime/health alerts are live and an alert delivery is acknowledged.
- [ ] Backend TEST-mode end-to-end CI and production smoke pass: signup, email verification, login, cloud save, subscription test, Pro entitlement, cancellation, failed payment, refund, duplicate webhook and out-of-order webhook.
- [ ] Legal drafts are published with “needs lawyer review” labels and the disclaimer is visible.
- [ ] Sev1 issue list is reviewed and has no open Sev1.
- [x] Razorpay live checkout is not enabled by the current missing-credential state; keep it disabled through beta.
- [ ] Owner approves the invite-only beta after all preceding checks pass.

## Commercial Gate

- [ ] Razorpay KYC approved; live keys configured by owner.
- [ ] India-first checkout, invoice, tax and refund/cancel behavior tested with real approved configuration.
- [ ] Paddle seller application approved before enabling global checkout.
- [ ] CA and lawyer sign-off recorded for Terms, Privacy, Refund/Cancellation and GST treatment.
- [ ] D1 backup and restore rehearsal completed; restore evidence retained privately.
- [ ] Server-side entitlement bypass tests pass, including refund revocation and one-trial-per-account.
- [ ] Cancellation, failed payment, refund, duplicate webhook and out-of-order webhook tested in Razorpay TEST mode.
- [ ] Support email, support workflow, status page and escalation owner published.
- [ ] 30 days of beta metrics reviewed: activation, scenario saves, trial starts, upgrades, errors and support volume.
- [ ] Production rollback plan and last-known-good Worker/site SHA recorded.
- [ ] Owner gives explicit written commercial go-live approval. No automation may infer this approval.

## Owner-only setup checklist

| Priority | Owner action | Click-by-click / verification | Lead time |
|---|---|---|---|
| P0 | Supabase Auth | Create project → Authentication → enable email/password and email confirmations → Site URL `https://wealtharrays.com` → allow redirect URLs `https://wealtharrays.com/account` and `https://www.wealtharrays.com/account`. Add `SUPABASE_URL`, `SUPABASE_ANON_KEY` to GitHub Actions secrets. | About 30–60 minutes |
| P0 | Cloudflare D1 + Worker | Cloudflare Dashboard → Workers & Pages → D1 → Create database `wealtharrays-saas` → copy database ID. GitHub → Settings → Secrets and variables → Actions: add `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_D1_DATABASE_ID`. Ensure token can deploy Workers and manage D1. | About 30–60 minutes; allow extra time for access setup |
| P0 | Turnstile | Cloudflare → Turnstile → Add widget → allow `wealtharrays.com` and `www.wealtharrays.com`. Add `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` as GitHub Actions secrets. Supabase → Authentication → CAPTCHA → enable Cloudflare Turnstile with the secret. Verify valid token accepted and invalid token rejected. | About 20–40 minutes |
| P0 | Razorpay TEST | Dashboard → switch to Test Mode → create monthly/yearly subscription plans → configure webhook `https://wealtharrays.com/v1/billing/webhook` and the subscription/payment events listed in `SAAS_SETUP.md`. Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_PLAN_MONTHLY`, `RAZORPAY_PLAN_YEARLY`, `RAZORPAY_WEBHOOK_SECRET`. Verify webhook delivery and test subscription lifecycle. | About 1–2 hours; provider setup can take longer |
| P0 | Razorpay KYC | Dashboard → Account & Settings → complete business profile, PAN/entity documents, bank account and beneficial-owner details. Do not add live keys until KYC is approved and CA/lawyer review is complete. | Longest India launch dependency; provider-dependent, allow several business days |
| P0 | CA + lawyer | Book Indian CA and technology/privacy lawyer. Send the checklist in the legal trust pack: GST/export of services, invoicing, refunds, TDS, auto-renewal disclosure, DPDP/GDPR/CCPA, financial disclaimer and AI investment-advice boundary. | Typically 1–2 weeks depending on availability |
| P1 | Paddle application | Apply as seller; submit company/owner, bank payout, tax and product details. Ask about India payouts, fees, tax documents, restricted financial tools and approval timeline. Do not enable global checkout before written approval. | Provider-dependent; several business days or longer |
| P1 | Search Console | Open Google Search Console → Add property → Domain → verify via DNS TXT record → Sitemaps → submit `https://wealtharrays.com/sitemap.xml`. Check indexing and sitemap status. | About 30–60 minutes plus DNS propagation |
| P1 | GA4 | Create GA4 property → Web data stream for `https://wealtharrays.com` → verify measurement ID matches the site configuration → Admin/DebugView → confirm consent-gated `calculator_completed`, `scenario_saved`, `signup`, `upgrade_clicked`, and `web_vitals` events. Financial inputs must never be event parameters. | About 30–60 minutes |

Never paste secret values into chat, PRs, issues or logs. Add only the exact secret names above; deployment reports must reveal presence/absence, never values.

## Product acceptance criteria for L3

### Free
- All 55 calculators remain accurate and unlocked.
- Three saved scenarios; compare two.
- Basic branded PDF and CSV export.
- No forced card entry.

### Pro
- 14-day trial, no card; a verified account may claim only one trial.
- Unlimited cloud scenarios, compare five, goal planner, saved assumptions and history.
- Clean PDF/Excel/CSV reports, no ads and a basic API quota.
- Server-side entitlements on every protected read/write; a client-side flag must never unlock Pro.
- Paywall appears after value is experienced (for example, fourth cloud save), not before first useful result.

### Ultra
- Waitlist page only. No public checkout, no public entitlement or promise of availability.

## L4 content acceptance criteria

- Wire the 12 drafts from PR #103 after editorial, calculation and source review.
- Build the remaining 43 calculator pages with at least five FAQs, worked examples, official primary sources, last-updated date, PNG Open Graph image and correct hreflang.
- Batch 1: Discount, Sales Tax/VAT/GST, NPV, APR, Margin/Markup, Commission.
- Batch 2: IRR/XIRR, TVM, Amortization/Refinance/Payoff, Credit Card Minimum Payment, Loan Comparison, Savings/APY/CD.
- Global-first: state currency, jurisdiction, assumptions and limitations; avoid implying one country's rules are universal.

## L5 legal and trust deliverables

Prepare drafts marked **NEEDS LAWYER REVIEW**: Terms, Privacy (DPDP/GDPR/CCPA), Refund/Cancellation, Cookie consent, “not financial advice” disclaimer, Methodology, author and reviewer pages. The CA/lawyer checklist must cover GST/export of services, invoices, refunds, TDS, auto-renewal disclosure, DPDP obligations and the AI assistant's investment-advice boundary.

## L6 beta operating plan

- Invite 20–50 users only after the Beta Gate passes and the owner approves.
- Publish a feedback form, support email and status page before invitations.
- Triage: Sev1 security/payment/data-loss → pause invites and rollback; Sev2 blocks core use → hotfix; Sev3 polish → backlog.
- Review weekly: activation, first calculator completion, scenario saves, trial starts, upgrade clicks, errors, refunds and support volume.
- After Pro MVP and beta evidence, test pricing cells: India ₹199/₹299/₹399 and USD $7/$9/$12. Do not select a winner from small-sample noise.
