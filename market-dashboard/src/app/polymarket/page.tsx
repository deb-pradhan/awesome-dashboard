'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  GridCard, 
  MetricCard, 
  DataTable,
  TrendingUp,
  BarChart3,
  PieChartIcon,
  Activity,
  Layers,
  Shield,
  Zap,
} from '@/components/GridCard';
import { Navbar } from '@/components/Navbar';
import {
  PriceTargetChart,
  SentimentGauge,
  VolumeBreakdownChart,
  RiskProbabilityBars,
  RecentTradesList,
  ImpliedRangeChart,
} from '@/components/PolymarketCharts';
import type { PolymarketData } from '@/lib/types';

// Default/fallback data
const defaultData: PolymarketData | null = null;

export default function PolymarketPage() {
  const [data, setData] = useState<PolymarketData | null>(defaultData);
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

  if (!data) {
    return (
      <div className="min-h-screen bg-[var(--surface-canvas)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="w-16 h-16 border-2 border-[var(--color-accent-main)] rounded-full mx-auto" />
          </div>
          <span className="label-micro text-[var(--ink-secondary)]">LOADING POLYMARKET DATA...</span>
        </div>
      </div>
    );
  }

  const { summary, markets, tradeFlow, analysis, volumeBreakdown, metadata } = data;
  const formattedDate = new Date(metadata.fetchedAt).toLocaleString();

  return (
    <div className="min-h-screen bg-[var(--surface-canvas)]">
      {/* Navbar */}
      <Navbar 
        onRefresh={fetchData} 
        isLoading={isLoading} 
        lastUpdated={formattedDate} 
      />

      <div className="p-6">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-[var(--signal-error)] text-white rounded">
            Error: {error}. Showing cached data.
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-baseline gap-4 mb-2">
            <h1 className="display-xl text-[var(--ink-primary)]">Polymarket BTC Predictions</h1>
            <span className={`label-micro ${isLoading ? 'text-[var(--signal-warning)]' : 'text-[var(--signal-success)]'}`}>
              {isLoading ? '◌ UPDATING' : '● LIVE'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[var(--ink-secondary)]">
            <span className="body-text">{formattedDate}</span>
            <span className="text-[var(--border-grid)]">|</span>
            <span className="label-micro">SOURCE: {metadata.source.toUpperCase()}</span>
            <span className="text-[var(--border-grid)]">|</span>
            <span className="label-micro">{metadata.totalMarketsFound} MARKETS FOUND</span>
          </div>
        </header>

        {/* Executive Summary Metrics - Key numbers at a glance */}
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-0">
          <MetricCard 
            label="Total Volume" 
            value={`$${(volumeBreakdown.total / 1e6).toFixed(1)}M`} 
            change={`${summary.totalMarkets} markets`} 
            trend="neutral" 
          />
          <MetricCard 
            label="Price Markets" 
            value={summary.priceMarketsVolume} 
            change={`${markets.priceTargets.outcomeCount} outcomes`} 
            trend="neutral" 
          />
          <MetricCard 
            label="Sentiment" 
            value={summary.tradeSentiment} 
            change={`${summary.buySellRatio.toFixed(2)}:1 ratio`} 
            trend="up" 
          />
          <MetricCard 
            label="Most Likely Up" 
            value={`${analysis.priceConsensus.mostLikely.upProbability}%`} 
            change={analysis.priceConsensus.mostLikely.upTarget} 
            trend="up" 
          />
          <MetricCard 
            label="Most Likely Down" 
            value={`${analysis.priceConsensus.mostLikely.downProbability}%`} 
            change={analysis.priceConsensus.mostLikely.downTarget} 
            trend="down" 
          />
          <MetricCard 
            label="Current Price" 
            value={`$${analysis.priceConsensus.currentPrice.toLocaleString()}`} 
            change="BTC/USD" 
            trend="neutral" 
          />
        </section>

        {/* Main Grid - 3 column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          
          {/* BTC Price Target Probabilities - Most important chart, full width */}
          <GridCard 
            title={`${markets.priceTargets.marketName} (by ${markets.priceTargets.endDate})`} 
            icon={<TrendingUp />} 
            className="xl:col-span-2"
          >
            <PriceTargetChart 
              upTargets={markets.priceTargets.outcomes.active.upTargets}
              downTargets={markets.priceTargets.outcomes.active.downTargets}
              currentPrice={analysis.priceConsensus.currentPrice}
            />
            <div className="mt-4 p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
              <span className="label-micro text-[var(--ink-secondary)]">MARKET CONSENSUS</span>
              <p className="body-text text-[var(--ink-primary)] mt-1">
                {analysis.priceConsensus.impliedRange.confidence}
              </p>
            </div>
          </GridCard>

          {/* Implied Price Range */}
          <GridCard title="Implied Price Range" icon={<Activity />}>
            <ImpliedRangeChart
              currentPrice={analysis.priceConsensus.currentPrice}
              high={analysis.priceConsensus.impliedRange.high}
              low={analysis.priceConsensus.impliedRange.low}
              upProbability={analysis.priceConsensus.mostLikely.upProbability}
              downProbability={analysis.priceConsensus.mostLikely.downProbability}
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 border border-[var(--signal-success)]" style={{ backgroundColor: 'rgba(0, 110, 80, 0.05)' }}>
                <span className="label-micro text-[var(--signal-success)]">UPSIDE TARGET</span>
                <span className="data-numerical text-[var(--ink-primary)] block text-lg">
                  ${analysis.priceConsensus.impliedRange.high.toLocaleString()}
                </span>
              </div>
              <div className="p-3 border border-[var(--signal-error)]" style={{ backgroundColor: 'rgba(179, 38, 30, 0.05)' }}>
                <span className="label-micro text-[var(--signal-error)]">DOWNSIDE TARGET</span>
                <span className="data-numerical text-[var(--ink-primary)] block text-lg">
                  ${analysis.priceConsensus.impliedRange.low.toLocaleString()}
                </span>
              </div>
            </div>
          </GridCard>

          {/* Trade Flow Sentiment */}
          <GridCard 
            title={`Trade Flow Sentiment (${tradeFlow.summary.totalTradesAnalyzed} trades)`} 
            icon={<BarChart3 />}
          >
            <SentimentGauge
              buyRatio={tradeFlow.summary.buyPercentage}
              sellRatio={tradeFlow.summary.sellPercentage}
              buySellRatio={tradeFlow.summary.buySellRatio}
              buyOrders={tradeFlow.summary.buyOrders}
              sellOrders={tradeFlow.summary.sellOrders}
            />
            <div className="mt-4 p-3 bg-[var(--color-accent-subtle)] border border-[var(--color-accent-main)]">
              <span className="label-micro text-[var(--color-accent-main)]">INSIGHT</span>
              <p className="body-text text-[var(--ink-primary)] mt-1">
                {analysis.tradingInsight.rationale}
              </p>
            </div>
          </GridCard>

          {/* Volume Distribution */}
          <GridCard title="Volume by Category" icon={<PieChartIcon />}>
            <VolumeBreakdownChart 
              data={volumeBreakdown.byCategory} 
              total={volumeBreakdown.total}
            />
          </GridCard>

          {/* MicroStrategy Risk */}
          <GridCard title="MicroStrategy Risk Assessment" icon={<Shield />}>
            <RiskProbabilityBars
              items={[
                { 
                  label: 'Sells BTC by Dec 31, 2025', 
                  probability: analysis.corporateRisk.microstrategyHolding.sellBy2025EndProbability,
                },
                { 
                  label: 'Forced Liquidation in 2025', 
                  probability: analysis.corporateRisk.microstrategyHolding.forcedLiquidationProbability,
                },
                { 
                  label: 'Margin Call in 2025', 
                  probability: analysis.corporateRisk.microstrategyHolding.marginCallProbability,
                },
              ]}
            />
            <div className="mt-4 p-3 bg-[var(--surface-subtle)] border border-[var(--signal-success)]">
              <span className="label-micro text-[var(--signal-success)]">CONSENSUS</span>
              <p className="body-text text-[var(--ink-primary)] mt-1">
                {analysis.corporateRisk.microstrategyHolding.consensus}
              </p>
            </div>
          </GridCard>

          {/* Government Action */}
          <GridCard title="Government BTC Reserve Probability" icon={<Layers />}>
            <RiskProbabilityBars
              items={[
                { 
                  label: 'US National Bitcoin Reserve', 
                  probability: analysis.governmentAction.usReserveProbability,
                  description: markets.government.usNationalReserve.description,
                },
                { 
                  label: 'Texas Reserve Act (H.B. 1598)', 
                  probability: analysis.governmentAction.texasReserveProbability,
                },
                { 
                  label: 'Senate Bill (1M BTC Purchase)', 
                  probability: analysis.governmentAction.senateBillProbability,
                },
              ]}
            />
            <div className="mt-4 p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
              <span className="label-micro text-[var(--ink-secondary)]">ASSESSMENT</span>
              <p className="body-text text-[var(--ink-primary)] mt-1">
                {analysis.governmentAction.consensus}
              </p>
            </div>
          </GridCard>

          {/* Recent Trades */}
          <GridCard title="Recent Trades" icon={<Activity />} noPadding>
            <RecentTradesList trades={tradeFlow.recentTrades} />
          </GridCard>

          {/* Active Markets Table */}
          <GridCard title="Active Trading Markets" icon={<Zap />} className="xl:col-span-2" noPadding>
            <DataTable 
              headers={['Market', 'Trades', 'Buys', 'Sells', 'Volume', 'Sentiment']}
              rows={tradeFlow.activeMarkets.slice(0, 6).map(m => [
                <span key={m.market} className="text-xs max-w-[200px] truncate block">{m.market}</span>,
                <span key={`t-${m.market}`} className="data-numerical">{m.trades}</span>,
                <span key={`b-${m.market}`} className="text-[var(--signal-success)]">{m.buys}</span>,
                <span key={`s-${m.market}`} className="text-[var(--signal-error)]">{m.sells}</span>,
                <span key={`v-${m.market}`} className="data-numerical">${m.volume}</span>,
                <span 
                  key={`sent-${m.market}`} 
                  className={`label-micro px-2 py-1 rounded ${
                    m.sentiment === 'BULLISH' 
                      ? 'bg-[rgba(0,110,80,0.1)] text-[var(--signal-success)]' 
                      : 'bg-[rgba(179,38,30,0.1)] text-[var(--signal-error)]'
                  }`}
                >
                  {m.sentiment}
                </span>,
              ])}
            />
          </GridCard>

          {/* Trading Strategies */}
          <GridCard title="Suggested Strategies" icon={<Zap />}>
            <div className="space-y-3">
              {analysis.tradingInsight.suggestedStrategies.map((strategy, i) => (
                <div key={i} className="p-3 border border-[var(--border-element)] hover:border-[var(--color-accent-main)] transition-colors">
                  <span className="body-text text-[var(--ink-primary)]">{strategy}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-[var(--color-accent-subtle)] border border-[var(--color-accent-main)]">
              <span className="label-micro text-[var(--color-accent-main)]">RECOMMENDATION</span>
              <p className="body-text text-[var(--ink-primary)] mt-1">
                {analysis.tradingInsight.recommendation}
              </p>
            </div>
          </GridCard>

          {/* Market Summary - Full width */}
          <GridCard title="Market Summary" icon={<Shield />} className="xl:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--signal-success)]" style={{ backgroundColor: 'rgba(0, 110, 80, 0.05)' }}>
                <span className="label-micro text-[var(--signal-success)] block mb-3">🟢 BULLISH SIGNALS</span>
                <ul className="space-y-2 body-text text-[var(--ink-primary)]">
                  <li>• {tradeFlow.summary.buySellRatio.toFixed(2)}:1 buy/sell ratio ({tradeFlow.summary.buyOrders}÷{tradeFlow.summary.sellOrders} trades)</li>
                  <li>• {tradeFlow.summary.buyPercentage}% of trades are buys</li>
                  <li>• MicroStrategy holding confidence: {(100 - analysis.corporateRisk.microstrategyHolding.sellBy2025EndProbability).toFixed(1)}%</li>
                  <li>• Only {analysis.corporateRisk.microstrategyHolding.forcedLiquidationProbability}% forced liquidation risk</li>
                </ul>
              </div>
              <div className="p-4 border border-[var(--signal-error)]" style={{ backgroundColor: 'rgba(179, 38, 30, 0.05)' }}>
                <span className="label-micro text-[var(--signal-error)] block mb-3">🔴 BEARISH SIGNALS</span>
                <ul className="space-y-2 body-text text-[var(--ink-primary)]">
                  <li>• Only {analysis.priceConsensus.mostLikely.upProbability}% chance to hit {analysis.priceConsensus.mostLikely.upTarget}</li>
                  <li>• {analysis.priceConsensus.mostLikely.downProbability}% chance BTC drops to {analysis.priceConsensus.mostLikely.downTarget}</li>
                  <li>• Limited upside per market consensus</li>
                  <li>• Government reserve probability &lt;1%</li>
                </ul>
              </div>
              <div className="p-4 border border-[var(--border-element)]">
                <span className="label-micro text-[var(--ink-secondary)] block mb-3">📊 KEY TAKEAWAYS</span>
                <ul className="space-y-2 body-text text-[var(--ink-primary)]">
                  <li>• Total market volume: ${(volumeBreakdown.total / 1e6).toFixed(1)}M</li>
                  <li>• Price targets dominate: {volumeBreakdown.byCategory[0]?.percentage.toFixed(1)}% of volume</li>
                  <li>• Strong accumulation pattern in trade flow</li>
                  <li>• Low systemic risk from corporate holders</li>
                </ul>
              </div>
            </div>
          </GridCard>

        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-[var(--border-grid)]">
          <div className="flex items-center justify-between text-[var(--ink-tertiary)]">
            <span className="label-micro">LIVE DATA: {metadata.source.toUpperCase()} | {formattedDate}</span>
            <span className="label-micro">THIS IS NOT FINANCIAL ADVICE • PREDICTION MARKETS INVOLVE RISK</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
