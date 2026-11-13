'use client';

import { useState, useEffect } from 'react';
import {
    IndianRupee, ShoppingCart, Users, Package,
    TrendingUp, Clock,
} from 'lucide-react';
import { formatPrice, formatDateTime, getOrderStatusLabel } from '@/utils';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

type DashboardData = {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    recentOrders: Array<{
        id: string;
        total: number;
        status: string;
        createdAt: string;
        user?: { name: string | null; email: string };
        items: Array<{ name: string }>;
    }>;
    monthlyRevenue: Array<{ month: string; revenue: number; refunded: number; orders: number; refundedOrders?: number }>;
    ordersByStatus: Array<{ status: string; count: number }>;
};

const STATUS_COLORS: Record<string, string> = {
    PLACED: '#9E9E9E',
    PROCESSING: '#F59E0B',
    PACKED: '#10B981',
    SHIPPED: '#1B5E20',
    OUT_FOR_DELIVERY: '#2E7D32',
    DELIVERED: '#388E3C',
    CANCELLED: '#EF4444',
    REFUNDED: '#616161',
};

export default function AdminDashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then((res) => res.json())
            .then((d) => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading || !data) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-charcoal-900">Dashboard</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="card p-6 animate-pulse">
                            <div className="h-4 bg-charcoal-100 rounded w-1/2 mb-3" />
                            <div className="h-8 bg-charcoal-100 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const stats = [
        { label: 'Total Revenue', value: formatPrice(data.totalRevenue), icon: IndianRupee, color: 'bg-primary-50 text-primary-700' },
        { label: 'Total Orders', value: data.totalOrders.toLocaleString(), icon: ShoppingCart, color: 'bg-emerald-50 text-emerald-700' },
        { label: 'Total Users', value: data.totalUsers.toLocaleString(), icon: Users, color: 'bg-amber-50 text-amber-700' },
        { label: 'Total Products', value: data.totalProducts.toLocaleString(), icon: Package, color: 'bg-charcoal-50 text-charcoal-700' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-charcoal-900">Dashboard</h1>
                    <p className="text-charcoal-500 text-sm mt-1">Overview of your store performance</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-charcoal-500">
                    <TrendingUp className="w-4 h-4 text-primary-700" />
                    Live
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="card p-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-charcoal-600">{stat.label}</span>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-charcoal-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 card p-6">
                    <h2 className="text-lg font-semibold text-charcoal-900 mb-6">Monthly Revenue &amp; Refund Trends</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v}`} />
                            <Tooltip
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                formatter={(value: any, name: any) => [
                                    formatPrice(Number(value)),
                                    name === 'refunded' || name === 'Refunded' ? 'Refunded Amount' : 'Revenue',
                                ]}
                                contentStyle={{ borderRadius: '12px', border: '1px solid #E0E0E0' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            <Bar dataKey="revenue" name="Revenue" fill="#1B5E20" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="refunded" name="Refunded" fill="#EF4444" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Orders by Status */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-charcoal-900 mb-6">Orders by Status</h2>
                    {data.ordersByStatus.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={data.ordersByStatus}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    innerRadius={50}
                                    dataKey="count"
                                    nameKey="status"
                                >
                                    {data.ordersByStatus.map((entry) => (
                                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#9E9E9E'} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(value: any, name: any) => {
                                        const info = getOrderStatusLabel(name);
                                        return [value, info.label];
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[250px] text-charcoal-400 text-sm">
                            No order data yet
                        </div>
                    )}
                    <div className="mt-4 space-y-2">
                        {data.ordersByStatus.map((entry) => {
                            const info = getOrderStatusLabel(entry.status);
                            return (
                                <div key={entry.status} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ background: STATUS_COLORS[entry.status] }} />
                                        <span className="text-charcoal-600">{info.label}</span>
                                    </div>
                                    <span className="font-medium">{entry.count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-700" />
                    Recent Activity
                </h2>
                {data.recentOrders.length === 0 ? (
                    <p className="text-charcoal-500 text-sm py-8 text-center">No recent orders</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-charcoal-100">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-charcoal-500 uppercase">Order</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-charcoal-500 uppercase">Customer</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-charcoal-500 uppercase">Status</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-charcoal-500 uppercase">Total</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-charcoal-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentOrders.map((order) => {
                                    const statusInfo = getOrderStatusLabel(order.status);
                                    return (
                                        <tr key={order.id} className="border-b border-charcoal-50 hover:bg-charcoal-50 transition-colors">
                                            <td className="py-3 px-4 font-medium text-charcoal-900">#{order.id.slice(-6).toUpperCase()}</td>
                                            <td className="py-3 px-4 text-charcoal-600">{order.user?.name || order.user?.email}</td>
                                            <td className="py-3 px-4"><span className={`badge ${statusInfo.color}`}>{statusInfo.label}</span></td>
                                            <td className="py-3 px-4 font-medium">{formatPrice(order.total)}</td>
                                            <td className="py-3 px-4 text-charcoal-500">{formatDateTime(order.createdAt)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
