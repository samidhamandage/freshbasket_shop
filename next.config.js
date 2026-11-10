/** @type {import('next').NextConfig} */
const nextConfig = {
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
