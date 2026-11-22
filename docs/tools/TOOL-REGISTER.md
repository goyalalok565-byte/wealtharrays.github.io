# Open-Source Tool Register

Verification date: 2026-11-22. Scope: CI/dev-only unless explicitly stated. No tool in this register is a production/site dependency. Exact versions are pinned; third-party GitHub Actions are pinned to full commit SHAs. “Planned” means not yet wired into CI. “UNVERIFIED” means a required license/release/compatibility fact still needs confirmation before adoption.

## Current CI and reference shortlist

| Tool | Repository | License | Latest release / activity verified | Purpose / use | Pin | Owner approval | Status |
|---|---|---|---|---|---|---|---|
| actionlint | https://github.com/rhysd/actionlint | MIT | v1.7.12, 2026-03-30 | Workflow syntax, expression and action-input checks; CI only | v1.7.12; release commit 914e7df21a07ef503a81201c76d2b11c789d3fca | No for PR; merge approval still required | adopted in PR #111; exact-head report-only job passed |
| zizmor | https://github.com/zizmorcore/zizmor | MIT | v1.32.0, 2026-11-02 | GitHub Actions security lint; CI only | v1.32.0; release commit 21bd300700d43d9ba04b0c1fce72a89391ac80b4 | No for PR; merge approval still required | adopted in report-only workflow PR |
| gitleaks (binary; no Action) | https://github.com/gitleaks/gitleaks | MIT | v8.30.1, 2026-03-21; tag commit verified | Secret detection; CI only. Release tag is detached from default-branch history; keep under review and verify release checksum before execution | v8.30.1; tag commit 83d9cd684c87d95d656c1458ef04895a7f1cbd8e | No for PR; merge approval still required | planned; initial binary run succeeded, but depth-1 checkout is not a full-history secret scan |
| lychee | https://github.com/lycheeverse/lychee | MIT OR Apache-2.0 | v0.24.2, 2026-05-01; repository commit 2026-11-12 | Internal links in built dist; external URLs report-only; CI binary | v0.24.2; release commit 2bba271688c1abb1503097a064e6c3bc1d1b6a9b | No for PR; merge approval still required | planned |
| html-validate | https://github.com/html-validate/html-validate | MIT | v11.21.1, 2026-11-12 | Validate generated HTML in dist; CI-only exact npm version | 11.21.1 | No for PR; merge approval still required | planned |
| jscpd | https://github.com/kucherenko/jscpd | MIT | v5.4.3, 2026-11-08 | Detect repeated paragraphs in authored content; CI-only binary/npm CLI | 5.4.3 | No for PR; merge approval still required | planned |
| Playwright | https://github.com/microsoft/playwright | Apache-2.0 | v1.65.1, 2026-11-13 | Browser automation across 55 calculator routes; CI/dev only | 1.65.1 | No for PR; merge approval still required | planned |
| @axe-core/playwright | https://github.com/dequelabs/axe-core-npm | MPL-2.0 | 4.14.0, 2026-10 | Accessibility contrast/target-size scan | 4.14.0 | N/A | rejected: license is outside MIT/BSD/Apache allow-list |
| CodeQL Action | https://github.com/github/codeql-action | MIT | v4.39.3, 2026-11-04 | JavaScript static analysis; CI only, ignore generated/minified bundles | v4.39.3; release commit 33d7b85da1a04171e211befe2c739303b9a4c066 | No for PR; merge approval still required | planned in workflow PR |
| Dependabot (GitHub native) | https://github.com/dependabot | GitHub service; no vendored license | Current GitHub feature; docs are rolling | github-actions ecosystem only; monthly; max 2 open PRs | Native config; no third-party Action | Yes for GitHub settings; config PR itself no | planned in workflow PR |
| numpy-financial | https://github.com/numpy/numpy-financial | BSD-3-Clause | 1.1.0, 2026-09-15 | Independent reference vectors for IRR/NPV/MIRR/PMT/FV/PV/RATE/NPER/IPMT/PPMT; Python CI only | 1.1.0 (PyPI release + provenance); Python >=3.13 | No for PR; merge approval still required | planned |
| Formula.js | https://github.com/formulajs/formulajs | MIT | 4.6.1, 2026-07-28 | Excel-style reference for XIRR/XNPV and supported periodic functions; test/CI only | 4.6.1 | No for PR; merge approval still required | planned; validate actual exports with a smoke test before use |

Sources: actionlint releases https://github.com/rhysd/actionlint/releases; zizmor releases https://github.com/zizmorcore/zizmor/releases; gitleaks releases https://github.com/gitleaks/gitleaks/releases; lychee releases https://github.com/lycheeverse/lychee/releases; html-validate changelog https://html-validate.org/changelog/; jscpd changelog https://jscpd.dev/project/changelog; Playwright releases https://github.com/microsoft/playwright/releases; axe license https://github.com/dequelabs/axe-core/blob/develop/LICENSE; CodeQL changelog https://github.com/github/codeql-action/blob/main/CHANGELOG.md; numpy-financial PyPI https://pypi.org/project/numpy-financial/; Formula.js releases https://github.com/formulajs/formulajs/releases and function matrix https://formulajs.info/functions/.

## Later phase (do not install until Phase 0 is complete)

| Tool | Repository | License / latest release / pin | Purpose | Status |
|---|---|---|---|---|
| web-vitals | https://github.com/GoogleChrome/web-vitals | UNVERIFIED | Consent-aware RUM | planned; verify license, current release and exact pin first |
| Lighthouse CI | https://github.com/GoogleChrome/lighthouse-ci | UNVERIFIED | Median Lighthouse runs | planned; verify license, current release and exact pin first |
| esbuild | https://github.com/evanw/esbuild | UNVERIFIED | Future bundle rewrite | planned; verify license, current release and exact pin first |
| satori + resvg | https://github.com/vercel/satori ; https://github.com/yisibl/resvg-js | UNVERIFIED | PNG og:image generation in Actions | planned; verify both licenses/releases/pins first |
| OWASP ZAP baseline | https://github.com/zaproxy/zaproxy | UNVERIFIED | Preview-URL-only baseline scan | planned; verify license/release/pin and preview isolation first |
| Cloudflare vitest-pool-workers | https://github.com/cloudflare/workers-sdk | UNVERIFIED | Worker tests with lockfile | planned; verify package license/release/pin and add lockfile only in a later approved scope |

## Adoption guardrails

- Nothing here is added to the Cloudflare production build or shipped to visitors.
- No Cloudflare build-time npm installs and no package-lock changes in this adoption phase.
- Tool failures remain report-only; no new required checks or branch-protection changes.
- Keep raw security findings out of public artifacts. Publish only redacted aggregate counts; detailed findings stay in the private engineering handoff.
- Do not copy other calculators' code, prose, layouts or datasets. Reference libraries are independent test oracles only; Wealth Arrays owns all implementation and editorial text.
- A tool remains “planned” until its exact-head workflow run, artifact and findings are inspected. “Adopted” is not a production certification.
- Any future external GitHub Action must be pinned to a verified full commit SHA and listed by name, repository URL and SHA in its PR body. Required-check and repository-security settings remain owner-controlled.
