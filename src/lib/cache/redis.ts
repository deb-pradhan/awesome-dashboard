/**
 * Redis Cache Layer
 * Provides caching for live market data with TTL
 */

import { Redis } from 'ioredis';

// Redis key prefixes and TTLs
export const REDIS_KEYS = {
  LIVE_DATA: 'polymarket:live',
  PRICES: 'polymarket:prices',
  TRADES: 'polymarket:trades',
  AI_INSIGHTS: 'polymarket:insights',
  PREVIOUS_SNAPSHOT: 'polymarket:previous',
} as const;

export const REDIS_TTL = {
  LIVE_DATA: 60,        // 60 seconds
  PRICES: 10,           // 10 seconds
  TRADES: 30,           // 30 seconds
  AI_INSIGHTS: 300,     // 5 minutes
  PREVIOUS_SNAPSHOT: 300, // 5 minutes
} as const;

// In-memory fallback cache
const memoryCache = new Map<string, { data: string; expiry: number }>();

/**
 * Get Redis client instance
 */
function getRedisClient(): Redis | null {
  const url = process.env.REDIS_URL;
  
  if (!url) {
    console.warn('[Redis] REDIS_URL not configured, using memory cache');
    return null;
  }
  
  try {
    return new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 100, 3000);
      },
    });
  } catch (error) {
    console.error('[Redis] Failed to connect:', error);
    return null;
  }
}

// Singleton Redis client
let redisClient: Redis | null = null;

function getClient(): Redis | null {
  if (!redisClient) {
    redisClient = getRedisClient();
  }
  return redisClient;
}

/**
 * Get value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getClient();
  
  if (client) {
    try {
      const data = await client.get(key);
      if (data) {
        return JSON.parse(data) as T;
      }
    } catch (error) {
      console.error('[Redis] Get error:', error);
    }
  }
  
  // Fallback to memory cache
  const cached = memoryCache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return JSON.parse(cached.data) as T;
  }
  
  return null;
}

/**
 * Set value in cache with TTL
 */
export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const data = JSON.stringify(value);
  const client = getClient();
  
  if (client) {
    try {
      await client.setex(key, ttlSeconds, data);
    } catch (error) {
      console.error('[Redis] Set error:', error);
    }
  }
  
  // Always update memory cache as fallback
  memoryCache.set(key, {
    data,
    expiry: Date.now() + (ttlSeconds * 1000),
  });
}

/**
 * Delete value from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  const client = getClient();
  
  if (client) {
    try {
      await client.del(key);
    } catch (error) {
      console.error('[Redis] Delete error:', error);
    }
  }
  
  memoryCache.delete(key);
}

/**
 * Check if key exists in cache
 */
export async function cacheExists(key: string): Promise<boolean> {
  const client = getClient();
  
  if (client) {
    try {
      return (await client.exists(key)) > 0;
    } catch (error) {
      console.error('[Redis] Exists error:', error);
    }
  }
  
  const cached = memoryCache.get(key);
  return cached !== undefined && cached.expiry > Date.now();
}

/**
 * Get cached data with freshness info
 */
export async function cacheGetWithMeta<T>(key: string): Promise<{
  data: T | null;
  fromCache: boolean;
  cacheType: 'redis' | 'memory' | 'none';
}> {
  const client = getClient();
  
  if (client) {
    try {
      const data = await client.get(key);
      if (data) {
        return {
          data: JSON.parse(data) as T,
          fromCache: true,
          cacheType: 'redis',
        };
      }
    } catch (error) {
      console.error('[Redis] GetWithMeta error:', error);
    }
  }
  
  const cached = memoryCache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return {
      data: JSON.parse(cached.data) as T,
      fromCache: true,
      cacheType: 'memory',
    };
  }
  
  return { data: null, fromCache: false, cacheType: 'none' };
}

/**
 * Clean up expired memory cache entries
 */
export function cleanupMemoryCache(): void {
  const now = Date.now();
  for (const [key, value] of memoryCache.entries()) {
    if (value.expiry <= now) {
      memoryCache.delete(key);
    }
  }
}

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupMemoryCache, 60000);
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
