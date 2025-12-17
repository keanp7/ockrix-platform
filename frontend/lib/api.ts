/**
 * API Client Utility
 * 
 * Centralized API calls with authentication
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Get auth headers
 */
const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * API request wrapper
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers = getAuthHeaders();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
}

/**
 * Auth API
 */
export const authApi = {
  register: (email: string, password: string, name?: string) =>
    apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getCurrentUser: () =>
    apiRequest('/api/auth/me', {
      method: 'GET',
    }),

  startPasswordRecovery: (email: string) =>
    apiRequest('/api/auth/password/recovery/start', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiRequest('/api/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest('/api/auth/password/change', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  logout: () =>
    apiRequest('/api/auth/logout', {
      method: 'POST',
    }),
};

/**
 * Recovery API
 */
export const recoveryApi = {
  start: (email?: string, phone?: string) =>
    apiRequest('/api/recovery/start', {
      method: 'POST',
      body: JSON.stringify({ email, phone }),
    }),

  verify: (sessionId: string) =>
    apiRequest('/api/recovery/verify', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    }),

  complete: (token: string) =>
    apiRequest('/api/recovery/complete', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
};

/**
 * Account Vault API
 */
export const vaultApi = {
  list: () =>
    apiRequest('/api/accounts', {
      method: 'GET',
    }),

  create: (accountName: string, identifier: string, identifierType: string, accountType?: string) =>
    apiRequest('/api/accounts', {
      method: 'POST',
      body: JSON.stringify({ accountName, identifier, identifierType, accountType }),
    }),

  delete: (accountId: string) =>
    apiRequest(`/api/accounts/${accountId}`, {
      method: 'DELETE',
    }),
};

/**
 * Recovery History API
 */
export const historyApi = {
  list: () =>
    apiRequest('/api/recoveries', {
      method: 'GET',
    }),

  get: (recoveryId: string) =>
    apiRequest(`/api/recoveries/${recoveryId}`, {
      method: 'GET',
    }),
};

/**
 * Billing API
 */
export const billingApi = {
  getSubscription: () =>
    apiRequest('/api/billing/subscription', {
      method: 'GET',
    }),

  createCheckout: (planId: string) =>
    apiRequest('/api/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    }),

  createPortal: () =>
    apiRequest('/api/billing/portal', {
      method: 'POST',
    }),
};

