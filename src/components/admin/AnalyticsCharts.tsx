'use client';

import React, { useState } from 'react';

interface TimeSeriesPoint {
  date: string;
  label: string;
  revenue: number;
  formatted_revenue: string;
  orders: number;
}

interface TimeSeriesAreaChartProps {
  data: TimeSeriesPoint[];
  height?: number;
}

export function TimeSeriesAreaChart({ data, height = 240 }: TimeSeriesAreaChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl"
        style={{ height }}
      >
        No sales data available for this period.
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 100000);

  const paddingX = 40;
  const paddingY = 30;
  const width = 800; // viewBox width
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * chartWidth;
    const y = paddingY + chartHeight - (d.revenue / maxRevenue) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    // Simple smooth curve
    const prev = points[i - 1];
    const cx1 = prev.x + (p.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (p.x - prev.x) / 2;
    const cy2 = p.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingY + chartHeight} L ${points[0].x} ${paddingY + chartHeight} Z`;

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        style={{ maxHeight: height }}
      >
        <defs>
          <linearGradient id="roseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = paddingY + chartHeight * (1 - ratio);
          const val = maxRevenue * ratio;
          return (
            <g key={ratio}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="currentColor"
                className="text-zinc-100 dark:text-zinc-800"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingX - 8}
                y={y + 3}
                textAnchor="end"
                className="text-[9px] fill-zinc-400 font-mono"
              >
                {val >= 1000000
                  ? `${(val / 1000000).toFixed(1)}M`
                  : val >= 1000
                  ? `${(val / 1000).toFixed(0)}k`
                  : '0'}
              </text>
            </g>
          );
        })}

        {/* Filled Area */}
        <path d={areaD} fill="url(#roseGradient)" />

        {/* Line Curve */}
        <path
          d={pathD}
          fill="none"
          stroke="#f43f5e"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points & hover triggers */}
        {points.map((p, i) => (
          <g key={i} className="cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === i ? 5 : 3}
              className={`${
                hoveredIdx === i ? 'fill-rose-600 stroke-white' : 'fill-rose-500'
              } transition-all duration-150`}
              strokeWidth={hoveredIdx === i ? 2 : 0}
            />
            {/* Invisible larger hover zone */}
            <rect
              x={p.x - chartWidth / (data.length * 2)}
              y={0}
              width={chartWidth / Math.max(data.length, 1)}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          </g>
        ))}

        {/* Bottom Date labels */}
        {points.map((p, i) => {
          // Show only every Nth label to prevent clutter on long periods
          const step = Math.ceil(points.length / 7);
          if (i % step !== 0 && i !== points.length - 1) return null;

          return (
            <text
              key={i}
              x={p.x}
              y={height - 6}
              textAnchor="middle"
              className="text-[9px] fill-zinc-400 font-medium"
            >
              {p.label}
            </text>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredIdx !== null && points[hoveredIdx] && (
        <div
          className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full px-3 py-2 rounded-xl bg-zinc-900 text-white text-xs shadow-xl border border-zinc-700 backdrop-blur-md"
          style={{
            left: `${(points[hoveredIdx].x / width) * 100}%`,
            top: `${(points[hoveredIdx].y / height) * 100}%`,
            marginTop: '-12px',
          }}
        >
          <div className="font-medium text-zinc-400 text-[10px] mb-0.5">
            {points[hoveredIdx].date} ({points[hoveredIdx].label})
          </div>
          <div className="font-semibold text-rose-400">
            {points[hoveredIdx].formatted_revenue}
          </div>
          <div className="text-[11px] text-zinc-300">
            {points[hoveredIdx].orders} {points[hoveredIdx].orders === 1 ? 'order' : 'orders'}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatusItem {
  status: string;
  count: number;
  percentage: number;
  total_amount?: number;
  formatted_amount?: string;
}

export function StatusDistributionCards({ items }: { items: StatusItem[] }) {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
      case 'COMPLETED':
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'PROCESSING':
      case 'SHIPPED':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      case 'PENDING_PAYMENT':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'CANCELLED':
      case 'EXPIRED':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item) => (
        <div
          key={item.status}
          className={`p-3.5 rounded-2xl border transition-all ${getStatusColor(item.status)}`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
            {item.status.replace('_', ' ')}
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-serif text-zinc-900 dark:text-zinc-100">
              {item.count}
            </span>
            <span className="text-[11px] font-medium opacity-75">{item.percentage}%</span>
          </div>
          {item.formatted_amount && (
            <div className="text-[10px] opacity-70 mt-1 truncate">{item.formatted_amount}</div>
          )}
        </div>
      ))}
    </div>
  );
}

interface BreakdownBarItem {
  label: string;
  count: number;
  percentage: number;
  formatted_amount?: string;
}

export function HorizontalBreakdownList({
  items,
  title,
  emptyMessage = 'No data available',
}: {
  items: BreakdownBarItem[];
  title: string;
  emptyMessage?: string;
}) {
  if (!items || items.length === 0) {
    return (
      <div className="p-6 rounded-3xl bg-stone-50 dark:bg-zinc-800/40 border border-rose-100 dark:border-zinc-800 text-xs text-zinc-400 text-center">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-stone-50 dark:bg-zinc-800/40 border border-rose-100 dark:border-zinc-800 space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">{title}</h4>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.label}</span>
              <div className="flex items-center gap-2">
                {item.formatted_amount && (
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                    {item.formatted_amount}
                  </span>
                )}
                <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-zinc-700/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-rose-500 to-pink-500 transition-all duration-500"
                style={{ width: `${Math.min(item.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
