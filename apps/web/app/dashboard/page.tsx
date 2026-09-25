'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  BarChart2, Sun, Moon, AlertTriangle, TrendingUp, TrendingDown, DollarSign,
  RefreshCw, Activity, Layers, Lightbulb
} from 'lucide-react';
import { api, type Transaction, type ForecastResult, type Recommendation } from '@/lib/api';
import { CashFlowChart } from '@/components/CashFlowChart';
import { AnomalyTable } from '@/components/AnomalyTable';
import { RecommendationCard } from '@/components/RecommendationCard';
import { WhatIfSimulator } from '@/components/WhatIfSimulator';
import { ExplainabilityDrawer } from '@/components/ExplainabilityDrawer';
import { formatCurrency, cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// Static recommendations (rule-based, always available)
const STATIC_RECS: Recommendation[] = [
  {
    id: 'rec-001', priority: 'high', title: 'Server replacement expense flagged as anomaly',
    detail: 'The $15,200 emergency server replacement in February was 8.4x your average monthly equipment spend. Consider a hardware maintenance reserve of $1,500/month.',
    category: 'Risk', icon: 'alert', relatedTransactionIds: ['t017'],
  },
  {
    id: 'rec-002', priority: 'high', title: 'Team offsite exceeded travel budget by 217%',
    detail: 'The $9,500 team offsite in May represents 217% of your $3,000 estimated quarterly travel budget. Setting a per-event cap of $5,000 would have saved $4,500.',
    category: 'Cost Control', icon: 'trending-down', relatedTransactionIds: ['t055'],
  },
  {
    id: 'rec-003', priority: 'medium', title: 'Revenue concentration risk: 62% from one client',
    detail: 'Apex Corp retainer ($18,500/month) represents 62% of your average monthly revenue. Loss of this contract would exhaust cash reserves in ~1.5 months.',
    category: 'Revenue', icon: 'pie-chart', relatedTransactionIds: ['t001', 't013', 't024', 't036', 't048', 't060'],
  },
  {
    id: 'rec-004', priority: 'medium', title: 'Positive trend: New clients added 3 months running',
    detail: 'You added Crest (Apr), Orbital AI (May), and NeuralStack (Jun). If this continues, monthly revenue could reach $35,000+ by Q4.',
    category: 'Growth', icon: 'trending-up', relatedTransactionIds: ['t037', 't049', 't062'],
  },
  {
    id: 'rec-005', priority: 'low', title: 'SaaS costs stable — review for consolidation opportunities',
    detail: 'AWS costs have been consistent at $890/month. Review your current tier ahead of the 3 new clients to prevent emergency capacity upgrades.',
    category: 'Operations', icon: 'server', relatedTransactionIds: ['t003', 't015', 't026'],
  },
];

type DrawerState =
  | { type: 'anomaly'; data: Transaction }
  | { type: 'recommendation'; data: Recommendation; relatedTransactions: Transaction[] }
  | null;

type Tab = 'overview' | 'anomalies' | 'whatif' | 'recommendations';

export default function DashboardPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [tab, setTab] = useState<Tab>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [anomalies, setAnomalies] = useState<Transaction[]>([]);
  const [forecast, setForecast] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerItem, setDrawerItem] = useState<DrawerState>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [txnRes, forecastRes] = await Promise.all([
        api.loadDemoData(),
        api.getDemoForecast(),
      ]);
      setTransactions(txnRes.transactions);
      setAnomalies(txnRes.anomalies || txnRes.transactions.filter(t => t.is_anomaly));
      setForecast(forecastRes);
    } catch {
      // Use fallback static data
      setTransactions([]);
      setAnomalies([]);
    } finally {
      setLoading(false);
    }
  };

  // Summary stats
  const totalRevenue = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const netCash = totalRevenue + totalExpenses;
  const anomalyCount = anomalies.filter(a => a.is_anomaly).length;

  const TABS: { id: Tab; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'anomalies', label: `Anomalies (${anomalyCount})`, icon: AlertTriangle },
    { id: 'whatif', label: 'What-If', icon: Layers },
    { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 bg-grid opacity-40 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <BarChart2 className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-bold gradient-text">FinSight AI</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <Link
              href="/boardroom"
              className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/30 text-sm font-medium hover:bg-primary/20 transition-colors flex items-center gap-1.5"
            >
              🏛️ AI Boardroom
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 relative z-10">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '+12.4%' },
            { label: 'Total Expenses', value: formatCurrency(Math.abs(totalExpenses)), icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10', trend: '-3.2%' },
            { label: 'Net Cash Flow', value: formatCurrency(netCash), icon: netCash >= 0 ? TrendingUp : TrendingDown, color: netCash >= 0 ? 'text-emerald-400' : 'text-red-400', bg: netCash >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10', trend: netCash >= 0 ? 'Positive' : 'Negative' },
            { label: 'Anomalies Found', value: String(anomalyCount), icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: `${transactions.length} transactions analyzed` },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-3 rounded bg-muted shimmer w-2/3" />
                    <div className="h-6 rounded bg-muted shimmer w-1/2" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', kpi.bg)}>
                        <Icon className={cn('w-3.5 h-3.5', kpi.color)} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{kpi.trend}</p>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted/40 p-1 rounded-xl border border-border w-fit">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  tab === t.id
                    ? 'bg-background text-foreground shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Forecast Chart */}
            <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-foreground">30-Day Cash Flow Forecast</h2>
                  {forecast && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Trend: <span className={cn('font-medium', forecast.trend === 'up' ? 'text-emerald-400' : forecast.trend === 'down' ? 'text-red-400' : 'text-muted-foreground')}>
                        {forecast.trend === 'up' ? '↑ Growing' : forecast.trend === 'down' ? '↓ Declining' : '→ Stable'}
                      </span>
                    </p>
                  )}
                </div>
                {forecast && (
                  <div className={cn('px-2.5 py-1 rounded-full text-xs font-medium border', 
                    forecast.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    forecast.trend === 'down' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                    'bg-muted text-muted-foreground border-border'
                  )}>
                    Prophet Model
                  </div>
                )}
              </div>
              {loading ? (
                <div className="h-72 rounded-xl bg-muted shimmer" />
              ) : forecast ? (
                <CashFlowChart forecast={forecast.forecast} />
              ) : (
                <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
                  Start API server to load live forecast
                </div>
              )}
              {forecast && (
                <p className="text-xs text-muted-foreground mt-3 border-t border-border pt-3">{forecast.summary}</p>
              )}
            </div>

            {/* Right column: top anomalies + link to boardroom */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-semibold text-foreground mb-4">Top Anomalies</h2>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-muted shimmer" />)}
                  </div>
                ) : (
                  <AnomalyTable
                    transactions={anomalies.length ? anomalies : transactions}
                    onSelectTransaction={t => setDrawerItem({ type: 'anomaly', data: t })}
                  />
                )}
              </div>

              {/* Quick AI Boardroom CTA */}
              <Link href="/boardroom">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="rounded-xl border border-primary/30 bg-primary/5 p-4 cursor-pointer hover:bg-primary/10 transition-all glow-primary"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🏛️</span>
                    <span className="font-semibold text-foreground">AI Boardroom</span>
                    <span className="ml-auto text-xs text-primary px-2 py-0.5 rounded-full bg-primary/15 border border-primary/30">NEW</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    3 AI agents debate your financial decisions live. Powered by Groq + Gemini.
                  </p>
                </motion.div>
              </Link>
            </div>
          </div>
        )}

        {tab === 'anomalies' && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-foreground mb-1">Anomaly Detection Results</h2>
            <p className="text-sm text-muted-foreground mb-5">
              IsolationForest detected {anomalyCount} anomalous transactions from {transactions.length} total. Click any row to see the detailed explanation.
            </p>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded-xl bg-muted shimmer" />)}
              </div>
            ) : (
              <AnomalyTable
                transactions={anomalies.length ? anomalies : transactions}
                onSelectTransaction={t => setDrawerItem({ type: 'anomaly', data: t })}
              />
            )}
          </div>
        )}

        {tab === 'whatif' && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold text-foreground mb-1">What-If Simulator</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Simulate any financial decision and see the impact on your 30-day cash forecast and runway.
            </p>
            {forecast ? (
              <WhatIfSimulator
                baselineForecast={forecast.forecast}
                transactions={transactions}
                onDecisionSelected={d => {
                  router.push(`/boardroom?decision=${encodeURIComponent(d)}`);
                }}
              />
            ) : (
              <div className="text-muted-foreground text-sm py-8 text-center">Start API server to use the simulator</div>
            )}
          </div>
        )}

        {tab === 'recommendations' && (
          <div className="space-y-3">
            <div className="mb-2">
              <h2 className="font-semibold text-foreground">AI-Generated Recommendations</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Rule-based analysis — always available, no API required. Click any card to see the reasoning.</p>
            </div>
            {STATIC_RECS.map((rec, i) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                index={i}
                onExplain={r => {
                  const related = transactions.filter(t => r.relatedTransactionIds.includes(t.id));
                  setDrawerItem({ type: 'recommendation', data: r, relatedTransactions: related });
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Explainability Drawer */}
      <ExplainabilityDrawer
        item={drawerItem}
        onClose={() => setDrawerItem(null)}
        allTransactions={transactions}
      />
    </div>
  );
}
