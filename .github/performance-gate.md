# Production performance gate

The stabilization build writes the deployable canonical bundles, clean calculator routes, content-hashed runtime references, CLS guardrails, and service-worker assets. The push after this marker exists solely to force the normal CI suite to validate the generated production tree rather than the pre-build source tree.
