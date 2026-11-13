import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { code, subtotal } = await request.json();

        if (!code) {
            return NextResponse.json({ valid: false, message: 'Coupon code required' });
        }

        const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

        if (!coupon || !coupon.active) {
            return NextResponse.json({ valid: false, message: 'Invalid or expired coupon' });
        }

        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
            return NextResponse.json({ valid: false, message: 'This coupon has expired' });
        }

        if (coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json({ valid: false, message: 'This coupon has reached its usage limit' });
        }

        if (subtotal < coupon.minOrder) {
            return NextResponse.json({
                valid: false,
                message: `Minimum order of ₹${coupon.minOrder.toFixed(2)} required`,
            });
        }

        const discount =
            coupon.type === 'percentage'
                ? (subtotal * coupon.discount) / 100
                : coupon.discount;

        return NextResponse.json({
            valid: true,
            discount: Math.min(discount, subtotal),
            type: coupon.type,
            message: `Coupon applied! ${coupon.type === 'percentage' ? `${coupon.discount}% off` : `₹${coupon.discount} off`}`,
        });
    } catch {
        return NextResponse.json({ valid: false, message: 'Failed to validate coupon' });
    }
}
