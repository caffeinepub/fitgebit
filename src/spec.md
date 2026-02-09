# Specification

## Summary
**Goal:** Fix registration/profile bootstrap so first-time authenticated users can create a profile and enter the app without getting stuck on loading.

**Planned changes:**
- Update the authenticated app bootstrap flow to handle `useGetCallerUserProfile()` failures by showing a clear error state with actions to retry fetching the profile and to sign out/re-authenticate (instead of an infinite loading loop).
- Adjust backend authorization so `registerAssistant` succeeds for newly authenticated Internet Identity users (no prior `#user` permission required), initializes/grants the needed access control for that principal, and still rejects anonymous callers with a clear English authorization error.
- Change `getCallerUserProfile` behavior so it returns `null` (no trap) for authenticated users who do not yet have a profile, and behaves in a controlled way for anonymous callers so the frontend can handle it without getting stuck.
- Update the profile creation UI to display explicit English error feedback (including backend trap messages) when profile creation fails, re-enable the submit button after failures, and navigate into the dashboard immediately after successful creation (no manual refresh).

**User-visible outcome:** New users can register/create a profile and access the dashboard; if profile loading or creation fails, they see a clear error message with a retry option and a way to sign out and try again.
