'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Package, ChevronRight, Clock } from 'lucide-react';
import { formatPrice, formatDateTime, getOrderStatusLabel } from '@/utils';
import type { OrderWithItems } from '@/types';

export default function OrdersPage() {
    const { data: session } = useSession();
    const [orders, setOrders] = useState<OrderWithItems[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/orders')
            .then((res) => res.json())
            .then((data) => {
                setOrders(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (!session) {
        return (
            <div className="container-custom py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
                <Link href="/auth/login" className="btn-primary">Sign In</Link>
            </div>
        );
    }

    return (
        <div className="container-custom py-8">
            <h1 className="section-title mb-8">My Orders</h1>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card p-6 animate-pulse">
                            <div className="h-5 bg-charcoal-100 rounded w-1/3 mb-3" />
                            <div className="h-4 bg-charcoal-100 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-charcoal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Package className="w-10 h-10 text-charcoal-300" />
                    </div>
                    <h2 className="text-xl font-bold text-charcoal-900 mb-3">No orders yet</h2>
                    <p className="text-charcoal-500 mb-6">Start shopping to see your orders here</p>
                    <Link href="/shop" className="btn-primary">Start Shopping</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const statusInfo = getOrderStatusLabel(order.status);
                        return (
                            <Link key={order.id} href={`/orders/${order.id}`} className="card p-5 flex items-center justify-between group hover:border-primary-200 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Package className="w-6 h-6 text-primary-700" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-charcoal-900">Order #{order.id.slice(-8).toUpperCase()}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className={`badge ${statusInfo.color}`}>{statusInfo.label}</span>
                                            <span className="flex items-center gap-1 text-xs text-charcoal-500">
                                                <Clock className="w-3 h-3" />
                                                {formatDateTime(order.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="font-bold text-charcoal-900">{formatPrice(order.total)}</p>
                                        <p className="text-xs text-charcoal-500">{order.items.length} items</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-charcoal-400 group-hover:text-primary-700 transition-colors" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
