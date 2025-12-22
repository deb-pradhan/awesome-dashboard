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

// Polymarket Types
export interface PriceTarget {
  target: string;
  probability: number;
  volume: number;
  type: 'up' | 'down';
}

export interface DailyMarket {
  market: string;
  yes: number;
  no: number;
}

export interface MacroMarket {
  market: string;
  yes: number;
  no: number;
  volume: number;
}

export interface TradeFlowItem {
  market: string;
  buys: number;
  sells: number;
  volume: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

export interface ArbitrageOpportunity {
  market: string;
  polymarket: { yes: number; no: number };
  implied: { yes: number; no: number };
  spread: number;
  type: string;
}

export interface VolumeCategory {
  category: string;
  volume: number;
}

export interface PolymarketData {
  btcPriceTargets: PriceTarget[];
  ethPriceTargets: PriceTarget[];
  dailyBTCMarkets: DailyMarket[];
  macroMarkets: MacroMarket[];
  tradeFlowData: TradeFlowItem[];
  arbitrageOpportunities: ArbitrageOpportunity[];
  volumeDistribution: VolumeCategory[];
  btcTradeFlow: { buys: number; sells: number; buyVolume: number; sellVolume: number };
  ethTradeFlow: { buys: number; sells: number };
  lastUpdated: string;
}

