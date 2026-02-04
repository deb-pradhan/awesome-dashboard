/**
 * PostgreSQL Database Layer
 * Stores historical market data and AI insights
 */

import { Pool, PoolClient } from 'pg';
import type { PolymarketData } from '../types';
import type { AIInsights } from '../ai/agent';

// Database pool singleton
let pool: Pool | null = null;

/**
 * Get database pool instance
 */
function getPool(): Pool | null {
  if (pool) return pool;
  
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.warn('[Postgres] DATABASE_URL not configured');
    return null;
  }
  
  try {
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    
    pool.on('error', (err) => {
      console.error('[Postgres] Pool error:', err);
    });
    
    return pool;
  } catch (error) {
    console.error('[Postgres] Failed to create pool:', error);
    return null;
  }
}

/**
 * Execute a query with automatic connection handling
 */
async function query<T>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const db = getPool();
  if (!db) return [];
  
  try {
    const result = await db.query(sql, params);
    return result.rows as T[];
  } catch (error) {
    console.error('[Postgres] Query error:', error);
    return [];
  }
}

/**
 * Save market snapshot to database
 */
export async function saveMarketSnapshot(data: PolymarketData): Promise<void> {
  const db = getPool();
  if (!db) return;
  
  try {
    await db.query(
      `INSERT INTO market_snapshots (
        btc_price, buy_sell_ratio, sentiment,
        top_upside_target, top_upside_probability,
        top_downside_target, top_downside_probability,
        total_volume, total_markets, raw_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        data.analysis.priceConsensus.currentPrice,
        data.summary.buySellRatio,
        data.summary.tradeSentiment,
        data.analysis.priceConsensus.mostLikelyUp.target,
        data.analysis.priceConsensus.mostLikelyUp.probability,
        data.analysis.priceConsensus.mostLikelyDown.target,
        data.analysis.priceConsensus.mostLikelyDown.probability,
        data.volumeBreakdown.total,
        data.metadata.totalMarketsFound,
        JSON.stringify(data),
      ]
    );
  } catch (error) {
    console.error('[Postgres] Failed to save snapshot:', error);
  }
}

/**
 * Save AI insights to database
 */
export async function saveAIInsights(insights: AIInsights): Promise<void> {
  const db = getPool();
  if (!db) return;
  
  try {
    await db.query(
      `INSERT INTO ai_insights (
        trigger_type, trigger_previous, trigger_current, trigger_percent_change,
        key_observations, sentiment, rationale, recommendation,
        suggested_strategies, corporate_risk_level, government_risk_level, confidence
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        insights.triggeredBy?.type || null,
        insights.triggeredBy?.previous || null,
        insights.triggeredBy?.current || null,
        insights.triggeredBy?.percentChange || null,
        insights.keyObservations,
        insights.tradingInsight.sentiment,
        insights.tradingInsight.rationale,
        insights.tradingInsight.recommendation,
        insights.tradingInsight.suggestedStrategies,
        insights.riskAssessment.corporateRisk.level,
        insights.riskAssessment.governmentRisk.level,
        insights.confidence,
      ]
    );
  } catch (error) {
    console.error('[Postgres] Failed to save insights:', error);
  }
}

/**
 * Get recent market snapshots
 */
export async function getRecentSnapshots(limit = 100): Promise<PolymarketData[]> {
  const rows = await query<{ raw_data: PolymarketData }>(
    'SELECT raw_data FROM market_snapshots ORDER BY timestamp DESC LIMIT $1',
    [limit]
  );
  
  return rows.map(r => r.raw_data);
}

/**
 * Get recent AI insights
 */
export async function getRecentInsights(limit = 50): Promise<AIInsights[]> {
  interface InsightRow {
    timestamp: Date;
    trigger_type: string | null;
    trigger_previous: number | null;
    trigger_current: number | null;
    trigger_percent_change: number | null;
    key_observations: string[];
    sentiment: string;
    rationale: string;
    recommendation: string;
    suggested_strategies: string[];
    corporate_risk_level: string;
    government_risk_level: string;
    confidence: number;
  }
  
  const rows = await query<InsightRow>(
    `SELECT * FROM ai_insights ORDER BY timestamp DESC LIMIT $1`,
    [limit]
  );
  
  return rows.map(r => ({
    generatedAt: r.timestamp.toISOString(),
    triggeredBy: r.trigger_type ? {
      type: r.trigger_type as 'PRICE_MOVE' | 'SENTIMENT_SHIFT' | 'PROBABILITY_CHANGE' | 'VOLUME_SPIKE',
      threshold: 0,
      previous: r.trigger_previous || 0,
      current: r.trigger_current || 0,
      percentChange: r.trigger_percent_change || 0,
      description: '',
    } : null,
    keyObservations: r.key_observations || [],
    tradingInsight: {
      sentiment: r.sentiment as 'BULLISH' | 'BEARISH' | 'NEUTRAL',
      rationale: r.rationale || '',
      recommendation: r.recommendation || '',
      suggestedStrategies: r.suggested_strategies || [],
    },
    riskAssessment: {
      corporateRisk: { level: r.corporate_risk_level || 'UNKNOWN', explanation: '' },
      governmentRisk: { level: r.government_risk_level || 'UNKNOWN', explanation: '' },
    },
    confidence: r.confidence || 0,
  }));
}

/**
 * Get the most recent snapshot
 */
export async function getLatestSnapshot(): Promise<PolymarketData | null> {
  const rows = await query<{ raw_data: PolymarketData }>(
    'SELECT raw_data FROM market_snapshots ORDER BY timestamp DESC LIMIT 1'
  );
  
  return rows[0]?.raw_data || null;
}

/**
 * Save BTC price to history
 */
export async function savePriceHistory(price: number): Promise<void> {
  const db = getPool();
  if (!db) return;
  
  try {
    await db.query(
      'INSERT INTO price_history (btc_price) VALUES ($1)',
      [price]
    );
  } catch (error) {
    console.error('[Postgres] Failed to save price:', error);
  }
}

/**
 * Close database pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
