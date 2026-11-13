'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
    const itemsRef = useRef<CartItem[]>(items);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('freshbasket-cart');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setItems(parsed);
                itemsRef.current = parsed;
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
        itemsRef.current = items;
        if (mounted) {
            localStorage.setItem('freshbasket-cart', JSON.stringify(items));
        }
    }, [items, mounted]);

    const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
        const currentItems = itemsRef.current;
        const existing = currentItems.find((i) => i.id === item.id);
        if (existing) {
            if (existing.quantity >= item.stock) {
                toast.error('Maximum stock reached', { id: `cart-${item.id}` });
                return;
            }
            toast.success(`Updated ${item.name} quantity`, { id: `cart-${item.id}` });
            const updated = currentItems.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            );
            itemsRef.current = updated;
            setItems(updated);
        } else {
            toast.success(`Added ${item.name} to cart`, { id: `cart-${item.id}` });
            const updated = [...currentItems, { ...item, quantity: 1 }];
            itemsRef.current = updated;
            setItems(updated);
        }
    }, []);

    const removeItem = useCallback((id: string) => {
        const item = itemsRef.current.find((i) => i.id === id);
        if (item) toast.success(`Removed ${item.name} from cart`, { id: `cart-${id}` });
        const updated = itemsRef.current.filter((i) => i.id !== id);
        itemsRef.current = updated;
        setItems(updated);
    }, []);

    const updateQuantity = useCallback((id: string, quantity: number) => {
        if (quantity < 1) return;
        const item = itemsRef.current.find((i) => i.id === id);
        if (item && quantity > item.stock) {
            toast.error('Maximum stock reached', { id: `cart-${id}` });
            return;
        }
        const updated = itemsRef.current.map((i) =>
            i.id === id ? { ...i, quantity } : i
        );
        itemsRef.current = updated;
        setItems(updated);
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
        itemsRef.current = [];
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
                toast.success(`Coupon applied! You save ₹${data.discount.toFixed(2)}`);
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
    const deliveryFee = subtotal > 4150 ? 0 : subtotal > 0 ? 497 : 0;
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
