'use client';

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
  DollarSign,
  Database,
  AlertTriangle,
} from '@/components/GridCard';
import Link from 'next/link';
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

// BTC Price Data (30-day OHLCV) - Updated Dec 18, 2025
const priceData = [
  { date: 'Nov 19', open: 92961, high: 92980, low: 88608, close: 91555, volume: 2.82e9 },
  { date: 'Nov 20', open: 91555, high: 93160, low: 86100, close: 86637, volume: 3.47e9 },
  { date: 'Nov 21', open: 86637, high: 87499, low: 80600, close: 85129, volume: 6.15e9 },
  { date: 'Nov 22', open: 85129, high: 85620, low: 83500, close: 84740, volume: 1.20e9 },
  { date: 'Nov 23', open: 84740, high: 88128, low: 84668, close: 86830, volume: 1.71e9 },
  { date: 'Nov 24', open: 86830, high: 89228, low: 85272, close: 88300, volume: 2.18e9 },
  { date: 'Nov 25', open: 88300, high: 88520, low: 86116, close: 87370, volume: 1.71e9 },
  { date: 'Nov 26', open: 87370, high: 90656, low: 86307, close: 90484, volume: 1.96e9 },
  { date: 'Nov 27', open: 90484, high: 91950, low: 90090, close: 91334, volume: 1.54e9 },
  { date: 'Nov 28', open: 91334, high: 93092, low: 90181, close: 90891, volume: 1.71e9 },
  { date: 'Nov 29', open: 90891, high: 91166, low: 90155, close: 90802, volume: 675e6 },
  { date: 'Nov 30', open: 90802, high: 92000, low: 90337, close: 90360, volume: 894e6 },
  { date: 'Dec 01', open: 90360, high: 90417, low: 83823, close: 86286, volume: 2.98e9 },
  { date: 'Dec 02', open: 86286, high: 92308, low: 86184, close: 91278, volume: 2.58e9 },
  { date: 'Dec 03', open: 91278, high: 94150, low: 90990, close: 93430, volume: 2.40e9 },
  { date: 'Dec 04', open: 93430, high: 94080, low: 90889, close: 92078, volume: 1.83e9 },
  { date: 'Dec 05', open: 92078, high: 92692, low: 88056, close: 89330, volume: 1.77e9 },
  { date: 'Dec 06', open: 89330, high: 90290, low: 88908, close: 89237, volume: 750e6 },
  { date: 'Dec 07', open: 89237, high: 91760, low: 87719, close: 90395, volume: 1.17e9 },
  { date: 'Dec 08', open: 90395, high: 92287, low: 89612, close: 90634, volume: 1.42e9 },
  { date: 'Dec 09', open: 90634, high: 94589, low: 89500, close: 92679, volume: 1.96e9 },
  { date: 'Dec 10', open: 92679, high: 94476, low: 91563, close: 92015, volume: 1.76e9 },
  { date: 'Dec 11', open: 92015, high: 93555, low: 89261, close: 92513, volume: 1.83e9 },
  { date: 'Dec 12', open: 92513, high: 92754, low: 89480, close: 90268, volume: 1.50e9 },
  { date: 'Dec 13', open: 90268, high: 90635, low: 89766, close: 90240, volume: 532e6 },
  { date: 'Dec 14', open: 90240, high: 90472, low: 87577, close: 88172, volume: 830e6 },
  { date: 'Dec 15', open: 88172, high: 90053, low: 85147, close: 86432, volume: 1.71e9 },
  { date: 'Dec 16', open: 86432, high: 88176, low: 85266, close: 87863, volume: 1.61e9 },
  { date: 'Dec 17', open: 87863, high: 90366, low: 85314, close: 86243, volume: 1.73e9 },
  { date: 'Dec 18', open: 86243, high: 86959, low: 85864, close: 86828, volume: 298e6 },
];

