import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateSlug } from '@/utils';
import { invalidateCache } from '@/lib/redis';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as Record<string, unknown>).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const slug = generateSlug(body.name);
        const stockStatus = body.stock === 0 ? 'OUT_OF_STOCK' : body.stock < 10 ? 'LOW_STOCK' : 'IN_STOCK';

        const product = await prisma.product.create({
            data: { ...body, slug, stockStatus },
            include: { category: true },
        });

        await invalidateCache('products:*');
        return NextResponse.json(product, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
