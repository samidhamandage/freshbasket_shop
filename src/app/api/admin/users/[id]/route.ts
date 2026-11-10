import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as Record<string, unknown>).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const data: Record<string, unknown> = {};

        if (body.role !== undefined) data.role = body.role;
        if (body.blocked !== undefined) data.blocked = body.blocked;

        const user = await prisma.user.update({
            where: { id: params.id },
            data,
        });

        return NextResponse.json(user);
    } catch {
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