// RSI Data - estimated from price action
const rsiData = [
  { date: 'Dec 02', rsi: 37.90 },
  { date: 'Dec 03', rsi: 43.17 },
  { date: 'Dec 04', rsi: 40.83 },
  { date: 'Dec 05', rsi: 36.49 },
  { date: 'Dec 06', rsi: 36.34 },
  { date: 'Dec 07', rsi: 39.48 },
  { date: 'Dec 08', rsi: 40.13 },
  { date: 'Dec 09', rsi: 45.56 },
  { date: 'Dec 10', rsi: 44.16 },
  { date: 'Dec 11', rsi: 45.51 },
  { date: 'Dec 12', rsi: 40.73 },
  { date: 'Dec 13', rsi: 40.67 },
  { date: 'Dec 14', rsi: 36.56 },
  { date: 'Dec 15', rsi: 33.50 },
  { date: 'Dec 16', rsi: 38.09 },
  { date: 'Dec 17', rsi: 34.21 },
  { date: 'Dec 18', rsi: 36.85 },
];

// Stochastic Data
const stochData = [
  { date: 'Dec 05', k: 78.05, d: 80.13 },
  { date: 'Dec 06', k: 63.96, d: 76.71 },
  { date: 'Dec 07', k: 56.94, d: 66.31 },
  { date: 'Dec 08', k: 60.68, d: 60.52 },
  { date: 'Dec 09', k: 70.62, d: 62.74 },
  { date: 'Dec 10', k: 74.77, d: 68.69 },
  { date: 'Dec 11', k: 79.69, d: 75.03 },
  { date: 'Dec 12', k: 72.23, d: 75.56 },
  { date: 'Dec 13', k: 66.73, d: 72.88 },
  { date: 'Dec 14', k: 53.29, d: 64.08 },
  { date: 'Dec 15', k: 37.87, d: 52.63 },
  { date: 'Dec 16', k: 27.59, d: 39.59 },
  { date: 'Dec 17', k: 18.45, d: 27.97 },
  { date: 'Dec 18', k: 24.12, d: 23.39 },
];

// Bollinger Bands Data
const bollingerData = [
  { date: 'Dec 08', close: 90634, upper: 94240, middle: 89355, lower: 84470 },
  { date: 'Dec 09', close: 92679, upper: 94427, middle: 89411, lower: 84396 },
  { date: 'Dec 10', close: 92015, upper: 94646, middle: 89680, lower: 84715 },
  { date: 'Dec 11', close: 92513, upper: 94677, middle: 90049, lower: 85422 },
  { date: 'Dec 12', close: 90268, upper: 94220, middle: 90326, lower: 86431 },
  { date: 'Dec 13', close: 90240, upper: 94028, middle: 90496, lower: 86965 },
  { date: 'Dec 14', close: 88172, upper: 94039, middle: 90490, lower: 86941 },
  { date: 'Dec 15', close: 86432, upper: 94185, middle: 90443, lower: 86701 },
  { date: 'Dec 16', close: 87863, upper: 94227, middle: 90312, lower: 86397 },
  { date: 'Dec 17', close: 86243, upper: 93985, middle: 89876, lower: 85767 },
  { date: 'Dec 18', close: 86828, upper: 93712, middle: 89542, lower: 85372 },
];

// Funding Rate Comparison (Binance vs Bybit) - LIVE Dec 18
const fundingRateData = [
  { date: 'Dec 15 04:00', binance: 0.00000089, bybit: 0.00000049 },
  { date: 'Dec 15 12:00', binance: 0.00000308, bybit: 0.00000287 },
  { date: 'Dec 15 20:00', binance: 0.00000747, bybit: 0.00000389 },
  { date: 'Dec 16 04:00', binance: 0.00000135, bybit: -0.00000135 },
  { date: 'Dec 16 12:00', binance: 0.00000409, bybit: 0.00000076 },
  { date: 'Dec 16 20:00', binance: 0.00000622, bybit: 0.00000556 },
  { date: 'Dec 17 04:00', binance: 0.00000899, bybit: 0.00000460 },
  { date: 'Dec 17 12:00', binance: 0.00000550, bybit: 0.00000114 },
  { date: 'Dec 17 20:00', binance: 0.00000320, bybit: 0.00000280 },
  { date: 'Dec 18 04:00', binance: -0.00001027, bybit: 0.00007094 },
];

