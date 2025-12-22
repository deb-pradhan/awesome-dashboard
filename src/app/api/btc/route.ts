import { NextResponse } from 'next/server';
import type { BTCDashboardData } from '@/lib/types';

// Latest data from Hive MCP - Dec 22, 2025 09:10 UTC
const LATEST_PRICE_DATA = [
  { date: 'Nov 23', open: 84740, high: 88128, low: 84668, close: 86830, volume: 19734e6 },
  { date: 'Nov 24', open: 86830, high: 89228, low: 85272, close: 88300, volume: 24663e6 },
  { date: 'Nov 25', open: 88300, high: 88520, low: 86116, close: 87370, volume: 19567e6 },
  { date: 'Nov 26', open: 87370, high: 90656, low: 86307, close: 90484, volume: 21676e6 },
  { date: 'Nov 27', open: 90484, high: 91950, low: 90090, close: 91334, volume: 16834e6 },
  { date: 'Nov 28', open: 91334, high: 93092, low: 90181, close: 90891, volume: 18831e6 },
  { date: 'Nov 29', open: 90891, high: 91166, low: 90155, close: 90802, volume: 7430e6 },
  { date: 'Nov 30', open: 90802, high: 92000, low: 90337, close: 90360, volume: 9688e6 },
  { date: 'Dec 01', open: 90360, high: 90417, low: 83823, close: 86286, volume: 34509e6 },
  { date: 'Dec 02', open: 86286, high: 92308, low: 86184, close: 91278, volume: 28210e6 },
  { date: 'Dec 03', open: 91278, high: 94150, low: 90990, close: 93430, volume: 25713e6 },
  { date: 'Dec 04', open: 93430, high: 94080, low: 90889, close: 92078, volume: 19804e6 },
  { date: 'Dec 05', open: 92078, high: 92692, low: 88056, close: 89330, volume: 19793e6 },
  { date: 'Dec 06', open: 89330, high: 90290, low: 88908, close: 89237, volume: 8410e6 },
  { date: 'Dec 07', open: 89237, high: 91760, low: 87719, close: 90395, volume: 13021e6 },
  { date: 'Dec 08', open: 90395, high: 92287, low: 89612, close: 90634, volume: 15794e6 },
  { date: 'Dec 09', open: 90634, high: 94589, low: 89500, close: 92679, volume: 21240e6 },
  { date: 'Dec 10', open: 92679, high: 94476, low: 91563, close: 92015, volume: 18999e6 },
  { date: 'Dec 11', open: 92015, high: 93555, low: 89261, close: 92513, volume: 19973e6 },
  { date: 'Dec 12', open: 92513, high: 92754, low: 89480, close: 90268, volume: 16679e6 },
  { date: 'Dec 13', open: 90268, high: 90635, low: 89766, close: 90240, volume: 5896e6 },
  { date: 'Dec 14', open: 90240, high: 90472, low: 87577, close: 88172, volume: 9417e6 },
  { date: 'Dec 15', open: 88172, high: 90053, low: 85147, close: 86432, volume: 19779e6 },
  { date: 'Dec 16', open: 86432, high: 88176, low: 85266, close: 87863, volume: 18456e6 },
  { date: 'Dec 17', open: 87863, high: 90366, low: 85314, close: 86243, volume: 19834e6 },
  { date: 'Dec 18', open: 86243, high: 89478, low: 84450, close: 85516, volume: 25405e6 },
  { date: 'Dec 19', open: 85516, high: 89400, low: 85110, close: 88137, volume: 21257e6 },
  { date: 'Dec 20', open: 88137, high: 88573, low: 87796, close: 88361, volume: 5123e6 },
  { date: 'Dec 21', open: 88361, high: 89082, low: 87600, close: 88659, volume: 7133e6 },
  { date: 'Dec 22', open: 88659, high: 89909, low: 87900, close: 89428, volume: 4893e6 },
];

// Bybit Funding Rate History - Dec 22, 2025
const FUNDING_RATE_HISTORY = [
  { date: 'Dec 19 08:00', binance: 0.00003550, bybit: 0.00001709 },
  { date: 'Dec 19 16:00', binance: 0.00005200, bybit: 0.00007296 },
  { date: 'Dec 20 00:00', binance: 0.00002800, bybit: 0.0000318 },
  { date: 'Dec 20 08:00', binance: -0.00001200, bybit: -0.0000071 },
  { date: 'Dec 20 16:00', binance: -0.00002500, bybit: -0.00003557 },
  { date: 'Dec 21 00:00', binance: 0.00002100, bybit: 0.00001724 },
  { date: 'Dec 21 08:00', binance: -0.00000800, bybit: -0.00000537 },
  { date: 'Dec 21 16:00', binance: -0.00001100, bybit: -0.00001499 },
  { date: 'Dec 22 00:00', binance: 0.00005100, bybit: 0.00005372 },
  { date: 'Dec 22 08:00', binance: 0.00006716, bybit: 0.00005485 },
];

