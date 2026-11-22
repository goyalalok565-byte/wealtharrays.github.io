# D1 migration and restore plan

Status: required preflight plan; no new production migration is authorized by this document. The live D1 database ID, applied migration state, backup completion, and restore test remain owner-verified prerequisites.

## Current schema inventory

- `migrations/0001_saas.sql` creates profiles, scenarios, subscriptions, billing events, and API usage.
- `migrations/0002_billing_webhook_order.sql` adds subscription event ordering.
- `migrations/0002_subscription_cancel_flag.sql` adds cancellation scheduling.
- Two existing files share the `0002` numeric prefix. Wrangler identifies migration files by their full names; preserve both existing files and do not rename or rewrite already-applied migrations. Any future migration must use the next unused prefix after confirming `wrangler d1 migrations list wealtharrays-saas --remote` on the actual database.

## Required pre-migration backup and inventory

1. Freeze billing and scenario writes for the maintenance window; keep checkout disabled.
2. Record the exact Worker production SHA, Cloudflare account/database identifiers, current deployed Worker version, and secret *names only* in the private release record.
3. Run `npx wrangler d1 info wealtharrays-saas` and `npx wrangler d1 migrations list wealtharrays-saas --remote`; save the output privately.
4. Capture a Time Travel restore point with `npx wrangler d1 time-travel info wealtharrays-saas`; securely record the current bookmark and timestamp.
5. Export the full schema and data with `npx wrangler d1 export wealtharrays-saas --remote --output=./pre-migration.sql`. Store the dump in encrypted, access-controlled backup storage, never in this public repository or a public Actions artifact.
6. Restore the export into a separate staging D1 database and verify row counts, foreign keys, indexes, and all current migration names before testing any new migration.

## Apply sequence

1. Run the complete migration against staging first; run schema-contract, webhook-idempotency, entitlement, and scenario-isolation tests against the staging binding.
2. Verify the rollback/restore rehearsal below before scheduling production.
3. During the approved window, repeat the Time Travel bookmark and export immediately before production migration.
4. Confirm the intended unapplied migration list, then apply one migration only with `npx wrangler d1 migrations apply wealtharrays-saas --remote`.
5. Run read-only schema checks and Worker smoke tests before reopening writes. Keep checkout disabled until the owner authorizes TEST-mode end-to-end validation.

## Rollback and restore

- Wrangler rolls back a failed migration statement and leaves earlier successful migrations applied. Stop the release immediately; do not retry blindly.
- Prefer a forward-fix migration for a successfully applied, additive schema change when data is intact.
- If the migration or subsequent writes corrupt data, freeze all writes and use the recorded Time Travel bookmark: `npx wrangler d1 time-travel restore wealtharrays-saas --bookmark=<PRE_CHANGE_BOOKMARK>`. This is destructive and overwrites the database in place; require explicit owner approval, record the pre-restore bookmark too, and verify the returned undo bookmark.
- If Time Travel restore is unavailable or fails, restore the encrypted SQL export into a new D1 database with `npx wrangler d1 execute <NEW_DATABASE> --remote --file=./pre-migration.sql`; validate it before changing `CLOUDFLARE_D1_DATABASE_ID` and redeploying the last known-good Worker.
- After any restore, verify schema/migration ledger, user profile count, scenario count, subscription state, billing event idempotency, `/v1/health`, and production SHA provenance. Keep checkout disabled until the owner approves a separate TEST-mode smoke.
- Never delete the original database or its backup until the restore has been verified and the owner explicitly closes the incident.

## Merge gate for migration PRs

A migration PR must include this plan, exact SQL diff, local/staging migration result, schema assertions, backup/restore evidence, and a one-migration-at-a-time deployment plan. Do not merge or apply a production migration while the D1 database, backup, or restore test is unverified.
