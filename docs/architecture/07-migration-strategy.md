### 7.0 Alignment & Migration Strategy
We will evolve the application iteratively.
*   **Phase 1: Backend Foundation (Completed):** Build and deploy the core API Gateway, Auth Service, and Tenant Service. Modify the frontend `authApi.ts` to connect to these live endpoints. *(Frontend connection for Auth Service is complete as of Story 16.2).*
*   **Phase 2: Service Decoupling (In Progress):** Build the Product Catalog and Order services. Update the frontend to consume them, phasing out `localStorage`. *(Frontend connection for Provider/Product Catalog is complete as of Story 17.1).*
*   **Phase 3: Frontend Modernization:** Begin the migration from the current SPA structure to Next.js for SSR benefits.
*   **Phase 4: Advanced Features:** With the new architecture in place, build features from the PRD like the Super Admin dashboard and dynamic theming.