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
  AlertTriangle,
} from '@/components/GridCard';
import {
  ProbabilityChart,
  TradeFlowChart,
  ArbitrageChart,
  VolumeDistributionChart,
} from '@/components/PolymarketCharts';
import Link from 'next/link';

// Bitcoin Price Targets - from Polymarket
const btcPriceTargets = [
  { target: '$130,000', probability: 0.5, volume: 11.4e6, type: 'up' },
  { target: '$120,000', probability: 1.1, volume: 5.1e6, type: 'up' },
  { target: '$115,000', probability: 1.2, volume: 1.1e6, type: 'up' },
  { target: '$110,000', probability: 2.1, volume: 3.8e6, type: 'up' },
  { target: '$105,000', probability: 4.7, volume: 1.6e6, type: 'up' },
  { target: '$100,000', probability: 11.0, volume: 5.7e6, type: 'up' },
  { target: '$95,000', probability: 26.5, volume: 2.6e6, type: 'up' },
  { target: '↓ $80,000', probability: 31.6, volume: 5.0e6, type: 'down' },
  { target: '↓ $75,000', probability: 13.5, volume: 982.8e3, type: 'down' },
  { target: '↓ $70,000', probability: 3.9, volume: 7.0e6, type: 'down' },
  { target: '↓ $65,000', probability: 0.9, volume: 953.8e3, type: 'down' },
  { target: '↓ $50,000', probability: 0.8, volume: 4.2e6, type: 'down' },
];

// ETH Price Targets
const ethPriceTargets = [
  { target: '$5,000', probability: 0.8, volume: 15.3e6, type: 'up' },
  { target: '$6,000', probability: 0.5, volume: 8.6e6, type: 'up' },
  { target: '$7,000', probability: 0.4, volume: 7.0e6, type: 'up' },
  { target: '$10,000', probability: 0.2, volume: 6.5e6, type: 'up' },
  { target: '↓ $1,300', probability: 0.8, volume: 824.8e3, type: 'down' },
  { target: '↓ $1,000', probability: 0.4, volume: 1.4e6, type: 'down' },
  { target: '↓ $800', probability: 0.2, volume: 627.8e3, type: 'down' },
];

// Daily BTC Markets
const dailyBTCMarkets = [
  { market: 'BTC > $90,000 on Dec 18?', yes: 5.1, no: 94.9, volume: 10 },
  { market: 'BTC > $88,000 on Dec 18?', yes: 31.0, no: 69.0, volume: 4 },
  { market: 'BTC > $84,000 on Dec 18?', yes: 96.0, no: 4.0, volume: 10 },
  { market: 'BTC $86K-$88K on Dec 18?', yes: 52.0, no: 48.0, volume: 1 },
];

// Macro/Corporate Markets
const macroMarkets = [
  { market: 'US National Bitcoin Reserve in 2025?', yes: 0.8, no: 99.2, volume: 5.2e6 },
  { market: 'Texas Strategic Bitcoin Reserve (H.B. 1598) signed in 2025?', yes: 0.9, no: 99.1, volume: 204.6e3 },
  { market: 'Senate passes bill to purchase 1M Bitcoin in 2025?', yes: 1.1, no: 98.9, volume: 59.7e3 },
  { market: 'MicroStrategy sells BTC by Dec 31, 2025?', yes: 1.6, no: 98.4, volume: 4.0e6 },
  { market: 'MicroStrategy forced to liquidate BTC in 2025?', yes: 0.8, no: 99.2, volume: 418.1e3 },
  { market: 'Fed emergency rate cut in 2025?', yes: 0.5, no: 99.5, volume: 1.4e6 },
  { market: 'USDT depeg in 2025?', yes: 0.4, no: 99.6, volume: 1.5e6 },
  { market: 'Tether insolvent in 2025?', yes: 0.4, no: 99.6, volume: 467.3e3 },
  { market: 'ETH flipped in 2025?', yes: 0.4, no: 99.6, volume: 310.5e3 },
  { market: 'SOL flip ETH in 2025?', yes: 0.4, no: 99.6, volume: 179.6e3 },
];

