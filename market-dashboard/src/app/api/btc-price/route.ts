import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use CoinCap API (free, no auth required)
    const response = await fetch('https://api.coincap.io/v2/assets/bitcoin', {
      next: { revalidate: 30 }, // Cache for 30 seconds
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch BTC price');
    }
    
    const data = await response.json();
    const price = parseFloat(data.data.priceUsd);
    const change24h = parseFloat(data.data.changePercent24Hr);
    
    return NextResponse.json({
      price,
      change24h,
      timestamp: Date.now(),
      symbol: 'BTC/USD',
    });
  } catch (error) {
    console.error('Error fetching BTC price:', error);
    // Return fallback price on error
    return NextResponse.json({
      price: 96500,
      change24h: 0,
      timestamp: Date.now(),
      symbol: 'BTC/USD',
      error: 'Using cached price',
    });
  }
}


