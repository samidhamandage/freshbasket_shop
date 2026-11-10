import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { invalidateCache } from '@/lib/redis';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as Record<string, unknown>).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const stockStatus = body.stock === 0 ? 'OUT_OF_STOCK' : body.stock < 10 ? 'LOW_STOCK' : 'IN_STOCK';

        const product = await prisma.product.update({
            where: { id: params.id },
            data: { ...body, stockStatus },
        });

        await invalidateCache('products:*');
        return NextResponse.json(product);
    } catch {
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as Record<string, unknown>).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.product.delete({ where: { id: params.id } });
        await invalidateCache('products:*');
        return NextResponse.json({ message: 'Deleted' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
