# Wealth Arrays — Release

This release upgrades the existing static GitHub Pages site without adding a framework.

## Included
- 8 calculator pages + category pages
- Fast system-font rendering (no Google Fonts network dependency)
- Responsive/mobile-first UI
- Share / export-report / copy-embed actions
- Working embeddable calculator endpoint: `widget.html?calc=sip`
- Canonical URLs, robots.txt and sitemap.xml
- WebApplication/WebSite structured data
- Social preview card + favicon + web manifest
- Duplicate alternate files removed to reduce duplicate URLs
- Accessibility improvements: labels, focus states, live calculator output
- SEO/GEO-friendly semantic content and internal-link architecture

## Before production
1. Replace `https://www.wealtharrays.com/` with your real production domain everywhere if the domain is different.
2. In Google Search Console, verify the domain and submit `/sitemap.xml`.
3. Test representative URLs with URL Inspection.
4. Run Lighthouse/PageSpeed on home + one calculator page.
5. Add your analytics measurement ID only after deciding which analytics platform you want.

## Important
SEO can make pages eligible and easier to understand, but no code can guarantee a Google ranking position or viral traffic.
