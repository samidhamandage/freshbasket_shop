'use client';

import { useState, useEffect } from 'react';
import { Shield, Ban, Search } from 'lucide-react';
import { formatDateTime } from '@/utils';
import toast from 'react-hot-toast';

type User = {
    id: string;
    name: string | null;
    email: string;
    role: string;
    blocked: boolean;
    createdAt: string;
    _count?: { orders: number };
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            setUsers(data);
        } catch { /* silent */ }
        setLoading(false);
    };

    useEffect(() => { fetchUsers(); }, []);

    const updateRole = async (userId: string, role: string) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role }),
            });
            if (res.ok) { toast.success('Role updated'); fetchUsers(); }
        } catch { toast.error('Failed to update'); }
    };

    const toggleBlock = async (userId: string, blocked: boolean) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blocked }),
            });
            if (res.ok) { toast.success(blocked ? 'User blocked' : 'User unblocked'); fetchUsers(); }
        } catch { toast.error('Failed to update'); }
    };

    const filtered = users.filter(u =>
        u.role !== 'ADMIN' && (
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
        )
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-charcoal-900">Users</h1>
                <p className="text-charcoal-500 text-sm mt-1">{users.length} registered users</p>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" />
            </div>

            {loading ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="card p-6 animate-pulse h-16" />)}</div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-charcoal-50">
                                <tr>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-charcoal-500 uppercase">User</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-charcoal-500 uppercase">Role</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-charcoal-500 uppercase">Orders</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-charcoal-500 uppercase">Joined</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-charcoal-500 uppercase">Status</th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-charcoal-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((user) => (
                                    <tr key={user.id} className="border-t border-charcoal-100 hover:bg-charcoal-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-primary-50 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                                                    {(user.name || user.email).charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-charcoal-900">{user.name || 'No name'}</p>
                                                    <p className="text-xs text-charcoal-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => updateRole(user.id, e.target.value)}
                                                className="text-xs border rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                            >
                                                <option value="USER">User</option>
                                            </select>
                                        </td>
                                        <td className="py-3 px-4 text-charcoal-600">{user._count?.orders || 0}</td>
                                        <td className="py-3 px-4 text-charcoal-500 text-xs">{formatDateTime(user.createdAt)}</td>
                                        <td className="py-3 px-4">
                                            {user.blocked ? (
                                                <span className="badge bg-red-100 text-red-700">Blocked</span>
                                            ) : (
                                                <span className="badge bg-primary-50 text-primary-700">Active</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => toggleBlock(user.id, !user.blocked)}
                                                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${user.blocked
                                                    ? 'text-primary-700 hover:bg-primary-50'
                                                    : 'text-red-600 hover:bg-red-50'
                                                    }`}
                                            >
                                                {user.blocked ? <Shield className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                                                {user.blocked ? 'Unblock' : 'Block'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
