# Specification

## Summary
**Goal:** Fix the Login page so clicking “Sign in” never appears to do nothing by clearly reflecting Internet Identity initialization, sign-in progress, and any login errors.

**Planned changes:**
- Update the Login page to immediately show visible feedback on Sign in (disabled/spinner and “Signing in…” state) when login is triggered.
- Disable the Sign in button while Internet Identity is initializing (`loginStatus === 'initializing'`) and show clear English text indicating authentication is still initializing.
- Surface Internet Identity context errors on the Login page using the existing Alert component, including:
  - AuthClient-not-initialized cases (e.g., `loginError` set by the hook while initializing)
  - Provider-reported login errors (`loginStatus === 'loginError'` and/or `loginError` set), mapped through the existing `getUserFacingErrorMessage()` helper.
- Ensure the Login page relies on Internet Identity context state for failure handling (not `try/catch` around `await login()`).

**User-visible outcome:** Users clicking “Sign in” will always see immediate status feedback (Initializing/Signing in) or a clear, actionable error message instead of a silent no-op.
