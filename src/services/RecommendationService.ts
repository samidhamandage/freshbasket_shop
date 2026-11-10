import prisma from '@/lib/prisma';

export class RecommendationService {
    // Get recommendations based on category similarity and user interactions
    static async getRecommendations(
        productId?: string,
        userId?: string,
        limit = 8
    ) {
        try {
            // If we have a specific product, recommend similar products
            if (productId) {
                const product = await prisma.product.findUnique({
                    where: { id: productId },
                    select: { categoryId: true, id: true },
                });

                if (product) {
                    // Get products from same category
                    const similar = await prisma.product.findMany({
                        where: {
                            categoryId: product.categoryId,
                            id: { not: product.id },
                            stockStatus: { not: 'OUT_OF_STOCK' },
                        },
                        include: { category: true },
                        orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
                        take: limit,
                    });

                    if (similar.length >= limit) return similar;

                    // Fill remaining with frequently bought together (same orders)
                    const orderItems = await prisma.orderItem.findMany({
                        where: { productId },
                        select: { orderId: true },
                        take: 50,
                    });

                    const orderIds = orderItems.map((oi) => oi.orderId);

                    if (orderIds.length > 0) {
                        const existingIds = similar.map((p) => p.id);
                        const boughtTogether = await prisma.product.findMany({
                            where: {
                                orderItems: { some: { orderId: { in: orderIds } } },
                                id: { notIn: [product.id, ...existingIds] },
                                stockStatus: { not: 'OUT_OF_STOCK' },
                            },
                            include: { category: true },
                            orderBy: { reviewCount: 'desc' },
                            take: limit - similar.length,
                        });

                        return [...similar, ...boughtTogether];
                    }

                    return similar;
                }
            }

            // If we have a user, recommend based on their history
            if (userId) {
                const interactions = await prisma.userInteraction.findMany({
                    where: { userId },
                    include: { product: { select: { categoryId: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                });

                if (interactions.length > 0) {
                    const categoryIds = Array.from(new Set(interactions.map((i) => i.product.categoryId)));
                    const viewedProductIds = interactions.map((i) => i.productId);

                    const recommended = await prisma.product.findMany({
                        where: {
                            categoryId: { in: categoryIds },
                            id: { notIn: viewedProductIds },
                            stockStatus: { not: 'OUT_OF_STOCK' },
                        },
                        include: { category: true },
                        orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
                        take: limit,
                    });

                    if (recommended.length >= limit) return recommended;

                    // Fill with trending products
                    const existingIds = recommended.map((p) => p.id);
                    const trending = await prisma.product.findMany({
                        where: {
                            id: { notIn: [...viewedProductIds, ...existingIds] },
                            stockStatus: { not: 'OUT_OF_STOCK' },
                        },
                        include: { category: true },
                        orderBy: [{ reviewCount: 'desc' }, { rating: 'desc' }],
                        take: limit - recommended.length,
                    });

                    return [...recommended, ...trending];
                }
            }

            // Default: return trending products
            return prisma.product.findMany({
                where: { stockStatus: { not: 'OUT_OF_STOCK' } },
                include: { category: true },
                orderBy: [{ reviewCount: 'desc' }, { rating: 'desc' }],
                take: limit,
            });
        } catch (error) {
            console.error('Recommendation error:', error);
            return prisma.product.findMany({
                where: { featured: true },
                include: { category: true },
                take: limit,
            });
        }
    }

    // Track user interaction
    static async trackInteraction(userId: string, productId: string, type: string) {
        try {
            await prisma.userInteraction.create({
                data: { userId, productId, type },
            });
        } catch (error) {
            console.error('Track interaction error:', error);
        }
    }

    // Get trending products based on recent interactions
    static async getTrending(limit = 8) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        try {
            const trending = await prisma.product.findMany({
                where: {
                    stockStatus: { not: 'OUT_OF_STOCK' },
                    interactions: {
                        some: { createdAt: { gte: thirtyDaysAgo } },
                    },
                },
                include: {
                    category: true,
                    _count: { select: { interactions: true } },
                },
                orderBy: {
                    interactions: { _count: 'desc' },
                },
                take: limit,
            });

            if (trending.length < limit) {
                const existingIds = trending.map((p) => p.id);
                const filler = await prisma.product.findMany({
                    where: {
                        id: { notIn: existingIds },
                        stockStatus: { not: 'OUT_OF_STOCK' },
                    },
                    include: { category: true },
                    orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
                    take: limit - trending.length,
                });
                return [...trending, ...filler];
            }

            return trending;
        } catch {
            return prisma.product.findMany({
                include: { category: true },
                orderBy: { rating: 'desc' },
                take: limit,
            });
        }
    }
}
