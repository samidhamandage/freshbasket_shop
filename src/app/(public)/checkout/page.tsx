'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils';
import { Lock, CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
    const { data: session } = useSession();
    const { items, subtotal, deliveryFee, discount, total, couponCode, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: session?.user?.name || '',
        email: session?.user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.name || form.name.length < 2) errs.name = 'Name is required';
        if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Valid email required';
        if (!form.phone || form.phone.length < 10) errs.phone = 'Valid phone required';
        if (!form.address || form.address.length < 5) errs.address = 'Address is required';
        if (!form.city || form.city.length < 2) errs.city = 'City is required';
        if (!form.state || form.state.length < 2) errs.state = 'State is required';
        if (!form.zip || form.zip.length < 5) errs.zip = 'Valid ZIP required';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map((i) => ({ productId: i.id, quantity: i.quantity, price: i.price, name: i.name, image: i.image })),
                    shipping: form,
                    couponCode,
                    subtotal,
                    deliveryFee,
                    discount,
                    total,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                clearCart();
                toast.success('Order placed successfully!');
                router.push(`/orders/${data.orderId}`);
            } else {
                toast.error(data.error || 'Failed to place order');
            }
        } catch {
            toast.error('Something went wrong');
        }
        setLoading(false);
    };

    const inputClass = (field: string) =>
        `input-field ${errors[field] ? 'border-red-400 focus:ring-red-500' : ''}`;

    if (items.length === 0) {
        return (
            <div className="container-custom py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">No items in cart</h1>
                <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container-custom py-8">
            <Link href="/cart" className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-900 mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Cart
            </Link>
            <h1 className="section-title mb-8">Checkout</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Shipping Form */}
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-charcoal-900 mb-5">Shipping Information</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Full Name</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass('name')} placeholder="John Doe" />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Email</label>
                                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass('email')} placeholder="john@example.com" />
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Phone</label>
                                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass('phone')} placeholder="+1 (555) 123-4567" />
                                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Address</label>
                                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass('address')} placeholder="123 Main St, Apt 4" />
                                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">City</label>
                                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass('city')} placeholder="San Francisco" />
                                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">State</label>
                                <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputClass('state')} placeholder="California" />
                                {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">ZIP Code</label>
                                <input type="text" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} className={inputClass('zip')} placeholder="94102" />
                                {errors.zip && <p className="text-xs text-red-500 mt-1">{errors.zip}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary-700" />
                            Payment
                        </h2>
                        <div className="bg-primary-50 rounded-xl p-4 mb-4">
                            <p className="text-sm text-primary-800 font-medium">🔒 Stripe Test Mode</p>
                            <p className="text-xs text-primary-700 mt-1">
                                Payment is simulated in test mode. No real charges will be made.
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 text-base !py-4 disabled:opacity-50"
                        >
                            <Lock className="w-4 h-4" />
                            {loading ? 'Processing...' : `Pay ${formatPrice(total)}`}
                        </button>
                    </div>
                </form>

                {/* Order Summary */}
                <div className="card p-6 h-fit sticky top-24">
                    <h2 className="text-lg font-semibold text-charcoal-900 mb-5">Order Summary</h2>
                    <div className="space-y-3 mb-5">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-6 h-6 bg-charcoal-100 rounded text-xs flex items-center justify-center font-medium flex-shrink-0">
                                        {item.quantity}
                                    </span>
                                    <span className="text-sm text-charcoal-700 truncate">{item.name}</span>
                                </div>
                                <span className="text-sm font-medium text-charcoal-900 flex-shrink-0">
                                    {formatPrice(item.price * item.quantity)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-charcoal-100 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-charcoal-600">Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-charcoal-600">Delivery</span>
                            <span>{deliveryFee === 0 ? <span className="text-primary-700">Free</span> : formatPrice(deliveryFee)}</span>
                        </div>
                        {discount > 0 && (
                            <div className="flex justify-between text-primary-700">
                                <span>Discount</span>
                                <span>-{formatPrice(discount)}</span>
                            </div>
                        )}
                        <div className="border-t border-charcoal-100 pt-3 flex justify-between">
                            <span className="font-semibold text-charcoal-900">Total</span>
                            <span className="text-xl font-bold text-charcoal-900">{formatPrice(total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
