### 2.0 Current State Analysis
*   **Architecture:** Client-Side Rendered Monolith (React SPA).
*   **Frontend:** React, TypeScript, TailwindCSS.
*   **Backend & Data:** Fully mocked via `localStorage`. All API calls in `api/*.ts` are simulations.
*   **AI Integration:** The frontend directly calls the Google Gemini API, which is insecure for production.
*   **Authentication:** Mock JWT flow simulated in `api/authApi.ts`.
