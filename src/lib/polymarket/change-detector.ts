/**
 * Change Detector
 * Detects significant market changes that should trigger AI insight regeneration
 */

import type { PolymarketData } from '../types';

export interface SignificantChangeEvent {
  type: 'PRICE_MOVE' | 'SENTIMENT_SHIFT' | 'PROBABILITY_CHANGE' | 'VOLUME_SPIKE';
  threshold: number;
  previous: number;
  current: number;
  percentChange: number;
  description: string;
}

// Thresholds for triggering AI updates
const TRIGGERS = {
  PRICE_MOVE: 0.02,           // BTC price moves > 2%
  SENTIMENT_SHIFT: 0.15,      // Buy/sell ratio changes > 15%
  PROBABILITY_CHANGE: 0.10,   // Any market probability changes > 10%
  VOLUME_SPIKE: 2.0,          // Volume > 2x previous
};

/**
 * Compare two data snapshots and detect significant changes
 */
export function detectChanges(
  current: PolymarketData,
  previous: PolymarketData | null
): SignificantChangeEvent[] {
  const changes: SignificantChangeEvent[] = [];
  
  if (!previous) {
    // No previous data, consider this a new session
    return [];
  }
  
  // Check BTC price movement
  const currentPrice = current.analysis.priceConsensus.currentPrice;
  const previousPrice = previous.analysis.priceConsensus.currentPrice;
  const priceChange = Math.abs((currentPrice - previousPrice) / previousPrice);
  
  if (priceChange > TRIGGERS.PRICE_MOVE) {
    changes.push({
      type: 'PRICE_MOVE',
      threshold: TRIGGERS.PRICE_MOVE,
      previous: previousPrice,
      current: currentPrice,
      percentChange: priceChange * 100,
      description: `BTC price moved ${(priceChange * 100).toFixed(2)}% from $${previousPrice.toLocaleString()} to $${currentPrice.toLocaleString()}`,
    });
  }
  
  // Check sentiment shift
  const currentRatio = current.summary.buySellRatio;
  const previousRatio = previous.summary.buySellRatio;
  const ratioChange = Math.abs((currentRatio - previousRatio) / previousRatio);
  
  if (ratioChange > TRIGGERS.SENTIMENT_SHIFT) {
    changes.push({
      type: 'SENTIMENT_SHIFT',
      threshold: TRIGGERS.SENTIMENT_SHIFT,
      previous: previousRatio,
      current: currentRatio,
      percentChange: ratioChange * 100,
      description: `Buy/sell ratio shifted ${(ratioChange * 100).toFixed(1)}% from ${previousRatio.toFixed(2)} to ${currentRatio.toFixed(2)}`,
    });
  }
  
  // Check probability changes for top targets
  const currentUpProb = current.analysis.priceConsensus.mostLikelyUp.probability;
  const previousUpProb = previous.analysis.priceConsensus.mostLikelyUp.probability;
  const upProbChange = Math.abs(currentUpProb - previousUpProb);
  
  if (upProbChange > TRIGGERS.PROBABILITY_CHANGE * 100) {
    changes.push({
      type: 'PROBABILITY_CHANGE',
      threshold: TRIGGERS.PROBABILITY_CHANGE,
      previous: previousUpProb,
      current: currentUpProb,
      percentChange: upProbChange,
      description: `Top upside probability changed ${upProbChange.toFixed(1)}pp from ${previousUpProb.toFixed(1)}% to ${currentUpProb.toFixed(1)}%`,
    });
  }
  
  const currentDownProb = current.analysis.priceConsensus.mostLikelyDown.probability;
  const previousDownProb = previous.analysis.priceConsensus.mostLikelyDown.probability;
  const downProbChange = Math.abs(currentDownProb - previousDownProb);
  
  if (downProbChange > TRIGGERS.PROBABILITY_CHANGE * 100) {
    changes.push({
      type: 'PROBABILITY_CHANGE',
      threshold: TRIGGERS.PROBABILITY_CHANGE,
      previous: previousDownProb,
      current: currentDownProb,
      percentChange: downProbChange,
      description: `Top downside probability changed ${downProbChange.toFixed(1)}pp from ${previousDownProb.toFixed(1)}% to ${currentDownProb.toFixed(1)}%`,
    });
  }
  
  // Check volume spike
  const currentVolume = current.volumeBreakdown.total;
  const previousVolume = previous.volumeBreakdown.total;
  const volumeRatio = currentVolume / (previousVolume || 1);
  
  if (volumeRatio > TRIGGERS.VOLUME_SPIKE) {
    changes.push({
      type: 'VOLUME_SPIKE',
      threshold: TRIGGERS.VOLUME_SPIKE,
      previous: previousVolume,
      current: currentVolume,
      percentChange: (volumeRatio - 1) * 100,
      description: `Volume spiked ${volumeRatio.toFixed(1)}x from $${(previousVolume / 1e6).toFixed(1)}M to $${(currentVolume / 1e6).toFixed(1)}M`,
    });
  }
  
  return changes;
}

/**
 * Check if any significant change occurred
 */
export function hasSignificantChange(
  current: PolymarketData,
  previous: PolymarketData | null
): boolean {
  const changes = detectChanges(current, previous);
  return changes.length > 0;
}

/**
 * Get the most significant change (for AI prompt context)
 */
export function getMostSignificantChange(
  current: PolymarketData,
  previous: PolymarketData | null
): SignificantChangeEvent | null {
  const changes = detectChanges(current, previous);
  
  if (changes.length === 0) return null;
  
  // Priority: PRICE_MOVE > VOLUME_SPIKE > SENTIMENT_SHIFT > PROBABILITY_CHANGE
  const priority = ['PRICE_MOVE', 'VOLUME_SPIKE', 'SENTIMENT_SHIFT', 'PROBABILITY_CHANGE'];
  
  for (const type of priority) {
    const change = changes.find(c => c.type === type);
    if (change) return change;
  }
  
  return changes[0];
}

/**
 * Format changes for logging
 */
export function formatChangesForLog(changes: SignificantChangeEvent[]): string {
  if (changes.length === 0) return 'No significant changes detected';
  
  return changes.map(c => `[${c.type}] ${c.description}`).join('\n');
}

export { TRIGGERS };