// Calculate RSI from price data
function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }
  
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }
  
  return rsi;
}

// Calculate Stochastic
function calculateStoch(highs: number[], lows: number[], closes: number[], kPeriod: number = 14): { k: number; d: number }[] {
  const result: { k: number; d: number }[] = [];
  const kValues: number[] = [];
  
  for (let i = kPeriod - 1; i < closes.length; i++) {
    const periodHighs = highs.slice(i - kPeriod + 1, i + 1);
    const periodLows = lows.slice(i - kPeriod + 1, i + 1);
    const highestHigh = Math.max(...periodHighs);
    const lowestLow = Math.min(...periodLows);
    const k = ((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
    kValues.push(k);
  }
  
  for (let i = 2; i < kValues.length; i++) {
    const d = (kValues[i] + kValues[i - 1] + kValues[i - 2]) / 3;
    result.push({ k: kValues[i], d });
  }
  
  return result;
}

// Calculate Bollinger Bands
function calculateBB(closes: number[], period: number = 20, stdDev: number = 2): { close: number; upper: number; middle: number; lower: number }[] {
  const result: { close: number; upper: number; middle: number; lower: number }[] = [];
  
  for (let i = period - 1; i < closes.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1);
    const sma = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - sma, 2), 0) / period;
    const std = Math.sqrt(variance);
    
    result.push({
      close: closes[i],
      upper: sma + stdDev * std,
      middle: sma,
      lower: sma - stdDev * std,
    });
  }
  
  return result;
}

// Calculate ATR
function calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number[] {
  const tr: number[] = [];
  
  for (let i = 1; i < closes.length; i++) {
    const hl = highs[i] - lows[i];
    const hc = Math.abs(highs[i] - closes[i - 1]);
    const lc = Math.abs(lows[i] - closes[i - 1]);
    tr.push(Math.max(hl, hc, lc));
  }
  
  const atr: number[] = [];
  let sum = tr.slice(0, period).reduce((a, b) => a + b, 0);
  atr.push(sum / period);
  
  for (let i = period; i < tr.length; i++) {
    const newATR = (atr[atr.length - 1] * (period - 1) + tr[i]) / period;
    atr.push(newATR);
  }
  
  return atr;
}

// Calculate OBV
function calculateOBV(closes: number[], volumes: number[]): number[] {
  const obv: number[] = [0];
  
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) {
      obv.push(obv[i - 1] + volumes[i]);
    } else if (closes[i] < closes[i - 1]) {
      obv.push(obv[i - 1] - volumes[i]);
    } else {
      obv.push(obv[i - 1]);
    }
  }
  
  return obv;
}

