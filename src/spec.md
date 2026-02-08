# Specification

## Summary
**Goal:** Make the user account with username "Jay" always be the Manager, and default all other newly created accounts to Assistant.

**Planned changes:**
- Update backend profile creation/registration logic so username "Jay" is assigned (and maintained/corrected as) Manager, while all other new users are assigned Assistant by default.
- Update frontend onboarding/profile setup copy to state that "Jay" is the Manager account and all other new accounts will be Assistants by default (in English).

**User-visible outcome:** During onboarding/profile creation, "Jay" will automatically be the Manager account and all other new users will automatically be Assistants, with the UI text reflecting this rule.
