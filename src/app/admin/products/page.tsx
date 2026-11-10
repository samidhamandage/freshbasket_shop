'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import { formatPrice } from '@/utils';
import toast from 'react-hot-toast';

type Product = {
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    stockStatus: string;
    images: string;
    featured: boolean;
    category: { name: string };
};

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [form, setForm] = useState({
        name: '', description: '', price: '', comparePrice: '', categoryId: '',
        stock: '', unit: 'each', weight: '', featured: false, images: '',
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products?limit=100');
            const data = await res.json();
            setProducts(data);
        } catch { /* silent */ }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this product?')) return;
        try {
            const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(products.filter(p => p.id !== id));
                toast.success('Product deleted');
            }
        } catch { toast.error('Failed to delete'); }
    };

    const handleSave = async () => {
        try {
            const body = {
                ...form,
                price: parseFloat(form.price),
                comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
                stock: parseInt(form.stock),
                images: form.images,
            };

            const url = editProduct ? `/api/admin/products/${editProduct.id}` : '/api/admin/products';
            const method = editProduct ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                toast.success(editProduct ? 'Product updated' : 'Product created');
                setShowModal(false);
                setEditProduct(null);
                fetchProducts();
            }
        } catch { toast.error('Failed to save'); }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const stockBadge = (status: string, stock: number) => {
        if (status === 'OUT_OF_STOCK') return <span className="badge bg-red-100 text-red-700">Out ({stock})</span>;
        if (status === 'LOW_STOCK') return <span className="badge bg-amber-100 text-amber-700">Low ({stock})</span>;
        return <span className="badge bg-primary-50 text-primary-700">{stock}</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-charcoal-900">Products</h1>
                    <p className="text-charcoal-500 text-sm mt-1">{products.length} products total</p>
                </div>
                <button
                    onClick={() => { setEditProduct(null); setForm({ name: '', description: '', price: '', comparePrice: '', categoryId: '', stock: '', unit: 'each', weight: '', featured: false, images: '' }); setShowModal(true); }}
                    className="btn-primary flex items-center gap-2 text-sm"
                >
                    <Plus className="w-4 h-4" /> Add Product
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field pl-9"
                />
            </div>

            {/* Products Table */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="card p-4 animate-pulse flex gap-4">
                            <div className="w-16 h-16 bg-charcoal-100 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-charcoal-100 rounded w-1/3" />
                                <div className="h-3 bg-charcoal-100 rounded w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 card">
                    <Package className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
                    <p className="text-charcoal-500">No products found</p>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-charcoal-50">
                                <tr>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-charcoal-500 uppercase">Product</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-charcoal-500 uppercase">Category</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-charcoal-500 uppercase">Price</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-charcoal-500 uppercase">Stock</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-charcoal-500 uppercase">Featured</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-charcoal-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((product) => (
                                    <tr key={product.id} className="border-t border-charcoal-100 hover:bg-charcoal-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-charcoal-100 flex-shrink-0">
                                                    {product.images && (product.images.startsWith('http') || product.images.startsWith('/')) && (
                                                        <Image src={product.images} alt={product.name} fill className="object-cover" sizes="48px" />
                                                    )}
                                                </div>
                                                <span className="font-medium text-charcoal-900 truncate max-w-[200px]">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-charcoal-600">{product.category.name}</td>
                                        <td className="py-3 px-4 font-medium">{formatPrice(product.price)}</td>
                                        <td className="py-3 px-4">{stockBadge(product.stockStatus, product.stock)}</td>
                                        <td className="py-3 px-4">
                                            {product.featured ? (
                                                <span className="badge bg-primary-50 text-primary-700">Yes</span>
                                            ) : (
                                                <span className="text-charcoal-400">No</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => { setEditProduct(product); setShowModal(true); }} className="p-2 text-charcoal-500 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(product.id)} className="p-2 text-charcoal-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Product Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-lg font-semibold mb-4">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
                        <div className="space-y-4">
                            <input type="text" placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" rows={3} />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
                                <input type="number" placeholder="Compare Price" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} className="input-field" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" />
                                <input type="text" placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input-field" />
                            </div>
                            <input type="text" placeholder="Image URL" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="input-field" />
                            <label className="flex items-center gap-2">
                                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded" />
                                <span className="text-sm">Featured product</span>
                            </label>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
                            <button onClick={handleSave} className="btn-primary text-sm">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
