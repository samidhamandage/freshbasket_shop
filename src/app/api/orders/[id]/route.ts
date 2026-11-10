import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendDeliveryNotification } from '@/services/WhatsAppService';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as Record<string, unknown>).id as string;
        const isAdmin = (session.user as Record<string, unknown>).role === 'ADMIN';

        const order = await prisma.order.findUnique({
            where: { id: params.id },
            include: {
                items: { include: { product: { select: { slug: true, images: true } } } },
                user: { select: { name: true, email: true } },
                trackingHistory: { orderBy: { createdAt: 'asc' } },
            },
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (!isAdmin && order.userId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(order);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as Record<string, unknown>).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { status, note } = await request.json();

        const order = await prisma.order.update({
            where: { id: params.id },
            data: {
                status,
                trackingHistory: {
                    create: { status, note: note || `Order status updated to ${status}` },
                },
            },
            include: {
                trackingHistory: { orderBy: { createdAt: 'asc' } },
                user: { select: { name: true, phone: true } },
            },
        });

        // Fire-and-forget WhatsApp notification on DELIVERED
        if (status === 'DELIVERED' && !order.whatsappNotified) {
            const phone = order.user?.phone || order.shippingPhone;
            const rawName = order.user?.name || order.shippingName;
            const userName = rawName && rawName !== 'Admin User' ? rawName : 'Shivam Mane';

            if (phone) {
                void sendDeliveryNotification(order.id, phone, userName);
            }
        }

        return NextResponse.json(order);
    } catch {
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
