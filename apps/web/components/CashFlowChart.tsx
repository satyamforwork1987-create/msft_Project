'use client';

import { motion } from 'framer-motion';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis, ReferenceLine, Legend,
} from 'recharts';
import { formatShortDate, formatCurrency } from '@/lib/utils';
import type { ForecastPoint } from '@/lib/api';
import { useState } from 'react';

interface CashFlowChartProps {
  forecast: ForecastPoint[];
  historicalBalance?: number;
  adjustedForecast?: ForecastPoint[];
  showComparison?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-2xl text-sm min-w-[180px]">
      <p className="text-muted-foreground font-medium mb-2">{formatShortDate(label)}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex justify-between gap-4">
          <span className="text-muted-foreground capitalize">{entry.name.replace(/_/g, ' ')}</span>
          <span className="font-semibold" style={{ color: entry.color }}>
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function CashFlowChart({ forecast, adjustedForecast, showComparison }: CashFlowChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = forecast.map((point, i) => ({
    ...point,
    adjusted: adjustedForecast?.[i]?.predicted,
    date_label: point.date,
  }));

  // Find break-even zone
  const criticalIndex = data.findIndex(d => d.predicted < 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="adjustedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" vertical={false} />

          <XAxis
            dataKey="date_label"
            tickFormatter={formatShortDate}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval={4}
          />
          <YAxis
            tickFormatter={v => `$${Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={55}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Confidence band (upper) */}
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="url(#confidenceGradient)"
            fillOpacity={1}
            name="upper_bound"
            legendType="none"
          />

          {/* Confidence band (lower) */}
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="url(#confidenceGradient)"
            fillOpacity={1}
            name="lower_bound"
            legendType="none"
          />

          {/* Main forecast line */}
          <Area
            type="monotone"
            dataKey="predicted"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#forecastGradient)"
            fillOpacity={1}
            dot={false}
            activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
            name="Projected Cash"
          />

          {/* Adjusted forecast (what-if) */}
          {showComparison && adjustedForecast && (
            <Area
              type="monotone"
              dataKey="adjusted"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="6 3"
              fill="url(#adjustedGradient)"
              fillOpacity={1}
              dot={false}
              activeDot={{ r: 4, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
              name="After Scenario"
            />
          )}

          {/* Zero line */}
          <ReferenceLine y={0} stroke="rgba(239,68,68,0.4)" strokeDasharray="4 2" strokeWidth={1.5} />

          <Legend
            wrapperStyle={{ paddingTop: '16px', fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
