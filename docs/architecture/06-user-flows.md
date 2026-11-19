### 6.0 Key User Flows & API Contracts
This section maps existing application features to the target architecture.

#### 6.1 User Authentication (from `AuthPage.tsx`)
*   **User Action:** A user fills out the login form and clicks "Login".
*   **Flow:**
    1.  `AuthPage.tsx` calls a new function in `api/authApi.ts`.
    2.  This function makes a POST request to the backend: `POST /api/v1/auth/login` with email and password.
    3.  The API Gateway routes this to the Auth Service.
    4.  Auth Service validates credentials and returns a JWT.
    5.  The frontend stores the JWT and user info, updating the `AuthProvider` context.

#### 6.2 Customer Views Providers (from `HomePage.tsx`)
*   **User Action:** `HomePage.tsx` loads.
*   **Flow:**
    1.  The page's `useEffect` hook calls a function in `api/providerApi.ts`.
    2.  This function makes a GET request: `GET /api/v1/tenants`.
    3.  The API Gateway routes this to the Tenant Service, which returns a list of all active providers (tenants).

#### 6.3 Customer Views a Provider's Menu (from `MealProviderDetails.tsx`)
*   **User Action:** User clicks on a provider card.
*   **Flow:**
    1.  `MealProviderDetails.tsx` is rendered with a `providerId`.
    2.  It calls a function in `api/providerApi.ts` which makes a GET request: `GET /api/v1/products?tenantId={providerId}`.
    3.  The API Gateway routes to the Product Catalog Service, which returns the menu for that specific tenant.

#### 6.4 Customer Places an Order (from `CheckoutPage.tsx`)
*   **User Action:** User fills in shipping details and clicks "Place Order".
*   **Flow:**
    1.  `CheckoutPage.tsx` calls `api/orderApi.ts` with the cart contents and user token.
    2.  This function makes an authorized POST request: `POST /api/v1/orders` (The JWT is sent in the Authorization header).
    3.  The API Gateway validates the JWT and routes the request to the Order Service.
    4.  The Order Service creates the order record, associating it with the `userId` from the JWT and the correct `tenantId`.

#### 6.5 Provider Requests AI Business Summary (from `AnalyticsPage.tsx`)
*   **User Action:** Provider clicks "Generate Summary".
*   **Flow:**
    1.  `AnalyticsPage.tsx` calls `services/geminiService.ts`.
    2.  The `generateBusinessSummary` function makes an authorized POST request: `POST /api/v1/ai/business-summary`.
    3.  The API Gateway routes to the AI Gateway Service.
    4.  The AI Gateway Service fetches the required performance metrics and reviews from the other internal services (Order Service, Product Catalog Service).
    5.  It then constructs a prompt and securely calls the external Google Gemini API.
    6.  It receives the response from Gemini and returns the structured JSON summary to the frontend.
