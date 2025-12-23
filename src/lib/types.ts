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
  value: number;
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
    dailyPredictions?: {
      [key: string]: {
        priceAbove?: {
          marketName: string;
          status: string;
          outcomes: DailyPriceAboveOutcome[];
        };
        priceRange?: {
          marketName: string;
          status: string;
          outcomes: DailyPriceRangeOutcome[];
        };
        upOrDown?: DailyUpOrDown;
      };
    };
    shortTermPredictions?: {
      fifteenMinute?: ShortTermMarket;
      hourly?: ShortTermMarket[];
    };
    raceToPrice?: {
      markets: RaceMarket[];
    };
    athPredictions?: {
      marketName: string;
      volume: number;
      description: string;
      outcomes: ATHOutcome[];
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
        purchaseAnnouncement?: {
          marketName: string;
          status: string;
          yesProbability: number;
          noProbability: number;
          description: string;
        };
        largePurchase?: {
          marketName: string;
          status: string;
          yesProbability: number;
          noProbability: number;
          description: string;
        };
      };
    };
    government: {
      usNationalReserve: MarketOutcome;
      texasReserve: MarketOutcome;
      senateBill: MarketOutcome;
      trumpTaxExemption?: {
        marketName: string;
        volume: number;
        yesProbability: number;
        noProbability: number;
        description: string;
      };
    };
    technical?: {
      opCtvOpCat?: TechnicalMarket;
      sha256Replacement?: TechnicalMarket;
    };
    comparison?: {
      outperformGold?: ComparisonMarket;
      outperformSP500Dec?: ComparisonMarket;
      moreValuableThanCompany?: ComparisonMarket;
    };
    exotic?: {
      satoshiMovement?: ExoticMarket;
      chinaUnban?: ExoticMarket;
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
    corporateRisk: {
      microstrategyHolding: {
        sellBy2025EndProbability: number;
        forcedLiquidationProbability: number;
        marginCallProbability: number;
        weeklyPurchaseProbability?: number;
        largePurchaseProbability?: number;
        consensus: string;
      };
    };
    governmentAction: {
      usReserveProbability: number;
      texasReserveProbability: number;
      senateBillProbability: number;
      trumpTaxExemptionProbability?: number;
      consensus: string;
    };
    technicalUpgrades?: {
      opCtvProbability: number;
      opCatProbability: number;
      sha256ReplacementProbability: number;
      consensus: string;
    };
    comparativePerformance?: {
      vsGold2025: number;
      vsSP500December: number;
      vsLargestCompany: number;
      consensus: string;
    };
    exoticRisks?: {
      satoshiMovement: number;
      chinaUnban: number;
      consensus: string;
    };
    tradingInsight: {
      sentiment: string;
      rationale: string;
      recommendation: string;
      keyObservations?: string[];
      suggestedStrategies: string[];
    };
  };
  volumeBreakdown: {
    byCategory: VolumeBreakdownItem[];
    total: number;
  };
}
