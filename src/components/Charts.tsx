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
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend,
  ComposedChart,
  ReferenceLine,
} from 'recharts';

const ACCENT = '#3A2E6F';
const ACCENT_LIGHT = '#4D4085';
const INK_SECONDARY = '#585C65';
const INK_TERTIARY = '#9AA0A6';
const BORDER_ELEMENT = '#E0E2E6';
const SURFACE_SUBTLE = '#F5F6F8';
const SUCCESS = '#006E50';
const ERROR = '#B3261E';
const WARNING = '#E6B000';

// Color palette for multiple series
const PALETTE = [ACCENT, '#6B5B95', '#88B04B', '#F7CAC9', '#92A8D1', '#955251', '#B565A7', '#009B77'];

interface ChartTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color?: string }[];
  label?: string;
  formatter?: (value: number) => string;
}

const CustomTooltip = ({ active, payload, label, formatter }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[var(--surface-card)] border border-[var(--border-grid)] p-3">
        <p className="label-micro text-[var(--ink-secondary)] mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="data-numerical" style={{ color: entry.color || ACCENT }}>
            {entry.name}: {formatter ? formatter(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Format large numbers
const formatBillions = (value: number) => `$${(value / 1e9).toFixed(2)}B`;
const formatMillions = (value: number) => `$${(value / 1e6).toFixed(2)}M`;
const formatPercent = (value: number) => `${value.toFixed(2)}%`;
const formatNumber = (value: number) => value.toLocaleString();
const formatPrice = (value: number) => `$${value.toLocaleString()}`;

// BTC Price Candlestick-style Chart (using bars for OHLC)
interface PriceChartProps {
  data: { date: string; open: number; high: number; low: number; close: number; volume: number }[];
}

export function PriceChart({ data }: PriceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="0" stroke={BORDER_ELEMENT} />
        <XAxis 
          dataKey="date" 
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
          angle={-45}
          textAnchor="end"
          interval={2}
        />
        <YAxis 
          yAxisId="price"
          domain={['auto', 'auto']}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
        />
        <YAxis 
          yAxisId="volume"
          orientation="right"
          tickFormatter={(v) => `${(v / 1e9).toFixed(1)}B`}
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: INK_TERTIARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
        />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const item = payload[0]?.payload;
              return (
                <div className="bg-[var(--surface-card)] border border-[var(--border-grid)] p-3">
                  <p className="label-micro text-[var(--ink-secondary)] mb-2">{label}</p>
                  <p className="data-numerical">O: ${item?.open?.toLocaleString()}</p>
                  <p className="data-numerical">H: ${item?.high?.toLocaleString()}</p>
                  <p className="data-numerical">L: ${item?.low?.toLocaleString()}</p>
                  <p className="data-numerical" style={{ color: item?.close >= item?.open ? SUCCESS : ERROR }}>
                    C: ${item?.close?.toLocaleString()}
                  </p>
                  <p className="data-numerical text-[var(--ink-tertiary)]">Vol: ${(item?.volume / 1e9).toFixed(2)}B</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar 
          yAxisId="volume"
          dataKey="volume" 
          fill="none"
          stroke={INK_TERTIARY}
          strokeWidth={0.5}
          opacity={0.3}
        />
        <Line 
          yAxisId="price"
          type="monotone" 
          dataKey="close" 
          stroke={ACCENT}
          strokeWidth={1.5}
          dot={false}
        />
        <Line 
          yAxisId="price"
          type="monotone" 
          dataKey="high" 
          stroke={SUCCESS}
          strokeWidth={0.5}
          strokeDasharray="2 2"
          dot={false}
        />
        <Line 
          yAxisId="price"
          type="monotone" 
          dataKey="low" 
          stroke={ERROR}
          strokeWidth={0.5}
          strokeDasharray="2 2"
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// RSI Chart
interface RSIChartProps {
  data: { date: string; rsi: number }[];
}

export function RSIChart({ data }: RSIChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="0" stroke={BORDER_ELEMENT} />
        <XAxis 
          dataKey="date" 
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
          angle={-45}
          textAnchor="end"
          interval={2}
        />
        <YAxis 
          domain={[0, 100]}
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
          ticks={[0, 30, 50, 70, 100]}
        />
        <ReferenceLine y={70} stroke={ERROR} strokeDasharray="3 3" />
        <ReferenceLine y={30} stroke={SUCCESS} strokeDasharray="3 3" />
        <ReferenceLine y={50} stroke={INK_TERTIARY} strokeDasharray="3 3" />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const rsi = payload[0]?.value as number;
              const signal = rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral';
              const color = rsi > 70 ? ERROR : rsi < 30 ? SUCCESS : ACCENT;
              return (
                <div className="bg-[var(--surface-card)] border border-[var(--border-grid)] p-3">
                  <p className="label-micro text-[var(--ink-secondary)] mb-2">{label}</p>
                  <p className="data-numerical" style={{ color }}>RSI: {rsi?.toFixed(2)}</p>
                  <p className="label-micro" style={{ color }}>{signal}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Area 
          type="monotone" 
          dataKey="rsi" 
          stroke={ACCENT}
          strokeWidth={1.5}
          fill="url(#rsiGradient)"
        />
        <defs>
          <linearGradient id="rsiGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={ACCENT} stopOpacity={0.15}/>
            <stop offset="95%" stopColor={ACCENT} stopOpacity={0}/>
          </linearGradient>
        </defs>
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// Stochastic Chart
interface StochChartProps {
  data: { date: string; k: number; d: number }[];
}

export function StochChart({ data }: StochChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="0" stroke={BORDER_ELEMENT} />
        <XAxis 
          dataKey="date" 
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
          angle={-45}
          textAnchor="end"
          interval={2}
        />
        <YAxis 
          domain={[0, 100]}
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
          ticks={[0, 20, 50, 80, 100]}
        />
        <ReferenceLine y={80} stroke={ERROR} strokeDasharray="3 3" />
        <ReferenceLine y={20} stroke={SUCCESS} strokeDasharray="3 3" />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const k = payload.find(p => p.dataKey === 'k')?.value as number;
              const d = payload.find(p => p.dataKey === 'd')?.value as number;
              const signal = k < 20 ? 'Oversold' : k > 80 ? 'Overbought' : 'Neutral';
              return (
                <div className="bg-[var(--surface-card)] border border-[var(--border-grid)] p-3">
                  <p className="label-micro text-[var(--ink-secondary)] mb-2">{label}</p>
                  <p className="data-numerical" style={{ color: ACCENT }}>%K: {k?.toFixed(2)}</p>
                  <p className="data-numerical" style={{ color: WARNING }}>%D: {d?.toFixed(2)}</p>
                  <p className="label-micro" style={{ color: k < 20 ? SUCCESS : k > 80 ? ERROR : INK_SECONDARY }}>{signal}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Line type="monotone" dataKey="k" stroke={ACCENT} strokeWidth={1.5} dot={false} name="%K" />
        <Line type="monotone" dataKey="d" stroke={WARNING} strokeWidth={1} dot={false} name="%D" strokeDasharray="3 3" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// Bollinger Bands Chart
interface BollingerChartProps {
  data: { date: string; close: number; upper: number; middle: number; lower: number }[];
}

export function BollingerChart({ data }: BollingerChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="0" stroke={BORDER_ELEMENT} />
        <XAxis 
          dataKey="date" 
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
          angle={-45}
          textAnchor="end"
          interval={2}
        />
        <YAxis 
          domain={['auto', 'auto']}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
        />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const item = payload[0]?.payload;
              return (
                <div className="bg-[var(--surface-card)] border border-[var(--border-grid)] p-3">
                  <p className="label-micro text-[var(--ink-secondary)] mb-2">{label}</p>
                  <p className="data-numerical" style={{ color: ERROR }}>Upper: ${item?.upper?.toLocaleString()}</p>
                  <p className="data-numerical" style={{ color: INK_SECONDARY }}>Middle: ${item?.middle?.toLocaleString()}</p>
                  <p className="data-numerical" style={{ color: SUCCESS }}>Lower: ${item?.lower?.toLocaleString()}</p>
                  <p className="data-numerical" style={{ color: ACCENT }}>Close: ${item?.close?.toLocaleString()}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Area type="monotone" dataKey="upper" stroke="none" fill="url(#bbFill)" />
        <Area type="monotone" dataKey="lower" stroke="none" fill="#fff" />
        <Line type="monotone" dataKey="upper" stroke={ERROR} strokeWidth={1} dot={false} strokeDasharray="3 3" />
        <Line type="monotone" dataKey="middle" stroke={INK_TERTIARY} strokeWidth={1} dot={false} />
        <Line type="monotone" dataKey="lower" stroke={SUCCESS} strokeWidth={1} dot={false} strokeDasharray="3 3" />
        <Line type="monotone" dataKey="close" stroke={ACCENT} strokeWidth={1.5} dot={false} />
        <defs>
          <linearGradient id="bbFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.05}/>
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0.05}/>
          </linearGradient>
        </defs>
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// Funding Rate Comparison Chart
interface FundingCompareChartProps {
  data: { date: string; binance: number; bybit: number }[];
}

export function FundingCompareChart({ data }: FundingCompareChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="0" stroke={BORDER_ELEMENT} />
        <XAxis 
          dataKey="date" 
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
          angle={-45}
          textAnchor="end"
          interval={3}
        />
        <YAxis 
          tickFormatter={(v) => `${(v * 100).toFixed(3)}%`}
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
        />
        <ReferenceLine y={0} stroke={INK_TERTIARY} strokeWidth={1} />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const binance = payload.find(p => p.dataKey === 'binance')?.value as number;
              const bybit = payload.find(p => p.dataKey === 'bybit')?.value as number;
              return (
                <div className="bg-[var(--surface-card)] border border-[var(--border-grid)] p-3">
                  <p className="label-micro text-[var(--ink-secondary)] mb-2">{label}</p>
                  <p className="data-numerical" style={{ color: ACCENT }}>Binance: {(binance * 100).toFixed(4)}%</p>
                  <p className="data-numerical" style={{ color: WARNING }}>Bybit: {(bybit * 100).toFixed(4)}%</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="binance" fill={ACCENT} stroke={ACCENT} strokeWidth={1} opacity={0.7} />
        <Line type="monotone" dataKey="bybit" stroke={WARNING} strokeWidth={1.5} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// Open Interest Chart
interface OpenInterestChartProps {
  data: { date: string; binance: number; bybit: number }[];
}

export function OpenInterestChart({ data }: OpenInterestChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="0" stroke={BORDER_ELEMENT} />
        <XAxis 
          dataKey="date" 
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
          angle={-45}
          textAnchor="end"
          interval={3}
        />
        <YAxis 
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
        />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const binance = payload.find(p => p.dataKey === 'binance')?.value as number;
              const bybit = payload.find(p => p.dataKey === 'bybit')?.value as number;
              return (
                <div className="bg-[var(--surface-card)] border border-[var(--border-grid)] p-3">
                  <p className="label-micro text-[var(--ink-secondary)] mb-2">{label}</p>
                  <p className="data-numerical" style={{ color: ACCENT }}>Binance: {binance?.toLocaleString()} BTC</p>
                  <p className="data-numerical" style={{ color: WARNING }}>Bybit: {bybit?.toLocaleString()} BTC</p>
                  <p className="data-numerical text-[var(--ink-secondary)]">Total: {(binance + bybit)?.toLocaleString()} BTC</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Area type="monotone" dataKey="binance" stackId="1" stroke={ACCENT} fill="url(#oiBinance)" strokeWidth={1} />
        <Area type="monotone" dataKey="bybit" stackId="1" stroke={WARNING} fill="url(#oiBybit)" strokeWidth={1} />
        <defs>
          <linearGradient id="oiBinance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={ACCENT} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={ACCENT} stopOpacity={0.05}/>
          </linearGradient>
          <linearGradient id="oiBybit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={WARNING} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={WARNING} stopOpacity={0.05}/>
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Token Rating Radar-style Bar Chart
interface TokenRatingChartProps {
  data: { metric: string; value: number; max: number }[];
}

export function TokenRatingChart({ data }: TokenRatingChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
        <CartesianGrid strokeDasharray="0" stroke={BORDER_ELEMENT} horizontal={false} vertical={true} />
        <XAxis 
          type="number"
          domain={[0, 10]}
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
          ticks={[0, 2, 4, 6, 8, 10]}
        />
        <YAxis 
          type="category"
          dataKey="metric" 
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: INK_SECONDARY }}
          axisLine={false}
          tickLine={false}
          width={95}
        />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const value = payload[0]?.value as number;
              const assessment = value >= 7 ? 'Strong' : value >= 4 ? 'Neutral' : 'Weak';
              const color = value >= 7 ? SUCCESS : value >= 4 ? WARNING : ERROR;
              return (
                <div className="bg-[var(--surface-card)] border border-[var(--border-grid)] p-3">
                  <p className="label-micro text-[var(--ink-secondary)] mb-2">{label}</p>
                  <p className="data-numerical" style={{ color }}>{value}/10 - {assessment}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="value" barSize={16}>
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.value >= 7 ? SUCCESS : entry.value >= 4 ? WARNING : ERROR}
              stroke={entry.value >= 7 ? SUCCESS : entry.value >= 4 ? WARNING : ERROR}
              strokeWidth={1}
              opacity={0.7}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ATR Chart
interface ATRChartProps {
  data: { date: string; atr: number }[];
}

export function ATRChart({ data }: ATRChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="0" stroke={BORDER_ELEMENT} />
        <XAxis 
          dataKey="date" 
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
          angle={-45}
          textAnchor="end"
          interval={2}
        />
        <YAxis 
          tickFormatter={(v) => `$${(v / 1000).toFixed(1)}K`}
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
        />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const atr = payload[0]?.value as number;
              return (
                <div className="bg-[var(--surface-card)] border border-[var(--border-grid)] p-3">
                  <p className="label-micro text-[var(--ink-secondary)] mb-2">{label}</p>
                  <p className="data-numerical" style={{ color: ACCENT }}>ATR: ${atr?.toLocaleString()}</p>
                  <p className="label-micro text-[var(--ink-tertiary)]">Daily Range: ±${(atr / 2)?.toLocaleString()}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Area 
          type="monotone" 
          dataKey="atr" 
          stroke={ACCENT}
          strokeWidth={1.5}
          fill="url(#atrGradient)"
        />
        <defs>
          <linearGradient id="atrGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={ACCENT} stopOpacity={0.2}/>
            <stop offset="95%" stopColor={ACCENT} stopOpacity={0}/>
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  );
}

// OBV Chart
interface OBVChartProps {
  data: { date: string; obv: number }[];
}

export function OBVChart({ data }: OBVChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="0" stroke={BORDER_ELEMENT} />
        <XAxis 
          dataKey="date" 
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
          angle={-45}
          textAnchor="end"
          interval={2}
        />
        <YAxis 
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
        />
        <ReferenceLine y={0} stroke={INK_TERTIARY} strokeWidth={1} />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const obv = payload[0]?.value as number;
              return (
                <div className="bg-[var(--surface-card)] border border-[var(--border-grid)] p-3">
                  <p className="label-micro text-[var(--ink-secondary)] mb-2">{label}</p>
                  <p className="data-numerical" style={{ color: obv >= 0 ? SUCCESS : ERROR }}>
                    OBV: {obv?.toLocaleString()}
                  </p>
                  <p className="label-micro" style={{ color: obv >= 0 ? SUCCESS : ERROR }}>
                    {obv >= 0 ? 'Accumulation' : 'Distribution'}
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Area 
          type="monotone" 
          dataKey="obv" 
          stroke={ERROR}
          strokeWidth={1.5}
          fill="url(#obvGradient)"
        />
        <defs>
          <linearGradient id="obvGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={ERROR} stopOpacity={0.2}/>
            <stop offset="95%" stopColor={ERROR} stopOpacity={0}/>
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Token Rating History Chart
interface RatingHistoryChartProps {
  data: { date: string; rating: number }[];
}

export function RatingHistoryChart({ data }: RatingHistoryChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="0" stroke={BORDER_ELEMENT} />
        <XAxis 
          dataKey="date" 
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
          angle={-45}
          textAnchor="end"
          interval={3}
        />
        <YAxis 
          domain={[0, 50]}
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: INK_SECONDARY }}
          axisLine={{ stroke: BORDER_ELEMENT }}
          tickLine={{ stroke: BORDER_ELEMENT }}
        />
        <ReferenceLine y={40} stroke={SUCCESS} strokeDasharray="3 3" label={{ value: 'Strong', fill: SUCCESS, fontSize: 10 }} />
        <ReferenceLine y={25} stroke={WARNING} strokeDasharray="3 3" label={{ value: 'Neutral', fill: WARNING, fontSize: 10 }} />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const rating = payload[0]?.value as number;
              const assessment = rating >= 40 ? 'Strong' : rating >= 25 ? 'Neutral' : 'Weak';
              const color = rating >= 40 ? SUCCESS : rating >= 25 ? WARNING : ERROR;
              return (
                <div className="bg-[var(--surface-card)] border border-[var(--border-grid)] p-3">
                  <p className="label-micro text-[var(--ink-secondary)] mb-2">{label}</p>
                  <p className="data-numerical" style={{ color }}>Rating: {rating?.toFixed(1)}/100</p>
                  <p className="label-micro" style={{ color }}>{assessment}</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Area 
          type="monotone" 
          dataKey="rating" 
          stroke={ACCENT}
          strokeWidth={1.5}
          fill="url(#ratingGradient)"
        />
        <defs>
          <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={ACCENT} stopOpacity={0.2}/>
            <stop offset="95%" stopColor={ACCENT} stopOpacity={0}/>
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Keep legacy exports for backwards compatibility
export { CustomTooltip };
export const TVLBarChart = ({ data }: { data: { name: string; value: number }[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
      <CartesianGrid strokeDasharray="0" stroke={BORDER_ELEMENT} horizontal={true} vertical={false} />
      <XAxis type="number" tickFormatter={(v) => `$${(v / 1e9).toFixed(0)}B`} tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: INK_SECONDARY }} />
      <YAxis type="category" dataKey="name" tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: INK_SECONDARY }} width={55} />
      <Bar dataKey="value" fill={ACCENT} stroke={ACCENT} strokeWidth={1} opacity={0.7} />
    </BarChart>
  </ResponsiveContainer>
);
export const DEXVolumeChart = TVLBarChart;
export const MarketSharePie = ({ data }: { data: { name: string; value: number }[] }) => null;
export const FundingRateChart = ({ data }: { data: { asset: string; rate: number; price: number }[] }) => null;
export const YieldChart = ({ data }: { data: { pool: string; tvl: number; apy: number }[] }) => null;
export const StablecoinChart = ({ data }: { data: { name: string; marketCap: number; change: number }[] }) => null;
export const OptionsVolumeChart = ({ data }: { data: { period: string; volume: number; change: number }[] }) => null;
export const ProtocolFeesChart = ({ data }: { data: { protocol: string; fees24h: number; fees30d: number }[] }) => null;
