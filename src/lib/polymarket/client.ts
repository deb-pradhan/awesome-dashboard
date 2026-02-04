/**
 * Direct Polymarket API Client
 * Fetches data from Gamma API (markets) and CLOB API (prices/trades)
 */

// API Base URLs
const GAMMA_BASE = 'https://gamma-api.polymarket.com';
const CLOB_BASE = 'https://clob.polymarket.com';
const COINCAP_BASE = 'https://api.coincap.io/v2';

// Types for Gamma API responses
export interface GammaTag {
  id: string;
  label: string;
  slug: string;
}

export interface GammaMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  resolutionSource: string;
  endDate: string;
  liquidity: string;
  volume: string;
  clobTokenIds: string[];
  outcomes: string;
  outcomePrices: string;
  volume24hr: string;
  active: boolean;
  closed: boolean;
  marketType: string;
  groupItemTitle?: string;
}

export interface GammaEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  new: boolean;
  featured: boolean;
  restricted: boolean;
  liquidity: number;
  volume: number;
  tags: GammaTag[];
  markets: GammaMarket[];
  commentCount: number;
}

export interface CLOBPrice {
  price: string;
}

export interface OrderbookLevel {
  price: string;
  size: string;
}

export interface Orderbook {
  market: string;
  asset_id: string;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  timestamp: string;
}

export interface CLOBTrade {
  id: string;
  taker_order_id: string;
  market: string;
  asset_id: string;
  side: 'BUY' | 'SELL' | 'buy' | 'sell';
  price: string;
  size: string;
  fee_rate_bps: string;
  status: string;
  match_time: string;
  outcome: string;
  trader_side: string;
}

interface FetchOptions {
  revalidate?: number;
  cache?: RequestCache;
}

