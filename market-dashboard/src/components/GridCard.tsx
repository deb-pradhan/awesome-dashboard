'use client';

import { ReactNode } from 'react';

interface GridCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function GridCard({ title, icon, children, className = '', noPadding = false }: GridCardProps) {
  return (
    <div className={`grid-card ${className}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-element)]">
        <span className="label-micro text-[var(--ink-secondary)]">{title}</span>
        {icon && (
          <span className="text-[var(--color-accent-main)]">
            {icon}
          </span>
        )}
      </div>
      <div className={noPadding ? '' : 'p-5'}>
        {children}
      </div>
    </div>
  );
}

export function MetricCard({ 
  label, 
  value, 
  change, 
  trend 
}: { 
  label: string; 
  value: string; 
  change?: string; 
  trend?: 'up' | 'down' | 'neutral' 
}) {
  const trendClass = trend === 'up' 
    ? 'metric-change-positive' 
    : trend === 'down' 
      ? 'metric-change-negative' 
      : 'metric-change-neutral';

  return (
    <div className="grid-card p-5">
      <span className="label-micro text-[var(--ink-secondary)] block mb-3">{label}</span>
      <span className="metric-value block mb-2">{value}</span>
      {change && (
        <span className={`data-numerical ${trendClass}`}>{change}</span>
      )}
    </div>
  );
}

export function DataTable({ 
  headers, 
  rows 
}: { 
  headers: string[]; 
  rows: (string | ReactNode)[][] 
}) {
  return (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            {headers.map((header, i) => (
              <th key={i}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Badge({ 
  type, 
  children 
}: { 
  type: 'success' | 'warning' | 'error' | 'neutral'; 
  children: ReactNode 
}) {
  return (
    <span className={`badge badge-${type}`}>
      {children}
    </span>
  );
}

// Icons
export const ArrowUpRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M7 17L17 7M17 7H7M17 7V17" />
  </svg>
);

export const ArrowDownRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M7 7L17 17M17 17H7M17 17V7" />
  </svg>
);

export const TrendingUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 7L13.5 15.5L8.5 10.5L2 17" />
    <path d="M16 7H22V13" />
  </svg>
);

export const BarChart3 = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 3V21H21" />
    <path d="M7 16V12" />
    <path d="M11 16V8" />
    <path d="M15 16V14" />
    <path d="M19 16V10" />
  </svg>
);

export const PieChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2V12H22Z" />
  </svg>
);

export const Activity = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 12H18L15 21L9 3L6 12H2" />
  </svg>
);

export const Layers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2L2 7L12 12L22 7L12 2Z" />
    <path d="M2 17L12 22L22 17" />
    <path d="M2 12L12 17L22 12" />
  </svg>
);

export const Shield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" />
  </svg>
);

export const Zap = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
  </svg>
);

export const DollarSign = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2V22" />
    <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" />
  </svg>
);

export const Database = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12C21 13.66 17 15 12 15C7 15 3 13.66 3 12" />
    <path d="M3 5V19C3 20.66 7 22 12 22C17 22 21 20.66 21 19V5" />
  </svg>
);

export const AlertTriangle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.54 21H20.46A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" />
    <path d="M12 9V13" />
    <path d="M12 17H12.01" />
  </svg>
);

