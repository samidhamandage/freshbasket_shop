import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Star, Sparkles } from 'lucide-react';
import prisma from '@/lib/prisma';
import ProductCard from '@/components/ui/ProductCard';
import AddToCartButton from '@/components/product/AddToCartButton';
import ReviewSection from '@/components/product/ReviewSection';
import { formatPrice, getStockLabel } from '@/utils';

type Props = { params: { id: string } };

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

async function getProduct(slug: string) {
    try {
        const res = await fetch(`${FASTAPI_URL}/api/products/${slug}`, { next: { revalidate: 60 } });
        if (res.ok) return await res.json();
    } catch {}
    const product = await prisma.product.findUnique({
        where: { slug },
        include: {
            category: true,
            reviews: {
                include: { user: { select: { name: true, image: true } } },
                orderBy: { createdAt: 'desc' },
                take: 10,
            },
        },
    });
    return product;
}

async function getRelatedProducts(categoryId: string, productId: string) {
    try {
        const res = await fetch(`${FASTAPI_URL}/api/recommendations?productId=${productId}&limit=4`, { next: { revalidate: 60 } });
        if (res.ok) return await res.json();
    } catch {}
    return prisma.product.findMany({
        where: { categoryId, id: { not: productId } },
        include: { category: true },
        orderBy: { rating: 'desc' },
        take: 4,
    });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const product = await getProduct(params.id);
    if (!product) return { title: 'Product Not Found' };
    return {
        title: product.name,
        description: product.description.slice(0, 160),
        openGraph: {
            title: product.name,
            description: product.description.slice(0, 160),
            images: product.images,
        },
    };
}

export default async function ProductPage({ params }: Props) {
    const product = await getProduct(params.id);
    if (!product) notFound();

    const related = await getRelatedProducts(product.categoryId, product.id);
    const stockInfo = getStockLabel(product.stock);
    const discount = product.comparePrice
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0;

    return (
        <div className="container-custom py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-charcoal-500 mb-8">
                <a href="/" className="hover:text-primary-900">Home</a>
                <span>/</span>
                <a href="/shop" className="hover:text-primary-900">Shop</a>
                <span>/</span>
                <a href={`/shop?category=${product.category.slug}`} className="hover:text-primary-900">
                    {product.category.name}
                </a>
                <span>/</span>
                <span className="text-charcoal-800 font-medium">{product.name}</span>
            </nav>

            {/* Product Details */}
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
                {/* Gallery */}
                <div className="space-y-4">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-charcoal-50">
                        <Image
                            src={product.images || '/placeholder.jpg'}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                        {discount > 0 && (
                            <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl">
                                -{discount}% OFF
                            </span>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div>
                    <span className="text-sm font-medium text-primary-700 uppercase tracking-wider">
                        {product.category.name}
                    </span>
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal-900 mt-2 mb-4">
                        {product.name}
                    </h1>

                    {/* Rating */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i < Math.round(product.rating)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'fill-charcoal-200 text-charcoal-200'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-medium text-charcoal-700">
                            {product.rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-charcoal-500">
                            ({product.reviewCount} reviews)
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-6">
                        <span className="text-3xl font-bold text-charcoal-900">
                            {formatPrice(product.price)}
                        </span>
                        {product.comparePrice && (
                            <span className="text-xl text-charcoal-400 line-through">
                                {formatPrice(product.comparePrice)}
                            </span>
                        )}
                        <span className="text-sm text-charcoal-500">/ {product.unit}</span>
                    </div>

                    {/* Stock */}
                    <div className="flex items-center gap-3 mb-6">
                        <span className={`badge ${stockInfo.color}`}>{stockInfo.label}</span>
                        {product.weight && (
                            <span className="text-sm text-charcoal-500">Weight: {product.weight}</span>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-charcoal-600 leading-relaxed mb-8">{product.description}</p>

                    {/* Add to Cart */}
                    <AddToCartButton
                        product={{
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.images || '',
                            stock: product.stock,
                            unit: product.unit,
                        }}
                    />

                    {/* Features */}
                    <div className="mt-8 pt-8 border-t border-charcoal-100">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Free Delivery', sub: 'On orders over ₹4,150' },
                                { label: 'Fresh Guarantee', sub: 'Quality assured' },
                                { label: 'Easy Returns', sub: '7-day return policy' },
                                { label: 'Secure Payment', sub: 'SSL encrypted' },
                            ].map((feat) => (
                                <div key={feat.label} className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-charcoal-800">{feat.label}</p>
                                        <p className="text-xs text-charcoal-500">{feat.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <ReviewSection
                productId={product.id}
                reviews={product.reviews.map(r => ({ ...r, createdAt: r.createdAt.toISOString() }))}
                rating={product.rating}
                reviewCount={product.reviewCount}
            />

            {/* Customers Also Bought */}
            {related.length > 0 && (
                <section className="mt-16">
                    <div className="flex items-center gap-2 mb-8">
                        <Sparkles className="w-5 h-5 text-primary-700" />
                        <h2 className="section-title text-2xl">Customers Also Bought</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {related.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
