'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Account created! Please sign in.');
                router.push('/auth/login');
            } else {
                toast.error(data.error || 'Registration failed');
            }
        } catch {
            toast.error('Something went wrong');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-charcoal-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-12 h-12 bg-primary-900 rounded-xl flex items-center justify-center">
                            <Leaf className="w-7 h-7 text-white" />
                        </div>
                        <span className="font-display text-2xl font-bold text-charcoal-900">
                            Fresh<span className="text-primary-900">Basket</span>
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold text-charcoal-900">Create your account</h1>
                    <p className="text-charcoal-500 mt-1">Start shopping fresh groceries</p>
                </div>

                <div className="card p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field pl-10" placeholder="John Doe" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field pl-10" placeholder="you@example.com" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field pl-10 pr-10" placeholder="Min 8 characters" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full !py-3 disabled:opacity-50">
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-charcoal-500 mt-6">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-primary-900 font-semibold hover:text-primary-700">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
