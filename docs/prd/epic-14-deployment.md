### Epic 14: Deployment & Operations

This epic focuses on creating the artifacts required to build, deploy, and operate the application in a real-world environment.

-   **Story 14.4 (Abstract API Layer for Production Readiness):** A critical architectural refactor to decouple the frontend from the mock API, allowing for a seamless transition to a live backend. (Completed)
-   **Story 14.2 (Implement CI/CD Pipeline Configuration):** Added a starter CI/CD pipeline configuration file for GitHub Actions to automate the process of linting, testing, building, and publishing the application's container image on every code change. (Completed)
-   **Story 14.1 (Containerize the Application with Docker):** Created a production-ready, multi-stage `Dockerfile` and a `.dockerignore` file. This allows the application to be built into a standardized, portable, and secure container image for deployment. (Completed)