# Specification

## Summary
**Goal:** Promote the currently approved draft build to the live/production deployment so all end users load it by default, while ensuring the default UI theme matches the approved draft (not unintentionally extra-dim/dark).

**Planned changes:**
- Promote the current draft frontend and backend to the live (non-draft) deployment so live assets/code match the reviewed draft.
- Verify and adjust (if needed) the app’s default theme behavior on fresh sessions so it does not start in an unintended extra-dim/dark state compared to the approved draft.

**User-visible outcome:** Opening the app via the normal/live URL loads the newly promoted version by default, and first-time/fresh-session loads display the intended (approved) theme appearance.
