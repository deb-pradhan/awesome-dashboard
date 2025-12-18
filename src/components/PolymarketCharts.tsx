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
} from 'recharts';

const ACCENT = '#3A2E6F';
const ACCENT_LIGHT = '#4D4085';
const INK_SECONDARY = '#585C65';
const BORDER_ELEMENT = '#E0E2E6';
const SUCCESS = '#006E50';
const ERROR = '#B3261E';
const WARNING = '#E6B000';

interface ProbabilityChartProps {
  data: { target: string; probability: number; volume: number; type: string }[];
}

export function ProbabilityChart({ data }: ProbabilityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 70, bottom: 5 }}>
        <CartesianGrid strokeDasharray="0" stroke={BORDER_ELEMENT} horizontal={false} vertical={true} />
        <XAxis
          type="number"
          tickFormatter={(v) => `${v}%`}
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
          domain={[0, 35]}
        />
        <YAxis
          type="category"
          dataKey="target"
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: INK_SECONDARY }}
          axisLine={false}
          tickLine={false}
          width={65}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const item = data.find(d => d.target === label);
              return (
                <div className="bg-[var(--surface-card)] border border-[var(--border-grid)] p-3">
                  <p className="label-micro text-[var(--ink-secondary)] mb-2">{label}</p>
                  <p className="data-numerical" style={{ color: item?.type === 'up' ? SUCCESS : ERROR }}>
                    Probability: {item?.probability}%
                  </p>
                  <p className="data-numerical text-[var(--ink-secondary)]">
                    Volume: ${((item?.volume || 0) / 1e6).toFixed(2)}M
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="probability" fill="none" stroke={ACCENT} strokeWidth={1} barSize={14}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.type === 'up' ? `url(#probHatchUp)` : `url(#probHatchDown)`}
              stroke={entry.type === 'up' ? SUCCESS : ERROR}
              strokeWidth={1}
            />
          ))}
        </Bar>
        <defs>
          <pattern id="probHatchUp" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke={SUCCESS} strokeWidth="0.5" opacity="0.4" />
          </pattern>
          <pattern id="probHatchDown" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke={ERROR} strokeWidth="0.5" opacity="0.4" />
          </pattern>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface TradeFlowChartProps {
  buys: number;
  sells: number;
  buyVolume: number;
  sellVolume: number;
}

export function TradeFlowChart({ buys, sells, buyVolume, sellVolume }: TradeFlowChartProps) {
  const data = [
    { name: 'Buys', count: buys, volume: buyVolume },
    { name: 'Sells', count: sells, volume: sellVolume },
  ];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="0" stroke={BORDER_ELEMENT} />
        <XAxis
          dataKey="name"
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
        />
        <YAxis
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const item = data.find(d => d.name === label);
              return (
                <div className="bg-[var(--surface-card)] border border-[var(--border-grid)] p-3">
                  <p className="label-micro text-[var(--ink-secondary)] mb-2">{label}</p>
                  <p className="data-numerical" style={{ color: label === 'Buys' ? SUCCESS : ERROR }}>
                    Count: {item?.count}
                  </p>
                  <p className="data-numerical text-[var(--ink-secondary)]">
                    Volume: ${item?.volume}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="count" fill="none" strokeWidth={1}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.name === 'Buys' ? `url(#buyHatch)` : `url(#sellHatch)`}
              stroke={entry.name === 'Buys' ? SUCCESS : ERROR}
              strokeWidth={1}
            />
          ))}
        </Bar>
        <defs>
          <pattern id="buyHatch" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke={SUCCESS} strokeWidth="0.5" opacity="0.5" />
          </pattern>
          <pattern id="sellHatch" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke={ERROR} strokeWidth="0.5" opacity="0.5" />
          </pattern>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ArbitrageChartProps {
  data: { 
    market: string; 
    polymarket: { yes: number; no: number }; 
    spread: number;
    type: string;
  }[];
}

export function ArbitrageChart({ data }: ArbitrageChartProps) {
  const chartData = data.map(d => ({
    market: d.market.slice(0, 20) + '...',
    polymarket: d.polymarket.yes,
    spread: d.spread,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 60 }}>
        <CartesianGrid strokeDasharray="0" stroke={BORDER_ELEMENT} />
        <XAxis
          dataKey="market"
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
          angle={-45}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tickFormatter={(v) => `${v}%`}
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-[var(--surface-card)] border border-[var(--border-grid)] p-3">
                  <p className="data-numerical text-[var(--color-accent-main)]">
                    Polymarket: {payload[0]?.value}%
                  </p>
                  <p className="data-numerical text-[var(--signal-success)]">
                    Spread: {payload[1]?.value}%
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="polymarket" fill={`url(#arbHatch1)`} stroke={ACCENT} strokeWidth={1} />
        <Bar dataKey="spread" fill={`url(#arbHatch2)`} stroke={SUCCESS} strokeWidth={1} />
        <defs>
          <pattern id="arbHatch1" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke={ACCENT} strokeWidth="0.5" opacity="0.4" />
          </pattern>
          <pattern id="arbHatch2" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke={SUCCESS} strokeWidth="0.5" opacity="0.6" />
          </pattern>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface VolumeDistributionChartProps {
  data: { category: string; volume: number }[];
}

export function VolumeDistributionChart({ data }: VolumeDistributionChartProps) {
  const COLORS = [ACCENT, SUCCESS, '#6B5B95', WARNING, ERROR, '#88B04B'];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={90}
          paddingAngle={2}
          dataKey="volume"
          nameKey="category"
          stroke={ACCENT}
          strokeWidth={1}
        >
          {data.map((_, index) => (
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
              const item = payload[0];
              return (
                <div className="bg-[var(--surface-card)] border border-[var(--border-grid)] p-3">
                  <p className="label-micro text-[var(--ink-secondary)] mb-2">{item.name}</p>
                  <p className="data-numerical text-[var(--color-accent-main)]">
                    ${((item.value as number) / 1e6).toFixed(1)}M
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
          {data.map((_, index) => (
            <pattern key={index} id={`volHatch${index}`} patternUnits="userSpaceOnUse" width="4" height="4">
              <path 
                d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" 
                stroke={COLORS[index % COLORS.length]} 
                strokeWidth="0.5" 
                opacity={0.3 + (index * 0.1)} 
              />
            </pattern>
          ))}
        </defs>
      </PieChart>
    </ResponsiveContainer>
  );
}

