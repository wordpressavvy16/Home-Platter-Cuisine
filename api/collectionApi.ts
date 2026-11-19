import type { Collection } from '../types';
import { apiClient } from './client';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
     if (response.status === 204) {
        return null;
    }
    return response.json();
};

const getAuthHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
});

// --- User Collection Functions ---

export const getCollectionsForUser = async (token: string): Promise<Collection[]> => {
    const response = await apiClient('/api/users/me/collections', {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const getPublicCollections = async (): Promise<Collection[]> => {
    const response = await apiClient('/api/collections/public');
    return handleResponse(response);
};

export const getCollectionById = async (collectionId: string): Promise<Collection> => {
    const response = await apiClient(`/api/collections/${collectionId}`);
    return handleResponse(response);
};


export const createCollection = async (
    data: { name: string; description?: string; isPublic?: boolean },
    token: string
): Promise<Collection> => {
    const response = await apiClient('/api/collections', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const updateCollection = async (
    collectionId: string,
    data: { name: string; description?: string; isPublic?: boolean },
    token: string
): Promise<Collection> => {
    const response = await apiClient(`/api/collections/${collectionId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const deleteCollection = async (collectionId: string, token: string): Promise<void> => {
    await apiClient(`/api/collections/${collectionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
    });
};

export const updateMealInCollections = async (
    mealId: string,
    collectionIds: string[],
    token: string
): Promise<Collection[]> => {
    const response = await apiClient('/api/collections/meal', {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ mealId, collectionIds }),
    });
    return handleResponse(response);
};

// --- Provider Collection Functions ---

export const getCollectionsForProvider = async (providerId: string, token: string): Promise<Collection[]> => {
    const response = await apiClient(`/api/providers/${providerId}/collections`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const createProviderCollection = async (
    providerId: string,
    data: { name: string; description?: string; },
    token: string
): Promise<Collection> => {
    const response = await apiClient(`/api/providers/${providerId}/collections`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const updateProviderCollection = async (
    providerId: string,
    collectionId: string,
    data: { name: string; description?: string; },
    token: string
): Promise<Collection> => {
    const response = await apiClient(`/api/providers/${providerId}/collections/${collectionId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const deleteProviderCollection = async (providerId: string, collectionId: string, token: string): Promise<void> => {
    await apiClient(`/api/providers/${providerId}/collections/${collectionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
    });
};

export const updateMealInProviderCollections = async (
    providerId: string,
    mealId: string,
    collectionIds: string[],
    token: string
): Promise<Collection[]> => {
    const response = await apiClient(`/api/providers/${providerId}/collections/meal`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ mealId, collectionIds }),
    });
    return handleResponse(response);
};