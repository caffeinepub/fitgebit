# Specification

## Summary
**Goal:** Update two frontend UI elements: reorder the To-Do table so “Actions” is the leftmost column, and remove the overtime date helper/example paragraph.

**Planned changes:**
- Move the To-Do tasks table “Actions” column (header and all row cells with Edit/Done buttons) to be the first/leftmost column, keeping all existing behaviors unchanged.
- Remove the helper/example paragraph rendered under the overtime Date input without adding any replacement text, and keep existing DD-MM-YYYY validation intact.

**User-visible outcome:** The To-Do table shows action buttons on the far left, and the overtime Date field no longer displays the example/helper paragraph while still validating dates as before.
