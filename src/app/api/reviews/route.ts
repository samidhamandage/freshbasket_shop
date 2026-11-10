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

        const userId = (session.user as Record<string, unknown>).id as string;
        const { productId, rating, comment } = await request.json();

        if (!productId || !rating || !comment) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });
        }

        // Check if user already reviewed this product
        const existing = await prisma.review.findUnique({
            where: { userId_productId: { userId, productId } },
        });

        if (existing) {
            return NextResponse.json({ error: 'You already reviewed this product' }, { status: 400 });
        }

        const review = await prisma.review.create({
            data: { userId, productId, rating, comment },
            include: { user: { select: { name: true, image: true } } },
        });

        // Update product rating
        const avgRating = await prisma.review.aggregate({
            where: { productId },
            _avg: { rating: true },
            _count: true,
        });

        await prisma.product.update({
            where: { id: productId },
            data: {
                rating: avgRating._avg.rating || 0,
                reviewCount: avgRating._count,
            },
        });

        return NextResponse.json({ review }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }
}
