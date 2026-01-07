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

// Polymarket Types - Updated for comprehensive data structure
export interface PriceTarget {
  target: string;
  probability: number;
  volume: number;
  classification?: string;
  direction?: 'up' | 'down';
  status?: string;
  note?: string;
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
  status?: string;
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
  side: 'BUY' | 'SELL';
  market: string;
  outcome: string;
  size: number;
  price: number;
  value?: number;
}

export interface VolumeBreakdownItem {
  category: string;
  volume: number;
  percentage: number;
}

// Daily predictions
export interface DailyPriceAboveOutcome {
  threshold: number;
  yesProbability: number;
  status: string;
}

export interface DailyPriceRangeOutcome {
  range: string;
  probability: number;
}

export interface DailyUpOrDown {
  marketName: string;
  status: string;
  upProbability: number;
  downProbability: number;
}

// Short term predictions
export interface ShortTermMarket {
  marketName: string;
  status: string;
  upProbability: number;
  downProbability: number;
  description?: string;
}

// Race to price markets
export interface RaceMarket {
  marketName: string;
  volume: number;
  outcomes: {
    option1: { target: string; probability: number };
    option2: { target: string; probability: number };
  };
  description: string;
}

// ATH predictions
export interface ATHOutcome {
  deadline: string;
  yesProbability: number;
}

// Technical markets
export interface TechnicalOutcome {
  outcome: string;
  yesProbability: number;
}

export interface TechnicalMarket {
  marketName: string;
  volume: number;
  endDate: string;
  outcomes?: TechnicalOutcome[];
  yesProbability?: number;
  noProbability?: number;
  description: string;
}

// Comparison markets
export interface ComparisonMarket {
  marketName: string;
  volume?: number;
  yesProbability: number;
  noProbability: number;
  endDate?: string;
  status?: string;
  description: string;
}

// Exotic markets
export interface ExoticMarket {
  marketName: string;
  volume?: number;
  yesProbability: number;
  noProbability: number;
  endDate?: string;
  status?: string;
  description: string;
}

// MicroStrategy sell deadline outcome
export interface MicroStrategySellOutcome {
  date: string;
  probability: number;
  volume: number;
  note?: string;
}

// Weekly purchase market
export interface WeeklyPurchaseMarket {
  marketName: string;
  probability: number;
  volume: number;
  endDate: string;
  note?: string;
}

// Generic market with probability
export interface SimpleMarket {
  marketName: string;
  volume: number;
  probability: number;
  endDate: string;
  liquidity?: number;
  description?: string;
}

// Government market outcome
export interface GovernmentMarket {
  marketName: string;
  volume: number;
  liquidity?: number;
  probability: number;
  endDate: string;
  description?: string;
}

// Race market outcome
export interface RaceOutcome {
  target: string;
  probability: number;
}

// Race market
export interface RaceMarketNew {
  name: string;
  outcomes: RaceOutcome[];
  volume: number;
  note?: string;
}

// ATH outcome
export interface ATHOutcomeNew {
  date: string;
  probability: number;
  volume: number;
}

// Daily direction market
export interface DailyDirectionMarket {
  marketName: string;
  endDate: string;
  up: number;
  down: number;
  volume: number;
  note?: string;
}

// Daily price level
export interface DailyPriceLevelOutcome {
  level: string;
  probability: number;
  status: string;
}

// Daily price bracket
export interface DailyPriceBracketOutcome {
  range: string;
  probability: number;
}

// Short term prediction market
export interface ShortTermPredictionMarket {
  marketName: string;
  up: number;
  down: number;
  volume: number;
  trades: number;
}

// BTC vs assets comparison
export interface BTCVsAssetsMarket {
  marketName: string;
  volume: number;
  btcOutperforms: number;
  goldOutperforms: number;
  sp500Outperforms: number;
  note?: string;
}

// Fed rate outcome
export interface FedRateOutcome {
  cuts?: string;
  rate?: string;
  meeting?: string;
  probability: number;
  volume: number;
}

// Ethereum price target outcome
export interface EthPriceTargetOutcome {
  target: string;
  probability: number;
  volume: number;
}

