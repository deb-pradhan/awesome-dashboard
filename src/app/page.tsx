'use client';

import { useMemo } from 'react';
import { 
  GridCard, 
  MetricCard, 
  TrendingUp,
  BarChart3,
  PieChartIcon,
  Activity,
  Layers,
  Shield,
  Zap,
} from '@/components/GridCard';
import {
  PriceTargetChart,
  SentimentGauge,
  VolumeBreakdownChart,
  RiskProbabilityBars,
  RecentTradesList,
  RaceMarketsChart,
  ComparisonMarketsChart,
  ExoticMarketsChart,
  KeyObservationsList,
} from '@/components/PolymarketCharts';
import { useEnrichedPolymarketData } from '@/lib/hooks/usePolymarketData';
import type { PolymarketData } from '@/lib/types';

export default function Dashboard() {
  // Use SWR hooks for data fetching with automatic polling
  const { data, isLoading, error, insights } = useEnrichedPolymarketData();

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-[var(--surface-canvas)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="w-16 h-16 border-2 border-[var(--color-accent-main)] rounded-full mx-auto" />
          </div>
          <span className="label-micro text-[var(--ink-secondary)]">LOADING LIVE DATA...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[var(--surface-canvas)] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <span className="label-micro text-[var(--ink-secondary)]">UNABLE TO LOAD DATA</span>
          <p className="text-sm text-[var(--ink-tertiary)] mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  const { summary, markets, tradeFlow, analysis, volumeBreakdown, metadata } = data;
  const formattedDate = new Date(metadata.fetchedAt).toLocaleString();

  return (
    <div className="min-h-screen bg-[var(--surface-canvas)]">
      {/* Simple Header Bar */}
      <nav className="sticky top-0 z-50 bg-[var(--surface-card)] border-b border-[var(--border-grid)] shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">◈</span>
              <span className="h1-title text-[var(--color-accent-main)]">CryptoLens</span>
            </div>
            <div className="flex items-center gap-4">
              {formattedDate && (
                <div className="hidden lg:flex items-center gap-2 text-[var(--ink-tertiary)]">
                  <span className="label-micro">LAST UPDATED:</span>
                  <span className="data-numerical text-xs">{formattedDate}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-[var(--signal-warning)] animate-pulse' : 'bg-[var(--signal-success)]'}`} />
                <span className="label-micro text-[var(--ink-secondary)]">
                  {isLoading ? 'UPDATING' : 'LIVE'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6">
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-[var(--signal-error)] text-white rounded">
            Error loading data. Showing cached data.
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-baseline gap-4 mb-2">
            <h1 className="display-xl text-[var(--ink-primary)]">BTC POLY MARKET OVERVIEW</h1>
            <span className={`label-micro ${isLoading ? 'text-[var(--signal-warning)]' : 'text-[var(--signal-success)]'}`}>
              {isLoading ? '◌ UPDATING' : '● LIVE'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[var(--ink-secondary)]">
            <span className="body-text">{formattedDate}</span>
            <span className="text-[var(--border-grid)]">|</span>
            <span className="label-micro">SOURCE: {metadata.source.toUpperCase()}</span>
            <span className="text-[var(--border-grid)]">|</span>
            <span className="label-micro">{metadata.totalMarketsFound} MARKETS • {metadata.totalBTCVolume} TOTAL</span>
          </div>
        </header>

        {/* Executive Summary Metrics - Key numbers at a glance */}
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-0">
          <MetricCard 
            label="Sentiment" 
            value={summary.tradeSentiment} 
            change={`${summary.buySellRatio.toFixed(2)}:1 ratio`} 
            trend="up" 
          />
          <MetricCard 
            label="Most Likely Up" 
            value={`${analysis.priceConsensus.mostLikelyUp.probability}%`} 
            change={analysis.priceConsensus.mostLikelyUp.target} 
            trend="up" 
          />
          <MetricCard 
            label="Most Likely Down" 
            value={`${analysis.priceConsensus.mostLikelyDown.probability}%`} 
            change={analysis.priceConsensus.mostLikelyDown.target} 
            trend="down" 
          />
          <MetricCard 
            label="Current Price" 
            value={`$${analysis.priceConsensus.currentPrice.toLocaleString()}`} 
            change="BTC/USD" 
            trend="neutral" 
          />
          <MetricCard 
            label="$80K vs $100K" 
            value={`${analysis.priceConsensus.raceAnalysis?.eightyVsHundred?.downFirst || 49}%`} 
            change="$80K first" 
            trend={analysis.priceConsensus.raceAnalysis?.eightyVsHundred?.downFirst && analysis.priceConsensus.raceAnalysis.eightyVsHundred.downFirst > 50 ? 'down' : 'up'} 
          />
          <MetricCard 
            label="$80K vs $150K" 
            value={`${analysis.priceConsensus.raceAnalysis?.eightyVsOneFifty?.downFirst || 79}%`} 
            change="$80K first" 
            trend="down" 
          />
        </section>

        {/* Main Grid - 3 column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          
          {/* Market Summary - Full width at top */}
          <GridCard title="Market Summary" icon={<Shield />} className="xl:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-[var(--signal-success)]" style={{ backgroundColor: 'rgba(0, 110, 80, 0.05)' }}>
                <span className="label-micro text-[var(--signal-success)] block mb-3">🟢 BULLISH SIGNALS</span>
                <ul className="space-y-2 body-text text-[var(--ink-primary)]">
                  <li>• {summary.buySellRatio.toFixed(2)}:1 buy/sell ratio ({tradeFlow.recentActivity.buyOrders}÷{tradeFlow.recentActivity.sellOrders} trades)</li>
                  <li>• {summary.buyRatio}% of trades are buys</li>
                  <li>• MicroStrategy holding confidence: {(100 - (markets.corporate.microstrategy.sellsByDate.outcomes[0].probability ?? markets.corporate.microstrategy.sellsByDate.outcomes[0].yesProbability ?? 0)).toFixed(1)}%</li>
                  <li>• Only {markets.corporate.microstrategy.forcedLiquidation.probability ?? markets.corporate.microstrategy.forcedLiquidation.yesProbability ?? 0}% forced liquidation risk</li>
                </ul>
              </div>
              <div className="p-4 border border-[var(--signal-error)]" style={{ backgroundColor: 'rgba(179, 38, 30, 0.05)' }}>
                <span className="label-micro text-[var(--signal-error)] block mb-3">🔴 BEARISH SIGNALS</span>
                <ul className="space-y-2 body-text text-[var(--ink-primary)]">
                  <li>• {analysis.priceConsensus.raceAnalysis?.eightyVsOneFifty?.downFirst || 79}% chance $80K hit before $150K</li>
                  <li>• {analysis.priceConsensus.mostLikelyDown.probability}% chance to drop to {analysis.priceConsensus.mostLikelyDown.target}</li>
                  <li>• {markets.comparison?.btcVsGold?.btcOutperforms ?? 0}% vs Gold outperformance probability</li>
                  <li>• Government reserve probability &lt;1%</li>
                </ul>
              </div>
              <div className="p-4 border border-[var(--border-element)]">
                <span className="label-micro text-[var(--ink-secondary)] block mb-3">📊 KEY TAKEAWAYS</span>
                <ul className="space-y-2 body-text text-[var(--ink-primary)]">
                  <li>• Total market volume: {metadata.totalBTCVolume}</li>
                  <li>• Price targets dominate: {(volumeBreakdown.categories ?? volumeBreakdown.byCategory ?? [])[0]?.percentage.toFixed(1) ?? '—'}% of volume</li>
                  <li>• Strong accumulation pattern in trade flow</li>
                  <li>• Low systemic risk from corporate holders</li>
                </ul>
              </div>
            </div>
          </GridCard>

          {/* BTC Price Target Probabilities */}
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
                {analysis.priceConsensus.impliedRange.confidence ?? 'See price targets above.'}
              </p>
            </div>
          </GridCard>

          {/* Key Observations */}
          {analysis.tradingInsight.keyObservations && (
            <GridCard title="Key Observations" icon={<Zap />}>
              <KeyObservationsList observations={analysis.tradingInsight.keyObservations} />
              <div className="mt-4 p-3 bg-[var(--color-accent-subtle)] border border-[var(--color-accent-main)]">
                <span className="label-micro text-[var(--color-accent-main)]">RECOMMENDATION</span>
                <p className="body-text text-[var(--ink-primary)] mt-1">
                  {analysis.tradingInsight.recommendation}
                </p>
              </div>
            </GridCard>
          )}

          {/* Race to Price Markets */}
          {markets.raceToPrice && (
            <GridCard title="Race to Price" icon={<Activity />} className="xl:col-span-2">
              <RaceMarketsChart markets={markets.raceToPrice.markets} />
              {analysis.priceConsensus.raceAnalysis && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="p-3 border border-[var(--border-element)]">
                    <span className="label-micro text-[var(--ink-secondary)]">$80K vs $100K</span>
                    <p className="body-text text-[var(--ink-primary)] mt-1 text-sm">
                      {analysis.priceConsensus.raceAnalysis.eightyVsHundred?.interpretation}
                    </p>
                  </div>
                  <div className="p-3 border border-[var(--border-element)]">
                    <span className="label-micro text-[var(--ink-secondary)]">$80K vs $150K</span>
                    <p className="body-text text-[var(--ink-primary)] mt-1 text-sm">
                      {analysis.priceConsensus.raceAnalysis.eightyVsOneFifty?.interpretation}
                    </p>
                  </div>
                </div>
              )}
            </GridCard>
          )}


          {/* Trade Flow Sentiment */}
          <GridCard 
            title={`Trade Flow Sentiment (${tradeFlow.recentActivity.totalTrades} trades)`} 
            icon={<BarChart3 />}
          >
            <SentimentGauge
              buyRatio={summary.buyRatio}
              sellRatio={summary.sellRatio}
              buySellRatio={summary.buySellRatio}
              buyOrders={tradeFlow.recentActivity.buyOrders}
              sellOrders={tradeFlow.recentActivity.sellOrders}
            />
            <div className="mt-4 p-3 bg-[var(--color-accent-subtle)] border border-[var(--color-accent-main)]">
              <span className="label-micro text-[var(--color-accent-main)]">INSIGHT</span>
              <p className="body-text text-[var(--ink-primary)] mt-1">
                {analysis.tradingInsight.rationale}
              </p>
            </div>
          </GridCard>

          {/* Comparison Markets */}
          {markets.comparison && (
            <GridCard title="BTC vs Traditional Assets" icon={<TrendingUp />}>
              <ComparisonMarketsChart
                comparisons={[
                  ...(markets.comparison.outperformGold ? [{
                    label: markets.comparison.outperformGold.marketName,
                    yesProbability: markets.comparison.outperformGold.yesProbability,
                    volume: markets.comparison.outperformGold.volume,
                  }] : []),
                  ...(markets.comparison.outperformSP500Dec ? [{
                    label: markets.comparison.outperformSP500Dec.marketName,
                    yesProbability: markets.comparison.outperformSP500Dec.yesProbability,
                    volume: markets.comparison.outperformSP500Dec.volume,
                  }] : []),
                  ...(markets.comparison.moreValuableThanCompany ? [{
                    label: markets.comparison.moreValuableThanCompany.marketName,
                    yesProbability: markets.comparison.moreValuableThanCompany.yesProbability,
                  }] : []),
                ]}
              />
              {markets.comparison.btcVsGold && (
                <div className="mt-4 p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
                  <span className="label-micro text-[var(--ink-secondary)]">BTC VS GOLD</span>
                  <p className="body-text text-[var(--ink-primary)] mt-1">
                    {markets.comparison.btcVsGold.note || `BTC outperforms: ${markets.comparison?.btcVsGold?.btcOutperforms ?? 0}%`}
                  </p>
                </div>
              )}
            </GridCard>
          )}

          {/* Exotic Markets */}
          {markets.exotic && (
            <GridCard title="Exotic Markets" icon={<Layers />}>
              <ExoticMarketsChart
                markets={[
                  ...(markets.exotic.satoshiMovement ? [{
                    name: markets.exotic.satoshiMovement.marketName,
                    probability: markets.exotic.satoshiMovement.yesProbability,
                    volume: markets.exotic.satoshiMovement.volume,
                    description: markets.exotic.satoshiMovement.description,
                  }] : []),
                  ...(markets.exotic.chinaUnban ? [{
                    name: markets.exotic.chinaUnban.marketName,
                    probability: markets.exotic.chinaUnban.yesProbability,
                    description: markets.exotic.chinaUnban.description,
                  }] : []),
                ]}
              />
              {analysis.exoticRisks && (
                <div className="mt-4 p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
                  <span className="label-micro text-[var(--ink-secondary)]">ASSESSMENT</span>
                  <p className="body-text text-[var(--ink-primary)] mt-1">
                    {analysis.exoticRisks.consensus}
                  </p>
                </div>
              )}
            </GridCard>
          )}

          {/* Technical Upgrades */}
          {markets.technical && (
            <GridCard title="Protocol Upgrades" icon={<Shield />}>
              <RiskProbabilityBars
                items={[
                  ...(markets.technical.opCtvOpCat?.outcomes?.map(o => ({
                    label: `Bitcoin ${o.outcome}`,
                    probability: o.yesProbability,
                    description: markets.technical?.opCtvOpCat?.description,
                  })) || []),
                  ...(markets.technical.sha256Replacement ? [{
                    label: markets.technical.sha256Replacement.marketName,
                    probability: markets.technical.sha256Replacement.yesProbability || 7,
                    description: markets.technical.sha256Replacement.description,
                  }] : []),
                ]}
              />
              {analysis.technicalUpgrades && (
                <div className="mt-4 p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
                  <span className="label-micro text-[var(--ink-secondary)]">ASSESSMENT</span>
                  <p className="body-text text-[var(--ink-primary)] mt-1">
                    {analysis.technicalUpgrades.consensus}
                  </p>
                </div>
              )}
            </GridCard>
          )}

          {/* Volume Distribution */}
          <GridCard title="Volume by Category" icon={<PieChartIcon />}>
            <VolumeBreakdownChart 
              data={volumeBreakdown.categories ?? volumeBreakdown.byCategory ?? []} 
              total={volumeBreakdown.total}
            />
          </GridCard>

          {/* MicroStrategy Risk */}
          <GridCard title="MicroStrategy Risk Assessment" icon={<Shield />}>
            <RiskProbabilityBars
              items={[
                { 
                  label: 'Sells BTC by Dec 31, 2025', 
                  probability: markets.corporate.microstrategy.sellsByDate.outcomes[0].probability ?? markets.corporate.microstrategy.sellsByDate.outcomes[0].yesProbability ?? 0,
                },
                { 
                  label: 'Forced Liquidation in 2025', 
                  probability: markets.corporate.microstrategy.forcedLiquidation.probability ?? markets.corporate.microstrategy.forcedLiquidation.yesProbability ?? 0,
                },
                { 
                  label: 'Margin Call in 2025', 
                  probability: markets.corporate.microstrategy.marginCall.probability ?? markets.corporate.microstrategy.marginCall.yesProbability ?? 0,
                },
              ]}
            />
            <div className="mt-4 p-3 bg-[var(--surface-subtle)] border border-[var(--signal-success)]">
              <span className="label-micro text-[var(--signal-success)]">CONSENSUS</span>
              <p className="body-text text-[var(--ink-primary)] mt-1">
                MicroStrategy holding confidence: {(100 - (markets.corporate.microstrategy.sellsByDate.outcomes[0].probability ?? markets.corporate.microstrategy.sellsByDate.outcomes[0].yesProbability ?? 0)).toFixed(1)}% by EOY 2025
              </p>
            </div>
          </GridCard>

          {/* Government Action */}
          <GridCard title="Government BTC Reserve Probability" icon={<Layers />}>
            <RiskProbabilityBars
              items={[
                { 
                  label: 'US National Bitcoin Reserve', 
                  probability: markets.government.usNationalReserve.probability ?? markets.government.usNationalReserve.yesProbability ?? 0,
                  description: markets.government.usNationalReserve.description,
                },
                { 
                  label: 'Texas Reserve Act (H.B. 1598)', 
                  probability: markets.government.texasReserve.probability ?? markets.government.texasReserve.yesProbability ?? 0,
                },
                { 
                  label: 'Senate Bill (1M BTC Purchase)', 
                  probability: markets.government.senateBill.probability ?? markets.government.senateBill.yesProbability ?? 0,
                },
              ]}
            />
            <div className="mt-4 p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
              <span className="label-micro text-[var(--ink-secondary)]">ASSESSMENT</span>
              <p className="body-text text-[var(--ink-primary)] mt-1">
                Government reserve adoption remains very unlikely (&lt;1% across all markets)
              </p>
            </div>
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
          </GridCard>

          {/* Recent Trades */}
          <GridCard title="Recent Trades" icon={<Activity />} noPadding>
            <RecentTradesList trades={tradeFlow.recentTrades} />
          </GridCard>

          {/* Key Observations */}
          <GridCard title="Key Observations" icon={<Zap />} className="xl:col-span-2">
            <KeyObservationsList observations={analysis.keyObservations ?? []} />
          </GridCard>

        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-[var(--border-grid)]">
          <div className="flex items-center justify-between text-[var(--ink-tertiary)]">
            <span className="label-micro">DATA: {metadata.source.toUpperCase()} | {formattedDate}</span>
            <span className="label-micro">THIS IS NOT FINANCIAL ADVICE • PREDICTION MARKETS INVOLVE RISK</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
