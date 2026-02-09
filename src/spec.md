# Specification

## Summary
**Goal:** Add an admin-only “full system reset” that scrubs all users and user-related data so the app can restart with fresh logins and avoid post-reset login hangs.

**Planned changes:**
- Add a backend admin-only reset method (e.g., `resetAllState`) that clears all user profiles and all user-tied state (tasks, audit logs, overtime, notifications, task history, avatars, preferences, authorization/roles, and ID counters), resets manager-registration state, and is idempotent.
- Enforce access control on the reset method (non-admin callers receive an Unauthorized error).
- Add a frontend “Full System Reset” entry point available even from login/auth bootstrap error surfaces, with typed confirmation, and clear success/error feedback in English.
- On successful reset, clear client session state (sessionStorage keys), clear the React Query cache, and return to a clean login state.
- Adjust/verify auth bootstrap so that post-reset sign-in routes to Profile Setup when no user profile exists, and the app does not get stuck on an indefinite global loading screen (retaining retry/sign-out/reset actions on bootstrap timeout).

**User-visible outcome:** An admin can securely trigger a full system wipe from the UI (even if stuck at login), receive clear success/error feedback, and after reset users can sign in normally and be routed to Profile Setup instead of an endless loading screen.
