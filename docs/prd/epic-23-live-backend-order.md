### Epic 23: Live Backend - Order & Transaction Migration

**Goal:** To migrate all order management, checkout, and transaction-related functionality from the mock `localStorage` backend to the live, persistent production database, enabling real, stateful transactions on the platform.

---

-   **Story 23.1 (Frontend - Connect to Live Order Service):** As a Frontend Developer, I need to update the application to communicate with the new live Order Service for all order-related operations, so that the platform can process real, persistent transactions instead of using the mock API. (Done)
-   **Story 23.2 (Backend - Order & Transaction Service Setup):** As a Backend Developer, I need to create and deploy a new, standalone Order microservice that connects to the production database, so that the platform has a secure and scalable way to manage orders, checkouts, and transactions. (Backend Task)