// Ethereum ATH outcome
export interface EthATHOutcome {
  date: string;
  probability: number;
  volume: number;
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
    technicalMarketsVolume?: string;
    miscMarketsVolume?: string;
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
    weeklyPriceTargets?: {
      marketName: string;
      totalVolume: number;
      endDate: string;
      description: string;
      outcomes: {
        upTargets: PriceTarget[];
        downTargets: PriceTarget[];
      };
    };
    dailyPriceLevel?: {
      marketName: string;
      endDate: string;
      levels: DailyPriceLevelOutcome[];
    };
    dailyDirection?: DailyDirectionMarket;
    dailyPriceBracket?: {
      marketName: string;
      endDate: string;
      brackets: DailyPriceBracketOutcome[];
    };
    shortTermPredictions?: {
      description: string;
      fifteenMinute?: ShortTermPredictionMarket;
      hourly?: ShortTermPredictionMarket;
      daily?: ShortTermPredictionMarket;
    };
    raceToPrice?: {
      description: string;
      markets: RaceMarketNew[];
    };
    raceMarkets?: {
      description: string;
      markets: RaceMarketNew[];
    };
    athTargets?: {
      marketName: string;
      totalVolume: number;
      endDate: string;
      outcomes: ATHOutcomeNew[];
    };
    whenWillBTCHit?: {
      marketName: string;
      totalVolume: number;
      outcomes: ATHOutcomeNew[];
    };
    corporate: {
      microstrategy: {
        sellsByDate: {
          marketName: string;
          totalVolume: number;
          totalLiquidity: number;
          endDate: string;
          description: string;
          outcomes: MicroStrategySellOutcome[];
        };
        weeklyPurchase?: WeeklyPurchaseMarket;
        forcedLiquidation: SimpleMarket;
        marginCall: SimpleMarket;
      };
    };
    government: {
      usNationalReserve: GovernmentMarket;
      texasReserve: GovernmentMarket;
      senateBill: GovernmentMarket;
      elSalvador?: GovernmentMarket;
    };
    technical?: {
      sha256Replacement?: {
        marketName: string;
        volume: number;
        yesProbability: number;
        endDate: string;
        description: string;
      };
    };
    comparison?: {
      btcVsGold?: BTCVsAssetsMarket;
    };
    exotic?: {
      satoshiMovement?: {
        marketName: string;
        volume: number;
        yesProbability: number;
        endDate: string;
        description: string;
      };
      chinaUnban?: {
        marketName: string;
        volume: number;
        yesProbability: number;
        endDate: string;
        description: string;
      };
      sha256Replacement?: {
        marketName: string;
        volume: number;
        yesProbability: number;
        endDate: string;
        description: string;
      };
    };
  };
  tradeFlow: {
    recentActivity: {
      totalTrades: number;
      buyOrders: number;
      sellOrders: number;
      buyVolume: number;
      sellVolume: number;
      netFlow: string;
      sentiment: string;
    };
    recentTrades: RecentTrade[];
  };
  analysis: {
    priceConsensus: {
      mostLikelyUp: {
        target: string;
        probability: number;
      };
      mostLikelyDown: {
        target: string;
        probability: number;
      };
      currentPrice: number;
      impliedRange: {
        high: number;
        low: number;
        upProbability: number;
        downProbability: number;
        confidence?: string;
      };
      raceAnalysis?: {
        eightyVsHundred?: {
          downFirst: number;
          upFirst: number;
          interpretation: string;
        };
        eightyVsOneFifty?: {
          downFirst: number;
          upFirst: number;
          interpretation: string;
        };
      };
    };
    tradingInsight: {
      overallSentiment?: string;
      sentiment?: string;
      rationale: string;
      recommendation: string;
      buyRatio?: number;
      sellRatio?: number;
      buySellRatio?: number;
      keyObservations?: string[];
      suggestedStrategies: string[];
    };
    keyObservations?: string[];
    exoticRisks?: {
      satoshiMovement: number;
      chinaUnban: number;
      sha256Replacement?: number;
      consensus: string;
    };
    technicalUpgrades?: {
      sha256Replacement: number;
      consensus: string;
    };
  };
  volumeBreakdown: {
    categories: VolumeBreakdownItem[];
    total: number;
  };
  fedRates?: {
    summary: string;
    totalVolume: number;
    markets: {
      cutCount2026?: {
        marketName: string;
        volume: number;
        outcomes: FedRateOutcome[];
      };
      rateTarget?: {
        marketName: string;
        volume: number;
        outcomes: FedRateOutcome[];
      };
      cutTiming?: {
        marketName: string;
        volume: number;
        outcomes: FedRateOutcome[];
      };
      hikeRisk?: {
        marketName: string;
        probability: number;
        volume: number;
      };
      emergencyCut?: {
        marketName: string;
        probability: number;
        volume: number;
      };
    };
  };
  ethereum?: {
    summary: string;
    totalVolume: number;
    markets: {
      priceTargets?: {
        marketName: string;
        volume: number;
        outcomes: EthPriceTargetOutcome[];
      };
      goldVsEth5K?: {
        marketName: string;
        volume: number;
        goldFirst: number;
        ethFirst: number;
        note?: string;
      };
      athTiming?: {
        marketName: string;
        volume: number;
        outcomes: EthATHOutcome[];
      };
    };
  };
}
