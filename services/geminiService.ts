


import type { Review, AnalysisResult, PerformanceMetrics, BusinessSummary, MealType, Order, Meal, DemandForecastResult, MenuAnalysis, User, MealProvider, Inquiry } from '../types';
import { apiClient } from '../api/client';

// This service now calls our secure backend API gateway instead of Google's API directly.

export interface SearchCriteria {
    keywords: string[];
    minRating?: number;
    mealType?: MealType;
}

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An AI service error occurred' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    return response.json();
};

const getAuthHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
});

export const getSearchCriteriaFromQuery = async (query: string): Promise<SearchCriteria> => {
    const response = await apiClient('/api/ai/natural-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    return handleResponse(response);
}

export const analyzeReviews = async (reviews: Review[], token: string): Promise<AnalysisResult> => {
  const response = await apiClient('/api/ai/analyze-reviews', {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ reviews }),
  });
  return handleResponse(response);
};

export const generateBusinessSummary = async (metrics: PerformanceMetrics, reviews: Review[], token: string): Promise<BusinessSummary> => {
    const response = await apiClient('/api/ai/business-summary', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ metrics, reviews }),
    });
    return handleResponse(response);
};

export const forecastDemand = async (orders: Order[], menu: Meal[], token: string): Promise<DemandForecastResult> => {
    const response = await apiClient('/api/ai/demand-forecast', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ orders, menu }),
    });
    return handleResponse(response);
};

export const identifyDishFromImage = async (base64Image: string, mimeType: string, token: string): Promise<{ dishName: string }> => {
    const response = await apiClient('/api/ai/identify-dish-from-image', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ base64Image, mimeType }),
    });
    return handleResponse(response);
};

export const refineBroadcastMessage = async (draftMessage: string, token: string): Promise<{ refinedMessage: string }> => {
    const response = await apiClient('/api/ai/refine-broadcast', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ draftMessage }),
    });
    return handleResponse(response);
};

export const getReplySuggestions = async (messageText: string, token: string): Promise<string[]> => {
    const response = await apiClient('/api/ai/reply-suggestions', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ messageText }),
    });
    return handleResponse(response);
};

export const getReviewReplySuggestions = async (review: Review, token: string): Promise<string[]> => {
    const response = await apiClient('/api/ai/review-reply-suggestions', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ review }),
    });
    return handleResponse(response);
};


export const generateMealDescription = async (mealName: string, mealType: MealType, token: string): Promise<{ description: string }> => {
    const response = await apiClient('/api/ai/meal-description', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ mealName, mealType }),
    });
    return handleResponse(response);
};

export const analyzeMenu = async (menu: Meal[], token: string): Promise<MenuAnalysis> => {
    const response = await apiClient('/api/ai/menu-analysis', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ menu }),
    });
    return handleResponse(response);
};

export const getRecommendedProviders = async (user: User, allProviders: MealProvider[], token: string): Promise<MealProvider[]> => {
    const response = await apiClient('/api/ai/recommendations', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ user, allProviders }),
    });
    return handleResponse(response);
};

export const getAiInquiryResponse = async (inquiry: Inquiry, provider: MealProvider, token: string): Promise<{ responseText: string }> => {
    const response = await apiClient('/api/ai/inquiry-response', {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ inquiry, provider }),
    });
    return handleResponse(response);
};