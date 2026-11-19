### Epic 16: Live Backend - Authentication & Security Foundation

**Goal:** To replace the mock authentication system with a secure, production-grade microservice that manages user identity, login, and registration. This epic also introduces Multi-Factor Authentication (MFA) to fortify user accounts.

---

-   **Story 16.1 (Backend - Authentication Service Setup):** As a Backend Developer, I need to create and deploy a new, standalone Authentication microservice that connects to a real production database, so that the platform has a secure and scalable way to manage user identities. (Completed - Backend Task)
-   **Story 16.2 (Frontend - Connect to Live Authentication):** As a Frontend Developer, I need to update the application to communicate with the new live Authentication Service instead of the mock API, so that users can register and log in to the real production system. (Completed)
-   **Story 16.3 (Security - Implement Multi-Factor Authentication):** As a User, I want to secure my account by enabling Multi-Factor Authentication (MFA) using a One-Time Password (OTP) from an authenticator app, so that my account is protected even if my password is compromised. (In Progress)