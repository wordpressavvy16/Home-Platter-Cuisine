# Retrospective Report: MFA Login Flow Bug

**ID:** BUG-001
**Status:** In Progress
**Description:** A persistent, critical bug preventing Provider and Super Admin users from completing the Multi-Factor Authentication (MFA) login flow. The UI incorrectly appears to "refresh" to a blank login form instead of proceeding to the OTP input screen.

---

## History of Resolution Attempts

### Attempt 1: Documentation Fix

*   **Hypothesis:** The user was not aware of the MFA step.
*   **Action:** Updated the `UAT_PLAN.md` to include instructions for the two-step login and the mock OTP code.
*   **Reason for Failure:** The issue was not a lack of user knowledge but a genuine software bug preventing the MFA screen from ever appearing.

### Attempt 2: `instanceof` Check

*   **Hypothesis:** The custom `MfaRequiredError` was being thrown correctly, but the UI component was not identifying it.
*   **Action:** Implemented an `if (error instanceof MfaRequiredError)` check in `AuthPage.tsx` to catch the specific error and switch the UI to the MFA input view.
*   **Reason for Failure:** The `instanceof` operator can be unreliable in modern JavaScript module environments, especially with bundled code, where the same class can exist as two different objects in memory. The check was failing, so the error was treated as a generic login failure.

### Attempt 3: Error `name` Property Check

*   **Hypothesis:** The class identity (`instanceof`) was unreliable, but the error's `name` property should be a stable string.
*   **Action:** Replaced the `instanceof` check with `if (error.name === 'MfaRequiredError')`.
*   **Reason for Failure:** Similar to the `instanceof` issue, the error object being passed up the call stack was likely being wrapped or transformed, causing its `name` property to be lost or changed. The UI still failed to identify the specific MFA signal.

### Attempt 4: Error `data payload` Check

*   **Hypothesis:** The error's type and name were unreliable, but the unique data it carried (`mfaToken`) should be preserved.
*   **Action:** Replaced the name check with `if (error && error.mfaToken)`.
*   **Reason for Failure:** While a more robust check, this still failed to address the root cause. The component (`AuthPage.tsx`) responsible for performing this check was being destroyed and re-mounted mid-process, so it never had a chance to inspect the error object.

### Attempt 5 & 6: Architectural Flaw in Mock API & State

*   **Hypothesis:** The error was being created or thrown incorrectly from the mock API, violating the application's architectural contract. Or, a state management issue was causing unexpected re-renders.
*   **Action (Attempt 5):** Refactored the mock API to return a success response with an `mfaRequired` flag instead of throwing an error directly.
*   **Action (Attempt 6):** Refactored `AuthProvider` to separate `isInitializing` state from `isLoading` state to prevent full-page re-renders.
*   **Reason for Failure:** These attempts were getting closer to the root cause but were incomplete. While separating `isInitializing` was correct, the core issue remained: the global `isLoading` state in `AuthProvider` was still tied to the root `App` component's render logic in a way that caused the entire application to unmount whenever a login was initiated, regardless of the outcome.

### Final Root Cause Analysis & Resolution (Attempt 7)

*   **True Root Cause:** A critical flaw in global state management. The `AuthProvider` used a single `isLoading` state for both the initial app load (requiring a full-page loader) and for login actions. When a login was attempted, this global state was set to `true`, causing the root `App` component to unmount the entire application UI (including the `AuthPage`) and display the full-page loader. By the time the MFA error was thrown, the component that was supposed to catch it no longer existed. The process would then complete, set `isLoading` to `false`, and mount a brand new `AuthPage`, creating the "refresh" effect.
*   **Definitive Solution:**
    1.  Separate the state in `AuthProvider` into `isInitializing` (for the one-time, full-page load) and `isLoading` (for in-page actions like button spinners).
    2.  Update the root `App.tsx` component to *only* listen to `isInitializing` for showing the full-page loader.
    3.  This ensures that when a user clicks "Login," the `AuthPage` remains mounted throughout the entire process, allowing it to correctly catch the MFA signal and switch to the OTP input view.

---
*This document will be updated with a "Resolution Successful" message upon user confirmation.*
