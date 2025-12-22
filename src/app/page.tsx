'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  GridCard, 
  MetricCard, 
  DataTable, 
  Badge,
  TrendingUp,
  BarChart3,
  PieChartIcon,
  Activity,
  Layers,
  Shield,
  Zap,
  Database,
  AlertTriangle,
} from '@/components/GridCard';
import { Navbar } from '@/components/Navbar';
import {
  PriceChart,
  RSIChart,
  StochChart,
  BollingerChart,
  FundingCompareChart,
  OpenInterestChart,
  TokenRatingChart,
  ATRChart,
  OBVChart,
  RatingHistoryChart,
} from '@/components/Charts';
import type { BTCDashboardData } from '@/lib/types';

// Default/fallback data
const defaultData: BTCDashboardData = {
  priceData: [],
  rsiData: [],
  stochData: [],
  bollingerData: [],
  fundingRateData: [],
  openInterestData: [],
  tokenRatingScores: [
    { metric: 'Overall Rating', value: 2.8, max: 10 },
    { metric: 'Accumulation', value: 8.5, max: 10 },
    { metric: 'Leverage', value: 6.8, max: 10 },
    { metric: 'Demand Shock', value: 2.2, max: 10 },
    { metric: 'Price Strength', value: 1.5, max: 10 },
    { metric: 'Sentiment', value: 0.5, max: 10 },
  ],
  atrData: [],
  obvData: [],
  ratingHistory: [],
  keyLevels: [],
  currentPrice: 96000,
  markPrice: 95950,
  high24h: 97500,
  low24h: 94500,
  fundingBinance: 0.0001,
  fundingBybit: 0.00008,
  lastUpdated: 'Loading...',
};

// Bull/Bear signals - Updated
const bullSignals = [
  'Stochastic recovering from oversold',
  'Accumulation Score remains high at 8.5/10',
  'Sentiment at extreme lows (contrarian indicator)',
  'Open interest stable - no mass liquidations',
  'Price holding above support levels',
  'Bybit funding positive - bulls still present',
];

const bearSignals = [
  'Trading below 20 EMA and 50 SMA',
  'Binance funding could turn negative',
  'OBV showing continued distribution',
  'RSI weak in lower range',
  'Failed to reclaim resistance on recent rally',
];

