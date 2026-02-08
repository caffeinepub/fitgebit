# Specification

## Summary
**Goal:** Add a secure backend administrative wipe/reset operation, ensure the first user after a wipe becomes Manager automatically, and keep upgrades safe via migration handling.

**Planned changes:**
- Add a backend-only admin wipe/reset method that clears all stored application state (users, tasks, logs/history, preferences, notifications, overtime, avatars) and any stored blobs, and resets all ID counters.
- Restrict the wipe/reset method to authorized admins (at minimum, an existing Manager user).
- Update backend profile creation so when there are zero stored user profiles, the first created profile is assigned the Manager role; subsequent profiles default to Assistant unless existing logic sets otherwise.
- Add/adjust backend upgrade migration logic (backend/migration.mo) so upgrades do not trap and state remains consistent with the new wipe/reset and role-assignment behavior.

**User-visible outcome:** After deployment, an authorized Manager can reset the canister to a fresh state; after a reset, the first user to create a profile becomes Manager automatically, and the app continues working safely across upgrades.
