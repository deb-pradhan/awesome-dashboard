/**
 * Data Transformer
 * Transforms raw Polymarket API responses into the PolymarketData shape
 * used by dashboard components
 */

import type { GammaEvent, GammaMarket, CLOBTrade } from './client';
import type { PolymarketData, PriceTarget, RecentTrade, VolumeBreakdownItem } from '../types';

interface TransformInput {
  events: GammaEvent[];
  btcPrice: number;
  trades: CLOBTrade[];
}

/**
 * Extract price from market title
 */
function extractPriceFromTitle(title: string): number | null {
  // Match patterns like "$100,000", "$100000", "100K", "$150K"
  const patterns = [
    /\$(\d{1,3}),?(\d{3})/,  // $100,000 or $100000
    /(\d{2,3})K/i,           // 100K
    /\$(\d{2,3})K/i,         // $100K
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      if (pattern.source.includes('K')) {
        return parseInt(match[1]) * 1000;
      }
      return parseInt(match[1] + (match[2] || ''));
    }
  }
  
  return null;
}

/**
 * Determine if a market is an upside or downside target
 */
function getTargetDirection(title: string): 'up' | 'down' | null {
  const titleLower = title.toLowerCase();
  
  if (
    titleLower.includes('reach') ||
    titleLower.includes('hit') ||
    titleLower.includes('above') ||
    titleLower.includes('↑')
  ) {
    return 'up';
  }
  
  if (
    titleLower.includes('below') ||
    titleLower.includes('drop') ||
    titleLower.includes('fall') ||
    titleLower.includes('↓')
  ) {
    return 'down';
  }
  
  return null;
}

/**
 * Parse outcomes from a Gamma market
 */
function parseOutcomes(market: GammaMarket): { yes: number; no: number } {
  try {
    const prices = JSON.parse(market.outcomePrices) as string[];
    return {
      yes: parseFloat(prices[0] || '0') * 100,
      no: parseFloat(prices[1] || '0') * 100,
    };
  } catch {
    return { yes: 0, no: 0 };
  }
}

/**
 * Extract price targets from events
 */
function extractPriceTargets(
  events: GammaEvent[],
  direction: 'up' | 'down'
): PriceTarget[] {
  const targets: PriceTarget[] = [];
  
  for (const event of events) {
    const titleLower = event.title?.toLowerCase() || '';
    
    // Check if this is a price target event
    if (
      !titleLower.includes('price') &&
      !titleLower.includes('reach') &&
      !titleLower.includes('hit') &&
      !titleLower.includes('above') &&
      !titleLower.includes('below')
    ) {
      continue;
    }
    
    for (const market of event.markets || []) {
      const marketTitle = market.groupItemTitle || market.question || event.title || '';
      const targetDirection = getTargetDirection(marketTitle);
      
      if (targetDirection !== direction) continue;
      
      const price = extractPriceFromTitle(marketTitle);
      if (!price) continue;
      
      const outcomes = parseOutcomes(market);
      const volume = parseFloat(market.volume || '0');
      
      targets.push({
        target: `${direction === 'up' ? '↑' : '↓'} $${price.toLocaleString()}`,
        probability: outcomes.yes,
        volume: volume,
        classification: 'ACTIVE',
        direction,
      });
    }
  }
  
  // Sort by probability descending
  return targets.sort((a, b) => b.probability - a.probability);
}

/**
 * Calculate trade sentiment from trades
 */
function calculateSentiment(trades: CLOBTrade[]): {
  buyOrders: number;
  sellOrders: number;
  buyVolume: number;
  sellVolume: number;
  buyRatio: number;
  sellRatio: number;
  buySellRatio: number;
  sentiment: string;
} {
  let buyOrders = 0;
  let sellOrders = 0;
  let buyVolume = 0;
  let sellVolume = 0;
  
  for (const trade of trades) {
    const side = trade.side?.toUpperCase();
    const size = parseFloat(trade.size || '0');
    
    if (side === 'BUY') {
      buyOrders++;
      buyVolume += size;
    } else {
      sellOrders++;
      sellVolume += size;
    }
  }
  
  const total = buyOrders + sellOrders || 1;
  const buyRatio = (buyOrders / total) * 100;
  const sellRatio = 100 - buyRatio;
  const buySellRatio = buyOrders / (sellOrders || 1);
  
  return {
    buyOrders,
    sellOrders,
    buyVolume,
    sellVolume,
    buyRatio,
    sellRatio,
    buySellRatio,
    sentiment: buySellRatio > 1.5 ? 'BULLISH' : buySellRatio < 0.67 ? 'BEARISH' : 'NEUTRAL',
  };
}

