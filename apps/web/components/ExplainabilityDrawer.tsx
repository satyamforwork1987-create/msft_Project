'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Calendar, Tag } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import type { Transaction, Recommendation } from '@/lib/api';

type DrawerItem =
  | { type: 'anomaly'; data: Transaction }
  | { type: 'recommendation'; data: Recommendation; relatedTransactions: Transaction[] };

interface ExplainabilityDrawerProps {
  item: DrawerItem | null;
  onClose: () => void;
  allTransactions?: Transaction[];
}

export function ExplainabilityDrawer({ item, onClose, allTransactions = [] }: ExplainabilityDrawerProps) {
  const isOpen = !!item;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 40 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg z-50 flex flex-col bg-card border-l border-border shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="font-bold text-lg text-foreground">
                  {item?.type === 'anomaly' ? '🔍 Anomaly Explanation' : '💡 Recommendation Detail'}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Powered by IsolationForest + rule-based analysis
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {item?.type === 'anomaly' && <AnomalyDetail transaction={item.data} />}
              {item?.type === 'recommendation' && (
                <RecommendationDetail
                  recommendation={item.data}
                  relatedTransactions={item.relatedTransactions}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function AnomalyDetail({ transaction: txn }: { transaction: Transaction }) {
  return (
    <div className="space-y-4">
      {/* Transaction Summary */}
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-foreground">{txn.description}</h4>
            <p className="text-sm text-muted-foreground mt-0.5">{formatDate(txn.date)}</p>
          </div>
          <span className={cn('text-xl font-bold', txn.amount < 0 ? 'text-red-400' : 'text-emerald-400')}>
            {txn.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(txn.amount))}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Tag className="w-3.5 h-3.5" /> {txn.category}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" /> {txn.date}
          </div>
        </div>
      </div>

      {/* Anomaly Score */}
      <div className="rounded-xl border border-border p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Anomaly Score
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(txn.anomaly_score ?? 0) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                (txn.anomaly_score ?? 0) >= 0.75 ? 'bg-red-500' :
                (txn.anomaly_score ?? 0) >= 0.5 ? 'bg-amber-500' : 'bg-yellow-500'
              )}
            />
          </div>
          <span className="text-lg font-bold text-foreground">
            {((txn.anomaly_score ?? 0) * 100).toFixed(0)}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {(txn.anomaly_score ?? 0) >= 0.75
            ? 'High anomaly confidence — this transaction significantly deviates from expected patterns.'
            : (txn.anomaly_score ?? 0) >= 0.5
            ? 'Moderate anomaly — worth reviewing but may be a one-off legitimate expense.'
            : 'Low-moderate anomaly — flagged due to unusual combination of features.'}
        </p>
      </div>

      {/* Triggered Features */}
      <div className="rounded-xl border border-border p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Why IsolationForest Flagged This
        </p>
        <ul className="space-y-2">
          {(txn.features_triggered?.length ? txn.features_triggered : ['Unusual pattern in combined features']).map((f, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-2.5 text-sm"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <span className="text-foreground/80">{f}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* ML Model Info */}
      <div className="rounded-xl border border-border p-4 bg-muted/20">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Model Details</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div><span className="text-foreground">Algorithm</span><br />IsolationForest</div>
          <div><span className="text-foreground">Estimators</span><br />200 trees</div>
          <div><span className="text-foreground">Features</span><br />6 engineered</div>
          <div><span className="text-foreground">Contamination</span><br />8% expected</div>
        </div>
      </div>
    </div>
  );
}

function RecommendationDetail({
  recommendation: rec,
  relatedTransactions,
}: {
  recommendation: Recommendation;
  relatedTransactions: Transaction[];
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border p-4">
        <h4 className="font-semibold text-foreground mb-2">{rec.title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{rec.detail}</p>
      </div>

      <div className="flex gap-2">
        <span className="px-2.5 py-1 rounded-full text-xs border border-border text-muted-foreground capitalize">
          {rec.priority} priority
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs border border-border text-muted-foreground">
          {rec.category}
        </span>
      </div>

      {relatedTransactions.length > 0 && (
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Related Transactions ({relatedTransactions.length})
          </p>
          <div className="space-y-2">
            {relatedTransactions.map(txn => (
              <div key={txn.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm">
                <div>
                  <p className="font-medium text-foreground">{txn.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(txn.date)}</p>
                </div>
                <span className={cn('font-semibold', txn.amount < 0 ? 'text-red-400' : 'text-emerald-400')}>
                  {txn.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(txn.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border p-4 bg-muted/20">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Analysis Method</p>
        <p className="text-xs text-muted-foreground">
          This recommendation is generated using rule-based analysis on your transaction data — no AI API required.
          Rules are applied to category spend patterns, revenue concentration, and cash flow trends.
        </p>
      </div>
    </div>
  );
}
