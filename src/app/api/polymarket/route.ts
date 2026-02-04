/**
 * Main Polymarket API Endpoint
 * Aggregates all data sources and returns PolymarketData
 */

import { NextResponse } from 'next/server';
import { fetchAllBTCData } from '@/lib/polymarket/client';
import { transformToPolymarketData } from '@/lib/polymarket/transformer';
import { detectChanges, getMostSignificantChange } from '@/lib/polymarket/change-detector';
import { generateInsightsIfEnabled, mergeInsightsIntoData } from '@/lib/ai/agent';
import { cacheGet, cacheSet, REDIS_KEYS, REDIS_TTL } from '@/lib/cache/redis';
import { saveMarketSnapshot, saveAIInsights } from '@/lib/db/postgres';
import { gammaCircuitBreaker } from '@/lib/polymarket/resilience';
import type { PolymarketData } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

export async function GET() {
  try {
    // 1. Try to get from cache first
    const cached = await cacheGet<PolymarketData>(REDIS_KEYS.LIVE_DATA);
    
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'X-Cache-Type': 'redis',
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      });
    }
    
    // 2. Fetch fresh data with circuit breaker
    const rawData = await gammaCircuitBreaker.call(
      () => fetchAllBTCData({ revalidate: 30 }),
      () => ({
        events: [],
        btcPrice: 95000,
        trades: [],
      })
    );
    
    // 3. Transform to PolymarketData shape
    const data = transformToPolymarketData(rawData);
    
    // 4. Get previous snapshot for change detection
    const previous = await cacheGet<PolymarketData>(REDIS_KEYS.PREVIOUS_SNAPSHOT);
    
    // 5. Check for significant changes
    const changes = detectChanges(data, previous);
    const significantChange = getMostSignificantChange(data, previous);
    
    // 6. Generate AI insights if there's a significant change or first load
    let finalData = data;
    
    if (changes.length > 0 || !previous) {
      const insights = await generateInsightsIfEnabled(data, significantChange);
      
      if (insights) {
        finalData = mergeInsightsIntoData(data, insights);
        
        // Save insights to database (non-blocking)
        saveAIInsights(insights).catch(console.error);
        
        // Cache the insights
        await cacheSet(REDIS_KEYS.AI_INSIGHTS, insights, REDIS_TTL.AI_INSIGHTS);
      }
    }
    
    // 7. Cache the data
    await cacheSet(REDIS_KEYS.LIVE_DATA, finalData, REDIS_TTL.LIVE_DATA);
    await cacheSet(REDIS_KEYS.PREVIOUS_SNAPSHOT, data, REDIS_TTL.PREVIOUS_SNAPSHOT);
    
    // 8. Save to database (non-blocking)
    saveMarketSnapshot(finalData).catch(console.error);
    
    return NextResponse.json(finalData, {
      headers: {
        'X-Cache': 'MISS',
        'X-Changes-Detected': String(changes.length),
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('[API:polymarket] Error:', error);
    
    // Try to return cached data on error
    const fallback = await cacheGet<PolymarketData>(REDIS_KEYS.LIVE_DATA);
    
    if (fallback) {
      return NextResponse.json(fallback, {
        headers: {
          'X-Cache': 'FALLBACK',
          'X-Error': 'true',
        },
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
