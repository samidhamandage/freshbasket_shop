import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCached, setCache } from '@/lib/redis';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');
        const limit = parseInt(searchParams.get('limit') || '20');

        const cacheKey = `products:${category || 'all'}:${featured || ''}:${limit}`;
        const cached = await getCached(cacheKey);
        if (cached) return NextResponse.json(cached);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (category) where.category = { slug: category };
        if (featured === 'true') where.featured = true;

        const products = await prisma.product.findMany({
            where,
            include: { category: true },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        await setCache(cacheKey, products, 120);
        return NextResponse.json(products);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}
