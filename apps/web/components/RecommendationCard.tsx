'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, PieChart, Server, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Recommendation } from '@/lib/api';

import React from 'react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  alert: AlertTriangle,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'pie-chart': PieChart,
  server: Server,
};

const PRIORITY_CONFIG = {
  high: {
    badge: 'bg-red-500/15 text-red-400 border-red-500/25',
    bar: 'bg-red-500',
    icon: 'bg-red-500/15',
    border: 'border-red-500/20 hover:border-red-500/40',
  },
  medium: {
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    bar: 'bg-amber-500',
    icon: 'bg-amber-500/15',
    border: 'border-amber-500/20 hover:border-amber-500/40',
  },
  low: {
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    bar: 'bg-blue-500',
    icon: 'bg-blue-500/15',
    border: 'border-blue-500/20 hover:border-blue-500/40',
  },
};

interface RecommendationCardProps {
  recommendation: Recommendation;
  index?: number;
  onExplain?: (rec: Recommendation) => void;
}

export function RecommendationCard({ recommendation: rec, index = 0, onExplain }: RecommendationCardProps) {
  const config = PRIORITY_CONFIG[rec.priority];
  const Icon = ICON_MAP[rec.icon] || Info;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={cn(
        'relative rounded-xl border p-4 transition-all duration-300 cursor-pointer group',
        'bg-card hover:bg-muted/30',
        config.border
      )}
      onClick={() => onExplain?.(rec)}
    >
      {/* Priority accent bar */}
      <div className={cn('absolute left-0 top-0 w-1 h-full rounded-l-xl', config.bar)} />

      <div className="pl-2 flex items-start gap-3">
        {/* Icon */}
        <div className={cn('p-2 rounded-lg flex-shrink-0 mt-0.5', config.icon)}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4 className="font-semibold text-sm text-foreground leading-tight">{rec.title}</h4>
            <div className="flex gap-1.5 flex-shrink-0">
              <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium capitalize', config.badge)}>
                {rec.priority}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                {rec.category}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{rec.detail}</p>
          
          <div className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <span>View explanation</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