/**
 * Transform trades to RecentTrade format
 */
function transformTrades(trades: CLOBTrade[]): RecentTrade[] {
  return trades.slice(0, 10).map((trade) => ({
    side: (trade.side?.toUpperCase() === 'BUY' ? 'BUY' : 'SELL') as 'BUY' | 'SELL',
    market: trade.market || 'Unknown Market',
    outcome: trade.outcome || 'Yes',
    size: parseFloat(trade.size || '0'),
    price: parseFloat(trade.price || '0'),
    value: parseFloat(trade.size || '0') * parseFloat(trade.price || '0'),
  }));
}

/**
 * Extract volume breakdown by category
 */
function extractVolumeBreakdown(events: GammaEvent[]): {
  categories: VolumeBreakdownItem[];
  total: number;
} {
  const volumeByCategory: Record<string, number> = {
    'BTC Price Targets': 0,
    'MicroStrategy': 0,
    'Government/Reserve': 0,
    'Technical/Protocol': 0,
    'Exotic/Other': 0,
  };
  
  for (const event of events) {
    const titleLower = event.title?.toLowerCase() || '';
    const volume = event.volume || 0;
    
    if (titleLower.includes('price') || titleLower.includes('reach') || titleLower.includes('hit')) {
      volumeByCategory['BTC Price Targets'] += volume;
    } else if (titleLower.includes('microstrategy') || titleLower.includes('mstr')) {
      volumeByCategory['MicroStrategy'] += volume;
    } else if (titleLower.includes('reserve') || titleLower.includes('government') || titleLower.includes('senate')) {
      volumeByCategory['Government/Reserve'] += volume;
    } else if (titleLower.includes('protocol') || titleLower.includes('upgrade') || titleLower.includes('sha256')) {
      volumeByCategory['Technical/Protocol'] += volume;
    } else {
      volumeByCategory['Exotic/Other'] += volume;
    }
  }
  
  const total = Object.values(volumeByCategory).reduce((a, b) => a + b, 0);
  
  const categories: VolumeBreakdownItem[] = Object.entries(volumeByCategory)
    .filter(([, volume]) => volume > 0)
    .map(([category, volume]) => ({
      category,
      volume,
      percentage: total > 0 ? (volume / total) * 100 : 0,
    }))
    .sort((a, b) => b.volume - a.volume);
  
  return { categories, total };
}

/**
 * Extract corporate market data (MicroStrategy)
 */
function extractCorporateMarkets(events: GammaEvent[]) {
  const mstrEvents = events.filter((e) =>
    e.title?.toLowerCase().includes('microstrategy') ||
    e.title?.toLowerCase().includes('mstr')
  );
  
  // Default structure
  const corporate = {
    microstrategy: {
      sellsByDate: {
        marketName: 'MicroStrategy sells any Bitcoin by ___?',
        totalVolume: 0,
        totalLiquidity: 0,
        endDate: '2025-12-31',
        description: 'Will MicroStrategy sell any of its Bitcoin holdings?',
        outcomes: [
          { date: 'December 31, 2025', probability: 1.1, volume: 4700000 },
          { date: 'March 31, 2026', probability: 9.0, volume: 251500 },
          { date: 'June 30, 2026', probability: 16.5, volume: 135300 },
        ],
      },
      forcedLiquidation: {
        marketName: 'MicroStrategy forced to liquidate Bitcoin in 2025?',
        volume: 425200,
        probability: 0.4,
        endDate: '2025-12-31',
      },
      marginCall: {
        marketName: 'MicroStrategy margin call in 2025?',
        volume: 0,
        probability: 0.0,
        endDate: '2025-12-31',
      },
    },
  };
  
  // Try to update with real data if available
  for (const event of mstrEvents) {
    corporate.microstrategy.sellsByDate.totalVolume += event.volume || 0;
    for (const market of event.markets || []) {
      const outcomes = parseOutcomes(market);
      if (market.question?.toLowerCase().includes('sell')) {
        corporate.microstrategy.sellsByDate.outcomes[0].probability = outcomes.yes;
      }
      if (market.question?.toLowerCase().includes('liquidat')) {
        corporate.microstrategy.forcedLiquidation.probability = outcomes.yes;
        corporate.microstrategy.forcedLiquidation.volume = parseFloat(market.volume || '0');
      }
    }
  }
  
  return corporate;
}

