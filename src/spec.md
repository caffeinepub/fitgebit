# Specification

## Summary
**Goal:** Allow users to gain ManagerDashboard access during account creation by entering initials "YK" and an overtime value of 696969.

**Planned changes:**
- Add an "Overtime" numeric input to the profile setup (account creation) flow; include client-side numeric validation and allow it to be left empty.
- Update the frontend registration submission to send overtime along with username, initials, and language; update related registration hook/type usage.
- Update backend registration logic to assign the Manager role when initials == "YK" and overtime == 696969; otherwise keep existing role-default behavior.

**User-visible outcome:** During signup, users can enter an optional overtime value; users who register with initials "YK" and overtime "696969" receive the Manager role and can access the ManagerDashboard.
