'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Package, CheckCircle2, Truck, MapPin, ArrowLeft,
    Clock, ShoppingBag, CircleDot,
} from 'lucide-react';
import { formatPrice, formatDateTime, getOrderStatusLabel, getStatusStep } from '@/utils';

type TrackingEntry = {
    id: string;
    status: string;
    note: string | null;
    createdAt: string;
};

type OrderItem = {
    id: string;
    name: string;
    image: string | null;
    quantity: number;
    price: number;
    product?: { slug: string };
};

type Order = {
    id: string;
    status: string;
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    couponCode: string | null;
    shippingName: string;
    shippingEmail: string;
    shippingPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingState: string;
    shippingZip: string;
    createdAt: string;
    items: OrderItem[];
    trackingHistory: TrackingEntry[];
};

const TRACKING_STEPS = [
    { status: 'PLACED', label: 'Order Placed', icon: ShoppingBag },
    { status: 'PROCESSING', label: 'Processing', icon: Clock },
    { status: 'PACKED', label: 'Packed', icon: Package },
    { status: 'SHIPPED', label: 'Shipped', icon: Truck },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: MapPin },
    { status: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
];

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/orders/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data);
                }
            } catch { /* silent */ }
            setLoading(false);
        };
        fetchOrder();

        // Poll for real-time updates
        const interval = setInterval(fetchOrder, 10000);
        return () => clearInterval(interval);
    }, [params.id]);

    if (loading) {
        return (
            <div className="container-custom py-20">
                <div className="max-w-3xl mx-auto space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card p-6 animate-pulse">
                            <div className="h-6 bg-charcoal-100 rounded w-1/3 mb-4" />
                            <div className="h-4 bg-charcoal-100 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container-custom py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Order not found</h1>
                <Link href="/orders" className="btn-primary">View All Orders</Link>
            </div>
        );
    }

    const currentStep = getStatusStep(order.status);
    const statusInfo = getOrderStatusLabel(order.status);
    const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED';

    return (
        <div className="container-custom py-8">
            <Link href="/orders" className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-900 mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Orders
            </Link>

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-charcoal-900">
                            Order #{order.id.slice(-8).toUpperCase()}
                        </h1>
                        <p className="text-sm text-charcoal-500 mt-1">
                            Placed on {formatDateTime(order.createdAt)}
                        </p>
                    </div>
                    <span className={`badge text-sm px-4 py-2 ${statusInfo.color}`}>
                        {statusInfo.label}
                    </span>
                </div>

                {/* Tracking Timeline */}
                {!isCancelled && (
                    <div className="card p-6 mb-6">
                        <h2 className="text-lg font-semibold text-charcoal-900 mb-6">Order Tracking</h2>

                        {/* Progress Bar */}
                        <div className="relative mb-8">
                            <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary-700 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${(currentStep / (TRACKING_STEPS.length - 1)) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-3">
                                {TRACKING_STEPS.map((step, i) => {
                                    const isActive = i <= currentStep;
                                    const isCurrent = i === currentStep;
                                    return (
                                        <div key={step.status} className="flex flex-col items-center text-center" style={{ width: `${100 / TRACKING_STEPS.length}%` }}>
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-500 ${isCurrent
                                                    ? 'bg-primary-900 text-white ring-4 ring-primary-100'
                                                    : isActive
                                                        ? 'bg-primary-700 text-white'
                                                        : 'bg-charcoal-100 text-charcoal-400'
                                                    }`}
                                            >
                                                <step.icon className="w-5 h-5" />
                                            </div>
                                            <span className={`text-xs font-medium ${isActive ? 'text-primary-900' : 'text-charcoal-400'}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Tracking History */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                                Tracking History
                            </h3>
                            {order.trackingHistory.map((entry, i) => {
                                const entryStatus = getOrderStatusLabel(entry.status);
                                return (
                                    <div key={entry.id} className="flex items-start gap-3">
                                        <div className="flex flex-col items-center">
                                            <CircleDot className={`w-4 h-4 flex-shrink-0 ${i === order.trackingHistory.length - 1 ? 'text-primary-700' : 'text-charcoal-300'}`} />
                                            {i < order.trackingHistory.length - 1 && (
                                                <div className="w-0.5 h-8 bg-charcoal-200 my-1" />
                                            )}
                                        </div>
                                        <div className="flex-1 -mt-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className={`badge text-xs ${entryStatus.color}`}>{entryStatus.label}</span>
                                                <span className="text-xs text-charcoal-500">{formatDateTime(entry.createdAt)}</span>
                                            </div>
                                            {entry.note && (
                                                <p className="text-sm text-charcoal-600 mt-1">{entry.note}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Order Items */}
                <div className="card p-6 mb-6">
                    <h2 className="text-lg font-semibold text-charcoal-900 mb-4">Order Items</h2>
                    <div className="space-y-3">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 py-2">
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-charcoal-50 flex-shrink-0">
                                    {item.image && (item.image.startsWith('http') || item.image.startsWith('/')) && (
                                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-charcoal-900 truncate">{item.name}</p>
                                    <p className="text-sm text-charcoal-500">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-semibold text-charcoal-900">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                    {/* Shipping Info */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-charcoal-900 mb-4">Shipping Address</h2>
                        <div className="text-sm text-charcoal-600 space-y-1">
                            <p className="font-medium text-charcoal-900">{order.shippingName}</p>
                            <p>{order.shippingAddress}</p>
                            <p>{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                            <p>{order.shippingPhone}</p>
                            <p>{order.shippingEmail}</p>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-charcoal-900 mb-4">Payment Summary</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-charcoal-600">Subtotal</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-charcoal-600">Delivery</span>
                                <span>{order.deliveryFee === 0 ? 'Free' : formatPrice(order.deliveryFee)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-primary-700">
                                    <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                                    <span>-{formatPrice(order.discount)}</span>
                                </div>
                            )}
                            <div className="border-t border-charcoal-100 pt-2 flex justify-between">
                                <span className="font-semibold text-charcoal-900">Total</span>
                                <span className="text-lg font-bold text-charcoal-900">{formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
