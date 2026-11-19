import { mockApiRouter } from './mock';

const USE_MOCK_API = false;
const API_BASE_URL = '';

/**
 * A centralized API client that routes all frontend API requests to the live backend.
 * @param path The API endpoint path (e.g., '/api/v1/auth/login').
 * @param options The standard fetch RequestInit options (method, headers, body, etc.).
 * @returns A Promise that resolves to a Response object.
 */
export const apiClient = async (path: string, options?: RequestInit): Promise<Response> => {
    if (!USE_MOCK_API) {
        const url = `${API_BASE_URL}${path}`;
        const response = await fetch(url, { cache: 'no-store', ...options });
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
            return mockApiRouter(path, options);
        }
        return response;
    }
    return mockApiRouter(path, options);
};