// Trade Flow Data (Recent)
const tradeFlowData = [
  { market: 'BTC Up/Down Dec 18', buys: 9, sells: 1, volume: 450, sentiment: 'bullish' },
  { market: 'BTC > $90K Dec 18', buys: 1, sells: 0, volume: 10, sentiment: 'bullish' },
  { market: 'BTC > $84K Dec 18', buys: 1, sells: 0, volume: 10, sentiment: 'bullish' },
];

// Potential Arbitrage Opportunities
const arbitrageOpportunities = [
  { 
    market: 'BTC > $100K by end of 2025',
    polymarket: { yes: 11.0, no: 89.0 },
    implied: { yes: 15.0, no: 85.0 }, // Deribit options implied
    spread: 4.0,
    type: 'Options hedge'
  },
  { 
    market: 'BTC > $90K on Dec 18',
    polymarket: { yes: 5.1, no: 94.9 },
    spotImplied: { yes: 8.0, no: 92.0 }, // Based on current price distance
    spread: 2.9,
    type: 'Spot implied'
  },
];

// Volume by market category
const volumeDistribution = [
  { category: 'BTC Price 2025', volume: 126.8e6 },
  { category: 'ETH Price 2025', volume: 57.8e6 },
  { category: 'Corporate (MSTR)', volume: 4.7e6 },
  { category: 'Government Reserves', volume: 5.5e6 },
  { category: 'Stablecoins', volume: 2.0e6 },
  { category: 'Daily BTC Markets', volume: 0.5e6 },
];

