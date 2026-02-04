/**
 * Polymarket Prices API
 * Returns real-time BTC price data
 */

import { NextResponse } from 'next/server';
import { fetchBTCPrice } from '@/lib/polymarket/client';
import { cacheGet, cacheSet, REDIS_KEYS, REDIS_TTL } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';
export const revalidate = 10;

interface PriceData {
  price: number;
  timestamp: number;
  source: string;
}

export async function GET() {
  try {
    // Try cache first
    const cached = await cacheGet<PriceData>(REDIS_KEYS.PRICES);
    
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
        },
      });
    }
    
    // Fetch fresh price
    const price = await fetchBTCPrice({ revalidate: 10 });
    
    const data: PriceData = {
      price,
      timestamp: Date.now(),
      source: 'coincap',
    };
    
    // Cache it
    await cacheSet(REDIS_KEYS.PRICES, data, REDIS_TTL.PRICES);
    
    return NextResponse.json(data, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
      },
    });
  } catch (error) {
    console.error('[API:prices] Error:', error);
    
    // Return cached data on error
    const fallback = await cacheGet<PriceData>(REDIS_KEYS.PRICES);
    
    if (fallback) {
      return NextResponse.json(fallback, {
        headers: { 'X-Cache': 'FALLBACK' },
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch price', price: 95000, timestamp: Date.now() },
      { status: 500 }
    );
  }
}
