# User Acceptance Testing (UAT) Plan - Home Platter

**Version:** 1.0
**Status:** Approved
**Purpose:** To provide a structured checklist for the project owner to conduct a final, comprehensive review of the Home Platter application's frontend. Successful completion of this UAT will signify that the current feature set is approved and the application is ready for the next phase of development (e.g., live backend integration, new feature epics).

---

### 1.0 Testing Environment

*   **Application URL:** [Please use the main application preview link]
*   **Test Credentials:**

    *   **Customer:** `customer@example.com` / `password`
        *   *Note: This account has a standard one-step login.*

    *   **Provider:** `provider@example.com` / `password`
        *   **MFA Required:** This is a 2-step login. After entering the password, you will be prompted for an authenticator code.
        *   **Mock OTP Code:** Enter `123456` to complete the login.

    *   **Super Admin:** `admin@homeplatter.com` / `password`
        *   **MFA Required:** This is a 2-step login. After entering the password, you will be prompted for an authenticator code.
        *   **Mock OTP Code:** Enter `123456` to complete the login.

---

### 2.0 Test Cases by User Persona

Please follow the steps below and check off each item upon successful validation.

#### 2.1 Customer Persona (`customer@example.com`)

-   [x] **Onboarding & Authentication:**
    -   [x] Log out, and successfully sign up for a new customer account.
    -   [x] Log out, and successfully log back in with the `customer@example.com` credentials.
    -   [x] The "Welcome Mat" appears after login with relevant quick links.

-   [x] **Homepage & Discovery:**
    -   [x] The homepage displays curated collections ("Top Rated," "Recommended," "New This Week").
    -   [x] The AI-powered natural language search works as expected (e.g., try "healthy veg food").
    -   [x] The voice search and image search functions are operational.
    -   [x] The "Quick Filters" ("Rating 4.5+", "Veg Only") correctly filter the "All Kitchens" list.
    -   [x] The view switcher for "All Kitchens" correctly toggles between the List and Map views.

-   [x] **Provider Interaction:**
    -   [x] Clicking a `MealProviderCard` navigates to the `MealProviderDetails` page.
    -   [x] The provider details page correctly displays the menu, reviews, AI summary, and promotional video.
    -   [x] The "Follow" and "Share" buttons are functional.
    -   [x] The "Quick View" modal on a `MealCard` opens and displays meal details.
    -   [x] Meals can be successfully added to the "Wishlist".

-   [x] **Ordering & Checkout:**
    -   [x] Items can be added to the shopping cart.
    -   [x] The `CartModal` correctly displays items and totals.
    -   [x] The pre-order system works correctly (e.g., try ordering from a kitchen after its cut-off time).
    -   [x] The `CheckoutPage` allows selection of a saved address.
    -   [x] Applying loyalty points correctly discounts the total.
    -   [x] The simulated payment process in the `PaymentModal` works, leading to the `OrderSuccessPage`.

-   [x] **Profile & Post-Order:**
    -   [x] The `ProfilePage` displays all tabs correctly.
    -   [x] **Order History:** Past orders are listed. The "Track Order" button navigates to the tracking page for dispatched orders.
    -   [x] **My Regulars:** Previously ordered items are shown and can be re-ordered.
    -   [x] **Following/Wishlist/Collections:** All sections correctly display the user's saved items.
    -   [x] **Notifications:** The notification panel in the header works and displays updates.

#### 2.2 Provider Persona (`provider@example.com`)

-   [ ] **Onboarding & Profile:**
    -   [ ] Log out and sign up for a *new* provider account. Verify that you are forced to the "Edit Profile" page.
    -   [ ] Fill out and save the profile. Verify you are then taken to the main dashboard.
    -   [ ] Log in as `provider@example.com` using the two-step MFA process. The customizable dashboard loads correctly.

-   [ ] **Dashboard & Operations:**
    -   [ ] The dashboard layout can be rearranged via drag-and-drop, and the layout persists after a refresh.
    -   [ ] **Orders Panel:** New orders trigger an alert. The status of an order can be successfully changed from "Pending" through to "Delivered".
    -   [ ] **Messages Panel:** Pre-order inquiries and order messages are displayed and can be replied to. AI reply suggestions are functional.
    -   [ ] **Review Panel:** Customer reviews are displayed. Public replies can be posted, and AI suggestions can be generated.

-   [ ] **Menu & Product Management:**
    -   [ ] Navigate to the "Manage Menu" page.
    -   [ ] Successfully create a new meal, including using the AI description generator.
    -   [ ] Successfully edit an existing meal.
    -   [ ] The "Visible" and "In Stock" toggles function correctly.
    -   [ ] Meals can be successfully added to a provider-managed collection.
    -   [ ] Tiffin Plans can be created, edited, and deleted.

-   [ ] **CRM & Analytics:**
    -   [ ] Navigate to the "Customer Directory (CRM)" and click on a customer to view their 360-degree profile.
    -   [ ] Contextual actions ("Send Reward," "Send Reminder") are functional from the customer profile.
    -   [ ] Navigate to the "Analytics" page.
    -   [ ] The AI Business Summary, Demand Forecast, and Menu Analysis tools can all be successfully triggered.

#### 2.3 Super Admin Persona (`admin@homeplatter.com`)

-   [ ] **Dashboard & Governance:**
    -   [ ] Log in as `admin@homeplatter.com` using the two-step MFA process. The main dashboard correctly displays platform-wide KPIs.
    -   [ ] **Provider Management:** The admin can view, approve, and suspend provider accounts.
    -   [ ] **Review Moderation:** Flagged reviews (if any) appear in the queue and can be actioned.
    -   [ ] **Dispute Resolution:** Open disputes (if any) appear and can be resolved, including issuing compensation.

-   [ ] **Operations:**
    -   [ ] **Master CRM:** All platform users are listed and searchable. Clicking a user navigates to their 360-degree profile.
    -   [ ] **Invoicing:** Invoices can be generated for providers.
    -   [ ] **Support Tickets:** The admin can view and reply to user-submitted support tickets.

-   [ ] **Platform Customization:**
    -   [ ] The "Dynamic Platform Theming" panel is functional. Applying a new theme (e.g., "Christmas") correctly changes the application's global appearance.

---

### 3.0 Sign-off

Upon completion of the above test cases, if the application meets all acceptance criteria, please provide your formal approval.

**Approved By:** _________________________

**Date:** _________________________

**Notes:** ___________________________________________________________________
___________________________________________________________________