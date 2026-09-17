# Production performance gate

The stabilization build writes the deployable canonical bundles, clean calculator routes, content-hashed runtime references, CLS guardrails, service-worker assets, and canonical root links for nested pages. This marker commit forces the normal CI suite to validate that generated production tree rather than only the pre-build source tree.
