

### Epic 7: Advanced CRM & Marketing Automation for Providers
*   A complete customer relationship management (CRM) system to view customer history and engagement.
*   Tools for creating promotional campaigns or discounts.
*   Automated email sequencing for order confirmations, review requests, and re-engagement campaigns.
*   **Story 7.1 & 7.4: Provider-Initiated Review Reminders:** (Completed)
*   **Story 7.2 & 7.3: Provider Broadcast Announcements with AI Assist:** (Completed)
*   **Story 7.5: Provider-Managed Coupon Codes:** (Completed)
*   **Story 7.6: Provider-Set Order Threshold Discounts:** (Completed)
*   **Story 7.7: Follower Notifications:** (Completed)
*   **Story 7.8: Provider-Targeted Customer Rewards:** (Completed)

#### 7.9 Business Rules & Constraints
- **Discount Exclusivity:** All coupons (both general and targeted) are mutually exclusive. They cannot be combined with the customer's loyalty point redemption or any other automatic discounts in the same order. If a customer applies a coupon, other discount options will be disabled for that transaction.

---

### Proposed Future Stories (from PRD v3.0)

The following stories represent the next phase of development for this epic, focusing on building a comprehensive automation engine.

-   **Story 7.9 (New Customer Onboarding):** Implement an automated email and WhatsApp workflow to welcome new customers, guide them on using the platform, and potentially offer an introductory discount to encourage their first purchase. (Completed)
-   **Story 7.10 (Cart Abandonment):** Implement an automated workflow to detect when a logged-in user has items in their cart for an extended period without checking out. The system should send a timed sequence of reminder emails and/or WhatsApp messages to encourage completion of the purchase. (Completed)
-   **Story 7.11 (Review Request Sequence):** Implement an automated workflow that sends a request for a review via email/WhatsApp a set amount of time after an order is marked as 'Delivered'. (Completed)
-   **Story 7.12 (Customer Re-engagement):** Develop a workflow to automatically reach out to customers who have not placed an order in a specific period (e.g., 30 days) with a special offer or update to encourage them to return. (Completed)
-   **Story 7.X (Order Confirmation & Updates):** Formalize the existing order status notifications into a complete, automated email/WhatsApp sequence for all stages of the order lifecycle (Confirmation, Preparation, Out for Delivery, Delivered).
