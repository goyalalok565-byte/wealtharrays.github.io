# Wealth Arrays — Production Release

Wealth Arrays is a static, browser-first financial calculator site served from `wealtharrays.com`.

## Current production scope
- 23 calculator landing pages
- 18 original educational guides
- Responsive/mobile-first UI
- Browser-side deterministic calculations
- Share, export-report and embed actions
- Canonical URLs, robots.txt and sitemap.xml
- WebApplication, CollectionPage and Article structured data where appropriate
- Social preview card, favicon and web manifest
- Trust, privacy, methodology, editorial and advertising-policy pages
- Production security headers and CSP
- Automated calculator, metadata, crawl, privacy and browser smoke validation

## Growth architecture
- Calculator → guide → related calculator internal-link clusters
- Dedicated collections for investment and retirement/future planning
- New Step-Up SIP, Emergency Fund and Real Return tools
- Search-friendly tool library with calculator discovery
- Original explanatory content instead of mass-generated pages

## Operational notes
1. Google Analytics and Search Console account configuration is external to this repository.
2. AdSense is intentionally not hard-coded until the publisher account is approved/configured.
3. `ads.txt` should only be added after the real AdSense publisher ID exists.
4. Search Console query/impression data should drive the next content and calculator expansion cycle.

## Quality bar
Every production change should preserve calculator correctness, mobile usability, accessibility, transparent assumptions, crawlability and trust. Avoid destructive rewrites of stable CSS/runtime files.

SEO and AI-search optimization improve eligibility and machine understanding; neither can guarantee rankings, citations, traffic or AdSense approval.