# Specification

## Summary
**Goal:** Make dark mode work reliably across the entire app by honoring system theme by default and ensuring the theme toggle updates the UI, and set Dutch as the default language selection for new users during profile setup.

**Planned changes:**
- Update theme handling so first load defaults to OS/system preference when no theme is saved, and ensure Light/Dark/System selection applies immediately across all app screens.
- Ensure “System” theme follows OS theme changes in real time (without requiring a reload).
- Persist the selected theme choice across reloads (using existing behavior in the app’s theming library).
- Change Profile Setup so “Preferred Language” defaults to Dutch for new users until they manually select a different language, while keeping English/French selectable and stored on profile creation.

**User-visible outcome:** On first visit the app matches the device light/dark setting; switching the header theme setting instantly updates all screens and “System” tracks OS changes. On profile setup, the language selector starts on Dutch by default but can still be changed to English or French before creating a profile.
