'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Package, ShoppingCart, Users,
    BarChart3, Leaf, ChevronLeft,
} from 'lucide-react';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/inventory', label: 'Inventory', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-charcoal-50">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-charcoal-900 text-white z-40 hidden lg:flex flex-col">
                <div className="p-6 border-b border-charcoal-800">
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-primary-700 rounded-lg flex items-center justify-center">
                            <Leaf className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="font-display text-lg font-bold">FreshBasket</span>
                            <span className="text-[10px] text-primary-400 block -mt-1 tracking-widest">ADMIN</span>
                        </div>
                    </Link>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                                    ? 'bg-primary-900 text-white'
                                    : 'text-charcoal-400 hover:bg-charcoal-800 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-charcoal-800">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Store
                    </Link>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="lg:hidden sticky top-0 z-40 bg-charcoal-900 text-white px-4 py-3 flex items-center justify-between">
                <Link href="/admin" className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-primary-400" />
                    <span className="font-display text-lg font-bold">Admin</span>
                </Link>
                <Link href="/" className="text-sm text-charcoal-400">← Store</Link>
            </header>

            {/* Mobile Nav */}
            <nav className="lg:hidden sticky top-12 z-30 bg-white border-b border-charcoal-100 overflow-x-auto">
                <div className="flex px-4 gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${isActive
                                    ? 'border-primary-700 text-primary-900'
                                    : 'border-transparent text-charcoal-500 hover:text-charcoal-700'
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen">
                <div className="p-6 lg:p-8">{children}</div>
            </main>
        </div>
    );
}
