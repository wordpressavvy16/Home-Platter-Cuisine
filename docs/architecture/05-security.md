### 5.0 Security & API Key Management
*   **Zero Trust Model:** The API Gateway will validate a JWT on every request.
*   **API Key Secrecy:** All third-party API keys (Gemini, Stripe, etc.) will be stored in a secure vault (e.g., Google Secret Manager) and accessed only by the relevant backend services.
