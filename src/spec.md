# Specification

## Summary
**Goal:** Provide a backend administrative reset operation that clears all stored user profiles and related user-linked data, and ensure the first profile created after a reset is automatically assigned the Manager role.

**Planned changes:**
- Add a single backend-callable administrative method (via Candid/dfx) that clears all stored user profiles from persistent state.
- As part of the reset, also clear user-linked collections/state that would otherwise reference deleted users (e.g., items keyed by username/principal such as overtime entries, notifications, and task preferences).
- Update backend profile creation/registration logic so that when no user profiles exist, the next successfully created profile is assigned role = manager; all subsequent profiles default to role = assistant.
- If profile/user state persists across upgrades, add/adjust migration handling so upgrades preserve existing state and the reset + first-user-manager behavior remains correct after upgrades.

**User-visible outcome:** No UI changes; administrators can invoke a backend reset to remove all existing user assignments, after which the next user to create a profile becomes the Manager automatically and later users become Assistants by default.
