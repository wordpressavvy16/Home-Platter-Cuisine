### 3.0 Target State Architecture
*   **Architectural Paradigm:** Cloud-Native, API-First, Microservices, Multitenant.
*   **Frontend:** Next.js (React) for Server-Side Rendering (SSR).
*   **Backend Services:** A collection of independent, containerized microservices communicating via an API Gateway.
*   **API Gateway:** Secure entry point for all frontend requests. Handles auth, routing, rate limiting.
*   **Auth Service:** Manages user identity, authentication (OAuth 2.0), and roles.
*   **Tenant Service:** Manages Provider (Artisan) accounts, subscriptions, and configurations.
*   **Product Catalog Service:** Manages product listings, with data isolated by `tenant_id`.
*   **Order Service:** Manages the complete lifecycle of orders.
*   **AI Gateway Service:** A secure backend proxy for all third-party AI calls. The frontend will never call external AI APIs directly.

---
### 3.1 UI/UX Architecture Patterns

*   **Function-Centric Panel Pattern (Legacy):** The initial dashboard design is based on function-centric panels. Each panel (e.g., Orders, Reviews, CRM) handles a single business function. While simple, this leads to inefficiency and context-switching for complex, multi-step user workflows.
*   **Entity-Centric Hub Pattern (Target):** To improve workflow efficiency, the target architecture will increasingly adopt an entity-centric pattern. This pattern consolidates all data and actions related to a single entity (e.g., a Customer) into a unified "360-Degree View" or "Hub." This hub becomes the primary interface for managing that entity, pulling data from multiple function-specific services into one cohesive UI. This reduces navigation and streamlines complex tasks for power users like Providers and Super Admins. The **Unified CRM Hub (Epic 19)** is the first implementation of this target pattern.