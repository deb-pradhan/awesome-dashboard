// BTC Dashboard Types
export interface PriceDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface RSIDataPoint {
  date: string;
  rsi: number;
}

export interface StochDataPoint {
  date: string;
  k: number;
  d: number;
}

export interface BollingerDataPoint {
  date: string;
  close: number;
  upper: number;
  middle: number;
  lower: number;
}

export interface FundingRateDataPoint {
  date: string;
  binance: number;
  bybit: number;
}

export interface OpenInterestDataPoint {
  date: string;
  binance: number;
  bybit: number;
}

export interface TokenRatingScore {
  metric: string;
  value: number;
  max: number;
}

export interface ATRDataPoint {
  date: string;
  atr: number;
}

export interface OBVDataPoint {
  date: string;
  obv: number;
}

export interface RatingHistoryPoint {
  date: string;
  rating: number;
}

export interface KeyLevel {
  level: string;
  price: string;
  basis: string;
}

export interface BTCDashboardData {
  priceData: PriceDataPoint[];
  rsiData: RSIDataPoint[];
  stochData: StochDataPoint[];
  bollingerData: BollingerDataPoint[];
  fundingRateData: FundingRateDataPoint[];
  openInterestData: OpenInterestDataPoint[];
  tokenRatingScores: TokenRatingScore[];
  atrData: ATRDataPoint[];
  obvData: OBVDataPoint[];
  ratingHistory: RatingHistoryPoint[];
  keyLevels: KeyLevel[];
  currentPrice: number;
  markPrice: number;
  high24h: number;
  low24h: number;
  fundingBinance: number;
  fundingBybit: number;
  lastUpdated: string;
}

// Polymarket Types - Updated for new data structure
export interface PriceTarget {
  target: string;
  probability: number;
  volume: number;
  classification?: string;
  direction: 'up' | 'down';
}

export interface ResolvedTarget {
  target: string;
  probability: number;
  volume: number;
  status: string;
  note: string;
}

export interface MicroStrategyDeadline {
  deadline: string;
  yesProbability: number;
  noProbability: number;
  volume: number;
}

export interface MarketOutcome {
  marketName: string;
  volume: number;
  liquidity: number | null;
  endDate: string;
  yesProbability: number;
  noProbability: number;
  description: string;
}

export interface ActiveMarketTrade {
  market: string;
  trades: number;
  buys: number;
  sells: number;
  volume: number;
  sentiment: string;
  outcomeFlow?: Record<string, { buys: number; sells: number }>;
}

export interface RecentTrade {
  type: 'BUY' | 'SELL';
  market: string;
  outcome: string;
  size: number;
  price: number;
  value: number;
}

export interface VolumeBreakdownItem {
  category: string;
  volume: number;
  percentage: number;
}

export interface PolymarketData {
  metadata: {
    source: string;
    fetchedAt: string;
    asset: string;
    totalMarketsFound: number;
    totalBTCVolume: string;
  };
  summary: {
    totalMarkets: number;
    priceMarketsVolume: string;
    corporateMarketsVolume: string;
    governmentMarketsVolume: string;
    tradeSentiment: string;
    buyRatio: number;
    sellRatio: number;
    buySellRatio: number;
  };
  markets: {
    priceTargets: {
      marketName: string;
      totalVolume: number;
      totalLiquidity: number;
      endDate: string;
      description: string;
      outcomeCount: number;
      outcomes: {
        resolved: {
          description: string;
          targets: ResolvedTarget[];
        };
        active: {
          description: string;
          upTargets: PriceTarget[];
          downTargets: PriceTarget[];
        };
      };
    };
    corporate: {
      microstrategy: {
        sellsByDate: {
          marketName: string;
          totalVolume: number;
          totalLiquidity: number;
          endDate: string;
          description: string;
          outcomes: MicroStrategyDeadline[];
        };
        forcedLiquidation: MarketOutcome;
        marginCall: MarketOutcome;
      };
    };
    government: {
      usNationalReserve: MarketOutcome;
      texasReserve: MarketOutcome;
      senateBill: MarketOutcome;
    };
  };
  tradeFlow: {
    summary: {
      totalTradesAnalyzed: number;
      sentiment: string;
      buyOrders: number;
      sellOrders: number;
      buyPercentage: number;
      sellPercentage: number;
      buyVolume: number;
      sellVolume: number;
      buySellRatio: number;
    };
    activeMarkets: ActiveMarketTrade[];
    recentTrades: RecentTrade[];
  };
  analysis: {
    priceConsensus: {
      mostLikely: {
        upTarget: string;
        upProbability: number;
        downTarget: string;
        downProbability: number;
      };
      currentPrice: number;
      impliedRange: {
        high: number;
        low: number;
        confidence: string;
      };
    };
    corporateRisk: {
      microstrategyHolding: {
        sellBy2025EndProbability: number;
        forcedLiquidationProbability: number;
        marginCallProbability: number;
        consensus: string;
      };
    };
    governmentAction: {
      usReserveProbability: number;
      texasReserveProbability: number;
      senateBillProbability: number;
      consensus: string;
    };
    tradingInsight: {
      sentiment: string;
      rationale: string;
      recommendation: string;
      suggestedStrategies: string[];
    };
  };
  volumeBreakdown: {
    byCategory: VolumeBreakdownItem[];
    total: number;
  };
}
