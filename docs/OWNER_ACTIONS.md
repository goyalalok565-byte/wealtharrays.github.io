# Wealth Arrays — owner-only release actions

Last reviewed: 2026-11-20  
Repository: `goyalalok565-byte/wealtharrays.github.io`  
Active release candidate: PR #97, branch `phase0/pr-c-final`

This file lists work that requires the repository owner's identity, external accounts, payment authority, legal advisers, physical devices or production-dashboard access. Engineering tasks remain assigned to the project engineering workflow; do not interpret this list as a request to paste credentials into chat.

## A. Actions required before production release

### 1. Cloudflare production routing and deployment control
- [ ] Open the Cloudflare dashboard and locate the `wealtharrays-github-io` Worker.
- [ ] Confirm production deployment is sourced from `main` only; preview deployments must remain separate.
- [ ] Record the currently active production version, traffic allocation and rollback target.
- [ ] Confirm which deployed version actually serves `https://wealtharrays.com`; a successful build for a PR branch is not proof of production traffic.
- [ ] Share a screenshot of the relevant branch/deployment settings with account IDs, tokens and other sensitive values hidden.

### 2. Production response evidence
- [ ] Open `https://wealtharrays.com` in a browser and inspect the main document response headers.
- [ ] Confirm whether `Content-Encoding: br` is present. Do not infer Brotli from a preview or build log.
- [ ] Open `https://wealtharrays.com/v1/health` and share the response status/body, with any identifiers redacted.
- [ ] Confirm the live site and API are serving the expected release after deployment.

### 3. External service accounts and configuration
Create/verify accounts yourself where required; configure secrets directly in the relevant provider dashboard or GitHub Actions Secrets. Never paste secret values into chat.
- [ ] Cloudflare account, Worker, D1 database and production domain.
- [ ] Supabase project, email/password auth, allowed redirect URLs and required public auth configuration.
- [ ] Razorpay merchant account and test-mode monthly/yearly subscription plans. The repository currently documents/implements Razorpay billing routes; do not assume Paddle checkout is integrated merely because Paddle was evaluated as a global Merchant-of-Record option.
- [ ] Configure the documented Razorpay webhook URL and event set only in test mode first; verify signature, retry, duplicate, out-of-order, cancellation and refund behavior before live mode.
- [ ] Add only the required secret *names/values* in GitHub Settings → Secrets and variables → Actions. Keep all values private.
- [ ] Confirm provider approval, payout route, fees, tax documentation and business eligibility directly with the provider.

### 4. Legal, tax and business review
- [ ] Have an India-qualified CA review the current India Tax Year 2026–27 / Assessment Year 2026–27 terminology, model assumptions, eligibility caveats and tax disclaimers.
- [ ] Have a lawyer review Terms, Privacy Policy, Refund/Cancellation Policy, DPDP Act obligations, cookie/consent language, financial-information disclaimers and jurisdiction-specific requirements.
- [ ] Confirm business identity, invoicing, GST/income-tax treatment and payment-provider seller requirements.
- [ ] Do not market calculator estimates as tax filing, investment advice or guaranteed outcomes.

### 5. Physical-device and customer acceptance
- [ ] Test the live candidate on at least one real Android phone (not only Lighthouse emulation): home, tools, calculator inputs, keyboard, charts, exports, account, save/load and consent.
- [ ] Test keyboard-only navigation and at least one screen reader.
- [ ] Invite a small group of real target users to complete core tasks and report confusion, defects and willingness to pay.
- [ ] Confirm customer-support contact, issue-handling process and refund/cancellation support before paid launch.

## B. Evidence to return to the engineering workflow

Share only non-secret evidence:
1. Cloudflare branch-control / active-version screenshot (sensitive values hidden).
2. Production response headers showing whether Brotli is enabled.
3. Redacted `/v1/health` status and confirmation of the live site version.
4. Confirmation that provider accounts and test plans are created; do not share keys or payment credentials.
5. CA/legal review outcomes and approved wording, not personal customer or taxpayer data.
6. Physical-device test results and browser/device versions.

## C. Work handled by the engineering workflow

- Repository-wide source and dependency audits, bug fixes, build/test automation and regression coverage.
- Calculator behavior preservation, API and Worker code, entitlement/billing implementation, security hardening and documentation.
- SEO/content structure, page-specific source research, accessibility fixes, responsive UX and performance optimization.
- CI verification, preview checks, deployment-manifest checks and post-deploy technical verification when non-secret evidence is available.
- Product requirements, Pro MVP scope, onboarding, retention, support workflows and measurable release criteria.

## D. Release restrictions

- PR #97 stays open/unmerged until the owner explicitly sends the exact phrase `merge approved`.
- Do not change production Cloudflare settings, payment settings, secrets, branch protections or live checkout without explicit owner approval.
- Never request or publish passwords, API tokens, secret values, private customer data or taxpayer data.
- Do not call the product production-ready, paid-ready or financially authoritative until the relevant evidence and reviews are complete.
