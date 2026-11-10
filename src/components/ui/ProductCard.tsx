'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice, getStockLabel } from '@/utils';

type Props = {
    product: {
        id: string;
        name: string;
        slug: string;
        price: number;
        comparePrice?: number | null;
        images: string;
        stock: number;
        stockStatus: string;
        unit: string;
        rating: number;
        reviewCount: number;
        category?: { name: string; slug: string };
    };
};

export default function ProductCard({ product }: Props) {
    const { addItem } = useCart();
    const stockInfo = getStockLabel(product.stock);
    const discount = product.comparePrice
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0;

    return (
        <div className="card group overflow-hidden">
            <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden">
                <Image
                    src={product.images || '/placeholder.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {discount > 0 && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                        -{discount}%
                    </span>
                )}
                <span className={`absolute top-3 right-3 badge ${stockInfo.color}`}>
                    {product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? 'Low Stock' : ''}
                </span>
            </Link>

            <div className="p-4">
                {product.category && (
                    <span className="text-xs font-medium text-primary-700 uppercase tracking-wider">
                        {product.category.name}
                    </span>
                )}
                <Link href={`/product/${product.slug}`}>
                    <h3 className="font-semibold text-charcoal-900 mt-1 line-clamp-2 group-hover:text-primary-900 transition-colors">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < Math.round(product.rating)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-charcoal-200 text-charcoal-200'
                                    }`}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-charcoal-500">({product.reviewCount})</span>
                </div>

                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-charcoal-900">
                            {formatPrice(product.price)}
                        </span>
                        {product.comparePrice && (
                            <span className="text-sm text-charcoal-400 line-through">
                                {formatPrice(product.comparePrice)}
                            </span>
                        )}
                        <span className="text-xs text-charcoal-500">/ {product.unit}</span>
                    </div>
                </div>

                <button
                    onClick={() =>
                        addItem({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.images || '',
                            stock: product.stock,
                            unit: product.unit,
                        })
                    }
                    disabled={product.stock === 0}
                    className="mt-3 w-full flex items-center justify-center gap-2 bg-primary-900 text-white py-2.5 rounded-xl text-sm font-semibold
            hover:bg-primary-800 active:bg-primary-950 transition-all duration-200
            disabled:bg-charcoal-200 disabled:text-charcoal-500 disabled:cursor-not-allowed"
                >
                    <ShoppingCart className="w-4 h-4" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
}
