import type { SupportTicket, TicketMessage, TicketStatus, TicketCategory } from '../types';
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

export const createTicket = async (
    ticketData: { subject: string; category: TicketCategory; message: string },
    token: string
): Promise<SupportTicket> => {
    const response = await apiClient('/api/support/tickets', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(ticketData),
    });
    return handleResponse(response);
};

export const getTicketsForUser = async (token: string): Promise<SupportTicket[]> => {
    const response = await apiClient('/api/support/tickets/user', {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const getAllTickets = async (token: string): Promise<SupportTicket[]> => {
    const response = await apiClient('/api/support/tickets', {
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

export const addMessageToTicket = async (
    ticketId: string,
    messageText: string,
    token: string
): Promise<SupportTicket> => {
    const response = await apiClient(`/api/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ text: messageText }),
    });
    return handleResponse(response);
};

export const updateTicketStatus = async (
    ticketId: string,
    status: TicketStatus,
    token: string
): Promise<SupportTicket> => {
    const response = await apiClient(`/api/support/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ status }),
    });
    return handleResponse(response);
};