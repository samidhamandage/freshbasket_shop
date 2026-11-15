/** @type {import('next').NextConfig} */
const FASTAPI_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'https://freshbasket-shop.onrender.com').replace(/\/$/, '');

const nextConfig = {
    async rewrites() {
        return {
            beforeFiles: [
                // FastAPI Auth Endpoints (only register, login, me, logout, refresh)
                {
                    source: '/api/auth/register',
                    destination: `${FASTAPI_URL}/api/auth/register`,
                },
                {
                    source: '/api/auth/login',
                    destination: `${FASTAPI_URL}/api/auth/login`,
                },
                {
                    source: '/api/auth/me',
                    destination: `${FASTAPI_URL}/api/auth/me`,
                },
                {
                    source: '/api/auth/logout',
                    destination: `${FASTAPI_URL}/api/auth/logout`,
                },
                {
                    source: '/api/auth/refresh',
                    destination: `${FASTAPI_URL}/api/auth/refresh`,
                },
                // Domain API Routes to FastAPI
                {
                    source: '/api/products',
                    destination: `${FASTAPI_URL}/api/products`,
                },
                {
                    source: '/api/products/:path+',
                    destination: `${FASTAPI_URL}/api/products/:path+`,
                },
                {
                    source: '/api/categories',
                    destination: `${FASTAPI_URL}/api/categories`,
                },
                {
                    source: '/api/categories/:path+',
                    destination: `${FASTAPI_URL}/api/categories/:path+`,
                },
                {
                    source: '/api/orders',
                    destination: `${FASTAPI_URL}/api/orders`,
                },
                {
                    source: '/api/orders/:path+',
                    destination: `${FASTAPI_URL}/api/orders/:path+`,
                },
                {
                    source: '/api/coupons',
                    destination: `${FASTAPI_URL}/api/coupons`,
                },
                {
                    source: '/api/coupons/:path+',
                    destination: `${FASTAPI_URL}/api/coupons/:path+`,
                },
                {
                    source: '/api/reviews',
                    destination: `${FASTAPI_URL}/api/reviews`,
                },
                {
                    source: '/api/reviews/:path+',
                    destination: `${FASTAPI_URL}/api/reviews/:path+`,
                },
                {
                    source: '/api/recommendations',
                    destination: `${FASTAPI_URL}/api/recommendations`,
                },
                {
                    source: '/api/recommendations/:path+',
                    destination: `${FASTAPI_URL}/api/recommendations/:path+`,
                },
                {
                    source: '/api/payments',
                    destination: `${FASTAPI_URL}/api/payments`,
                },
                {
                    source: '/api/payments/:path+',
                    destination: `${FASTAPI_URL}/api/payments/:path+`,
                },
                {
                    source: '/api/webhooks',
                    destination: `${FASTAPI_URL}/api/webhooks`,
                },
                {
                    source: '/api/webhooks/:path+',
                    destination: `${FASTAPI_URL}/api/webhooks/:path+`,
                },
                {
                    source: '/api/admin/:path*',
                    destination: `${FASTAPI_URL}/api/admin/:path*`,
                },
            ],
        };
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'res.cloudinary.com' },
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    headers: async () => [
        {
            source: '/(.*)',
            headers: [
                { key: 'X-Frame-Options', value: 'DENY' },
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
                { key: 'X-XSS-Protection', value: '1; mode=block' },
            ],
        },
    ],
};

module.exports = nextConfig;
