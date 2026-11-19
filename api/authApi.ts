import type { User } from '../types';
import { apiClient } from './client';

// FIX: handleResponse no longer throws an error for the MFA step. It returns the data object
// from the backend, allowing the AuthProvider to handle the control flow gracefully.
const handleResponse = async (response: Response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    // For MFA login, we now return the data payload instead of throwing an error.
    return data;
};

/**
 * Logs in a user by calling the backend API.
 * The promise now resolves to an object that might contain user/token OR mfa signals.
 */
// FIX: The return type is updated to reflect the new, more flexible response.
export const login = async (email: string, password: string): Promise<{ user?: User, token?: string, mfaRequired?: boolean, mfaToken?: string }> => {
    const response = await apiClient('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
};

/**
 * Verifies the MFA OTP during the login flow.
 */
export const verifyLoginMfa = async (mfaToken: string, otp: string): Promise<{ user: User, token: string }> => {
    const response = await apiClient('/api/v1/auth/mfa/login-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaToken, otp }),
    });
    return handleResponse(response);
};

/**
 * Signs up a new user by calling the backend API.
 */
export const signup = async (name: string, email: string, password: string, role: User['role']): Promise<{ user: User, token: string }> => {
    const response = await apiClient('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
    });
    return handleResponse(response);
};

/**
 * Logs out a user. In a real app, this might invalidate a token on the server.
 */
export const logout = async (): Promise<void> => {
    await apiClient('/api/v1/auth/logout', { method: 'POST' });
};

/**
 * Starts the MFA setup process for the logged-in user.
 */
export const setupMfa = async (token: string): Promise<{ secret: string, qrCodeDataUrl: string }> => {
    const response = await apiClient('/api/v1/auth/mfa/setup', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

/**
 * Verifies and enables MFA for the logged-in user.
 */
export const verifyMfa = async (token: string, otp: string): Promise<{ success: boolean }> => {
    const response = await apiClient('/api/v1/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ otp })
    });
    return handleResponse(response);
};

/**
 * Disables MFA for the logged-in user.
 */
export const disableMfa = async (token: string): Promise<{ success: boolean }> => {
    const response = await apiClient('/api/v1/auth/mfa/disable', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};