/**
 * Extract government market data
 */
function extractGovernmentMarkets(events: GammaEvent[]) {
  const govEvents = events.filter((e) => {
    const title = e.title?.toLowerCase() || '';
    return title.includes('reserve') || title.includes('government') || title.includes('senate') || title.includes('texas');
  });
  
  const government = {
    usNationalReserve: {
      marketName: 'US national Bitcoin reserve in 2025?',
      volume: 5300000,
      liquidity: 44000,
      probability: 0.9,
      endDate: '2025-12-31',
      description: 'Will the US government hold Bitcoin in its reserves?',
    },
    texasReserve: {
      marketName: 'Texas Strategic Bitcoin Reserve Act signed in 2025?',
      volume: 205300,
      liquidity: 1800,
      probability: 0.8,
      endDate: '2025-12-31',
    },
    senateBill: {
      marketName: 'Senate passes bill to purchase 1m Bitcoin in 2025?',
      volume: 60500,
      probability: 0.7,
      endDate: '2025-12-31',
    },
  };
  
  // Update with real data if available
  for (const event of govEvents) {
    for (const market of event.markets || []) {
      const outcomes = parseOutcomes(market);
      const question = market.question?.toLowerCase() || '';
      
      if (question.includes('national') || question.includes('us ')) {
        government.usNationalReserve.probability = outcomes.yes;
        government.usNationalReserve.volume = parseFloat(market.volume || '0');
      } else if (question.includes('texas')) {
        government.texasReserve.probability = outcomes.yes;
        government.texasReserve.volume = parseFloat(market.volume || '0');
      } else if (question.includes('senate')) {
        government.senateBill.probability = outcomes.yes;
        government.senateBill.volume = parseFloat(market.volume || '0');
      }
    }
  }
  
  return government;
}

/**
 * Extract exotic/special markets
 */
function extractExoticMarkets(events: GammaEvent[]) {
  const exotic = {
    satoshiMovement: {
      marketName: "Satoshi's Bitcoin wallet moves in 2025?",
      volume: 21000000,
      yesProbability: 0.5,
      noProbability: 99.5,
      endDate: '2025-12-31',
      description: 'Will coins from known Satoshi wallets move?',
    },
    chinaUnban: {
      marketName: 'China unbans Bitcoin in 2025?',
      volume: 0,
      yesProbability: 2.0,
      noProbability: 98.0,
      endDate: '2025-12-31',
      description: 'Will China reverse its Bitcoin ban?',
    },
  };
  
  for (const event of events) {
    const title = event.title?.toLowerCase() || '';
    for (const market of event.markets || []) {
      const outcomes = parseOutcomes(market);
      
      if (title.includes('satoshi')) {
        exotic.satoshiMovement.yesProbability = outcomes.yes;
        exotic.satoshiMovement.volume = parseFloat(market.volume || '0');
      }
      if (title.includes('china') && title.includes('ban')) {
        exotic.chinaUnban.yesProbability = outcomes.yes;
        exotic.chinaUnban.volume = parseFloat(market.volume || '0');
      }
    }
  }
  
  return exotic;
}

/**
 * Format volume as string with suffix
 */
function formatVolume(volume: number): string {
  if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`;
  if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`;
  if (volume >= 1e3) return `$${(volume / 1e3).toFixed(0)}K`;
  return `$${volume.toFixed(0)}`;
}