// Open Interest Data
const openInterestData = [
  { date: 'Nov 21', binance: 105044, bybit: 63550 },
  { date: 'Nov 24', binance: 96647, bybit: 60811 },
  { date: 'Nov 27', binance: 90207, bybit: 57298 },
  { date: 'Dec 01', binance: 90585, bybit: 54740 },
  { date: 'Dec 04', binance: 89253, bybit: 53996 },
  { date: 'Dec 07', binance: 87643, bybit: 50594 },
  { date: 'Dec 10', binance: 87041, bybit: 49683 },
  { date: 'Dec 14', binance: 87755, bybit: 49431 },
  { date: 'Dec 17', binance: 88599, bybit: 50899 },
  { date: 'Dec 18', binance: 88200, bybit: 49860 },
];

// Token Rating Scores - Latest
const tokenRatingScores = [
  { metric: 'Overall Rating', value: 2.8, max: 10 },
  { metric: 'Accumulation', value: 8.5, max: 10 },
  { metric: 'Leverage', value: 6.8, max: 10 },
  { metric: 'Demand Shock', value: 2.2, max: 10 },
  { metric: 'Price Strength', value: 1.5, max: 10 },
  { metric: 'Sentiment', value: 0.5, max: 10 },
];

// ATR Data
const atrData = [
  { date: 'Dec 02', atr: 3969 },
  { date: 'Dec 03', atr: 3911 },
  { date: 'Dec 04', atr: 3860 },
  { date: 'Dec 05', atr: 3915 },
  { date: 'Dec 06', atr: 3734 },
  { date: 'Dec 07', atr: 3756 },
  { date: 'Dec 08', atr: 3679 },
  { date: 'Dec 09', atr: 3780 },
  { date: 'Dec 10', atr: 3718 },
  { date: 'Dec 11', atr: 3759 },
  { date: 'Dec 12', atr: 3724 },
  { date: 'Dec 13', atr: 3520 },
  { date: 'Dec 14', atr: 3476 },
  { date: 'Dec 15', atr: 3578 },
  { date: 'Dec 16', atr: 3530 },
  { date: 'Dec 17', atr: 3612 },
  { date: 'Dec 18', atr: 3445 },
];

// OBV Data
const obvData = [
  { date: 'Dec 02', obv: -137377 },
  { date: 'Dec 03', obv: -111665 },
  { date: 'Dec 04', obv: -131469 },
  { date: 'Dec 05', obv: -151262 },
  { date: 'Dec 06', obv: -159671 },
  { date: 'Dec 07', obv: -146650 },
  { date: 'Dec 08', obv: -130856 },
  { date: 'Dec 09', obv: -109616 },
  { date: 'Dec 10', obv: -128615 },
  { date: 'Dec 11', obv: -108642 },
  { date: 'Dec 12', obv: -125321 },
  { date: 'Dec 13', obv: -131217 },
  { date: 'Dec 14', obv: -140634 },
  { date: 'Dec 15', obv: -160413 },
  { date: 'Dec 16', obv: -141957 },
  { date: 'Dec 17', obv: -161791 },
  { date: 'Dec 18', obv: -158373 },
];

// Overall Rating History
const ratingHistory = [
  { date: 'Nov 20', rating: 41.11 },
  { date: 'Nov 24', rating: 38.89 },
  { date: 'Nov 27', rating: 35.56 },
  { date: 'Nov 30', rating: 30.00 },
  { date: 'Dec 03', rating: 32.22 },
  { date: 'Dec 06', rating: 26.67 },
  { date: 'Dec 09', rating: 36.67 },
  { date: 'Dec 12', rating: 34.44 },
  { date: 'Dec 15', rating: 20.00 },
  { date: 'Dec 17', rating: 25.56 },
  { date: 'Dec 18', rating: 28.00 },
];

// Key levels - Updated
const keyLevels = [
  { level: 'Strong Resistance', price: '$94,000-95,000', basis: '50 SMA, December highs' },
  { level: 'Resistance', price: '$90,000-91,000', basis: '20 EMA, psychological' },
  { level: 'Current Price', price: '$86,828', basis: '-' },
  { level: 'Support', price: '$85,000-86,000', basis: 'BB lower, recent lows' },
  { level: 'Strong Support', price: '$80,600', basis: 'November low' },
];

// Price summary table - Updated
const priceSummary = [
  { metric: '24h High', value: '$90,366', date: 'Dec 17' },
  { metric: '24h Low', value: '$85,314', date: 'Dec 17' },
  { metric: '24h Change', value: '+0.20%', date: '+$170' },
  { metric: '24h Volume', value: '$1.73B', date: 'Binance' },
];