export default function Dashboard() {
  const [data, setData] = useState<BTCDashboardData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/btc');
      if (!response.ok) throw new Error('Failed to fetch data');
      const newData = await response.json();
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching BTC data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatPercent = (value: number) => {
    const pct = (value * 100).toFixed(4);
    return value >= 0 ? `+${pct}%` : `${pct}%`;
  };

  const priceSummary = [
    { metric: '24h High', value: `$${data.high24h.toLocaleString()}`, date: 'Today' },
    { metric: '24h Low', value: `$${data.low24h.toLocaleString()}`, date: 'Today' },
    { metric: '24h Change', value: '+0.33%', date: `$${Math.floor(data.currentPrice * 0.0033).toLocaleString()}` },
    { metric: 'Mark Price', value: `$${data.markPrice.toLocaleString()}`, date: 'Binance' },
  ];

  return (
    <div className="min-h-screen bg-[var(--surface-canvas)]">
      {/* Navbar */}
      <Navbar 
        onRefresh={fetchData} 
        isLoading={isLoading} 
        lastUpdated={data.lastUpdated} 
      />

      <div className="p-6">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-[var(--signal-error)] text-white">
            Error: {error}. Showing cached data.
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-baseline gap-4 mb-2">
            <h1 className="display-xl text-[var(--ink-primary)]">₿ Bitcoin Market Analysis</h1>
            <span className={`label-micro ${isLoading ? 'text-[var(--signal-warning)]' : 'text-[var(--signal-success)]'}`}>
              {isLoading ? '◌ UPDATING' : '● LIVE'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[var(--ink-secondary)]">
            <span className="body-text">{data.lastUpdated}</span>
            <span className="text-[var(--border-grid)]">|</span>
            <span className="label-micro">SOURCE: PANDA MCP (BINANCE, BYBIT)</span>
          </div>
        </header>

        {/* Executive Summary Metrics - LIVE */}
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-0">
          <MetricCard label="BTC Price" value={`$${data.currentPrice.toLocaleString()}`} change="+0.33% 24h" trend="up" />
          <MetricCard label="24h High" value={`$${data.high24h.toLocaleString()}`} change="Today" trend="up" />
          <MetricCard label="24h Low" value={`$${data.low24h.toLocaleString()}`} change="Today" trend="down" />
          <MetricCard label="Mark Price" value={`$${data.markPrice.toLocaleString()}`} change="Binance Perp" trend="neutral" />
          <MetricCard 
            label="Funding (Binance)" 
            value={formatPercent(data.fundingBinance)} 
            change={data.fundingBinance >= 0 ? 'Bullish' : 'Bearish'} 
            trend={data.fundingBinance >= 0 ? 'up' : 'down'} 
          />
          <MetricCard 
            label="Funding (Bybit)" 
            value={formatPercent(data.fundingBybit)} 
            change={data.fundingBybit >= 0 ? 'Bullish' : 'Bearish'} 
            trend={data.fundingBybit >= 0 ? 'up' : 'down'} 
          />
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {/* Price Chart */}
          <GridCard title="BTC/USDT Price Action (30-Day)" icon={<TrendingUp />} className="xl:col-span-2">
            {data.priceData.length > 0 ? (
              <>
                <PriceChart data={data.priceData} />
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {priceSummary.map((item, i) => (
                    <div key={i} className="p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
                      <span className="label-micro text-[var(--ink-secondary)] block mb-1">{item.metric}</span>
                      <span className="data-numerical text-[var(--ink-primary)]">{item.value}</span>
                      <span className="label-micro text-[var(--ink-tertiary)] block">{item.date}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-[var(--ink-tertiary)]">
                Loading price data...
              </div>
            )}
          </GridCard>

          {/* Key Levels */}
          <GridCard title="Support & Resistance Levels" icon={<Layers />} noPadding>
            {data.keyLevels.length > 0 ? (
              <DataTable 
                headers={['Level', 'Price', 'Basis']}
                rows={data.keyLevels.map(l => [
                  <span key={l.level} className={l.level === 'Current Price' ? 'font-bold text-[var(--color-accent-main)]' : ''}>{l.level}</span>,
                  <span key={l.price} className={l.level.includes('Resistance') ? 'text-[var(--signal-error)]' : l.level.includes('Support') ? 'text-[var(--signal-success)]' : 'text-[var(--color-accent-main)] font-bold'}>{l.price}</span>,
                  l.basis
                ])}
              />
            ) : (
              <div className="p-8 text-center text-[var(--ink-tertiary)]">Loading...</div>
            )}
          </GridCard>

          {/* RSI Chart */}
          <GridCard title="RSI (14-Period)" icon={<Activity />}>
            {data.rsiData.length > 0 ? (
              <>
                <RSIChart data={data.rsiData} />
                <div className="mt-2 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[var(--signal-success)]" />
                    <span className="label-micro">Oversold &lt;30</span>
                  </div>
                  <span className="data-numerical text-[var(--ink-primary)]">
                    Current: {data.rsiData[data.rsiData.length - 1]?.rsi.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[var(--signal-error)]" />
                    <span className="label-micro">Overbought &gt;70</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-[var(--ink-tertiary)]">Loading...</div>
            )}
          </GridCard>

          {/* Stochastic Chart */}
          <GridCard title="Stochastic Oscillator (14,3,3)" icon={<Activity />}>
            {data.stochData.length > 0 ? (
              <>
                <StochChart data={data.stochData} />
                <div className="mt-2 p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
                  <span className="label-micro text-[var(--ink-secondary)]">
                    {data.stochData[data.stochData.length - 1]?.k < 30 ? 'RECOVERING FROM OVERSOLD' : 
                     data.stochData[data.stochData.length - 1]?.k > 70 ? 'OVERBOUGHT ZONE' : 'NEUTRAL ZONE'}
                  </span>
                  <p className="body-text text-[var(--ink-primary)] mt-1">
                    %K at {data.stochData[data.stochData.length - 1]?.k.toFixed(2)}
                  </p>
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-[var(--ink-tertiary)]">Loading...</div>
            )}
          </GridCard>

          {/* Bollinger Bands */}
          <GridCard title="Bollinger Bands (20,2)" icon={<BarChart3 />}>
            {data.bollingerData.length > 0 ? (
              <>
                <BollingerChart data={data.bollingerData} />
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 border border-[var(--signal-error)]">
                    <span className="label-micro text-[var(--signal-error)]">Upper</span>
                    <span className="data-numerical block">${data.bollingerData[data.bollingerData.length - 1]?.upper.toLocaleString()}</span>
                  </div>
                  <div className="p-2 border border-[var(--border-element)]">
                    <span className="label-micro text-[var(--ink-secondary)]">Middle</span>
                    <span className="data-numerical block">${data.bollingerData[data.bollingerData.length - 1]?.middle.toLocaleString()}</span>
                  </div>
                  <div className="p-2 border border-[var(--signal-success)]">
                    <span className="label-micro text-[var(--signal-success)]">Lower</span>
                    <span className="data-numerical block">${data.bollingerData[data.bollingerData.length - 1]?.lower.toLocaleString()}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-[var(--ink-tertiary)]">Loading...</div>
            )}
          </GridCard>

          {/* Funding Rates - LIVE */}
          <GridCard title="Funding Rate Comparison (LIVE)" icon={<Zap />} className="xl:col-span-2">
            {data.fundingRateData.length > 0 ? (
              <>
                <FundingCompareChart data={data.fundingRateData} />
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="p-3" style={{ backgroundColor: data.fundingBinance >= 0 ? 'rgba(0, 110, 80, 0.1)' : 'rgba(179, 38, 30, 0.1)' }}>
                    <span className={`label-micro ${data.fundingBinance >= 0 ? 'text-[var(--signal-success)]' : 'text-[var(--signal-error)]'} block mb-1`}>Binance (LIVE)</span>
                    <span className={`data-numerical ${data.fundingBinance >= 0 ? 'text-[var(--signal-success)]' : 'text-[var(--signal-error)]'}`}>{formatPercent(data.fundingBinance)}</span>
                    <span className="label-micro text-[var(--ink-tertiary)] block">{data.fundingBinance >= 0 ? 'Longs paying shorts' : 'Shorts paying longs'}</span>
                  </div>
                  <div className="p-3" style={{ backgroundColor: data.fundingBybit >= 0 ? 'rgba(0, 110, 80, 0.1)' : 'rgba(179, 38, 30, 0.1)' }}>
                    <span className={`label-micro ${data.fundingBybit >= 0 ? 'text-[var(--signal-success)]' : 'text-[var(--signal-error)]'} block mb-1`}>Bybit (LIVE)</span>
                    <span className={`data-numerical ${data.fundingBybit >= 0 ? 'text-[var(--signal-success)]' : 'text-[var(--signal-error)]'}`}>{formatPercent(data.fundingBybit)}</span>
                    <span className="label-micro text-[var(--ink-tertiary)] block">{data.fundingBybit >= 0 ? 'Longs paying shorts' : 'Shorts paying longs'}</span>
                  </div>
                  <div className="p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
                    <span className="label-micro text-[var(--ink-secondary)] block mb-1">Interpretation</span>
                    <span className="data-numerical text-[var(--ink-primary)]">
                      {Math.sign(data.fundingBinance) !== Math.sign(data.fundingBybit) ? 'Mixed Sentiment' : 
                       data.fundingBinance >= 0 ? 'Bullish Consensus' : 'Bearish Consensus'}
                    </span>
                    <span className="label-micro text-[var(--ink-tertiary)] block">
                      {Math.sign(data.fundingBinance) !== Math.sign(data.fundingBybit) ? 'Exchange divergence' : 'Aligned'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-[var(--ink-tertiary)]">Loading...</div>
            )}
          </GridCard>

          {/* Open Interest - LIVE */}
          <GridCard title="Open Interest (Binance + Bybit)" icon={<Database />}>
            {data.openInterestData.length > 0 ? (
              <>
                <OpenInterestChart data={data.openInterestData} />
                <div className="mt-2 flex justify-between text-center">
                  <div>
                    <span className="label-micro text-[var(--ink-secondary)]">Binance</span>
                    <span className="data-numerical block text-[var(--color-accent-main)]">
                      {data.openInterestData[data.openInterestData.length - 1]?.binance.toLocaleString()} BTC
                    </span>
                  </div>
                  <div>
                    <span className="label-micro text-[var(--ink-secondary)]">Bybit</span>
                    <span className="data-numerical block" style={{ color: '#E6B000' }}>
                      {data.openInterestData[data.openInterestData.length - 1]?.bybit.toLocaleString()} BTC
                    </span>
                  </div>
                  <div>
                    <span className="label-micro text-[var(--ink-secondary)]">Total</span>
                    <span className="data-numerical block text-[var(--ink-primary)]">
                      {((data.openInterestData[data.openInterestData.length - 1]?.binance || 0) + 
                        (data.openInterestData[data.openInterestData.length - 1]?.bybit || 0)).toLocaleString()} BTC
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-[var(--ink-tertiary)]">Loading...</div>
            )}
          </GridCard>

          {/* Token Rating Scores */}
          <GridCard title="JLabs Token Rating (Latest)" icon={<Shield />}>
            <TokenRatingChart data={data.tokenRatingScores} />
            <div className="mt-2 p-3 bg-[var(--color-accent-subtle)] border border-[var(--color-accent-main)]">
              <span className="label-micro text-[var(--color-accent-main)]">KEY INSIGHT</span>
              <p className="body-text text-[var(--ink-primary)] mt-1">
                High Accumulation ({data.tokenRatingScores.find(s => s.metric === 'Accumulation')?.value.toFixed(1)}/10) + 
                Low Sentiment ({data.tokenRatingScores.find(s => s.metric === 'Sentiment')?.value.toFixed(1)}/10) = Smart money accumulation
              </p>
            </div>
          </GridCard>

          {/* Token Rating History */}
          <GridCard title="Overall Rating History" icon={<TrendingUp />}>
            {data.ratingHistory.length > 0 ? (
              <>
                <RatingHistoryChart data={data.ratingHistory} />
                <div className="mt-2 text-center">
                  <span className="data-numerical text-[var(--signal-success)]">
                    Rating: {data.ratingHistory[data.ratingHistory.length - 1]?.rating.toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-[var(--ink-tertiary)]">Loading...</div>
            )}
          </GridCard>

          {/* ATR */}
          <GridCard title="Average True Range (14)" icon={<Activity />}>
            {data.atrData.length > 0 ? (
              <>
                <ATRChart data={data.atrData} />
                <div className="mt-2 p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
                  <span className="label-micro text-[var(--ink-secondary)]">VOLATILITY</span>
                  <p className="body-text text-[var(--ink-primary)] mt-1">
                    ATR at ${data.atrData[data.atrData.length - 1]?.atr.toLocaleString()}
                  </p>
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-[var(--ink-tertiary)]">Loading...</div>
            )}
          </GridCard>

          {/* OBV */}
          <GridCard title="On-Balance Volume" icon={<BarChart3 />}>
            {data.obvData.length > 0 ? (
              <>
                <OBVChart data={data.obvData} />
                <div className="mt-2 p-3" style={{ backgroundColor: data.obvData[data.obvData.length - 1]?.obv < 0 ? 'rgba(179, 38, 30, 0.1)' : 'rgba(0, 110, 80, 0.1)' }}>
                  <span className={`label-micro ${data.obvData[data.obvData.length - 1]?.obv < 0 ? 'text-[var(--signal-error)]' : 'text-[var(--signal-success)]'}`}>
                    {data.obvData[data.obvData.length - 1]?.obv < 0 ? 'DISTRIBUTION PATTERN' : 'ACCUMULATION PATTERN'}
                  </span>
                  <p className="body-text text-[var(--ink-primary)] mt-1">
                    OBV at {(data.obvData[data.obvData.length - 1]?.obv / 1000).toFixed(0)}K
                  </p>
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-[var(--ink-tertiary)]">Loading...</div>
            )}
          </GridCard>

          {/* Market Signals */}
          <GridCard title="Market Analysis" icon={<Shield />} className="xl:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-[var(--signal-success)]" style={{ backgroundColor: 'rgba(0, 110, 80, 0.05)' }}>
                <span className="label-micro text-[var(--signal-success)] block mb-3">🟢 BULL CASE</span>
                <ul className="space-y-2 body-text text-[var(--ink-primary)]">
                  {bullSignals.map((signal, i) => (
                    <li key={i}>• {signal}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 border border-[var(--signal-error)]" style={{ backgroundColor: 'rgba(179, 38, 30, 0.05)' }}>
                <span className="label-micro text-[var(--signal-error)] block mb-3">🔴 BEAR CASE</span>
                <ul className="space-y-2 body-text text-[var(--ink-primary)]">
                  {bearSignals.map((signal, i) => (
                    <li key={i}>• {signal}</li>
                  ))}
                </ul>
              </div>
            </div>
          </GridCard>

          {/* Probability Assessment */}
          <GridCard title="1-Week Probability Assessment" icon={<PieChartIcon />}>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-[var(--signal-success)]">
                <span className="body-text">Bounce to $98K-100K</span>
                <Badge type="success">40%</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border border-[var(--border-element)]">
                <span className="body-text">Consolidation $94K-98K</span>
                <Badge type="neutral">40%</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border border-[var(--signal-error)]">
                <span className="body-text">Breakdown below $94K</span>
                <Badge type="error">20%</Badge>
              </div>
            </div>
          </GridCard>

          {/* Key Triggers */}
          <GridCard title="Key Triggers to Watch" icon={<AlertTriangle />}>
            <div className="space-y-3">
              <div className="p-3 bg-[var(--signal-success)]" style={{ backgroundColor: 'rgba(0, 110, 80, 0.1)' }}>
                <span className="label-micro text-[var(--signal-success)]">BULLISH TRIGGER</span>
                <p className="data-numerical text-[var(--ink-primary)] mt-1">Close above $98,000 (ATH zone)</p>
              </div>
              <div className="p-3 bg-[var(--signal-error)]" style={{ backgroundColor: 'rgba(179, 38, 30, 0.1)' }}>
                <span className="label-micro text-[var(--signal-error)]">BEARISH TRIGGER</span>
                <p className="data-numerical text-[var(--ink-primary)] mt-1">Break below $94,000 support</p>
              </div>
              <div className="p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
                <span className="label-micro text-[var(--ink-secondary)]">WATCH</span>
                <p className="data-numerical text-[var(--ink-primary)] mt-1">Funding divergence - Binance vs Bybit</p>
              </div>
            </div>
          </GridCard>

          {/* Funding Divergence Alert */}
          <GridCard title="⚠️ Funding Rate Status" icon={<AlertTriangle />}>
            <div className="space-y-3">
              <div className="p-3 border border-[var(--signal-warning)]" style={{ backgroundColor: 'rgba(230, 176, 0, 0.1)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⚡</span>
                  <span className="label-micro text-[var(--signal-warning)]">
                    {Math.sign(data.fundingBinance) !== Math.sign(data.fundingBybit) ? 'DIVERGENCE DETECTED' : 'ALIGNED'}
                  </span>
                </div>
                <p className="body-text text-[var(--ink-primary)]">
                  Binance: {formatPercent(data.fundingBinance)} | Bybit: {formatPercent(data.fundingBybit)}
                </p>
                <p className="body-text text-[var(--ink-secondary)] mt-2">
                  {Math.sign(data.fundingBinance) !== Math.sign(data.fundingBybit) 
                    ? 'Exchange divergence suggests market uncertainty. Historically precedes volatility.'
                    : 'Exchanges aligned. Market consensus forming.'}
                </p>
              </div>
            </div>
          </GridCard>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-[var(--border-grid)]">
          <div className="flex items-center justify-between text-[var(--ink-tertiary)]">
            <span className="label-micro">LIVE DATA: BINANCE, BYBIT VIA PANDA MCP | {data.lastUpdated}</span>
            <span className="label-micro">THIS IS NOT FINANCIAL ADVICE</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
