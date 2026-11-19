

import type { Notification, User, Address, FeedItem } from '../types';
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

export const getNotifications = async (token: string): Promise<Notification[]> => {
    const response = await apiClient('/api/users/me/notifications', {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const markNotificationsAsRead = async (token: string): Promise<void> => {
    await apiClient('/api/users/me/notifications/read', {
        method: 'POST',
        headers: getAuthHeaders(token),
    });
    // No response body expected, so we don't call handleResponse
};

// New function for cart abandonment
export const sendCartReminder = async (token: string): Promise<void> => {
    const response = await apiClient('/api/users/me/cart-reminder', {
        method: 'POST',
        headers: getAuthHeaders(token),
    });
    // This returns a 204 No Content on success
    if (!response.ok) {
        throw new Error('Failed to send cart reminder.');
    }
};

// New function for customer re-engagement
export const sendReEngagementReward = async (providerId: string, token: string): Promise<void> => {
    const response = await apiClient('/api/users/me/re-engagement-reward', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ providerId }),
    });
    if (!response.ok) {
        throw new Error('Failed to send re-engagement reward.');
    }
};


// --- New Address Management Functions ---

export const getUserProfile = async (userId: string, token: string): Promise<User> => {
    const response = await apiClient(`/api/users/${userId}/profile`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
}

export const updateUserAddresses = async (userId: string, addresses: Address[], token: string): Promise<User> => {
    const response = await apiClient(`/api/users/${userId}/addresses`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ addresses }),
    });
    return handleResponse(response);
};

// --- New Favorite Kitchens Functions ---

export const updateUserFollows = async (userId: string, followedProviderIds: string[], token: string): Promise<User> => {
    const response = await apiClient(`/api/users/${userId}/follows`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ followedProviderIds }),
    });
    return handleResponse(response);
};

// --- New Wishlist Functions ---

export const updateUserWishlist = async (userId: string, wishlistMealIds: string[], token: string): Promise<User> => {
    const response = await apiClient(`/api/users/${userId}/wishlist`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ wishlistMealIds }),
    });
    return handleResponse(response);
};

// --- New Feed Function ---
export const getUserFeed = async (token: string): Promise<FeedItem[]> => {
    const response = await apiClient('/api/users/me/feed', {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

// --- New Notification Preferences Function ---
export const updateUserNotificationPreferences = async (
    userId: string,
    preferences: User['notificationPreferences'],
    token: string
): Promise<User> => {
    const response = await apiClient(`/api/users/${userId}/notification-preferences`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ preferences }),
    });
    return handleResponse(response);
};