export default function PolymarketPage() {
  return (
    <div className="min-h-screen bg-[var(--surface-canvas)] p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/" className="label-micro text-[var(--color-accent-main)] hover:underline">
            ← BTC Dashboard
          </Link>
        </div>
        <div className="flex items-baseline gap-4 mb-2">
          <h1 className="display-xl text-[var(--ink-primary)]">🎲 Polymarket Prediction Markets</h1>
          <span className="label-micro text-[var(--signal-success)]">● LIVE</span>
        </div>
        <div className="flex items-center gap-4 text-[var(--ink-secondary)]">
          <span className="body-text">December 18, 2025 • 09:42 UTC</span>
          <span className="text-[var(--border-grid)]">|</span>
          <span className="label-micro">SOURCE: JLABS MCP (POLYMARKET)</span>
        </div>
      </header>

      {/* Executive Summary Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-0">
        <MetricCard label="BTC Markets Vol" value="$137M" change="6 markets" trend="neutral" />
        <MetricCard label="ETH Markets Vol" value="$59.5M" change="5 markets" trend="neutral" />
        <MetricCard label="BTC >$100K" value="11%" change="by Dec 31" trend="down" />
        <MetricCard label="BTC >$95K" value="26.5%" change="by Dec 31" trend="neutral" />
        <MetricCard label="Trade Sentiment" value="BULLISH" change="90% buys" trend="up" />
        <MetricCard label="Buy/Sell Ratio" value="9:1" change="Last 10 trades" trend="up" />
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        
        {/* BTC Price Target Probabilities */}
        <GridCard title="BTC Price Targets by End of 2025" icon={<TrendingUp />} className="xl:col-span-2">
          <ProbabilityChart data={btcPriceTargets} />
          <div className="mt-4 p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
            <span className="label-micro text-[var(--ink-secondary)]">MARKET CONSENSUS</span>
            <p className="body-text text-[var(--ink-primary)] mt-1">
              Only 11% chance BTC hits $100K by end of 2025. Market is cautious after recent pullback from $108K highs.
            </p>
          </div>
        </GridCard>

        {/* Volume Distribution */}
        <GridCard title="Volume by Category" icon={<PieChartIcon />}>
          <VolumeDistributionChart data={volumeDistribution} />
          <div className="mt-3 text-center">
            <span className="data-numerical text-[var(--color-accent-main)]">Total: $197M+</span>
          </div>
        </GridCard>

        {/* Daily BTC Markets */}
        <GridCard title="Daily BTC Markets (Dec 18)" icon={<Activity />} noPadding>
          <DataTable 
            headers={['Market', 'Yes', 'No', 'Volume']}
            rows={dailyBTCMarkets.map(m => [
              <span key={m.market} className="text-xs">{m.market}</span>,
              <span key={`yes-${m.market}`} className={m.yes > 50 ? 'text-[var(--signal-success)]' : 'text-[var(--ink-secondary)]'}>{m.yes}%</span>,
              <span key={`no-${m.market}`} className={m.no > 50 ? 'text-[var(--signal-error)]' : 'text-[var(--ink-secondary)]'}>{m.no}%</span>,
              `$${m.volume}`
            ])}
          />
          <div className="p-3 bg-[var(--surface-subtle)]">
            <span className="label-micro text-[var(--ink-secondary)]">
              Current BTC: $86,974 | Market says: 96% chance stays above $84K
            </span>
          </div>
        </GridCard>

        {/* ETH Price Targets */}
        <GridCard title="ETH Price Targets 2025" icon={<TrendingUp />}>
          <ProbabilityChart data={ethPriceTargets} />
          <div className="mt-3 p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
            <span className="label-micro text-[var(--ink-secondary)]">UPSIDE LIMITED</span>
            <p className="body-text text-[var(--ink-primary)] mt-1">
              Only 0.8% chance ETH hits $5K. Market extremely bearish on ETH targets.
            </p>
          </div>
        </GridCard>

        {/* Trade Flow Analysis */}
        <GridCard title="Recent Trade Flow (Last 10)" icon={<BarChart3 />}>
          <TradeFlowChart buys={9} sells={1} buyVolume={450} sellVolume={4} />
          <div className="mt-4 space-y-2">
            <div className="flex justify-between p-2 bg-[var(--signal-success)]" style={{ backgroundColor: 'rgba(0, 110, 80, 0.1)' }}>
              <span className="body-text">Buy Orders</span>
              <span className="data-numerical text-[var(--signal-success)]">9 (90%)</span>
            </div>
            <div className="flex justify-between p-2 bg-[var(--signal-error)]" style={{ backgroundColor: 'rgba(179, 38, 30, 0.1)' }}>
              <span className="body-text">Sell Orders</span>
              <span className="data-numerical text-[var(--signal-error)]">1 (10%)</span>
            </div>
          </div>
          <div className="mt-3 p-3 bg-[var(--color-accent-subtle)] border border-[var(--color-accent-main)]">
            <span className="label-micro text-[var(--color-accent-main)]">SENTIMENT: ACCUMULATING</span>
            <p className="body-text text-[var(--ink-primary)] mt-1">
              Market participants actively buying - suggests bullish short-term bias
            </p>
          </div>
        </GridCard>

        {/* Macro/Corporate Markets */}
        <GridCard title="Macro & Corporate Markets" icon={<Shield />} className="xl:col-span-2" noPadding>
          <DataTable 
            headers={['Market', 'Yes', 'No', 'Volume']}
            rows={macroMarkets.map(m => [
              <span key={m.market} className="text-xs">{m.market}</span>,
              <span key={`yes-${m.market}`} className="text-[var(--signal-success)]">{m.yes.toFixed(1)}%</span>,
              <span key={`no-${m.market}`} className="text-[var(--signal-error)]">{m.no.toFixed(1)}%</span>,
              `$${(m.volume / 1e6).toFixed(2)}M`
            ])}
          />
        </GridCard>

        {/* Key Insights */}
        <GridCard title="Key Insights" icon={<Layers />}>
          <div className="space-y-3">
            <div className="p-3 border border-[var(--signal-success)]" style={{ backgroundColor: 'rgba(0, 110, 80, 0.05)' }}>
              <span className="label-micro text-[var(--signal-success)]">🟢 BULLISH SIGNAL</span>
              <p className="body-text text-[var(--ink-primary)] mt-1">
                9:1 buy/sell ratio indicates strong accumulation
              </p>
            </div>
            <div className="p-3 border border-[var(--signal-warning)]" style={{ backgroundColor: 'rgba(230, 176, 0, 0.05)' }}>
              <span className="label-micro text-[var(--signal-warning)]">⚠️ CAUTION</span>
              <p className="body-text text-[var(--ink-primary)] mt-1">
                Only 11% market odds for BTC $100K - expectations reset
              </p>
            </div>
            <div className="p-3 border border-[var(--border-element)]">
              <span className="label-micro text-[var(--ink-secondary)]">📊 CONSENSUS</span>
              <p className="body-text text-[var(--ink-primary)] mt-1">
                MicroStrategy won&apos;t sell (98.4%) - institutions holding
              </p>
            </div>
          </div>
        </GridCard>

        {/* Arbitrage Opportunities */}
        <GridCard title="🎯 Potential Arbitrage Opportunities" icon={<DollarSign />} className="xl:col-span-2">
          <ArbitrageChart data={arbitrageOpportunities} />
          <div className="mt-4 grid grid-cols-2 gap-4">
            {arbitrageOpportunities.map((opp, i) => (
              <div key={i} className="p-3 border border-[var(--color-accent-main)]" style={{ backgroundColor: 'rgba(58, 46, 111, 0.05)' }}>
                <span className="label-micro text-[var(--color-accent-main)]">{opp.type.toUpperCase()}</span>
                <p className="body-text text-[var(--ink-primary)] mt-1 text-sm">{opp.market}</p>
                <div className="flex justify-between mt-2">
                  <span className="data-numerical text-xs">Polymarket: {opp.polymarket.yes}%</span>
                  <span className="data-numerical text-xs text-[var(--signal-success)]">Spread: {opp.spread}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
            <span className="label-micro text-[var(--ink-secondary)]">ARBITRAGE STRATEGY</span>
            <p className="body-text text-[var(--ink-primary)] mt-1">
              When Polymarket odds diverge from options implied probability, hedge by selling &quot;Yes&quot; on Polymarket 
              and buying call options at same strike. Net premium if price stays below target.
            </p>
          </div>
        </GridCard>

        {/* Arbitrage Formula */}
        <GridCard title="Arbitrage Detection" icon={<Zap />}>
          <div className="space-y-4">
            <div className="p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
              <span className="label-micro text-[var(--color-accent-main)]">SINGLE MARKET</span>
              <p className="data-numerical text-[var(--ink-primary)] mt-2">
                If Yes + No &lt; $1.00
              </p>
              <p className="body-text text-[var(--ink-secondary)] mt-1">
                Profit = $1.00 - (Yes + No)
              </p>
            </div>
            <div className="p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
              <span className="label-micro text-[var(--color-accent-main)]">CROSS-PLATFORM</span>
              <p className="data-numerical text-[var(--ink-primary)] mt-2">
                Poly_Yes + Kalshi_No &lt; $1.00
              </p>
              <p className="body-text text-[var(--ink-secondary)] mt-1">
                Buy both for risk-free profit
              </p>
            </div>
            <div className="p-3 border border-[var(--signal-warning)]" style={{ backgroundColor: 'rgba(230, 176, 0, 0.1)' }}>
              <span className="label-micro text-[var(--signal-warning)]">⚠️ SLIPPAGE WARNING</span>
              <p className="body-text text-[var(--ink-primary)] mt-1">
                Low liquidity markets may have significant slippage
              </p>
            </div>
          </div>
        </GridCard>

        {/* Recent Trades */}
        <GridCard title="Recent Trades" icon={<Activity />} noPadding>
          <div className="divide-y divide-[var(--border-grid)]">
            {[
              { type: 'BUY', market: 'BTC Up/Down Dec 18 4AM', outcome: 'Down', size: 10, price: 0.09 },
              { type: 'BUY', market: 'BTC Up/Down Dec 18', outcome: 'Up', size: 5, price: 0.61 },
              { type: 'SELL', market: 'BTC > $88K Dec 18', outcome: 'No', size: 6.2, price: 0.69 },
              { type: 'BUY', market: 'BTC > $84K Dec 18', outcome: 'Yes', size: 10, price: 0.96 },
              { type: 'BUY', market: 'BTC > $90K Dec 18', outcome: 'Yes', size: 195.7, price: 0.051 },
              { type: 'BUY', market: 'BTC Up/Down 5AM', outcome: 'Down', size: 727.5, price: 0.51 },
            ].map((trade, i) => (
              <div key={i} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`label-micro px-2 py-0.5 ${trade.type === 'BUY' ? 'bg-[var(--signal-success)] text-white' : 'bg-[var(--signal-error)] text-white'}`}>
                    {trade.type}
                  </span>
                  <span className="body-text text-xs">{trade.market}</span>
                </div>
                <div className="text-right">
                  <span className="data-numerical text-xs block">{trade.outcome}</span>
                  <span className="label-micro text-[var(--ink-tertiary)]">${(trade.size * trade.price).toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </GridCard>

        {/* Summary */}
        <GridCard title="Market Summary" icon={<Shield />} className="xl:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-[var(--signal-success)]" style={{ backgroundColor: 'rgba(0, 110, 80, 0.05)' }}>
              <span className="label-micro text-[var(--signal-success)] block mb-3">🟢 BULLISH SIGNALS</span>
              <ul className="space-y-2 body-text text-[var(--ink-primary)]">
                <li>• 9:1 buy/sell ratio on BTC markets</li>
                <li>• Active accumulation of BTC upside bets</li>
                <li>• 98.4% odds MicroStrategy holds BTC</li>
                <li>• Low USDT depeg risk (0.4%)</li>
              </ul>
            </div>
            <div className="p-4 border border-[var(--signal-error)]" style={{ backgroundColor: 'rgba(179, 38, 30, 0.05)' }}>
              <span className="label-micro text-[var(--signal-error)] block mb-3">🔴 BEARISH SIGNALS</span>
              <ul className="space-y-2 body-text text-[var(--ink-primary)]">
                <li>• Only 11% chance BTC hits $100K</li>
                <li>• 26.5% odds for $95K (below spot)</li>
                <li>• 31.6% odds BTC drops below $80K</li>
                <li>• ETH upside expectations minimal</li>
              </ul>
            </div>
            <div className="p-4 border border-[var(--border-element)]">
              <span className="label-micro text-[var(--ink-secondary)] block mb-3">📊 TRADING INSIGHTS</span>
              <ul className="space-y-2 body-text text-[var(--ink-primary)]">
                <li>• Options hedge: Sell Poly Yes, buy calls</li>
                <li>• Monitor cross-platform spreads</li>
                <li>• Daily markets for short-term alpha</li>
                <li>• $137M BTC volume = high liquidity</li>
              </ul>
            </div>
          </div>
        </GridCard>

      </div>

      {/* Footer */}
      <footer className="mt-8 pt-6 border-t border-[var(--border-grid)]">
        <div className="flex items-center justify-between text-[var(--ink-tertiary)]">
          <span className="label-micro">LIVE DATA: POLYMARKET VIA JLABS MCP | UPDATED: DEC 18, 2025 09:42 UTC</span>
          <span className="label-micro">THIS IS NOT FINANCIAL ADVICE • PREDICTION MARKETS INVOLVE RISK</span>
        </div>
      </footer>
    </div>
  );
}