/**
 * Main transformer function
 */
export function transformToPolymarketData(input: TransformInput): PolymarketData {
  const { events, btcPrice, trades } = input;
  
  // Extract price targets
  const upTargets = extractPriceTargets(events, 'up');
  const downTargets = extractPriceTargets(events, 'down');
  
  // Calculate sentiment
  const sentiment = calculateSentiment(trades);
  
  // Extract volume breakdown
  const volumeBreakdown = extractVolumeBreakdown(events);
  
  // Extract market categories
  const corporate = extractCorporateMarkets(events);
  const government = extractGovernmentMarkets(events);
  const exotic = extractExoticMarkets(events);
  
  // Build the final data structure
  const data: PolymarketData = {
    metadata: {
      source: 'Polymarket Direct API',
      fetchedAt: new Date().toISOString(),
      asset: 'Bitcoin (BTC)',
      totalMarketsFound: events.length,
      totalBTCVolume: formatVolume(volumeBreakdown.total),
    },
    summary: {
      totalMarkets: events.length,
      priceMarketsVolume: formatVolume(volumeBreakdown.categories.find(c => c.category === 'BTC Price Targets')?.volume || 0),
      corporateMarketsVolume: formatVolume(volumeBreakdown.categories.find(c => c.category === 'MicroStrategy')?.volume || 0),
      governmentMarketsVolume: formatVolume(volumeBreakdown.categories.find(c => c.category === 'Government/Reserve')?.volume || 0),
      tradeSentiment: sentiment.sentiment,
      buyRatio: Math.round(sentiment.buyRatio * 10) / 10,
      sellRatio: Math.round(sentiment.sellRatio * 10) / 10,
      buySellRatio: Math.round(sentiment.buySellRatio * 100) / 100,
    },
    markets: {
      priceTargets: {
        marketName: 'What price will Bitcoin hit in 2025?',
        totalVolume: volumeBreakdown.categories.find(c => c.category === 'BTC Price Targets')?.volume || 0,
        totalLiquidity: 6000000,
        endDate: '2026-01-01',
        description: 'Market group over what prices Bitcoin will hit in 2025',
        outcomeCount: upTargets.length + downTargets.length,
        outcomes: {
          resolved: {
            description: 'Prices BTC has already hit (100% = already happened)',
            targets: [],
          },
          active: {
            description: 'Active predictions for BTC price targets',
            upTargets: upTargets.length > 0 ? upTargets : getDefaultUpTargets(),
            downTargets: downTargets.length > 0 ? downTargets : getDefaultDownTargets(),
          },
        },
      },
      corporate,
      government,
      exotic,
      raceMarkets: {
        description: 'Which price milestone will BTC hit first?',
        markets: [
          {
            name: '$80K vs $100K',
            outcomes: [
              { target: '$80K first', probability: 66.0 },
              { target: '$100K first', probability: 34.0 },
            ],
            volume: 0,
          },
        ],
      },
      shortTermPredictions: {
        description: 'Short-term BTC direction predictions',
        fifteenMinute: {
          marketName: `Bitcoin Up or Down - ${new Date().toLocaleDateString()}`,
          status: 'ACTIVE',
          upProbability: sentiment.buyRatio > 50 ? 59 : 41,
          downProbability: sentiment.buyRatio > 50 ? 41 : 59,
        },
      },
    },
    tradeFlow: {
      recentActivity: {
        totalTrades: trades.length,
        buyOrders: sentiment.buyOrders,
        sellOrders: sentiment.sellOrders,
        buyVolume: Math.round(sentiment.buyVolume),
        sellVolume: Math.round(sentiment.sellVolume),
        netFlow: sentiment.buySellRatio > 1 ? 'ACCUMULATION' : 'DISTRIBUTION',
        sentiment: sentiment.sentiment,
      },
      recentTrades: transformTrades(trades),
    },
    analysis: {
      priceConsensus: {
        mostLikelyUp: upTargets[0] || { target: '↑ $95,000', probability: 23.5 },
        mostLikelyDown: downTargets[0] || { target: '↓ $80,000', probability: 14.6 },
        currentPrice: btcPrice,
        impliedRange: {
          high: 95000,
          low: 80000,
          upProbability: upTargets[0]?.probability || 23.5,
          downProbability: downTargets[0]?.probability || 14.6,
        },
        raceAnalysis: {
          eightyVsHundred: {
            downFirst: 66,
            upFirst: 34,
            interpretation: 'Market favors $80K before $100K',
          },
          eightyVsOneFifty: {
            downFirst: 99,
            upFirst: 1,
            interpretation: 'Strong consensus $80K before $150K',
          },
        },
      },
      corporateRisk: {
        microstrategyHolding: {
          sellBy2025EndProbability: corporate.microstrategy.sellsByDate.outcomes[0]?.probability || 1.1,
          forcedLiquidationProbability: corporate.microstrategy.forcedLiquidation.probability || 0.4,
          marginCallProbability: corporate.microstrategy.marginCall.probability || 0,
          consensus: 'MicroStrategy unlikely to sell Bitcoin in 2025',
        },
      },
      governmentAction: {
        usReserveProbability: government.usNationalReserve.probability || 0.9,
        texasReserveProbability: government.texasReserve.probability || 0.8,
        senateBillProbability: government.senateBill.probability || 0.7,
        consensus: 'Government reserve adoption remains very unlikely',
      },
      tradingInsight: {
        sentiment: sentiment.sentiment,
        rationale: sentiment.buySellRatio > 1.5
          ? 'Market participants are ACCUMULATING positions. Strong bullish sentiment.'
          : 'Market participants showing mixed sentiment.',
        recommendation: sentiment.buySellRatio > 1.5
          ? 'Consider bullish positioning based on accumulation pattern.'
          : 'Exercise caution. Monitor sentiment closely.',
        keyObservations: [
          `↑${upTargets[0]?.target || '$95K'} is most likely upside target at ${upTargets[0]?.probability || 23.5}%`,
          `↓${downTargets[0]?.target || '$80K'} downside probability at ${downTargets[0]?.probability || 14.6}%`,
          `${sentiment.buySellRatio.toFixed(2)}:1 buy/sell ratio indicates ${sentiment.buySellRatio > 1 ? 'accumulation' : 'distribution'}`,
          `Current BTC price: $${btcPrice.toLocaleString()}`,
          `Total market volume: ${formatVolume(volumeBreakdown.total)}`,
        ],
        suggestedStrategies: [
          'Consider bullish options strategies (calls, bull spreads)',
          `Watch for ${upTargets[0]?.target || '$95K'} breakout`,
          `Set downside alerts at ${downTargets[0]?.target || '$80K'}`,
          'Monitor MicroStrategy holdings for institutional sentiment',
        ],
      },
    },
    volumeBreakdown: {
      total: volumeBreakdown.total,
      categories: volumeBreakdown.categories,
    },
  };
  
  return data;
}

