# Specification

## Summary
**Goal:** Fix the profile setup/registration flow so first-time Internet Identity users can create a profile and be routed into the correct dashboard.

**Planned changes:**
- Backend: adjust `registerAssistant` so first-time authenticated callers can register successfully, required state/permissions are initialized, and invalid inputs return explicit errors.
- Backend: ensure a successfully created profile is persisted so `getCallerUserProfile` returns a non-null profile for that caller afterward.
- Frontend: fix Profile Setup submit handling so “Create Profile” routes into the app on success, shows a clear error on failure, and re-enables the button after an error.
- Frontend: after `useRegisterAssistant()` succeeds, refresh/refetch the current profile (or update cache) so the app stops rendering Profile Setup and renders the correct dashboard with a consistent loading transition.

**User-visible outcome:** A new user can log in with Internet Identity, complete Profile Setup, click “Create Profile,” and reliably reach the assistant/manager dashboard without getting stuck; if registration fails, they see a clear error and can try again.
