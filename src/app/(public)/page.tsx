import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import {
    Sparkles,
    Truck,
    Shield,
    Clock,
    ArrowRight,
    ChevronRight,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import ProductCard from '@/components/ui/ProductCard';

export const metadata: Metadata = {
    title: 'FreshBasket X | AI-Powered Grocery Shopping',
    description:
        'Discover the future of grocery shopping with AI recommendations, real-time order tracking, and premium fresh products delivered to your door.',
};

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

async function getFeaturedProducts() {
    try {
        const res = await fetch(`${FASTAPI_URL}/api/products?featured=true&limit=8`, { next: { revalidate: 60 } });
        if (res.ok) return await res.json();
    } catch {}
    return prisma.product.findMany({
        where: { featured: true },
        include: { category: true },
        take: 8,
        orderBy: { rating: 'desc' },
    });
}

async function getCategories() {
    try {
        const res = await fetch(`${FASTAPI_URL}/api/categories`, { next: { revalidate: 60 } });
        if (res.ok) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = await res.json();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return data.map((c: any) => ({ ...c, _count: { products: c.productCount } }));
        }
    } catch {}
    return prisma.category.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: 'asc' },
    });
}

async function getRecommendedProducts() {
    try {
        const res = await fetch(`${FASTAPI_URL}/api/recommendations?limit=4`, { next: { revalidate: 60 } });
        if (res.ok) return await res.json();
    } catch {}
    return prisma.product.findMany({
        include: { category: true },
        orderBy: [{ reviewCount: 'desc' }, { rating: 'desc' }],
        take: 4,
    });
}

export default async function HomePage() {
    const [featured, categories, recommended] = await Promise.all([
        getFeaturedProducts(),
        getCategories(),
        getRecommendedProducts(),
    ]);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-emerald-800">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-20 w-96 h-96 bg-emerald-300 rounded-full blur-3xl" />
                </div>
                <div className="container-custom relative py-8 md:py-10 lg:py-12">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <div className="animate-fade-in">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                                <Sparkles className="w-4 h-4 text-emerald-300" />
                                AI-Powered Smart Grocery Shopping
                            </div>
                            <h1 className="font-display text-3xl md:text-5xl lg:text-5xl font-bold text-white leading-tight mb-4">
                                Fresh Groceries,{' '}
                                <span className="text-emerald-300">Delivered</span> Intelligently
                            </h1>
                            <p className="text-base md:text-lg text-white/70 mb-6 max-w-lg leading-relaxed">
                                Experience AI-curated recommendations, real-time order tracking,
                                and premium quality products — all delivered to your doorstep.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href="/shop"
                                    className="inline-flex items-center gap-2 bg-white text-primary-900 px-6 py-3 rounded-xl font-bold text-base
                    hover:bg-emerald-50 transition-all duration-200 shadow-lg shadow-black/10"
                                >
                                    Shop Now
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link
                                    href="/shop?featured=true"
                                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20
                    px-6 py-3 rounded-xl font-semibold text-base hover:bg-white/20 transition-all duration-200"
                                >
                                    View Deals
                                </Link>
                            </div>
                        </div>
                        <div className="hidden lg:block">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-br from-emerald-400/20 to-primary-600/20 rounded-3xl blur-2xl" />
                                <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                                    <Image
                                        src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=700"
                                        alt="Fresh groceries"
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Strip */}
            <section className="bg-white border-b border-charcoal-100">
                <div className="container-custom py-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: Truck, label: 'Free Delivery', sub: 'On orders over ₹4,150' },
                            { icon: Clock, label: 'Same Day', sub: 'Express delivery' },
                            { icon: Shield, label: 'Secure', sub: '100% safe checkout' },
                            { icon: Sparkles, label: 'AI Smart', sub: 'Personalized picks' },
                        ].map((feat) => (
                            <div key={feat.label} className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <feat.icon className="w-5 h-5 text-primary-700" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-charcoal-900">{feat.label}</p>
                                    <p className="text-xs text-charcoal-500">{feat.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="container-custom py-16">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <h2 className="section-title">Shop by Category</h2>
                        <p className="section-subtitle">Browse our curated collection of fresh groceries</p>
                    </div>
                    <Link
                        href="/shop"
                        className="hidden md:flex items-center gap-1 text-sm font-semibold text-primary-900 hover:text-primary-700 transition-colors"
                    >
                        View All <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/shop?category=${cat.slug}`}
                            className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-charcoal-100"
                        >
                            {cat.image && (
                                <Image
                                    src={cat.image}
                                    alt={cat.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h3 className="text-white font-semibold text-base">{cat.name}</h3>
                                <p className="text-white/70 text-sm">
                                    {cat._count.products} products
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            <section className="bg-white py-16">
                <div className="container-custom">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h2 className="section-title">Featured Products</h2>
                            <p className="section-subtitle">Hand-picked premium quality items</p>
                        </div>
                        <Link
                            href="/shop?featured=true"
                            className="hidden md:flex items-center gap-1 text-sm font-semibold text-primary-900 hover:text-primary-700 transition-colors"
                        >
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featured.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* AI Recommendations */}
            <section className="container-custom py-16">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-900 px-3 py-1.5 rounded-full text-xs font-semibold mb-3">
                            <Sparkles className="w-3.5 h-3.5" />
                            AI Recommended
                        </div>
                        <h2 className="section-title">Recommended For You</h2>
                        <p className="section-subtitle">Personalized picks based on trending items</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommended.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </section>

            {/* Promo Banners */}
            <section className="container-custom pb-16">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-900 to-primary-700 p-8 md:p-10 min-h-[200px]">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10">
                            <span className="text-emerald-300 text-sm font-semibold uppercase tracking-wider">Limited Offer</span>
                            <h3 className="font-display text-2xl md:text-3xl font-bold text-white mt-2 mb-3">
                                Get 20% Off Your First Order
                            </h3>
                            <p className="text-white/70 mb-5 text-sm">Use code WELCOME20 at checkout</p>
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 bg-white text-primary-900 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition-all"
                            >
                                Shop Now <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-charcoal-800 to-charcoal-900 p-8 md:p-10 min-h-[200px]">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary-400/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10">
                            <span className="text-primary-400 text-sm font-semibold uppercase tracking-wider">Free Delivery</span>
                            <h3 className="font-display text-2xl md:text-3xl font-bold text-white mt-2 mb-3">
                                Free Shipping on Orders $50+
                            </h3>
                            <p className="text-white/60 mb-5 text-sm">Fresh groceries delivered with care</p>
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 bg-primary-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all"
                            >
                                Explore <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="bg-primary-900">
                <div className="container-custom py-16">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="font-display text-3xl font-bold text-white mb-4">
                            Stay Fresh, Stay Updated
                        </h2>
                        <p className="text-white/60 mb-8">
                            Subscribe to our newsletter for exclusive deals, new arrivals, and seasonal picks.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40
                  focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/15 transition-all"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-white text-primary-900 rounded-xl font-semibold hover:bg-emerald-50 transition-all whitespace-nowrap"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
