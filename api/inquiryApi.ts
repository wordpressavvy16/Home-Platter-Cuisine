import type { Inquiry, Message } from '../types';
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

export const createInquiry = async (providerId: string, firstMessage: { senderId: string; text: string; }, token: string): Promise<Inquiry> => {
    const response = await apiClient('/api/inquiries', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ providerId, firstMessage }),
    });
    return handleResponse(response);
};

export const addMessageToInquiry = async (inquiryId: string, message: { senderId: string; text: string; }, token: string): Promise<Inquiry> => {
    const response = await apiClient(`/api/inquiries/${inquiryId}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(message),
    });
    return handleResponse(response);
};

export const getInquiriesForProvider = async (providerId: string, token: string): Promise<Inquiry[]> => {
    const response = await apiClient(`/api/inquiries/provider/${providerId}`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const getInquiriesForCustomer = async (customerId: string, token: string): Promise<Inquiry[]> => {
    const response = await apiClient(`/api/inquiries/customer/${customerId}`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

// New function for Story 2.21
export const sendQuote = async (inquiryId: string, quoteData: { amount: number; expiresAt?: string }, token: string): Promise<Inquiry> => {
    const response = await apiClient(`/api/inquiries/${inquiryId}/quote`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(quoteData),
    });
    return handleResponse(response);
};

// New function for Story 2.21
export const getInquiryById = async (inquiryId: string, token: string): Promise<Inquiry> => {
    const response = await apiClient(`/api/inquiries/${inquiryId}`, {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};