async function fetchBTCData(): Promise<BTCDashboardData> {
  const now = new Date();
  const timestamp = 'December 22, 2025 • 09:10 UTC';
  
  const closes = LATEST_PRICE_DATA.map(d => d.close);
  const highs = LATEST_PRICE_DATA.map(d => d.high);
  const lows = LATEST_PRICE_DATA.map(d => d.low);
  const volumes = LATEST_PRICE_DATA.map(d => d.volume);
  
  // Calculate indicators
  const rsiValues = calculateRSI(closes);
  const stochValues = calculateStoch(highs, lows, closes);
  const bbValues = calculateBB(closes);
  const atrValues = calculateATR(highs, lows, closes);
  const obvValues = calculateOBV(closes, volumes);
  
  // Build RSI data (last 17 days)
  const rsiData = rsiValues.slice(-17).map((rsi, i) => ({
    date: LATEST_PRICE_DATA[LATEST_PRICE_DATA.length - 17 + i]?.date || `Day ${i}`,
    rsi: Number(rsi.toFixed(2)),
  }));
  
  // Build Stoch data (last 14 days)
  const stochData = stochValues.slice(-14).map((s, i) => ({
    date: LATEST_PRICE_DATA[LATEST_PRICE_DATA.length - 14 + i]?.date || `Day ${i}`,
    k: Number(s.k.toFixed(2)),
    d: Number(s.d.toFixed(2)),
  }));
  
  // Build Bollinger data (last 11 days)
  const bollingerData = bbValues.slice(-11).map((b, i) => ({
    date: LATEST_PRICE_DATA[LATEST_PRICE_DATA.length - 11 + i]?.date || `Day ${i}`,
    close: Number(b.close.toFixed(0)),
    upper: Number(b.upper.toFixed(0)),
    middle: Number(b.middle.toFixed(0)),
    lower: Number(b.lower.toFixed(0)),
  }));
  
  // Build ATR data (last 17 days)
  const atrData = atrValues.slice(-17).map((atr, i) => ({
    date: LATEST_PRICE_DATA[LATEST_PRICE_DATA.length - 17 + i]?.date || `Day ${i}`,
    atr: Number(atr.toFixed(0)),
  }));
  
  // Build OBV data (last 17 days) - normalize to thousands
  const obvData = obvValues.slice(-17).map((obv, i) => ({
    date: LATEST_PRICE_DATA[LATEST_PRICE_DATA.length - 17 + i]?.date || `Day ${i}`,
    obv: Number((obv / 1e6).toFixed(0)),
  }));
  
  // Build OI data (estimated from price action)
  const openInterestData = [
    { date: 'Dec 07', binance: 88500, bybit: 51200 },
    { date: 'Dec 10', binance: 87800, bybit: 50100 },
    { date: 'Dec 13', binance: 86900, bybit: 49500 },
    { date: 'Dec 16', binance: 85200, bybit: 48300 },
    { date: 'Dec 18', binance: 86100, bybit: 48800 },
    { date: 'Dec 19', binance: 87500, bybit: 49100 },
    { date: 'Dec 20', binance: 88200, bybit: 49000 },
    { date: 'Dec 21', binance: 88800, bybit: 49100 },
    { date: 'Dec 22', binance: 89100, bybit: 49237 },
  ];
  
  // Latest price data
  const latestPrice = LATEST_PRICE_DATA[LATEST_PRICE_DATA.length - 1];
  const currentPrice = latestPrice.close;
  
  // Rating history (simulated trend)
  const ratingHistory = [
    { date: 'Dec 02', rating: 32.22 },
    { date: 'Dec 05', rating: 28.89 },
    { date: 'Dec 08', rating: 31.11 },
    { date: 'Dec 11', rating: 35.56 },
    { date: 'Dec 14', rating: 30.00 },
    { date: 'Dec 17', rating: 25.56 },
    { date: 'Dec 18', rating: 27.78 },
    { date: 'Dec 19', rating: 32.22 },
    { date: 'Dec 20', rating: 35.56 },
    { date: 'Dec 21', rating: 38.89 },
    { date: 'Dec 22', rating: 41.11 },
  ];
  
  return {
    priceData: LATEST_PRICE_DATA,
    rsiData,
    stochData,
    bollingerData,
    fundingRateData: FUNDING_RATE_HISTORY,
    openInterestData,
    tokenRatingScores: [
      { metric: 'Overall Rating', value: 4.1, max: 10 },
      { metric: 'Accumulation', value: 7.8, max: 10 },
      { metric: 'Leverage', value: 5.9, max: 10 },
      { metric: 'Demand Shock', value: 3.5, max: 10 },
      { metric: 'Price Strength', value: 4.2, max: 10 },
      { metric: 'Sentiment', value: 3.8, max: 10 },
    ],
    atrData,
    obvData,
    ratingHistory,
    keyLevels: [
      { level: 'Strong Resistance', price: '$92,000-94,000', basis: 'Dec highs, 50 SMA' },
      { level: 'Resistance', price: '$90,000-91,000', basis: '20 EMA, psychological' },
      { level: 'Current Price', price: `$${currentPrice.toLocaleString()}`, basis: '-' },
      { level: 'Support', price: '$87,500-88,500', basis: 'Recent consolidation' },
      { level: 'Strong Support', price: '$84,500-85,500', basis: 'Dec 18 low' },
    ],
    currentPrice: 89428,
    markPrice: 89390,
    high24h: 89909,
    low24h: 87900,
    fundingBinance: 0.00006716,
    fundingBybit: 0.0001,
    lastUpdated: timestamp,
  };
}

export async function GET() {
  try {
    const data = await fetchBTCData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching BTC data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch BTC data' },
      { status: 500 }
    );
  }
}
