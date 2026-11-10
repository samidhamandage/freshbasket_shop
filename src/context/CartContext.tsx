'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { CartItem } from '@/types';

type CartContextType = {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    couponCode: string | null;
    applyCoupon: (code: string) => Promise<boolean>;
    removeCoupon: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [couponCode, setCouponCode] = useState<string | null>(null);
    const [discount, setDiscount] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('freshbasket-cart');
        if (saved) {
            try {
                setItems(JSON.parse(saved));
            } catch {
                localStorage.removeItem('freshbasket-cart');
            }
        }
        const savedCoupon = localStorage.getItem('freshbasket-coupon');
        if (savedCoupon) {
            try {
                const { code, discount: d } = JSON.parse(savedCoupon);
                setCouponCode(code);
                setDiscount(d);
            } catch {
                localStorage.removeItem('freshbasket-coupon');
            }
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem('freshbasket-cart', JSON.stringify(items));
        }
    }, [items, mounted]);

    const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                if (existing.quantity >= item.stock) {
                    toast.error('Maximum stock reached');
                    return prev;
                }
                toast.success(`Updated ${item.name} quantity`);
                return prev.map((i) =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            toast.success(`Added ${item.name} to cart`);
            return [...prev, { ...item, quantity: 1 }];
        });
    }, []);

    const removeItem = useCallback((id: string) => {
        setItems((prev) => {
            const item = prev.find((i) => i.id === id);
            if (item) toast.success(`Removed ${item.name} from cart`);
            return prev.filter((i) => i.id !== id);
        });
    }, []);

    const updateQuantity = useCallback((id: string, quantity: number) => {
        if (quantity < 1) return;
        setItems((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    if (quantity > item.stock) {
                        toast.error('Maximum stock reached');
                        return item;
                    }
                    return { ...item, quantity };
                }
                return item;
            })
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
        setCouponCode(null);
        setDiscount(0);
        localStorage.removeItem('freshbasket-coupon');
    }, []);

    const applyCoupon = useCallback(async (code: string): Promise<boolean> => {
        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0) }),
            });
            const data = await res.json();
            if (data.valid) {
                setCouponCode(code);
                setDiscount(data.discount);
                localStorage.setItem('freshbasket-coupon', JSON.stringify({ code, discount: data.discount }));
                toast.success(`Coupon applied! You save $${data.discount.toFixed(2)}`);
                return true;
            }
            toast.error(data.message || 'Invalid coupon');
            return false;
        } catch {
            toast.error('Failed to validate coupon');
            return false;
        }
    }, [items]);

    const removeCoupon = useCallback(() => {
        setCouponCode(null);
        setDiscount(0);
        localStorage.removeItem('freshbasket-coupon');
        toast.success('Coupon removed');
    }, []);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal > 50 ? 0 : subtotal > 0 ? 5.99 : 0;
    const total = Math.max(0, subtotal + deliveryFee - discount);

    if (!mounted) return null;

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                totalItems,
                subtotal,
                deliveryFee,
                discount,
                total,
                couponCode,
                applyCoupon,
                removeCoupon,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
}
