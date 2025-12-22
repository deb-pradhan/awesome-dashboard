import { NextResponse } from 'next/server';
import type { BTCDashboardData } from '@/lib/types';

// This would connect to your MCP endpoints in production
// For now, we'll simulate the data fetch with realistic current values
async function fetchBTCData(): Promise<BTCDashboardData> {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
  
  // In production, these would be actual API calls to Panda MCP
  // const klines = await fetch('MCP_ENDPOINT/klines');
  // const funding = await fetch('MCP_ENDPOINT/funding');
  // etc.

  // Generate realistic data based on current market conditions
  // This simulates what the MCP would return
  const basePrice = 96000 + Math.random() * 2000 - 1000; // ~$96k with some variance
  
  return {
    priceData: generatePriceData(basePrice),
    rsiData: generateRSIData(),
    stochData: generateStochData(),
    bollingerData: generateBollingerData(basePrice),
    fundingRateData: generateFundingData(),
    openInterestData: generateOIData(),
    tokenRatingScores: [
      { metric: 'Overall Rating', value: 2.8 + Math.random() * 0.5, max: 10 },
      { metric: 'Accumulation', value: 8.5 + Math.random() * 0.5, max: 10 },
      { metric: 'Leverage', value: 6.8 + Math.random() * 0.5, max: 10 },
      { metric: 'Demand Shock', value: 2.2 + Math.random() * 0.5, max: 10 },
      { metric: 'Price Strength', value: 1.5 + Math.random() * 0.5, max: 10 },
      { metric: 'Sentiment', value: 0.5 + Math.random() * 0.5, max: 10 },
    ],
    atrData: generateATRData(),
    obvData: generateOBVData(),
    ratingHistory: generateRatingHistory(),
    keyLevels: [
      { level: 'Strong Resistance', price: '$98,000-100,000', basis: '50 SMA, ATH zone' },
      { level: 'Resistance', price: '$97,000-98,000', basis: '20 EMA' },
      { level: 'Current Price', price: `$${basePrice.toLocaleString()}`, basis: '-' },
      { level: 'Support', price: '$94,000-95,000', basis: 'BB lower, recent lows' },
      { level: 'Strong Support', price: '$90,000', basis: 'Psychological' },
    ],
    currentPrice: basePrice,
    markPrice: basePrice - 50 + Math.random() * 100,
    high24h: basePrice + 1500 + Math.random() * 500,
    low24h: basePrice - 1500 - Math.random() * 500,
    fundingBinance: (Math.random() - 0.3) * 0.0002,
    fundingBybit: (Math.random() - 0.2) * 0.0002,
    lastUpdated: timestamp,
  };
}

function generatePriceData(currentPrice: number) {
  const data = [];
  const days = 30;
  let price = currentPrice - 15000; // Start from ~30 days ago
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const change = (Math.random() - 0.45) * 3000;
    const open = price;
    price = Math.max(80000, Math.min(105000, price + change));
    const close = price;
    const high = Math.max(open, close) + Math.random() * 2000;
    const low = Math.min(open, close) - Math.random() * 2000;
    const volume = (1 + Math.random() * 2) * 1e9;
    
    data.push({ date: dateStr, open, high, low, close, volume });
  }
  
  return data;
}

function generateRSIData() {
  const data = [];
  let rsi = 45;
  
  for (let i = 0; i < 17; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (17 - i));
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    rsi = Math.max(20, Math.min(80, rsi + (Math.random() - 0.5) * 8));
    data.push({ date: dateStr, rsi: Number(rsi.toFixed(2)) });
  }
  
  return data;
}

function generateStochData() {
  const data = [];
  let k = 50;
  let d = 50;
  
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (14 - i));
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    k = Math.max(10, Math.min(90, k + (Math.random() - 0.5) * 15));
    d = d * 0.7 + k * 0.3;
    data.push({ date: dateStr, k: Number(k.toFixed(2)), d: Number(d.toFixed(2)) });
  }
  
  return data;
}

function generateBollingerData(currentPrice: number) {
  const data = [];
  let price = currentPrice - 5000;
  
  for (let i = 0; i < 11; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (11 - i));
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    price = price + (Math.random() - 0.4) * 1500;
    const middle = price;
    const bandwidth = 4000 + Math.random() * 1000;
    
    data.push({
      date: dateStr,
      close: Number(price.toFixed(0)),
      upper: Number((middle + bandwidth).toFixed(0)),
      middle: Number(middle.toFixed(0)),
      lower: Number((middle - bandwidth).toFixed(0)),
    });
  }
  
  return data;
}

function generateFundingData() {
  const data = [];
  
  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setHours(date.getHours() - (10 - i) * 8);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
      ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    data.push({
      date: dateStr,
      binance: (Math.random() - 0.5) * 0.0002,
      bybit: (Math.random() - 0.5) * 0.0002,
    });
  }
  
  return data;
}

function generateOIData() {
  const data = [];
  let binance = 88000;
  let bybit = 50000;
  
  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (10 - i) * 3);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    binance = binance + (Math.random() - 0.5) * 3000;
    bybit = bybit + (Math.random() - 0.5) * 2000;
    
    data.push({
      date: dateStr,
      binance: Number(binance.toFixed(0)),
      bybit: Number(bybit.toFixed(0)),
    });
  }
  
  return data;
}

function generateATRData() {
  const data = [];
  let atr = 3500;
  
  for (let i = 0; i < 17; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (17 - i));
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    atr = Math.max(2500, Math.min(5000, atr + (Math.random() - 0.5) * 200));
    data.push({ date: dateStr, atr: Number(atr.toFixed(0)) });
  }
  
  return data;
}

function generateOBVData() {
  const data = [];
  let obv = -150000;
  
  for (let i = 0; i < 17; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (17 - i));
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    obv = obv + (Math.random() - 0.5) * 20000;
    data.push({ date: dateStr, obv: Number(obv.toFixed(0)) });
  }
  
  return data;
}

function generateRatingHistory() {
  const data = [];
  let rating = 35;
  
  for (let i = 0; i < 11; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (11 - i) * 3);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    rating = Math.max(15, Math.min(50, rating + (Math.random() - 0.5) * 8));
    data.push({ date: dateStr, rating: Number(rating.toFixed(2)) });
  }
  
  return data;
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

