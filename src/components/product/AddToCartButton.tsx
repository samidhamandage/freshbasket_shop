'use client';

import { useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

type Props = {
    product: {
        id: string;
        name: string;
        price: number;
        image: string;
        stock: number;
        unit: string;
    };
};

export default function AddToCartButton({ product }: Props) {
    const { addItem, items, updateQuantity } = useCart();
    const [qty, setQty] = useState(1);
    const cartItem = items.find((i) => i.id === product.id);

    if (product.stock === 0) {
        return (
            <button disabled className="w-full py-4 bg-charcoal-200 text-charcoal-500 rounded-xl font-semibold text-lg cursor-not-allowed">
                Out of Stock
            </button>
        );
    }

    if (cartItem) {
        return (
            <div className="flex items-center gap-4">
                <div className="flex items-center bg-charcoal-50 rounded-xl border border-charcoal-200">
                    <button
                        onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                        className="p-3 hover:bg-charcoal-100 rounded-l-xl transition-colors"
                    >
                        <Minus className="w-5 h-5" />
                    </button>
                    <span className="px-6 text-lg font-semibold">{cartItem.quantity}</span>
                    <button
                        onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                        disabled={cartItem.quantity >= product.stock}
                        className="p-3 hover:bg-charcoal-100 rounded-r-xl transition-colors disabled:opacity-50"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
                <span className="text-sm text-charcoal-500">In cart</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center bg-charcoal-50 rounded-xl border border-charcoal-200">
                <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-3 hover:bg-charcoal-100 rounded-l-xl transition-colors"
                >
                    <Minus className="w-5 h-5" />
                </button>
                <span className="px-6 text-lg font-semibold">{qty}</span>
                <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="p-3 hover:bg-charcoal-100 rounded-r-xl transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>
            <button
                onClick={() => {
                    for (let i = 0; i < qty; i++) addItem(product);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-900 text-white py-4 rounded-xl font-semibold text-lg
          hover:bg-primary-800 active:bg-primary-950 transition-all duration-200"
            >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
            </button>
        </div>
    );
}
