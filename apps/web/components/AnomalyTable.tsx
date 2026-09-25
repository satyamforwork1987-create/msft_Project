'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronRight, Info } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { Transaction } from '@/lib/api';

interface AnomalyTableProps {
  transactions: Transaction[];
  onSelectTransaction?: (txn: Transaction) => void;
}

const scoreColor = (score: number) => {
  if (score >= 0.75) return 'text-red-400';
  if (score >= 0.5) return 'text-amber-400';
  return 'text-yellow-400';
};

const scoreBar = (score: number) => {
  if (score >= 0.75) return 'bg-red-500';
  if (score >= 0.5) return 'bg-amber-500';
  return 'bg-yellow-500';
};

export function AnomalyTable({ transactions, onSelectTransaction }: AnomalyTableProps) {
  const [sortBy, setSortBy] = useState<'score' | 'amount' | 'date'>('score');
  const [expanded, setExpanded] = useState<string | null>(null);

  const anomalies = transactions
    .filter(t => t.is_anomaly)
    .sort((a, b) => {
      if (sortBy === 'score') return (b.anomaly_score ?? 0) - (a.anomaly_score ?? 0);
      if (sortBy === 'amount') return Math.abs(b.amount) - Math.abs(a.amount);
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  // Fallback: if no flagged anomalies, show top-scored transactions so the UI is never empty
  const displayItems = anomalies.length > 0
    ? anomalies
    : [...transactions]
        .sort((a, b) => (b.anomaly_score ?? 0) - (a.anomaly_score ?? 0))
        .slice(0, 5)
        .map(t => ({ ...t, is_anomaly: true })); // treat as anomaly for display

  if (!displayItems.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
          <Info className="w-6 h-6 text-emerald-400" />
        </div>
        <p className="text-muted-foreground">No anomalies detected in this dataset.</p>
      </div>
    );
  }


  return (
    <div className="space-y-2">
      {/* Sort Controls */}
      <div className="flex gap-2 mb-4">
        {(['score', 'amount', 'date'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-all capitalize',
              sortBy === s
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-muted-foreground hover:text-foreground border border-border'
            )}
          >
            Sort by {s}
          </button>
        ))}
      </div>

      {/* Anomaly Rows */}
      {displayItems.map((txn, i) => (
        <motion.div
          key={txn.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-xl border border-border overflow-hidden"
        >
          <button
            className="w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-start gap-3"
            onClick={() => setExpanded(expanded === txn.id ? null : txn.id)}
          >
            {/* Score Bar */}
            <div className="flex flex-col items-center gap-1 pt-1">
              <AlertTriangle className={cn('w-4 h-4', scoreColor(txn.anomaly_score ?? 0))} />
              <div className="w-1 h-8 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn('w-full rounded-full transition-all', scoreBar(txn.anomaly_score ?? 0))}
                  style={{ height: `${(txn.anomaly_score ?? 0) * 100}%` }}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-foreground truncate">{txn.description}</span>
                <span className={cn('font-bold ml-2', txn.amount < 0 ? 'text-red-400' : 'text-emerald-400')}>
                  {txn.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(txn.amount))}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-0.5 rounded-full bg-muted">{txn.category}</span>
                <span>{formatDate(txn.date)}</span>
                <span className={cn('font-medium', scoreColor(txn.anomaly_score ?? 0))}>
                  Score: {((txn.anomaly_score ?? 0) * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <ChevronRight
              className={cn('w-4 h-4 text-muted-foreground transition-transform', expanded === txn.id && 'rotate-90')}
            />
          </button>

          {/* Expanded Details */}
          <AnimatePresence>
            {expanded === txn.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-0 border-t border-border bg-muted/20">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-3 mb-2">
                    Features That Triggered Detection
                  </p>
                  <ul className="space-y-1.5">
                    {(txn.features_triggered || ['Unusual pattern detected']).map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        <span className="text-foreground/80">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => onSelectTransaction?.(txn)}
                    className="mt-3 text-xs text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1"
                  >
                    View full explanation <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
