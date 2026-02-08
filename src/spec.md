# Specification

## Summary
**Goal:** Trigger a fresh rebuild and deployment of the latest FitGebit codebase (option 2), rather than publishing the already-built Draft Version 11 artifact.

**Planned changes:**
- Produce a new build from the current FitGebit codebase (do not reuse the Draft Version 11 build artifact).
- Deploy the newly built version to the platform deployment URL.
- Ensure the deployed build is the intended live/production version if the platform distinguishes between draft and live.

**User-visible outcome:** Testers/users can access the newly rebuilt and deployed FitGebit version via the platform’s deployment URL, with no changes to app features or UI text.
