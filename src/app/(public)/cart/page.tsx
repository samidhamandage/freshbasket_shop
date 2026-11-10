'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils';
import { useState } from 'react';

export default function CartPage() {
    const { items, removeItem, updateQuantity, subtotal, deliveryFee, discount, total, couponCode, applyCoupon, removeCoupon } = useCart();
    const [coupon, setCoupon] = useState('');
    const [applying, setApplying] = useState(false);

    const handleApplyCoupon = async () => {
        if (!coupon.trim()) return;
        setApplying(true);
        await applyCoupon(coupon.trim().toUpperCase());
        setApplying(false);
    };

    if (items.length === 0) {
        return (
            <div className="container-custom py-20 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-charcoal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-charcoal-300" />
                    </div>
                    <h1 className="text-2xl font-bold text-charcoal-900 mb-3">Your cart is empty</h1>
                    <p className="text-charcoal-500 mb-8">Looks like you haven&apos;t added any items yet.</p>
                    <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
                        Start Shopping <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container-custom py-8">
            <h1 className="section-title mb-8">Shopping Cart</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="card p-4 flex gap-4">
                            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-charcoal-50 flex-shrink-0">
                                <Image src={item.image && (item.image.startsWith('http') || item.image.startsWith('/')) ? item.image : '/placeholder.jpg'} alt={item.name} fill className="object-cover" sizes="96px" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-semibold text-charcoal-900 truncate">{item.name}</h3>
                                        <p className="text-sm text-charcoal-500 mt-0.5">{formatPrice(item.price)} / {item.unit}</p>
                                    </div>
                                    <button onClick={() => removeItem(item.id)} className="p-1 text-charcoal-400 hover:text-red-500 transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center bg-charcoal-50 rounded-lg border border-charcoal-200">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-charcoal-100 rounded-l-lg transition-colors">
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="px-4 text-sm font-semibold">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            disabled={item.quantity >= item.stock}
                                            className="p-2 hover:bg-charcoal-100 rounded-r-lg transition-colors disabled:opacity-50"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <span className="font-bold text-charcoal-900">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="card p-6 sticky top-24">
                        <h2 className="text-lg font-semibold text-charcoal-900 mb-6">Order Summary</h2>

                        {/* Coupon */}
                        {!couponCode ? (
                            <div className="flex gap-2 mb-6">
                                <div className="relative flex-1">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                                    <input
                                        type="text"
                                        placeholder="Coupon code"
                                        value={coupon}
                                        onChange={(e) => setCoupon(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-charcoal-200 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    />
                                </div>
                                <button
                                    onClick={handleApplyCoupon}
                                    disabled={applying}
                                    className="px-4 py-2.5 bg-primary-900 text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors disabled:opacity-50"
                                >
                                    {applying ? '...' : 'Apply'}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-primary-50 rounded-lg px-3 py-2 mb-6">
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-primary-700" />
                                    <span className="text-sm font-medium text-primary-900">{couponCode}</span>
                                </div>
                                <button onClick={removeCoupon} className="text-xs text-red-600 hover:text-red-700">Remove</button>
                            </div>
                        )}

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-charcoal-600">Subtotal</span>
                                <span className="font-medium text-charcoal-900">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-charcoal-600">Delivery Fee</span>
                                <span className="font-medium text-charcoal-900">
                                    {deliveryFee === 0 ? (
                                        <span className="text-primary-700">Free</span>
                                    ) : (
                                        formatPrice(deliveryFee)
                                    )}
                                </span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-primary-700">
                                    <span>Discount</span>
                                    <span className="font-medium">-{formatPrice(discount)}</span>
                                </div>
                            )}
                            {subtotal > 0 && subtotal < 50 && (
                                <p className="text-xs text-charcoal-500 bg-charcoal-50 rounded-lg p-2">
                                    Add {formatPrice(50 - subtotal)} more for free delivery!
                                </p>
                            )}
                            <div className="border-t border-charcoal-100 pt-3 flex justify-between">
                                <span className="text-base font-semibold text-charcoal-900">Total</span>
                                <span className="text-xl font-bold text-charcoal-900">{formatPrice(total)}</span>
                            </div>
                        </div>

                        <Link
                            href="/checkout"
                            className="btn-primary w-full text-center mt-6 flex items-center justify-center gap-2"
                        >
                            Proceed to Checkout <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
