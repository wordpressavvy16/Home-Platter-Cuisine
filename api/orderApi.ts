import type { User, CartItem, Order, CouponValidationResponse, Coupon, Message, OrderAddOn, Inquiry, DisputeReason, SubscriptionOrder } from '../types';
import { apiClient } from './client';

export interface CustomerSummary {
  name: string;
  email: string;
  orderCount: number;
  userId: string;
}

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    return response.json();
};

const getAuthHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
});

/**
 * Creates one or more orders from a cart by sending a request to the smart checkout endpoint.
 * This function delegates the complexity of splitting the cart into multiple orders to the backend.
 * @returns A summary of the created orders.
 */
export const checkout = async (
    user: User, 
    cart: CartItem[], 
    token: string, 
    addOns: OrderAddOn[], 
    deliveryMethods: Record<string, 'PICKUP' | 'DELIVERY'>,
    redeemPoints?: boolean,
    appliedCoupons?: Record<string, Coupon | null>
): Promise<{ createdOrders: Order[]; createdSubscriptions: SubscriptionOrder[] }> => {
    const response = await apiClient('/api/orders/checkout', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ user, cart, addOns, deliveryMethods, redeemPoints, appliedCoupons }),
    });
    return handleResponse(response);
};

// New function for Story 2.21
export const checkoutCatering = async (inquiry: Inquiry, token: string): Promise<Order> => {
    const response = await apiClient('/api/orders/checkout-catering', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ inquiry }),
    });
    return handleResponse(response);
};


/**
 * @deprecated Use `checkout` instead. This function does not support multi-provider carts.
 * Creates a new order by sending a request to the backend API.
 */
export const createOrder = async (user: User, cart: CartItem[], totalPrice: number, token: string): Promise<Order> => {
    console.warn("`createOrder` is deprecated. Use `checkout` for multi-provider support.");
    const response = await apiClient('/api/orders', { // This endpoint is also deprecated on the backend
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ user, cart, totalPrice }),
    });
    return handleResponse(response);
};

/**
 * Fetches all orders for a specific user from the backend API.
 */
export const getOrdersForUser = async (userId: string, token: string): Promise<Order[]> => {
    const response = await apiClient(`/api/orders/user/${userId}`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

/**
 * Fetches all orders for a specific meal provider from the backend API.
 */
export const getOrdersForProvider = async (providerId: string, token: string): Promise<Order[]> => {
    const response = await apiClient(`/api/orders/provider/${providerId}`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

/**
 * Fetches a single order by its ID.
 */
export const getOrderById = async (orderId: string, token: string): Promise<Order> => {
    const response = await apiClient(`/api/orders/${orderId}`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};


/**
 * Updates the status of a specific order.
 */
export const updateOrderStatus = async (orderId: string, status: Order['status'], token: string): Promise<Order> => {
    const response = await apiClient(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ status }),
    });
    return handleResponse(response);
};

/**
 * Marks an order as having been reviewed via the backend API.
 */
export const markOrderAsReviewed = async (orderId: string, token: string): Promise<Order> => {
    const response = await apiClient(`/api/orders/${orderId}/reviewed`, {
        method: 'POST',
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

/**
 * Submits a dispute for a specific order.
 */
export const reportIssueOnOrder = async (orderId: string, reason: DisputeReason, message: string, token: string): Promise<Order> => {
    const response = await apiClient(`/api/orders/${orderId}/dispute`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ reason, message }),
    });
    return handleResponse(response);
};


/**
 * Fetches a list of unique customers for a provider from the backend API.
 */
export const getCustomersForProvider = async (providerId: string, token: string): Promise<CustomerSummary[]> => {
     const response = await apiClient(`/api/customers/provider/${providerId}`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

/**
 * Validates a coupon code for a specific provider.
 */
export const validateCoupon = async (providerId: string, code: string, token: string): Promise<CouponValidationResponse> => {
    const response = await apiClient('/api/orders/validate-coupon', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ providerId, code }),
    });
    return handleResponse(response);
};

/**
 * Sends a message related to a specific order.
 */
export const sendMessageToOrder = async (orderId: string, message: { senderId: string; text: string; }, token: string): Promise<Order> => {
    const response = await apiClient(`/api/orders/${orderId}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(message),
    });
    return handleResponse(response);
};

/**
 * Fetches the list of available order add-ons.
 */
export const getAvailableAddOns = async (): Promise<OrderAddOn[]> => {
    const response = await apiClient('/api/addons');
    return handleResponse(response);
};

/**
 * Simulates requesting a delivery partner for an order.
 */
export const requestDeliveryPartner = async (orderId: string, token: string): Promise<Order> => {
    const response = await apiClient(`/api/orders/${orderId}/request-delivery`, {
        method: 'POST',
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

/**
 * Triggers an automated review reminder notification for an order.
 */
export const sendAutomatedReviewReminder = async (orderId: string, token: string): Promise<void> => {
    const response = await apiClient(`/api/orders/${orderId}/automated-review-reminder`, {
        method: 'POST',
        headers: getAuthHeaders(token),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
};

// --- New Subscription Management Functions ---

export const getSubscriptionOrdersForUser = async (userId: string, token: string): Promise<SubscriptionOrder[]> => {
    const response = await apiClient(`/api/subscriptions/user/${userId}`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const getSubscriptionOrdersForProvider = async (providerId: string, token: string): Promise<SubscriptionOrder[]> => {
    const response = await apiClient(`/api/subscriptions/provider/${providerId}`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const pauseSubscription = async (subscriptionId: string, pauseStartDate: string, pauseEndDate: string, token: string): Promise<SubscriptionOrder> => {
    const response = await apiClient(`/api/subscriptions/${subscriptionId}/pause`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ pauseStartDate, pauseEndDate }),
    });
    return handleResponse(response);
};