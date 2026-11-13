import Link from 'next/link';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-charcoal-900 text-charcoal-300 mt-20">
            <div className="container-custom py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center">
                                <Leaf className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-display text-xl font-bold text-white">
                                Fresh<span className="text-primary-400">Basket</span>
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed text-charcoal-400 mb-6">
                            AI-powered grocery commerce delivering the freshest products to your
                            doorstep. Experience smart shopping with personalized recommendations.
                        </p>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1.5 bg-primary-900/30 text-primary-400 text-xs font-semibold rounded-full">
                                ✨ AI Powered
                            </span>
                            <span className="px-3 py-1.5 bg-emerald-900/30 text-emerald-400 text-xs font-semibold rounded-full">
                                🚚 Free Delivery ₹50+
                            </span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
                            Quick Links
                        </h4>
                        <nav className="flex flex-col gap-3">
                            {[
                                { label: 'Shop All', href: '/shop' },
                                { label: 'Fresh Deals', href: '/shop?sort=price_asc' },
                                { label: 'My Orders', href: '/orders' },
                                { label: 'My Cart', href: '/cart' },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm text-charcoal-400 hover:text-primary-400 transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
                            Categories
                        </h4>
                        <nav className="flex flex-col gap-3">
                            {[
                                'Fruits & Vegetables',
                                'Dairy & Eggs',
                                'Bakery',
                                'Meat & Seafood',
                                'Beverages',
                                'Pantry',
                            ].map((cat) => (
                                <Link
                                    key={cat}
                                    href={`/shop?category=${cat.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                                    className="text-sm text-charcoal-400 hover:text-primary-400 transition-colors"
                                >
                                    {cat}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
                            Contact Us
                        </h4>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
                                <span className="text-sm text-charcoal-400">
                                    123 Market Street, San Francisco, CA 94102
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-primary-400" />
                                <span className="text-sm text-charcoal-400">+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-primary-400" />
                                <span className="text-sm text-charcoal-400">support@freshbasket.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-charcoal-800">
                <div className="container-custom py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-charcoal-500">
                        © {new Date().getFullYear()} FreshBasket X. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-xs text-charcoal-500 hover:text-charcoal-400 cursor-pointer">
                            Privacy Policy
                        </span>
                        <span className="text-xs text-charcoal-500 hover:text-charcoal-400 cursor-pointer">
                            Terms of Service
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
