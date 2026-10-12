# Wealth Arrays — Production Release

Wealth Arrays is a static, browser-first financial calculator site served from `wealtharrays.com`.

## Current production scope
- 20 canonical calculator landing pages
- 18 original educational guides
- Responsive/mobile-first UI
- Browser-side deterministic calculations
- Share, export-report and embed actions
- Canonical URLs, robots.txt and sitemap.xml
- WebApplication, CollectionPage and Article structured data where appropriate
- Social preview card, favicon and web manifest
- Trust, privacy, methodology, editorial and advertising-policy pages
- Production security headers and CSP
- Automated calculator regression, architecture, metadata, crawl, privacy and browser smoke validation

## Growth architecture
- Calculator → guide → related calculator internal-link clusters
- Dedicated collections for investment and retirement/future planning
- Search-friendly tool library with calculator discovery
- Original explanatory content instead of mass-generated pages

## Operational notes
1. Google Analytics and Search Console account configuration is external to this repository.
2. AdSense publisher configuration is present and the site is currently in Google's review process.
3. `ads.txt` contains the verified publisher contract for the configured AdSense account.
4. Search Console query/impression data should drive the next content and calculator expansion cycle.

## Quality bar
Every production change should preserve calculator correctness, mobile usability, accessibility, transparent assumptions, crawlability and trust. The canonical stabilization build and mandatory CI gates protect these invariants. Avoid destructive rewrites of stable CSS/runtime files.

SEO and AI-search optimization improve eligibility and machine understanding; neither can guarantee rankings, citations, traffic or AdSense approval.
