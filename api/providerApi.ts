import type { MealProvider, Review, Meal, Announcement, Invoice, Coupon, TiffinPlan } from '../types';
import { apiClient } from './client';

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

export const getProviders = async (): Promise<MealProvider[]> => {
    const response = await apiClient('/api/providers');
    return handleResponse(response);
};

export const getProviderById = async (providerId: string): Promise<MealProvider | undefined> => {
    const response = await apiClient(`/api/providers/${providerId}`);
    return handleResponse(response);
};

export const getProviderByUserId = async (userId: string, token: string): Promise<MealProvider | undefined> => {
    const response = await apiClient(`/api/providers/user/${userId}`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
}

export const addReview = async (providerId: string, review: Omit<Review, 'id'>, token: string): Promise<MealProvider> => {
    const response = await apiClient(`/api/providers/${providerId}/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(review),
    });
    return handleResponse(response);
};

export const flagReview = async (providerId: string, reviewId: string, token: string): Promise<Review> => {
    const response = await apiClient(`/api/providers/${providerId}/reviews/${reviewId}/flag`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const addReplyToReview = async (providerId: string, reviewId: string, replyText: string, token: string): Promise<Review> => {
    const response = await apiClient(`/api/providers/${providerId}/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ replyText }),
    });
    return handleResponse(response);
};

// --- Menu Management Functions ---

export const addMeal = async (providerId: string, mealData: Omit<Meal, 'id'>, token: string): Promise<Meal> => {
    const response = await apiClient(`/api/providers/${providerId}/menu`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(mealData),
    });
    return handleResponse(response);
};

export const updateMeal = async (providerId: string, mealData: Meal, token: string): Promise<Meal> => {
    const response = await apiClient(`/api/providers/${providerId}/menu/${mealData.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(mealData),
    });
    return handleResponse(response);
};

export const removeMeal = async (providerId: string, mealId: string, token: string): Promise<void> => {
    const response = await apiClient(`/api/providers/${providerId}/menu/${mealId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
    });
    // Don't call handleResponse here because a successful DELETE might have no body.
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
};

// --- Profile Management ---

export const updateProviderProfile = async (providerId: string, profileData: Partial<MealProvider>, token: string): Promise<MealProvider> => {
    const response = await apiClient(`/api/providers/${providerId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(profileData),
    });
    return handleResponse(response);
};

export const updateProviderDashboardLayout = async (providerId: string, layout: string[], token: string): Promise<MealProvider> => {
    const response = await apiClient(`/api/providers/${providerId}/dashboard-layout`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ layout }),
    });
    return handleResponse(response);
};

// --- Announcement Functions ---

export const addAnnouncement = async (providerId: string, message: string, token: string): Promise<Announcement> => {
    const response = await apiClient(`/api/providers/${providerId}/announcements`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ message }),
    });
    return handleResponse(response);
};

// --- New CRM Functions ---

export const sendReviewReminder = async (orderId: string, token: string): Promise<void> => {
    const response = await apiClient('/api/reminders/review', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ orderId }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
};

// --- New Billing Functions ---

export const getInvoicesForProvider = async (providerId: string, token: string): Promise<Invoice[]> => {
    const response = await apiClient(`/api/providers/${providerId}/invoices`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

// --- New Coupon Functions ---

export const getCoupons = async (providerId: string, token: string): Promise<Coupon[]> => {
    const response = await apiClient(`/api/providers/${providerId}/coupons`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const createCoupon = async (providerId: string, couponData: Omit<Coupon, 'id' | 'providerId' | 'isActive'>, token: string): Promise<Coupon> => {
    const response = await apiClient(`/api/providers/${providerId}/coupons`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(couponData),
    });
    return handleResponse(response);
};

export const createTargetedCoupon = async (providerId: string, couponData: Omit<Coupon, 'id' | 'providerId' | 'isActive' | 'code'> & { targetUserId: string }, token: string): Promise<Coupon> => {
    const response = await apiClient(`/api/providers/${providerId}/targeted-coupon`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(couponData),
    });
    return handleResponse(response);
};

// --- New Tiffin Plan Functions (Story 20.1) ---

export const createTiffinPlan = async (providerId: string, planData: Omit<TiffinPlan, 'id'>, token: string): Promise<TiffinPlan> => {
    const response = await apiClient(`/api/providers/${providerId}/tiffin-plans`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(planData),
    });
    return handleResponse(response);
};

export const updateTiffinPlan = async (providerId: string, planId: string, planData: TiffinPlan, token: string): Promise<TiffinPlan> => {
    const response = await apiClient(`/api/providers/${providerId}/tiffin-plans/${planId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(planData),
    });
    return handleResponse(response);
};

export const deleteTiffinPlan = async (providerId: string, planId: string, token: string): Promise<void> => {
    const response = await apiClient(`/api/providers/${providerId}/tiffin-plans/${planId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
};