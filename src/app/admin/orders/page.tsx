'use client';

import { useState, useEffect } from 'react';
import { formatPrice, formatDateTime, getOrderStatusLabel } from '@/utils';
import { ChevronDown, Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import type { OrderStatusType } from '@/types';

const ORDER_FLOW: OrderStatusType[] = ['PLACED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

type Order = {
    id: string;
    status: string;
    total: number;
    createdAt: string;
    shippingName: string;
    shippingEmail: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    user?: { name: string | null; email: string };
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [search, setSearch] = useState('');

    const fetchOrders = async () => {
        try {
            const url = statusFilter ? `/api/orders?status=${statusFilter}` : '/api/orders';
            const res = await fetch(url);
            const data = await res.json();
            setOrders(data);
        } catch { /* silent */ }
        setLoading(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchOrders(); }, [statusFilter]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                toast.success(`Order status updated to ${getOrderStatusLabel(newStatus).label}`);
                fetchOrders();
            }
        } catch { toast.error('Failed to update'); }
    };

    const handleRefund = async (orderId: string) => {
        if (!confirm('Simulate refund for this order?')) return;
        updateStatus(orderId, 'REFUNDED');
    };

    const filtered = orders.filter(o =>
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.shippingName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-charcoal-900">Orders</h1>
                    <p className="text-charcoal-500 text-sm mt-1">{orders.length} orders total</p>
                </div>
                <button onClick={fetchOrders} className="btn-ghost flex items-center gap-2 text-sm">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                    <input type="text" placeholder="Search by ID or name..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field !w-auto">
                    <option value="">All Statuses</option>
                    {ORDER_FLOW.map(s => {
                        const info = getOrderStatusLabel(s);
                        return <option key={s} value={s}>{info.label}</option>;
                    })}
                    <option value="CANCELLED">Cancelled</option>
                    <option value="REFUNDED">Refunded</option>
                </select>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="card p-6 animate-pulse h-20" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="card p-12 text-center text-charcoal-500">No orders found</div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((order) => {
                        const statusInfo = getOrderStatusLabel(order.status);
                        const currentIdx = ORDER_FLOW.indexOf(order.status as OrderStatusType);
                        const nextStatus = currentIdx >= 0 && currentIdx < ORDER_FLOW.length - 1 ? ORDER_FLOW[currentIdx + 1] : null;

                        return (
                            <div key={order.id} className="card p-5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="font-semibold text-charcoal-900">#{order.id.slice(-8).toUpperCase()}</p>
                                            <span className={`badge ${statusInfo.color}`}>{statusInfo.label}</span>
                                        </div>
                                        <p className="text-sm text-charcoal-600">
                                            {order.user?.name || order.shippingName} · {order.items.length} items · {formatPrice(order.total)}
                                        </p>
                                        <p className="text-xs text-charcoal-500 mt-0.5">{formatDateTime(order.createdAt)}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {nextStatus && (
                                            <button
                                                onClick={() => updateStatus(order.id, nextStatus)}
                                                className="flex items-center gap-1.5 px-3 py-2 bg-primary-900 text-white rounded-lg text-xs font-medium hover:bg-primary-800 transition-colors"
                                            >
                                                <ChevronDown className="w-3 h-3" />
                                                Move to {getOrderStatusLabel(nextStatus).label}
                                            </button>
                                        )}
                                        {order.status !== 'REFUNDED' && order.status !== 'CANCELLED' && (
                                            <button
                                                onClick={() => handleRefund(order.id)}
                                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors"
                                            >
                                                Refund
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
