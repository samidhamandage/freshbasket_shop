'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import {
    ShoppingCart,
    Menu,
    X,
    Search,
    Leaf,
    Package,
    LogOut,
    LayoutDashboard,
    ChevronDown,
} from 'lucide-react';

export default function Navbar() {
    const { data: session } = useSession();
    const { totalItems } = useCart();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const isAdmin = (session?.user as Record<string, unknown>)?.role === 'ADMIN';

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
        }
    };

    const handleSignOut = () => {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('freshbasket_session_active');
        }
        signOut({ callbackUrl: '/' });
    };

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-charcoal-100 shadow-sm">
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center group-hover:bg-primary-800 transition-colors">
                            <Leaf className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="font-display text-xl font-bold text-charcoal-900">
                                Fresh<span className="text-primary-900">Basket</span>
                            </span>
                            <span className="text-[10px] font-bold text-primary-600 block -mt-1 tracking-wider">
                                AI POWERED
                            </span>
                        </div>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <form
                        onSubmit={handleSearch}
                        className="hidden md:flex items-center flex-1 max-w-md mx-8"
                    >
                        <div className="relative w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                            <input
                                type="text"
                                placeholder="Search fresh groceries..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-50 border border-charcoal-200 text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white
                  transition-all duration-200"
                            />
                        </div>
                    </form>

                    {/* Nav Links - Desktop */}
                    <nav className="hidden md:flex items-center gap-1">
                        <Link
                            href="/shop"
                            className="px-4 py-2 text-sm font-medium text-charcoal-600 hover:text-primary-900 hover:bg-primary-50 rounded-xl transition-all"
                        >
                            Shop
                        </Link>

                        {/* Cart */}
                        {!isAdmin && (
                            <Link
                                href="/cart"
                                className="relative px-3 py-2 text-charcoal-600 hover:text-primary-900 hover:bg-primary-50 rounded-xl transition-all"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-900 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* Auth */}
                        {session ? (
                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-charcoal-700 hover:bg-primary-50 rounded-xl transition-all"
                                >
                                    <div className="w-8 h-8 bg-primary-100 text-primary-900 rounded-full flex items-center justify-center text-sm font-bold">
                                        {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                {profileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-charcoal-100 py-2 z-50 animate-slide-down">
                                            <div className="px-4 py-3 border-b border-charcoal-100">
                                                <p className="text-sm font-semibold text-charcoal-900 truncate">
                                                    {session.user?.name}
                                                </p>
                                                <p className="text-xs text-charcoal-500 truncate">
                                                    {session.user?.email}
                                                </p>
                                            </div>
                                            <Link
                                                href="/orders"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                                                onClick={() => setProfileOpen(false)}
                                            >
                                                <Package className="w-4 h-4" />
                                                My Orders
                                            </Link>
                                            {isAdmin && (
                                                <Link
                                                    href="/admin"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                                                    onClick={() => setProfileOpen(false)}
                                                >
                                                    <LayoutDashboard className="w-4 h-4" />
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            <button
                                                onClick={handleSignOut}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <Link href="/auth/login" className="btn-primary text-sm !px-5 !py-2.5">
                                Sign In
                            </Link>
                        )}
                    </nav>

                    {/* Mobile Toggle */}
                    <div className="flex items-center gap-3 md:hidden">
                        {!isAdmin && (
                            <Link href="/cart" className="relative p-2">
                                <ShoppingCart className="w-5 h-5 text-charcoal-700" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-900 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                        )}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="p-2 text-charcoal-700"
                        >
                            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-charcoal-100 py-4 animate-slide-down">
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                                <input
                                    type="text"
                                    placeholder="Search groceries..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-50 border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </form>
                        <nav className="flex flex-col gap-1">
                            <Link
                                href="/shop"
                                className="px-4 py-3 text-sm font-medium text-charcoal-700 hover:bg-primary-50 rounded-xl"
                                onClick={() => setMobileOpen(false)}
                            >
                                Shop All
                            </Link>
                            {session ? (
                                <>
                                    <Link
                                        href="/orders"
                                        className="px-4 py-3 text-sm font-medium text-charcoal-700 hover:bg-primary-50 rounded-xl"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        My Orders
                                    </Link>
                                    {isAdmin && (
                                        <Link
                                            href="/admin"
                                            className="px-4 py-3 text-sm font-medium text-charcoal-700 hover:bg-primary-50 rounded-xl"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleSignOut}
                                        className="text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl"
                                    >
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/auth/login"
                                    className="btn-primary text-center text-sm mt-2"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Sign In
                                </Link>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
