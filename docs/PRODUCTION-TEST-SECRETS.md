# TEST Runtime Secrets Setup

Use TEST credentials only. Do not paste secret values into issues, pull requests, chat, source files, or workflow logs.

1. In the repository, open **Settings → Environments → New environment**, name it `production`, and save.
2. Add yourself as a **Required reviewer** for the `production` environment and save the protection rule.
3. In that environment's **Environment secrets**, add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `RAZORPAY_PLAN_MONTHLY`, and `RAZORPAY_PLAN_YEARLY`; ensure existing repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are available to the workflow.
4. In the Supabase TEST project, enable the Email provider, require email confirmation, set Site URL to `https://wealtharrays.com`, and add the production callback URLs used by the app.
5. Copy the Supabase **Project URL** and **anon/public key** from Project Settings → API into the two Supabase environment secrets.
6. In Razorpay, enable **Test Mode**, create a TEST API key pair and two TEST subscription plans (monthly and yearly), then store the key ID, key secret, and plan IDs in the matching environment secrets.
7. Add webhook URL `https://wealtharrays.com/v1/billing/webhook`, set a separate webhook secret, and enable the subscription events `subscription.authenticated`, `subscription.activated`, `subscription.charged`, `subscription.pending`, `subscription.halted`, `subscription.cancelled`, `subscription.completed`, `subscription.paused`, `subscription.resumed`, plus `payment.failed` and `payment.refunded`; verify the Cloudflare token includes **Workers Scripts:Edit**.
8. After this PR is merged, open **Actions → Cloudflare secrets sync → Run workflow**, approve the `production` environment gate, and confirm the workflow prints only configured/not-configured health flags.

## Runtime sync behavior

- The workflow is manual-only and pinned to Wrangler `4.97.0`.
- It refuses to run unless `RAZORPAY_KEY_ID` begins with `rzp_test_`.
- All seven runtime values are masked and uploaded in one Wrangler bulk operation.
- It prints only the health configuration flags; secret values are never printed.
- The sync workflow does not run D1 migrations or intentionally change billing mode.
