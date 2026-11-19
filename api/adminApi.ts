import type { MealProvider, PlatformKpis, User, Invoice, Review, Order, Coupon } from '../types';
import { apiClient } from './client';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    // Handle cases with no content
    if (response.status === 204) {
        return null;
    }
    return response.json();
};

const getAuthHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
});

export const getAllProviders = async (token: string): Promise<MealProvider[]> => {
    const response = await apiClient('/api/admin/providers', {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const getPlatformKpis = async (token: string): Promise<PlatformKpis> => {
    const response = await apiClient('/api/admin/kpis', {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const getAllUsers = async (token: string): Promise<User[]> => {
    const response = await apiClient('/api/admin/users', {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};


export const approveProvider = async (providerId: string, token: string): Promise<MealProvider> => {
    const response = await apiClient(`/api/admin/providers/${providerId}/approve`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
}

export const suspendProvider = async (providerId: string, token: string): Promise<MealProvider> => {
    const response = await apiClient(`/api/admin/providers/${providerId}/suspend`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
}

export const reactivateProvider = async (providerId: string, token: string): Promise<MealProvider> => {
    const response = await apiClient(`/api/admin/providers/${providerId}/reactivate`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
}

// --- Invoicing Functions ---

export const getInvoices = async (token: string): Promise<Invoice[]> => {
    const response = await apiClient('/api/admin/invoices', {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const generateInvoice = async (providerId: string, token: string): Promise<Invoice> => {
    const response = await apiClient('/api/admin/invoices', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ providerId }),
    });
    return handleResponse(response);
};

// --- Review Moderation ---
export interface FlaggedReview {
    review: Review;
    providerId: string;
    providerName: string;
}

export const getFlaggedReviews = async (token: string): Promise<FlaggedReview[]> => {
    const response = await apiClient('/api/admin/reviews/flagged', {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const resolveReviewFlag = async (providerId: string, reviewId: string, action: 'dismiss' | 'delete', token: string): Promise<void> => {
    const response = await apiClient(`/api/admin/reviews/resolve`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ providerId, reviewId, action }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
};

// --- Provider Quality Monitoring ---
export interface AtRiskProvider {
    provider: MealProvider;
    reason: string;
    metric: string;
}

export const getAtRiskProviders = async (token: string): Promise<AtRiskProvider[]> => {
    const response = await apiClient('/api/admin/providers/at-risk', {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

// --- Order Dispute Resolution ---
export interface DisputedOrder {
    order: Order;
    providerName: string;
}

export const getOpenDisputes = async (token: string): Promise<DisputedOrder[]> => {
    const response = await apiClient('/api/admin/disputes/open', {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const resolveDispute = async (orderId: string, token: string): Promise<Order> => {
    const response = await apiClient(`/api/admin/disputes/${orderId}/resolve`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

// --- New Compensation Function ---
export interface CompensationData {
    orderId: string;
    customerId: string;
    discountPercentage: number;
    expiresAt: string;
}

export const issueCompensationCoupon = async (data: CompensationData, token: string): Promise<Coupon> => {
    const response = await apiClient('/api/admin/compensate', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};