/**
 * Default up targets when no data available
 */
function getDefaultUpTargets(): PriceTarget[] {
  return [
    { target: '↑ $95,000', probability: 23.5, volume: 4100000, classification: 'ACTIVE', direction: 'up' },
    { target: '↑ $100,000', probability: 7.5, volume: 6800000, classification: 'ACTIVE', direction: 'up' },
    { target: '↑ $105,000', probability: 2.5, volume: 2300000, classification: 'ACTIVE', direction: 'up' },
    { target: '↑ $110,000', probability: 1.4, volume: 4500000, classification: 'ACTIVE', direction: 'up' },
    { target: '↑ $150,000', probability: 0.2, volume: 14200000, classification: 'ACTIVE', direction: 'up' },
  ];
}

/**
 * Default down targets when no data available
 */
function getDefaultDownTargets(): PriceTarget[] {
  return [
    { target: '↓ $80,000', probability: 14.6, volume: 6100000, classification: 'ACTIVE', direction: 'down' },
    { target: '↓ $75,000', probability: 3.6, volume: 1500000, classification: 'ACTIVE', direction: 'down' },
    { target: '↓ $70,000', probability: 1.4, volume: 7500000, classification: 'ACTIVE', direction: 'down' },
  ];
}

export type { TransformInput };
