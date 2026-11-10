'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

type Props = {
    categories: Array<{
        id: string;
        name: string;
        slug: string;
        _count: { products: number };
    }>;
    currentParams: Record<string, string | undefined>;
};

export default function ShopFilters({ categories, currentParams }: Props) {
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [minPrice, setMinPrice] = useState(currentParams.minPrice || '');
    const [maxPrice, setMaxPrice] = useState(currentParams.maxPrice || '');

    const buildUrl = (key: string, value: string) => {
        const params = new URLSearchParams();
        Object.entries(currentParams).forEach(([k, v]) => {
            if (v && k !== 'page') params.set(k, v);
        });
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('page');
        return `/shop?${params.toString()}`;
    };

    const applyPriceFilter = () => {
        const params = new URLSearchParams();
        Object.entries(currentParams).forEach(([k, v]) => {
            if (v && k !== 'page' && k !== 'minPrice' && k !== 'maxPrice') params.set(k, v);
        });
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        router.push(`/shop?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push('/shop');
    };

    const hasFilters = currentParams.category || currentParams.minPrice || currentParams.maxPrice || currentParams.rating;

    const filterContent = (
        <div className="space-y-6">
            {hasFilters && (
                <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                    <X className="w-4 h-4" />
                    Clear All Filters
                </button>
            )}

            {/* Categories */}
            <div>
                <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-3">
                    Categories
                </h3>
                <div className="space-y-1">
                    <Link
                        href={buildUrl('category', '')}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!currentParams.category
                                ? 'bg-primary-50 text-primary-900 font-medium'
                                : 'text-charcoal-600 hover:bg-charcoal-50'
                            }`}
                    >
                        All Categories
                    </Link>
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={buildUrl('category', cat.slug)}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${currentParams.category === cat.slug
                                    ? 'bg-primary-50 text-primary-900 font-medium'
                                    : 'text-charcoal-600 hover:bg-charcoal-50'
                                }`}
                        >
                            <span>{cat.name}</span>
                            <span className="text-xs text-charcoal-400">{cat._count.products}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-3">
                    Price Range
                </h3>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-charcoal-200 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                    <span className="text-charcoal-400">–</span>
                    <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-charcoal-200 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                </div>
                <button
                    onClick={applyPriceFilter}
                    className="mt-2 w-full py-2 bg-primary-900 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors"
                >
                    Apply
                </button>
            </div>

            {/* Rating */}
            <div>
                <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-3">
                    Minimum Rating
                </h3>
                <div className="space-y-1">
                    {[4, 3, 2, 1].map((rating) => (
                        <Link
                            key={rating}
                            href={buildUrl('rating', rating.toString())}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${currentParams.rating === rating.toString()
                                    ? 'bg-primary-50 text-primary-900 font-medium'
                                    : 'text-charcoal-600 hover:bg-charcoal-50'
                                }`}
                        >
                            {'★'.repeat(rating)}
                            {'☆'.repeat(5 - rating)}
                            <span className="ml-1">& up</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden flex items-center gap-2 w-full py-3 px-4 bg-white border border-charcoal-200 rounded-xl text-sm font-medium text-charcoal-700 mb-4"
            >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasFilters && (
                    <span className="ml-auto w-5 h-5 bg-primary-900 text-white text-xs rounded-full flex items-center justify-center">
                        !
                    </span>
                )}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto animate-slide-down">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Filters</h2>
                            <button onClick={() => setMobileOpen(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {filterContent}
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <div className="hidden lg:block card p-5 sticky top-24">
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-charcoal-100">
                    <SlidersHorizontal className="w-4 h-4 text-primary-700" />
                    <h2 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider">
                        Filters
                    </h2>
                </div>
                {filterContent}
            </div>
        </>
    );
}
