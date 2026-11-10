import Link from 'next/link';
import { Leaf, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-charcoal-50 flex items-center justify-center p-4">
            <div className="text-center">
                <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Leaf className="w-10 h-10 text-primary-700" />
                </div>
                <h1 className="font-display text-6xl font-bold text-charcoal-900 mb-4">404</h1>
                <h2 className="text-xl font-semibold text-charcoal-800 mb-2">Page Not Found</h2>
                <p className="text-charcoal-500 mb-8 max-w-md">
                    The page you are looking for might have been removed, had its name
                    changed, or is temporarily unavailable.
                </p>
                <Link
                    href="/"
                    className="btn-primary inline-flex items-center gap-2"
                >
                    <Home className="w-4 h-4" />
                    Go Home
                </Link>
            </div>
        </div>
    );
}
