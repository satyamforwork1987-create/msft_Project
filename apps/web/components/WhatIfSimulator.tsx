'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sliders, Play, RotateCcw } from 'lucide-react';
import { CashFlowChart } from './CashFlowChart';
import { api, type WhatIfResult, type ForecastPoint } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';

const PRESET_SCENARIOS = [
  { label: 'Hire 2 employees', description: 'Add 2 employees at $4,000/month', monthly_delta: -8000 },
  { label: 'Cut marketing 20%', description: 'Reduce marketing spend by 20%', monthly_delta: 800 },
  { label: 'Delay vendor payment', description: 'Defer vendor payments 30 days', monthly_delta: 5000 },
  { label: 'New $5k/mo client', description: 'Sign new retainer client', monthly_delta: 5000 },
  { label: 'Upgrade office', description: 'Move to larger office (+$2k/mo)', monthly_delta: -2000 },
];

interface WhatIfSimulatorProps {
  baselineForecast: ForecastPoint[];
  transactions: unknown[];
  onDecisionSelected?: (decision: string) => void;
}

export function WhatIfSimulator({ baselineForecast, transactions, onDecisionSelected }: WhatIfSimulatorProps) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [customDelta, setCustomDelta] = useState<string>('');
  const [customDesc, setCustomDesc] = useState('');
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getScenario = () => {
    if (selectedPreset !== null) return PRESET_SCENARIOS[selectedPreset];
    const delta = parseFloat(customDelta);
    if (!isNaN(delta) && customDesc) {
      return { label: customDesc, description: customDesc, monthly_delta: delta };
    }
    return null;
  };

  const handleRun = async () => {
    const scenario = getScenario();
    if (!scenario) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.runWhatIf(
        { monthly_delta: scenario.monthly_delta, description: scenario.description },
        transactions as any
      );
      setResult(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSelectedPreset(null);
    setCustomDelta('');
    setCustomDesc('');
    setError(null);
  };

  const runwayDiff = result ? result.adjusted_runway - result.baseline_runway : 0;
  const scenario = getScenario();

  return (
    <div className="space-y-5">
      {/* Preset Scenarios */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Scenarios
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRESET_SCENARIOS.map((preset, i) => (
            <button
              key={i}
              onClick={() => { setSelectedPreset(i === selectedPreset ? null : i); setResult(null); }}
              className={cn(
                'text-left px-3 py-2 rounded-lg border text-xs transition-all',
                selectedPreset === i
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
              )}
            >
              <span className="font-medium block">{preset.label}</span>
              <span className="text-[10px] opacity-70">
                {preset.monthly_delta > 0 ? '+' : ''}{formatCurrency(preset.monthly_delta)}/mo
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Scenario */}
      <div className="border border-border rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5" /> Custom Scenario
        </p>
        <input
          type="text"
          placeholder="Describe your decision..."
          value={customDesc}
          onChange={e => { setCustomDesc(e.target.value); setSelectedPreset(null); setResult(null); }}
          className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="flex gap-2 items-center">
          <span className="text-muted-foreground text-sm">Monthly impact:</span>
          <input
            type="number"
            placeholder="-8000"
            value={customDelta}
            onChange={e => { setCustomDelta(e.target.value); setSelectedPreset(null); setResult(null); }}
            className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <span className="text-muted-foreground text-sm">/mo</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleRun}
          disabled={!getScenario() || loading}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all',
            getScenario() && !loading
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              Running...
            </span>
          ) : (
            <>
              <Play className="w-4 h-4" /> Run Simulation
            </>
          )}
        </button>
        {result && (
          <button onClick={handleReset} className="px-3 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Impact Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Baseline Runway</p>
              <p className="text-xl font-bold text-foreground">{result.baseline_runway}mo</p>
            </div>
            <div className={cn(
              'rounded-xl border p-3 text-center',
              runwayDiff < 0 ? 'border-red-500/30 bg-red-500/5' : 'border-emerald-500/30 bg-emerald-500/5'
            )}>
              <p className="text-xs text-muted-foreground mb-1">New Runway</p>
              <p className={cn('text-xl font-bold', runwayDiff < 0 ? 'text-red-400' : 'text-emerald-400')}>
                {result.adjusted_runway}mo
              </p>
            </div>
            <div className={cn(
              'rounded-xl border p-3 text-center',
              result.impact_30d < 0 ? 'border-red-500/30' : 'border-emerald-500/30'
            )}>
              <p className="text-xs text-muted-foreground mb-1">30-Day Impact</p>
              <p className={cn('text-xl font-bold', result.impact_30d < 0 ? 'text-red-400' : 'text-emerald-400')}>
                {result.impact_30d > 0 ? '+' : ''}{formatCurrency(result.impact_30d)}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64">
            <CashFlowChart
              forecast={baselineForecast}
              adjustedForecast={result.forecast}
              showComparison={true}
            />
          </div>

          {/* CTA to Boardroom */}
          {onDecisionSelected && scenario && (
            <button
              onClick={() => onDecisionSelected(scenario.description)}
              className="w-full py-2.5 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <span>🏛️</span>
              Debate this in AI Boardroom →
            </button>
          )}
        </motion.div>
      )}

      {error && (
        <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
