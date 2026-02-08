# Specification

## Summary
**Goal:** Double the rendered size of the header FitGebit logo image.

**Planned changes:**
- Update the Tailwind sizing classes on the header logo `<img>` in `frontend/src/components/Header.tsx` (e.g., change from `h-8 w-8` to `h-16 w-16`) to render at 2× size.
- Ensure any layout adjustment is limited to what’s necessary to accommodate the larger logo, without changing other header elements.

**User-visible outcome:** The FitGebit logo in the app header appears twice as large as before (e.g., 32×32 becomes 64×64), with everything else in the header remaining the same.
