'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ReferenceLine,
} from 'recharts';
import type { PriceTarget, VolumeBreakdownItem, RecentTrade } from '@/lib/types';

const ACCENT = '#3A2E6F';
const INK_SECONDARY = '#585C65';
const BORDER_ELEMENT = '#E0E2E6';
const SUCCESS = '#006E50';
const ERROR = '#B3261E';
const WARNING = '#E6B000';

interface PriceTargetChartProps {
  upTargets: PriceTarget[];
  downTargets: PriceTarget[];
  currentPrice: number;
}

export function PriceTargetChart({ upTargets, downTargets, currentPrice }: PriceTargetChartProps) {
  // Combine and sort data - up targets show positive, down targets show as-is
  // Filter out duplicates and very low probability (<0.5%) targets for clarity
  const filteredUp = upTargets
    .filter(t => t.probability >= 0.5)
    .slice(0, 8);
  
  const filteredDown = downTargets
    .filter(t => t.probability >= 0.5)
    .slice(0, 5);

  const data = [
    ...filteredUp.map(t => ({
      target: t.target.replace('↑ ', ''),
      probability: t.probability,
      volume: t.volume,
      direction: 'up' as const,
    })),
    ...filteredDown.map(t => ({
      target: t.target.replace('↓ ', ''),
      probability: -t.probability, // Negative for downside
      volume: t.volume,
      direction: 'down' as const,
    })),
  ].sort((a, b) => {
    // Extract price from target string
    const priceA = parseInt(a.target.replace(/[$,]/g, ''));
    const priceB = parseInt(b.target.replace(/[$,]/g, ''));
    return priceB - priceA;
  });

  return (
    <ResponsiveContainer width="100%" height={380}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 40, left: 80, bottom: 10 }}>
        <CartesianGrid strokeDasharray="0" stroke={BORDER_ELEMENT} horizontal={false} vertical={true} />
        <XAxis
          type="number"
          tickFormatter={(v) => `${Math.abs(v)}%`}
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
          domain={[-20, 40]}
        />
        <YAxis
          type="category"
          dataKey="target"
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: INK_SECONDARY }}
          axisLine={false}
          tickLine={false}
          width={75}
        />
        <ReferenceLine x={0} stroke={ACCENT} strokeWidth={2} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const item = payload[0].payload;
              return (
                <div className="bg-[var(--surface-card)] border border-[var(--border-grid)] p-3 shadow-lg">
                  <p className="label-micro text-[var(--ink-secondary)] mb-2">{item.target}</p>
                  <p className="data-numerical" style={{ color: item.direction === 'up' ? SUCCESS : ERROR }}>
                    {item.direction === 'up' ? '↑' : '↓'} {Math.abs(item.probability).toFixed(1)}% probability
                  </p>
                  <p className="data-numerical text-[var(--ink-secondary)] mt-1">
                    Volume: ${(item.volume / 1e6).toFixed(2)}M
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="probability" barSize={16}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.direction === 'up' ? `url(#targetHatchUp)` : `url(#targetHatchDown)`}
              stroke={entry.direction === 'up' ? SUCCESS : ERROR}
              strokeWidth={1}
            />
          ))}
        </Bar>
        <defs>
          <pattern id="targetHatchUp" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke={SUCCESS} strokeWidth="0.5" opacity="0.5" />
          </pattern>
          <pattern id="targetHatchDown" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke={ERROR} strokeWidth="0.5" opacity="0.5" />
          </pattern>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface SentimentGaugeProps {
  buyRatio: number;
  sellRatio: number;
  buySellRatio: number;
  buyOrders: number;
  sellOrders: number;
}