// Bull/Bear signals - Updated
const bullSignals = [
  'Stochastic recovering from oversold at 24.12',
  'Accumulation Score remains high at 8.5/10',
  'Sentiment at extreme lows (contrarian indicator)',
  'Open interest stable - no mass liquidations',
  'Price holding above $85,000 support',
  'Bybit funding positive - bulls still present',
];

const bearSignals = [
  'Trading below 20 EMA ($89,542) and 50 SMA',
  'Binance funding turned negative (-0.001%)',
  'OBV showing continued distribution',
  'RSI weak at 36.85',
  'Failed to reclaim $90,000 on Dec 17 rally',
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[var(--surface-canvas)] p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-4">
            <h1 className="display-xl text-[var(--ink-primary)]">₿ Bitcoin Market Analysis</h1>
            <span className="label-micro text-[var(--signal-success)]">● LIVE</span>
          </div>
          <Link 
            href="/polymarket" 
            className="px-4 py-2 border border-[var(--color-accent-main)] text-[var(--color-accent-main)] hover:bg-[var(--color-accent-subtle)] transition-colors label-micro"
          >
            🎲 Polymarket →
          </Link>
        </div>
        <div className="flex items-center gap-4 text-[var(--ink-secondary)]">
          <span className="body-text">December 18, 2025 • 08:24 UTC</span>
          <span className="text-[var(--border-grid)]">|</span>
          <span className="label-micro">SOURCE: HIVE MCP (BINANCE, BYBIT)</span>
        </div>
      </header>

      {/* Executive Summary Metrics - LIVE */}
      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-0">
        <MetricCard label="BTC Price" value="$86,974" change="+0.33% 24h" trend="up" />
        <MetricCard label="24h High" value="$90,366" change="Dec 17" trend="up" />
        <MetricCard label="24h Low" value="$85,314" change="Dec 17" trend="down" />
        <MetricCard label="Mark Price" value="$86,933" change="Binance Perp" trend="neutral" />
        <MetricCard label="Funding (Binance)" value="-0.001%" change="Bearish" trend="down" />
        <MetricCard label="Funding (Bybit)" value="+0.008%" change="Bullish" trend="up" />
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {/* Price Chart */}
        <GridCard title="BTC/USDT Price Action (30-Day)" icon={<TrendingUp />} className="xl:col-span-2">
          <PriceChart data={priceData} />
          <div className="mt-4 grid grid-cols-4 gap-4">
            {priceSummary.map((item, i) => (
              <div key={i} className="p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
                <span className="label-micro text-[var(--ink-secondary)] block mb-1">{item.metric}</span>
                <span className="data-numerical text-[var(--ink-primary)]">{item.value}</span>
                <span className="label-micro text-[var(--ink-tertiary)] block">{item.date}</span>
              </div>
            ))}
          </div>
        </GridCard>

        {/* Key Levels */}
        <GridCard title="Support & Resistance Levels" icon={<Layers />} noPadding>
          <DataTable 
            headers={['Level', 'Price', 'Basis']}
            rows={keyLevels.map(l => [
              <span key={l.level} className={l.level === 'Current Price' ? 'font-bold text-[var(--color-accent-main)]' : ''}>{l.level}</span>,
              <span key={l.price} className={l.level.includes('Resistance') ? 'text-[var(--signal-error)]' : l.level.includes('Support') ? 'text-[var(--signal-success)]' : 'text-[var(--color-accent-main)] font-bold'}>{l.price}</span>,
              l.basis
            ])}
          />
        </GridCard>

        {/* RSI Chart */}
        <GridCard title="RSI (14-Period)" icon={<Activity />}>
          <RSIChart data={rsiData} />
          <div className="mt-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[var(--signal-success)]" />
              <span className="label-micro">Oversold &lt;30</span>
            </div>
            <span className="data-numerical text-[var(--ink-primary)]">Current: 36.85</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[var(--signal-error)]" />
              <span className="label-micro">Overbought &gt;70</span>
            </div>
          </div>
        </GridCard>

        {/* Stochastic Chart */}
        <GridCard title="Stochastic Oscillator (14,3,3)" icon={<Activity />}>
          <StochChart data={stochData} />
          <div className="mt-2 p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
            <span className="label-micro text-[var(--ink-secondary)]">RECOVERING FROM OVERSOLD</span>
            <p className="body-text text-[var(--ink-primary)] mt-1">
              %K at 24.12 bouncing from 18.45 low - early reversal signal
            </p>
          </div>
        </GridCard>

        {/* Bollinger Bands */}
        <GridCard title="Bollinger Bands (20,2)" icon={<BarChart3 />}>
          <BollingerChart data={bollingerData} />
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 border border-[var(--signal-error)]">
              <span className="label-micro text-[var(--signal-error)]">Upper</span>
              <span className="data-numerical block">$93,712</span>
            </div>
            <div className="p-2 border border-[var(--border-element)]">
              <span className="label-micro text-[var(--ink-secondary)]">Middle</span>
              <span className="data-numerical block">$89,542</span>
            </div>
            <div className="p-2 border border-[var(--signal-success)]">
              <span className="label-micro text-[var(--signal-success)]">Lower</span>
              <span className="data-numerical block">$85,372</span>
            </div>
          </div>
        </GridCard>

        {/* Funding Rates - LIVE */}
        <GridCard title="Funding Rate Comparison (LIVE)" icon={<Zap />} className="xl:col-span-2">
          <FundingCompareChart data={fundingRateData} />
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-3 bg-[var(--signal-error)]" style={{ backgroundColor: 'rgba(179, 38, 30, 0.1)' }}>
              <span className="label-micro text-[var(--signal-error)] block mb-1">Binance (LIVE)</span>
              <span className="data-numerical text-[var(--signal-error)]">-0.00103%</span>
              <span className="label-micro text-[var(--ink-tertiary)] block">Shorts paying longs</span>
            </div>
            <div className="p-3 bg-[var(--signal-success)]" style={{ backgroundColor: 'rgba(0, 110, 80, 0.1)' }}>
              <span className="label-micro text-[var(--signal-success)] block mb-1">Bybit (LIVE)</span>
              <span className="data-numerical text-[var(--signal-success)]">+0.00815%</span>
              <span className="label-micro text-[var(--ink-tertiary)] block">Longs paying shorts</span>
            </div>
            <div className="p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
              <span className="label-micro text-[var(--ink-secondary)] block mb-1">Interpretation</span>
              <span className="data-numerical text-[var(--ink-primary)]">Mixed Sentiment</span>
              <span className="label-micro text-[var(--ink-tertiary)] block">Exchange divergence</span>
            </div>
          </div>
        </GridCard>

        {/* Open Interest - LIVE */}
        <GridCard title="Open Interest (Binance + Bybit)" icon={<Database />}>
          <OpenInterestChart data={openInterestData} />
          <div className="mt-2 flex justify-between text-center">
            <div>
              <span className="label-micro text-[var(--ink-secondary)]">Binance</span>
              <span className="data-numerical block text-[var(--color-accent-main)]">88,200 BTC</span>
            </div>
            <div>
              <span className="label-micro text-[var(--ink-secondary)]">Bybit</span>
              <span className="data-numerical block" style={{ color: '#E6B000' }}>49,860 BTC</span>
            </div>
            <div>
              <span className="label-micro text-[var(--ink-secondary)]">Total</span>
              <span className="data-numerical block text-[var(--ink-primary)]">138,060 BTC</span>
            </div>
          </div>
        </GridCard>

        {/* Token Rating Scores */}
        <GridCard title="JLabs Token Rating (Latest)" icon={<Shield />}>
          <TokenRatingChart data={tokenRatingScores} />
          <div className="mt-2 p-3 bg-[var(--color-accent-subtle)] border border-[var(--color-accent-main)]">
            <span className="label-micro text-[var(--color-accent-main)]">KEY INSIGHT</span>
            <p className="body-text text-[var(--ink-primary)] mt-1">
              High Accumulation (8.5/10) + Low Sentiment (0.5/10) = Smart money accumulation
            </p>
          </div>
        </GridCard>

        {/* Token Rating History */}
        <GridCard title="Overall Rating History" icon={<TrendingUp />}>
          <RatingHistoryChart data={ratingHistory} />
          <div className="mt-2 text-center">
            <span className="data-numerical text-[var(--signal-success)]">Rating recovering: 20.00 → 28.00</span>
          </div>
        </GridCard>

        {/* ATR */}
        <GridCard title="Average True Range (14)" icon={<Activity />}>
          <ATRChart data={atrData} />
          <div className="mt-2 p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
            <span className="label-micro text-[var(--ink-secondary)]">VOLATILITY COMPRESSION</span>
            <p className="body-text text-[var(--ink-primary)] mt-1">
              ATR at $3,445 - declining volatility precedes breakout
            </p>
          </div>
        </GridCard>

        {/* OBV */}
        <GridCard title="On-Balance Volume" icon={<BarChart3 />}>
          <OBVChart data={obvData} />
          <div className="mt-2 p-3 bg-[var(--signal-error)]" style={{ backgroundColor: 'rgba(179, 38, 30, 0.1)' }}>
            <span className="label-micro text-[var(--signal-error)]">DISTRIBUTION PATTERN</span>
            <p className="body-text text-[var(--ink-primary)] mt-1">
              OBV at -158K showing slight recovery from -161K low
            </p>
          </div>
        </GridCard>

        {/* Bybit Live Data */}
        <GridCard title="Bybit Perpetual (LIVE)" icon={<Zap />} noPadding>
          <DataTable 
            headers={['Metric', 'Value']}
            rows={[
              ['Last Price', '$86,793'],
              ['Mark Price', '$86,796'],
              ['Index Price', '$86,832'],
              ['24h High', '$90,341'],
              ['24h Low', '$85,259'],
              ['24h Volume', '$9.77B'],
              ['Open Interest', '49,860 BTC'],
              ['OI Value', '$4.33B'],
            ]}
          />
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
              <span className="body-text">Bounce to $90K-92K</span>
              <Badge type="success">40%</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-[var(--border-element)]">
              <span className="body-text">Consolidation $85K-90K</span>
              <Badge type="neutral">40%</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-[var(--signal-error)]">
              <span className="body-text">Breakdown below $85K</span>
              <Badge type="error">20%</Badge>
            </div>
          </div>
        </GridCard>

        {/* Key Triggers */}
        <GridCard title="Key Triggers to Watch" icon={<AlertTriangle />}>
          <div className="space-y-3">
            <div className="p-3 bg-[var(--signal-success)]" style={{ backgroundColor: 'rgba(0, 110, 80, 0.1)' }}>
              <span className="label-micro text-[var(--signal-success)]">BULLISH TRIGGER</span>
              <p className="data-numerical text-[var(--ink-primary)] mt-1">Close above $90,000 (20 EMA reclaim)</p>
            </div>
            <div className="p-3 bg-[var(--signal-error)]" style={{ backgroundColor: 'rgba(179, 38, 30, 0.1)' }}>
              <span className="label-micro text-[var(--signal-error)]">BEARISH TRIGGER</span>
              <p className="data-numerical text-[var(--ink-primary)] mt-1">Break below $85,000 support</p>
            </div>
            <div className="p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
              <span className="label-micro text-[var(--ink-secondary)]">WATCH</span>
              <p className="data-numerical text-[var(--ink-primary)] mt-1">Funding divergence - Binance vs Bybit</p>
            </div>
          </div>
        </GridCard>

        {/* Funding Divergence Alert */}
        <GridCard title="⚠️ Funding Rate Divergence" icon={<AlertTriangle />}>
          <div className="space-y-3">
            <div className="p-3 border border-[var(--signal-warning)]" style={{ backgroundColor: 'rgba(230, 176, 0, 0.1)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⚡</span>
                <span className="label-micro text-[var(--signal-warning)]">UNUSUAL PATTERN</span>
              </div>
              <p className="body-text text-[var(--ink-primary)]">
                Binance funding negative (-0.001%) while Bybit positive (+0.007%)
              </p>
              <p className="body-text text-[var(--ink-secondary)] mt-2">
                This divergence suggests market uncertainty. Historically precedes volatility.
              </p>
            </div>
          </div>
        </GridCard>
      </div>

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-[var(--border-grid)]">
        <div className="flex items-center justify-between text-[var(--ink-tertiary)]">
          <span className="label-micro">LIVE DATA: BINANCE, BYBIT VIA HIVE MCP | UPDATED: DEC 18, 2025 08:24 UTC</span>
          <span className="label-micro">THIS IS NOT FINANCIAL ADVICE</span>
        </div>
      </footer>
    </div>
  );
}
