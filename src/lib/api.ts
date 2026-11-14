/**
 * FreshBasket API Client for Python FastAPI Backend.
 * Communicates with http://localhost:8000/api
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function apiClient<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // If client-side, we can use relative /api (proxied via Next.js rewrites) or direct API_BASE
    const url = typeof window !== 'undefined'
        ? cleanEndpoint
        : `${API_BASE}${cleanEndpoint}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    const config: RequestInit = {
        ...options,
        headers,
        credentials: 'include',
    };

    const res = await fetch(url, config);

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `API request failed with status ${res.status}`);
    }

    return res.json();
}

export const api = {
    // Auth
    login: (credentials: Record<string, unknown>) =>
        apiClient('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData: Record<string, unknown>) =>
        apiClient('/api/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    logout: () =>
        apiClient('/api/auth/logout', { method: 'POST' }),
    me: () =>
        apiClient('/api/auth/me'),

    // Products
    getProducts: (params?: Record<string, string>) => {
        const query = params ? `?${new URLSearchParams(params).toString()}` : '';
        return apiClient(`/api/products${query}`);
    },
    getProductBySlug: (slug: string) =>
        apiClient(`/api/products/${slug}`),

    // Categories
    getCategories: () =>
        apiClient('/api/categories'),

    // Coupons
    validateCoupon: (code: string, subtotal: number) =>
        apiClient('/api/coupons/validate', {
            method: 'POST',
            body: JSON.stringify({ code, subtotal }),
        }),

    // Orders
    createOrder: (orderData: Record<string, unknown>) =>
        apiClient('/api/orders', { method: 'POST', body: JSON.stringify(orderData) }),
    getOrders: (status?: string) => {
        const query = status ? `?status=${status}` : '';
        return apiClient(`/api/orders${query}`);
    },
    getOrderById: (orderId: string) =>
        apiClient(`/api/orders/${orderId}`),

    // Reviews
    createReview: (reviewData: Record<string, unknown>) =>
        apiClient('/api/reviews', { method: 'POST', body: JSON.stringify(reviewData) }),

    // Admin
    getStats: () =>
        apiClient('/api/admin/stats'),
    getLowStock: () =>
        apiClient('/api/admin/inventory/low-stock'),
    getBestSellers: () =>
        apiClient('/api/admin/inventory/best-sellers'),
    getAdminUsers: () =>
        apiClient('/api/admin/users'),
    updateAdminUser: (userId: string, data: Record<string, unknown>) =>
        apiClient(`/api/admin/users/${userId}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