export function SentimentGauge({ buyRatio, sellRatio, buySellRatio, buyOrders, sellOrders }: SentimentGaugeProps) {
  return (
    <div className="space-y-4">
      {/* Visual gauge bar */}
      <div className="relative h-8 rounded-full overflow-hidden border border-[var(--border-element)]">
        <div 
          className="absolute inset-y-0 left-0 transition-all duration-500"
          style={{ 
            width: `${buyRatio}%`,
            background: `repeating-linear-gradient(45deg, ${SUCCESS}20, ${SUCCESS}20 2px, ${SUCCESS}40 2px, ${SUCCESS}40 4px)`
          }}
        />
        <div 
          className="absolute inset-y-0 right-0 transition-all duration-500"
          style={{ 
            width: `${sellRatio}%`,
            background: `repeating-linear-gradient(-45deg, ${ERROR}20, ${ERROR}20 2px, ${ERROR}40 2px, ${ERROR}40 4px)`
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="data-numerical text-[var(--ink-primary)] font-medium bg-white/80 px-2 rounded">
            {buySellRatio.toFixed(2)}:1 Buy/Sell
          </span>
        </div>
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 border border-[var(--signal-success)]" style={{ backgroundColor: 'rgba(0, 110, 80, 0.08)' }}>
          <span className="label-micro text-[var(--signal-success)] block">BUYERS</span>
          <span className="metric-value text-2xl text-[var(--signal-success)]">{buyOrders}</span>
          <span className="data-numerical text-[var(--ink-secondary)] block">{buyRatio.toFixed(1)}%</span>
        </div>
        <div className="p-3 border border-[var(--signal-error)]" style={{ backgroundColor: 'rgba(179, 38, 30, 0.08)' }}>
          <span className="label-micro text-[var(--signal-error)] block">SELLERS</span>
          <span className="metric-value text-2xl text-[var(--signal-error)]">{sellOrders}</span>
          <span className="data-numerical text-[var(--ink-secondary)] block">{sellRatio.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}

interface VolumeBreakdownChartProps {
  data: VolumeBreakdownItem[];
  total: number;
}

export function VolumeBreakdownChart({ data, total }: VolumeBreakdownChartProps) {
  const COLORS = [ACCENT, SUCCESS, '#6B5B95', WARNING, ERROR, '#88B04B', '#45B7D1', '#F7CAC9', '#92A8D1', '#955251'];

  // Filter to show meaningful categories (>0.01%) and sort by volume
  const filteredData = data
    .filter(d => d.percentage >= 0.01)
    .sort((a, b) => b.volume - a.volume)
    .map(d => ({
      ...d,
      name: d.category,
    }));

  return (
    <div className="space-y-4">
      {/* Total volume header */}
      <div className="text-center p-4 bg-[var(--color-accent-subtle)] border border-[var(--color-accent-main)]">
        <span className="label-micro text-[var(--color-accent-main)] block mb-1">AGGREGATED VOLUME</span>
        <span className="metric-value text-3xl text-[var(--color-accent-main)]">
          ${(total / 1e6).toFixed(1)}M
        </span>
        <span className="label-micro text-[var(--ink-secondary)] block mt-1">
          {filteredData.length} market categories
        </span>
      </div>

      {/* Category list - no pie chart to avoid overlap */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {filteredData.map((item, index) => (
          <div 
            key={item.category}
            className="flex items-center gap-3 p-2 border border-[var(--border-element)] hover:border-[var(--color-accent-main)] transition-colors"
          >
            {/* Color indicator */}
            <div 
              className="w-3 h-3 flex-shrink-0"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            {/* Category name */}
            <span className="body-text text-[var(--ink-primary)] flex-1 truncate text-sm">
              {item.category}
            </span>
            {/* Volume */}
            <span className="data-numerical text-[var(--ink-primary)] text-sm">
              ${item.volume >= 1e6 ? `${(item.volume / 1e6).toFixed(1)}M` : `${(item.volume / 1e3).toFixed(0)}K`}
            </span>
            {/* Percentage bar */}
            <div className="w-16 h-2 bg-[var(--border-element)] relative">
              <div 
                className="absolute inset-y-0 left-0"
                style={{ 
                  width: `${Math.min(item.percentage, 100)}%`,
                  backgroundColor: COLORS[index % COLORS.length],
                }}
              />
            </div>
            <span className="data-numerical text-[var(--ink-secondary)] text-xs w-12 text-right">
              {item.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface RiskProbabilityProps {
  items: Array<{
    label: string;
    probability: number;
    description?: string;
  }>;
}

export function RiskProbabilityBars({ items }: RiskProbabilityProps) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between items-baseline">
            <span className="body-text text-[var(--ink-primary)] text-sm">{item.label}</span>
            <span className="data-numerical text-[var(--ink-secondary)]">{item.probability.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-[var(--surface-subtle)] rounded-full overflow-hidden border border-[var(--border-element)]">
            <div 
              className="h-full transition-all duration-500 rounded-full"
              style={{ 
                width: `${Math.min(item.probability * 10, 100)}%`, // Scale for visibility
                background: item.probability < 2 
                  ? `repeating-linear-gradient(45deg, ${SUCCESS}40, ${SUCCESS}40 2px, ${SUCCESS}60 2px, ${SUCCESS}60 4px)`
                  : item.probability < 10
                    ? `repeating-linear-gradient(45deg, ${WARNING}40, ${WARNING}40 2px, ${WARNING}60 2px, ${WARNING}60 4px)`
                    : `repeating-linear-gradient(45deg, ${ERROR}40, ${ERROR}40 2px, ${ERROR}60 2px, ${ERROR}60 4px)`
              }}
            />
          </div>
          {item.description && (
            <p className="label-micro text-[var(--ink-tertiary)]">{item.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

interface RecentTradesListProps {
  trades: RecentTrade[];
}

export function RecentTradesList({ trades }: RecentTradesListProps) {
  return (
    <div className="divide-y divide-[var(--border-element)]">
      {trades.slice(0, 8).map((trade, i) => (
        <div key={i} className="p-3 flex items-center justify-between hover:bg-[var(--surface-subtle)] transition-colors">
          <div className="flex items-center gap-3">
            <span 
              className={`label-micro px-2 py-1 rounded ${
                trade.type === 'BUY' 
                  ? 'bg-[var(--signal-success)] text-white' 
                  : 'bg-[var(--signal-error)] text-white'
              }`}
            >
              {trade.type}
            </span>
            <div>
              <span className="body-text text-[var(--ink-primary)] text-xs block">{trade.market}</span>
              <span className="label-micro text-[var(--ink-tertiary)]">{trade.outcome}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="data-numerical text-[var(--ink-primary)] block">${trade.value.toFixed(2)}</span>
            <span className="label-micro text-[var(--ink-tertiary)]">@ {(trade.price * 100).toFixed(1)}¢</span>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ImpliedRangeProps {
  currentPrice: number;
  high: number;
  low: number;
  upProbability: number;
  downProbability: number;
}

export function ImpliedRangeChart({ currentPrice, high, low, upProbability, downProbability }: ImpliedRangeProps) {
  const range = high - low;
  const currentPosition = ((currentPrice - low) / range) * 100;

  return (
    <div className="space-y-4">
      {/* Price range visualization */}
      <div className="relative pt-8 pb-4">
        {/* Labels */}
        <div className="absolute top-0 left-0 text-left">
          <span className="label-micro text-[var(--signal-error)]">↓ ${(low / 1000).toFixed(0)}K</span>
          <span className="data-numerical text-[var(--ink-secondary)] block">{downProbability.toFixed(1)}%</span>
        </div>
        <div className="absolute top-0 right-0 text-right">
          <span className="label-micro text-[var(--signal-success)]">↑ ${(high / 1000).toFixed(0)}K</span>
          <span className="data-numerical text-[var(--ink-secondary)] block">{upProbability.toFixed(1)}%</span>
        </div>
        
        {/* Range bar */}
        <div className="h-4 rounded-full overflow-hidden border border-[var(--border-element)] relative mt-6">
          <div 
            className="absolute inset-y-0 left-0"
            style={{ 
              width: '50%',
              background: `repeating-linear-gradient(-45deg, ${ERROR}15, ${ERROR}15 2px, ${ERROR}25 2px, ${ERROR}25 4px)`
            }}
          />
          <div 
            className="absolute inset-y-0 right-0"
            style={{ 
              width: '50%',
              background: `repeating-linear-gradient(45deg, ${SUCCESS}15, ${SUCCESS}15 2px, ${SUCCESS}25 2px, ${SUCCESS}25 4px)`
            }}
          />
          {/* Current price marker */}
          <div 
            className="absolute top-1/2 w-3 h-3 bg-[var(--color-accent-main)] rounded-full border-2 border-white shadow-md transform -translate-y-1/2 -translate-x-1/2 z-10"
            style={{ left: `${currentPosition}%` }}
          />
        </div>
        
        {/* Current price label */}
        <div 
          className="absolute bottom-0 transform -translate-x-1/2"
          style={{ left: `${currentPosition}%` }}
        >
          <span className="data-numerical text-[var(--color-accent-main)] text-xs">
            ${currentPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

// Race Market visualization
interface RaceMarketProps {
  markets: Array<{
    marketName: string;
    volume: number;
    outcomes: {
      option1: { target: string; probability: number };
      option2: { target: string; probability: number };
    };
    description: string;
  }>;
}

export function RaceMarketsChart({ markets }: RaceMarketProps) {
  return (
    <div className="space-y-4">
      {markets.map((market, i) => (
        <div key={i} className="p-4 border border-[var(--border-element)] hover:border-[var(--color-accent-main)] transition-colors">
          <div className="flex justify-between items-start mb-3">
            <span className="label-micro text-[var(--ink-secondary)]">{market.marketName}</span>
            <span className="label-micro text-[var(--ink-tertiary)]">${(market.volume / 1000).toFixed(0)}K vol</span>
          </div>
          
          {/* Race bar visualization */}
          <div className="relative h-10 rounded overflow-hidden border border-[var(--border-element)]">
            <div 
              className="absolute inset-y-0 left-0 flex items-center justify-start pl-3"
              style={{ 
                width: `${market.outcomes.option1.probability}%`,
                background: `repeating-linear-gradient(45deg, ${ERROR}20, ${ERROR}20 2px, ${ERROR}35 2px, ${ERROR}35 4px)`,
                borderRight: `2px solid ${ERROR}`
              }}
            >
              <span className="data-numerical text-[var(--signal-error)] text-sm font-medium">
                {market.outcomes.option1.target}
              </span>
            </div>
            <div 
              className="absolute inset-y-0 right-0 flex items-center justify-end pr-3"
              style={{ 
                width: `${market.outcomes.option2.probability}%`,
                background: `repeating-linear-gradient(-45deg, ${SUCCESS}20, ${SUCCESS}20 2px, ${SUCCESS}35 2px, ${SUCCESS}35 4px)`,
                borderLeft: `2px solid ${SUCCESS}`
              }}
            >
              <span className="data-numerical text-[var(--signal-success)] text-sm font-medium">
                {market.outcomes.option2.target}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between mt-2">
            <span className="data-numerical text-[var(--signal-error)]">{market.outcomes.option1.probability}%</span>
            <span className="data-numerical text-[var(--signal-success)]">{market.outcomes.option2.probability}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Short term direction markets
interface ShortTermMarketsProps {
  fifteenMin?: { upProbability: number; downProbability: number };
  hourly?: Array<{ marketName: string; upProbability: number; downProbability: number }>;
  dailyUpDown?: { upProbability: number; downProbability: number };
}

export function ShortTermDirectionChart({ fifteenMin, hourly, dailyUpDown }: ShortTermMarketsProps) {
  const allMarkets = [
    ...(dailyUpDown ? [{ name: 'Daily', up: dailyUpDown.upProbability, down: dailyUpDown.downProbability }] : []),
    ...(hourly?.map(h => ({ name: h.marketName.split('-').pop()?.trim() || 'Hourly', up: h.upProbability, down: h.downProbability })) || []),
    ...(fifteenMin ? [{ name: '15 Min', up: fifteenMin.upProbability, down: fifteenMin.downProbability }] : []),
  ];

  return (
    <div className="space-y-3">
      {allMarkets.map((market, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="label-micro text-[var(--ink-secondary)] w-20 truncate">{market.name}</span>
          <div className="flex-1 h-6 rounded overflow-hidden border border-[var(--border-element)] flex">
            <div 
              className="flex items-center justify-center"
              style={{ 
                width: `${market.up}%`,
                background: `repeating-linear-gradient(45deg, ${SUCCESS}25, ${SUCCESS}25 2px, ${SUCCESS}40 2px, ${SUCCESS}40 4px)`
              }}
            >
              <span className="label-micro text-[var(--signal-success)]">{market.up}%</span>
            </div>
            <div 
              className="flex items-center justify-center"
              style={{ 
                width: `${market.down}%`,
                background: `repeating-linear-gradient(-45deg, ${ERROR}25, ${ERROR}25 2px, ${ERROR}40 2px, ${ERROR}40 4px)`
              }}
            >
              <span className="label-micro text-[var(--signal-error)]">{market.down}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Comparison markets (vs Gold, S&P, etc.)
interface ComparisonMarketsProps {
  comparisons: Array<{
    label: string;
    yesProbability: number;
    volume?: number;
  }>;
}

export function ComparisonMarketsChart({ comparisons }: ComparisonMarketsProps) {
  return (
    <div className="space-y-3">
      {comparisons.map((comp, i) => (
        <div key={i} className="p-3 border border-[var(--border-element)]">
          <div className="flex justify-between items-start mb-2">
            <span className="body-text text-[var(--ink-primary)] text-sm">{comp.label}</span>
            {comp.volume && (
              <span className="label-micro text-[var(--ink-tertiary)]">${(comp.volume / 1000).toFixed(0)}K</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-3 bg-[var(--surface-subtle)] rounded-full overflow-hidden border border-[var(--border-element)]">
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: `${comp.yesProbability}%`,
                  background: comp.yesProbability > 50 
                    ? `repeating-linear-gradient(45deg, ${SUCCESS}40, ${SUCCESS}40 2px, ${SUCCESS}60 2px, ${SUCCESS}60 4px)`
                    : `repeating-linear-gradient(45deg, ${WARNING}40, ${WARNING}40 2px, ${WARNING}60 2px, ${WARNING}60 4px)`
                }}
              />
            </div>
            <span className={`data-numerical ${comp.yesProbability > 50 ? 'text-[var(--signal-success)]' : 'text-[var(--signal-warning)]'}`}>
              {comp.yesProbability}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Exotic/Special markets visualization
interface ExoticMarketsProps {
  markets: Array<{
    name: string;
    probability: number;
    volume?: number;
    description: string;
  }>;
}

export function ExoticMarketsChart({ markets }: ExoticMarketsProps) {
  return (
    <div className="space-y-3">
      {markets.map((market, i) => (
        <div key={i} className="p-3 border border-[var(--border-element)] hover:border-[var(--color-accent-main)] transition-colors">
          <div className="flex justify-between items-start mb-2">
            <span className="body-text text-[var(--ink-primary)] text-sm">{market.name}</span>
            <span className={`label-micro px-2 py-0.5 rounded ${
              market.probability < 1 
                ? 'bg-[var(--signal-success)]/10 text-[var(--signal-success)]' 
                : market.probability < 10 
                  ? 'bg-[var(--signal-warning)]/10 text-[var(--signal-warning)]'
                  : 'bg-[var(--signal-error)]/10 text-[var(--signal-error)]'
            }`}>
              {market.probability}%
            </span>
          </div>
          <p className="label-micro text-[var(--ink-tertiary)]">{market.description}</p>
          {market.volume && (
            <span className="label-micro text-[var(--ink-tertiary)] block mt-1">${(market.volume / 1e6).toFixed(1)}M volume</span>
          )}
        </div>
      ))}
    </div>
  );
}

// Key observations list
interface KeyObservationsProps {
  observations: string[];
}

export function KeyObservationsList({ observations }: KeyObservationsProps) {
  return (
    <div className="space-y-2">
      {observations.map((obs, i) => (
        <div key={i} className="flex items-start gap-2 p-2 bg-[var(--surface-subtle)] border-l-2 border-[var(--color-accent-main)]">
          <span className="label-micro text-[var(--color-accent-main)]">→</span>
          <span className="body-text text-[var(--ink-primary)] text-sm">{obs}</span>
        </div>
      ))}
    </div>
  );
}
