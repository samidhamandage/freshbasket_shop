import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
    title: {
        default: 'FreshBasket X | AI-Powered Grocery Shopping',
        template: '%s | FreshBasket X',
    },
    description:
        'Experience the future of grocery shopping with AI-powered recommendations, real-time order tracking, and premium quality products delivered to your door.',
    keywords: ['grocery', 'online shopping', 'fresh food', 'delivery', 'organic', 'AI recommendations'],
    authors: [{ name: 'FreshBasket X' }],
    openGraph: {
        type: 'website',
        locale: 'en_US',
        siteName: 'FreshBasket X',
        title: 'FreshBasket X | AI-Powered Grocery Shopping',
        description: 'Experience the future of grocery shopping with AI-powered recommendations.',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen bg-charcoal-50 antialiased">
                <Providers>
                    {children}
                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: '#212121',
                                color: '#fff',
                                borderRadius: '12px',
                                padding: '14px 20px',
                                fontSize: '14px',
                                fontWeight: 500,
                            },
                            success: {
                                iconTheme: { primary: '#1B5E20', secondary: '#fff' },
                            },
                            error: {
                                iconTheme: { primary: '#EF4444', secondary: '#fff' },
                            },
                        }}
                    />
                </Providers>
            </body>
        </html>
    );
}
