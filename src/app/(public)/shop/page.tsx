import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getCached, setCache } from '@/lib/redis';
import ProductCard from '@/components/ui/ProductCard';
import ShopFilters from '@/components/shop/ShopFilters';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Shop',
    description: 'Browse our complete selection of fresh groceries, organic produce, and premium products.',
};

type SearchParams = {
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    page?: string;
    featured?: string;
};

async function getProducts(params: SearchParams) {
    const page = parseInt(params.page || '1');
    const perPage = 12;
    const skip = (page - 1) * perPage;

    const cacheKey = `shop:${JSON.stringify(params)}`;
    const cached = await getCached<{ products: unknown[]; total: number }>(cacheKey);
    if (cached) return cached;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (params.category) {
        where.category = { slug: params.category };
    }

    if (params.search) {
        where.OR = [
            { name: { contains: params.search, mode: 'insensitive' } },
            { description: { contains: params.search, mode: 'insensitive' } },
        ];
    }

    if (params.minPrice || params.maxPrice) {
        where.price = {};
        if (params.minPrice) where.price.gte = parseFloat(params.minPrice);
        if (params.maxPrice) where.price.lte = parseFloat(params.maxPrice);
    }

    if (params.rating) {
        where.rating = { gte: parseFloat(params.rating) };
    }

    if (params.featured === 'true') {
        where.featured = true;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: 'desc' };
    switch (params.sort) {
        case 'price_asc':
            orderBy = { price: 'asc' };
            break;
        case 'price_desc':
            orderBy = { price: 'desc' };
            break;
        case 'rating':
            orderBy = { rating: 'desc' };
            break;
        case 'popular':
            orderBy = { reviewCount: 'desc' };
            break;
        case 'name_asc':
            orderBy = { name: 'asc' };
            break;
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: { category: true },
            orderBy,
            skip,
            take: perPage,
        }),
        prisma.product.count({ where }),
    ]);

    const result = { products, total, page, perPage, totalPages: Math.ceil(total / perPage) };
    await setCache(cacheKey, result, 120);
    return result;
}

async function getCategories() {
    return prisma.category.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: 'asc' },
    });
}

export default async function ShopPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const [data, categories] = await Promise.all([
        getProducts(searchParams),
        getCategories(),
    ]);

    const { products, total, page, totalPages } = data as {
        products: Array<{
            id: string; name: string; slug: string; price: number; comparePrice: number | null;
            images: string; stock: number; stockStatus: string; unit: string; rating: number;
            reviewCount: number; category: { name: string; slug: string };
        }>;
        total: number; page: number; totalPages: number;
    };

    return (
        <div className="container-custom py-8">
            <div className="mb-8">
                <h1 className="section-title">
                    {searchParams.search ? `Results for "${searchParams.search}"` : searchParams.category ? categories.find(c => c.slug === searchParams.category)?.name || 'Shop' : 'All Products'}
                </h1>
                <p className="section-subtitle">{total} products found</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="lg:w-64 flex-shrink-0">
                    <ShopFilters categories={categories} currentParams={searchParams} />
                </aside>

                {/* Products Grid */}
                <div className="flex-1">
                    {/* Sort Bar */}
                    <div className="flex items-center justify-between mb-6 bg-white rounded-xl border border-charcoal-100 p-3">
                        <span className="text-sm text-charcoal-600">
                            Showing {products.length} of {total} products
                        </span>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-charcoal-600">Sort:</label>
                            <div className="flex items-center gap-2 text-sm border border-charcoal-200 rounded-lg px-2 overflow-x-auto max-w-[200px] sm:max-w-md hide-scrollbar">
                                <Link href="/shop" className={`px-2 py-1.5 whitespace-nowrap ${!searchParams.sort ? 'text-primary-900 font-semibold' : 'text-charcoal-500'}`}>Newest</Link>
                                <Link href="/shop?sort=price_asc" className={`px-2 py-1.5 whitespace-nowrap ${searchParams.sort === 'price_asc' ? 'text-primary-900 font-semibold' : 'text-charcoal-500'}`}>Price: Low</Link>
                                <Link href="/shop?sort=price_desc" className={`px-2 py-1.5 whitespace-nowrap ${searchParams.sort === 'price_desc' ? 'text-primary-900 font-semibold' : 'text-charcoal-500'}`}>Price: High</Link>
                                <Link href="/shop?sort=rating" className={`px-2 py-1.5 whitespace-nowrap ${searchParams.sort === 'rating' ? 'text-primary-900 font-semibold' : 'text-charcoal-500'}`}>Highest Rated</Link>
                                <Link href="/shop?sort=popular" className={`px-2 py-1.5 whitespace-nowrap ${searchParams.sort === 'popular' ? 'text-primary-900 font-semibold' : 'text-charcoal-500'}`}>Popular</Link>
                            </div>
                        </div>
                    </div>

                    {products.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-charcoal-500 text-lg mb-2">No products found</p>
                            <p className="text-charcoal-400 text-sm">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-10">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                const params = new URLSearchParams();
                                Object.entries(searchParams).forEach(([k, v]) => {
                                    if (v && k !== 'page') params.set(k, v);
                                });
                                params.set('page', p.toString());

                                return (
                                    <a
                                        key={p}
                                        href={`/shop?${params.toString()}`}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${p === (page || 1)
                                            ? 'bg-primary-900 text-white'
                                            : 'bg-white border border-charcoal-200 text-charcoal-700 hover:bg-primary-50'
                                            }`}
                                    >
                                        {p}
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
