'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Leaf, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setForm({ name: '', email: '', password: '' });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Full Name validation: Only alphabetic letters (A–Z, a–z) and spaces
        if (!form.name.trim()) {
            toast.error('Full Name is required');
            return;
        }
        if (!/^[A-Za-z\s]+$/.test(form.name)) {
            toast.error('Full Name can only contain letters and spaces (no numbers or special characters)');
            return;
        }

        // 2. Password validation: At least 8 characters, 1 uppercase, 1 number, 1 special character
        if (form.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        if (!/[A-Z]/.test(form.password)) {
            toast.error('Password must contain at least one uppercase letter');
            return;
        }
        if (!/[0-9]/.test(form.password)) {
            toast.error('Password must contain at least one number');
            return;
        }
        if (!/[^A-Za-z0-9]/.test(form.password)) {
            toast.error('Password must contain at least one special character');
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
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('freshbasket_session_active', 'true');
                }
                const signInRes = await signIn('credentials', {
                    email: form.email,
                    password: form.password,
                    redirect: false,
                });
                if (signInRes?.error) {
                    toast.error(signInRes.error === 'CredentialsSignin' ? 'Invalid credentials' : signInRes.error);
                } else {
                    toast.success('Account created successfully!');
                    router.push('/');
                    router.refresh();
                }
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
                    <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
                        {/* Hidden inputs to capture aggressive browser autofill */}
                        <input type="text" name="prevent_autofill_user" id="prevent_autofill_user" defaultValue="" style={{ position: 'absolute', opacity: 0, height: 0, width: 0, zIndex: -1 }} tabIndex={-1} readOnly />
                        <input type="password" name="prevent_autofill_pass" id="prevent_autofill_pass" defaultValue="" style={{ position: 'absolute', opacity: 0, height: 0, width: 0, zIndex: -1 }} tabIndex={-1} readOnly />

                        <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                                <input
                                    type="text"
                                    name="name"
                                    id="register-name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="input-field pl-10"
                                    placeholder="John Doe"
                                    autoComplete="off"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                                <input
                                    type="email"
                                    name="email"
                                    id="register-email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="input-field pl-10"
                                    placeholder="you@example.com"
                                    autoComplete="off"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    id="register-password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="input-field pl-10 pr-10"
                                    placeholder="Min 8 characters"
                                    autoComplete="new-password"
                                    required
                                />
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
