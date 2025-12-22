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
  const COLORS = [ACCENT, SUCCESS, '#6B5B95', WARNING, ERROR, '#88B04B', '#45B7D1'];

  // Filter to show meaningful categories (>0.05%)
  const filteredData = data.filter(d => d.percentage >= 0.05);

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={85}
            paddingAngle={2}
            dataKey="volume"
            nameKey="category"
            strokeWidth={1}
          >
            {filteredData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#volHatch${index})`}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as VolumeBreakdownItem;
                return (
                  <div className="bg-[var(--surface-card)] border border-[var(--border-grid)] p-3 shadow-lg">
                    <p className="label-micro text-[var(--ink-secondary)] mb-2">{item.category}</p>
                    <p className="data-numerical text-[var(--color-accent-main)]">
                      ${(item.volume / 1e6).toFixed(2)}M
                    </p>
                    <p className="data-numerical text-[var(--ink-secondary)]">
                      {item.percentage.toFixed(1)}% of total
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: INK_SECONDARY }}>
                {value}
              </span>
            )}
          />
          <defs>
            {filteredData.map((_, index) => (
              <pattern key={index} id={`volHatch${index}`} patternUnits="userSpaceOnUse" width="4" height="4">
                <path 
                  d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" 
                  stroke={COLORS[index % COLORS.length]} 
                  strokeWidth="0.5" 
                  opacity={0.4 + (index * 0.08)} 
                />
              </pattern>
            ))}
          </defs>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Total volume display */}
      <div className="text-center p-3 bg-[var(--surface-subtle)] border border-[var(--border-element)]">
        <span className="label-micro text-[var(--ink-secondary)] block">AGGREGATED VOLUME</span>
        <span className="metric-value text-2xl text-[var(--color-accent-main)]">
          ${(total / 1e6).toFixed(1)}M
        </span>
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
