# Wealth Arrays Performance Budget

## Mobile lab targets

Measured at 360 × 800 CSS px, DPR 2, 4× CPU slowdown and simulated slow 4G (150 ms RTT / 1.6 Mbps down). These are lab emulation targets, not a claim that a physical Moto G Power was tested.

| Page type | First-party initial JS (gzip) | CSS (gzip) |
|---|---:|---:|
| Home | < 35 KB | < 30 KB |
| Tools | < 35 KB | < 30 KB |
| Calculator | < 40 KB | < 30 KB |
| Article | < 10 KB | < 30 KB |

## Core Web Vitals / Lighthouse release targets

- Lighthouse mobile Performance: >= 95 on each representative route.
- LCP: < 2.0 seconds.
- TBT: < 150 ms.
- CLS: < 0.05.
- INP: < 200 ms using field data (CrUX/PageSpeed Insights) or a clearly labelled real-user measurement. Do not substitute lab TBT for INP.
- No uncaught console errors or failed first-party requests.
- Total DOM nodes < 1,500 and maximum DOM depth < 32.

## Representative routes

- Home: /
- Tool library: /tools.html
- Calculator: /sip-calculator/, /swp-calculator/, /fire-calculator/, /rent-vs-buy-calculator/
- Article: /articles/compound-interest-guide.html

## Release safeguards

- Snapshot-test all calculator definitions with default, zero, blank and large inputs before and after runtime changes.
- Browser-test calculation updates, currency/language/theme controls, CSV/PDF exports, embeds and saved/cloud scenarios.
- Preserve canonical URLs, metadata, structured data, crawlable internal links, robots.txt, sitemap.xml, ads.txt, consent behaviour and AdSense policy compliance.
- Load optional features (PDF, charts, FX, India tax and cloud scenarios) only when requested.
- Use content-hashed static assets with immutable caching; keep HTML and the service worker revalidated.
- Keep below-the-fold calculator cards and article content crawlable while deferring their rendering with content-visibility where supported.

## Measurement limitations

- Lighthouse lab reports do not provide field INP. Record it as unavailable unless CrUX/PageSpeed Insights provides a real-user value.
- A simulated 4G/Moto G Power profile is an approximation. Final release validation should include a physical mid-range Android phone on mobile data.
- Compare production and branch builds using the same Brotli-capable preview server; raw uncompressed localhost transfer sizes are not comparable with Cloudflare production transfer sizes.
