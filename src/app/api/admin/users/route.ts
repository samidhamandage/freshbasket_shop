import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as Record<string, unknown>).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const users = await prisma.user.findMany({
            select: {
                id: true, name: true, email: true, role: true, blocked: true,
                createdAt: true, image: true,
                _count: { select: { orders: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(users);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
