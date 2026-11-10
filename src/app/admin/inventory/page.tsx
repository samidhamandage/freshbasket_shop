'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Package, BarChart3 } from 'lucide-react';
import { formatPrice } from '@/utils';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer,
} from 'recharts';

type LowStockProduct = {
    id: string;
    name: string;
    stock: number;
    stockStatus: string;
    price: number;
    category: { name: string };
};

type BestSeller = {
    product: { id: string; name: string; price: number; images: string[] } | null;
    totalSold: number;
};

export default function AdminInventoryPage() {
    const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
    const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState<Array<{ month: string; revenue: number; orders: number }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/admin/inventory/low-stock').then(r => r.json()),
            fetch('/api/admin/inventory/best-sellers').then(r => r.json()),
            fetch('/api/admin/stats').then(r => r.json()),
        ]).then(([ls, bs, stats]) => {
            setLowStock(ls);
            setBestSellers(bs);
            setMonthlyRevenue(stats.monthlyRevenue || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-charcoal-900">Inventory Analytics</h1>
                <p className="text-charcoal-500 text-sm mt-1">Monitor stock levels and sales performance</p>
            </div>

            {/* Low Stock Alerts */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Low Stock Alerts
                </h2>
                {loading ? (
                    <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-charcoal-100 rounded animate-pulse" />)}</div>
                ) : lowStock.length === 0 ? (
                    <div className="text-center py-8 text-charcoal-500 text-sm">
                        <Package className="w-8 h-8 mx-auto mb-2 text-charcoal-300" />
                        All products are well-stocked!
                    </div>
                ) : (
                    <div className="space-y-2">
                        {lowStock.map((product) => (
                            <div key={product.id} className={`flex items-center justify-between p-3 rounded-xl ${product.stock === 0 ? 'bg-red-50' : 'bg-amber-50'}`}>
                                <div>
                                    <p className="font-medium text-charcoal-900">{product.name}</p>
                                    <p className="text-xs text-charcoal-500">{product.category.name}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`badge ${product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                                    </span>
                                    <p className="text-xs text-charcoal-500 mt-1">{formatPrice(product.price)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Best Sellers */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-700" />
                        Best Selling Products
                    </h2>
                    {loading ? (
                        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-10 bg-charcoal-100 rounded animate-pulse" />)}</div>
                    ) : bestSellers.length === 0 ? (
                        <p className="text-charcoal-500 text-sm text-center py-8">No sales data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {bestSellers.map((item, i) => (
                                item.product && (
                                    <div key={item.product.id} className="flex items-center justify-between p-3 bg-charcoal-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <span className="w-7 h-7 bg-primary-100 text-primary-900 rounded-lg flex items-center justify-center text-xs font-bold">
                                                #{i + 1}
                                            </span>
                                            <div>
                                                <p className="text-sm font-medium text-charcoal-900">{item.product.name}</p>
                                                <p className="text-xs text-charcoal-500">{formatPrice(item.product.price)}</p>
                                            </div>
                                        </div>
                                        <span className="badge bg-primary-50 text-primary-700">{item.totalSold} sold</span>
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>

                {/* Monthly Performance */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary-700" />
                        Monthly Performance
                    </h2>
                    {loading ? (
                        <div className="h-[250px] bg-charcoal-100 rounded animate-pulse" />
                    ) : monthlyRevenue.length === 0 ? (
                        <p className="text-charcoal-500 text-sm text-center py-8">No revenue data yet</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                                <Tooltip
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #E0E0E0' }}
                                />
                                <Bar dataKey="revenue" fill="#1B5E20" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}
