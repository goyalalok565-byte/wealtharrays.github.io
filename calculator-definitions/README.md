# Calculator definitions — canonical source

This directory is the single source of truth for calculator metadata, fields, defaults, formulas, result labels, examples and FAQ data.

- Edit the individual calculator definition file here.
- Do not edit the generated root calculators.js catalogue directly.
- Run npm run build:dist to regenerate the compatibility catalogue, registry.json, API model bundle, homepage/tools cards, search catalogue, llms.txt, sitemap and static calculator pages.
- The same registry is consumed by browser tests, API parity tests, QA workflows and launch-readiness checks.
- New calculator IDs and slugs must be unique. Add a definition file named <id>.js and verify that the generated page, tools index, homepage, sitemap, llms.txt and API all include it.
- Formula changes require golden-vector tests and a documented source/assumption review.

Generated outputs are validated during the build. They are not alternative sources of truth.