export async function fetchEvents(options: FetchOptions = {}): Promise<GammaEvent[]> {
  const { revalidate = 60 } = options;
  
  try {
    const response = await fetch(
      `${GAMMA_BASE}/events?active=true&closed=false&limit=100`,
      { 
        next: { revalidate },
        headers: { 'Accept': 'application/json' }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Gamma API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('[PolymarketClient] fetchEvents error:', error);
    throw error;
  }
}

export async function fetchBTCEvents(options: FetchOptions = {}): Promise<GammaEvent[]> {
  const events = await fetchEvents(options);
  
  return events.filter((event) => {
    const titleLower = event.title?.toLowerCase() || '';
    const descLower = event.description?.toLowerCase() || '';
    const hasCryptoTag = event.tags?.some(t => 
      t.slug === 'crypto' || t.slug === 'bitcoin' || t.slug === 'btc'
    );
    
    return (
      titleLower.includes('bitcoin') ||
      titleLower.includes('btc') ||
      descLower.includes('bitcoin') ||
      hasCryptoTag
    );
  });
}

export async function fetchMarketById(marketId: string, options: FetchOptions = {}): Promise<GammaMarket> {
  const { revalidate = 60 } = options;
  
  const response = await fetch(
    `${GAMMA_BASE}/markets/${marketId}`,
    { 
      next: { revalidate },
      headers: { 'Accept': 'application/json' }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Gamma API error: ${response.status}`);
  }
  
  return await response.json();
}

export async function fetchMarkets(params: {
  slug?: string;
  active?: boolean;
  closed?: boolean;
  limit?: number;
} = {}, options: FetchOptions = {}): Promise<GammaMarket[]> {
  const { revalidate = 60 } = options;
  
  const searchParams = new URLSearchParams();
  if (params.slug) searchParams.set('slug', params.slug);
  if (params.active !== undefined) searchParams.set('active', String(params.active));
  if (params.closed !== undefined) searchParams.set('closed', String(params.closed));
  if (params.limit) searchParams.set('limit', String(params.limit));
  
  const response = await fetch(
    `${GAMMA_BASE}/markets?${searchParams.toString()}`,
    { 
      next: { revalidate },
      headers: { 'Accept': 'application/json' }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Gamma API error: ${response.status}`);
  }
  
  return await response.json();
}

export async function fetchPrice(
  tokenId: string, 
  side: 'buy' | 'sell' = 'buy',
  options: FetchOptions = {}
): Promise<number> {
  const { revalidate = 10 } = options;
  
  try {
    const response = await fetch(
      `${CLOB_BASE}/price?token_id=${tokenId}&side=${side}`,
      { 
        next: { revalidate },
        headers: { 'Accept': 'application/json' }
      }
    );
    
    if (!response.ok) {
      throw new Error(`CLOB API error: ${response.status}`);
    }
    
    const data: CLOBPrice = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.error('[PolymarketClient] fetchPrice error:', error);
    throw error;
  }
}

export async function fetchPrices(
  tokenIds: string[],
  side: 'buy' | 'sell' = 'buy',
  options: FetchOptions = {}
): Promise<Map<string, number>> {
  const prices = new Map<string, number>();
  
  const results = await Promise.allSettled(
    tokenIds.map(async (tokenId) => {
      const price = await fetchPrice(tokenId, side, options);
      return { tokenId, price };
    })
  );
  
  for (const result of results) {
    if (result.status === 'fulfilled') {
      prices.set(result.value.tokenId, result.value.price);
    }
  }
  
  return prices;
}

export async function fetchOrderbook(tokenId: string, options: FetchOptions = {}): Promise<Orderbook> {
  const { revalidate = 10 } = options;
  
  const response = await fetch(
    `${CLOB_BASE}/book?token_id=${tokenId}`,
    { 
      next: { revalidate },
      headers: { 'Accept': 'application/json' }
    }
  );
  
  if (!response.ok) {
    throw new Error(`CLOB API error: ${response.status}`);
  }
  
  return await response.json();
}

export async function fetchTrades(
  params: { market?: string; maker?: string; limit?: number } = {},
  options: FetchOptions = {}
): Promise<CLOBTrade[]> {
  const { revalidate = 30 } = options;
  
  const searchParams = new URLSearchParams();
  if (params.market) searchParams.set('market', params.market);
  if (params.maker) searchParams.set('maker', params.maker);
  if (params.limit) searchParams.set('limit', String(params.limit));
  
  try {
    const response = await fetch(
      `${CLOB_BASE}/trades?${searchParams.toString()}`,
      { 
        next: { revalidate },
        headers: { 'Accept': 'application/json' }
      }
    );
    
    if (!response.ok) {
      // Return empty array for auth errors or not found
      if (response.status === 401 || response.status === 404) {
        console.warn('[PolymarketClient] Trades API returned', response.status, '- using empty trades');
        return [];
      }
      throw new Error(`CLOB API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('[PolymarketClient] fetchTrades error:', error);
    return [];
  }
}

export async function fetchBTCPrice(options: FetchOptions = {}): Promise<number> {
  const { revalidate = 30 } = options;
  
  // Try CoinCap first
  try {
    const response = await fetch(
      `${COINCAP_BASE}/assets/bitcoin`,
      { 
        next: { revalidate },
        headers: { 'Accept': 'application/json' }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return Math.round(parseFloat(data.data.priceUsd));
    }
  } catch (error) {
    console.warn('[PolymarketClient] CoinCap failed, trying fallback:', error);
  }
  
  // Try CoinGecko as fallback
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
      { next: { revalidate } }
    );
    
    if (response.ok) {
      const data = await response.json();
      return Math.round(data.bitcoin.usd);
    }
  } catch (error) {
    console.warn('[PolymarketClient] CoinGecko also failed:', error);
  }
  
  // Return fallback price
  console.warn('[PolymarketClient] All price sources failed, using fallback');
  return 95000;
}

export async function fetchMidpoint(tokenId: string, options: FetchOptions = {}): Promise<number> {
  const { revalidate = 10 } = options;
  
  try {
    const response = await fetch(
      `${CLOB_BASE}/midpoint?token_id=${tokenId}`,
      { 
        next: { revalidate },
        headers: { 'Accept': 'application/json' }
      }
    );
    
    if (!response.ok) {
      throw new Error(`CLOB API error: ${response.status}`);
    }
    
    const data = await response.json();
    return parseFloat(data.mid);
  } catch (error) {
    console.error('[PolymarketClient] fetchMidpoint error:', error);
    throw error;
  }
}

export async function fetchAllBTCData(options: FetchOptions = {}): Promise<{
  events: GammaEvent[];
  btcPrice: number;
  trades: CLOBTrade[];
}> {
  const [events, btcPrice, trades] = await Promise.all([
    fetchBTCEvents(options),
    fetchBTCPrice(options),
    fetchTrades({ limit: 100 }, options),
  ]);
  
  return { events, btcPrice, trades };
}

export type { FetchOptions };
