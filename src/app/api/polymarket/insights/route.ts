/**
 * AI Insights API
 * Returns AI-generated market insights
 */

import { NextResponse } from 'next/server';
import { cacheGet, cacheSet, REDIS_KEYS, REDIS_TTL } from '@/lib/cache/redis';
import { generateInsights, DEFAULT_INSIGHTS, type AIInsights } from '@/lib/ai/agent';
import { fetchAllBTCData } from '@/lib/polymarket/client';
import { transformToPolymarketData } from '@/lib/polymarket/transformer';
import { getRecentInsights } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === 'true';
  
  try {
    // Try cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await cacheGet<AIInsights>(REDIS_KEYS.AI_INSIGHTS);
      
      if (cached) {
        return NextResponse.json(cached, {
          headers: {
            'X-Cache': 'HIT',
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          },
        });
      }
    }
    
    // Check if AI is enabled
    if (process.env.ENABLE_AI_INSIGHTS === 'false') {
      return NextResponse.json(DEFAULT_INSIGHTS, {
        headers: { 'X-AI-Disabled': 'true' },
      });
    }
    
    // Generate fresh insights
    const rawData = await fetchAllBTCData({ revalidate: 60 });
    const data = transformToPolymarketData(rawData);
    const insights = await generateInsights(data, null);
    
    // Cache the insights
    await cacheSet(REDIS_KEYS.AI_INSIGHTS, insights, REDIS_TTL.AI_INSIGHTS);
    
    return NextResponse.json(insights, {
      headers: {
        'X-Cache': 'MISS',
        'X-Generated': 'true',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('[API:insights] Error:', error);
    
    // Try to get from database
    try {
      const dbInsights = await getRecentInsights(1);
      if (dbInsights.length > 0) {
        return NextResponse.json(dbInsights[0], {
          headers: { 'X-Cache': 'DATABASE' },
        });
      }
    } catch (dbError) {
      console.error('[API:insights] Database fallback error:', dbError);
    }
    
    // Return default insights
    return NextResponse.json(DEFAULT_INSIGHTS, {
      headers: { 'X-Fallback': 'true' },
    });
  }
}
