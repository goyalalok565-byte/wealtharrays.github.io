# L1 Measurement and owner setup

Status: implementation candidate; production RUM remains unverified until this branch is merged, deployed, and a consent-granted browser session reports events.

## Privacy contract

- Analytics and Core Web Vitals collection start only after explicit analytics consent. Rejecting consent keeps both GA4 analytics and the Web Vitals library unloaded.
- Financial inputs, calculated financial outputs, account identifiers, email addresses, credentials, session tokens, and free-text scenario names must never be sent to GA4, advertising systems, or the RUM payload.
- The runtime maps existing product events to a small canonical funnel: `calculator_completed`, `scenario_saved`, `signup`, and `upgrade_clicked`. It sends only allow-listed categorical metadata.
- Core Web Vitals use the GoogleChrome/web-vitals library (Apache-2.0), pinned to 6.2.3. The current static-site integration loads the IIFE build from unpkg only after consent; CDN availability is an external dependency. Prefer vendoring the exact upstream build with its license notice before treating RUM as a production dependency.
- GA4 receives CLS, INP and LCP names, numeric values and ratings. Do not add URL query strings, DOM selectors, text, attribution targets, or metric IDs to these events.

## Event contract

| Canonical event | Existing product trigger | Allowed context |
|---|---|---|
| `calculator_completed` | Valid calculator result | `calculator_id`, `result_count`, `currency` |
| `scenario_saved` | Local or cloud scenario saved | `page_type`, `method`, `feature` |
| `signup` | Signup submitted | `method`, `status` |
| `upgrade_clicked` | Checkout action initiated | `plan` |
| `web_vitals` | CLS / INP / LCP report | `metric_name`, `metric_value`, `metric_rating` |

All event values are sanitized. Never attach raw calculator fields or result objects.

## Six-line owner guide: Search Console + GA4

1. Open Google Search Console and choose **Add property → Domain**; enter `wealtharrays.com`.
2. Copy the DNS TXT verification value shown by Search Console and add it at the authoritative DNS provider; do not paste the value into chat.
3. Return to Search Console and select **Verify**; after verification, open **Sitemaps**.
4. Submit `https://wealtharrays.com/sitemap.xml` and review indexing / page experience reports as data accumulates.
5. In Google Analytics, create or select the GA4 property and a Web data stream for `https://wealtharrays.com`; the existing measurement ID is configured in `wa-core.js`.
6. Confirm the measurement ID matches the GA4 stream, then use **DebugView** after accepting analytics consent; reject consent and confirm no GA4 or web-vitals network request is made.

## Uptime and alerting

- `.github/workflows/health-monitor.yml` checks `/v1/health` every 15 minutes and on manual dispatch.
- A failed scheduled check opens or refreshes one deduplicated GitHub operational alert issue. A later successful check closes that issue.
- GitHub Actions run notifications remain the secondary signal. Repository owners should enable email / mobile notifications for failed workflow runs and subscribe to the operational alert issue.
- This monitor checks API liveness and dependency readiness indicators; it does not prove that signup, D1 writes, Razorpay checkout, webhooks, or entitlement transitions work.

## Error monitoring plan

1. First release: retain GitHub Actions failure alerts and the health-monitor issue; collect no user financial payloads.
2. Before beta: choose an error-monitoring provider, complete privacy / DPA review, configure a project and source maps, and add the DSN as a GitHub Actions secret / Worker variable as appropriate.
3. Configure browser and Worker capture with financial-field, query-string, email, auth-header, cookie, and request-body scrubbing enabled before sending any event.
4. Add release SHA, environment, route template, and sanitized error code only. Disable session replay and breadcrumbs that may capture typed values.
5. Test deliberate synthetic failures in staging and verify scrubbed payloads before enabling production reporting.

## Beta evidence required

- A consent-accepted test session reports canonical funnel events and CLS / INP / LCP in GA4 DebugView.
- A consent-rejected session sends no analytics or web-vitals requests.
- A synthetic failed health run opens one alert; a passing run closes it.
- Privacy tests prove that financial inputs, outputs, account data, and tokens are absent from all analytics allow-lists and payload construction.
- Production measurements remain UNVERIFIED until the post-merge live verification and browser network test are recorded.
