import prisma from '@/lib/prisma';

export class InventoryService {
    static async updateStock(productId: string, change: number, reason: string) {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { stock: true, name: true },
        });

        if (!product) throw new Error('Product not found');

        const newStock = product.stock + change;
        if (newStock < 0) throw new Error('Insufficient stock');

        const stockStatus =
            newStock === 0 ? 'OUT_OF_STOCK' : newStock < 10 ? 'LOW_STOCK' : 'IN_STOCK';

        await prisma.$transaction([
            prisma.product.update({
                where: { id: productId },
                data: { stock: newStock, stockStatus },
            }),
            prisma.inventoryLog.create({
                data: { productId, change, reason, stock: newStock },
            }),
        ]);

        return { newStock, stockStatus };
    }

    static async getLowStockProducts() {
        return prisma.product.findMany({
            where: {
                OR: [
                    { stockStatus: 'LOW_STOCK' },
                    { stockStatus: 'OUT_OF_STOCK' },
                ],
            },
            include: { category: true },
            orderBy: { stock: 'asc' },
        });
    }

    static async getBestSelling(limit = 10) {
        const items = await prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: limit,
        });

        const productIds = items.map((i) => i.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            include: { category: true },
        });

        return items.map((item) => ({
            product: products.find((p) => p.id === item.productId),
            totalSold: item._sum.quantity || 0,
        }));
    }

    static async getMonthlyRevenue(months = 6) {
        const results = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

            const orders = await prisma.order.aggregate({
                where: {
                    createdAt: { gte: start, lte: end },
                    status: { notIn: ['CANCELLED', 'REFUNDED'] },
                },
                _sum: { total: true },
                _count: true,
            });

            results.push({
                month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
                revenue: orders._sum.total || 0,
                orders: orders._count,
            });
        }

        return results;
    }

    static async getInventoryLogs(productId?: string, limit = 50) {
        return prisma.inventoryLog.findMany({
            where: productId ? { productId } : undefined,
            include: { product: { select: { name: true, slug: true } } },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    static async getDashboardStats() {
        const [totalRevenue, totalOrders, totalUsers, totalProducts] = await Promise.all([
            prisma.order.aggregate({
                where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } },
                _sum: { total: true },
            }),
            prisma.order.count(),
            prisma.user.count(),
            prisma.product.count(),
        ]);

        const recentOrders = await prisma.order.findMany({
            include: {
                items: true,
                user: { select: { name: true, email: true } },
                trackingHistory: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        const ordersByStatus = await prisma.order.groupBy({
            by: ['status'],
            _count: true,
        });

        const monthlyRevenue = await InventoryService.getMonthlyRevenue();

        return {
            totalRevenue: totalRevenue._sum.total || 0,
            totalOrders,
            totalUsers,
            totalProducts,
            recentOrders,
            monthlyRevenue,
            ordersByStatus: ordersByStatus.map((o) => ({
                status: o.status,
                count: o._count,
            })),
        };
    }
}
