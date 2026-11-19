### 4.0 Data Models (High-Level)
*   **Tenant**: `id`, `name`, `owner_user_id`, `subscription_plan_id`, `custom_domain` (optional), `theme_settings`.
*   **User**: `id`, `email`, `hashed_password`, `name`, `role` (SUPER_ADMIN, PROVIDER, CUSTOMER).
*   **Product**: `id`, `tenant_id`, `name`, `description`, `price`, `category`, `custom_attributes` (JSONB).
*   **Order**: `id`, `customer_user_id`, `tenant_id`, `items_snapshot` (JSONB), `total_amount`, `status`.
