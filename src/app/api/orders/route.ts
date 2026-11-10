import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { items, shipping, couponCode, subtotal, deliveryFee, discount, total } = body;

        if (!items?.length || !shipping) {
            return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
        }

        const userId = (session.user as Record<string, unknown>).id as string;

        // Verify stock availability
        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product || product.stock < item.quantity) {
                return NextResponse.json(
                    { error: `${item.name} is out of stock or has insufficient quantity` },
                    { status: 400 }
                );
            }
        }

        // Create order with transaction
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    subtotal,
                    deliveryFee,
                    discount,
                    total,
                    couponCode,
                    shippingName: shipping.name,
                    shippingEmail: shipping.email,
                    shippingPhone: shipping.phone,
                    shippingAddress: shipping.address,
                    shippingCity: shipping.city,
                    shippingState: shipping.state,
                    shippingZip: shipping.zip,
                    paymentStatus: 'completed',
                    status: 'PLACED',
                    items: {
                        create: items.map((item: { productId: string; quantity: number; price: number; name: string; image: string }) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            name: item.name,
                            image: item.image,
                        })),
                    },
                    trackingHistory: {
                        create: { status: 'PLACED', note: 'Order has been placed successfully' },
                    },
                },
            });

            // Update stock for each product
            for (const item of items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (product) {
                    const newStock = product.stock - item.quantity;
                    const stockStatus = newStock === 0 ? 'OUT_OF_STOCK' : newStock < 10 ? 'LOW_STOCK' : 'IN_STOCK';
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: newStock, stockStatus },
                    });
                    await tx.inventoryLog.create({
                        data: {
                            productId: item.productId,
                            change: -item.quantity,
                            reason: `Order ${newOrder.id}`,
                            stock: newStock,
                        },
                    });
                }
            }

            // Update coupon usage
            if (couponCode) {
                await tx.coupon.updateMany({
                    where: { code: couponCode },
                    data: { usedCount: { increment: 1 } },
                });
            }

            // Track purchase interactions
            for (const item of items) {
                await tx.userInteraction.create({
                    data: { userId, productId: item.productId, type: 'purchase' },
                });
            }

            return newOrder;
        });

        return NextResponse.json({ orderId: order.id, message: 'Order created' }, { status: 201 });
    } catch (error) {
        console.error('Order creation error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as Record<string, unknown>).id as string;
        const isAdmin = (session.user as Record<string, unknown>).role === 'ADMIN';

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = isAdmin ? {} : { userId };
        if (status) where.status = status;

        const orders = await prisma.order.findMany({
            where,
            include: {
                items: true,
                user: { select: { name: true, email: true } },
                trackingHistory: { orderBy: { createdAt: 'desc' } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(orders);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
