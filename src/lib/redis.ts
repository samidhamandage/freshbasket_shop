import Redis from 'ioredis';

const getRedisClient = () => {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
        const client = new Redis(url, {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                if (times > 3) return null;
                return Math.min(times * 200, 2000);
            },
            lazyConnect: true,
        });

        client.on('error', (err) => {
            console.warn('Redis connection error:', err.message);
        });

        return client;
    } catch {
        console.warn('Redis not available, caching disabled');
        return null;
    }
};

const globalForRedis = globalThis as unknown as { redis: Redis | null };

export const redis = globalForRedis.redis || getRedisClient();

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export const CACHE_TTL = 300; // 5 minutes

export async function getCached<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    try {
        const cached = await redis.get(key);
        return cached ? JSON.parse(cached) : null;
    } catch {
        return null;
    }
}

export async function setCache(key: string, data: unknown, ttl = CACHE_TTL): Promise<void> {
    if (!redis) return;
    try {
        await redis.setex(key, ttl, JSON.stringify(data));
    } catch {
        // silently fail
    }
}

export async function invalidateCache(pattern: string): Promise<void> {
    if (!redis) return;
    try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch {
        // silently fail
    }
}

export default redis;
