/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return {
            beforeFiles: [
                // FastAPI Auth Endpoints (only register, login, me, logout, refresh)
                {
                    source: '/api/auth/register',
                    destination: 'http://localhost:8000/api/auth/register',
                },
                {
                    source: '/api/auth/login',
                    destination: 'http://localhost:8000/api/auth/login',
                },
                {
                    source: '/api/auth/me',
                    destination: 'http://localhost:8000/api/auth/me',
                },
                {
                    source: '/api/auth/logout',
                    destination: 'http://localhost:8000/api/auth/logout',
                },
                {
                    source: '/api/auth/refresh',
                    destination: 'http://localhost:8000/api/auth/refresh',
                },
                // Domain API Routes to FastAPI
                {
                    source: '/api/products/:path*',
                    destination: 'http://localhost:8000/api/products/:path*',
                },
                {
                    source: '/api/categories/:path*',
                    destination: 'http://localhost:8000/api/categories/:path*',
                },
                {
                    source: '/api/orders/:path*',
                    destination: 'http://localhost:8000/api/orders/:path*',
                },
                {
                    source: '/api/coupons/:path*',
                    destination: 'http://localhost:8000/api/coupons/:path*',
                },
                {
                    source: '/api/reviews/:path*',
                    destination: 'http://localhost:8000/api/reviews/:path*',
                },
                {
                    source: '/api/recommendations/:path*',
                    destination: 'http://localhost:8000/api/recommendations/:path*',
                },
                {
                    source: '/api/payments/:path*',
                    destination: 'http://localhost:8000/api/payments/:path*',
                },
                {
                    source: '/api/webhooks/:path*',
                    destination: 'http://localhost:8000/api/webhooks/:path*',
                },
                {
                    source: '/api/admin/:path*',
                    destination: 'http://localhost:8000/api/admin/:path*',
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
