# Production Deployment Runbook

## Production topology

- The production Worker is `wealtharrays-github-io`; `wrangler.toml` is the source of truth for its entry point, static assets, route, rate-limit binding, and D1 binding.
- Worker entry point: `worker.mjs`.
- Static assets: generated `dist/`, bound as `ASSETS`.
- Production API route: `wealtharrays.com/v1/*`.
- D1: `wealtharrays-saas`, binding `DB`; migration files live in `migrations/`.
- Production merge provenance is checked by the `Production live verification` workflow. It waits up to 15 minutes for the Cloudflare Workers Builds check and the exact `wa-build-sha` marker, then checks live routes and response headers.
- A separate GitHub Pages `pages build and deployment` workflow is also observed on main pushes. It is a distinct GitHub Pages publication, not the Cloudflare Worker deployment. Its custom-domain mapping is not established by this repository workflow; verify Settings > Pages before treating it as a second production hostname or disabling it.

## What deploys what

| Change / action | Effect |
| --- | --- |
| Squash-merge to `main` | Cloudflare Workers Builds automatically builds and deploys the Worker and its `dist/` static assets. |
| `wrangler.toml` | Defines Worker name, entry point, compatibility date, route, `ASSETS`, `PUBLIC_API_LIMITER`, and D1 `DB` binding. |
| `migrations/*.sql` | Schema changes are versioned here. Do not assume a normal Workers Build applies pending D1 migrations. |
| Actions → `Deploy Wealth Arrays API Worker` → Run workflow | Manual fallback: protected `production` environment, build/validate, apply remote D1 migrations, then run `wrangler deploy`. This is not triggered by push. |
| Actions → `Cloudflare secrets sync` → Run workflow | Manual, protected TEST-only secret upload. It does not run a code deployment workflow; Wrangler bulk secret update creates a new Worker version. |
| GitHub Pages `pages build and deployment` | Separate GitHub Pages publishing job. Do not confuse its success with Workers Builds or Worker API readiness. |

## Standard release sequence

1. Open one-purpose PRs; require green required checks and inspect the test count in the Unit Tests run.
2. Squash-merge to `main`. The Cloudflare Workers Builds integration is the automatic Worker production path.
3. Wait for the `Workers Builds: wealtharrays-github-io` check to pass.
4. Wait for `Production live verification`: it must match the exact merge SHA in the live `wa-build-sha` marker and pass the live route/header smoke.
5. Check `https://wealtharrays.com/v1/health`. Require `d1_database: ok` after the D1-binding release. SaaS readiness additionally requires Supabase and Razorpay TEST configuration.
6. For a schema change, review the migration as additive and backward-compatible. Run the protected manual Worker deployment workflow when its explicit remote migration step is needed. Confirm the migration ledger and health endpoint afterward.

## Secrets

- Never commit secret values, place them in workflow output, or print them in logs.
- `Cloudflare secrets sync` is the only supported runtime-secret upload workflow. It is manual, uses the `production` GitHub Environment, masks inputs, and refuses a Razorpay key ID that does not begin with `rzp_test_`.
- The manual Worker deploy workflow does not upload or modify runtime secrets.
- Keep `CLOUDFLARE_API_TOKEN` restricted to the required Workers Scripts edit permission and use the account ID from the protected environment or repository secrets.

## Rollback and recovery

- If the live SHA marker does not match, route checks fail, or health regresses, stop further releases and inspect the Cloudflare Worker deployment/version history.
- Roll back the Worker code to the last known-good deployment using the Cloudflare Workers deployment rollback control. Verify the route, exact live build marker, response headers, and health after rollback.
- A Worker rollback does not roll back D1 schema or data. Keep migrations additive and compatible with both the current and previous Worker version; use a forward-fix for schema/data issues.
- Never delete, reset, restore, or overwrite the production D1 database as a rollback action.
- Do not switch to a previous Worker version until its required D1 bindings and schema compatibility have been checked.

## Operational evidence

Record for every release: PR URL, merge SHA, required check URLs, Unit Tests count, Workers Builds result, live provenance result, health JSON including `checked_at`, deployed Worker version/deployment ID, and any rollback action.
