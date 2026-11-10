import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { InventoryService } from '@/services/InventoryService';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as Record<string, unknown>).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stats = await InventoryService.getDashboardStats();
        return NextResponse.json(stats);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
    }
}
