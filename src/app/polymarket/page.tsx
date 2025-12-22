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
  DollarSign,
  AlertTriangle,
} from '@/components/GridCard';
import { Navbar } from '@/components/Navbar';
import {
  ProbabilityChart,
  TradeFlowChart,
  ArbitrageChart,
  VolumeDistributionChart,
} from '@/components/PolymarketCharts';
import type { PolymarketData } from '@/lib/types';

// Default/fallback data
const defaultData: PolymarketData = {
  btcPriceTargets: [],
  ethPriceTargets: [],
  dailyBTCMarkets: [],
  macroMarkets: [],
  tradeFlowData: [],
  arbitrageOpportunities: [],
  volumeDistribution: [],
  btcTradeFlow: { buys: 36, sells: 10, buyVolume: 970, sellVolume: 2100 },
  ethTradeFlow: { buys: 11, sells: 2 },
  lastUpdated: 'Loading...',
};

export default function PolymarketPage() {
  const [data, setData] = useState<PolymarketData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/polymarket');
      if (!response.ok) throw new Error('Failed to fetch data');
      const newData = await response.json();
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching Polymarket data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const buyRatio = data.btcTradeFlow.buys / (data.btcTradeFlow.buys + data.btcTradeFlow.sells);
  const buyPercent = (buyRatio * 100).toFixed(1);
  const btcBuySellRatio = (data.btcTradeFlow.buys / data.btcTradeFlow.sells).toFixed(2);

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
            <h1 className="display-xl text-[var(--ink-primary)]">🎲 Polymarket Prediction Markets</h1>
            <span className={`label-micro ${isLoading ? 'text-[var(--signal-warning)]' : 'text-[var(--signal-success)]'}`}>
              {isLoading ? '◌ UPDATING' : '● LIVE'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[var(--ink-secondary)]">
            <span className="body-text">{data.lastUpdated}</span>
            <span className="text-[var(--border-grid)]">|</span>
            <span className="label-micro">SOURCE: JLABS MCP (POLYMARKET)</span>
          </div>
        </header>

        {/* Executive Summary Metrics */}
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-0">
          <MetricCard label="BTC Markets Vol" value="$137.6M" change="6 markets" trend="neutral" />
          <MetricCard label="ETH Markets Vol" value="$60.0M" change="5 markets" trend="neutral" />
          <MetricCard 
            label="BTC ↑$100K" 
            value={`${data.btcPriceTargets.find(t => t.target.includes('$100,000'))?.probability.toFixed(1) || 12}%`} 
            change="recover to" 
            trend="down" 
          />
          <MetricCard 
            label="BTC ↑$95K" 
            value={`${data.btcPriceTargets.find(t => t.target.includes('$95,000'))?.probability.toFixed(1) || 30}%`} 
            change="recover to" 
            trend="up" 
          />
          <MetricCard label="Trade Sentiment" value="BULLISH" change={`${buyPercent}% buys`} trend="up" />
          <MetricCard label="Buy/Sell Ratio" value={`${btcBuySellRatio}:1`} change={`${data.btcTradeFlow.buys}÷${data.btcTradeFlow.sells} trades`} trend="up" />
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          
          {/* BTC Price Target Probabilities */}
          <GridCard title="BTC Price Targets by End of 2025" icon={<TrendingUp />} className="xl:col-span-2">
            {data.btcPriceTargets.length > 0 ? (
              <>
                <ProbabilityChart data={data.btcPriceTargets} />
                <div className="mt-4 p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
                  <span className="label-micro text-[var(--ink-secondary)]">MARKET CONSENSUS</span>
                  <p className="body-text text-[var(--ink-primary)] mt-1">
                    {data.btcPriceTargets.find(t => t.target.includes('$100,000'))?.probability.toFixed(1)}% chance BTC recovers to $100K. 
                    {' '}{data.btcPriceTargets.find(t => t.target.includes('$95,000'))?.probability.toFixed(1)}% for $95K. 
                    {' '}{data.btcPriceTargets.find(t => t.target.includes('$80,000'))?.probability.toFixed(1)}% chance drops to $80K.
                  </p>
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-[var(--ink-tertiary)]">Loading...</div>
            )}
          </GridCard>

          {/* Volume Distribution */}
          <GridCard title="Volume by Category" icon={<PieChartIcon />}>
            {data.volumeDistribution.length > 0 ? (
              <>
                <VolumeDistributionChart data={data.volumeDistribution} />
                <div className="mt-3 text-center">
                  <span className="data-numerical text-[var(--color-accent-main)]">Total: ~$200M</span>
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-[var(--ink-tertiary)]">Loading...</div>
            )}
          </GridCard>

          {/* Daily BTC Markets */}
          <GridCard title="Daily BTC Markets" icon={<Activity />} noPadding>
            {data.dailyBTCMarkets.length > 0 ? (
              <>
                <DataTable 
                  headers={['Market', 'Yes', 'No']}
                  rows={data.dailyBTCMarkets.map(m => [
                    <span key={m.market} className="text-xs">{m.market}</span>,
                    <span key={`yes-${m.market}`} className={m.yes > 50 ? 'text-[var(--signal-success)]' : 'text-[var(--ink-secondary)]'}>{m.yes}%</span>,
                    <span key={`no-${m.market}`} className={m.no > 50 ? 'text-[var(--signal-error)]' : 'text-[var(--ink-secondary)]'}>{m.no}%</span>,
                  ])}
                />
                <div className="p-3 bg-[var(--surface-subtle)]">
                  <span className="label-micro text-[var(--ink-secondary)]">
                    ⚠️ Low liquidity daily prediction markets
                  </span>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-[var(--ink-tertiary)]">Loading...</div>
            )}
          </GridCard>

          {/* ETH Price Targets */}
          <GridCard title="ETH Price Targets 2025" icon={<TrendingUp />}>
            {data.ethPriceTargets.length > 0 ? (
              <>
                <ProbabilityChart data={data.ethPriceTargets} />
                <div className="mt-3 p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
                  <span className="label-micro text-[var(--ink-secondary)]">UPSIDE LIMITED</span>
                  <p className="body-text text-[var(--ink-primary)] mt-1">
                    Only {data.ethPriceTargets.find(t => t.target.includes('$5,000'))?.probability.toFixed(1)}% chance ETH hits $5K. Market extremely bearish on ETH targets.
                  </p>
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-[var(--ink-tertiary)]">Loading...</div>
            )}
          </GridCard>

          {/* Trade Flow Analysis */}
          <GridCard title={`BTC Trade Flow (${data.btcTradeFlow.buys + data.btcTradeFlow.sells} Trades)`} icon={<BarChart3 />}>
            <TradeFlowChart 
              buys={data.btcTradeFlow.buys} 
              sells={data.btcTradeFlow.sells} 
              buyVolume={data.btcTradeFlow.buyVolume} 
              sellVolume={data.btcTradeFlow.sellVolume} 
            />
            <div className="mt-4 space-y-2">
              <div className="flex justify-between p-2 bg-[var(--signal-success)]" style={{ backgroundColor: 'rgba(0, 110, 80, 0.1)' }}>
                <span className="body-text">Buy Orders</span>
                <span className="data-numerical text-[var(--signal-success)]">{data.btcTradeFlow.buys} ({buyPercent}%)</span>
              </div>
              <div className="flex justify-between p-2 bg-[var(--signal-error)]" style={{ backgroundColor: 'rgba(179, 38, 30, 0.1)' }}>
                <span className="body-text">Sell Orders</span>
                <span className="data-numerical text-[var(--signal-error)]">{data.btcTradeFlow.sells} ({(100 - parseFloat(buyPercent)).toFixed(1)}%)</span>
              </div>
            </div>
            <div className="mt-3 p-3 bg-[var(--color-accent-subtle)] border border-[var(--color-accent-main)]">
              <span className="label-micro text-[var(--color-accent-main)]">SENTIMENT: ACCUMULATING</span>
              <p className="body-text text-[var(--ink-primary)] mt-1">
                {btcBuySellRatio}:1 buy/sell ratio - market participants actively accumulating
              </p>
            </div>
          </GridCard>

          {/* Macro/Corporate Markets */}
          <GridCard title="Macro & Corporate Markets" icon={<Shield />} className="xl:col-span-2" noPadding>
            {data.macroMarkets.length > 0 ? (
              <DataTable 
                headers={['Market', 'Yes', 'No', 'Volume']}
                rows={data.macroMarkets.map(m => [
                  <span key={m.market} className="text-xs">{m.market}</span>,
                  <span key={`yes-${m.market}`} className="text-[var(--signal-success)]">{m.yes.toFixed(1)}%</span>,
                  <span key={`no-${m.market}`} className="text-[var(--signal-error)]">{m.no.toFixed(1)}%</span>,
                  `$${(m.volume / 1e6).toFixed(2)}M`
                ])}
              />
            ) : (
              <div className="p-8 text-center text-[var(--ink-tertiary)]">Loading...</div>
            )}
          </GridCard>

          {/* Key Insights */}
          <GridCard title="Key Insights" icon={<Layers />}>
            <div className="space-y-3">
              <div className="p-3 border border-[var(--signal-success)]" style={{ backgroundColor: 'rgba(0, 110, 80, 0.05)' }}>
                <span className="label-micro text-[var(--signal-success)]">🟢 BULLISH SIGNAL</span>
                <p className="body-text text-[var(--ink-primary)] mt-1">
                  {btcBuySellRatio}:1 buy/sell ratio ({data.btcTradeFlow.buys}÷{data.btcTradeFlow.sells}={btcBuySellRatio}, {buyPercent}% buys)
                </p>
              </div>
              <div className="p-3 border border-[var(--signal-warning)]" style={{ backgroundColor: 'rgba(230, 176, 0, 0.05)' }}>
                <span className="label-micro text-[var(--signal-warning)]">⚠️ CAUTION</span>
                <p className="body-text text-[var(--ink-primary)] mt-1">
                  Only {data.btcPriceTargets.find(t => t.target.includes('$100,000'))?.probability.toFixed(1)}% odds BTC recovers to $100K by Dec 31
                </p>
              </div>
              <div className="p-3 border border-[var(--border-element)]">
                <span className="label-micro text-[var(--ink-secondary)]">📊 CONSENSUS</span>
                <p className="body-text text-[var(--ink-primary)] mt-1">
                  MicroStrategy won&apos;t sell (98.9%) - forced liquidation 0.9%
                </p>
              </div>
            </div>
          </GridCard>

          {/* Arbitrage Opportunities */}
          <GridCard title="🎯 Potential Arbitrage Opportunities" icon={<DollarSign />} className="xl:col-span-2">
            {data.arbitrageOpportunities.length > 0 ? (
              <>
                <ArbitrageChart data={data.arbitrageOpportunities} />
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {data.arbitrageOpportunities.map((opp, i) => (
                    <div key={i} className="p-3 border border-[var(--color-accent-main)]" style={{ backgroundColor: 'rgba(58, 46, 111, 0.05)' }}>
                      <span className="label-micro text-[var(--color-accent-main)]">{opp.type.toUpperCase()}</span>
                      <p className="body-text text-[var(--ink-primary)] mt-1 text-sm">{opp.market}</p>
                      <div className="flex justify-between mt-2">
                        <span className="data-numerical text-xs">Polymarket: {opp.polymarket.yes.toFixed(1)}%</span>
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
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-[var(--ink-tertiary)]">Loading...</div>
            )}
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
          <GridCard title="Recent BTC Trades" icon={<Activity />} noPadding>
            <div className="divide-y divide-[var(--border-grid)]">
              {[
                { type: 'BUY', market: 'BTC Up/Down Today', outcome: 'Down', size: 5.0, price: 0.25 },
                { type: 'BUY', market: 'BTC Daily Target', outcome: 'Yes', size: 9.9, price: 0.89 },
                { type: 'BUY', market: 'BTC Weekly Target', outcome: 'No', size: 460.3, price: 0.9954 },
                { type: 'BUY', market: 'BTC Up/Down Today', outcome: 'Down', size: 6.9, price: 0.24 },
                { type: 'SELL', market: 'BTC $88K Today', outcome: 'Yes', size: 5.3, price: 0.40 },
                { type: 'BUY', market: 'BTC $100K This Week', outcome: 'No', size: 0.2, price: 0.989 },
                { type: 'BUY', market: 'BTC Up/Down Today', outcome: 'Up', size: 26.7, price: 0.75 },
                { type: 'SELL', market: 'BTC $1M by Dec 31', outcome: 'No', size: 1900, price: 1.0 },
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
                  <li>• {btcBuySellRatio}:1 buy/sell ratio ({data.btcTradeFlow.buys}÷{data.btcTradeFlow.sells} trades)</li>
                  <li>• ETH even stronger: {(data.ethTradeFlow.buys / data.ethTradeFlow.sells).toFixed(1)}:1 ({data.ethTradeFlow.buys}÷{data.ethTradeFlow.sells})</li>
                  <li>• 98.9% odds MicroStrategy holds BTC</li>
                  <li>• Only 0.9% forced liquidation risk</li>
                </ul>
              </div>
              <div className="p-4 border border-[var(--signal-error)]" style={{ backgroundColor: 'rgba(179, 38, 30, 0.05)' }}>
                <span className="label-micro text-[var(--signal-error)] block mb-3">🔴 BEARISH SIGNALS</span>
                <ul className="space-y-2 body-text text-[var(--ink-primary)]">
                  <li>• Only {data.btcPriceTargets.find(t => t.target.includes('$100,000'))?.probability.toFixed(1)}% chance BTC recovers to $100K</li>
                  <li>• {data.btcPriceTargets.find(t => t.target.includes('$95,000'))?.probability.toFixed(1)}% odds to recover to $95K</li>
                  <li>• {data.btcPriceTargets.find(t => t.target.includes('$80,000'))?.probability.toFixed(1)}% odds BTC drops to $80K</li>
                  <li>• ETH $5K only {data.ethPriceTargets.find(t => t.target.includes('$5,000'))?.probability.toFixed(1)}% probability</li>
                </ul>
              </div>
              <div className="p-4 border border-[var(--border-element)]">
                <span className="label-micro text-[var(--ink-secondary)] block mb-3">📊 TRADING INSIGHTS</span>
                <ul className="space-y-2 body-text text-[var(--ink-primary)]">
                  <li>• Options hedge: Sell Poly Yes, buy calls</li>
                  <li>• Monitor cross-platform spreads</li>
                  <li>• Daily markets for short-term alpha</li>
                  <li>• $137.6M BTC volume = high liquidity</li>
                </ul>
              </div>
            </div>
          </GridCard>

        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-[var(--border-grid)]">
          <div className="flex items-center justify-between text-[var(--ink-tertiary)]">
            <span className="label-micro">LIVE DATA: POLYMARKET VIA JLABS MCP | {data.lastUpdated}</span>
            <span className="label-micro">THIS IS NOT FINANCIAL ADVICE • PREDICTION MARKETS INVOLVE RISK</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
